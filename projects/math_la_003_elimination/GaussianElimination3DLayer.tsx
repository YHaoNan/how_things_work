import { ThreadGenerator, waitFor, waitUntil, all, createSignal, SimpleSignal } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Rect } from "@motion-canvas/2d/lib/components";
import { createRef } from "@motion-canvas/core/lib/utils";
import { Colors } from "@src/common/colors";

// Math Components
import { LatexText } from "@src/common/component/2d/math/LatexText";

export class GaussianElimination3DLayer extends AnimLayer {
    private equationSystemRef = createRef<LatexText>();
    private augmentedMatrixRef = createRef<LatexText>();
    private operationTextRef = createRef<LatexText>();
    private solveRef = createRef<LatexText>();

    protected on_build_ui(): void {
        this.root.add(
            <Rect
                width={1920}
                height={1080}
                fill={Colors.background}
            >
                {/* 1. Equation System */}
                <LatexText
                    ref={this.equationSystemRef}
                    tex="\begin{cases} x + y + z = 6 \\ 2x + 3y + z = 11 \\ x - y + 2z = 5 \end{cases}"
                    fontFill={Colors.text}
                    texFontSize={64}
                    opacity={0}
                    y={0}
                />

                {/* 2. Augmented Matrix */}
                <LatexText
                    ref={this.augmentedMatrixRef}
                    tex="\left[ \begin{array}{ccc|c} 1 & 1 & 1 & 6 \\ 2 & 3 & 1 & 11 \\ 1 & -1 & 2 & 5 \end{array} \right]"
                    fontFill={Colors.text}
                    texFontSize={64}
                    opacity={0}
                    y={0}
                />

                {/* 3. Operation Text */}
                <LatexText
                    ref={this.operationTextRef}
                    tex=""
                    fontFill={Colors.yellow}
                    texFontSize={48}
                    opacity={0}
                    y={300}
                />

                {/* 4. Solve Text */}
                <LatexText
                    ref={this.solveRef}
                    tex=""
                    fontFill={Colors.text}
                    texFontSize={48}
                    opacity={0}
                    x={400}
                    y={0}
                />
            </Rect>
        );
    }

