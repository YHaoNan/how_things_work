import { ThreadGenerator, waitFor, waitUntil, all } from "@motion-canvas/core";
import { Director } from "@src/common/director";
import { AnimLayer } from "@src/common/animLayer";
import { Rect } from "@motion-canvas/2d/lib/components";
import { createRef } from "@motion-canvas/core/lib/utils";
import { Vector2 } from "@motion-canvas/core/lib/types";
import { easeInOutCubic } from "@motion-canvas/core/lib/tweening";
import audioData from "@ws/audio.mp3";
import { Colors } from "@src/common/colors";

// Layers
import { LinearEquationLayer } from "./LinearEquationLayer";
import { MatrixEquationLayer } from "./MatrixEquationLayer";
import { GaussianEliminationLayer } from "./GaussianEliminationLayer";
import { SolveSubstitutionLayer } from "./SolveSubstitutionLayer";
import { GaussianElimination3DLayer } from "./GaussianElimination3DLayer";
import { ElementaryMatrixLayer } from "./ElementaryMatrixLayer";
import { InverseMatrixLayer } from "./InverseMatrixLayer";

export const audio = audioData;

export function* program(director: Director): ThreadGenerator {
    yield* director.playLayer(LinearEquationLayer);
    yield* director.playLayer(MatrixEquationLayer);
    yield* director.playLayer(GaussianEliminationLayer);
    yield* director.playLayer(SolveSubstitutionLayer);
    yield* director.playLayer(GaussianElimination3DLayer);
    yield* director.playLayer(ElementaryMatrixLayer);
    yield* director.playLayer(InverseMatrixLayer);
}
