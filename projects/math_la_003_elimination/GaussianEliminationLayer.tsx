import { ThreadGenerator, waitFor, waitUntil, all, createSignal, SimpleSignal } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Rect } from "@motion-canvas/2d/lib/components";
import { createRef } from "@motion-canvas/core/lib/utils";
import { Colors } from "@src/common/colors";

// Math Components
import { LatexText } from "@src/common/component/2d/math/LatexText";

export class GaussianEliminationLayer extends AnimLayer {
    private matrixEqRef = createRef<LatexText>();
    private augmentedMatrixRef = createRef<LatexText>();
    private operationTextRef = createRef<LatexText>();
    private matrixContainer = createRef<Rect>();

    protected on_build_ui(): void {
        this.root.add(
            <Rect
                width={1920}
                height={1080}
                fill={Colors.background}
            >
                {/* 1. Matrix Equation */}
                <LatexText
                    ref={this.matrixEqRef}
                    tex="\begin{bmatrix} 2 & 3 \\ 1 & -1 \end{bmatrix} \begin{bmatrix} x \\ y \end{bmatrix} = \begin{bmatrix} 5 \\ 1 \end{bmatrix}"
                    fontFill={Colors.text}
                    texFontSize={64}
                    opacity={0}
                    y={0}
                />

                {/* 2. Augmented Matrix */}
                <LatexText
                    ref={this.augmentedMatrixRef}
                    tex="\left[ \begin{array}{cc|c} 2 & 3 & 5 \\ 1 & -1 & 1 \end{array} \right]"
                    fontFill={Colors.text}
                    texFontSize={64}
                    opacity={0}
                    y={100}
                />

                {/* 3. Operation Text */}
                <LatexText
                    ref={this.operationTextRef}
                    tex="R_2 \leftarrow R_2 - \frac{1}{2}R_1"
                    fontFill={Colors.yellow}
                    texFontSize={48}
                    opacity={0}
                    y={250}
                />
            </Rect>
        );
    }

    protected *on_play(): ThreadGenerator {
        // Step 1: Show Matrix Equation
        yield* waitUntil("Show Matrix Eq (Gaussian)");
        yield* this.matrixEqRef().opacity(1, 1);

        // Step 2: Transform to Augmented Matrix
        yield* waitUntil("To Augmented Matrix");
        
        // Fade out Matrix Equation and Fade in Augmented Matrix
        // Ideally this would be a smooth morph, but for Latex text simple fade is safer/easier
        yield* all(
            this.matrixEqRef().opacity(0, 0.5),
            this.augmentedMatrixRef().opacity(1, 0.5),
            this.augmentedMatrixRef().y(0, 0.5), // Move up to center
        );

        // Step 3: Show Row Operation
        yield* waitUntil("Show Operation");
        yield* this.operationTextRef().opacity(1, 0.5);

        // Step 4: Execute Elimination
        yield* waitUntil("Execute Elimination");
        
        // Animate the numbers changing in the augmented matrix
        // Old: 1 -1 1
        // New: 0 -2.5 -1.5
        // We will replace the latex string with the updated matrix
        // We can highlight the change by changing color temporarily if possible, 
        // but replacing the tex string is the core action.
        
        const newMatrixTex = "\\left[ \\begin{array}{cc|c} 2 & 3 & 5 \\\\ {\\color{#FFD700}0} & {\\color{#FFD700}-2.5} & {\\color{#FFD700}-1.5} \\end{array} \\right]";
        
        yield* this.augmentedMatrixRef().opacity(0, 0.3);
        this.augmentedMatrixRef().tex(newMatrixTex);
        yield* this.augmentedMatrixRef().opacity(1, 0.3);

        yield* waitUntil("Elimination Done");
    }
}
