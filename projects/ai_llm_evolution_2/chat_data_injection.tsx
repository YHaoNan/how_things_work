import { Layout, Rect, Txt } from "@motion-canvas/2d";
import { ThreadGenerator, all, createRef, createSignal, easeInOutCubic, easeOutCubic, loop, sequence, waitFor } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";

function buildNoise(width: number, height: number, lines: number): string {
  const alphabet = "01abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*+-/=";
  const cols = Math.max(10, Math.floor(width / 18));
  const out: string[] = [];
  for (let i = 0; i < lines; i++) {
    let line = "";
    for (let c = 0; c < cols; c++) {
      line += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    out.push(line);
  }
  return out.join("\n");
}

export class ChatDataInjectionLayer extends AnimLayer {
  private noise = createSignal("");
  private model = createRef<Rect>();
  private tags: ReturnType<typeof createRef<Rect>>[] = [];

  protected on_build_ui(): void {
    for (let i = 0; i < 7; i++) this.tags.push(createRef<Rect>());

    this.root.add(
      <Layout>
        <Rect width={1920} height={1080} fill={Colors.background} />

        <Rect x={-650} width={720} height={820} fill={"#0b0b0b"} stroke={"#1e1e1e"} lineWidth={4} radius={26}>
          <Txt
            text={() => this.noise()}
            x={-320}
            fill={"#7CFF9E"}
            fontFamily={"JetBrains Mono"}
            fontSize={22}
            lineHeight={30}
            opacity={0.8}
          />
          <Txt
            text={"对话语料（海量）"}
            y={360}
            fill={Colors.green}
            fontFamily={"JetBrains Mono"}
            fontSize={40}
            opacity={0.9}
          />
        </Rect>

        <Rect
          ref={this.model}
          x={520}
          width={760}
          height={560}
          fill={"#202020"}
          stroke={Colors.green}
          lineWidth={6}
          radius={30}
        >
          <Txt text={"Model"} y={-210} fill={Colors.green} fontFamily={"JetBrains Mono"} fontSize={56} />
          <Rect y={40} width={640} height={280} fill={"rgba(0,0,0,0.25)"} radius={22}>
            <Txt
              text={"…"}
              fill={"#ffffff"}
              fontFamily={"JetBrains Mono"}
              fontSize={96}
              opacity={0.25}
            />
          </Rect>
        </Rect>

        {this.tags.map((r, i) => (
          <Rect
            ref={r}
            key={`tag-${i}`}
            x={-200}
            y={-250 + i * 80}
            width={520}
            height={64}
            fill={"rgba(237,150,79,0.18)"}
            stroke={Colors.orange}
            lineWidth={3}
            radius={16}
            opacity={0}
          >
            <Txt
              text={"对话文本片段"}
              fill={"#ffffff"}
              fontFamily={"Arial, sans-serif"}
              fontSize={34}
            />
          </Rect>
        ))}
      </Layout>
    );
  }

  protected *on_play(): ThreadGenerator {
    this.noise(buildNoise(720, 820, 22));

    yield* loop(30, () =>
      sequence(
        0,
        waitFor(0.05),
        (() => {
          this.noise(buildNoise(720, 820, 22));
          return waitFor(0);
        })(),
      ),
    );

    for (let i = 0; i < this.tags.length; i++) {
      const tag = this.tags[i]();
      tag.x(-240);
      tag.opacity(0);

      yield* all(tag.opacity(1, 0.2), tag.x(240, 0.6, easeOutCubic));
      yield* all(this.model().stroke(Colors.yellow, 0.15), waitFor(0));
      yield* this.model().stroke(Colors.green, 0.25);
      yield* all(tag.opacity(0, 0.25), tag.x(420, 0.25, easeInOutCubic));
      yield* waitFor(0.08);
    }

    yield* waitFor(1.0);
  }
}
