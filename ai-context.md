# ai-context.md

> Источник истины для AI-агента. Читается при каждом старте сессии.
> Порядок чтения: Learned → Patterns → Recent Changes → Current Focus

---

## Meta

```
Project: Merchant Portal
Stack: React 19 / Vite / TypeScript / Tailwind CSS v4 / @tcmms/flock-ds / antd v6 / lucide-react
Last updated: 2026-04-08
Session count: 7
Audit due at session: 8
```

---

## Current Focus

> Что сейчас в работе. Одна задача или один эпик.

```
Feature: menu-management / Catalog Onboarding System
Status: IN PROGRESS — spotlight flow (8 steps), checklist widget, universal tooltips построены.
  Spotlight: 8 шагов, навигация Next/Back, skip confirmation, jump-to-step из чеклиста.
  Checklist: 6 айтемов, click-to-jump, active state highlight, completion tracking.
  Tooltips: 6 типов (status tabs, issues ⓘ, stock ~, filters, checkboxes, bulk action one-time).
  Replay Guide: link-кнопка рядом с заголовком Catalog.
  DEV mode: авто-рестарт тура при каждом рефреше (нужно откатить перед продом).
  BulkUpdateModal: модалка "Bulk update via Excel" — 500 mock rows, пагинация 20/page с ellipsis, сортировка errors-first, 3 stat cards, sticky header. Также создана в Figma (node 9670:137621 в секции 9648:69554).
Next: финальная полировка, тестирование edge cases, production-ready localStorage logic, возможно другие модалки Bulk Update.
Blocked by: —
```

---

## Recent Changes

> Последние 5 изменений. Новые сверху. Старше 10 сессий — архивируй в ## Archive.

