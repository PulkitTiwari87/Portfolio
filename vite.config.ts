import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';

// LeetCode's GraphQL endpoint sends no CORS headers, so the browser calls this same-origin path.
// Production uses the equivalent rewrite in vercel.json.
const leetcodeProxy = {
  '/api/leetcode': {
    target: 'https://leetcode.com',
    changeOrigin: true,
    rewrite: () => '/graphql',
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [ tailwindcss(),react()],
  base: "/",
  server: { proxy: leetcodeProxy },
  preview: { proxy: leetcodeProxy },
  resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
  
}
})
