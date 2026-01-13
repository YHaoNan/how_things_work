import { Layout, Rect, Txt, Circle, Line, Img } from "@motion-canvas/2d";
import { ThreadGenerator, createRef, all, sequence, waitFor, createSignal, easeInOutCubic, easeOutCubic, Vector2, waitUntil } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";

export class IntroNextTokenLayer extends AnimLayer {
    private mainContainer = createRef<Layout>();
    private neuralNet = createRef<Layout>();
    private textDisplay = createRef<Txt>();
    private movingToken = createRef<Txt>();
    
    // Evolution elements
    private evolutionContainer = createRef<Layout>();
    private chatBox = createRef<Layout>();
    private videoBox = createRef<Layout>();
    private codeBox = createRef<Layout>();

    private titleBackdrop = createRef<Rect>();
    private titleText = createRef<Txt>();

    protected on_build_ui(): void {
        this.root.add(
            <Layout ref={this.mainContainer}>
                {/* Text Display */}
                <Txt
                    ref={this.textDisplay}
                    text="迪迦奥特曼昨天在"
                    y={-400}
                    fill={'#ffffff'}
                    fontSize={48}
                    fontFamily={'"Microsoft YaHei", "SimHei", sans-serif'}
                />
                
                {/* Moving Token Placeholder */}
                <Txt
                    ref={this.movingToken}
                    text=""
                    fill={Colors.yellow}
                    fontSize={48}
                    fontFamily={'"Microsoft YaHei", "SimHei", sans-serif'}
                    opacity={0}
                />

                {/* Neural Network */}
                <Layout ref={this.neuralNet} y={50}>
                    {this.buildNeuralNet()}
                </Layout>

                {/* Evolution Boxes (Initially Hidden) */}
                <Layout ref={this.evolutionContainer} opacity={0}>
                    {/* Left: Chat */}
                    <Rect
                        ref={this.chatBox}
                        x={-600}
                        y={0}
                        width={300}
                        height={400}
                        radius={16}
                        stroke={Colors.orange}
                        lineWidth={4}
                        fill={'rgba(0,0,0,0.5)'}
                        opacity={0}
                    >
                        <Txt text="Chat" fill={Colors.orange} y={-160} fontSize={32} fontFamily={'"Microsoft YaHei", sans-serif'} />
                        <Rect width={240} height={40} fill={Colors.orange} opacity={0.3} radius={8} y={-80} x={-20} />
                        <Rect width={240} height={40} fill={'#fff'} opacity={0.3} radius={8} y={0} x={20} />
                        <Rect width={240} height={40} fill={Colors.orange} opacity={0.3} radius={8} y={80} x={-20} />
                    </Rect>

                    {/* Center: Video */}
                     <Rect
                        ref={this.videoBox}
                        x={0}
                        y={-180} // Positioned above the neural net
                        width={300}
                        height={200}
                        radius={16}
                        stroke={Colors.yellow}
                        lineWidth={4}
                        fill={'rgba(0,0,0,0.5)'}
                        opacity={0}
                    >
                         <Txt text="Video" fill={Colors.yellow} y={-70} fontSize={32} fontFamily={'"Microsoft YaHei", sans-serif'} />
                         <Circle size={60} stroke={Colors.yellow} lineWidth={4} />
                         <Txt text="▶" fill={Colors.yellow} fontSize={40} x={5} fontFamily={'"Microsoft YaHei", sans-serif'} />
                    </Rect>

                    {/* Right: Code */}
                     <Rect
                        ref={this.codeBox}
                        x={600}
                        y={0}
                        width={300}
                        height={400}
                        radius={16}
                        stroke={Colors.green}
                        lineWidth={4}
                        fill={'rgba(0,0,0,0.5)'}
                        opacity={0}
                    >
                        <Txt text="Code" fill={Colors.green} y={-160} fontSize={32} fontFamily={'"Microsoft YaHei", sans-serif'} />
                        <Rect width={40} height={40} fill={Colors.green} opacity={0.5} x={-100} y={-80} radius={4} />
                        <Rect width={180} height={10} fill={'#fff'} opacity={0.5} x={30} y={-80} radius={2} />
                        <Rect width={180} height={10} fill={'#fff'} opacity={0.5} x={30} y={-50} radius={2} />
                        <Rect width={220} height={10} fill={'#fff'} opacity={0.5} x={10} y={-20} radius={2} />
                    </Rect>
                </Layout>

                <Rect
                    ref={this.titleBackdrop}
                    width={1920}
                    height={1080}
                    fill={'rgba(0,0,0,0.65)'}
                    opacity={0}
                />
                <Txt
                    ref={this.titleText}
                    text="好奇的事：LLM进化之路"
                    y={0}
                    fill={Colors.yellow}
                    fontSize={120}
                    fontFamily={'JetBrains Mono'}
                    fontWeight={900}
                    opacity={0}
                    scale={2}
                    shadowBlur={20}
                    shadowColor={'rgba(0,0,0,0.8)'}
                />
            </Layout>
        );
    }

