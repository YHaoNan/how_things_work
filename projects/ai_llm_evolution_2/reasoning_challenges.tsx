import { Layout, Rect, Txt } from "@motion-canvas/2d";
import { ThreadGenerator, all, createRef, easeOutCubic, sequence, waitFor } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";

export class ReasoningChallengesLayer extends AnimLayer {
  private card = createRef<Rect>();
  private items: ReturnType<typeof createRef<Txt>>[] = [];

  protected on_build_ui(): void {
    for (let i = 0; i < 3; i++) this.items.push(createRef<Txt>());

    const lines = [
      "1. 训练数据：更长、更完整的思考轨迹往往更有效",
      "2. 轨迹生成：Orca（用强模型生成思考）/ 自动生成+验证",
      "3. 工程落地：把推理能力“稳定”地封装进产品体验",
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
            text={"构建“思考产品”的复杂性"}
            y={-310}
            fill={Colors.yellow}
            fontFamily={"Arial, sans-serif"}
            fontSize={64}
          />

          {lines.map((t, i) => (
            <Txt
              ref={this.items[i]}
              key={`item-${i}`}
              text={t}
              x={-720}
              y={-130 + i * 150}
              fill={"#ffffff"}
              fontFamily={"Arial, sans-serif"}
              fontSize={48}
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
    yield* waitFor(1.0);
  }
}
