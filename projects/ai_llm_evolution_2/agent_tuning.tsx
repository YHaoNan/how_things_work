import { Layout, Rect, Txt } from "@motion-canvas/2d";
import { ThreadGenerator, all, createRef, createSignal, easeInOutCubic, easeOutCubic, sequence, waitFor } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";

export class AgentTuningLayer extends AnimLayer {
  private model = createRef<Rect>();
  private tags: ReturnType<typeof createRef<Rect>>[] = [];
  private tagTexts = Array.from({length: 6}, () => createSignal(""));
  private title = createSignal("轨迹训练：把工具使用内化到模型里");

  protected on_build_ui(): void {
    for (let i = 0; i < 6; i++) this.tags.push(createRef<Rect>());

    this.root.add(
      <Layout>
        <Rect width={1920} height={1080} fill={Colors.background} />

        <Txt
          text={() => this.title()}
          y={-420}
          fill={Colors.orange}
          fontFamily={"Arial, sans-serif"}
          fontSize={60}
        />

        <Rect
          ref={this.model}
          x={420}
          width={820}
          height={520}
          fill={"#202020"}
          stroke={Colors.green}
          lineWidth={6}
          radius={30}
        >
          <Txt text={"Model"} y={-200} fill={Colors.green} fontFamily={"JetBrains Mono"} fontSize={56} />
          <Rect y={40} width={680} height={280} fill={"rgba(0,0,0,0.25)"} radius={22}>
            <Txt text={"…"} fill={"#ffffff"} fontFamily={"JetBrains Mono"} fontSize={96} opacity={0.25} />
          </Rect>
        </Rect>

        {this.tags.map((r, i) => (
          <Rect
            ref={r}
            key={`tag-${i}`}
            x={-520}
            y={-240 + i * 92}
            width={700}
            height={70}
            fill={"rgba(97,194,140,0.14)"}
            stroke={Colors.green}
            lineWidth={3}
            radius={18}
            opacity={0}
          >
            <Txt
              text={() => this.tagTexts[i]()}
              fill={"#ffffff"}
              fontFamily={"JetBrains Mono"}
              fontSize={34}
            />
          </Rect>
        ))}
      </Layout>
    );
  }

  protected *on_play(): ThreadGenerator {
    const samples = [
      "思考：用户要…我需要调用工具",
      "行动：{\"action\":\"read_file\",...}",
      "观察：read_file 返回内容…",
      "思考：下一步…",
      "行动：{\"action\":\"write_file\",...}",
      "观察：write_file 返回 OK",
    ];

    for (let i = 0; i < this.tags.length; i++) {
      const tag = this.tags[i]();
      tag.opacity(0);
      tag.x(-520);
      this.tagTexts[i](samples[i]);

      yield* all(tag.opacity(1, 0.2), tag.x(-40, 0.55, easeOutCubic));
      yield* all(this.model().stroke(Colors.yellow, 0.15), waitFor(0));
      yield* this.model().stroke(Colors.green, 0.25);
      yield* all(tag.opacity(0, 0.22), tag.x(180, 0.22, easeInOutCubic));
      yield* waitFor(0.08);
    }

    yield* waitFor(1.2);
  }
}