| Date | What changed | Files touched |
|------|--------------|---------------|
| 2026-04-08 | BulkUpdateModal: модалка "Bulk update via Excel" — 820px, 80vh max-height, 500 mock rows, пагинация с ellipsis (20/page), сортировка errors-first, 3 stat cards, sticky table header, scrollable body, flock-ds Button. Figma-фрейм создан в секции 9648:69554 (node 9670:137621). | `BulkUpdateModal.tsx`, `CatalogPage.tsx` |
| 2026-04-07 | Catalog Onboarding System: spotlight flow (8 steps), checklist widget (320px, click-to-jump, active highlight), universal tooltips (6 types), replay guide button, skip confirmation dialog. Все кнопки из flock-ds Button. DEV mode: авто-рестарт при рефреше. Badge цвет #E31D1C на Rejected и Inactive табах. | `onboarding/**`, `CatalogPage.tsx`, `CatalogTable.tsx`, `StatusSegmented.tsx`, `BulkActionBar.tsx` |
| 2026-04-05 | CLAUDE.md обновлён до v6.2: протокол старта → авто-память, Storybook URL → GitHub Pages, inline стили разрешены для Figma-токенов, добавлены Figma MCP и субагент в инструменты | `CLAUDE.md` |
| 2026-04-05 | Субагент `figma-pixel-check` создан — автоматический pixel-perfect аудит по Figma URL | `.claude/agents/figma-pixel-check.md` |
| 2026-04-05 | Pixel-perfect аудит CatalogPage header (Figma 9400:154946): 13 расхождений найдено и исправлено — тени StatusSegmented, красная кнопка Add New, радиусы, размеры иконок, FilterChip chevron | `CatalogPage.tsx`, `StatusSegmented.tsx` |
| 2026-04-05 | CatalogTable pixel-perfect (Figma 9552:783530): исправлены GRID (Product 266px fixed, Issues 1fr), бордеры #d9d9d9, SortIcon 16px, gap-[10px] в category/subcategory, иконки copy/chevron/edit | `CatalogTable.tsx` |
| 2026-04-05 | Созданы StatusBadge, BulkActionBar; CatalogTable переписан с selection state, indeterminate checkboxes, BulkActionBar | `StatusBadge.tsx`, `BulkActionBar.tsx`, `CatalogTable.tsx` |
| 2026-03-30 | Order History: роутинг activePage в App.tsx, создан OrderHistoryPage с таблицей/статистикой/фильтрами из flock-ds | `App.tsx`, `features/order-history/**` |
| 2026-03-30 | vite.config.ts: удалены мёртвые импорты @storybook/addon-vitest и @vitest/browser-playwright (Storybook убран из проекта) | `vite.config.ts` |
| 2026-03-30 | flock-ds переведён на GitHub Packages: пакет переименован в `@tcmms/flock-ds`, все импорты обновлены, добавлен `.npmrc`, Storybook удалён из Merchant Portal | `package.json`, `.npmrc`, `src/**`, `CLAUDE.md` |
| 2026-03-30 | Sidebar wrapper обновлён под актуальный flock-ds API: добавлены `storeLogo`, `variant`, `onBrandClick`; `activeItem` стал управляемым; `storeLogo` KFC передаётся из LiveOrdersPage; `npm run build:lib` в flock-ds для подтягивания новых иконок | `Sidebar.tsx`, `LiveOrdersPage.tsx` |
| 2026-03-30 | Исследование MCP-стратегии: @storybook/addon-mcp требует Storybook 9+, flock-ds на 8.6.18 — апгрейд не делали. GitHub Pages MCP остаётся основным. file:../flock-ds — намеренный метод подключения по документации (Clone & install). | — |
| 2026-03-28 | OrderDetail полный редизайн: sticky total footer, items table с заголовками колонок, баркод с иконкой, фото 52px, Print Receipt в футере, степпер в хедере, теги рядом с именем клиента, хедер Live Orders 30px extrabold | `OrderDetail.tsx`, `LiveOrdersPage.tsx`, `mockOrders.ts` |
| 2026-03-28 | OrderCard: выбранный стейт fill-tertiary (серый) вместо primary-bg | `OrderCard.tsx` |
| 2026-03-28 | UI polish: табы вынесены из острова, activeTab поднят в LiveOrdersPage, панель 520px, убран моно-шрифт, кнопки Accept/Reject в хедере детали, теги убраны с карточки | `LiveOrdersPage.tsx`, `OrderList.tsx`, `OrderDetail.tsx`, `OrderCard.tsx` |
| 2026-03-28 | FlockProvider: добавлен Steps colorSplit токен (светлее линии) | `flock-ds/src/providers/FlockProvider.tsx` |
| 2026-03-27 | DS аудит: заменены все hex-цвета на CSS-токены, antd импорты → flock-ds, спиннеры → Icon animate-spin, 60 mock-заказов с фото | `features/live-orders/**` |
| 2026-03-27 | Реализована фича Live Orders: layout, sidebar, order list, order detail | `features/live-orders/**` |
| 2026-03-27 | Инициализация проекта: React 19 + Vite + TypeScript | `package.json`, `vite.config.ts`, `tsconfig.json`, `src/` |

---

## Learned

> Долгосрочная память. Читается первым. Никогда не удаляй — только добавляй.

### Что сработало

<!-- Формат: [дата] — [паттерн или решение] — [почему сработало] -->

- [2026-03-27] — `flock-ds` как peerDependencies + `"style"` condition на `"./tokens"` — консьюмер предоставляет react/antd сам, нет дублирования; `@import 'flock-ds/tokens'` в одну строку вместо копипасты токенов
- [2026-03-27] — Feature-based структура с `index.ts` публичным API — чисто разделяет компоненты, хуки, утилиты внутри фичи
- [2026-03-27] — `useResizablePanel` хук с `useRef` для drag-state — не вызывает лишних ре-рендеров во время drag
- [2026-03-27] — `formatTimeAgo` возвращает `{ text, urgency }` — urgency используется как ключ в `urgencyColor` map, не нужен switch в компоненте
- [2026-03-27] — CSS Grid с `contents` для таблицы items в OrderDetail — все строки выровнены по единым колонкам без `<table>`

### Что провалилось

<!-- Формат: [дата] — [что пошло не так] — [контекст] — [как избежать] -->

