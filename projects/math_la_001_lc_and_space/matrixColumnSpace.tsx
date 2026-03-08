import { Layout, Rect, Txt } from "@motion-canvas/2d";
import { ThreadGenerator, createRef, all, waitFor, waitUntil, Vector2, createSignal } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";
import { Axes2D } from "@src/common/component/2d/math/Axes2D";
import { Vector2D } from "@src/common/component/2d/math/Vector2D";
import { LatexText } from "@src/common/component/2d/math/LatexText";

export class MatrixColumnSpaceLayer extends AnimLayer {
    private axes = createRef<Axes2D>();
    private matrix = createRef<LatexText>();
    private col1 = createRef<Vector2D>(); // [2, 1]
    private col2 = createRef<Vector2D>(); // [2, 2]
    
    // Components for linear combination (Span demo)
    private col1Comp = createRef<Vector2D>();
    private col2Comp = createRef<Vector2D>();
    private vectorSum = createRef<Vector2D>();
    private spanText = createRef<Txt>();
    
    // Explicit references for the extracted text labels to animate them
    private col1Text = createRef<LatexText>();
    private col2Text = createRef<LatexText>();
    
    // Basis Vectors as Signals for reuse (Column Space -> Row Space)
    private basis1 = createSignal(new Vector2(2, 1));
    private basis2 = createSignal(new Vector2(2, 2));
    private scale = 100;

    // Signals for coefficients
    private angle = createSignal(0);
    private spanRadius = createSignal(0); // Start at 0

    // Derived coefficients for circular/spiral motion
    // To show "spanning", we want the result vector to sweep the area.
    // A simple spiral isn't enough if components aren't visible clearly.
    // Let's make the result vector rotate in a circle, and the components adjust.
    // Similar to VectorSpanLayer's circular motion.
    
    // Matrix A = [c1 c2] = [[2, 2], [1, 2]]
    // We want u = x*c1 + y*c2 to rotate in a circle.
    // Let u = [R cos(t), R sin(t)].
    // We need to solve [c1 c2] [x; y] = u for x, y.
    // A = [[2, 2], [1, 2]]
    // det(A) = 4 - 2 = 2.
    // inv(A) = (1/2) * [[2, -2], [-1, 2]] = [[1, -1], [-0.5, 1]]
    // So [x; y] = [[1, -1], [-0.5, 1]] * [u_x; u_y]
    // x = u_x - u_y
    // y = -0.5*u_x + u_y
    
    private c1 = createSignal(() => {
        const theta = this.angle();
        const r = this.spanRadius(); // Animate R to spiral out
        const ux = r * Math.cos(theta);
        const uy = r * Math.sin(theta);
        
        // x = ux - uy
        // But we need to account for scale? No, basis vectors already scaled.
        // Let's assume r is in "grid units".
        // If scale=100, then r=5 means 500 pixels.
        // Our basis vectors are [2,1] and [2,2].
        // To reach [5, 0], we need coeffs.
        
        // The formula x = ux - uy assumes standard basis for u.
        // Let's use the inverse matrix logic:
        return (ux - uy) / Math.sqrt(5); // Normalize slightly? No, direct inverse.
        // Wait, the visual vectors are length ~2.2 and ~2.8.
        // If we want result to circle at radius R=5 (relative to grid 1 unit),
        // Then ux, uy should be in grid units.
        return (ux - uy); 
    });
    
    private c2 = createSignal(() => {
        const theta = this.angle();
        const r = this.spanRadius();
        const ux = r * Math.cos(theta);
        const uy = r * Math.sin(theta);
        
        // y = -0.5*ux + uy
        return (-0.5 * ux + uy);
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
                    fontFill={Colors.text} // Should be white/light in dark theme
                    texFontSize={48}
                    opacity={0}
                />
                
                {/* Extracted Column Vectors Display */}
                <LatexText
                    ref={this.col1Text}
                    tex="\vec{c_1} = \begin{bmatrix} 2 \\ 1 \end{bmatrix}"
                    x={600}
                    y={-100}
                    fontFill={Colors.purple}
                    texFontSize={32}
                    opacity={0} // Start hidden
                />
                <LatexText
                    ref={this.col2Text}
                    tex="\vec{c_2} = \begin{bmatrix} 2 \\ 2 \end{bmatrix}"
                    x={750}
                    y={-100}
                    fontFill={Colors.cyan}
                    texFontSize={32}
                    opacity={0} // Start hidden
                />
                
                {/* Base Vectors (Reused for Col/Row) */}
                <Vector2D
                    ref={this.col1}
                    from={[0, 0]}
                    to={[0,0]}
                    color={Colors.purple}
                    lineWidth={8}
                    opacity={0.5}
                    endArrow
                />
                <Vector2D
                    ref={this.col2}
                    from={[0, 0]}
                    to={[0,0]}
                    color={Colors.cyan}
                    lineWidth={8}
                    opacity={0.5}
                    endArrow
                />
                
                {/* Dynamic Components for Span */}
                <Vector2D
                    ref={this.col1Comp}
                    from={[0, 0]}
                    to={() => this.basis1().mul(this.scale).mul(this.c1())}
                    color={Colors.purple}
                    lineWidth={6}
                    opacity={0}
                    endArrow
                />
                
                <Vector2D
                    ref={this.col2Comp}
                    from={() => {
                        const start = this.col1Comp().to();
                        return start instanceof Vector2 ? start : new Vector2(start);
                    }}
                    to={() => {
                        const start = this.col1Comp().to();
                        const startVec = start instanceof Vector2 ? start : new Vector2(start);
                        return startVec.add(this.basis2().mul(this.scale).mul(this.c2()));
                    }}
                    color={Colors.cyan}
                    lineWidth={6}
                    opacity={0}
                    endArrow
                />
                
                <Vector2D
                    ref={this.vectorSum}
                    from={[0, 0]}
                    to={() => {
                        const start = this.col1Comp().to();
                        const startVec = start instanceof Vector2 ? start : new Vector2(start);
                        return startVec.add(this.basis2().mul(this.scale).mul(this.c2()));
                    }}
                    color={Colors.orange}
                    lineWidth={8}
                    opacity={0}
                    endArrow
                />
                
                <Txt
                    ref={this.spanText}
                    text="Column Space"
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
        // --- Part 1: Column Space ---
        
        // 1. Show Matrix
        yield* this.matrix().opacity(1, 1);
        yield* waitFor(0.5);
        
        // 2. Extract Columns
        // Animate vectors growing
        this.col1().to(this.basis1().mul(this.scale));
        this.col2().to(this.basis2().mul(this.scale));
        
        yield* all(
            this.col1().animateGrowth(),
            this.col2().animateGrowth()
        );
        yield* waitFor(0.5);
        
        // 3. Show Column Space Title
        yield* this.spanText().opacity(1, 1);
        
        // 4. Demonstrate Span (Spiral out)
        this.col1Comp().opacity(1);
        this.col2Comp().opacity(1);
        this.vectorSum().opacity(1);
        
        yield* all(
            this.spanRadius(5, 4), // Radius 0 -> 5
            this.angle(Math.PI * 4, 4) // 2 rotations
        );
        
        yield* waitUntil("matrix_col_space_finished");
        
        // --- End of Column Space Scene ---
    }
}
