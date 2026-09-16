import { FuseV1Options, FuseVersion } from "@electron/fuses";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { VitePlugin } from "@electron-forge/plugin-vite";
import type { ForgeConfig } from "@electron-forge/shared-types";
import path from "node:path";
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function copyDir(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, {
    recursive: true,
    force: true,
  });
}
const config: ForgeConfig = {
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ["win32"]),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  packagerConfig: {
    asar: true,
    extraResource: ["src/database/migrations"],
  },

  hooks: {
    packageAfterCopy: async (_config, buildPath) => {
      const projectNodeModules = path.resolve(__dirname, "node_modules");
      const targetNodeModules = path.join(buildPath, "node_modules");

      const packages = [
        "@libsql/client",
        "@libsql/core",
        "@libsql/hrana-client",
        "@libsql/isomorphic-ws",
        "libsql",
        "@libsql/win32-x64-msvc",
      ];

      for (const packageName of packages) {
        const source = path.join(projectNodeModules, ...packageName.split("/"));

        const target = path.join(targetNodeModules, ...packageName.split("/"));

        if (!fs.existsSync(source)) {
          throw new Error(`Missing package: ${source}`);
        }

        console.log(`📦 Copying ${packageName}`);
        copyDir(source, target);
      }
    },
  },
  plugins: [
    new VitePlugin({
      build: [
        {
          config: "vite.main.config.mts",
          entry: "src/main.ts",
        },
        {
          config: "vite.preload.config.mts",
          entry: "src/preload.ts",
        },
      ],
      renderer: [
        {
          config: "vite.renderer.config.mts",
          name: "main_window",
        },
      ],
    }),
    new AutoUnpackNativesPlugin({}),

    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  publishers: [
    {
      config: {
        draft: true,
        prerelease: false,
        repository: {
          name: "EVA",
          owner: "ahmadhaerii",
        },
      },

      name: "@electron-forge/publisher-github",
    },
  ],
  rebuildConfig: {},
};

export default config;
