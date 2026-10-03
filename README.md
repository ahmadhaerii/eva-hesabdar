# EVA

 EVA it's here to fix your calculation in shop 

![Demo GIF](https://github.com/ahmadhaerii/eva-hesabdar/blob/main/images/demo.png)
![Demo GIF](https://github.com/ahmadhaerii/eva-hesabdar/blob/main/images/demo1.png)
![Demo GIF](https://github.com/ahmadhaerii/eva-hesabdar/blob/main/images/demo2.png)

## Libs and tools

To develop a Electron app, I use ... 

### Core 🏍️

- [Electron 43](https://www.electronjs.org)
- [Vite 8](https://vitejs.dev)

### DX 🛠️

- [TypeScript 6](https://www.typescriptlang.org)
- [oRPC](https://orpc.unnoq.com)
- [Prettier](https://prettier.io)
- [Ultracite with Biome](https://www.ultracite.ai/providers/biome)
- [Zod 4](https://zod.dev)
- [React Query (TanStack)](https://react-query.tanstack.com)

### UI 🎨

- [React 19.2](https://reactjs.org)
- [Tailwind 4.3](https://tailwindcss.com)
- [Shadcn UI](https://ui.shadcn.com)
- [Geist](https://vercel.com/font) as default font
- [i18next](https://www.i18next.com)
- [TanStack Router](https://tanstack.com/router) (with file based routing)
- [Lucide](https://lucide.dev)

### Test 🧪

- [Vitest](https://vitest.dev)
- [Playwright](https://playwright.dev)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)

### Packing and distribution 📦

- [Electron Forge](https://www.electronforge.io)

### CI/CD 🚀

- Pre-configured [GitHub Actions workflow](https://github.com/LuanRoger/electron-shadcn/blob/main/.github/workflows/playwright.yml), for test with Playwright

### Project preferences 🎯

- Use Context isolation
- [React Compiler](https://react.dev/learn/react-compiler) is enabled by default.
- `titleBarStyle`: hidden (Using custom title bar)
- Geist as default font
- Some default styles was applied, check the [`styles`](https://github.com/LuanRoger/electron-shadcn/tree/main/src/styles) directory
- React DevTools are installed by default
 
npm run start -- --inspect-electron



## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/LuanRoger/electron-shadcn/blob/main/LICENSE) file for details.
