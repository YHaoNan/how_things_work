import { Layout, Rect, Txt } from "@motion-canvas/2d";
import { ThreadGenerator, all, createRef, easeOutCubic, waitFor } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";

export class ReasoningRecommendationLayer extends AnimLayer {
  private card = createRef<Rect>();
  private videoCard = createRef<Rect>();

  protected on_build_ui(): void {
    this.root.add(
      <Layout>
        <Rect width={1920} height={1080} fill={Colors.background} />

        <Rect
          ref={this.card}
          width={1600}
          height={780}
          fill={"#151515"}
          stroke={"#2a2a2a"}
          lineWidth={6}
          radius={30}
          opacity={0}
          scale={0.95}
        >
          <Txt
            text={"推荐一个科普视频"}
            y={-320}
            fill={Colors.orange}
            fontFamily={"Arial, sans-serif"}
            fontSize={72}
          />

          <Rect
            ref={this.videoCard}
            width={1200}
            height={420}
            y={60}
            fill={"rgba(255,255,255,0.06)"}
            stroke={Colors.yellow}
            lineWidth={5}
            radius={28}
            opacity={0}
            scale={0.95}
          >
            <Rect width={520} height={300} x={-310} fill={"rgba(0,0,0,0.35)"} radius={22}>
              <Txt text={"▶"} fill={"#ffffff"} fontSize={140} opacity={0.85} />
            </Rect>
            <Txt
              text={"为什么大模型会【涌现】智能"}
              x={220}
              fill={"#ffffff"}
              fontFamily={"Arial, sans-serif"}
              fontSize={64}
            />
            <Txt
              text={"（强烈推荐）"}
              x={220}
              y={90}
              fill={Colors.yellow}
              fontFamily={"JetBrains Mono"}
              fontSize={42}
            />
          </Rect>
        </Rect>
      </Layout>
    );
  }

  protected *on_play(): ThreadGenerator {
    yield* all(this.card().opacity(1, 0.5), this.card().scale(1, 0.5, easeOutCubic));
    yield* all(this.videoCard().opacity(1, 0.6), this.videoCard().scale(1, 0.6, easeOutCubic));
    yield* waitFor(1.8);
  }
}
