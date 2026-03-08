import { ThreadGenerator, waitFor } from "@motion-canvas/core";
import { Director } from "@src/common/director";
import mindMapData from "./mindmap.json";
import audio from './audio.wav';
import { IntroLayer } from "./intro";
import { TradeoffLayer } from "./tradeoff";
import { CheckerboardLayer } from "./checkerboard";
import { SuperResLayer } from "./superres";
import { DLSSLayer } from "./dlss";
import { FSRLayer } from "./fsr";
import { ConclusionLayer } from "./conclusion";

export { audio };

export function* program(director: Director): ThreadGenerator {
    const mindmap = director.useMindMap(mindMapData);

    // 1. Intro Animation
    yield* director.playLayer(IntroLayer);
    
    // 2. Mindmap Entry
    yield* waitFor(1);
    yield* mindmap.scale(2, 2);
    
    // 3. Tradeoff
    yield* director.centerThenEnter(mindmap, 'tradeoff', TradeoffLayer);
    
    // 4. Checkerboard
    yield* director.centerThenEnter(mindmap, 'checkerboard', CheckerboardLayer);
    
    // 5. Super Res Definition
    yield* director.centerThenEnter(mindmap, 'superres', SuperResLayer);
    
    // 6. DLSS
    yield* director.centerThenEnter(mindmap, 'dlss', DLSSLayer);
    
    // 7. FSR
    yield* director.centerThenEnter(mindmap, 'fsr', FSRLayer);

    // 8. Conclusion
    yield* director.playLayer(ConclusionLayer);
    yield* waitFor(1);
    yield* mindmap.scale(0.5, 2); // Zoom out to show full map at end
}
