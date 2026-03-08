import { Layout, Rect, Txt, Circle } from "@motion-canvas/2d";
import { ThreadGenerator, all, createRef, createSignal, easeOutCubic, waitFor } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";
import { typeText } from "./layer_utils";

export class ChatBaseModelLayer extends AnimLayer {
  private userText = createSignal("");
  private modelText = createSignal("");

  private card = createRef<Rect>();
  private userBubble = createRef<Rect>();
  private modelBubble = createRef<Rect>();

  protected on_build_ui(): void {
    this.root.add(
      <Layout>
        <Rect width={1920} height={1080} fill={Colors.background} />

        <Rect
          ref={this.card}
          width={1500}
          height={820}
          fill={"#151515"}
          stroke={"#2a2a2a"}
          lineWidth={6}
          radius={30}
          opacity={0}
          scale={0.95}
        >
          <Rect width={1500} height={90} y={-365} fill={"#0f0f0f"} radius={[30, 30, 0, 0]}>
            <Txt
              text={"Qwen/Qwen3-8B-Base"}
              x={-620}
              fill={Colors.green}
              fontFamily={"JetBrains Mono"}
              fontSize={40}
            />
          </Rect>

          <Layout x={-620} y={-220}>
            <Circle size={72} fill={Colors.yellow} />
            <Txt text={"You"} x={90} fill={"#ffffff"} fontFamily={"JetBrains Mono"} fontSize={32} />
          </Layout>

          <Rect
            ref={this.userBubble}
            x={-220}
            y={-180}
            width={1050}
            height={160}
            fill={"#202020"}
            stroke={Colors.yellow}
            lineWidth={3}
            radius={22}
            opacity={0}
          >
            <Txt
              text={() => this.userText()}
              fill={"#ffffff"}
              fontFamily={"Arial, sans-serif"}
              fontSize={46}
            />
          </Rect>

          <Layout x={-620} y={40}>
            <Circle size={72} fill={Colors.green} />
            <Txt text={"Model"} x={90} fill={"#ffffff"} fontFamily={"JetBrains Mono"} fontSize={32} />
          </Layout>

          <Rect
            ref={this.modelBubble}
            x={-220}
            y={80}
            width={1050}
            height={210}
            fill={"#1c2420"}
            stroke={Colors.green}
            lineWidth={3}
            radius={22}
            opacity={0}
          >
            <Txt
              text={() => this.modelText()}
              fill={"#ffffff"}
              fontFamily={"JetBrains Mono"}
              fontSize={44}
            />
          </Rect>
        </Rect>
      </Layout>
    );
  }

  protected *on_play(): ThreadGenerator {
    yield* all(this.card().opacity(1, 0.5), this.card().scale(1, 0.5, easeOutCubic));
    yield* this.userBubble().opacity(1, 0.3);
    yield* typeText(this.userText, "迪迦奥特曼昨天在", 0.9);

    yield* waitFor(0.3);

    yield* this.modelBubble().opacity(1, 0.3);
    yield* typeText(this.modelText, "迪迦奥特曼昨天在哪个频道播出？", 1.4);

    yield* waitFor(1.0);
  }
}
