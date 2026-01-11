import { Layout, Rect, Txt, Line, Icon, Img, Circle } from "@motion-canvas/2d";
import { ThreadGenerator, createRef, all, waitFor, waitUntil, sequence, easeOutCubic, tween, map, createSignal, loop, any } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";

export class FSRLayer extends AnimLayer {
    // Left Input Column
    private inputGroup = createRef<Layout>();
    private inputFrame = createRef<Rect>();
    private motionVecs = createRef<Rect>();
    private depthBuffer = createRef<Rect>();
    
    // Center Algorithm
    private algorithm = createRef<Layout>();
    private algoRect = createRef<Rect>();
    
    // Right Output
    private outputFrame = createRef<Rect>();
    
    // Flow Group (For moving everything together)
    private flowGroup = createRef<Layout>();
    
    // Comparison
    private comparisonGroup = createRef<Layout>();
    private dlssGroup = createRef<Layout>();
    private fsrGroup = createRef<Layout>();

    protected on_build_ui(): void {
        // Wrap flow elements in a group
        this.root.add(
            <Layout ref={this.flowGroup}>
                {/* 1. Input Group (Left Column) */}
                <Layout ref={this.inputGroup} x={-600} opacity={0}>
                     {/* Low Res Frame */}
                    <Rect
                        ref={this.inputFrame}
                        width={200}
                        height={100}
                        fill={'#333'}
                        stroke={Colors.orange}
                        lineWidth={3}
                        radius={8}
                        y={-120}
                    >
                        <Txt text="Low Res" fill={Colors.orange} fontSize={24} fontFamily={'JetBrains Mono'} />
                    </Rect>
                    
                    {/* Motion Vecs */}
                     <Rect
                        ref={this.motionVecs}
                        width={200}
                        height={100}
                        fill={'#333'}
                        stroke={Colors.yellow}
                        lineWidth={3}
                        radius={8}
                        y={0}
                    >
                         <Txt text="Motion Vecs" fill={Colors.yellow} fontSize={24} fontFamily={'JetBrains Mono'} />
                    </Rect>

                    {/* Depth Buffer / Exposure */}
                    <Rect
                        ref={this.depthBuffer}
                        width={200}
                        height={100}
                        fill={'#333'}
                        stroke={'#aaa'}
                        lineWidth={3}
                        radius={8}
                        y={120}
                    >
                         <Txt text="Depth/Exp" fill={'#aaa'} fontSize={24} fontFamily={'JetBrains Mono'} />
                    </Rect>
                </Layout>

                {/* 2. Algorithm (Center) */}
                <Layout ref={this.algorithm} x={0} y={0} opacity={0} scale={0}>
                    <Rect ref={this.algoRect} width={200} height={150} fill={'#222'} stroke={Colors.red} lineWidth={4} radius={16} />
                    <Txt text="Algorithm" fill={Colors.red} y={-30} fontSize={28} fontFamily={'JetBrains Mono'} />
                    <Txt text="(Shader)" fill={'#aaa'} y={10} fontSize={20} fontFamily={'JetBrains Mono'} />
                    <Txt text="Open Source" fill={'#aaa'} y={40} fontSize={16} fontFamily={'JetBrains Mono'} />
                </Layout>

                {/* 3. Output (Right) */}
                <Rect
                    ref={this.outputFrame}
                    x={600}
                    y={0}
                    width={400}
                    height={225}
                    fill={'#333'}
                    stroke={Colors.red}
                    lineWidth={4}
                    radius={8}
                    opacity={0}
                >
                    <Txt text="High Res" fill={Colors.red} fontSize={40} fontFamily={'JetBrains Mono'} />
                </Rect>
                
                {/* Connecting Lines */}
                <Line
                    points={[[-490, -120], [-120, -20]]}
                    stroke={'#444'}
                    lineWidth={2}
                    endArrow
                    arrowSize={12}
                    opacity={() => this.inputGroup().opacity()}
                    radius={20}
                />
                <Line
                    points={[[-490, 0], [-120, 0]]}
                    stroke={'#444'}
                    lineWidth={2}
                    endArrow
                    arrowSize={12}
                    opacity={() => this.inputGroup().opacity()}
                />
                <Line
                    points={[[-490, 120], [-120, 20]]}
                    stroke={'#444'}
                    lineWidth={2}
                    endArrow
                    arrowSize={12}
                    opacity={() => this.inputGroup().opacity()}
                    radius={20}
                />
                <Line
                    points={[[120, 0], [390, 0]]}
                    stroke={'#444'}
                    lineWidth={4}
                    endArrow
                    arrowSize={12}
                    opacity={() => this.outputFrame().opacity()}
                />
            </Layout>
        );

        // Part 2: Comparison Table (Bottom)
        this.root.add(
            <Layout ref={this.comparisonGroup} y={250}>
                <Layout ref={this.dlssGroup} x={-300} opacity={0}>
                    <Txt text="DLSS" fill={Colors.green} fontSize={40} fontFamily={'JetBrains Mono'} y={-50} />
                    <Txt text="Best Quality" fill={'#fff'} fontSize={24} fontFamily={'JetBrains Mono'} y={0} />
                    <Txt text="Hardware Locked" fill={'#888'} fontSize={24} fontFamily={'JetBrains Mono'} y={40} />
                </Layout>
                
                <Layout ref={this.fsrGroup} x={300} opacity={0}>
                    <Txt text="FSR" fill={Colors.red} fontSize={40} fontFamily={'JetBrains Mono'} y={-50} />
                    <Txt text="High Compatibility" fill={'#fff'} fontSize={24} fontFamily={'JetBrains Mono'} y={0} />
                    <Txt text="Open Source" fill={'#888'} fontSize={24} fontFamily={'JetBrains Mono'} y={40} />
                </Layout>
            </Layout>
        );
    }

    protected *on_play(): ThreadGenerator {
        // 03:26: DLSS disadvantage (High cost/Hardware locked)
        // 03:38: FSR Intro
        yield* waitUntil('start_fsr');
        
        // 03:42: "Rule based... Hand crafted... Low cost"
        yield* all(
            this.inputGroup().opacity(1, 1),
            this.algorithm().opacity(1, 1),
            this.algorithm().scale(1, 1, easeOutCubic),
            this.outputFrame().opacity(1, 1)
        );

        // Animation for Algorithm Box (Pulse)
        const self = this;
        
        // Run flow animation until comparison event
        yield* any(
             loop(Infinity, () => self.algoRect().lineWidth(4, 1).to(8, 1)),
             waitUntil('fsr_comparison')
        );

        // 04:00: Comparison Summary
        // Move entire flow group up and scale down
        yield* all(
            this.flowGroup().y(-200, 1, easeOutCubic),
            this.flowGroup().scale(0.7, 1, easeOutCubic)
        );

        // Show Comparison
        yield* waitUntil('show_comparison_details');
        
        yield* all(
            this.dlssGroup().opacity(1, 1),
            this.dlssGroup().y(100, 1, easeOutCubic)
        );
        
        yield* waitFor(0.5);
        
        yield* waitUntil('show_fsr_comparison');

        yield* all(
            this.fsrGroup().opacity(1, 1),
            this.fsrGroup().y(100, 1, easeOutCubic)
        );

        yield* waitUntil('end_fsr');
    }
}
