# EVA

**EVA** یک نرم‌افزار حسابداری چندارزی است که برای کسب‌وکارهایی طراحی شده که خرید و واردات خود را به **دلار یا درهم** انجام می‌دهند، اما فروش آن‌ها به **ریال یا تومان** انجام می‌شود.

## EVA چه مشکلی را حل می‌کند؟

در کسب‌وکارهای وارداتی، محاسبه قیمت تمام‌شده، نرخ فروش و سود و زیان به دلیل تفاوت ارز خرید و ارز فروش می‌تواند پیچیده و زمان‌بر باشد.

**نرم‌افزار حسابداری EVA** با مدیریت هم‌زمان چند ارز، این محاسبات را ساده و دقیق می‌کند و به شما کمک می‌کند:

- قیمت تمام‌شده کالا را به‌درستی محاسبه کنید.
- نرخ‌گذاری کالا را با توجه به نرخ ارز انجام دهید.
- سود و زیان واقعی معاملات را محاسبه کنید.
- خریدهای دلاری و درهمی را در کنار فروش ریالی و تومانی مدیریت کنید.
- محاسبات مربوط به تغییرات نرخ ارز را ساده‌تر و دقیق‌تر انجام دهید.

EVA برای افرادی ساخته شده است که با **واردات، خرید ارزی و فروش ریالی یا تومانی** سروکار دارند و می‌خواهند بخش پیچیده محاسبات حسابداری و نرخ‌گذاری را به شکل ساده‌تری مدیریت کنند.

## Demo

![EVA Demo](https://github.com/ahmadhaerii/eva-hesabdar/blob/main/images/demo.png)

![EVA Demo](https://github.com/ahmadhaerii/eva-hesabdar/blob/main/images/demo1.png)

![EVA Demo](https://github.com/ahmadhaerii/eva-hesabdar/blob/main/images/demo2.png)

## Libs and Tools

EVA is built with modern web and desktop technologies.

### Core 🏍️

- [Electron 43](https://www.electronjs.org)
- [Vite 8](https://vitejs.dev)

### DX 🛠️

- [TypeScript 6](https://www.typescriptlang.org)
- [oRPC](https://orpc.unnoq.com)
- [Prettier](https://prettier.io)
- [Ultracite with Biome](https://www.ultracite.ai/providers/biome)
- [Zod 4](https://zod.dev)
- [React Query (TanStack)](https://tanstack.com/query)

### UI 🎨

- [React 19.2](https://react.dev)
- [Tailwind CSS 4.3](https://tailwindcss.com)
- [Shadcn UI](https://ui.shadcn.com)
- [Geist](https://vercel.com/font) as the default font
- [i18next](https://www.i18next.com)
- [TanStack Router](https://tanstack.com/router) with file-based routing
- [Lucide](https://lucide.dev)

### Testing 🧪

- [Vitest](https://vitest.dev)
- [Playwright](https://playwright.dev)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)

### Packaging and Distribution 📦

- [Electron Forge](https://www.electronforge.io)

### CI/CD 🚀

- Pre-configured [GitHub Actions workflow](https://github.com/LuanRoger/electron-shadcn/blob/main/.github/workflows/playwright.yml) for Playwright tests.

### Project Preferences 🎯

- Context isolation is enabled.
- [React Compiler](https://react.dev/learn/react-compiler) is enabled by default.
- `titleBarStyle`: hidden, using a custom title bar.
- Geist is used as the default font.
- React DevTools are installed by default.

## Development

```bash
npm run start -- --inspect-electron