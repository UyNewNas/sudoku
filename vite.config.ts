import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 当部署到 https://<user>.github.io/sudoku/ 时必须设置 base
// 本地开发时 vite 会自动忽略
export default defineConfig({
  plugins: [react()],
  base: "/sudoku/",
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
});
