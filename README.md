# 🌿 LogVert - Sistema de Gestão de Vendas

Sistema completo de gestão de vendas com geração automática de número serial para clientes.

## 🚀 Começando

### Pré-requisitos
- Node.js 14+ instalado
- Backend API rodando em `http://localhost:8080/logvert`
- Banco de dados configurado

### Instalação

1. Clone o repositório:
```bash
cd https://github.com/LuanDias23/LogVert.git
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor:
```bash
node app.js
```

4. Acesse no navegador:
```
http://localhost:3000
```

## 📋 Funcionalidades Principais

### Para o Lojista

#### 1. **Gestão de Produtos** (`/produtos`)
- ✅ Listar todos os produtos
- ✅ Adicionar novo produto com imagem
- ✅ Editar produto existente
- ✅ Excluir produto
- ✅ Exportar lista para Excel

#### 2. **Gestão de Vendas** (`/vendas`)
- ✅ Visualizar vendas cadastradas
- ✅ Cadastrar nova venda
- ✅ Gerar número serial automaticamente
- ✅ Enviar email com serial para o cliente
- ✅ Ver detalhes da venda
- ✅ Excluir venda
- ✅ Estatísticas em tempo real (vendas totais, pedidos pendentes, ticket médio)

### Para o Cliente

#### 3. **Login com Serial** (`/cliente/login`)
- ✅ Login usando número serial recebido por email
- ✅ Validação automática de formato
- ✅ Acesso à área do cliente

## 🎯 Fluxo de Uso

### Fluxo Completo de uma Venda

```
1. Lojista acessa /vendas
   ↓
2. Clica em "Adicionar Venda"
   ↓
3. Preenche formulário:
   - ID da Loja
   - ID do Consumidor
   - Email do Cliente ← IMPORTANTE!
   - Valor, Desconto, Prazos
   - Itens da Venda (JSON)
   ↓
4. Clica em "Salvar Venda e Gerar Serial"
   ↓
5. Sistema gera serial único (ex: ABC1234-5678-9012)
   ↓
6. Modal aparece mostrando o serial
   ↓
7. Email é enviado automaticamente para o cliente
   ↓
8. Cliente recebe email com serial
   ↓
9. Cliente acessa /cliente/login
   ↓
10. Cliente digita o serial
    ↓
11. Sistema valida e redireciona para área do cliente
```

## 🔑 Formato do Número Serial

O número serial é gerado automaticamente no formato:

```
ABC1234-5678-9012
│││││││ ││││ ││││
│││└┴┴┴─┴┴┴┴─┴┴┴┴── 12 dígitos numéricos
└┴┴─────────────── 3 letras maiúsculas
```

**Características:**
- Único para cada venda
- 17 caracteres total (incluindo traços)
- Validado no frontend e backend
- Usado para login do cliente

## 📁 Estrutura de Rotas

### Rotas Handlebars (Views)
```
GET /                    → Página inicial
GET /produtos            → Gestão de Produtos
GET /vendas              → Gestão de Vendas
GET /cliente/login       → Login do Cliente
```

### Rotas Estáticas (HTML)
```
/pages/menu.lojista/menuLojista.html
/pages/menu.cliente/menuCliente.html
/pages/login/login.html
... outras páginas estáticas
```

## 🎨 Tecnologias Utilizadas

### Frontend
- **Express.js** - Servidor web
- **Handlebars** - Template engine
- **Particles.js** - Animações de fundo
- **Font Awesome** - Ícones
- **XLSX.js** - Exportação para Excel

### Integração
- **Fetch API** - Comunicação com backend
- **LocalStorage** - Armazenamento de tokens e dados

### Estilização
- **CSS3** com variáveis CSS
- **Flexbox & Grid** - Layouts responsivos
- **Animações & Transitions** - Experiência fluida

## 🔧 Configuração

### Arquivo: `app.js`

Principal arquivo do servidor Express. Configurações importantes:

```javascript
const port = process.env.PORT || 3000;  // Porta do servidor
```

### Arquivo: `public/js/api/apiClient.js`

Configuração da URL base da API:

```javascript
const API_BASE_URL = 'http://localhost:8080/logvert';
```

**⚠️ Altere esta URL se seu backend estiver em outro endereço!**

## 📦 Dependências

```json
{
  "express": "^4.21.2",
  "express-handlebars": "^8.0.2",
  "cors": "^2.8.5",
  "body-parser": "^1.20.3",
  "hashids": "^2.3.0",
  "multer": "^2.0.0"
}
```

## 🐛 Resolução de Problemas

### Servidor não inicia
```bash
# Verifique se a porta 3000 está livre
netstat -ano | findstr :3000

# Se estiver em uso, mate o processo ou altere a porta em app.js
```

### Erros de CORS
```
Verifique se o backend tem CORS habilitado para http://localhost:3000
```

### Token de autenticação inválido
```javascript
// Faça login novamente para obter um novo token
// O token é salvo no localStorage após login
localStorage.setItem('authToken', 'seu-token-aqui');
```

### Serial não encontrado
```
1. Verifique se o backend implementou o endpoint:
   GET /logvert/vendas/serial/{numeroSerial}

2. Veja requisitos em: BACKEND-REQUIREMENTS.md
```
## 🧪 Testando o Sistema

### Teste Rápido - Produtos

```bash
# 1. Inicie o servidor
node app.js

# 2. Abra no navegador
http://localhost:3000/produtos

# 3. Tente adicionar um produto
# - Preencha descrição, preço, unidade
# - Faça upload de uma imagem
# - Clique em Salvar
```

### Teste Rápido - Vendas

```bash
# 1. Acesse
http://localhost:3000/vendas

# 2. Clique em "Adicionar Venda"

# 3. Use estes dados de teste:
ID Loja: 1
ID Consumidor: 7
Email: seu-email@exemplo.com
Status: Pendente
Pagamento: Pix
Valor Total: 100.00
Desconto: 10
Prazo Troca: 15
Prazo Devolução: 8

# 4. Itens (JSON):
[
  {
    "idProduto": 1,
    "quantidade": 2,
    "detalhe": "Teste",
    "valorVendido": 50.00
  }
]

# 5. Observe o serial gerado no modal
# 6. Copie o serial e teste no login do cliente
```

### Teste Rápido - Login Cliente

```bash
# 1. Acesse
http://localhost:3000/cliente/login

# 2. Digite o serial gerado anteriormente
# Exemplo: ABC1234-5678-9012

# 3. Clique em "Acessar Minhas Compras"

# 4. Verifique se redireciona corretamente
```

## ⚙️ Variáveis de Ambiente (Opcional)

Crie um arquivo `.env` na raiz:

```env
PORT=3000
API_URL=http://localhost:8080/logvert
NODE_ENV=development
```

## 🤝 Contribuindo

1. Crie uma branch para sua feature
2. Faça commit das alterações
3. Envie um pull request

## 📝 Convenções de Código

### JavaScript
- Use `const` e `let` (não `var`)
- Arrow functions para callbacks
- async/await para operações assíncronas
- Comentários descritivos

### CSS
- Use variáveis CSS (`:root`)
- Mobile-first approach
- BEM naming convention (opcional)

### HTML/Handlebars
- Indentação de 2 ou 4 espaços
- Comentários descritivos em views
- Attributes entre aspas

## 📞 Suporte

Em caso de problemas:

1. Verifique os logs do console do navegador (F12)
2. Verifique os logs do servidor Node.js
3. Consulte a documentação do backend
4. Verifique se todas as dependências estão instaladas

## 📄 Licença

Este projeto é proprietário da LogVert.

---
