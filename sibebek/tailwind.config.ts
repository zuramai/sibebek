import type { Config } from 'tailwindcss'
import baseConfig from '@tailwindcss/vite'

export default {
    content: [
        './index.html',
        './src/**/*.{ts,tsx,js,jsx}',
    ],
    plugins: [baseConfig],
} satisfies Config;