import { ThreadGenerator, waitFor, waitUntil, all } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Rect } from "@motion-canvas/2d/lib/components";
import { createRef } from "@motion-canvas/core/lib/utils";
import { Vector2 } from "@motion-canvas/core/lib/types";
import { Colors } from "@src/common/colors";

// Math Components
import { Axes2D } from "@src/common/component/2d/math/Axes2D";
import { LatexText } from "@src/common/component/2d/math/LatexText";
import { Vector2D } from "@src/common/component/2d/math/Vector2D";

export class MatrixEquationLayer extends AnimLayer {
    private equationsRef = createRef<LatexText>();
    private matrixEqRef = createRef<LatexText>();
    private linearCombRef = createRef<LatexText>();
    private axesRef = createRef<Axes2D>();
    private vec1Ref = createRef<Vector2D>();
    private vec2Ref = createRef<Vector2D>();
    private vecResultRef = createRef<Vector2D>();
    private questionRef = createRef<LatexText>();

    protected on_build_ui(): void {
        this.root.add(
            <Rect
                width={1920}
                height={1080}
                fill={Colors.background}
            >
                {/* 1. Original Equation */}
                <LatexText
                    ref={this.equationsRef}
                    tex="{\begin{cases} 2x + 3y = 5 \\ x - y = 1 \end{cases}}"
                    fontFill={Colors.text}
                    texFontSize={48}
                    x={-600}
                    y={-300}
                    opacity={0}
                />

                {/* 2. Matrix Equation */}
                <LatexText
                    ref={this.matrixEqRef}
                    tex="\begin{bmatrix} 2 & 3 \\ 1 & -1 \end{bmatrix} \begin{bmatrix} x \\ y \end{bmatrix} = \begin{bmatrix} 5 \\ 1 \end{bmatrix}"
                    fontFill={Colors.text}
                    texFontSize={48}
                    x={400}
                    y={-300}
                    opacity={0}
                    charColors={[
                        // Not strictly precise character indexing here, just placeholder if we wanted detailed coloring
                        // For now we will rely on later steps or simple coloring
                    ]}
                />

                {/* 3. Linear Combination Equation */}
                <LatexText
                    ref={this.linearCombRef}
                    // x [2, 1] + y [3, -1] = [5, 1]
                    // We can use color commands inside latex string for specific parts
                    tex={`x \\begin{bmatrix} 2 \\\\ 1 \\end{bmatrix} + y \\begin{bmatrix} 3 \\\\ -1 \\end{bmatrix} = \\begin{bmatrix} 5 \\\\ 1 \\end{bmatrix}`}
                    fontFill={Colors.text}
                    texFontSize={56}
                    y={200}
                    opacity={0}
                />

                {/* 4. Axes (Reused style) */}
                <Axes2D
                    ref={this.axesRef}
                    xRange={[-900, 900]}
                    yRange={[-500, 500]}
                    step={100}
                    gridColor="#444"
                    gridOpacity={0.2}
                    colorX={Colors.red}
                    colorY={Colors.green}
                    opacity={0}
                />

                {/* 5. Vectors */}
                {/* Vector 1: [2, 1] -> Canvas [200, -100] */}
                <Vector2D
                    ref={this.vec1Ref}
                    from={new Vector2(0, 0)}
                    to={new Vector2(200, -100)}
                    color={Colors.cyan}
                    lineWidth={6}
                    opacity={0}
                />
                
                {/* Vector 2: [3, -1] -> Canvas [300, 100] (y is flipped in canvas: -1 => 100) */}
                <Vector2D
                    ref={this.vec2Ref}
                    from={new Vector2(0, 0)}
                    to={new Vector2(300, 100)}
                    color={Colors.orange}
                    lineWidth={6}
                    opacity={0}
                />

                {/* Result Vector: [5, 1] -> Canvas [500, -100] */}
                <Vector2D
                    ref={this.vecResultRef}
                    from={new Vector2(0, 0)}
                    to={new Vector2(500, -100)}
                    color={Colors.yellow} // Using Yellow for result to match plan description (or white)
                    lineWidth={6}
                    opacity={0}
                />

                {/* 7. Question Text */}
                <LatexText
                    ref={this.questionRef}
                    tex="用什么样的 x, y 进行线性组合才能得到 b ?"
                    fontFill={Colors.text}
                    texFontSize={48}
                    y={400}
                    opacity={0}
                    isText={true} 
                />
            </Rect>
        );
    }

    protected *on_play(): ThreadGenerator {
        // Step 1: Show Original Equation (Quickly if following previous scene, or just appear)
        yield* waitUntil("Scene 2 Start");
        yield* this.equationsRef().opacity(1, 1);

        // Step 2: Show Matrix Equation
        yield* waitUntil("Show Matrix Eq");
        yield* this.matrixEqRef().opacity(1, 1);

        // Step 3: Show Linear Combination Eq
        yield* waitUntil("Show Linear Comb Eq");
        yield* this.linearCombRef().opacity(1, 1);

        // Step 4: Switch to Axes View
        yield* waitUntil("Switch to Axes");
        yield* all(
            this.linearCombRef().opacity(0, 1),
            this.axesRef().opacity(1, 1)
        );

        // Step 5: Render Column Vectors
        yield* waitUntil("Render Vectors");
        
        // Show Vector 1
        this.vec1Ref().opacity(1);
        yield* this.vec1Ref().animateGrowth();
        
        // Show Vector 2
        this.vec2Ref().opacity(1);
        yield* this.vec2Ref().animateGrowth();

        // Also update Matrix Eq colors to match
        // Matrix: [2 3; 1 -1]
        // Col 1 (2,1) -> Cyan
        // Col 2 (3,-1) -> Orange
        // Vector b (5,1) -> Yellow
        const coloredMatrixTex = `\\begin{bmatrix} {\\color{${Colors.cyan}} 2} & {\\color{${Colors.orange}} 3} \\\\ {\\color{${Colors.cyan}} 1} & {\\color{${Colors.orange}} -1} \\end{bmatrix} \\begin{bmatrix} x \\\\ y \\end{bmatrix} = {\\color{${Colors.yellow}} \\begin{bmatrix} 5 \\\\ 1 \\end{bmatrix}}`;
        this.matrixEqRef().tex(coloredMatrixTex);
        
        yield* waitUntil("Vectors Shown");

        // Step 6: Render Result Vector
        yield* waitUntil("Render Result Vector");
        this.vecResultRef().opacity(1);
        yield* this.vecResultRef().animateGrowth();

        // Step 7: Show Question
        yield* waitUntil("Show Question");
        yield* this.questionRef().opacity(1, 1);
    }
}