- [2026-04-07] — box-shadow `0 0 0 9999px rgba(0,0,0,0.6)` для spotlight overlay — проще SVG mask, поддерживает CSS transitions на top/left/width/height
- [2026-04-07] — inline `style={{ background: 'none' }}` перебивает Tailwind `hover:bg-*` — использовать Tailwind `bg-transparent` вместо inline style для сброса фона
- [2026-04-07] — flock-ds Button с type/size/danger пропсами вместо кастомных styled кнопок — полные hover/active/focus/disabled стейты из коробки
- [2026-04-08] — Figma Plugin API: `layoutSizingHorizontal="FILL"` / `layoutSizingVertical="HUG"` работают ТОЛЬКО на children auto-layout фреймов, не на прямых children Section — сначала appendChild, потом set sizing
- [2026-04-08] — Figma Plugin API: при таймаутах разбивать код на несколько вызовов не помогает если node ID теряется между вызовами (другая страница) — лучше делать всё в одном вызове с навигацией к нужной странице в начале
- [2026-04-05] — `replace_all` в Edit tool опасен для JSX атрибутов — замена части className-строки ломает структуру. Если меняешь цвета/классы во всём файле — перепиши секцию целиком, не делай replace_all по частичным строкам
- [2026-04-05] — `<button>` в браузере наследует `color: ButtonText` системный цвет — может перебить inline style. Использовать `<span role="button">` или явный Tailwind color-класс для критичных цветных элементов
- [2026-03-28] — CSS-оверрайды `.ant-*` классов не работают — antd v6 использует CSS-in-JS, глобальные классы не применяются — использовать только FlockProvider `components: { ... }` токены
- [2026-03-30] — После обновления компонента в flock-ds нужно: 1) бампнуть версию (`npm version patch`), 2) запушить в main, 3) `npm update @tcmms/flock-ds` в Merchant Portal
- [2026-03-30] — `Input` в flock-ds экспортируется как `InputField`, не `Input` — Storybook MCP называет компонент "Input" но реальный экспорт другой; всегда проверять через `node -e "import(...).then(m => console.log(Object.keys(m)))"`
- [2026-03-28] — Steps connector lines используют `colorTextDisabled`, не `colorSplit` — `ConfigProvider` с `colorSplit` не даёт эффекта; правильный токен `token.colorTextDisabled`
- [2026-03-28] — loremflickr.com возвращает случайные пользовательские фото по тегу — не пригоден для food mock-данных; использовать только прямые Unsplash photo ID URLs

### Решения принятые намеренно

<!-- Архитектурные выборы которые нельзя пересматривать молча -->
<!-- Формат: [дата] — [решение] — [причина] -->

