import {usePlayback, useScene} from '@motion-canvas/core';
import {getOrCreateVisualTestBridge} from './visualTestBridge';

export type VisualTestPointOptions = {
  id?: string;
  check?: unknown;
};

export function testPoint(name: string, options: VisualTestPointOptions = {}) {
  const playback = usePlayback();
  const scene = useScene();
  const bridge = getOrCreateVisualTestBridge();
  bridge.upsertMarker({
    id: options.id,
    name,
    frame: playback.frame,
    time: playback.time,
    scene: scene.name,
    check: options.check,
  });
}
