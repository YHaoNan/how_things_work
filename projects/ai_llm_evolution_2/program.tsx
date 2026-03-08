import { ThreadGenerator, waitFor, waitUntil } from "@motion-canvas/core";
import { Director } from "@src/common/director";
import mindMapData from "./mindmap.json";
import audioData from "./audio.mp3";
import { NextTokenPredictionLayer } from "./next_token_prediction";
import { CapabilityExpansionLayer } from "./capability_expansion";
import { ChatDeepSeekLayer } from "./chat_deepseek";
import { ChatBaseModelLayer } from "./chat_base_model";
import { ChatFewShotLayer } from "./chat_fewshot";
import { ChatDataInjectionLayer } from "./chat_data_injection";
import { ChatChallengesLayer } from "./chat_challenges";
import { ReasoningCoTDemoLayer } from "./reasoning_cot_demo";
import { ReasoningTechTreeLayer } from "./reasoning_tech_tree";
import { ReasoningChallengesLayer } from "./reasoning_challenges";
import { ReasoningRecommendationLayer } from "./reasoning_recommendation";
import { AgentReActFlowLayer } from "./agent_react_flow";
import { AgentTuningLayer } from "./agent_tuning";
import { AgentChallengesLayer } from "./agent_challenges";

export const audio = audioData;

export function* program(director: Director): ThreadGenerator {
  const mindmap = director.useMindMap(mindMapData);

  yield* director.playLayer(NextTokenPredictionLayer);
  yield* director.playLayer(CapabilityExpansionLayer);

  yield* waitUntil("start_chat_section");
  yield* director.centerThenEnter(mindmap, "chat_deepseek", ChatDeepSeekLayer);
  yield* director.centerThenEnter(mindmap, "chat_base_model", ChatBaseModelLayer);
  yield* director.centerThenEnter(mindmap, "chat_few_shot", ChatFewShotLayer);
  yield* director.centerThenEnter(mindmap, "chat_data_injection", ChatDataInjectionLayer);
  yield* director.centerThenEnter(mindmap, "chat_challenges", ChatChallengesLayer);

  yield* waitUntil("start_reasoning_section");
  yield* director.centerThenEnter(mindmap, "reasoning_cot_demo", ReasoningCoTDemoLayer);
  yield* director.centerThenEnter(mindmap, "reasoning_tech_tree", ReasoningTechTreeLayer);
  yield* director.centerThenEnter(mindmap, "reasoning_challenges", ReasoningChallengesLayer);
  yield* director.centerThenEnter(mindmap, "reasoning_recommendation", ReasoningRecommendationLayer);

  yield* waitUntil("start_agent_section");
  yield* director.centerThenEnter(mindmap, "agent_react_flow", AgentReActFlowLayer);
  yield* director.centerThenEnter(mindmap, "agent_tuning", AgentTuningLayer);
  yield* director.centerThenEnter(mindmap, "agent_challenges", AgentChallengesLayer);

  yield* waitFor(1);
}
