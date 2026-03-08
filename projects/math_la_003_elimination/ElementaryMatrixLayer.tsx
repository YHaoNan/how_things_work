import { ThreadGenerator, waitFor, waitUntil, all, createSignal, SimpleSignal } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Rect } from "@motion-canvas/2d/lib/components";
import { createRef } from "@motion-canvas/core/lib/utils";
import { Colors } from "@src/common/colors";

// Math Components
import { LatexText } from "@src/common/component/2d/math/LatexText";

export class ElementaryMatrixLayer extends AnimLayer {
    private questionRef = createRef<LatexText>();
    private equationRef = createRef<LatexText>();
    private eMatrixRef = createRef<LatexText>();
    private aMatrixRef = createRef<LatexText>();
    private uMatrixRef = createRef<LatexText>();
    private calcTextRef = createRef<LatexText>();

    // Initial Matrices
    private texE = "\\begin{bmatrix} ? & ? \\\\ ? & ? \\end{bmatrix}";
    private texA = "\\begin{bmatrix} 2 & 3 \\\\ 1 & -1 \\end{bmatrix}";
    private texU = "\\begin{bmatrix} 2 & 3 \\\\ 0 & -2.5 \\end{bmatrix}";

    private matricesContainerRef = createRef<Rect>();

    protected on_build_ui(): void {
        this.root.add(
            <Rect
                width={1920}
                height={1080}
                fill={Colors.background}
            >
                {/* 1. Question */}
                <LatexText
                    ref={this.questionRef}
                    tex="如何找到矩阵 E，使得 EA = U ?"
                    fontFill={Colors.text}
                    texFontSize={64}
                    opacity={0}
                    y={-300}
                    isText={true}
                />

                {/* 2. Equation E A = U */}
                <LatexText
                    ref={this.equationRef}
                    tex="E A = U"
                    fontFill={Colors.yellow}
                    texFontSize={80}
                    opacity={0}
                    y={0}
                />

                {/* 3. Matrices Layout (Initially Hidden) */}
                <Rect ref={this.matricesContainerRef} y={50} opacity={0}>
                    {/* E Matrix */}
                    <Rect x={-400}>
                        <LatexText tex="E" fontFill={Colors.yellow} texFontSize={48} y={-100} />
                        <LatexText
                            ref={this.eMatrixRef}
                            tex={this.texE}
                            fontFill={Colors.text}
                            texFontSize={64}
                        />
                    </Rect>
                    <LatexText tex="\cdot" fontFill={Colors.text} texFontSize={64} x={-250} />
                    
                    {/* A Matrix */}
                    <Rect x={-100}>
                        <LatexText tex="A" fontFill={Colors.cyan} texFontSize={48} y={-100} />
                        <LatexText
                            ref={this.aMatrixRef}
                            tex={this.texA}
                            fontFill={Colors.text}
                            texFontSize={64}
                        />
                    </Rect>
                    <LatexText tex="=" fontFill={Colors.text} texFontSize={64} x={100} />

                    {/* U Matrix */}
                    <Rect x={300}>
                        <LatexText tex="U" fontFill={Colors.green} texFontSize={48} y={-100} />
                        <LatexText
                            ref={this.uMatrixRef}
                            tex={this.texU}
                            fontFill={Colors.text}
                            texFontSize={64}
                        />
                    </Rect>
                </Rect>

                {/* 4. Calculation Hint Text */}
                <LatexText
                    ref={this.calcTextRef}
                    tex=""
                    fontFill={Colors.cyan}
                    texFontSize={48}
                    opacity={0}
                    y={300}
                />
            </Rect>
        );
    }

