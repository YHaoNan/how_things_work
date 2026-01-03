import { ThreadGenerator, waitFor, waitUntil } from "@motion-canvas/core";
import { Director } from "@src/common/director";
import mindMapData from "./mindmap.json";
import { TradeoffLayer } from "./tradeoff";
import { CheckerboardLayer } from "./checkerboard";
import { SuperResLayer } from "./superres";
import { DLSSLayer } from "./dlss";
import { FSRLayer } from "./fsr";
import audio from './audio.wav';
export { audio };

export function* program(director: Director): ThreadGenerator {
    // 1. Initialize MindMap
    const mindmap = director.useMindMap(mindMapData);
    
    // Initial presentation
    // 等待音频开始（或第一句台词开始）
    yield* waitUntil('start_intro'); 
    yield* mindmap.scale(2, 2);

    // Intro text "最近购买了一台NS2..." 
    // 等待前言说完，准备进入正题
    yield* waitUntil('end_intro');

    // Chapter 1: Tradeoff
    // "帧率&分辨率的权衡"
    yield* director.centerThenEnter(mindmap, 'tradeoff', TradeoffLayer);

    // Chapter 2: Checkerboard
    // "棋盘算法"
    // 等待上一节完全结束（音频标记）
    yield* waitUntil('start_checkerboard');
    yield* director.centerThenEnter(mindmap, 'checkerboard', CheckerboardLayer);

    // Chapter 3: Super Res Intro
    // "超分技术简要介绍"
    yield* waitUntil('start_superres');
    yield* director.centerThenEnter(mindmap, 'superres', SuperResLayer);

    // Chapter 4: DLSS
    // "DLSS"
    yield* waitUntil('start_dlss');
    yield* director.centerThenEnter(mindmap, 'dlss', DLSSLayer);

    // Chapter 5: FSR
    // "FSR"
    yield* waitUntil('start_fsr');
    yield* director.centerThenEnter(mindmap, 'fsr', FSRLayer);

    // Outro
    yield* waitUntil('start_outro');
    // Zoom out to show full map for summary
    yield* mindmap.centerOn('root');
    yield* mindmap.scale(1, 2);
    
    // 等待结束语说完，进入三连页面
    yield* waitUntil('end_video');
}
