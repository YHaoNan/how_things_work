import { Layout, Line, Rect, Txt } from "@motion-canvas/2d";
import { ThreadGenerator, all, createRef, createSignal, easeOutCubic, sequence, waitFor } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";
import { typeText } from "./layer_utils";

export class AgentReActFlowLayer extends AnimLayer {
  private think = createSignal("");
  private act = createSignal("");
  private observe = createSignal("");

  private ui = createRef<Rect>();
  private ai = createRef<Rect>();
  private tool = createRef<Rect>();
  private loopArrow = createRef<Line>();

  protected on_build_ui(): void {
    this.root.add(
      <Layout>
        <Rect width={1920} height={1080} fill={Colors.background} />

        <Rect
          ref={this.ui}
          x={-620}
          width={620}
          height={760}
          fill={"#151515"}
          stroke={"#2a2a2a"}
          lineWidth={6}
          radius={28}
          opacity={0}
          scale={0.95}
        >
          <Txt text={"User"} y={-320} fill={Colors.yellow} fontFamily={"JetBrains Mono"} fontSize={44} />
          <Rect y={-140} width={520} height={160} fill={"#202020"} radius={22} stroke={Colors.yellow} lineWidth={3}>
            <Txt
              text={"请帮我编写一个小程序输出爱心…"}
              fill={"#ffffff"}
              fontFamily={"Arial, sans-serif"}
              fontSize={40}
            />
          </Rect>
        </Rect>

        <Rect
          ref={this.ai}
          x={420}
          y={-40}
          width={620}
          height={560}
          fill={"#202020"}
          stroke={Colors.green}
          lineWidth={6}
          radius={28}
          opacity={0}
          scale={0.95}
        >
          <Txt text={"AI Model"} y={-220} fill={Colors.green} fontFamily={"JetBrains Mono"} fontSize={48} />

          <Rect y={-60} width={540} height={120} fill={"rgba(255,255,255,0.05)"} radius={18} opacity={1}>
            <Txt
              text={() => this.think()}
              x={-250}
              fill={"#ffffff"}
              fontFamily={"JetBrains Mono"}
              fontSize={28}
            />
          </Rect>
          <Rect y={80} width={540} height={120} fill={"rgba(255,255,255,0.05)"} radius={18} opacity={1}>
            <Txt
              text={() => this.act()}
              x={-250}
              fill={"#ffffff"}
              fontFamily={"JetBrains Mono"}
              fontSize={28}
            />
          </Rect>
          <Rect y={220} width={540} height={120} fill={"rgba(255,255,255,0.05)"} radius={18} opacity={1}>
            <Txt
              text={() => this.observe()}
              x={-250}
              fill={"#ffffff"}
              fontFamily={"JetBrains Mono"}
              fontSize={28}
            />
          </Rect>
        </Rect>

        <Rect
          ref={this.tool}
          y={420}
          width={1500}
          height={220}
          fill={"#0f0f0f"}
          stroke={"#2a2a2a"}
          lineWidth={6}
          radius={28}
          opacity={0}
          scale={0.98}
        >
          <Txt text={"Framework / Tools"} y={-65} fill={Colors.orange} fontFamily={"JetBrains Mono"} fontSize={44} />
          <Txt
            text={"执行 write_file(...) → 返回 OK"}
            y={40}
            fill={"#cfcfcf"}
            fontFamily={"JetBrains Mono"}
            fontSize={36}
          />
        </Rect>

        <Line
          ref={this.loopArrow}
          points={[
            [420, 250],
            [420, 360],
            [0, 360],
            [0, 180],
          ]}
          stroke={"#3a3a3a"}
          lineWidth={8}
          radius={60}
          endArrow
          arrowSize={16}
          opacity={0}
        />
      </Layout>
    );
  }

  protected *on_play(): ThreadGenerator {
    yield* sequence(
      0.12,
      all(this.ui().opacity(1, 0.5), this.ui().scale(1, 0.5, easeOutCubic)),
      all(this.ai().opacity(1, 0.5), this.ai().scale(1, 0.5, easeOutCubic)),
      all(this.tool().opacity(1, 0.5), this.tool().scale(1, 0.5, easeOutCubic), this.loopArrow().opacity(1, 0.5)),
    );

    yield* typeText(this.think, "思考：我要写程序 → 用 write_file", 1.1);
    yield* waitFor(0.2);
    yield* typeText(this.act, "行动：{\"action\":\"write_file\",...}", 1.1);
    yield* waitFor(0.3);
    yield* typeText(this.observe, "观察：write_file 返回 OK", 1.0);

    yield* waitFor(1.4);
  }
}
