import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

class FFmpegManager {
  private static instance: FFmpegManager;
  private ffmpeg: FFmpeg | null = null;
  private loaded = false;
  private isLoading = false;

  private constructor() {}

  static getInstance(): FFmpegManager {
    if (!FFmpegManager.instance) {
      FFmpegManager.instance = new FFmpegManager();
    }
    return FFmpegManager.instance;
  }

  async getFFmpeg(onProgress?: (progress: number) => void): Promise<FFmpeg> {
    if (!this.ffmpeg) {
      this.ffmpeg = new FFmpeg();
    }

    if (onProgress) {
      // Remove all previous progress listeners to avoid memory leaks or multiple calls
      this.ffmpeg.off('progress', () => {});
      this.ffmpeg.on('progress', ({ progress }) => {
        // FFmpeg reports progress from 0 to 1
        onProgress(Math.min(100, Math.max(0, progress * 100)));
      });
    }

    if (!this.loaded && !this.isLoading) {
      this.isLoading = true;
      try {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        await this.ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        this.loaded = true;
      } catch (e) {
        console.error("FFmpeg load failed", e);
        throw new Error("Gagal memuat engine pemrosesan video/audio. Periksa koneksi internet.");
      } finally {
        this.isLoading = false;
      }
    }

    // Wait if it's currently loading
    while (this.isLoading) {
      await new Promise(r => setTimeout(r, 100));
    }

    return this.ffmpeg;
  }

  async cleanup(): Promise<void> {
    if (this.ffmpeg) {
      try {
        this.ffmpeg.terminate();
      } catch (e) {}
      this.ffmpeg = null;
      this.loaded = false;
      this.isLoading = false;
    }
  }
}

export const ffmpegManager = FFmpegManager.getInstance();
