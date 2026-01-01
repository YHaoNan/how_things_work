import {defineConfig} from 'vite';
import motionCanvas from '@motion-canvas/vite-plugin';
import ffmpeg from '@motion-canvas/ffmpeg';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      '@workspace': path.resolve(__dirname, './workspace'),
    },
  },
  plugins: [
    motionCanvas(),
    ffmpeg(),
  ],
});