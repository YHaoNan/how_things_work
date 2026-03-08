import { ThreadGenerator, waitFor, waitUntil, all, createSignal, SimpleSignal } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Rect } from "@motion-canvas/2d/lib/components";
import { createRef } from "@motion-canvas/core/lib/utils";
import { Colors } from "@src/common/colors";

// Math Components
import { LatexText } from "@src/common/component/2d/math/LatexText";

export class SolveSubstitutionLayer extends AnimLayer {
    private augmentedMatrixRef = createRef<LatexText>();
    private equationSystemRef = createRef<LatexText>();
    private resultVectorRef = createRef<LatexText>();

    protected on_build_ui(): void {
        this.root.add(
            <Rect
                width={1920}
                height={1080}
                fill={Colors.background}
            >
                {/* 1. Augmented Matrix (Final State from previous scene) */}
                <LatexText
                    ref={this.augmentedMatrixRef}
                    tex="\\left[ \\begin{array}{cc|c} 2 & 3 & 5 \\\\ 0 & -2.5 & -1.5 \\end{array} \\right]"
                    fontFill={Colors.text}
                    texFontSize={64}
                    opacity={0}
                    y={0}
                    x={-400}
                />

                {/* 2. Equation System */}
                <LatexText
                    ref={this.equationSystemRef}
                    // Initial state: 2x + 3y = 5, 0x - 2.5y = -1.5
                    tex="\begin{cases} 2x + 3y = 5 \\ 1x - 1y = 1 \end{cases}"
                    fontFill={Colors.text}
                    texFontSize={64}
                    opacity={0}
                    x={400}
                    y={0}
                />

                {/* 4. Final Result Vector */}
                <LatexText
                    ref={this.resultVectorRef}
                    tex="\vec{x} = \begin{bmatrix} 1.6 \\ 0.6 \end{bmatrix}"
                    fontFill={Colors.yellow}
                    texFontSize={64}
                    opacity={0}
                    x={300}
                    y={350}
                />
            </Rect>
        );
    }

    protected *on_play(): ThreadGenerator {
        // Step 0: Initialize
        this.augmentedMatrixRef().tex("\\left[ \\begin{array}{cc|c} 2 & 3 & 5 \\\\ 0 & -2.5 & -1.5 \\end{array} \\right]");
        yield* this.augmentedMatrixRef().opacity(1, 1);

        // Step 1: Show Original Equation System derived from Matrix
        yield* waitUntil("Show Equations (Solve)");
        yield* this.equationSystemRef().opacity(1, 1);

        // Step 2: Solve for Y (Update Equation System)
        yield* waitUntil("Solve for Y");
        // Highlight Row 2 in Matrix
        const highlightRow2Tex = "\\left[ \\begin{array}{cc|c} 2 & 3 & 5 \\\\ {\\color{#FFD700}0} & {\\color{#FFD700}-2.5} & {\\color{#FFD700}-1.5} \\end{array} \\right]";
        this.augmentedMatrixRef().tex(highlightRow2Tex);
        
        // Show substitution step: 0x - 2.5y = -1.5 -> y = 0.6
        // We want to show the substitution happening on the equation system
        
        // 1. Highlight the second equation in the system
        const eqHighlightY = "\\begin{cases} 2x + 3y = 5 \\\\ {\\color{#FFD700}0x - 2.5y = -1.5} \\end{cases}";
        this.equationSystemRef().tex(eqHighlightY);
        yield* waitFor(1);

        // 2. Transform to y = 0.6
        const eqStep1 = "\\begin{cases} 2x + 3y = 5 \\\\ {\\color{#FFD700}y = 0.6} \\end{cases}";
        yield* this.equationSystemRef().opacity(0, 0.3);
        this.equationSystemRef().tex(eqStep1);
        yield* this.equationSystemRef().opacity(1, 0.3);
        yield* waitFor(0.5);

        // 3. Reset color
        const eqStep1Normal = "\\begin{cases} 2x + 3y = 5 \\\\ y = 0.6 \\end{cases}";
        this.equationSystemRef().tex(eqStep1Normal);


        // Step 3: Solve for X (Update Equation System)
        yield* waitUntil("Solve for X");
        // Highlight Row 1 in Matrix
        const highlightRow1Tex = "\\left[ \\begin{array}{cc|c} {\\color{#FFD700}2} & {\\color{#FFD700}3} & {\\color{#FFD700}5} \\\\ 0 & -2.5 & -1.5 \\end{array} \\right]";
        this.augmentedMatrixRef().tex(highlightRow1Tex);

        // 1. Highlight the first equation and show substitution of y=0.6
        const eqHighlightX = "\\begin{cases} {\\color{#FFD700}2x + 3(0.6) = 5} \\\\ y = 0.6 \\end{cases}";
        this.equationSystemRef().tex(eqHighlightX);
        yield* waitFor(1);

        // 2. Transform to result
        const eqStep2 = "\\begin{cases} {\\color{#FFD700}x = 1.6} \\\\ y = 0.6 \\end{cases}";
        yield* this.equationSystemRef().opacity(0, 0.3);
        this.equationSystemRef().tex(eqStep2);
        yield* this.equationSystemRef().opacity(1, 0.3);
        yield* waitFor(0.5);

        // 3. Reset color
        const eqStep2Normal = "\\begin{cases} x = 1.6 \\\\ y = 0.6 \\end{cases}";
        this.equationSystemRef().tex(eqStep2Normal);

        // Step 4: Show Result Vector
        yield* waitUntil("Show Result");
        // Reset matrix color
        const normalTex = "\\left[ \\begin{array}{cc|c} 2 & 3 & 5 \\\\ 0 & -2.5 & -1.5 \\end{array} \\right]";
        this.augmentedMatrixRef().tex(normalTex);
        
        yield* this.resultVectorRef().opacity(1, 1);
    }
}
