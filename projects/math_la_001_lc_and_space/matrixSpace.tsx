import { Layout, Txt, Circle } from "@motion-canvas/2d";
import { ThreadGenerator, createRef, all, waitFor, waitUntil, Vector2, createSignal } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";
import { Axes2D } from "@src/common/component/2d/math/Axes2D";
import { Vector2D } from "@src/common/component/2d/math/Vector2D";
import { LatexText } from "@src/common/component/2d/math/LatexText";

export class MatrixSpaceLayer extends AnimLayer {
    private axes = createRef<Axes2D>();
    private matrix = createRef<LatexText>();
    
    // Extracted Vector Labels
    private vec1Label = createRef<LatexText>();
    private vec2Label = createRef<LatexText>();
    
    // Basis Vectors (Visual)
    private vec1 = createRef<Vector2D>();
    private vec2 = createRef<Vector2D>();
    
    // Dynamic Components for Span
    private vec1Comp = createRef<Vector2D>();
    private vec2Comp = createRef<Vector2D>();
    private vectorSum = createRef<Vector2D>();
    
    private spaceTitle = createRef<Txt>();
    private equation = createRef<LatexText>();
    private spanCircle = createRef<Circle>(); // For full plane effect
    
    private scale = 100;

    // Signals for span animation
    private angle = createSignal(0);
    private spanRadius = createSignal(0);
    private coeffs = createSignal(new Vector2(0, 0)); // Re-impl coeffs as regular signal updated in loop or effect?
    // Actually, let's keep the computed signal approach but ensure it's correct.
    
    // Basis Data
    // Column Space: [2, 1], [2, 2]
    // Row Space: [2, 2], [1, 2]
    private currentBasis1 = createSignal(new Vector2(2, 1));
    private currentBasis2 = createSignal(new Vector2(2, 2));

