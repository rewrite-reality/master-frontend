# MasterApp Frontend — Telegram Mini App

Это фронтенд-часть системы **MasterApp**, разработанная как **Telegram Mini App (TMA)**. Приложение предназначено для мастеров (исполнителей), позволяя им управлять заказами, отслеживать статус и настраивать профиль прямо внутри Telegram.

## Технологический стек

*   **Фреймворк:** [Next.js 15+](https://nextjs.org/) (App Router)
*   **Язык:** [TypeScript](https://www.typescriptlang.org/)
*   **Стилизация:** [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)
*   **Интеграция с Telegram:** [@telegram-apps/sdk-react](https://docs.telegram-mini-apps.com/), [@tma.js/sdk-react](https://github.com/Telegram-Mini-Apps/tma.js)
*   **Работа с данными:** [TanStack React Query v5](https://tanstack.com/query/latest)
*   **HTTP Клиент:** Fetch API (с кастомной оберткой в `apiClient.ts`)
*   **Анимации:** [Framer Motion](https://www.framer.com/motion/)
*   **Локализация:** [next-intl](https://next-intl-docs.vercel.app/)
*   **Real-time:** Server-Sent Events (SSE) для уведомлений о заказах

## Основные функции

*   **Авторизация через Telegram:** Бесшовная аутентификация с использованием `initData`.
*   **Управление заказами:** Просмотр списка доступных и активных заказов.
*   **Профиль мастера:** Настройка личных данных, специальностей и рабочих зон (районов).
*   **Real-time обновления:** Мгновенное получение новых заказов через SSE.
*   **Поддержка TON:** Интеграция с TON Connect для будущих платежных функций.
*   **Адаптивный дизайн:** Оптимизировано под мобильные устройства и встроенный браузер Telegram.

## Пример страниц

<div align="center">
  <img src="https://github.com/rewrite-reality/master-frontend/blob/main/screen/photo_2026-01-17_22-06-12.jpg?raw=true" alt="Скриншот интерфейса MasterApp" width="320">
</div>

## Установка и запуск

Проект использует `pnpm`. Если он у вас не установлен, выполните `npm install -g pnpm`.

### 1. Клонирование и установка зависимостей
```bash
pnpm install
```

### 2. Настройка окружения
Создайте файл `.env` в корне проекта (или отредактируйте существующий):
```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-url.com
```

### 3. Запуск в режиме разработки
Для локальной разработки с поддержкой HTTPS (необходимо для работы в Telegram):
```bash
pnpm run dev:https
```
Приложение будет доступно по адресу `https://localhost:3002`.

> **Важно:** При первом запуске браузер может выдать предупреждение о самоподписанном сертификате. Это нормально для локальной разработки TMA, нажмите "Advanced" -> "Proceed to localhost".

## Структура проекта

*   `src/app` — Маршруты и страницы (Next.js App Router).
    *   `(main)` — Основные страницы приложения (заказы, профиль).
*   `src/components` — UI компоненты, разделенные по функциональным блокам.
*   `src/lib` — Общие утилиты, настройка API клиента и интеграция с Telegram SDK.
*   `src/hooks` — Кастомные React хуки.
*   `src/providers` — Провайдеры контекста (QueryClient, Telegram context и др.).
*   `src/types` — Типизация данных.

## Запуск внутри Telegram

1.  Запустите проект локально или разверните на хостинге (например, Vercel).
2.  Если запускаете локально, используйте [ngrok](https://ngrok.com/) или аналоги, чтобы получить публичный HTTPS URL.
3.  В [@BotFather](https://t.me/botfather) создайте или выберите бота.
4.  Перейдите в `Bot Settings` -> `Menu Button` / `Inline Mode` и укажите URL вашего приложения.
5.  Откройте приложение через бота.

## Скрипты

*   `pnpm run dev` — Запуск обычного дев-сервера.
*   `pnpm run dev:https` — Запуск с HTTPS для Telegram.
*   `pnpm run build` — Сборка проекта для продакшена.
*   `pnpm run start` — Запуск собранного приложения.
*   `pnpm run lint` — Проверка кода линтером.

---
Разработано для платформы Telegram Mini Apps.