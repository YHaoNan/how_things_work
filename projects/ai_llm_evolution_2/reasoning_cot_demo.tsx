import { Layout, Rect, Txt, Circle } from "@motion-canvas/2d";
import { ThreadGenerator, all, createRef, createSignal, easeOutCubic, waitFor } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";
import { typeText } from "./layer_utils";

export class ReasoningCoTDemoLayer extends AnimLayer {
  private badAnswer = createSignal("");
  private goodAnswer = createSignal("");

  private card = createRef<Rect>();
  private panel1 = createRef<Rect>();
  private panel2 = createRef<Rect>();

  protected on_build_ui(): void {
    this.root.add(
      <Layout>
        <Rect width={1920} height={1080} fill={Colors.background} />

        <Rect
          ref={this.card}
          width={1700}
          height={880}
          fill={"#151515"}
          stroke={"#2a2a2a"}
          lineWidth={6}
          radius={30}
          opacity={0}
          scale={0.95}
        >
          <Txt
            text={"Few-shot CoT：示例教会“思考”"}
            y={-370}
            fill={Colors.yellow}
            fontFamily={"Arial, sans-serif"}
            fontSize={60}
          />

          <Rect
            ref={this.panel1}
            width={1550}
            height={300}
            y={-160}
            fill={"#0f0f0f"}
            radius={24}
            opacity={0}
          >
            <Layout x={-680} y={-85}>
              <Circle size={66} fill={Colors.yellow} />
              <Txt text={"You"} x={90} fill={"#ffffff"} fontFamily={"JetBrains Mono"} fontSize={30} />
            </Layout>
            <Txt
              text={"如果兔子跑步速度为10km/h，乌龟比它慢10倍，乌龟跑步速度是多快？"}
              x={-520}
              y={-35}
              fill={"#cfcfcf"}
              fontFamily={"Arial, sans-serif"}
              fontSize={36}
            />
            <Layout x={-680} y={40}>
              <Circle size={66} fill={Colors.green} />
              <Txt text={"Model"} x={90} fill={"#ffffff"} fontFamily={"JetBrains Mono"} fontSize={30} />
            </Layout>
            <Txt
              text={() => this.badAnswer()}
              x={-520}
              y={90}
              fill={Colors.orange}
              fontFamily={"JetBrains Mono"}
              fontSize={54}
            />
          </Rect>

          <Rect
            ref={this.panel2}
            width={1550}
            height={430}
            y={190}
            fill={"#0f0f0f"}
            radius={24}
            opacity={0}
          >
            <Layout x={-680} y={-150}>
              <Circle size={66} fill={Colors.yellow} />
              <Txt text={"You"} x={90} fill={"#ffffff"} fontFamily={"JetBrains Mono"} fontSize={30} />
            </Layout>
            <Txt
              text={"如果小明比小红大2岁，小红今年8岁，5年后小明多大？"}
              x={-520}
              y={-120}
              fill={"#cfcfcf"}
              fontFamily={"Arial, sans-serif"}
              fontSize={34}
            />

            <Txt
              text={
                "思考：\n" +
                "小明比小红大2岁，小红今年8岁，那么小明今年就是8+2=10岁，\n" +
                "5年后，小明的年龄为10+5=15岁。"
              }
              x={-520}
              y={-20}
              fill={Colors.green}
              fontFamily={"JetBrains Mono"}
              fontSize={30}
              lineHeight={46}
            />

            <Txt
              text={"如果兔子跑步速度为10km/h，乌龟比它慢10倍，乌龟跑步速度是多快？"}
              x={-520}
              y={100}
              fill={"#cfcfcf"}
              fontFamily={"Arial, sans-serif"}
              fontSize={34}
            />

            <Layout x={-680} y={200}>
              <Circle size={66} fill={Colors.green} />
              <Txt text={"Model"} x={90} fill={"#ffffff"} fontFamily={"JetBrains Mono"} fontSize={30} />
            </Layout>
            <Txt
              text={() => this.goodAnswer()}
              x={-520}
              y={255}
              fill={Colors.yellow}
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

    yield* this.panel1().opacity(1, 0.35);
    yield* typeText(this.badAnswer, "21(❌)", 0.7);
    yield* waitFor(0.9);

    yield* all(this.panel1().opacity(0.25, 0.4), this.panel2().opacity(1, 0.45));
    yield* typeText(this.goodAnswer, "10/10=1，所以乌龟跑步速度是 1km/h (✅)", 1.6);
    yield* waitFor(1.0);
  }
}
