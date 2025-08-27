import { supabase } from '../lib/supabase';

export interface PhotoUploadResult {
  success: boolean;
  photo_url?: string;
  thumbnail_url?: string;
  error?: string;
}

export class PhotoService {
  private static readonly BUCKET_NAME = 'medicao-photos';
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  /**
   * Upload a photo for a measurement item
   */
  static async uploadPhoto(
    file: File,
    medicaoItemId: string,
    clienteId: number
  ): Promise<PhotoUploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Compress image if needed
      const processedFile = await this.processImage(file);
      
      // Generate unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop() || 'jpg';
      const fileName = `${clienteId}/${medicaoItemId}/${timestamp}.${extension}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, processedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return { success: false, error: `Erro no upload: ${uploadError.message}` };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      // Generate thumbnail
      const thumbnailUrl = await this.generateThumbnail(processedFile, fileName);

      // Save to database
      const { error: dbError } = await supabase
        .from('medicao_photos')
        .insert({
          medicao_item_id: medicaoItemId,
          photo_url: publicUrl,
          thumbnail_url: thumbnailUrl,
        });

      if (dbError) {
        console.error('Database error:', dbError);
        // Clean up uploaded file on db error
        await this.deletePhoto(fileName);
        return { success: false, error: `Erro na base de dados: ${dbError.message}` };
      }

      return {
        success: true,
        photo_url: publicUrl,
        thumbnail_url: thumbnailUrl,
      };

    } catch (error) {
      console.error('Photo upload error:', error);
      return { 
        success: false, 
        error: `Erro interno: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  /**
   * Delete a photo from storage and database
   */
  static async deletePhoto(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      return !error;
    } catch (error) {
      console.error('Error deleting photo:', error);
      return false;
    }
  }

  /**
   * Get photos for a measurement item
   */
  static async getPhotos(medicaoItemId: string) {
    const { data, error } = await supabase
      .from('medicao_photos')
      .select('*')
      .eq('medicao_item_id', medicaoItemId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching photos:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Validate uploaded file
   */
  private static validateFile(file: File): { valid: boolean; error?: string } {
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.' 
      };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return { 
        valid: false, 
        error: `Arquivo muito grande. Tamanho máximo: ${this.MAX_FILE_SIZE / 1024 / 1024}MB` 
      };
    }

    return { valid: true };
  }

  /**
   * Process and compress image
   */
  private static async processImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 1920x1920)
        const maxSize = 1920;
        let { width, height } = img;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.85 // 85% quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Generate thumbnail
   */
  private static async generateThumbnail(file: File, originalFileName: string): Promise<string> {
    try {
      const thumbnailFile = await this.createThumbnail(file);
      const thumbnailPath = originalFileName.replace(/\.[^/.]+$/, '_thumb.jpg');

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(thumbnailPath, thumbnailFile);

      if (error) {
        console.error('Thumbnail upload error:', error);
        return '';
      }

      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(thumbnailPath);

      return publicUrl;
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      return '';
    }
  }

  /**
   * Create thumbnail from file
   */
  private static async createThumbnail(file: File): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Thumbnail size 300x300
        const size = 300;
        canvas.width = size;
        canvas.height = size;

        // Calculate crop dimensions
        const { width, height } = img;
        const aspectRatio = width / height;
        
        let sourceX = 0, sourceY = 0, sourceWidth = width, sourceHeight = height;
        
        if (aspectRatio > 1) {
          // Landscape - crop width
          sourceWidth = height;
          sourceX = (width - height) / 2;
        } else if (aspectRatio < 1) {
          // Portrait - crop height
          sourceHeight = width;
          sourceY = (height - width) / 2;
        }

        ctx?.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, size, size
        );

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const thumbnailFile = new File([blob], 'thumbnail.jpg', {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(thumbnailFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.8
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }
}