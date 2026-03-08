import { ThreadGenerator, waitFor, waitUntil, all, createSignal, SimpleSignal } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Rect } from "@motion-canvas/2d/lib/components";
import { createRef } from "@motion-canvas/core/lib/utils";
import { Colors } from "@src/common/colors";

// Math Components
import { LatexText } from "@src/common/component/2d/math/LatexText";

export class InverseMatrixLayer extends AnimLayer {
    private text1Ref = createRef<LatexText>();
    private text2Ref = createRef<LatexText>();
    private equationRef = createRef<LatexText>();
    
    // Matrix references for A = E^-1 U
    private invEMatrixRef = createRef<LatexText>();
    private uMatrixRef = createRef<LatexText>();
    private aMatrixRef = createRef<LatexText>();
    private calcTextRef = createRef<LatexText>();
    private matricesContainerRef = createRef<Rect>();

    // Initial Matrices
    private texInvE = "\\begin{bmatrix} ? & ? \\\\ ? & ? \\end{bmatrix}";
    private texU = "\\begin{bmatrix} 2 & 3 \\\\ 0 & -2.5 \\end{bmatrix}";
    private texA = "\\begin{bmatrix} 2 & 3 \\\\ 1 & -1 \\end{bmatrix}";

    protected on_build_ui(): void {
        this.root.add(
            <Rect
                width={1920}
                height={1080}
                fill={Colors.background}
            >
                {/* 1. Explanatory Text */}
                <LatexText
                    ref={this.text1Ref}
                    tex="E 描述了如何消元得到 U"
                    fontFill={Colors.text}
                    texFontSize={48}
                    opacity={0}
                    y={-200}
                    isText={true}
                />
                <LatexText
                    ref={this.text2Ref}
                    tex="E^{-1} 描述了如何将 U 还原回 A"
                    fontFill={Colors.text}
                    texFontSize={48}
                    opacity={0}
                    y={-100}
                    isText={false} 
                />

                {/* 2. Equation Transformation */}
                <LatexText
                    ref={this.equationRef}
                    tex="E A = U"
                    fontFill={Colors.yellow}
                    texFontSize={80}
                    opacity={0}
                    y={50}
                />

                {/* 3. Matrices Layout for A = E^-1 U (Initially Hidden) */}
                <Rect ref={this.matricesContainerRef} y={50} opacity={0}>
                    {/* A Matrix (Left side) */}
                    <Rect x={-400}>
                        <LatexText tex="A" fontFill={Colors.cyan} texFontSize={48} y={-100} />
                        <LatexText
                            ref={this.aMatrixRef}
                            tex={this.texA}
                            fontFill={Colors.text}
                            texFontSize={64}
                        />
                    </Rect>
                    <LatexText tex="=" fontFill={Colors.text} texFontSize={64} x={-250} />
                    
                    {/* E^-1 Matrix (Unknown initially) */}
                    <Rect x={-100}>
                        <LatexText tex="E^{-1}" fontFill={Colors.yellow} texFontSize={48} y={-100} />
                        <LatexText
                            ref={this.invEMatrixRef}
                            tex={this.texInvE}
                            fontFill={Colors.text}
                            texFontSize={64}
                        />
                    </Rect>
                    <LatexText tex="\cdot" fontFill={Colors.text} texFontSize={64} x={100} />

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
        // Step 1: Concept Introduction
        yield* waitUntil("Show Inverse Concept");
        yield* this.text1Ref().opacity(1, 1);
        yield* waitFor(0.5);
        yield* this.text2Ref().opacity(1, 1);
        
        yield* this.equationRef().opacity(1, 1);
        yield* waitFor(1);

        // Transform EA=U to A=E^-1U
        yield* this.equationRef().opacity(0, 0.5);
        this.equationRef().tex("A = E^{-1} U");
        yield* this.equationRef().opacity(1, 0.5);

        // Step 2: Show Matrices Layout
        yield* waitUntil("Show Matrices A=LU");
        // Move text and equation
        yield* all(
            this.text1Ref().opacity(0, 0.5),
            this.text2Ref().opacity(0, 0.5),
            this.equationRef().scale(0.6, 1),
            this.equationRef().position([700, -450], 1)
        );

        // Show Matrices Container
        yield* this.matricesContainerRef().opacity(1, 1);

        // Step 3: Solve Row 1 of E^-1
        yield* waitUntil("Solve InvE Row 1");
        
        // Highlight Row 1 of E^-1 (Unknown)
        const texInvE_H1 = "\\begin{bmatrix} {\\color{#FFD700}?} & {\\color{#FFD700}?} \\\\ ? & ? \\end{bmatrix}";
        this.invEMatrixRef().tex(texInvE_H1);

        // Highlight Row 1 of U (Source for linear combo)
        // Note: A = E^-1 * U means rows of A are linear combos of rows of U
        // Row 1 of A = ? * Row 1 of U + ? * Row 2 of U
        const texU_All = "\\begin{bmatrix} {\\color{#00FFFF}2} & {\\color{#00FFFF}3} \\\\ {\\color{#FF00FF}0} & {\\color{#FF00FF}-2.5} \\end{bmatrix}";
        this.uMatrixRef().tex(texU_All);
        
        // Highlight Row 1 of A (Target)
        const texA_H1 = "\\begin{bmatrix} {\\color{#FFD700}2} & {\\color{#FFD700}3} \\\\ 1 & -1 \\end{bmatrix}";
        this.aMatrixRef().tex(texA_H1);

        // Show Hint
        // Row 1 of A (2, 3) is exactly Row 1 of U (2, 3)
        // So we need 1 * R1(U) + 0 * R2(U)
        this.calcTextRef().tex("R_1(A) = 1 \\cdot R_1(U) + 0 \\cdot R_2(U)");
        yield* this.calcTextRef().opacity(1, 0.5);
        yield* waitFor(1);

        // Reveal E^-1 Row 1
        const texInvE_R1 = "\\begin{bmatrix} {\\color{#FFD700}1} & {\\color{#FFD700}0} \\\\ ? & ? \\end{bmatrix}";
        yield* this.invEMatrixRef().opacity(0, 0.3);
        this.invEMatrixRef().tex(texInvE_R1);
        yield* this.invEMatrixRef().opacity(1, 0.3);
        yield* waitFor(0.5);

        // Reset Colors
        this.invEMatrixRef().tex("\\begin{bmatrix} 1 & 0 \\\\ ? & ? \\end{bmatrix}");
        this.uMatrixRef().tex(this.texU);
        this.aMatrixRef().tex(this.texA);
        yield* this.calcTextRef().opacity(0, 0.5);


        // Step 4: Solve Row 2 of E^-1
        yield* waitUntil("Solve InvE Row 2");

        // Highlight Row 2 of E^-1
        const texInvE_H2 = "\\begin{bmatrix} 1 & 0 \\\\ {\\color{#FFD700}?} & {\\color{#FFD700}?} \\end{bmatrix}";
        this.invEMatrixRef().tex(texInvE_H2);

        // Highlight All of U
        this.uMatrixRef().tex(texU_All);

        // Highlight Row 2 of A
        const texA_H2 = "\\begin{bmatrix} 2 & 3 \\\\ {\\color{#FFD700}1} & {\\color{#FFD700}-1} \\end{bmatrix}";
        this.aMatrixRef().tex(texA_H2);

        // Show Hint
        // Row 2 of A (1, -1) = 0.5 * R1(U) + 1 * R2(U)
        // Check: 0.5*(2,3) + 1*(0,-2.5) = (1, 1.5) + (0, -2.5) = (1, -1) Correct!
        this.calcTextRef().tex("R_2(A) = 0.5 \\cdot R_1(U) + 1 \\cdot R_2(U)");
        yield* this.calcTextRef().opacity(1, 0.5);
        yield* waitFor(1);

        // Reveal E^-1 Row 2
        const texInvE_R2 = "\\begin{bmatrix} 1 & 0 \\\\ {\\color{#FFD700}0.5} & {\\color{#FFD700}1} \\end{bmatrix}";
        yield* this.invEMatrixRef().opacity(0, 0.3);
        this.invEMatrixRef().tex(texInvE_R2);
        yield* this.invEMatrixRef().opacity(1, 0.3);
        yield* waitFor(0.5);

        // Step 5: Final Result
        yield* waitUntil("Final InvE");
        // Reset Colors
        const texInvE_Final = "\\begin{bmatrix} 1 & 0 \\\\ 0.5 & 1 \\end{bmatrix}";
        this.invEMatrixRef().tex(texInvE_Final);
        this.uMatrixRef().tex(this.texU);
        this.aMatrixRef().tex(this.texA);
        
        yield* this.calcTextRef().opacity(0, 0.5);
        
        // Emphasize E^-1
        yield* this.invEMatrixRef().scale(1.2, 0.5).to(1, 0.5);
    }
}
