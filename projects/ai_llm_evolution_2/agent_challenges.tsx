import { Layout, Rect, Txt } from "@motion-canvas/2d";
import { ThreadGenerator, all, createRef, easeOutCubic, sequence, waitFor } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";

export class AgentChallengesLayer extends AnimLayer {
  private card = createRef<Rect>();
  private items: ReturnType<typeof createRef<Txt>>[] = [];

  protected on_build_ui(): void {
    for (let i = 0; i < 3; i++) this.items.push(createRef<Txt>());

    const lines = [
      "1. 交互协议：ReAct / Focused ReAct；框架如何驱动工具调用",
      "2. 轨迹表达：真实任务有延迟与复杂结构，统一格式有训练收益",
      "3. 数据收集：任务轨迹比聊天更难，自动化生成/执行/校验更关键",
    ];

    this.root.add(
      <Layout>
        <Rect width={1920} height={1080} fill={Colors.background} />

        <Rect
          ref={this.card}
          width={1600}
          height={760}
          fill={"#151515"}
          stroke={"#2a2a2a"}
          lineWidth={6}
          radius={30}
          opacity={0}
          scale={0.95}
        >
          <Txt
            text={"构建 Agent 产品的复杂性"}
            y={-310}
            fill={Colors.green}
            fontFamily={"Arial, sans-serif"}
            fontSize={64}
          />

          {lines.map((t, i) => (
            <Txt
              ref={this.items[i]}
              key={`item-${i}`}
              text={t}
              x={-720}
              y={-130 + i * 160}
              fill={"#ffffff"}
              fontFamily={"Arial, sans-serif"}
              fontSize={44}
              opacity={0}
            />
          ))}
        </Rect>
      </Layout>
    );
  }

  protected *on_play(): ThreadGenerator {
    yield* all(this.card().opacity(1, 0.5), this.card().scale(1, 0.5, easeOutCubic));
    yield* waitFor(0.2);
    yield* sequence(0.25, ...this.items.map((t) => t().opacity(1, 0.45)));
    yield* waitFor(1.1);
  }
}
