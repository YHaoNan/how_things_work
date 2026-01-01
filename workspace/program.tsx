import { ThreadGenerator, waitFor } from "@motion-canvas/core";
import { Director } from "@src/common/director";
import mindMapData from "./mindmap.json";
import { TradeoffLayer } from "./tradeoff";
import { CheckerboardLayer } from "./checkerboard";
import { SuperResLayer } from "./superres";
import { DLSSLayer } from "./dlss";
import { FSRLayer } from "./fsr";

export function* program(director: Director): ThreadGenerator {
    // 1. Initialize MindMap
    const mindmap = director.useMindMap(mindMapData);
    
    // Initial presentation
    yield* waitFor(1);

    yield* mindmap.scale(2, 2);

    // Intro text "最近购买了一台NS2..." - we stay on root or zoom to tradeoff?
    // User instruction: "思维导图进入，等待2s后进入帧率&分辨率的权衡"
    yield* waitFor(2);

    // Chapter 1: Tradeoff
    // "帧率&分辨率的权衡" -> node 'tradeoff'
    yield* director.centerThenEnter(mindmap, 'tradeoff', TradeoffLayer);

    // Chapter 2: Checkerboard
    // "棋盘算法" -> node 'checkerboard'
    // User instruction: "思维导图切换至棋盘算法"
    yield* director.centerThenEnter(mindmap, 'checkerboard', CheckerboardLayer);

    // Chapter 3: Super Res Intro
    // "超分技术简要介绍" -> node 'superres'
    // Text: "看过了棋盘算法... 引入... 超分技术"
    yield* director.centerThenEnter(mindmap, 'superres', SuperResLayer);

    // Chapter 4: DLSS
    // "DLSS" -> node 'dlss'
    yield* director.centerThenEnter(mindmap, 'dlss', DLSSLayer);

    // Chapter 5: FSR
    // "FSR" -> node 'fsr'
    yield* director.centerThenEnter(mindmap, 'fsr', FSRLayer);

    yield* waitFor(1);

    // Outro
    // Zoom out to show full map
    yield* mindmap.centerOn('root');
    yield* mindmap.scale(1, 2);
    
    yield* waitFor(2);
}
