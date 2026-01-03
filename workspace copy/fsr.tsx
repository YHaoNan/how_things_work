import { Layout, Rect, Txt, Line, Circle } from "@motion-canvas/2d";
import { ThreadGenerator, createRef, all, waitFor, waitUntil, Vector2, easeInOutCubic, createSignal } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";

export class FSRLayer extends AnimLayer {
    private lowRes = createRef<Layout>();
    private shader = createRef<Layout>();
    private highRes = createRef<Layout>();
    
    private motionVectors = createRef<Layout>();
    private history = createRef<Layout>();

    private arrow1 = createRef<Line>();
    private arrow2 = createRef<Line>();
    private arrow3 = createRef<Line>();
    private arrowOut = createRef<Line>();
    private feedbackArrow = createRef<Line>();
    
    // Shader Visuals
    private scanLine = createRef<Rect>();
    private codeLines = createRef<Layout>();

    protected on_build_ui(): void {
        this.root.add(
            <Layout>
                {/* Inputs */}
                <Layout ref={this.lowRes} x={-500} y={0} opacity={0}>
                    <Rect width={180} height={100} fill={Colors.red} radius={8} clip>
                        {/* Low Res Grid Effect */}
                        <Rect width={180} height={10} y={-45} fill={'rgba(0,0,0,0.2)'} />
                        <Rect width={180} height={10} y={-25} fill={'rgba(0,0,0,0.2)'} />
                        <Rect width={180} height={10} y={-5} fill={'rgba(0,0,0,0.2)'} />
                        <Rect width={180} height={10} y={15} fill={'rgba(0,0,0,0.2)'} />
                        <Rect width={180} height={10} y={35} fill={'rgba(0,0,0,0.2)'} />
                    </Rect>
                    <Txt text="低分辨率" fill={'#fff'} fontSize={24} fontFamily={'JetBrains Mono'} textAlign={'center'} />
                </Layout>

                <Layout ref={this.motionVectors} x={-500} y={-150} opacity={0}>
                    <Rect width={180} height={80} fill={Colors.orange} radius={8} />
                    <Txt text="运动向量" fill={'#fff'} fontSize={20} fontFamily={'JetBrains Mono'} textAlign={'center'} />
                     {/* Visual: Arrows */}
                    <Line points={[new Vector2(-60, 20), new Vector2(-40, -20)]} stroke={'rgba(255,255,255,0.3)'} endArrow lineWidth={2} />
                    <Line points={[new Vector2(0, 20), new Vector2(20, -20)]} stroke={'rgba(255,255,255,0.3)'} endArrow lineWidth={2} />
                    <Line points={[new Vector2(60, 20), new Vector2(40, -20)]} stroke={'rgba(255,255,255,0.3)'} endArrow lineWidth={2} />
                </Layout>

                <Layout ref={this.history} x={-500} y={150} opacity={0}>
                    <Rect width={180} height={80} fill={Colors.brown} radius={8} />
                    <Txt text="历史帧" fill={'#fff'} fontSize={20} fontFamily={'JetBrains Mono'} textAlign={'center'} />
                     {/* Visual: Stacked frames */}
                     <Rect width={160} height={60} stroke={'rgba(255,255,255,0.3)'} lineWidth={2} radius={4} />
                </Layout>

                {/* Shader / Software - "Code" or "Scan" Style */}
                <Layout ref={this.shader} x={0} y={0} opacity={0}>
                    <Rect width={240} height={240} fill={'#1a1a1a'} stroke={Colors.red} lineWidth={4} radius={20} clip />
                    <Txt text={'着色器算法\n(手工打造)'} y={-140} fill={Colors.red} fontSize={24} fontFamily={'JetBrains Mono'} textAlign={'center'} />
                    
                    {/* Visual: Scrolling Code or Logic Gates */}
                    <Layout ref={this.codeLines} y={-60}>
                         {Array.from({length: 8}).map((_, i) => (
                             <Rect 
                                width={180} 
                                height={8} 
                                y={i * 20} 
                                fill={'#333'} 
                                radius={4} 
                                x={Math.random() * 40 - 20} // Random indentation
                             />
                         ))}
                    </Layout>

                    {/* Visual: Scan Line */}
                    <Rect 
                        ref={this.scanLine}
                        width={240} 
                        height={4} 
                        fill={Colors.red} 
                        y={-100} 
                        opacity={0}
                        shadowBlur={10}
                        shadowColor={Colors.red}
                    />
                </Layout>

                {/* Output */}
                <Layout ref={this.highRes} x={500} y={0} opacity={0}>
                    <Rect width={240} height={135} fill={Colors.yellow} radius={8} />
                    <Txt text="高分辨率" fill={'#000'} fontSize={32} fontFamily={'JetBrains Mono'} textAlign={'center'} />
                     {/* Edge sharpening effect (visualized as border glow maybe) */}
                     <Rect width={240} height={135} stroke={'#fff'} lineWidth={0} radius={8} />
                </Layout>

                {/* Arrows */}
                <Line ref={this.arrow1} points={[new Vector2(-410, 0), new Vector2(-120, 0)]} stroke={'#fff'} lineWidth={4} endArrow opacity={0} />
                <Line ref={this.arrow2} points={[new Vector2(-410, -150), new Vector2(-100, -100)]} stroke={'#fff'} lineWidth={4} endArrow opacity={0} />
                <Line ref={this.arrow3} points={[new Vector2(-410, 150), new Vector2(-100, 100)]} stroke={'#fff'} lineWidth={4} endArrow opacity={0} />
                
                <Line ref={this.arrowOut} points={[new Vector2(120, 0), new Vector2(380, 0)]} stroke={'#fff'} lineWidth={4} endArrow opacity={0} />

                {/* Feedback Loop */}
                <Line 
                    ref={this.feedbackArrow} 
                    points={[
                        new Vector2(500, 70), 
                        new Vector2(500, 250),
                        new Vector2(-500, 250),
                        new Vector2(-500, 190)
                    ]} 
                    stroke={'#fff'} 
                    lineWidth={2} 
                    endArrow 
                    lineDash={[10, 10]}
                    opacity={0} 
                    radius={20}
                />
            </Layout>
        );
    }

    protected *on_play(): ThreadGenerator {
        // 1. Input Low Res
        yield* waitUntil('fsr_step1');
        yield* this.lowRes().opacity(1, 1);

        // 2. Motion Vectors & History
        yield* waitUntil('fsr_step2');
        yield* all(
            this.motionVectors().opacity(1, 1),
            this.history().opacity(1, 1)
        );

        // 3. Algorithm Inference
        yield* waitUntil('fsr_step3');
        yield* all(
            this.shader().opacity(1, 1),
            this.arrow1().opacity(1, 1),
            this.arrow2().opacity(1, 1),
            this.arrow3().opacity(1, 1),
        );
        
        // Scan Animation
        yield* this.scanLine().opacity(1, 0.2);
        yield* this.scanLine().y(100, 1, easeInOutCubic);
        yield* this.scanLine().opacity(0, 0.2);
        yield* this.scanLine().y(-100, 0);

        // 4. Output
        yield* waitUntil('fsr_step4');
        yield* all(
            this.arrowOut().opacity(1, 1),
            this.highRes().opacity(1, 1)
        );

        // 5. Feedback
        yield* waitUntil('fsr_step5');
        yield* all(
             this.feedbackArrow().opacity(1, 1),
             this.feedbackArrow().lineDashOffset(-100, 2)
        );
        
        yield* waitUntil('end_fsr');
    }
}
