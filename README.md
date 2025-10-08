# Sistema de Medições - PWA

Uma Progressive Web App (PWA) para cadastro de medições com arquitetura hierárquica e funcionalidade offline.

## 🚀 Funcionalidades Principais

### Arquitetura Hierárquica
- **Cliente** → **Área de Trabalho** → **Ponto de Coleta** → **Medições**
- Seleção cascata com carregamento dinâmico

### Autenticação Simulada
- Interface de login mantida para demonstração
- Qualquer credencial permite acesso ao sistema
- Modo de desenvolvimento/demonstração ativo

### Funcionalidade Offline
- ✅ Cadastro de medições funciona offline
- ✅ Sincronização automática quando volta online
- ✅ Indicador de status de conexão
- ✅ Contador de dados pendentes para sincronização

### PWA Completa
- ✅ Service Worker configurado
- ✅ Manifest para instalação
- ✅ Cache estratégico
- ✅ Interface responsiva
- ✅ Otimizado para mobile

## 🛠 Tecnologias Utilizadas

- **React** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (estilização)
- **React Router** (navegação)
- **React Hook Form** + **Yup** (formulários e validação)
- **Supabase** (backend e banco de dados)
- **Service Worker** (funcionalidade offline)

## 📱 Fluxo da Aplicação

### 1. Login (Simulado)
- Tela de login para demonstração
- Qualquer email e senha funcionam
- Acesso direto ao sistema

### 2. Seleção Hierárquica
- **Cliente**: Todos os clientes disponíveis
- **Área**: Dropdown dinâmico baseado no cliente selecionado  
- **Ponto de Coleta**: Dropdown baseado na área selecionada

### 3. Cadastro de Medições
- Interface para entrada de dados de medição
- Validação de faixas de conformidade
- Suporte offline com sincronização automática

## 🗄 Estrutura do Banco de Dados

O sistema utiliza as seguintes tabelas principais:

- `clientes` - Dados dos clientes
- `area_de_trabalho` - Áreas de trabalho dos clientes
- `ponto_de_coleta` - Pontos de coleta das áreas
- `tipos_medicao` - Tipos de medição disponíveis
- `medicao` - Registros de medições realizadas  
- `medicao_items` - Itens específicos de cada medição

## ⚙️ Configuração e Instalação

### 1. Configurar Supabase
Clique no botão **"Connect to Supabase"** no canto superior direito para conectar ao banco de dados.

### 2. Instalar Dependências
```bash
npm install
```

### 3. Executar em Desenvolvimento
```bash
npm run dev
```

### 4. Build para Produção
```bash
npm run build
```

## 🔧 Funcionalidades Técnicas

### Sistema Offline/Online
- **LocalStorage**: Armazena dados pendentes quando offline
- **Sincronização**: Upload automático quando conexão é restabelecida
- **Indicadores Visuais**: Status de conexão e dados pendentes

### Validação de Dados
- Validação em tempo real dos formulários
- Verificação de faixas de conformidade para medições
- Feedback visual para valores fora da conformidade

### Modo Demonstração
- Autenticação simulada ativa
- Acesso total ao sistema para testes
- Interface de produção mantida

### Performance
- Carregamento lazy de dados
- Cache estratégico de recursos
- Otimizações para mobile

## 📋 Como Usar

1. **Login**: Entre com qualquer email e senha
2. **Selecionar Local**: Escolha Cliente → Área → Ponto de Coleta
3. **Cadastrar Medição**: Preencha os dados e salve
4. **Offline**: Continue trabalhando mesmo sem internet
5. **Sincronização**: Dados são enviados automaticamente quando volta online

## 🎭 Modo Demonstração

- Sistema configurado para demonstração e desenvolvimento
- Autenticação simulada - qualquer credencial funciona
- Acesso completo a todos os dados e funcionalidades
- Interface original preservada para futura implementação de autenticação real

## 📱 Instalação como App

A aplicação pode ser instalada como um app nativo:
- **Android**: Opção "Adicionar à tela inicial"
- **iOS**: "Adicionar à Tela de Início" 
- **Desktop**: Ícone de instalação na barra de endereços

---
