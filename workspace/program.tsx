import { ThreadGenerator, waitFor } from "@motion-canvas/core";
import { Director } from "@src/common/director";
import mindMapData from "./mindmap.json";
import { TradeoffLayer } from "./tradeoffLayer";
import { CheckerboardLayer } from "./checkerboardLayer";

export function* program(director: Director): ThreadGenerator {
    // 1. Initialize MindMap
    const mindmap = director.useMindMap(mindMapData);
    
    // Initial presentation
    yield* waitFor(1);

    yield* mindmap.scale(2, 2);

    yield* waitFor(1);

    // Clip 1: Tradeoff
    // Node: "tradeoff" (性能权衡)
    yield* director.centerThenEnter(mindmap, 'tradeoff', TradeoffLayer);

    // Clip 2: Checkerboard
    // Node: "checkerboard" (棋盘渲染)
    yield* director.centerThenEnter(mindmap, 'checkerboard', CheckerboardLayer);

    yield* waitFor(1);


    yield* mindmap.scale(0.2, 2);
}
