# cv-lending-api

Express API для приёма контактных запросов и отправки email через SMTP.

## Скрипты

``` bash
npm run dev
npm run build
npm start
npm test
```

## Переменные окружения

Создайте файл `.env` на основе `.env.example`.

``` bash
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=user@example.com
SMTP_PASS=password
MAIL_FROM=no-reply@example.com
MAIL_TO=hr@example.com

DEEPSEEK_API_KEY=sk-your-deepseek-key
DEEPSEEK_MODEL=deepseek-chat
```

## Эндпоинты

`GET /health`

Возвращает статус API.

`POST /api/contact`

Принимает данные контактной формы, используемой фронтендом:

``` json
{
  "name": "Jane Doe",
  "phone": "+1 555 0100",
  "email": "jane@example.com",
  "comment": "Я хочу обсудить проект по фронтенду."
}
```

Если SMTP-переменные настроены, запрос отправляется на `MAIL_TO`, а
копия письма отправляется на email отправителя.

Если SMTP не настроен, запрос проходит валидацию и принимается в
демонстрационном режиме.

`POST /api/ai-summary`

Принимает запрос (prompt) для планируемого AI-помощника:

``` json
{
  "prompt": "React-лендинг с формой обратной связи и отправкой email"
}
```

Если настроен `DEEPSEEK_API_KEY`, API выполняет запрос к DeepSeek Chat
Completions API.

Если ключ отсутствует, возвращается локальное резервное (fallback)
описание.