- [2026-04-05] — `forwardRef` + `useImperativeHandle` для передачи imperative handle вверх (пример: `collapseAll()` из CatalogTable в CatalogPage) — чище чем prop drilling `onCollapse` вниз и `useEffect` антипаттерн
- [2026-04-05] — Pixel-perfect: inline styles для точных Figma-значений (rgba, hex, box-shadow) — Tailwind arbitrary values для spacing/sizing, inline styles для цветов/теней — разрешено в CLAUDE.md v6.2
- [2026-04-05] — `disableCodeConnect: true` в Figma MCP — без него Code Connect lookup блокирует ответ на больших нодах
- [2026-04-05] — CSS Grid с фиксированными колонками для таблицы: `GRID = '52px 266px 114px 134px 92px 92px 126px 104px 1fr 56px'` — Product фиксирован, With Issues заполняет остаток через `1fr`
- [2026-03-27] — Tailwind для layout/spacing, inline styles только для CSS-переменных flock-ds — токены доступны как `var(--flock-color-primary)` и т.д.; все UI-компоненты только из Storybook, без исключений
- [2026-03-28] — `fontFamily: 'var(--flock-font-family-code)'` запрещён везде — пользователь явно попросил убрать моно-шрифт, везде только Inter (fontFamily не указывать)
- [2026-03-28] — `activeTab` хранится в `LiveOrdersPage`, не в `OrderList` — табы рендерятся над островом списка, вне белой карточки
- [2026-03-28] — Теги заказа (модификаторы блюд типа "Spicy Request") — только в OrderDetail, не в OrderCard
- [2026-03-27] — `#722ED1` (Platinum tier purple) — единственный допустимый захардкоженный цвет; в flock-ds нет токена для этого оттенка
- [2026-03-27] — Кликабельный контейнер OrderCard — native `<button>` намеренно; Button из flock-ds не подходит для сложного card-контейнера с children
- [2026-03-30] — `@tcmms/flock-ds` подключается через GitHub Packages, не `file:` — команда, у каждого разработчика свой PAT-токен (`read:packages`) в `~/.zshrc`; обновление: `npm update @tcmms/flock-ds`
- [2026-04-05] — Кастомный субагент (`figma-pixel-check`) требует перезапуска сессии Claude Code чтобы стать доступным — файл `.claude/agents/*.md` читается только при старте
- [2026-04-07] — Onboarding: `data-onboarding` атрибуты отдельно от `data-tour` — spotlight и SeeHowTour не конфликтуют; `CHECKLIST_TO_STEP` / `STEP_TO_CHECKLIST` маппинги для двусторонней навигации чеклист↔spotlight
- [2026-04-07] — Checklist z-index динамический: 1000 в обычном режиме, 9500 во время spotlight — передаётся через `spotlightActive` проп
- [2026-04-08] — BulkUpdateModal: Modal из flock-ds с `styles={{ body: { maxHeight, display:'flex', overflow:'hidden' } }}` для фиксированной высоты + scrollable table внутри
- [2026-04-08] — Пагинация с ellipsis: `getPageNumbers(current, total)` возвращает `(number | 'ellipsis')[]` — показывает first, last, и ±1 от текущей страницы
- [2026-04-05] — `StatusSegmented` кастомный (не flock-ds Segmented) — DS-компонент не поддерживает badge внутри таба и кастомный box-shadow. Принимает `activeShadow` prop: Brand/Branch = fancyShadow, Status filter = boxShadowSecondary
- [2026-03-30] — MCP Storybook подключён через GitHub Pages URL (`https://tcmms.github.io/Flock/index.json`), локальный Storybook не нужен
- [2026-03-27] — Mock-данные в `data/mockOrders.ts` без TanStack Query — на этапе UI-разработки без бэкенда; при подключении API заменить на `useQuery` хуки

---

## Patterns

> Реестр паттернов. Обновляется агентом по результатам сессий.

