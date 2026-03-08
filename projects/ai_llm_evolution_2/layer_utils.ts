import { SimpleSignal, ThreadGenerator, map, tween } from "@motion-canvas/core";

export function* typeText(
  target: SimpleSignal<string, void>,
  fullText: string,
  duration: number,
): ThreadGenerator {
  const safeDuration = Math.max(0.01, duration);
  yield* tween(safeDuration, (value) => {
    const count = Math.floor(map(0, fullText.length, value));
    target(fullText.slice(0, Math.max(0, Math.min(fullText.length, count))));
  });
  target(fullText);
}
