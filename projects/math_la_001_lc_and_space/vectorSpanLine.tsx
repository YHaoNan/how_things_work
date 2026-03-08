import { Layout, Line } from "@motion-canvas/2d";
import { ThreadGenerator, createRef, all, waitFor, waitUntil, Vector2, createSignal } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";
import { Axes2D } from "@src/common/component/2d/math/Axes2D";
import { Vector2D } from "@src/common/component/2d/math/Vector2D";
import { LatexText } from "@src/common/component/2d/math/LatexText";

export class VectorSpanLineLayer extends AnimLayer {
    private axes = createRef<Axes2D>();
    private vectorA = createRef<Vector2D>(); // [2, 1]
    private vectorB = createRef<Vector2D>(); // [-2, -1]
    
    // Components for linear combination
    private vectorAComp = createRef<Vector2D>(); // c1 * a
    private vectorBComp = createRef<Vector2D>(); // c2 * b
    private vectorSum = createRef<Vector2D>();   // Result
    
    private equation = createRef<LatexText>();
    private coeffText = createRef<LatexText>();
    private spanLine = createRef<Line>();
    private spanText = createRef<LatexText>();
    
    private aCoords = new Vector2(2, 1);
    private bCoords = new Vector2(-2, -1);
    private scale = 100;

    // Signals for coefficients
    private c1 = createSignal(0);
    private c2 = createSignal(0);

    protected on_build_ui(): void {
        this.root.add(
            <Layout>
                <Axes2D
                    ref={this.axes}
                    xRange={[-900, 900]}
                    yRange={[-500, 500]}
                    step={100}
                    opacity={1}
                    gridOpacity={0.2}
                />
                
                {/* Span Line (Infinite, initially hidden) */}
                <Line
                    ref={this.spanLine}
                    points={[this.aCoords.mul(-1000), this.aCoords.mul(1000)]} // Long line
                    stroke={Colors.red}
                    lineWidth={4}
                    opacity={0}
                    lineDash={[10, 10]}
                />
                
                {/* Base Vectors */}
                <Vector2D
                    ref={this.vectorA}
                    from={[0, 0]}
                    to={[0,0]}
                    color={Colors.purple}
                    lineWidth={8}
                    opacity={0.5}
                    endArrow
                />
                <Vector2D
                    ref={this.vectorB}
                    from={[0, 0]}
                    to={[0,0]}
                    color={Colors.red}
                    lineWidth={8}
                    opacity={0.5}
                    endArrow
                />
                
                {/* Labels for Base Vectors */}
                <LatexText
                    tex="\vec{a} = \begin{bmatrix} 2 \\ 1 \end{bmatrix}"
                    x={250}
                    y={-100}
                    fontFill={Colors.purple}
                    texFontSize={32}
                    opacity={0.8}
                />
                <LatexText
                    tex="\vec{b} = \begin{bmatrix} -2 \\ -1 \end{bmatrix}"
                    x={-250}
                    y={100}
                    fontFill={Colors.red}
                    texFontSize={32}
                    opacity={0.8}
                />
                
                {/* Dynamic Components */}
                <Vector2D
                    ref={this.vectorAComp}
                    from={[0, 0]}
                    to={() => this.aCoords.mul(this.scale).mul(this.c1())}
                    color={Colors.purple}
                    lineWidth={6}
                    endArrow
                />
                
                <Vector2D
                    ref={this.vectorBComp}
                    from={() => {
                        const start = this.vectorAComp().to();
                        return start instanceof Vector2 ? start : new Vector2(start);
                    }}
                    to={() => {
                        const start = this.vectorAComp().to();
                        const startVec = start instanceof Vector2 ? start : new Vector2(start);
                        return startVec.add(this.bCoords.mul(this.scale).mul(this.c2()));
                    }}
                    color={Colors.red}
                    lineWidth={6}
                    endArrow
                />
                
                {/* Result Vector */}
                <Vector2D
                    ref={this.vectorSum}
                    from={[0, 0]}
                    to={() => {
                        const start = this.vectorAComp().to();
                        const startVec = start instanceof Vector2 ? start : new Vector2(start);
                        return startVec.add(this.bCoords.mul(this.scale).mul(this.c2()));
                    }}
                    color={Colors.orange}
                    lineWidth={8}
                    endArrow
                />

                {/* Equation UI */}
                <LatexText
                    ref={this.equation}
                    tex="\vec{u} = c_1 \vec{a} + c_2 \vec{b}"
                    x={400}
                    y={-350}
                    fontFill={Colors.orange}
                    texFontSize={48}
                    opacity={0}
                />
                
                <LatexText
                    ref={this.coeffText}
                    tex={() => `c_1=${this.c1().toFixed(2)}, c_2=${this.c2().toFixed(2)}`}
                    x={400}
                    y={-280}
                    fontFill={Colors.text}
                    texFontSize={40}
                    opacity={0}
                />
                
                <LatexText
                    ref={this.spanText}
                    tex="\text{Span: 1D Line}"
                    x={0}
                    y={350}
                    fontFill={Colors.red}
                    texFontSize={64}
                    opacity={0}
                />
            </Layout>
        );
    }

    protected *on_play(): ThreadGenerator {
        // Init
        this.vectorSum().opacity(0);
        this.vectorAComp().opacity(0);
        this.vectorBComp().opacity(0);
        
        // Show Base Vectors - Fix Visibility
        this.vectorA().to(this.aCoords.mul(this.scale));
        this.vectorB().to(this.bCoords.mul(this.scale));
        
        yield* all(
            this.vectorA().animateGrowth(),
            this.vectorB().animateGrowth()
        );
        yield* waitFor(0.5);
        
        // Show Equation
        yield* all(
            this.equation().opacity(1, 1),
            this.coeffText().opacity(1, 1)
        );
        
        // Start Linear Combination Animation
        this.vectorSum().opacity(1);
        this.vectorAComp().opacity(1);
        this.vectorBComp().opacity(1);
        
        // Animate random coefficients to show it's stuck on the line
        // 1. Expand out
        yield* all(
            this.c1(2, 2),
            this.c2(1, 2),
            this.vectorAComp().animateGrowth(0.5),
            this.vectorBComp().animateGrowth(0.5),
            this.vectorSum().animateGrowth(0.5)
        );
        
        // 2. Move along line (randomly)
        yield* all(
            this.c1(-3, 2),
            this.c2(2, 2)
        );
        
        yield* all(
            this.c1(1.5, 2),
            this.c2(-4, 2)
        );
        
        yield* all(
            this.c1(0, 1),
            this.c2(0, 1)
        );
        
        // 3. Show Conclusion
        yield* all(
            this.spanLine().opacity(0.5, 1),
            this.spanText().opacity(1, 1)
        );
        
        yield* waitUntil("collinear_span_demo_finished");
    }
}