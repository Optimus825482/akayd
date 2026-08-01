import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    css: {
      devSourcemap: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    server: {
      hmr: {
        overlay: false,
      },
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom"],
    },
    build: {
      cssCodeSplit: true,
      sourcemap: false,
      minify: "esbuild",
      // Core Web Vitals: smaller chunks, better caching
      target: "es2020",
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom", "react-helmet-async"],
            admin: ["react-icons"],
          },
          // Stable chunk names for long-term caching
          chunkFileNames: "assets/[name]-[hash].js",
          entryFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]",
        },
      },
      // CLS önleme: görsel boyutları build'de uyarı verir
      chunkSizeWarningLimit: 500,
    },
  };
});
