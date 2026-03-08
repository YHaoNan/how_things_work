import { Layout, Circle } from "@motion-canvas/2d";
import { ThreadGenerator, createRef, all, waitFor, waitUntil, Vector2 } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";
import { Axes2D } from "@src/common/component/2d/math/Axes2D";
import { Vector2D } from "@src/common/component/2d/math/Vector2D";
import { LatexText } from "@src/common/component/2d/math/LatexText";

export class VectorSpaceLayer extends AnimLayer {
    private axes = createRef<Axes2D>();
    private vectorV = createRef<Vector2D>();
    private vectorW = createRef<Vector2D>();
    private vectorSum = createRef<Vector2D>();
    private vectorVLabel = createRef<LatexText>();
    private vectorWLabel = createRef<LatexText>();
    private vectorSumLabel = createRef<LatexText>();
    private plusSign = createRef<LatexText>();
    private equalsSign = createRef<LatexText>();
    private coeff1 = createRef<LatexText>();
    private coeff2 = createRef<LatexText>();
    
    // Original Vector Coords
    private vCoords = new Vector2(1, 2);
    private wCoords = new Vector2(2, -1);
    
    // Scale factor for display
    private scale = 100;

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
                
                {/* Vector V (Green) */}
                <Vector2D
                    ref={this.vectorV}
                    from={[0, 0]}
                    to={[0,0]} // Start at 0,0
                    color={Colors.green}
                    lineWidth={8}
                    endArrow
                />
                <LatexText
                    ref={this.vectorVLabel}
                    tex="\begin{bmatrix} 1 \\ 2 \end{bmatrix}"
                    x={200}
                    y={-300}
                    fontFill={Colors.green}
                    texFontSize={48}
                    opacity={1}
                />

                {/* Vector W (Blue) */}
                <Vector2D
                    ref={this.vectorW}
                    from={[0, 0]}
                    to={[0,0]} // Start at 0,0
                    color={Colors.blue}
                    lineWidth={8}
                    endArrow
                />
                 <LatexText
                    ref={this.vectorWLabel}
                    tex="\begin{bmatrix} 2 \\ -1 \end{bmatrix}"
                    x={420}
                    y={-300} 
                    fontFill={Colors.blue}
                    texFontSize={48}
                    opacity={1}
                />

                {/* Result Vector (Orange) */}
                <Vector2D
                    ref={this.vectorSum}
                    from={[0, 0]}
                    to={[0, 0]}
                    color={Colors.orange}
                    lineWidth={8}
                    opacity={0}
                    endArrow
                />
                
                {/* Equation Elements */}
                {/* 1. Coeff 1 */}
                <LatexText
                    ref={this.coeff1}
                    tex="1"
                    x={140}
                    y={-300}
                    fontFill={Colors.yellow}
                    texFontSize={48}
                    opacity={1}
                />
                
                {/* 2. Plus Sign */}
                <LatexText
                    ref={this.plusSign}
                    tex="+"
                    x={270}
                    y={-300}
                    fontFill={'#fff'}
                    texFontSize={48}
                    opacity={1}
                />
                
                {/* 3. Coeff 2 */}
                <LatexText
                    ref={this.coeff2}
                    tex="2"
                    x={330}
                    y={-300}
                    fontFill={Colors.yellow}
                    texFontSize={48}
                    opacity={1}
                />
                
                {/* 4. Equals Sign */}
                 <LatexText
                    ref={this.equalsSign}
                    tex="="
                    x={520}
                    y={-300}
                    fontFill={'#fff'}
                    texFontSize={48}
                    opacity={0}
                />
                
