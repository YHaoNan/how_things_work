import { ThreadGenerator, waitFor } from "@motion-canvas/core";
import { Director } from "@src/common/director";
import mindMapData from "./mindmap.json";
import { IntroNextTokenLayer } from "./intro_next_token";
import { ChatLayer } from "./chat";
import { ThinkingLayer } from "./thinking";
import { AgentLayer } from "./agent";
import audioData from "./audio.mp3";

export const audio = audioData;

export function* program(director: Director): ThreadGenerator {
    const mindmap = director.useMindMap(mindMapData);
    
    // Initial presentation (Next Token Prediction -> Evolution)
    yield* director.playLayer(IntroNextTokenLayer);

    yield* waitFor(1);
    
    // Transition to MindMap
    yield* mindmap.scale(2, 2);

    // Chat Capability
    yield* director.centerThenEnter(mindmap, 'chat', ChatLayer);

    // Thinking Capability
    yield* director.centerThenEnter(mindmap, 'think', ThinkingLayer);

    // Agent Capability
    yield* director.centerThenEnter(mindmap, 'agent', AgentLayer);
}