    protected *on_play(): ThreadGenerator {
        // Step 1: Show Equation System
        yield* waitUntil("Show 3D Eq");
        yield* this.equationSystemRef().opacity(1, 1);

        // Step 2: To Augmented Matrix
        yield* waitUntil("To Augmented Matrix (3D)");
        // Keep equation system visible but fade out to update it later
        yield* all(
            this.equationSystemRef().opacity(0, 0.5),
            this.augmentedMatrixRef().opacity(1, 0.5)
        );

        // Step 3: Column 1 Elimination
        yield* waitUntil("Col 1 Elimination");
        this.operationTextRef().tex("R_2 \\leftarrow R_2 - 2R_1, \\quad R_3 \\leftarrow R_3 - R_1");
        yield* this.operationTextRef().opacity(1, 0.5);
        yield* waitFor(1);

        // Update Matrix
        // R2 - 2R1: (2,3,1,11) - (2,2,2,12) = (0,1,-1,-1)
        // R3 - R1: (1,-1,2,5) - (1,1,1,6) = (0,-2,1,-1)
        const matrixStep1 = "\\left[ \\begin{array}{ccc|c} 1 & 1 & 1 & 6 \\\\ {\\color{#FFD700}0} & {\\color{#FFD700}1} & {\\color{#FFD700}-1} & {\\color{#FFD700}-1} \\\\ {\\color{#FFD700}0} & {\\color{#FFD700}-2} & {\\color{#FFD700}1} & {\\color{#FFD700}-1} \\end{array} \\right]";
        yield* this.augmentedMatrixRef().opacity(0, 0.3);
        this.augmentedMatrixRef().tex(matrixStep1);
        yield* this.augmentedMatrixRef().opacity(1, 0.3);
        yield* waitFor(0.5);

        // Reset Color
        const matrixStep1Normal = "\\left[ \\begin{array}{ccc|c} 1 & 1 & 1 & 6 \\\\ 0 & 1 & -1 & -1 \\\\ 0 & -2 & 1 & -1 \\end{array} \\right]";
        this.augmentedMatrixRef().tex(matrixStep1Normal);

        // Step 4: Column 2 Elimination
        yield* waitUntil("Col 2 Elimination");
        this.operationTextRef().tex("R_3 \\leftarrow R_3 + 2R_2");
        yield* waitFor(1);

        // Update Matrix
        // R3 + 2R2: (0,-2,1,-1) + (0,2,-2,-2) = (0,0,-1,-3)
        const matrixStep2 = "\\left[ \\begin{array}{ccc|c} 1 & 1 & 1 & 6 \\\\ 0 & 1 & -1 & -1 \\\\ 0 & 0 & {\\color{#FFD700}-1} & {\\color{#FFD700}-3} \\end{array} \\right]";
        yield* this.augmentedMatrixRef().opacity(0, 0.3);
        this.augmentedMatrixRef().tex(matrixStep2);
        yield* this.augmentedMatrixRef().opacity(1, 0.3);
        yield* waitFor(0.5);

        // Reset Color
        const matrixStep2Normal = "\\left[ \\begin{array}{ccc|c} 1 & 1 & 1 & 6 \\\\ 0 & 1 & -1 & -1 \\\\ 0 & 0 & -1 & -3 \\end{array} \\right]";
        this.augmentedMatrixRef().tex(matrixStep2Normal);
        
        yield* this.operationTextRef().opacity(0, 0.5);

        // Step 5: Back Substitution (Similar to 2D case)
        yield* waitUntil("Back Substitution");
        
        // Move Matrix to left
        yield* this.augmentedMatrixRef().x(-400, 1);

        // Show simplified equation system corresponding to upper triangular matrix
        // x + y + z = 6
        // 0x + y - z = -1
        // 0x + 0y - z = -3
        const eqSystemTriangular = "\\begin{cases} x + y + z = 6 \\\\ 0x + y - z = -1 \\\\ 0x + 0y - z = -3 \\end{cases}";
        this.equationSystemRef().tex(eqSystemTriangular);
        this.equationSystemRef().x(300); // Position to the right
        yield* this.equationSystemRef().opacity(1, 1);

        // Solve z
        yield* waitUntil("Solve z");
        // Highlight 3rd row in Matrix
        const matrixHighlightRow3 = "\\left[ \\begin{array}{ccc|c} 1 & 1 & 1 & 6 \\\\ 0 & 1 & -1 & -1 \\\\ {\\color{#FFD700}0} & {\\color{#FFD700}0} & {\\color{#FFD700}-1} & {\\color{#FFD700}-3} \\end{array} \\right]";
        this.augmentedMatrixRef().tex(matrixHighlightRow3);
        
        // Highlight 3rd equation: 0x + 0y - z = -3
        const eqHighlightZ = "\\begin{cases} x + y + z = 6 \\\\ 0x + y - z = -1 \\\\ {\\color{#FFD700}0x + 0y - z = -3} \\end{cases}";
        this.equationSystemRef().tex(eqHighlightZ);
        yield* waitFor(1);

        // Transform 3rd equation to z = 3
        const eqStepZ = "\\begin{cases} x + y + z = 6 \\\\ 0x + y - z = -1 \\\\ {\\color{#FFD700}z = 3} \\end{cases}";
        yield* this.equationSystemRef().opacity(0, 0.3);
        this.equationSystemRef().tex(eqStepZ);
        yield* this.equationSystemRef().opacity(1, 0.3);
        yield* waitFor(0.5);

        // Reset Color
        const eqStepZNormal = "\\begin{cases} x + y + z = 6 \\\\ 0x + y - z = -1 \\\\ z = 3 \\end{cases}";
        this.equationSystemRef().tex(eqStepZNormal);


        // Solve y
        yield* waitUntil("Solve y");
        // Highlight 2nd row in Matrix
        const matrixHighlightRow2 = "\\left[ \\begin{array}{ccc|c} 1 & 1 & 1 & 6 \\\\ {\\color{#FFD700}0} & {\\color{#FFD700}1} & {\\color{#FFD700}-1} & {\\color{#FFD700}-1} \\\\ 0 & 0 & -1 & -3 \\end{array} \\right]";
        this.augmentedMatrixRef().tex(matrixHighlightRow2);

        // Highlight 2nd equation and substitute z=3
        const eqHighlightY = "\\begin{cases} x + y + z = 6 \\\\ {\\color{#FFD700}0x + y - 3 = -1} \\\\ z = 3 \\end{cases}";
        this.equationSystemRef().tex(eqHighlightY);
        yield* waitFor(1);

        // Transform 2nd equation to y = 2
        const eqStepY = "\\begin{cases} x + y + z = 6 \\\\ {\\color{#FFD700}y = 2} \\\\ z = 3 \\end{cases}";
        yield* this.equationSystemRef().opacity(0, 0.3);
        this.equationSystemRef().tex(eqStepY);
        yield* this.equationSystemRef().opacity(1, 0.3);
        yield* waitFor(0.5);

        // Reset Color
        const eqStepYNormal = "\\begin{cases} x + y + z = 6 \\\\ y = 2 \\\\ z = 3 \\end{cases}";
        this.equationSystemRef().tex(eqStepYNormal);


        // Solve x
        yield* waitUntil("Solve x");
        // Highlight 1st row in Matrix
        const matrixHighlightRow1 = "\\left[ \\begin{array}{ccc|c} {\\color{#FFD700}1} & {\\color{#FFD700}1} & {\\color{#FFD700}1} & {\\color{#FFD700}6} \\\\ 0 & 1 & -1 & -1 \\\\ 0 & 0 & -1 & -3 \\end{array} \\right]";
        this.augmentedMatrixRef().tex(matrixHighlightRow1);

        // Highlight 1st equation and substitute y=2, z=3
        const eqHighlightX = "\\begin{cases} {\\color{#FFD700}x + 2 + 3 = 6} \\\\ y = 2 \\\\ z = 3 \\end{cases}";
        this.equationSystemRef().tex(eqHighlightX);
        yield* waitFor(1);

        // Transform 1st equation to x = 1
        const eqStepX = "\\begin{cases} {\\color{#FFD700}x = 1} \\\\ y = 2 \\\\ z = 3 \\end{cases}";
        yield* this.equationSystemRef().opacity(0, 0.3);
        this.equationSystemRef().tex(eqStepX);
        yield* this.equationSystemRef().opacity(1, 0.3);
        yield* waitFor(0.5);

        // Reset Color
        const eqStepXNormal = "\\begin{cases} x = 1 \\\\ y = 2 \\\\ z = 3 \\end{cases}";
        this.equationSystemRef().tex(eqStepXNormal);
        
        // Reset Matrix Color
        this.augmentedMatrixRef().tex(matrixStep2Normal);


        // Final Solution Vector
        yield* waitUntil("Final Solution");
        yield* all(
            this.equationSystemRef().opacity(0, 0.5),
            this.augmentedMatrixRef().opacity(0, 0.5)
        );
        
        this.solveRef().tex("\\vec{x} = \\begin{bmatrix} 1 \\\\ 2 \\\\ 3 \\end{bmatrix}");
        this.solveRef().fontFill(Colors.yellow);
        this.solveRef().texFontSize(64);
        this.solveRef().x(0); // Center it
        this.solveRef().y(0);
        yield* this.solveRef().opacity(1, 0.5);
        yield* this.solveRef().scale(1.2, 0.5);
    }
}
