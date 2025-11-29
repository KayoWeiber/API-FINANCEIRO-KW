# API Financeiro KW

API REST para controle financeiro pessoal, construída com Node.js, Express e PostgreSQL.

Esta documentação descreve como configurar o projeto localmente e todos os endpoints disponíveis, incluindo exemplos de requisições e respostas.

## Visão Geral

- Base URL (local): `http://localhost:<PORT>`
- Status health: `GET /` → retorna `"API Financeira Online"`
- Formato: JSON (CORS habilitado)
- Banco de dados: PostgreSQL (acesso via `pg`)

## Stack

- `Node.js` + `Express`
- `pg` (driver PostgreSQL)
- `dotenv` (variáveis de ambiente)
- `cors`, `helmet`, `compression`, `morgan`, `express-rate-limit`

## Requisitos

- Node.js 18+
- PostgreSQL acessível via URL de conexão

## Configuração

1) Instale as dependências:

```powershell
npm install
```

2) Crie um arquivo `.env` na raiz com as variáveis:

```env
PORT=3000
DATABASE_URL=postgres://usuario:senha@localhost:5432/financeiro_kw
```

Observações:
- Em `db.js` o pool está configurado com `ssl: false`. Se seu provedor exigir SSL, ajuste esse valor conforme necessário.
- O schema do banco deve conter as tabelas usadas pelos endpoints (ver nomes e colunas nos corpos das requisições abaixo).

## Executando

```powershell
npm start
```

O servidor sobe na porta definida em `PORT`.

### Middlewares configurados

- Segurança: `helmet()`
- CORS: `cors()`
- Compactação: `compression()`
- Logs HTTP: `morgan('dev'|'combined')` conforme `NODE_ENV`
- Limite de requisições: `express-rate-limit` (janela 15min, `RATE_LIMIT_MAX` padrão 300)
- JSON body: `express.json({ limit: '1mb' })`
- 404: retorna `{ error: "Not Found", path }`
- Erros: handler centralizado (em produção, resposta genérica 500)

## Convenções

- "Exclusão" é lógica: registros são marcados com `deleted='*'` e filtrados com `deleted=''` nos `GET`.
- Todos os `POST`/`PATCH` retornam o registro completo como JSON com status 200.
- `DELETE` retorna `204 No Content`.

## Endpoints

As rotas abaixo estão montadas diretamente na raiz, por exemplo `POST /categorias`.

### Categorias

- POST `/categorias`
	- Body: `{ "user_id": number, "nome": string }`
	- Resposta: objeto da categoria criada

- GET `/categorias/:user_id`
	- Lista categorias do usuário (somente `deleted=''`).

- PATCH `/categorias/:id`
	- Body: `{ "nome": string }`
	- Resposta: objeto atualizado

- DELETE `/categorias/:id`
	- Soft-delete (`deleted='*'`). Retorna 204.

Exemplos:

```powershell
curl -X POST http://localhost:3000/categorias \
	-H "Content-Type: application/json" \
	-d '{"user_id":1,"nome":"Alimentação"}'

curl http://localhost:3000/categorias/1
```

### Competências

- POST `/competencias`
	- Body: `{ "user_id": number, "ano": number, "mes": number, "ativa": boolean }`

- GET `/competencias/:user_id`
	- Ordenado por `ano desc, mes desc`, somente `deleted=''`.

- PATCH `/competencias/:id`
	- Body: `{ "ativa": boolean }`

- DELETE `/competencias/:id`
	- Soft-delete. 204.

Exemplo:

```powershell
curl -X POST http://localhost:3000/competencias \
	-H "Content-Type: application/json" \
	-d '{"user_id":1,"ano":2025,"mes":11,"ativa":true}'
```

### Entradas

- POST `/entradas`
	- Body: `{ "user_id": number, "competencia_id": number, "data": string, "tipo_renda": string, "descricao": string, "valor": number }`

- GET `/entradas/:competencia_id`
	- Lista entradas da competência (somente `deleted=''`).

Exemplo:

```powershell
curl -X POST http://localhost:3000/entradas \
	-H "Content-Type: application/json" \
	-d '{"user_id":1,"competencia_id":10,"data":"2025-11-01","tipo_renda":"salario","descricao":"Mensal","valor":5000}'
```

### Formas de Pagamento

- POST `/formas-pagamento`
	- Body: `{ "user_id": number, "tipo": string }`

- GET `/formas-pagamento/:user_id`
	- Lista formas do usuário (somente `deleted=''`).

- PATCH `/formas-pagamento/:id`
	- Body: `{ "tipo": string }`

- DELETE `/formas-pagamento/:id`
	- Soft-delete. 204.

### Gastos Variáveis

- POST `/gastos-variaveis`
	- Body: `{ "user_id": number, "competencia_id": number, "categoria_id": number, "forma_pagamento_id": number, "data": string, "descricao": string, "valor": number }`

- GET `/gastos-variaveis/:competencia_id`
	- Lista gastos da competência (somente `deleted=''`).

- PATCH `/gastos-variaveis/:id`
	- Body: `{ "data": string, "descricao": string, "valor": number }`

- DELETE `/gastos-variaveis/:id`
	- Soft-delete. 204.

### Investimentos
### Gastos Fixos

- POST `/gastos-fixos`
	- Body: `{ "user_id": uuid, "competencia_id": uuid, "categoria_id": uuid, "forma_pagamento_id": uuid, "data": "YYYY-MM-DD"|null, "descricao": string|null, "valor": number, "pago": boolean? }`

- GET `/gastos-fixos/:competencia_id`
	- Lista gastos fixos da competência (somente `deleted=''`). Ordena por data / descrição.

- PATCH `/gastos-fixos/:id`
	- Body dinâmico: `{ "campo": string, "valor": any }` onde `campo ∈ { data, descricao, valor, pago, categoria_id, forma_pagamento_id }`

- DELETE `/gastos-fixos/:id`
	- Soft-delete. 204.

Exemplos:

```powershell
curl -X POST http://localhost:3000/gastos-fixos \
  -H "Content-Type: application/json" \
  -d '{"user_id":"<uuid>","competencia_id":"<uuid>","categoria_id":"<uuid>","forma_pagamento_id":"<uuid>","data":"2025-11-10","descricao":"Assinatura","valor":49.90,"pago":false}'

curl -X PATCH http://localhost:3000/gastos-fixos/<id> \
  -H "Content-Type: application/json" \
  -d '{"campo":"pago","valor":true}'
```

- POST `/investimentos`
	- Body: `{ "user_id": number, "competencia_id": number, "data": string, "descricao": string, "valor": number }`

- GET `/investimentos/:competencia_id`
	- Lista investimentos da competência (somente `deleted=''`).

Exemplo:

```powershell
curl -X POST http://localhost:3000/investimentos \
	-H "Content-Type: application/json" \
	-d '{"user_id":1,"competencia_id":10,"data":"2025-11-02","descricao":"Tesouro","valor":200}'
```

## Erros e Códigos de Status

- Sucesso (GET/POST/PATCH): 200 com JSON do(s) registro(s).
- Exclusão lógica: 204 (sem corpo).
- Erros de banco/servidor retornam 500 (não padronizados).

## Licença

Este projeto segue a licença incluída no arquivo `LICENSE`.
