# Помощник в P2P на Bybit

Расширение отмечающее p2p продавцов со стоп фразами в описании.

## Как работает

Расширение отслеживает когда сайт Bybit запрашивает список p2p продавцов. Проверить можно в файле `src/requestListener.ts`

Повторяет такой же запрос для получения описания продавцов. В файле `src/getStoppedOnOTC.ts`

Проверяет описание продавцов на подозрительные фразы. `src/getStoppedOnOTC.ts`

Список подозрительных фраз в файле `src/stopPhrases.json`

Возле никнеймов продавцов добавляет отметки, 🛑 - если есть подозрительные фразы, ✅ - если нет подозрительных фраз. В файле `src/updateMarks.ts`

Возле никнеймов продавцов добавляет кнопки "fast BlOCK" для быстрой блокировки пользователя на площадке

В результате в списке p2p продавцов можно сразу увидеть подозрительные сделки.

## Сборка

### Требования

- node.js от v20.16
- pnpm от 9.4

### Команды

`pnpm run build` - сборка распакованного расширения в папку `.output/chrome-mv3`

`pnpm run zip` - сборка расширения в виде zip архива для установки в `.output/wxt-starter-0.0.0-chrome.zip`

`docker run --rm --privileged -v $(pwd):/app -w /app node:20-alpine sh -c "corepack enable && corepack use pnpm && pnpm install && pnpm build"` - быстрая сборка с помощью docker или podman
