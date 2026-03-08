import { Layout, Rect, Txt, Line, Circle } from "@motion-canvas/2d";
import { ThreadGenerator, createRef, all, waitFor, waitUntil, Vector2, createSignal } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";
import { Axes2D } from "@src/common/component/2d/math/Axes2D";
import { Vector2D } from "@src/common/component/2d/math/Vector2D";
import { LatexText } from "@src/common/component/2d/math/LatexText";

export class MatrixApplicationLayer extends AnimLayer {
    // Shopping Demo Refs
    private shoppingTable = createRef<Layout>();
    private vectorV1 = createRef<Vector2D>(); // [2, 1]
    private vectorV2 = createRef<Vector2D>(); // [4, 2]
    private axes = createRef<Axes2D>();
    private collinearLine = createRef<Line>();
    private redundancyText = createRef<Txt>();
    private questionText = createRef<Txt>();
    
    // LoRA Demo Refs
    private largeMatrix = createRef<Layout>();
    private gpuIcon = createRef<Layout>();
    private loraText = createRef<Txt>();
    
    private scale = 100;

    protected on_build_ui(): void {
        this.root.add(
            <Layout>
                {/* --- Shopping Demo UI --- */}
                <Axes2D
                    ref={this.axes}
                    xRange={[-900, 900]}
                    yRange={[-500, 500]}
                    step={100}
                    opacity={0}
                    gridOpacity={0.2}
                />
                
                {/* Table */}
                <Layout ref={this.shoppingTable} x={400} y={-300} opacity={0} layout direction="column" gap={10}>
                    <Txt text="Shopping Data" fill={Colors.text} fontSize={32} fontFamily={"JetBrains Mono"} />
                    <Layout direction="row" gap={20}>
                        <Txt text="Apple" fill={Colors.red} fontSize={24} width={100} />
                        <Txt text="Banana" fill={Colors.yellow} fontSize={24} width={100} />
                        <Txt text="Total" fill={Colors.green} fontSize={24} width={100} />
                    </Layout>
                    <Layout direction="row" gap={20}>
                        <Txt text="2" fill={Colors.red} fontSize={24} width={100} />
                        <Txt text="1" fill={Colors.yellow} fontSize={24} width={100} />
                        <Txt text="4" fill={Colors.green} fontSize={24} width={100} />
                    </Layout>
                    <Layout direction="row" gap={20}>
                        <Txt text="4" fill={Colors.red} fontSize={24} width={100} />
                        <Txt text="2" fill={Colors.yellow} fontSize={24} width={100} />
                        <Txt text="8" fill={Colors.green} fontSize={24} width={100} />
                    </Layout>
                </Layout>
                
                {/* Vectors */}
                <Vector2D
                    ref={this.vectorV1}
                    from={[0, 0]}
                    to={[0,0]}
                    color={Colors.red}
                    lineWidth={8}
                    opacity={0}
                    endArrow
                />
                <Vector2D
                    ref={this.vectorV2}
                    from={[0, 0]}
                    to={[0,0]}
                    color={Colors.yellow}
                    lineWidth={8}
                    opacity={0}
                    endArrow
                />
                
                {/* Collinear Line */}
                <Line
                    ref={this.collinearLine}
                    points={[new Vector2(-1000, -500), new Vector2(1000, 500)]}
                    stroke={Colors.text}
                    lineWidth={2}
                    lineDash={[10, 10]}
                    opacity={0}
                />
                
                <Txt
                    ref={this.questionText}
                    text="4 Apples + 6 Bananas = ?"
                    x={0}
                    y={300}
                    fill={Colors.text}
                    fontSize={48}
                    opacity={0}
                    fontFamily={"JetBrains Mono"}
                />
                
                <Txt
                    ref={this.redundancyText}
                    text="Linearly Dependent (Redundant)"
                    x={0}
                    y={-400}
                    fill={Colors.red}
                    fontSize={48}
                    opacity={0}
                    fontFamily={"JetBrains Mono"}
                />
                
                {/* --- LoRA Demo UI --- */}
                {/* Large Matrix (Grid of numbers) */}
                <Layout ref={this.largeMatrix} opacity={0} layout direction="column" width={1000} height={700} gap={2} alignItems={"center"} justifyContent={"center"}>
                    {Array.from({ length: 25 }).map((_, row) => (
                        <Layout direction="row" gap={2}>
                            {Array.from({ length: 30 }).map((_, col) => (
                                <Txt
                                    text={(Math.random().toFixed(2))}
                                    fill={Colors.text}
                                    fontSize={12}
                                    opacity={0.5}
                                    width={30}
                                    textAlign={"center"}
                                />
                            ))}
                        </Layout>
                    ))}
                </Layout>
                
                {/* GPU Icon */}
                <Layout ref={this.gpuIcon} opacity={0} scale={0} x={0} y={0}>
                    <Rect width={300} height={180} fill={'#333'} radius={10} />
                    <Circle size={80} x={-60} fill={'#555'} />
                    <Circle size={80} x={60} fill={'#555'} />
                    <Txt text="GPU" fill={'#fff'} y={-110} fontSize={32} />
                </Layout>
                
                <Txt
                    ref={this.loraText}
                    text="LoRA / Low-Rank Adaptation"
                    y={300}
                    fill={Colors.green}
                    fontSize={64}
                    opacity={0}
                    fontFamily={"JetBrains Mono"}
                />
            </Layout>
        );
    }