    private buildNeuralNet() {
        const layers = [4, 5, 4]; // Input, Hidden, Output nodes
        const layerGap = 200;
        const nodeGap = 60;
        const elements: any[] = [];

        // Create connections first (so they are behind)
        // Note: In Motion Canvas, order in list determines z-index (later is on top).
        // So I'll just render connections then nodes.
        // Actually, I can't easily iterate twice inside the JSX unless I pre-calculate positions.
        // Let's pre-calculate.
        
        const nodePositions: Vector2[][] = [];
        
        layers.forEach((count, layerIndex) => {
            const layerX = (layerIndex - (layers.length - 1) / 2) * layerGap;
            const positions: Vector2[] = [];
            for (let i = 0; i < count; i++) {
                const nodeY = (i - (count - 1) / 2) * nodeGap;
                positions.push(new Vector2(layerX, nodeY));
            }
            nodePositions.push(positions);
        });

        // Connections
        for (let l = 0; l < layers.length - 1; l++) {
            for (let i = 0; i < layers[l]; i++) {
                for (let j = 0; j < layers[l+1]; j++) {
                    elements.push(
                        <Line
                            points={[nodePositions[l][i], nodePositions[l+1][j]]}
                            stroke={'#444'}
                            lineWidth={2}
                            opacity={0.5}
                        />
                    );
                }
            }
        }

        // Nodes
        nodePositions.forEach((layerPositions, l) => {
            layerPositions.forEach((pos, i) => {
                elements.push(
                    <Circle
                        x={pos.x}
                        y={pos.y}
                        size={20}
                        fill={l === 0 ? Colors.red : l === 1 ? Colors.brown : Colors.orange}
                        stroke={'#fff'}
                        lineWidth={2}
                    />
                );
            });
        });

        return elements;
    }

    protected *on_play(): ThreadGenerator {
        yield* waitUntil('start_generation');

        const textToGenerate = ["哪", "个", "频", "道", "播", "出", "？"];
        const fullText = "迪迦奥特曼昨天在";
        let currentText = fullText;

        for (const char of textToGenerate) {
            // 1. Input: Text flows into the model
            // Create a temporary clone of the current text to move down
            const inputText = this.textDisplay().clone();
            this.mainContainer().add(inputText);
            inputText.position(this.textDisplay().position());
            inputText.opacity(0.5);
            
            // Move into neural net
            yield* all(
                inputText.position(new Vector2(-200, 50), 0.5, easeInOutCubic),
                inputText.scale(0.1, 0.5),
                inputText.opacity(0, 0.5)
            );
            inputText.remove();

            // 2. Processing: Flash Neural Net
            // Simple flash for now
            yield* this.neuralNet().scale(1.1, 0.1).to(1, 0.1);
            
            // 3. Output: Token appears at bottom/end of NN
            // Output layer is at local x=200. NN y=50. Global (200, 50).
            this.movingToken().text(char);
            this.movingToken().position(new Vector2(200, 50));
            this.movingToken().opacity(1);
            this.movingToken().scale(0);
            
            yield* this.movingToken().scale(1, 0.3, easeInOutCubic);
            
            // 4. Append: Token flies to the end of the sentence
            yield* all(
                this.movingToken().position(new Vector2(0, -400), 0.5, easeInOutCubic), // Move up to text
                this.movingToken().scale(1.2, 0.5)
            );

            // Update main text
            currentText += char;
            this.textDisplay().text(currentText);
            
            // Hide moving token
            this.movingToken().opacity(0);
            
            // Highlight
            yield* this.textDisplay().fill(Colors.yellow, 0.1).to('#ffffff', 0.1);

            yield* waitFor(0.1);
        }

        yield* waitFor(1);

        // Phase 2: Evolution
        yield* this.neuralNet().y(200, 1); 
        yield* this.textDisplay().y(-450, 1); 
        
        yield* this.evolutionContainer().opacity(1, 1);

        yield* waitUntil('show_chat');
        yield* this.chatBox().opacity(1, 0.5);
        
        yield* waitUntil('show_video');
        yield* this.videoBox().opacity(1, 0.5);

        yield* waitUntil('show_code');
        yield* this.codeBox().opacity(1, 0.5);
        
        yield* waitUntil('end_intro');

        yield* all(
            this.titleBackdrop().opacity(1, 0.6),
            this.titleText().opacity(1, 1),
            this.titleText().scale(1, 1, easeOutCubic)
        );
        yield* waitFor(1.5);
        yield* all(
            this.titleBackdrop().opacity(0, 0.7),
            this.titleText().opacity(0, 0.7),
        );
    }
}