    // Coefficients Solver
    // We want Result = R * [cos(t), sin(t)]
    // Result = c1 * b1 + c2 * b2
    // Solve [b1 b2] [c1; c2] = Result
    // c = inv([b1 b2]) * Result
    private computedCoeffs = createSignal(() => {
        const b1 = this.currentBasis1();
        const b2 = this.currentBasis2();
        const r = this.spanRadius();
        const theta = this.angle();
        
        const target = new Vector2(r * Math.cos(theta), r * Math.sin(theta));
        
        // Determinant: b1.x*b2.y - b1.y*b2.x
        const det = b1.x * b2.y - b1.y * b2.x;
        
        if (Math.abs(det) < 0.001) return new Vector2(0, 0); // Handle singular case safely
        
        // Inverse matrix: (1/det) * [b2.y, -b2.x; -b1.y, b1.x]
        const c1 = (b2.y * target.x - b2.x * target.y) / det;
        const c2 = (-b1.y * target.x + b1.x * target.y) / det;
        
        return new Vector2(c1, c2);
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
                
                {/* Span Circle (Plane visualization) */}
                <Circle
                    ref={this.spanCircle}
                    size={0}
                    fill={Colors.blue}
                    opacity={0.2}
                    zIndex={-10}
                />
                
                {/* Matrix Display (Top Right) */}
                <LatexText
                    ref={this.matrix}
                    tex="A = \begin{bmatrix} 2 & 2 \\ 1 & 2 \end{bmatrix}"
                    x={400}
                    y={-350}
                    fontFill={Colors.text}
                    texFontSize={48}
                    opacity={0}
                />
                
                {/* Vector Labels (Right side) */}
                <LatexText
                    ref={this.vec1Label}
                    tex="\vec{c_1} = \begin{bmatrix} 2 \\ 1 \end{bmatrix}"
                    x={600}
                    y={-200}
                    fontFill={Colors.purple}
                    texFontSize={32}
                    opacity={0}
                />
                <LatexText
                    ref={this.vec2Label}
                    tex="\vec{c_2} = \begin{bmatrix} 2 \\ 2 \end{bmatrix}"
                    x={750}
                    y={-200}
                    fontFill={Colors.cyan}
                    texFontSize={32}
                    opacity={0}
                />
                
                {/* Title and Equation */}
                <Txt
                    ref={this.spaceTitle}
                    text="Column Space"
                    x={-400}
                    y={-350}
                    fill={Colors.text}
                    fontSize={48}
                    fontFamily={"JetBrains Mono"}
                    opacity={0}
                />
                <LatexText
                    ref={this.equation}
                    tex="\vec{u} = c_1 \vec{v_1} + c_2 \vec{v_2}"
                    x={-400}
                    y={-280}
                    fontFill={Colors.text}
                    texFontSize={32}
                    opacity={0}
                />
                
                {/* Basis Vectors */}
                <Vector2D
                    ref={this.vec1}
                    from={[0, 0]}
                    to={[0,0]}
                    color={Colors.purple}
                    lineWidth={6}
                    opacity={0.5}
                    endArrow
                />
                <Vector2D
                    ref={this.vec2}
                    from={[0, 0]}
                    to={[0,0]}
                    color={Colors.cyan}
                    lineWidth={6}
                    opacity={0.5}
                    endArrow
                />
                
                {/* Dynamic Components */}
                <Vector2D
                    ref={this.vec1Comp}
                    from={[0, 0]}
                    to={() => this.currentBasis1().mul(this.scale).mul(this.computedCoeffs().x)}
                    color={Colors.purple}
                    lineWidth={8}
                    opacity={0}
                    endArrow
                />
                <Vector2D
                    ref={this.vec2Comp}
                    from={() => {
                        const v1Pos = this.vec1Comp().to();
                        return v1Pos instanceof Vector2 ? v1Pos : new Vector2(v1Pos);
                    }}
                    to={() => {
                        const start = this.vec1Comp().to();
                        const startVec = start instanceof Vector2 ? start : new Vector2(start);
                        return startVec.add(this.currentBasis2().mul(this.scale).mul(this.computedCoeffs().y));
                    }}
                    color={Colors.cyan}
                    lineWidth={8}
                    opacity={0}
                    endArrow
                />
                
                {/* Result Vector */}
                <Vector2D
                    ref={this.vectorSum}
                    from={[0, 0]}
                    to={() => {
                        const start = this.vec1Comp().to();
                        const startVec = start instanceof Vector2 ? start : new Vector2(start);
                        return startVec.add(this.currentBasis2().mul(this.scale).mul(this.computedCoeffs().y));
                    }}
                    color={Colors.orange}
                    lineWidth={8}
                    opacity={0}
                    endArrow
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
        // Update labels for Column Space
        this.vec1Label().tex("\\vec{c_1} = \\begin{bmatrix} 2 \\\\ 1 \\end{bmatrix}");
        this.vec2Label().tex("\\vec{c_2} = \\begin{bmatrix} 2 \\\\ 2 \\end{bmatrix}");
        this.vec1Label().fontFill(Colors.purple);
        this.vec2Label().fontFill(Colors.cyan);
        
        // Animate labels appearing
        yield* all(
            this.vec1Label().opacity(1, 1),
            this.vec2Label().opacity(1, 1)
        );
        
        // Animate basis vectors
        this.currentBasis1(new Vector2(2, 1));
        this.currentBasis2(new Vector2(2, 2));
        this.vec1().color(Colors.purple);
        this.vec2().color(Colors.cyan);
        this.vec1Comp().color(Colors.purple);
        this.vec2Comp().color(Colors.cyan);
        
        this.vec1().to(this.currentBasis1().mul(this.scale));
        this.vec2().to(this.currentBasis2().mul(this.scale));
        
        yield* all(
            this.vec1().animateGrowth(),
            this.vec2().animateGrowth()
        );
        
        // 3. Show Title
        this.spaceTitle().text("Column Space");
        yield* all(
            this.spaceTitle().opacity(1, 1),
            this.equation().opacity(1, 1)
        );
        
        // 4. Span Animation (Circular/Spiral + Plane Fill)
        this.vec1Comp().opacity(1);
        this.vec2Comp().opacity(1);
        this.vectorSum().opacity(1);
        
        // Reset signals
        this.spanRadius(0);
        this.angle(0);
        
        // Animate spiral out and plane filling
        yield* all(
            this.spanRadius(5, 4), // Radius 0 -> 5
            this.angle(Math.PI * 4, 4), // 2 rotations
            this.vectorSum().animateGrowth(0.5), // Initial appear
            this.spanCircle().size(2000, 4) // Expand circle to fill screen
        );
        
        yield* waitUntil("col_space_finished");
        
        // --- Part 2: Row Space ---
        
        // 1. Transition / Reset
        yield* all(
            this.spanRadius(0, 1), // Shrink span
            this.spanCircle().size(0, 1), // Shrink plane
            this.vec1Comp().opacity(0, 0.5),
            this.vec2Comp().opacity(0, 0.5),
            this.vectorSum().opacity(0, 0.5),
            this.vec1().opacity(0, 0.5), // Hide old basis
            this.vec2().opacity(0, 0.5),
            this.vec1Label().opacity(0, 0.5),
            this.vec2Label().opacity(0, 0.5)
        );
        
        // 2. Setup Row Space
        this.spaceTitle().text("Row Space");
        
        // Row 1: [2, 2] (Red), Row 2: [1, 2] (Yellow)
        this.vec1Label().tex("\\vec{r_1} = \\begin{bmatrix} 2 \\\\ 2 \\end{bmatrix}");
        this.vec2Label().tex("\\vec{r_2} = \\begin{bmatrix} 1 \\\\ 2 \\end{bmatrix}");
        this.vec1Label().fontFill(Colors.red);
        this.vec2Label().fontFill(Colors.yellow);
        
        this.currentBasis1(new Vector2(2, 2));
        this.currentBasis2(new Vector2(1, 2));
        this.vec1().color(Colors.red);
        this.vec2().color(Colors.yellow);
        this.vec1Comp().color(Colors.red);
        this.vec2Comp().color(Colors.yellow);
        this.spanCircle().fill(Colors.red); // Change plane color for variety? Or keep blue? Let's keep blue for consistency or maybe yellow/red mix? Blue is fine as "Space".
        
        // Reset basis visual positions
        this.vec1().to([0,0]); // Reset to origin first
        this.vec2().to([0,0]);
        // Note: opacity is 0 from previous step
        
        // 3. Show Row Vectors
        yield* all(
            this.vec1Label().opacity(1, 1),
            this.vec2Label().opacity(1, 1)
        );
        
        this.vec1().to(this.currentBasis1().mul(this.scale));
        this.vec2().to(this.currentBasis2().mul(this.scale));
        this.vec1().opacity(0.5); // Restore opacity
        this.vec2().opacity(0.5);
        
        yield* all(
            this.vec1().animateGrowth(),
            this.vec2().animateGrowth()
        );
        
        // 4. Span Animation
        this.vec1Comp().opacity(1);
        this.vec2Comp().opacity(1);
        this.vectorSum().opacity(1);
        
        yield* all(
            this.spanRadius(5, 4), // Expand again
            this.angle(Math.PI * 8, 4), // Rotate more
            this.spanCircle().size(2000, 4) // Expand plane again
        );
        
        yield* waitUntil("row_space_finished");
    }
}