import { Layout, Rect, Txt } from "@motion-canvas/2d";
import { ThreadGenerator, createRef, all, waitFor, waitUntil, Vector2, createSignal } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";
import { Axes2D } from "@src/common/component/2d/math/Axes2D";
import { Vector2D } from "@src/common/component/2d/math/Vector2D";
import { LatexText } from "@src/common/component/2d/math/LatexText";

export class MatrixRowSpaceLayer extends AnimLayer {
    private axes = createRef<Axes2D>();
    private matrix = createRef<LatexText>();
    private row1 = createRef<Vector2D>(); // [2, 2]
    private row2 = createRef<Vector2D>(); // [1, 2]
    
    // Components for linear combination (Span demo)
    private row1Comp = createRef<Vector2D>();
    private row2Comp = createRef<Vector2D>();
    private vectorSum = createRef<Vector2D>();
    private spanText = createRef<Txt>();
    
    // Basis Vectors for Row Space
    // A = [2 2; 1 2]
    // Row 1: [2, 2]
    // Row 2: [1, 2]
    private basis1 = new Vector2(2, 2);
    private basis2 = new Vector2(1, 2);
    private scale = 100;

    // Signals for coefficients
    private angle = createSignal(0);
    private spanRadius = createSignal(0); // Start at 0

    // Derived coefficients for circular/spiral motion
    private c1 = createSignal(() => {
        const theta = this.angle();
        const r = this.spanRadius();
        return r * Math.cos(theta);
    });
    
    private c2 = createSignal(() => {
        const theta = this.angle();
        const r = this.spanRadius();
        return r * Math.sin(theta);
    });

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
                
                {/* Matrix Display */}
                <LatexText
                    ref={this.matrix}
                    tex="A = \begin{bmatrix} 2 & 2 \\ 1 & 2 \end{bmatrix}"
                    x={400}
                    y={-300}
                    fontFill={Colors.text}
                    texFontSize={48}
                    opacity={1} // Keep matrix visible from previous scene context
                />
                
                {/* Row Vectors (Base) */}
                <Vector2D
                    ref={this.row1}
                    from={[0, 0]}
                    to={[0,0]}
                    color={Colors.red}
                    lineWidth={8}
                    opacity={0.5}
                    endArrow
                />
                <Vector2D
                    ref={this.row2}
                    from={[0, 0]}
                    to={[0,0]}
                    color={Colors.yellow}
                    lineWidth={8}
                    opacity={0.5}
                    endArrow
                />
                
                {/* Dynamic Components for Span */}
                <Vector2D
                    ref={this.row1Comp}
                    from={[0, 0]}
                    to={() => this.basis1.mul(this.scale).mul(this.c1())}
                    color={Colors.red}
                    lineWidth={6}
                    opacity={0}
                    endArrow
                />
                
                <Vector2D
                    ref={this.row2Comp}
                    from={() => {
                        const start = this.row1Comp().to();
                        return start instanceof Vector2 ? start : new Vector2(start);
                    }}
                    to={() => {
                        const start = this.row1Comp().to();
                        const startVec = start instanceof Vector2 ? start : new Vector2(start);
                        return startVec.add(this.basis2.mul(this.scale).mul(this.c2()));
                    }}
                    color={Colors.yellow}
                    lineWidth={6}
                    opacity={0}
                    endArrow
                />
                
                <Vector2D
                    ref={this.vectorSum}
                    from={[0, 0]}
                    to={() => {
                        const start = this.row1Comp().to();
                        const startVec = start instanceof Vector2 ? start : new Vector2(start);
                        return startVec.add(this.basis2.mul(this.scale).mul(this.c2()));
                    }}
                    color={Colors.orange}
                    lineWidth={8}
                    opacity={0}
                    endArrow
                />
                
                <Txt
                    ref={this.spanText}
                    text="Row Space"
                    x={0}
                    y={-400}
                    fill={Colors.text}
                    fontSize={64}
                    opacity={0}
                    fontFamily={"JetBrains Mono"}
                />
            </Layout>
        );
    }

    protected *on_play(): ThreadGenerator {
        // 1. Init
        // Show Matrix (already visible but let's ensure opacity)
        this.matrix().opacity(1);
        
        // 2. Extract Rows
        // Animate vectors growing
        this.row1().to(this.basis1.mul(this.scale));
        this.row2().to(this.basis2.mul(this.scale));
        
        yield* all(
            this.row1().animateGrowth(),
            this.row2().animateGrowth()
        );
        yield* waitFor(0.5);
        
        // 3. Show Row Space Title
        yield* this.spanText().opacity(1, 1);
        
        // 4. Demonstrate Span (Spiral out)
        this.row1Comp().opacity(1);
        this.row2Comp().opacity(1);
        this.vectorSum().opacity(1);
        
        yield* all(
            this.spanRadius(5, 4), // Radius 0 -> 5
            this.angle(Math.PI * 4, 4) // 2 rotations
        );
        
        yield* waitUntil("matrix_row_space_finished");
    }
}