    protected *on_play(): ThreadGenerator {
        // Step 1: Show Question and Equation
        yield* waitUntil("Show Question (Elementary)");
        yield* all(
            this.questionRef().opacity(1, 1),
            this.equationRef().opacity(1, 1)
        );

        // Step 2: Transition to Matrix Form
        yield* waitUntil("Show Matrices");
        
        // Move Question out or fade
        yield* this.questionRef().opacity(0, 0.5);
        
        // Move Equation to top right corner
        yield* all(
            this.equationRef().scale(0.6, 1),
            this.equationRef().position([700, -450], 1)
        );

        // Show Matrices
        yield* this.matricesContainerRef().opacity(1, 1);

        // Step 3: Solve Row 1
        yield* waitUntil("Solve Row 1");
        
        // Highlight Row 1 of E (Unknown)
        // E = [? ?; ? ?] -> Highlight first row
        // We simulate highlight by changing color
        const texE_H1 = "\\begin{bmatrix} {\\color{#FFD700}?} & {\\color{#FFD700}?} \\\\ ? & ? \\end{bmatrix}";
        this.eMatrixRef().tex(texE_H1);

        // Highlight Row 1 of A
        const texA_H1 = "\\begin{bmatrix} {\\color{#FFD700}2} & {\\color{#FFD700}3} \\\\ 1 & -1 \\end{bmatrix}";
        this.aMatrixRef().tex(texA_H1); // Actually A's rows are used, but we focus on R1 output
        
        // Highlight Row 1 of U (Target)
        const texU_H1 = "\\begin{bmatrix} {\\color{#FFD700}2} & {\\color{#FFD700}3} \\\\ 0 & -2.5 \\end{bmatrix}";
        this.uMatrixRef().tex(texU_H1);

        // Show Hint
        this.calcTextRef().tex("R_1(U) = 1 \\cdot R_1(A) + 0 \\cdot R_2(A)");
        yield* this.calcTextRef().opacity(1, 0.5);
        yield* waitFor(1);

        // Reveal E Row 1
        const texE_R1 = "\\begin{bmatrix} {\\color{#FFD700}1} & {\\color{#FFD700}0} \\\\ ? & ? \\end{bmatrix}";
        yield* this.eMatrixRef().opacity(0, 0.3);
        this.eMatrixRef().tex(texE_R1);
        yield* this.eMatrixRef().opacity(1, 0.3);
        yield* waitFor(0.5);

        // Reset Colors
        this.eMatrixRef().tex("\\begin{bmatrix} 1 & 0 \\\\ ? & ? \\end{bmatrix}");
        this.aMatrixRef().tex(this.texA);
        this.uMatrixRef().tex(this.texU);
        yield* this.calcTextRef().opacity(0, 0.5);


        // Step 4: Solve Row 2
        yield* waitUntil("Solve Row 2");

        // Highlight Row 2 of E
        const texE_H2 = "\\begin{bmatrix} 1 & 0 \\\\ {\\color{#FFD700}?} & {\\color{#FFD700}?} \\end{bmatrix}";
        this.eMatrixRef().tex(texE_H2);

        // Highlight All of A (Since linear combination uses all rows)
        // Or just normal A is fine, maybe highlight Row 1 and Row 2 differently?
        // Let's highlight both rows of A
        const texA_All = "\\begin{bmatrix} {\\color{#00FFFF}2} & {\\color{#00FFFF}3} \\\\ {\\color{#FF00FF}1} & {\\color{#FF00FF}-1} \\end{bmatrix}";
        this.aMatrixRef().tex(texA_All);

        // Highlight Row 2 of U
        const texU_H2 = "\\begin{bmatrix} 2 & 3 \\\\ {\\color{#FFD700}0} & {\\color{#FFD700}-2.5} \\end{bmatrix}";
        this.uMatrixRef().tex(texU_H2);

        // Show Hint: R2(U) = R2(A) - 0.5 * R1(A)
        // Which means -0.5 * R1 + 1 * R2
        this.calcTextRef().tex("R_2(U) = -0.5 \\cdot R_1(A) + 1 \\cdot R_2(A)");
        yield* this.calcTextRef().opacity(1, 0.5);
        yield* waitFor(1);

        // Reveal E Row 2
        const texE_R2 = "\\begin{bmatrix} 1 & 0 \\\\ {\\color{#FFD700}-0.5} & {\\color{#FFD700}1} \\end{bmatrix}";
        yield* this.eMatrixRef().opacity(0, 0.3);
        this.eMatrixRef().tex(texE_R2);
        yield* this.eMatrixRef().opacity(1, 0.3);
        yield* waitFor(0.5);

        // Step 5: Final Result
        yield* waitUntil("Final E");
        // Reset Colors
        const texE_Final = "\\begin{bmatrix} 1 & 0 \\\\ -0.5 & 1 \\end{bmatrix}";
        this.eMatrixRef().tex(texE_Final);
        this.aMatrixRef().tex(this.texA);
        this.uMatrixRef().tex(this.texU);
        
        yield* this.calcTextRef().opacity(0, 0.5);
        
        // Emphasize E
        yield* this.eMatrixRef().scale(1.2, 0.5).to(1, 0.5);
    }
}
