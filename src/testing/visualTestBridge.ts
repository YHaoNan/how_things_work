import type {Player} from '@motion-canvas/core';

export type VisualTestMarker = {
  id: string;
  name: string;
  frame: number;
  time: number;
  scene?: string;
  check?: unknown;
};

export type VisualTestMarkerInput = Omit<VisualTestMarker, 'id'> & {id?: string};

export type VisualTestBridge = {
  version: 1;
  listMarkers: () => VisualTestMarker[];
  upsertMarker: (marker: VisualTestMarkerInput) => VisualTestMarker;
  clearMarkers: () => void;
  attachPlayer: (player: Player) => void;
  detachPlayer: () => void;

  pause: () => void;
  play: () => void;
  setSpeed: (speed: number) => void;
  seekFrame: (frame: number) => Promise<void>;
  seekTime: (seconds: number) => Promise<void>;
  goto: (idOrName: string) => Promise<void>;
  capture: () => Promise<string | null>;
};

const GLOBAL_KEY = '__MC_VISUAL_TEST__';

function getGlobal(): any {
  return globalThis as any;
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function stableHash(text: string) {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 33) ^ text.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

function ensureId(name: string, frame: number, explicit?: string) {
  if (explicit && explicit.trim()) return explicit.trim();
  return `vt_${stableHash(name)}_${frame}`;
}

function normalizeKey(input: string) {
  const trimmed = input.trim();
  if (trimmed.length >= 2) {
    const first = trimmed[0];
    const last = trimmed[trimmed.length - 1];
    const isQuoted = (first === '"' || first === "'" || first === '`') && first === last;
    if (isQuoted) return trimmed.slice(1, -1);
  }
  return trimmed;
}

function findCanvasElement(): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.querySelector('canvas');
  return canvas instanceof HTMLCanvasElement ? canvas : null;
}

export function getOrCreateVisualTestBridge(): VisualTestBridge {
  const g = getGlobal();
  const existing = g[GLOBAL_KEY] as VisualTestBridge | undefined;
  if (existing) return existing;

  const markerMap = new Map<string, VisualTestMarker>();
  let player: Player | null = null;

  const bridge: VisualTestBridge = {
    version: 1,
    listMarkers() {
      return Array.from(markerMap.values()).sort((a, b) => a.frame - b.frame);
    },
    upsertMarker(input) {
      const id = ensureId(input.name, input.frame, input.id);
      const key = `${input.scene ?? ''}::${id}`;
      const marker: VisualTestMarker = {
        id,
        name: input.name,
        frame: input.frame,
        time: input.time,
        scene: input.scene,
        check: input.check,
      };
      markerMap.set(key, marker);
      return marker;
    },
    clearMarkers() {
      markerMap.clear();
    },
    attachPlayer(nextPlayer) {
      player = nextPlayer;
      (g as any).motionMarkers = bridge;
    },
    detachPlayer() {
      player = null;
    },

    pause() {
      player?.togglePlayback(false);
    },
    play() {
      player?.togglePlayback(true);
    },
    setSpeed(speed) {
      if (!player) return;
      const safeSpeed = clampNumber(speed, 0, 64);
      player.setSpeed(safeSpeed);
    },
    async seekFrame(frame) {
      if (!player) return;
      const requested = Math.max(0, Math.floor(frame));
      const target = player.clampRange(requested);
      player.togglePlayback(false);
      if (player.status.frame === target) {
        player.requestRender();
        return;
      }
      await new Promise<void>((resolve) => {
        const unsubscribe = player!.onFrameChanged.subscribe((current) => {
          if (current === target) {
            unsubscribe();
            resolve();
          }
        });
        player!.requestSeek(target);
        player!.requestRender();
      });
    },
    async seekTime(seconds) {
      if (!player) return;
      const fps = player.status.fps;
      const frame = player.status.secondsToFrames(seconds);
      if (!Number.isFinite(fps)) return;
      await bridge.seekFrame(frame);
    },
    async goto(idOrName) {
      const key = normalizeKey(idOrName);
      const markers = bridge.listMarkers();
      const byId = markers.find((m) => m.id === key);
      const byName = markers.find((m) => m.name === key);
      const target = byId ?? byName;
      if (!target) return;
      await bridge.seekFrame(target.frame);
    },
    async capture() {
      const canvas = findCanvasElement();
      if (!canvas) return null;
      try {
        return canvas.toDataURL('image/png');
      } catch {
        return null;
      }
    },
  };

  g[GLOBAL_KEY] = bridge;
  return bridge;
}
