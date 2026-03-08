import { Layout, Txt } from "@motion-canvas/2d";
import { ThreadGenerator, createRef, all, waitFor, sequence, waitUntil } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";

export class IntroLayer extends AnimLayer {
    private title = createRef<Txt>();
    private subtitleContainer = createRef<Layout>();
    private subtitles: Txt[] = [];

    protected on_build_ui(): void {
        const subtitleTexts = [
            "1. 什么是线性运算，哪些操作是被允许的",
            "2. 什么是线性组合？向量张成的空间又是什么？",
            "3. 张成空间在现实世界中的应用"
        ];

        this.root.add(
            <Layout>
                <Txt
                    ref={this.title}
                    text="线性运算&空间"
                    fill={Colors.yellow}
                    fontSize={120}
                    fontFamily={'JetBrains Mono'}
                    fontWeight={900}
                    opacity={0}
                />
                <Layout
                    ref={this.subtitleContainer}
                    layout // Enable flexbox layout
                    direction={'column'}
                    gap={40}
                    y={100}
                    width={1600}
                    alignItems={'center'}
                >
                    {subtitleTexts.map(text => (
                        <Txt
                            text={text}
                            fill={'#FFFFFF'}
                            fontSize={60}
                            fontFamily={'JetBrains Mono'}
                            opacity={0} // Start invisible
                            ref={ref => this.subtitles.push(ref)}
                        />
                    ))}
                </Layout>
            </Layout>
        );
    }

    protected *on_play(): ThreadGenerator {
        // 1. Title fade in
        yield* this.title().opacity(1, 1);
        yield* waitUntil("title_shown");
        
        // 2. Title move to top-left
        yield* all(
            this.title().position([-700, -400], 1),
            this.title().scale(0.6, 1),
        );
        yield* waitUntil("title_moved");

        // 3. Subtitles appear one by one
        for (let i = 0; i < this.subtitles.length; i++) {
            const txt = this.subtitles[i];
            yield* txt.opacity(1, 0.5);
            yield* waitUntil(`subtitle_${i + 1}_shown`);
        }
        
        yield* waitUntil("intro_finished");
    }
}