    protected *on_play(): ThreadGenerator {
        // --- Shopping Demo ---
        
        // 1. Show Table
        yield* this.shoppingTable().opacity(1, 1);
        yield* waitFor(0.5);
        
        // 2. Show Axes
        yield* this.axes().opacity(1, 1);
        
        // 3. Extract Vectors
        // V1: (2, 1) * 50 scale (since 100 might be too big for 4,2 -> 400,200 is ok)
        // V2: (4, 2) * 50
        // Use scale 80
        const vScale = 80;
        this.vectorV1().to(new Vector2(2, 1).mul(vScale));
        this.vectorV2().to(new Vector2(4, 2).mul(vScale));
        this.vectorV1().opacity(1);
        this.vectorV2().opacity(1);
        
        yield* all(
            this.vectorV1().animateGrowth(),
            this.vectorV2().animateGrowth()
        );
        yield* waitFor(0.5);
        
        // 4. Show Collinear Line and Redundancy
        yield* all(
            this.collinearLine().opacity(0.5, 1),
            this.redundancyText().opacity(1, 1)
        );
        
        // 5. Question
        yield* this.questionText().opacity(1, 1);
        yield* waitFor(2);
        
        yield* waitUntil("shopping_demo_finished");
        
        // --- LoRA Demo ---
        
        // 1. Clear Screen
        yield* all(
            this.shoppingTable().opacity(0, 0.5),
            this.axes().opacity(0, 0.5),
            this.vectorV1().opacity(0, 0.5),
            this.vectorV2().opacity(0, 0.5),
            this.collinearLine().opacity(0, 0.5),
            this.redundancyText().opacity(0, 0.5),
            this.questionText().opacity(0, 0.5)
        );
        
        // 2. Show Large Matrix
        yield* this.largeMatrix().opacity(1, 1);
        yield* waitFor(1);
        
        // 3. Compress Matrix (Remove rows)
        // Animate children opacity
        const rowsToRemove = this.largeMatrix().children().filter((_, i) => i % 3 !== 0); // Keep 1/3
        yield* all(
            ...rowsToRemove.map(child => child.opacity(0, 1))
        );
        yield* waitFor(0.5);
        
        // 4. Show GPU and Fit
        yield* this.gpuIcon().opacity(1, 0.5);
        yield* this.gpuIcon().scale(1, 0.5);
        
        // Shrink matrix and move to GPU
        yield* all(
            this.largeMatrix().scale(0.2, 1),
            this.largeMatrix().position(this.gpuIcon().position(), 1),
            this.largeMatrix().opacity(0.8, 1) // Keep slightly visible
        );
        
        // 5. Show LoRA Text
        yield* this.loraText().opacity(1, 1);
        
        yield* waitUntil("lora_demo_finished");
    }
}