| Status | Pattern | Context | Added |
|--------|---------|---------|-------|
| ✅ Proven | `forwardRef` + `useImperativeHandle` для imperative handle вверх по дереву | `CatalogTable` → `collapseAll()` в `CatalogPage`; уже использовался в предыдущих сессиях | 2026-04-05 |
| ✅ Proven | Selection state внутри таблицы + indeterminate checkbox на category/subcategory уровне | `CatalogTable` — flat allItemIds + toggleCategoryItems | 2026-04-05 |
| ✅ Proven | box-shadow `0 0 0 9999px` для spotlight overlay с CSS transitions | `SpotlightOverlay.tsx` — проще SVG mask, smooth 400ms transitions | 2026-04-07 |
| 🧪 Experimental | `CHECKLIST_TO_STEP` / `STEP_TO_CHECKLIST` двусторонний маппинг для click-to-jump навигации | `checklistConfig.ts` → `OnboardingChecklist` + `useSpotlightFlow` | 2026-04-07 |
| 🧪 Experimental | `dataOnboardingMap` prop на StatusSegmented — добавляет `data-onboarding` к конкретным табам | `StatusSegmented.tsx` для spotlight targeting | 2026-04-07 |
| 🧪 Experimental | `firstVisibleItemId` в CatalogTable для data-onboarding на первом видимом ряду | `CatalogTable.tsx` — зависит от expanded categories/subcategories | 2026-04-07 |
| 🧪 Experimental | Modal fixed-height + scrollable table: `styles.body maxHeight` + flex column + `overflow-y-auto` на rows | `BulkUpdateModal.tsx` | 2026-04-08 |
| 🧪 Experimental | Pagination с ellipsis: `getPageNumbers(current, total)` — compact page numbers для больших датасетов | `BulkUpdateModal.tsx` | 2026-04-08 |
| 🧪 Experimental | `badgeColor` prop на StatusSegmented для кастомного цвета бейджа per-tab | `StatusSegmented.tsx` — красный бейдж на Rejected/Inactive | 2026-04-08 |
| 🧪 Experimental | `activeShadow` prop на generic segmented control — разные тени для разных контекстов одного компонента | `StatusSegmented` в `CatalogPage` | 2026-04-05 |
| 🧪 Experimental | `figma-pixel-check` субагент — автоматический Figma fetch + code diff + отчёт | `.claude/agents/figma-pixel-check.md` | 2026-04-05 |
| 🧪 Experimental | `urgency` map pattern: функция возвращает `{ text, urgency }`, компонент берёт цвет из `Record<Urgency, string>` | `formatTimeAgo` + `urgencyColor` в OrderCard | 2026-03-27 |
| 🧪 Experimental | CSS Grid + `contents` для выравнивания строк таблицы | OrderDetail items table | 2026-03-27 |
| 🧪 Experimental | `useRef` для drag-state в resizable panel (без useState = без лишних ре-рендеров) | `useResizablePanel` | 2026-03-27 |
| 🧪 Experimental | `StatusTag` как внутренний sub-компонент файла, не экспортируется | OrderCard.tsx | 2026-03-27 |
| 🧪 Experimental | Табы вне острова: `rounded-t-xl` враппер с белым фоном + `tabBarStyle={{ marginBottom: 0, paddingLeft: 16 }}` убирает отступ antd и даёт одну линию на всю ширину | LiveOrdersPage.tsx | 2026-03-28 |
| ✅ Proven | `position: sticky; bottom: 0` внутри `overflow-y-auto` контейнера — элемент в потоке когда контент короткий, прилипает к низу когда скролл появляется | OrderDetail.tsx sticky total | 2026-03-28 |
| 🧪 Experimental | `ConfigProvider` с `token: { colorTextDisabled }` вокруг Steps для управления цветом connector lines | OrderDetail.tsx | 2026-03-28 |
| ❌ Avoid | `type="card"` для Tabs — border на активном табе создаёт визуальный артефакт при отдельном контенте | LiveOrdersPage.tsx | 2026-03-28 |

<!-- Статусы:
✅ Proven     — использован 2+ раза, работает стабильно. Применять по умолчанию.
🧪 Experimental — использован однажды, результат неоднозначен. Сообщать при применении.
❌ Avoid      — провалился или создал регрессию. Не применять без явного запроса.
-->

---

## Decisions Log

> Архитектурные развилки и почему выбрали именно этот путь.
> Нужно чтобы не возвращаться к одним и тем же вопросам.

| Date | Decision | Alternatives considered | Reason |
|------|----------|------------------------|--------|
| 2026-03-27 | `flock-ds` настроен как библиотека: `react`, `react-dom`, `antd` в `peerDependencies` — Merchant Portal сам предоставляет их. CSS-токены через `@import 'flock-ds/tokens'` (одна строка в `index.css`, не копипаста). `"./tokens"` экспорт с `"style"` condition — Vite резолвит корректно | Копировать токены в проект / держать react в dependencies flock-ds | Стандартная практика для UI-библиотек: консьюмер управляет версиями peer-зависимостей, нет дублирования react в бандле |
| 2026-03-27 | Статусы заказа как discriminated union строк, не enum | TypeScript enum | Строковые литералы лучше сериализуются, читаются в дебагере, не требуют импорта |
| 2026-03-27 | `OrderDetail` — отдельный компонент (не часть OrderList) | Render prop / inline | Разные зоны ответственности: список vs детали; разный скролл и layout |

---

## Audit Log

> Заполняется при запуске `/audit`. Последний результат сверху.

| Session | Date | Speed | Quality | Patterns | Diagnosis |
|---------|------|-------|---------|----------|-----------|
| —       | —    | —     | —       | —        | —         |

<!-- Оси оценки:
Speed    — задачи решаются за меньше итераций?
Quality  — меньше обращений к Circuit Breaker?
Patterns — соотношение Proven к Experimental растёт?
-->

---

## Archive

> Старые записи из Recent Changes. Не удалять.

- —
