import {defineConfig, Plugin} from 'vite';
import motionCanvas from '@motion-canvas/vite-plugin';
import ffmpeg from '@motion-canvas/ffmpeg';
import path from 'path';

function forwardConsole(): Plugin {
  return {
    name: 'forward-console',
    configureServer(server) {
      server.middlewares.use('/__console', (req, res, next) => {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            const { type, args } = JSON.parse(body);
            const colors: Record<string, string> = {
              log: '\x1b[37m', // white
              warn: '\x1b[33m', // yellow
              error: '\x1b[31m', // red
              info: '\x1b[36m', // cyan
              debug: '\x1b[90m', // gray
            };
            const color = colors[type] || '\x1b[37m';
            console.log(`${color}[Browser ${type.toUpperCase()}]\x1b[0m`, ...args);
          } catch (e) {
              // ignore
          }
          res.end();
        });
      });
    },
    transformIndexHtml(html) {
      return html.replace(
        '<head>',
        `<head>
        <script>
          (function() {
            const originalConsole = {
              log: console.log,
              warn: console.warn,
              error: console.error,
              info: console.info,
              debug: console.debug,
            };

            function forward(type, args) {
              // Keep original behavior
              originalConsole[type].apply(console, args);
              
              // Forward to server
              // Use a simple safe stringify to avoid circular reference errors
              const safeArgs = args.map(arg => {
                try {
                    return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                } catch (e) {
                    return String(arg);
                }
              });

              fetch('/__console', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, args: safeArgs }),
              }).catch(() => {});
            }

            console.log = (...args) => forward('log', args);
            console.warn = (...args) => forward('warn', args);
            console.error = (...args) => forward('error', args);
            console.info = (...args) => forward('info', args);
            console.debug = (...args) => forward('debug', args);
            
            window.onerror = (message, source, lineno, colno, error) => {
              forward('error', [{ message, source, lineno, colno, stack: error?.stack }]);
            };
          })();
        </script>`
      );
    },
  };
}

export default defineConfig({
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      '@workspace': path.resolve(__dirname, './projects/math_la_001_lc_and_space'),
      '@ws': path.resolve(__dirname, './projects/math_la_001_lc_and_space'),
    },
  },
  plugins: [
    motionCanvas(),
    ffmpeg(),
    forwardConsole(),
  ],
});
