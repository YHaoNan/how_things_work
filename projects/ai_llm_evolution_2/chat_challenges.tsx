import { Layout, Rect, Txt } from "@motion-canvas/2d";
import { ThreadGenerator, all, createRef, easeOutCubic, sequence, waitFor } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";

export class ChatChallengesLayer extends AnimLayer {
  private card = createRef<Rect>();
  private items: ReturnType<typeof createRef<Txt>>[] = [];

  protected on_build_ui(): void {
    for (let i = 0; i < 4; i++) this.items.push(createRef<Txt>());

    const lines = [
      "1. 记忆：把聊天轨迹（或压缩）每轮重新发给模型",
      "2. 数据：蒸馏 / 通用数据集 / 引导 AI 自生成",
      "3. 对齐：限制行为 + 调偏好（InstructGPT / Alignment）",
      "4. 副作用：对齐增强时，其他能力可能衰减（MoT / Less Is More）",
    ];

    this.root.add(
      <Layout>
        <Rect width={1920} height={1080} fill={Colors.background} />

        <Rect
          ref={this.card}
          width={1600}
          height={820}
          fill={"#151515"}
          stroke={"#2a2a2a"}
          lineWidth={6}
          radius={30}
          opacity={0}
          scale={0.95}
        >
          <Txt
            text={"构建聊天产品的复杂性"}
            y={-340}
            fill={Colors.orange}
            fontFamily={"Arial, sans-serif"}
            fontSize={64}
          />

          {lines.map((t, i) => (
            <Txt
              ref={this.items[i]}
              key={`item-${i}`}
              text={t}
              x={-720}
              y={-170 + i * 120}
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
    yield* sequence(
      0.2,
      ...this.items.map((it) => it().opacity(1, 0.45)),
    );
    yield* waitFor(1.2);
  }
}
