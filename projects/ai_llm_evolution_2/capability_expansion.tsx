import { Layout, Line, Rect, Txt } from "@motion-canvas/2d";
import {
  ThreadGenerator,
  all,
  createRef,
  easeOutCubic,
  sequence,
  waitFor,
} from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";

export class CapabilityExpansionLayer extends AnimLayer {
  private model = createRef<Layout>();
  private chat = createRef<Rect>();
  private video = createRef<Rect>();
  private code = createRef<Rect>();
  private linkChat = createRef<Line>();
  private linkVideo = createRef<Line>();
  private linkCode = createRef<Line>();

  protected on_build_ui(): void {
    this.root.add(
      <Layout>
        <Rect width={1920} height={1080} fill={Colors.background} />

        <Layout ref={this.model} opacity={0} scale={0.9}>
          <Rect
            width={520}
            height={420}
            fill={"#202020"}
            stroke={Colors.green}
            lineWidth={6}
            radius={28}
          />
          <Txt
            text={"AI Model"}
            fill={Colors.green}
            fontFamily={"JetBrains Mono"}
            fontSize={56}
          />
        </Layout>

        <Line
          ref={this.linkChat}
          points={[
            [-260, 0],
            [-620, -180],
          ]}
          stroke={"#3a3a3a"}
          lineWidth={6}
          opacity={0}
        />
        <Line
          ref={this.linkVideo}
          points={[
            [0, 210],
            [0, 380],
          ]}
          stroke={"#3a3a3a"}
          lineWidth={6}
          opacity={0}
        />
        <Line
          ref={this.linkCode}
          points={[
            [260, 0],
            [620, -180],
          ]}
          stroke={"#3a3a3a"}
          lineWidth={6}
          opacity={0}
        />

        <Rect
          ref={this.chat}
          x={-800}
          y={-260}
          width={520}
          height={320}
          fill={"rgba(255,255,255,0.06)"}
          stroke={Colors.orange}
          lineWidth={4}
          radius={22}
          opacity={0}
          scale={0.9}
        >
          <Txt
            text={"Chat"}
            y={-110}
            fill={Colors.orange}
            fontFamily={"JetBrains Mono"}
            fontSize={54}
          />
          <Rect
            y={40}
            width={420}
            height={150}
            fill={"rgba(0,0,0,0.25)"}
            radius={14}
          >
            <Txt
              text={"…"}
              fill={"#ffffff"}
              fontFamily={"JetBrains Mono"}
              fontSize={64}
            />
          </Rect>
        </Rect>

        <Rect
          ref={this.video}
          x={0}
          y={520}
          width={620}
          height={260}
          fill={"rgba(255,255,255,0.06)"}
          stroke={Colors.yellow}
          lineWidth={4}
          radius={22}
          opacity={0}
          scale={0.9}
        >
          <Txt
            text={"Video"}
            y={-70}
            fill={Colors.yellow}
            fontFamily={"JetBrains Mono"}
            fontSize={54}
          />
          <Rect
            y={50}
            width={500}
            height={140}
            fill={"rgba(0,0,0,0.25)"}
            radius={14}
          >
            <Txt text={"▶"} fill={"#ffffff"} fontSize={96} />
          </Rect>
        </Rect>

        <Rect
          ref={this.code}
          x={800}
          y={-260}
          width={520}
          height={320}
          fill={"rgba(255,255,255,0.06)"}
          stroke={Colors.green}
          lineWidth={4}
          radius={22}
          opacity={0}
          scale={0.9}
        >
          <Txt
            text={"Code"}
            y={-110}
            fill={Colors.green}
            fontFamily={"JetBrains Mono"}
            fontSize={54}
          />
          <Rect
            y={55}
            width={420}
            height={170}
            fill={"rgba(0,0,0,0.25)"}
            radius={14}
          >
            <Txt
              text={"src/\n  main.ts\n  app.ts"}
              fill={"#ffffff"}
              fontFamily={"JetBrains Mono"}
              fontSize={32}
              lineHeight={44}
            />
          </Rect>
        </Rect>
      </Layout>
    );
  }

  protected *on_play(): ThreadGenerator {
    yield* all(this.model().opacity(1, 0.6), this.model().scale(1, 0.6, easeOutCubic));

    yield* sequence(
      0.15,
      all(
        this.linkChat().opacity(1, 0.4),
        this.chat().opacity(1, 0.4),
        this.chat().scale(1, 0.4, easeOutCubic),
      ),
      all(
        this.linkVideo().opacity(1, 0.4),
        this.video().opacity(1, 0.4),
        this.video().scale(1, 0.4, easeOutCubic),
      ),
      all(
        this.linkCode().opacity(1, 0.4),
        this.code().opacity(1, 0.4),
        this.code().scale(1, 0.4, easeOutCubic),
      ),
    );

    yield* waitFor(1.8);

    yield* all(
      this.chat().opacity(0.25, 0.6),
      this.video().opacity(0.25, 0.6),
      this.code().opacity(0.25, 0.6),
    );

    yield* waitFor(1.0);
  }
}
