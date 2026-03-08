import { Layout, Rect, Txt } from "@motion-canvas/2d";
import { ThreadGenerator, all, createRef, createSignal, easeOutCubic, waitFor } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";
import { typeText } from "./layer_utils";

export class ChatFewShotLayer extends AnimLayer {
  private reply = createSignal("");

  private card = createRef<Rect>();
  private replyBox = createRef<Rect>();
  private highlight = createRef<Rect>();

  protected on_build_ui(): void {
    this.root.add(
      <Layout>
        <Rect width={1920} height={1080} fill={Colors.background} />

        <Rect
          ref={this.card}
          width={1600}
          height={860}
          fill={"#151515"}
          stroke={"#2a2a2a"}
          lineWidth={6}
          radius={30}
          opacity={0}
          scale={0.95}
        >
          <Txt
            text={"提示词把模型“扭转”到对话续写模式"}
            y={-360}
            fill={Colors.yellow}
            fontFamily={"Arial, sans-serif"}
            fontSize={46}
          />

          <Rect width={1450} height={380} y={-90} fill={"#0f0f0f"} radius={22}>
            <Txt
              text={
                "用户: java是什么？  助手：一门跨平台的编程语言\n" +
                "用户: 昨天  助手：你好像输入了一段不完整的话\n" +
                "用户: 迪迦奥特曼昨天在"
              }
              x={-660}
              y={-120}
              fill={"#cfcfcf"}
              fontFamily={"JetBrains Mono"}
              fontSize={34}
              lineHeight={52}
            />
            <Rect
              ref={this.highlight}
              x={-40}
              y={92}
              width={1320}
              height={66}
              fill={"rgba(237,150,79,0.18)"}
              stroke={Colors.orange}
              lineWidth={2}
              radius={14}
              opacity={0}
            />
          </Rect>

          <Rect
            ref={this.replyBox}
            width={1450}
            height={220}
            y={300}
            fill={"#1c2420"}
            stroke={Colors.green}
            lineWidth={3}
            radius={22}
            opacity={0}
          >
            <Txt
              text={() => this.reply()}
              x={-660}
              fill={"#ffffff"}
              fontFamily={"Arial, sans-serif"}
              fontSize={44}
            />
          </Rect>
        </Rect>
      </Layout>
    );
  }

  protected *on_play(): ThreadGenerator {
    yield* all(this.card().opacity(1, 0.5), this.card().scale(1, 0.5, easeOutCubic));
    yield* waitFor(0.4);
    yield* this.highlight().opacity(1, 0.35);
    yield* waitFor(0.3);

    yield* this.replyBox().opacity(1, 0.35);
    yield* typeText(this.reply, "你好像输入了一段不完整的话", 1.0);
    yield* waitFor(1.0);
  }
}