                {/* 5. Result Label */}
                <LatexText
                    ref={this.vectorSumLabel}
                    tex=""
                    x={620}
                    y={-300}
                    fontFill={Colors.orange}
                    texFontSize={48}
                    opacity={0}
                />
            </Layout>
        );
    }

    protected *on_play(): ThreadGenerator {
        // --- Linear Combination Sequence ---
        
        // Step 0: Ensure Base Vectors are Shown (Animation Fix 1)
        // Reset them to 0 first to be safe, then grow to initial state
        this.vectorV().from([0,0]); // Ensure from is 0
        this.vectorV().to([0,0]);   // Ensure to is 0
        // this.vectorV().end(0);      // REMOVED: caused runtime error
        
        this.vectorW().from([0,0]);
        this.vectorW().to([0,0]);
        // this.vectorW().end(0);      // REMOVED: caused runtime error

        // Set 'to' to final target
        this.vectorV().to(this.vCoords.mul(this.scale));
        this.vectorW().to(this.wCoords.mul(this.scale));
        
        // Animate Growth (internally handles end=0 reset)
        yield* all(
             this.vectorV().animateGrowth(),
             this.vectorW().animateGrowth()
        );
        yield* waitFor(0.5);

        // 1. 1v + 2w
        yield* this.animateCombination(1, 2);
        yield* waitFor(1);
        yield* this.resetForNext();

        // 2. 2v + 1w
        yield* this.animateCombination(2, 1);
        yield* waitFor(1);
        yield* this.resetForNext();

        // 3. 1v - 1w
        yield* this.animateCombination(1, -1);
        yield* waitFor(1);
        
        yield* waitUntil("vector_space_demo_finished");
    }

    private *animateCombination(c1: number, c2: number): ThreadGenerator {
        // Update Coefficients Text
        this.coeff1().tex(c1.toString());
        
        // Handle negative coefficient layout (Fix 3)
        // If c2 is negative, we might want to change "+" to "-" or keep "+ (-1)"
        // The user complained about overlap with -1.
        // Let's adjust spacing dynamically.
        
        let coeff2Tex = c2.toString();
        let plusSignTex = "+";
        
        if (c2 < 0) {
             // Option A: Change "+" to "-" and c2 to positive value
             // Option B: Keep "+ (-1)" but add more space.
             // User said "-1和左右两侧的元素都有重叠". (-1) is wider than 2.
             // Let's widen the gap significantly more.
             
             // Move Coeff 2 slightly right
             this.coeff2().x(390); // was 370
             // Move W Label slightly right
             this.vectorWLabel().x(500); // was 470
             // Move Equals slightly right
             this.equalsSign().x(620); // was 580
             // Move Result Label slightly right
             this.vectorSumLabel().x(720); // was 680
             
             coeff2Tex = `(${c2})`;
        } else {
             // Reset to standard positions
             this.coeff2().x(330);
             this.vectorWLabel().x(420);
             this.equalsSign().x(520);
             this.vectorSumLabel().x(620);
        }

        this.coeff2().tex(coeff2Tex);
        
        
        // Calculate Target Vectors
        const vTarget = this.vCoords.mul(c1).mul(this.scale);
        const wTarget = this.wCoords.mul(c2).mul(this.scale);
        const sumTarget = vTarget.add(wTarget);
        
        // Calculate Result Matrix Text
        const resultVec = this.vCoords.mul(c1).add(this.wCoords.mul(c2));
        const resultTex = `\\begin{bmatrix} ${resultVec.x} \\\\ ${resultVec.y} \\end{bmatrix}`;
        this.vectorSumLabel().tex(resultTex);

        // Animate Vectors Scaling
        yield* all(
            this.vectorV().to(vTarget, 1),
            this.vectorW().to(wTarget, 1)
        );
        
        // Show Result
        // Ensure result vector starts from 0,0 and grows to target (Fix 2)
        this.vectorSum().from([0,0]); // Reset start
        this.vectorSum().to(sumTarget); // Set target (but this just sets the property, doesn't animate if we use animateGrowth with 'end')
        
        // Actually Vector2D implementation of animateGrowth animates 'end' property from 0 to 1.
        // So we need to make sure 'to' is set correctly, and 'end' is reset to 0 before animating.
        // this.vectorSum().end(0); // Vector2D doesn't expose 'end' property directly
        // We need to use animateGrowth which handles end=0 reset internally now.
        
        this.vectorSum().opacity(1);
        
        yield* all(
            this.vectorSum().animateGrowth(),
            this.equalsSign().opacity(1, 0.5),
            this.vectorSumLabel().opacity(1, 0.5)
        );
    }

    private *resetForNext(): ThreadGenerator {
        yield* all(
            this.vectorSum().opacity(0, 0.5),
            this.vectorSumLabel().opacity(0, 0.5),
            this.equalsSign().opacity(0, 0.5),
            // Reset base vectors to original scale (optional, or just morph to next)
            // The user asked for "quick animations", so maybe direct morph is better?
            // "前两个步骤结束时隐藏结果向量" -> implies reset result, then next.
        );
    }
}