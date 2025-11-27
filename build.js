const esbuild = require("esbuild");

// Build configuration for extension entry points
const extensionBuildOptions = {
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

// Build configuration for dev-screen (development tool only)
const devScreenBuildOptions = {
  entryPoints: ["src/dev-screen.ts"],
  bundle: true,
  outfile: "dist/dev-screen.js",
  format: "iife",
  target: "es2020",
  platform: "browser",
  sourcemap: true,
  minify: false,
};

// Build configuration for html2canvas library
const html2canvasBuildOptions = {
  entryPoints: ["node_modules/html2canvas/dist/html2canvas.js"],
  bundle: true,
  outfile: "dist/html2canvas.js",
  format: "iife",
  globalName: "html2canvas",
  target: "es2020",
  platform: "browser",
  sourcemap: false,
  minify: false,
};

// Build extension
async function build() {
  try {
    await esbuild.build(extensionBuildOptions);
    console.log("Extension build complete");
    
    // Build html2canvas library
    await esbuild.build(html2canvasBuildOptions);
    console.log("html2canvas library bundled");
    
    // Build dev-screen if requested
    if (process.argv.includes("--dev-screen")) {
      await esbuild.build(devScreenBuildOptions);
      console.log("Dev Screen build complete");
    }
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

build();
