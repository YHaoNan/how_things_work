import { ThreadGenerator, waitFor } from "@motion-canvas/core";
import { Director } from "@src/common/director";
import { IntroLayer } from "./intro";
import { VectorIntroLayer } from "./vector";
import { VectorSpaceLayer } from "./vectorSpace";
import { VectorSpanLayer } from "./vectorSpan";
import { VectorSpanLineLayer } from "./vectorSpanLine";
// import { MatrixColumnSpaceLayer } from "./matrixColumnSpace";
// import { MatrixRowSpaceLayer } from "./matrixRowSpace";
import { MatrixSpaceLayer } from "./matrixSpace";
import { MatrixApplicationLayer } from "./matrixApplication";
import audio from "./audio.wav";

export { audio };

export function* program(director: Director): ThreadGenerator {
    yield* director.playLayer(IntroLayer);
    yield* director.playLayer(VectorIntroLayer);
    yield* director.playLayer(VectorSpaceLayer);
    yield* director.playLayer(VectorSpanLayer);
    yield* director.playLayer(VectorSpanLineLayer);
    // yield* director.playLayer(MatrixColumnSpaceLayer);
    // yield* director.playLayer(MatrixRowSpaceLayer);
    yield* director.playLayer(MatrixSpaceLayer);
    yield* director.playLayer(MatrixApplicationLayer);
}
