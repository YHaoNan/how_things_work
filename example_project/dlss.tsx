import { Layout, Rect, Txt, Line, Icon, Img, Circle } from "@motion-canvas/2d";
import { ThreadGenerator, createRef, all, waitFor, waitUntil, sequence, easeOutCubic, tween, map, createSignal, any, loop } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";
import nvidiaIcon from "./assets/icon_nvidia.svg";

export class DLSSLayer extends AnimLayer {
    // Left Input Column
    private inputGroup = createRef<Layout>();
    private inputFrame = createRef<Rect>();
    private motionVecs = createRef<Rect>();
    private depthBuffer = createRef<Rect>();
    
    // Bottom History
    private historyFrame = createRef<Rect>();
    
    // Center AI
    private aiGroup = createRef<Layout>();
    private aiModel = createRef<Layout>();
    private tensorCores = createRef<Layout>();
    
    // Right Output
    private outputFrame = createRef<Rect>();
    
    // Connections
    private loopLine = createRef<Line>();
    private nnGroup = createRef<Layout>();
    private nnNodes: Circle[] = [];
    private nnLines: Line[] = [];

    // Signals
    private flowProgress = createSignal(0);
    
    protected on_build_ui(): void {
        // 0. Neural Network Visual (Intro)
        this.root.add(
            <Layout ref={this.nnGroup} opacity={0} scale={0} y={-50}>
                {this.createNeuralNet(5, 4, 300, 200)}
                <Txt text="Neural Network" fill={Colors.green} y={150} fontSize={32} fontFamily={'JetBrains Mono'} />
            </Layout>
        );

        // Layout Spacing: Input (-600), AI (0), Output (600)

        // 1. Input Group (Left Column)
        this.root.add(
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
        );

        // 2. AI Group (Center)
        this.root.add(
            <Layout ref={this.aiGroup} x={0} y={0}>
                {/* AI Model Box */}
                <Layout ref={this.aiModel} opacity={0} scale={0}>
                    <Rect width={300} height={200} fill={'#222'} stroke={Colors.green} lineWidth={4} radius={16} />
                    <Txt text="AI Model" fill={Colors.green} fontSize={32} fontFamily={'JetBrains Mono'} />
                </Layout>

                {/* Tensor Cores Box (Overlay or transformation) */}
                <Layout ref={this.tensorCores} opacity={0} scale={0}>
                    <Rect width={300} height={200} fill={'#1a2a1a'} stroke={Colors.green} lineWidth={4} radius={16} />
                    <Img src={nvidiaIcon} width={80} height={80} y={-40} />
                    <Txt text="Tensor Cores" fill={Colors.green} y={40} fontSize={28} fontFamily={'JetBrains Mono'} />
                </Layout>
            </Layout>
        );

        // 3. Output (Right)
        this.root.add(
            <Rect
                ref={this.outputFrame}
                x={600}
                y={0}
                width={400}
                height={225}
                fill={'#333'}
                stroke={Colors.yellow}
                lineWidth={4}
                radius={8}
                opacity={0}
            >
                <Txt text="High Res" fill={Colors.yellow} fontSize={40} fontFamily={'JetBrains Mono'} />
            </Rect>
        );

        // 4. History Loop
        this.root.add(
             <Line
                ref={this.loopLine}
                points={[
                    [600, 120], // Output bottom
                    [600, 250],
                    [0, 250],   // Under AI
                    [0, 110]    // AI bottom
                ]}
                stroke={'#555'}
                lineWidth={4}
                radius={40}
                endArrow
                arrowSize={10}
                lineDash={[20, 20]}
                opacity={0}
            />
        );
        this.root.add(
             <Rect
                ref={this.historyFrame}
                x={0}
                y={250}
                width={120}
                height={67}
                fill={'#444'}
                stroke={'#888'}
                lineWidth={2}
                radius={4}
                opacity={0}
            >
                 <Txt text="History" fill={'#aaa'} fontSize={20} fontFamily={'JetBrains Mono'} />
            </Rect>
        );
        
        // Arrows from Inputs to AI
        // We need 3 arrows now
        this.root.add(
            <Line
                points={[[-490, -120], [-160, -20]]} // Low Res -> AI Top-ish
                stroke={'#444'}
                lineWidth={2}
                endArrow
                arrowSize={12}
                opacity={() => this.inputGroup().opacity()}
                radius={20}
            />
        );
        this.root.add(
            <Line
                points={[[-490, 0], [-160, 0]]} // Motion -> AI Mid
                stroke={'#444'}
                lineWidth={2}
                endArrow
                arrowSize={12}
                opacity={() => this.inputGroup().opacity()}
            />
        );
        this.root.add(
             <Line
                points={[[-490, 120], [-160, 20]]} // Depth -> AI Bottom-ish
                stroke={'#444'}
                lineWidth={2}
                endArrow
                arrowSize={12}
                opacity={() => this.inputGroup().opacity()}
                radius={20}
            />
        );
        
        // Arrow from AI to Output
        this.root.add(
             <Line
                points={[[160, 0], [390, 0]]}
                stroke={'#444'}
                lineWidth={4}
                endArrow
                arrowSize={12}
                opacity={() => this.outputFrame().opacity()}
            />
        );
    }
    
