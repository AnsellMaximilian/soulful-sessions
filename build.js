const esbuild = require("esbuild");

// Build configuration for all entry points
const buildOptions = {
  entryPoints: [
    "src/background.ts",
    "src/popup.ts",
    "src/options.ts",
    "src/content.ts",
    "src/blocked.ts",
  ],
  bundle: true,
  outdir: "dist",
  format: "iife",
  target: "es2020",
  platform: "browser",
  sourcemap: false,
  minify: false,
};

esbuild.build(buildOptions).catch(() => process.exit(1));
