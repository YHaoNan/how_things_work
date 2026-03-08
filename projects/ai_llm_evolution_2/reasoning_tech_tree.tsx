import { Circle, Layout, Line, Txt } from "@motion-canvas/2d";
import { ThreadGenerator, all, createRef, easeOutCubic, sequence, waitFor } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";

export class ReasoningTechTreeLayer extends AnimLayer {
  private center = createRef<Layout>();
  private branches: { line: ReturnType<typeof createRef<Line>>; node: ReturnType<typeof createRef<Layout>> }[] = [];

  protected on_build_ui(): void {
    const specs = [
      { x: 0, y: -260, text: "CoT-SC (自洽)" },
      { x: 420, y: 0, text: "ToT (思维树)" },
      { x: 0, y: 260, text: "GoT (思维图)" },
      { x: -420, y: 0, text: "Few-Shot CoT" },
    ];

    this.branches = specs.map(() => ({
      line: createRef<Line>(),
      node: createRef<Layout>(),
    }));

    this.root.add(
      <Layout>
        <Circle size={2200} fill={Colors.background} />

        <Layout ref={this.center} opacity={0} scale={0.85}>
          <Circle size={220} fill={Colors.yellow} />
          <Txt
            text={"CoT\n(思维链)"}
            fill={"#101010"}
            fontFamily={"JetBrains Mono"}
            fontSize={46}
            lineHeight={56}
          />
        </Layout>

        {specs.map((s, i) => (
          <Line
            ref={this.branches[i].line}
            key={`line-${i}`}
            points={[
              [0, 0],
              [s.x * 0.62, s.y * 0.62],
            ]}
            stroke={"#3a3a3a"}
            lineWidth={10}
            radius={80}
            opacity={0}
            end={0}
          />
        ))}

        {specs.map((s, i) => (
          <Layout ref={this.branches[i].node} key={`node-${i}`} x={s.x} y={s.y} opacity={0} scale={0.85}>
            <Circle size={180} fill={Colors.green} />
            <Txt
              text={s.text}
              fill={"#101010"}
              fontFamily={"JetBrains Mono"}
              fontSize={30}
              lineHeight={40}
            />
          </Layout>
        ))}
      </Layout>
    );
  }

  protected *on_play(): ThreadGenerator {
    yield* all(this.center().opacity(1, 0.5), this.center().scale(1, 0.5, easeOutCubic));

    yield* sequence(
      0.1,
      ...this.branches.map(({ line, node }) =>
        all(
          line().opacity(1, 0.35),
          line().end(1, 0.45, easeOutCubic),
          node().opacity(1, 0.35),
          node().scale(1, 0.35, easeOutCubic),
        ),
      ),
    );

    yield* waitFor(1.2);
    yield* all(this.center().scale(1.06, 0.25, easeOutCubic), this.center().scale(1, 0.25, easeOutCubic));
    yield* waitFor(0.8);
  }
}
