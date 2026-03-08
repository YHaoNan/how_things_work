import { Layout, Rect, Txt, Line, Icon, Img } from "@motion-canvas/2d";
import { ThreadGenerator, createRef, all, waitFor, waitUntil, sequence, easeOutCubic } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";

export class SuperResLayer extends AnimLayer {
    private step1 = createRef<Layout>();
    private step2 = createRef<Layout>();
    private step3 = createRef<Layout>();
    
    private arrow1 = createRef<Line>();
    private arrow2 = createRef<Line>();
    
    protected on_build_ui(): void {
        // Step 1: Low Res Frame
        this.root.add(
            <Layout ref={this.step1} x={-500} opacity={0} scale={0.8}>
                <Rect width={240} height={135} fill={'#333'} stroke={Colors.orange} lineWidth={4} radius={8} />
                <Txt text="720P" fill={Colors.orange} y={0} fontSize={40} fontFamily={'JetBrains Mono'} />
                <Txt text="渲染低分帧" fill={'#fff'} y={100} fontSize={24} fontFamily={'JetBrains Mono'} />
            </Layout>
        );

        // Step 2: Algorithm Data
        this.root.add(
            <Layout ref={this.step2} x={0} opacity={0} scale={0.8}>
                <Rect width={200} height={200} fill={'#222'} stroke={Colors.green} lineWidth={4} radius={100} />
                <Txt text="算法数据" fill={Colors.green} y={-40} fontSize={32} fontFamily={'JetBrains Mono'} />
                <Txt text="运动向量" fill={'#aaa'} y={10} fontSize={20} fontFamily={'JetBrains Mono'} />
                <Txt text="历史帧" fill={'#aaa'} y={40} fontSize={20} fontFamily={'JetBrains Mono'} />
            </Layout>
        );

        // Step 3: High Res Frame
        this.root.add(
            <Layout ref={this.step3} x={500} opacity={0} scale={0.8}>
                <Rect width={480} height={270} fill={'#333'} stroke={Colors.yellow} lineWidth={4} radius={8} />
                <Txt text="4K" fill={Colors.yellow} y={0} fontSize={80} fontFamily={'JetBrains Mono'} />
                <Txt text="生成高分帧" fill={'#fff'} y={180} fontSize={24} fontFamily={'JetBrains Mono'} />
            </Layout>
        );

        // Arrows
        this.root.add(
            <Line
                ref={this.arrow1}
                points={[[-350, 0], [-130, 0]]}
                stroke={'#fff'}
                lineWidth={4}
                endArrow
                arrowSize={12}
                opacity={0}
                end={0}
            />
        );

        this.root.add(
             <Line
                ref={this.arrow2}
                points={[[130, 0], [230, 0]]}
                stroke={'#fff'}
                lineWidth={4}
                endArrow
                arrowSize={12}
                opacity={0}
                end={0}
            />
        );
    }

    protected *on_play(): ThreadGenerator {
        // 02:03 - 02:22: Intro "What is Super Res"
        
        // 02:22: "Render low res frame"
        yield* waitUntil('step1_render');
        yield* all(
            this.step1().opacity(1, 0.5),
            this.step1().scale(1, 0.5, easeOutCubic)
        );
        
        // Arrow 1
        yield* all(
            this.arrow1().opacity(1, 0.3),
            this.arrow1().end(1, 0.5, easeOutCubic)
        );
        
        // 02:26: "Combine with other data"
        yield* waitUntil('step2_data');
        yield* all(
            this.step2().opacity(1, 0.5),
            this.step2().scale(1, 0.5, easeOutCubic)
        );

        // Arrow 2
        yield* all(
            this.arrow2().opacity(1, 0.3),
            this.arrow2().end(1, 0.5, easeOutCubic)
        );

        // 02:37: "To render higher res frame"
        yield* waitUntil('step3_output');
        yield* all(
            this.step3().opacity(1, 0.5),
            this.step3().scale(1, 0.5, easeOutCubic)
        );
        
        yield* waitUntil('end_superres');
    }
}
