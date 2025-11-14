import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import * as path from 'path';
import reactSrcPath from './plugins/react-src-path';

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins = [
    ...(mode === 'development' ? [reactSrcPath()] : []),
    react(),
    splitVendorChunkPlugin(),
    tailwindcss()
  ];
  return {
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    base: '/',
    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    // prevent vite from obscuring rust errors
    clearScreen: false,
    // tauri expects a editorInput port, fail if that port is not available
    server: {
      host: '0.0.0.0',
      port: 1024,
      strictPort: true,
      proxy: {
        '/api': {

        }
      },
      // cors: {
      //   // 配置了 credentials 为 true 后，origin 必须指定域名
      //   origin: '',
      //   //   添加此配置的原因是为了防止某些接口需要使用 cookie 时，认证信息无法带过去写问题。
      //   credentials: true
      // }
    },
    // to make use of `TAURI_DEBUG` and other env variables
    build: {
      // rollupOptions: {
      //   input: {
      //     main: path.resolve(__dirname, '/index.html'),
      //     iframeDnd: path.resolve(__dirname, '/voltron-dnd/index.html')
      //   },
      //   output: {
      //     manualChunks(id: string[]) {
      //       // 处理第三方依赖
      //       if (id.includes('node_modules')) {
      //         // 精确匹配特定包
      //         if (id.includes('node_modules/html2canvas')) {
      //           return 'html2canvas';
      //         }
      //         if (id.includes('node_modules/prettier')) {
      //           return 'prettier';
      //         }
      //         // React 相关依赖合并
      //         if (id.includes('node_modules/react/') || id.includes('node_modules/react-router-dom/')) {
      //           return 'reactAndDom';
      //         }
      //         // 其他未明确指定的 node_modules 依赖 (可选)
      //         // return 'vendor';
      //       }
      //
      //       // 处理项目内代码拆分
      //       if (id.includes('src/pages/project-management')) {
      //         return 'projectManagement';
      //       }
      //       if (id.includes('src/pages/editor')) {
      //         return 'editor';
      //       }
      //       if (id.includes('src/pages/preview')) {
      //         return 'preview';
      //       }
      //     }
      //   }
      // }
    }
  };
});
