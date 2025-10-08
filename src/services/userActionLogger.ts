import { supabase } from '../lib/supabase';

interface BrowserInfo {
  userAgent: string;
  language: string;
  languages: string[];
  viewport: {
    width: number;
    height: number;
  };
  screen: {
    width: number;
    height: number;
  };
  timezone: string;
  cookieEnabled: boolean;
  doNotTrack: string | null;
}

interface DeviceInfo {
  platform: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
  browserVersion: string;
}

interface NetworkInfo {
  type: string;
  effectiveType: string;
  downlink: number | null;
  rtt: number | null;
  saveData: boolean;
}

interface LogData {
  action_type: string;
  action_data?: any;
  error_data?: any;
  cliente_id?: number;
  area_de_trabalho_id?: string;
  ponto_de_coleta_id?: string;
  tipo_medicao_id?: string;
  tipo_medicao_nome?: string;
  raw_value?: string;
  processed_value?: string;
  final_value?: string;
  is_critical_type?: boolean;
}

class UserActionLogger {
  private static instance: UserActionLogger;
  private isEnabled: boolean = true;
  private cachedIP: string | null = null;
  private ipFetchPromise: Promise<string> | null = null;
  private configCheckInterval: number | null = null;
  private failureCount: number = 0;
  private maxFailures: number = 5;
  private isCircuitBreakerOpen: boolean = false;
  private localQueue: LogData[] = [];

  private constructor() {
    this.checkConfig();
    this.startConfigPolling();
    this.getUserIP();
  }

  public static getInstance(): UserActionLogger {
    if (!UserActionLogger.instance) {
      UserActionLogger.instance = new UserActionLogger();
    }
    return UserActionLogger.instance;
  }

