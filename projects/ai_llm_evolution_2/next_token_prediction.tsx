import { Circle, Layout, Line, Rect, Txt } from "@motion-canvas/2d";
import {
  ThreadGenerator,
  all,
  createRef,
  createSignal,
  easeOutCubic,
  sequence,
  waitFor,
} from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";

export class NextTokenPredictionLayer extends AnimLayer {
  private sentence = createSignal("迪迦奥特曼昨天在");
  private sentenceTxt = createRef<Txt>();
  private modelGroup = createRef<Layout>();
  private flowDot = createRef<Circle>();
  private outTokenTxt = createRef<Txt>();

  protected on_build_ui(): void {
    const net = this.buildNet();
    this.root.add(
      <Layout>
        <Rect
          width={1920}
          height={1080}
          fill={Colors.background}
          radius={0}
          zIndex={-10}
        />

        <Txt
          ref={this.sentenceTxt}
          text={() => this.sentence()}
          x={0}
          y={-420}
          fill={"#ffffff"}
          fontFamily={"Arial, sans-serif"}
          fontSize={64}
          opacity={0}
        />

        <Layout ref={this.modelGroup} x={0} y={0} opacity={0} scale={0.9}>
          <Rect
            width={520}
            height={420}
            fill={"#202020"}
            stroke={Colors.green}
            lineWidth={6}
            radius={28}
          />
          <Layout y={-20}>{net}</Layout>
          <Txt
            text={"AI Model"}
            y={200}
            fill={Colors.green}
            fontFamily={"JetBrains Mono"}
            fontSize={44}
          />
        </Layout>

        <Line
          points={[
            [0, -240],
            [0, 240],
          ]}
          stroke={"#3a3a3a"}
          lineWidth={6}
          opacity={0.5}
          zIndex={-1}
        />

        <Circle
          ref={this.flowDot}
          x={0}
          y={-240}
          size={18}
          fill={Colors.yellow}
          opacity={0}
        />

        <Txt
          ref={this.outTokenTxt}
          text={""}
          x={0}
          y={360}
          fill={Colors.yellow}
          fontFamily={"JetBrains Mono"}
          fontSize={120}
          opacity={0}
          scale={0.8}
        />
      </Layout>
    );
  }

  private buildNet() {
    const cols = 5;
    const rows = 4;
    const width = 360;
    const height = 220;

    const nodes: any[] = [];
    const lines: any[] = [];

    const colSpacing = width / (cols - 1);
    const rowSpacing = height / (rows - 1);

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = c * colSpacing - width / 2;
        const y = r * rowSpacing - height / 2;

        if (c < cols - 1) {
          for (let r2 = 0; r2 < rows; r2++) {
            const y2 = r2 * rowSpacing - height / 2;
            lines.push(
              <Line
                points={[
                  [x, y],
                  [x + colSpacing, y2],
                ]}
                stroke={Colors.green}
                lineWidth={2}
                opacity={0.15}
              />
            );
          }
        }

        nodes.push(
          <Circle
            x={x}
            y={y}
            size={12}
            fill={Colors.green}
            opacity={0.7}
          />
        );
      }
    }

    return (
      <Layout>
        {lines}
        {nodes}
      </Layout>
    );
  }

  protected *on_play(): ThreadGenerator {
    yield* all(
      this.modelGroup().opacity(1, 0.6),
      this.modelGroup().scale(1, 0.6, easeOutCubic),
      this.sentenceTxt().opacity(1, 0.6),
    );

    const tokens = ["哪", "个", "频", "道", "播", "出", "？"];
    for (const t of tokens) {
      yield* this.predictToken(t);
      this.sentence(this.sentence() + t);
      yield* waitFor(0.2);
    }

    yield* all(this.outTokenTxt().opacity(0, 0.6), this.outTokenTxt().scale(0.7, 0.6));
    yield* waitFor(1.0);
  }

  private *predictToken(token: string): ThreadGenerator {
    this.outTokenTxt().text(token);
    this.outTokenTxt().opacity(0);
    this.outTokenTxt().scale(0.8);
    this.flowDot().opacity(1);
    this.flowDot().y(-240);

    yield* sequence(
      0,
      all(this.flowDot().y(240, 0.7, easeOutCubic)),
      all(
        this.outTokenTxt().opacity(1, 0.35),
        this.outTokenTxt().scale(1, 0.35, easeOutCubic),
      ),
    );

    yield* all(this.flowDot().opacity(0, 0.3), this.flowDot().y(-240, 0));
    yield* waitFor(0.25);
  }
}