    private createNeuralNet(cols: number, rows: number, width: number, height: number) {
        const nodes = [];
        const lines = [];
        
        const colSpacing = width / (cols - 1);
        const rowSpacing = height / (rows - 1);
        
        for(let c=0; c<cols; c++) {
            for(let r=0; r<rows; r++) {
                const x = c * colSpacing - width/2;
                const y = r * rowSpacing - height/2;
                
                // Lines to next col
                if (c < cols - 1) {
                    for(let r2=0; r2<rows; r2++) {
                        const y2 = r2 * rowSpacing - height/2;
                        const line = createRef<Line>();
                        this.nnLines.push(line);
                        lines.push(
                            <Line
                                ref={line}
                                points={[[x, y], [x + colSpacing, y2]]}
                                stroke={Colors.green}
                                lineWidth={1}
                                opacity={0.3}
                            />
                        );
                    }
                }
                
                const node = createRef<Circle>();
                this.nnNodes.push(node);
                nodes.push(
                    <Circle
                        ref={node}
                        x={x}
                        y={y}
                        size={10}
                        fill={Colors.green}
                    />
                );
            }
        }
        return [...lines, ...nodes];
    }

    protected *on_play(): ThreadGenerator {
        // 02:40: DLSS Intro
        yield* waitUntil('start_dlss');
        
        // Step 1: Neural Network (Machine Learning)
        yield* all(
            this.nnGroup().opacity(1, 0.5),
            this.nnGroup().scale(1, 0.5, easeOutCubic)
        );
        
        // Pulse NN Loop
        const self = this;
        yield* any(
             loop(Infinity, () => sequence(0.05, ...self.nnNodes.map(node => node().scale(1.5, 0.2).to(1, 0.2)))),
             waitUntil('dlss_tensor_core')
        );
        
        // Step 2: Tensor Cores (Hardware)
        yield* all(
            this.nnGroup().opacity(0, 0.5),
            this.nnGroup().scale(0, 0.5),
            this.tensorCores().opacity(1, 0.5),
            this.tensorCores().scale(1, 0.5, easeOutCubic)
        );

        // Step 3: AI Model (The Software/Process)
        // 03:22: Animation of flow
        yield* waitUntil('start_dlss_flow');
        
        yield* all(
            this.tensorCores().opacity(0, 0.5),
            this.aiModel().opacity(1, 0.5),
            this.aiModel().scale(1, 0.5, easeOutCubic)
        );
        
        // 1. Input Group (Unified)
        yield* all(
            this.inputGroup().opacity(1, 0.5),
            this.inputGroup().x(-600, 0.5, easeOutCubic) // Ensure position
        );
        
        // 2. History & Loop
        yield* all(
            this.historyFrame().opacity(1, 0.5),
            this.loopLine().opacity(1, 0.5)
        );
        
        // 3. Process
        yield* this.aiModel().scale(1.1, 0.2).to(1, 0.2);
        
        // 4. Output
        yield* all(
            this.outputFrame().opacity(1, 0.5)
        );
        
        // 5. Loop animation (Continuous)
        yield* any(
            loop(Infinity, () => self.loopLine().lineDashOffset(-40, 1).to(0, 0)),
            waitUntil('end_dlss')
        );
    }
}
