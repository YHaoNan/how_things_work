import { ThreadGenerator, waitFor } from "@motion-canvas/core";
import { Director } from "@src/common/director";
import audioData from "./audio.mp3";
import { ThreeBasicLayer } from "./three_basic";
import { EliminationLayer } from "./elimination";
import { RotationLayer } from "./vector_rotation";

export const audio = audioData;

export function* program(director: Director): ThreadGenerator {
  yield* director.playLayer(RotationLayer);

  yield* waitFor(1);
}
