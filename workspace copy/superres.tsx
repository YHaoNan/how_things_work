import { Layout, Rect, Txt, Line } from "@motion-canvas/2d";
import { ThreadGenerator, createRef, all, waitFor, waitUntil, Vector2, easeInOutCubic } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";

export class SuperResLayer extends AnimLayer {
    private lowRes = createRef<Layout>();
    private algorithm = createRef<Layout>();
    private highRes = createRef<Layout>();
    
    private motionVectors = createRef<Layout>();
    private history = createRef<Layout>();

    private arrow1 = createRef<Line>();
    private arrow2 = createRef<Line>();
    private arrow3 = createRef<Line>();
    private arrowOut = createRef<Line>();

    protected on_build_ui(): void {
        // Nodes
        this.root.add(
            <Layout>
                {/* Inputs */}
                <Layout ref={this.lowRes} x={-500} y={0} opacity={0}>
                    <Rect width={180} height={100} fill={Colors.red} radius={8} />
                    <Txt text={'低分辨率\n(720p)'} fill={'#fff'} fontSize={24} fontFamily={'JetBrains Mono'} textAlign={'center'} />
                </Layout>

                <Layout ref={this.motionVectors} x={-500} y={-150} opacity={0}>
                    <Rect width={180} height={80} fill={Colors.orange} radius={8} />
                    <Txt text="运动向量" fill={'#fff'} fontSize={20} fontFamily={'JetBrains Mono'} textAlign={'center'} />
                </Layout>

                <Layout ref={this.history} x={-500} y={150} opacity={0}>
                    <Rect width={180} height={80} fill={Colors.brown} radius={8} />
                    <Txt text="历史帧" fill={'#fff'} fontSize={20} fontFamily={'JetBrains Mono'} textAlign={'center'} />
                </Layout>

                {/* Algorithm */}
                <Layout ref={this.algorithm} x={0} y={0} opacity={0}>
                    <Rect width={200} height={200} fill={Colors.green} radius={100} />
                    <Txt text="超分算法" fill={'#fff'} fontSize={28} fontFamily={'JetBrains Mono'} textAlign={'center'} />
                </Layout>

                {/* Output */}
                <Layout ref={this.highRes} x={500} y={0} opacity={0}>
                    <Rect width={240} height={135} fill={Colors.yellow} radius={8} />
                    <Txt text={'高分辨率\n(4K)'} fill={'#fff'} fontSize={32} fontFamily={'JetBrains Mono'} textAlign={'center'} />
                </Layout>

                {/* Arrows */}
                <Line ref={this.arrow1} points={[new Vector2(-410, 0), new Vector2(-100, 0)]} stroke={'#fff'} lineWidth={4} endArrow opacity={0} />
                <Line ref={this.arrow2} points={[new Vector2(-410, -150), new Vector2(-70, -70)]} stroke={'#fff'} lineWidth={4} endArrow opacity={0} />
                <Line ref={this.arrow3} points={[new Vector2(-410, 150), new Vector2(-70, 70)]} stroke={'#fff'} lineWidth={4} endArrow opacity={0} />
                <Line ref={this.arrowOut} points={[new Vector2(100, 0), new Vector2(380, 0)]} stroke={'#fff'} lineWidth={4} endArrow opacity={0} />
            </Layout>
        );
    }

    protected *on_play(): ThreadGenerator {
        // Step 1: Low Res Frame
        yield* waitUntil('show_low_res');
        yield* this.lowRes().opacity(1, 1);

        // Step 2: Extra Data
        yield* waitUntil('show_inputs');
        yield* all(
            this.motionVectors().opacity(1, 1),
            this.history().opacity(1, 1)
        );

        // Step 3: To Algorithm
        yield* waitUntil('process');
        yield* all(
            this.algorithm().opacity(1, 1),
            this.arrow1().opacity(1, 1),
            this.arrow2().opacity(1, 1),
            this.arrow3().opacity(1, 1),
        );
        yield* all(
            this.arrow1().end(1, 1),
            this.arrow2().end(1, 1),
            this.arrow3().end(1, 1),
        );

        // Step 4: Output
        yield* waitUntil('show_output');
        yield* all(
            this.arrowOut().opacity(1, 0.5),
            this.highRes().opacity(1, 1)
        );
        
        yield* waitUntil('end_superres');
    }
}