  private async checkConfig(): Promise<void> {
    try {
      const cachedConfig = localStorage.getItem('user_action_logging_config');
      if (cachedConfig) {
        const { is_enabled, timestamp } = JSON.parse(cachedConfig);
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          this.isEnabled = is_enabled;
          return;
        }
      }

      const { data, error } = await supabase
        .from('user_action_config')
        .select('is_enabled')
        .eq('id', 1)
        .maybeSingle();

      if (!error && data) {
        this.isEnabled = data.is_enabled;
        localStorage.setItem(
          'user_action_logging_config',
          JSON.stringify({
            is_enabled: data.is_enabled,
            timestamp: Date.now(),
          })
        );
      }
    } catch (error) {
      console.error('Error checking user action logging config:', error);
    }
  }

  private startConfigPolling(): void {
    this.configCheckInterval = window.setInterval(() => {
      this.checkConfig();
    }, 5 * 60 * 1000);
  }

  public stopConfigPolling(): void {
    if (this.configCheckInterval) {
      clearInterval(this.configCheckInterval);
      this.configCheckInterval = null;
    }
  }

  private async getUserIP(): Promise<string> {
    if (this.cachedIP) {
      return this.cachedIP;
    }

    if (this.ipFetchPromise) {
      return this.ipFetchPromise;
    }

    this.ipFetchPromise = (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch('https://api.ipify.org?format=json', {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          this.cachedIP = data.ip;
          return data.ip;
        }
      } catch (error) {
        console.warn('Failed to fetch IP address:', error);
      }

      return 'unknown';
    })();

    return this.ipFetchPromise;
  }

  private getBrowserInfo(): BrowserInfo {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: Array.from(navigator.languages || []),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: (navigator as any).doNotTrack || null,
    };
  }

  private getDeviceInfo(): DeviceInfo {
    const ua = navigator.userAgent;
    const platform = navigator.platform;

    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      deviceType = 'tablet';
    } else if (
      /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
        ua
      )
    ) {
      deviceType = 'mobile';
    }

    let os = 'Unknown';
    if (platform.includes('Win')) os = 'Windows';
    else if (platform.includes('Mac')) os = 'macOS';
    else if (platform.includes('Linux')) os = 'Linux';
    else if (/Android/.test(ua)) os = 'Android';
    else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS';

    let browser = 'Unknown';
    let browserVersion = '';
    if (ua.includes('Firefox/')) {
      browser = 'Firefox';
      browserVersion = ua.split('Firefox/')[1]?.split(' ')[0] || '';
    } else if (ua.includes('Edg/')) {
      browser = 'Edge';
      browserVersion = ua.split('Edg/')[1]?.split(' ')[0] || '';
    } else if (ua.includes('Chrome/')) {
      browser = 'Chrome';
      browserVersion = ua.split('Chrome/')[1]?.split(' ')[0] || '';
    } else if (ua.includes('Safari/')) {
      browser = 'Safari';
      browserVersion = ua.split('Version/')[1]?.split(' ')[0] || '';
    }

    return {
      platform,
      deviceType,
      os,
      browser,
      browserVersion,
    };
  }

  private getNetworkInfo(): NetworkInfo {
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (!connection) {
      return {
        type: 'unknown',
        effectiveType: 'unknown',
        downlink: null,
        rtt: null,
        saveData: false,
      };
    }

    return {
      type: connection.type || 'unknown',
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || null,
      rtt: connection.rtt || null,
      saveData: connection.saveData || false,
    };
  }

  private getNetworkStatus(): string {
    return navigator.onLine ? 'online' : 'offline';
  }

  private async getCurrentUser(): Promise<{
    id: string | null;
    email: string | null;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return {
        id: user?.id || null,
        email: user?.email || null,
      };
    } catch (error) {
      return { id: null, email: null };
    }
  }

  private isCriticalType(tipoMedicaoNome?: string): boolean {
    if (!tipoMedicaoNome) return false;
    const upperName = tipoMedicaoNome.toUpperCase();
    return (
      upperName.includes('PH') ||
      upperName.includes('CLORO') ||
      upperName.includes('FOTO')
    );
  }

  private async insertLog(logData: LogData): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    if (this.isCircuitBreakerOpen) {
      this.localQueue.push(logData);
      return;
    }

    try {
      const user = await this.getCurrentUser();
      const userIP = await this.getUserIP();
      const browserInfo = this.getBrowserInfo();
      const deviceInfo = this.getDeviceInfo();
      const networkInfo = this.getNetworkInfo();
      const networkStatus = this.getNetworkStatus();

      const isCritical = this.isCriticalType(logData.tipo_medicao_nome);

      const logEntry = {
        user_id: user.id,
        user_email: user.email,
        user_ip: userIP,
        action_type: logData.action_type,
        action_data: logData.action_data || {},
        error_data: logData.error_data || null,
        browser_info: {
          ...browserInfo,
          network: networkInfo,
        },
        device_info: deviceInfo,
        network_status: networkStatus,
        cliente_id: logData.cliente_id,
        area_de_trabalho_id: logData.area_de_trabalho_id,
        ponto_de_coleta_id: logData.ponto_de_coleta_id,
        tipo_medicao_id: logData.tipo_medicao_id,
        tipo_medicao_nome: logData.tipo_medicao_nome,
        raw_value: logData.raw_value,
        processed_value: logData.processed_value,
        final_value: logData.final_value,
        is_critical_type: isCritical,
      };

      const { error } = await supabase.from('user_action_logs').insert(logEntry);

      if (error) {
        this.failureCount++;
        if (this.failureCount >= this.maxFailures) {
          this.isCircuitBreakerOpen = true;
          console.warn('User action logging circuit breaker opened due to multiple failures');
          setTimeout(() => {
            this.isCircuitBreakerOpen = false;
            this.failureCount = 0;
            this.processLocalQueue();
          }, 60000);
        }
        throw error;
      }

      this.failureCount = 0;
    } catch (error) {
      console.error('Failed to insert user action log:', error);
      this.localQueue.push(logData);
    }
  }

  private async processLocalQueue(): Promise<void> {
    if (this.localQueue.length === 0) return;

    const queueCopy = [...this.localQueue];
    this.localQueue = [];

    for (const logData of queueCopy) {
      await this.insertLog(logData);
    }
  }

  public async logMedicaoAttempt(data: {
    cliente_id: number;
    area_de_trabalho_id?: string;
    ponto_de_coleta_id: string;
    formData: any;
    tipos: any[];
  }): Promise<void> {
    const actionData = {
      form_data: data.formData,
      tipos_count: data.tipos.length,
      tipos_list: data.tipos.map((t) => ({
        id: t.id,
        nome: t.nome,
        input_type: t.input_type,
      })),
    };

    await this.insertLog({
      action_type: 'medicao_attempt',
      action_data: actionData,
      cliente_id: data.cliente_id,
      area_de_trabalho_id: data.area_de_trabalho_id,
      ponto_de_coleta_id: data.ponto_de_coleta_id,
    });
  }

  public async logCriticalMedicaoType(data: {
    cliente_id: number;
    area_de_trabalho_id?: string;
    ponto_de_coleta_id: string;
    tipo_medicao_id: string;
    tipo_medicao_nome: string;
    tipo_metadata: any;
    raw_value: any;
    processed_value: any;
    final_value: any;
    validation_result?: any;
  }): Promise<void> {
    const actionData = {
      tipo_metadata: data.tipo_metadata,
      validation_result: data.validation_result,
      value_transformations: {
        raw: data.raw_value,
        processed: data.processed_value,
        final: data.final_value,
      },
    };

    await this.insertLog({
      action_type: 'critical_medicao_type_log',
      action_data: actionData,
      cliente_id: data.cliente_id,
      area_de_trabalho_id: data.area_de_trabalho_id,
      ponto_de_coleta_id: data.ponto_de_coleta_id,
      tipo_medicao_id: data.tipo_medicao_id,
      tipo_medicao_nome: data.tipo_medicao_nome,
      raw_value: String(data.raw_value),
      processed_value: String(data.processed_value),
      final_value: String(data.final_value),
      is_critical_type: true,
    });
  }

  public async logMedicaoSuccess(data: {
    cliente_id: number;
    area_de_trabalho_id?: string;
    ponto_de_coleta_id: string;
    medicao_id?: string;
    items_count: number;
    photos_count: number;
  }): Promise<void> {
    const actionData = {
      medicao_id: data.medicao_id,
      items_count: data.items_count,
      photos_count: data.photos_count,
    };

    await this.insertLog({
      action_type: 'medicao_success',
      action_data: actionData,
      cliente_id: data.cliente_id,
      area_de_trabalho_id: data.area_de_trabalho_id,
      ponto_de_coleta_id: data.ponto_de_coleta_id,
    });
  }

  public async logMedicaoError(data: {
    cliente_id: number;
    area_de_trabalho_id?: string;
    ponto_de_coleta_id: string;
    error: any;
    context?: any;
  }): Promise<void> {
    const errorData = {
      message: data.error?.message || String(data.error),
      code: data.error?.code,
      details: data.error?.details,
      hint: data.error?.hint,
      stack: data.error?.stack,
      context: data.context,
    };

    await this.insertLog({
      action_type: 'medicao_error',
      error_data: errorData,
      cliente_id: data.cliente_id,
      area_de_trabalho_id: data.area_de_trabalho_id,
      ponto_de_coleta_id: data.ponto_de_coleta_id,
    });
  }

  public async logSyncAttempt(data: {
    medicoes_count: number;
    pending_medicoes: any[];
  }): Promise<void> {
    const actionData = {
      medicoes_count: data.medicoes_count,
      medicoes_summary: data.pending_medicoes.map((m) => ({
        id: m.id,
        cliente_id: m.cliente_id,
        ponto_id: m.ponto_de_coleta_id,
        items_count: m.items?.length || 0,
        photos_count: m.photos?.length || 0,
      })),
    };

    await this.insertLog({
      action_type: 'sync_attempt',
      action_data: actionData,
    });
  }

  public async logSyncItemInsert(data: {
    cliente_id: number;
    area_de_trabalho_id?: string;
    ponto_de_coleta_id: string;
    medicao_id: string;
    item: any;
    success: boolean;
    error?: any;
  }): Promise<void> {
    const actionData = {
      medicao_id: data.medicao_id,
      item_data: {
        parametro: data.item.parametro,
        valor: data.item.valor,
        tipo_medicao_id: data.item.tipo_medicao_id,
        tipo_medicao_nome: data.item.tipo_medicao_nome,
      },
      success: data.success,
    };

    await this.insertLog({
      action_type: 'sync_item_insert',
      action_data: actionData,
      error_data: data.error
        ? {
            message: data.error.message,
            code: data.error.code,
            details: data.error.details,
          }
        : null,
      cliente_id: data.cliente_id,
      area_de_trabalho_id: data.area_de_trabalho_id,
      ponto_de_coleta_id: data.ponto_de_coleta_id,
      tipo_medicao_id: data.item.tipo_medicao_id,
      tipo_medicao_nome: data.item.tipo_medicao_nome,
      final_value: String(data.item.valor),
    });
  }

  public async logPhotoUpload(data: {
    cliente_id: number;
    area_de_trabalho_id?: string;
    ponto_de_coleta_id: string;
    medicao_id: string;
    tipo_medicao_id: string;
    tipo_medicao_nome: string;
    photo_info: {
      file_name: string;
      file_type: string;
      file_size: number;
    };
    success: boolean;
    error?: any;
    photo_url?: string;
  }): Promise<void> {
    const actionData = {
      medicao_id: data.medicao_id,
      photo_info: data.photo_info,
      success: data.success,
      photo_url: data.photo_url,
    };

    await this.insertLog({
      action_type: 'photo_upload',
      action_data: actionData,
      error_data: data.error
        ? {
            message: data.error.message || String(data.error),
          }
        : null,
      cliente_id: data.cliente_id,
      area_de_trabalho_id: data.area_de_trabalho_id,
      ponto_de_coleta_id: data.ponto_de_coleta_id,
      tipo_medicao_id: data.tipo_medicao_id,
      tipo_medicao_nome: data.tipo_medicao_nome,
    });
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  public async refreshConfig(): Promise<void> {
    localStorage.removeItem('user_action_logging_config');
    await this.checkConfig();
  }
}

export const userActionLogger = UserActionLogger.getInstance();
