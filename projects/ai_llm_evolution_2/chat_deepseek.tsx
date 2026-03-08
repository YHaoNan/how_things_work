import { Layout, Rect, Txt, Circle } from "@motion-canvas/2d";
import { ThreadGenerator, all, createRef, createSignal, easeOutCubic, sequence, waitFor } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";
import { typeText } from "./layer_utils";

export class ChatDeepSeekLayer extends AnimLayer {
  private userText = createSignal("");
  private aiText = createSignal("");

  private card = createRef<Rect>();
  private userBubble = createRef<Rect>();
  private aiBubble = createRef<Rect>();
  private suggestionBox = createRef<Rect>();
  private s1 = createRef<Txt>();
  private s2 = createRef<Txt>();
  private s3 = createRef<Txt>();

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
              text={"DeepSeek Chat WebUI"}
              x={-620}
              fill={Colors.orange}
              fontFamily={"JetBrains Mono"}
              fontSize={44}
            />
          </Rect>

          <Layout x={-620} y={-200}>
            <Circle size={72} fill={Colors.yellow} />
            <Txt text={"You"} x={90} fill={"#ffffff"} fontFamily={"JetBrains Mono"} fontSize={32} />
          </Layout>

          <Rect
            ref={this.userBubble}
            x={-220}
            y={-160}
            width={1050}
            height={140}
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

          <Layout x={-620} y={20}>
            <Circle size={72} fill={Colors.green} />
            <Txt text={"AI"} x={90} fill={"#ffffff"} fontFamily={"JetBrains Mono"} fontSize={32} />
          </Layout>

          <Rect
            ref={this.aiBubble}
            x={-220}
            y={60}
            width={1050}
            height={140}
            fill={"#1c2420"}
            stroke={Colors.green}
            lineWidth={3}
            radius={22}
            opacity={0}
          >
            <Txt
              text={() => this.aiText()}
              fill={"#ffffff"}
              fontFamily={"Arial, sans-serif"}
              fontSize={44}
            />
          </Rect>

          <Rect
            ref={this.suggestionBox}
            x={-220}
            y={260}
            width={1050}
            height={260}
            fill={"rgba(255,255,255,0.04)"}
            stroke={"#3a3a3a"}
            lineWidth={3}
            radius={22}
            opacity={0}
          >
            <Txt
              text={"关于迪迦奥特曼，我猜你可能是想问类似这样的问题："}
              x={-480}
              y={-90}
              fill={"#cfcfcf"}
              fontFamily={"Arial, sans-serif"}
              fontSize={34}
            />
            <Txt
              ref={this.s1}
              text={"• 迪迦奥特曼昨天在哪里出现了？"}
              x={-480}
              y={-20}
              fill={"#ffffff"}
              fontFamily={"Arial, sans-serif"}
              fontSize={38}
              opacity={0}
            />
            <Txt
              ref={this.s2}
              text={"• 迪迦奥特曼的剧情里昨天发生了什么？"}
              x={-480}
              y={50}
              fill={"#ffffff"}
              fontFamily={"Arial, sans-serif"}
              fontSize={38}
              opacity={0}
            />
            <Txt
              ref={this.s3}
              text={"• 迪迦奥特曼相关的新闻或活动？"}
              x={-480}
              y={120}
              fill={"#ffffff"}
              fontFamily={"Arial, sans-serif"}
              fontSize={38}
              opacity={0}
            />
          </Rect>
        </Rect>
      </Layout>
    );
  }

  protected *on_play(): ThreadGenerator {
    yield* all(this.card().opacity(1, 0.5), this.card().scale(1, 0.5, easeOutCubic));

    yield* all(this.userBubble().opacity(1, 0.3));
    yield* typeText(this.userText, "迪迦奥特曼昨天在", 1.0);

    yield* waitFor(0.4);

    yield* all(this.aiBubble().opacity(1, 0.3));
    yield* typeText(this.aiText, "看起来你的句子还没写完呢", 1.1);

    yield* waitFor(0.5);
    yield* this.suggestionBox().opacity(1, 0.4);

    yield* sequence(
      0.18,
      this.s1().opacity(1, 0.35),
      this.s2().opacity(1, 0.35),
      this.s3().opacity(1, 0.35),
    );

    yield* waitFor(1.2);
  }
}
