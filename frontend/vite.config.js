import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import viteCompression from "vite-plugin-compression" // 1. Import it here

export default defineConfig({
    plugins: [
        react(),
        viteCompression(), // 2. Add it to your plugins array
    ],
})
