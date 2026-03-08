import { Layout, Circle } from "@motion-canvas/2d";
import { ThreadGenerator, createRef, all, waitFor, waitUntil, Vector2 } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";
import { Axes2D } from "@src/common/component/2d/math/Axes2D";
import { Vector2D } from "@src/common/component/2d/math/Vector2D";
import { LatexText } from "@src/common/component/2d/math/LatexText";

export class VectorIntroLayer extends AnimLayer {
    private axes = createRef<Axes2D>();
    private vectorV = createRef<Vector2D>();
    private vectorW = createRef<Vector2D>();
    private vectorSum = createRef<Vector2D>();
    private vectorVLabel = createRef<LatexText>();
    private vectorWLabel = createRef<LatexText>();
    private vectorSumLabel = createRef<LatexText>();
    private plusSign = createRef<LatexText>();
    private equalsSign = createRef<LatexText>();
    private linearOpsText = createRef<Layout>();
    private linearOpsTexts: Layout[] = [];
    private tracerDot = createRef<Circle>();
    private phantomW = createRef<Vector2D>();

    protected on_build_ui(): void {
        this.root.add(
            <Layout>
                <Axes2D
                    ref={this.axes}
                    xRange={[-900, 900]}
                    yRange={[-500, 500]}
                    step={100}
                    opacity={0}
                    gridOpacity={0.2}
                />
                
                {/* Vector V (1, 2) -> (100, 200) */}
                <Vector2D
                    ref={this.vectorV}
                    from={[0, 0]}
                    to={[0, 0]} // Start at 0,0 for growth animation
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
                    opacity={0}
                />

                {/* Linear Operations List */}
                <Layout
                    ref={this.linearOpsText}
                    layout
                    direction={'column'}
                    gap={20}
                    x={-700}
                    y={-300}
                >
                     {/* Populated in code or here? Let's do here for structure */}
                </Layout>

                {/* Vector W (2, -1) -> (200, -100) */}
                <Vector2D
                    ref={this.vectorW}
                    from={[0, 0]}
                    to={[0, 0]}
                    color={Colors.blue}
                    lineWidth={8}
                    opacity={0}
                    endArrow
                />
                 <LatexText
                    ref={this.vectorWLabel}
                    tex="\begin{bmatrix} 2 \\ -1 \end{bmatrix}"
                    x={400}
                    y={-300} 
                    fontFill={Colors.blue}
                    texFontSize={48}
                    opacity={0}
                />

                {/* Vector Sum (3, 1) -> (300, 100) */}
                <Vector2D
                    ref={this.vectorSum}
                    from={[0, 0]}
                    to={[0, 0]}
                    color={Colors.orange}
                    lineWidth={8}
                    opacity={0}
                    endArrow
                />
                
                {/* Operators for equation construction */}
                <LatexText
                    ref={this.plusSign}
                    tex="+"
                    x={300}
                    y={-300}
                    fontFill={'#fff'}
                    texFontSize={48}
                    opacity={0}
                />
                 <LatexText
                    ref={this.equalsSign}
                    tex="="
                    x={500}
                    y={-300}
                    fontFill={'#fff'}
                    texFontSize={48}
                    opacity={0}
                />
                <LatexText
                    ref={this.vectorSumLabel}
                    tex="\begin{bmatrix} 3 \\ 1 \end{bmatrix}"
                    x={600}
                    y={-300}
                    fontFill={Colors.orange}
                    texFontSize={48}
                    opacity={0}
                />
                
                {/* Tracer Dot */}
                <Circle
                    ref={this.tracerDot}
                    size={20}
                    fill={Colors.yellow}
                    opacity={0}
                    zIndex={100}
                />
            </Layout>
        );
    }

    protected *on_play(): ThreadGenerator {
        // --- 2. 向量引入与展示 ---
        
        // Step 1: Show Grid and Vector V
        yield* this.axes().opacity(1, 1);
        yield* waitUntil("grid_shown");

        // Grow Vector V (1, 2) -> Canvas: (100, -200)
        this.vectorV().to(new Vector2(100, -200));
        this.vectorV().opacity(1);
        yield* this.vectorV().animateGrowth();
        yield* waitUntil("vector_v_grown");

        // Step 2: Show Component Label
        yield* this.vectorVLabel().opacity(1, 1);
        yield* waitUntil("vector_v_label_shown");


        // --- 3. 线性运算定义 ---
        
        // Step 1: Show Operations
        const ops = ["1. 相加", "2. 数乘"];
        for(const op of ops) {
            // Need to add dynamically or pre-add. Let's pre-add logic here just for simplicity of "fading in" if we had them.
            // But since I left the container empty, let's add them now.
             this.linearOpsText().add(
                <LatexText 
                    tex={op} 
                    fontFill={'#fff'} 
                    texFontSize={48} 
                    opacity={0}
                    isText={true}
                />
            );
        }
        // Get children (the newly added texts)
        const children = this.linearOpsText().children();
        
        for(let i=0; i<children.length; i++) {
            yield* (children[i] as LatexText).opacity(1, 0.5);
            yield* waitFor(0.2);
        }
        yield* waitUntil("ops_shown");

        // Step 2: Hide Operations
        yield* waitFor(3); // User asked for 3s wait in script, or we can control via waitUntil
        // Plan says: "文字保持 3 秒 ... 3 秒后文字淡出消失"
        // Let's use waitUntil so user can control the pace, OR strictly follow "3s" if it's an auto-play logic.
        // User's plan said "3秒后消失".
        yield* this.linearOpsText().opacity(0, 1);
        yield* waitUntil("ops_hidden");


        // --- 4. 向量加法演示 ---

        // Step 1: Show Vector W
        // W is (2, -1) -> Canvas (200, 100)
        // Ensure it starts at correct position and grows
        this.vectorW().to(new Vector2(200, 100)); 
        this.vectorW().opacity(1);
        yield* this.vectorW().animateGrowth();
        
        yield* this.vectorWLabel().opacity(1, 1);
        yield* waitUntil("vector_w_shown");

        // Step 2: Geometric Addition
        // Move point/phantom vector
        // First, we need a visual indicator of "moving W to tip of V"
        
        // Clone W to tip of V
        // const phantomW = createRef<Vector2D>(); // Removed local declaration
        this.root.add(
            <Vector2D
                ref={this.phantomW} // Use class property
                from={[100, -200]} // Tip of V
                to={[100, -200]}   // Start collapsed at tip
                color={Colors.orange}
                lineWidth={4}
                opacity={0.5}
                endArrow
            />
        );
        
        // Tracer Dot Animation
        // 1. Move from Origin to Tip of V (100, -200)
        this.tracerDot().opacity(1);
        this.tracerDot().position([0, 0]);
        yield* this.tracerDot().position([100, -200], 1);
        
        // 2. Animate phantom W growing/moving AND tracer dot following it
        // Destination: Tip of V (100, -200) + W (200, 100) = (300, -100)
        yield* all(
            this.phantomW().to(new Vector2(300, -100), 1),
            this.phantomW().animateGrowth(1),
            this.tracerDot().position([300, -100], 1)
        );
        yield* waitUntil("phantom_w_moved");

        // Fade out tracer dot
        yield* this.tracerDot().opacity(0, 0.5);

        // Show Result Vector (Sum)
        // From Origin to (300, -100)
        this.vectorSum().to(new Vector2(300, -100));
        this.vectorSum().opacity(1);
        yield* this.vectorSum().animateGrowth();
        yield* waitUntil("vector_sum_shown");

        // Step 3: Algebraic Formula
        // Animate + and = signs and move labels to form equation
        
        // Move V label to left
        // V Label is at x=200, y=-300
        // W Label is at x=400, y=-300
        // Sum Label is at x=600, y=-300
        // Plus sign at x=300
        // Equals sign at x=500
        
        // They are already positioned for the equation: [1,2] + [2,-1] = [3,1]
        // 200 (V)  300 (+)  400 (W)  500 (=)  600 (Sum)
        
        yield* all(
            this.plusSign().opacity(1, 0.5),
            this.equalsSign().opacity(1, 0.5),
            this.vectorSumLabel().opacity(1, 0.5)
        );
        
        yield* waitUntil("addition_finished");

        // --- 5. 向量数乘演示 ---

        // Step 1: Cleanup and Prep
        // Keep Vector V (Green), Hide others
        
        // Define phantomW reference to access it for hiding (it was created locally in previous block)
        // Wait, phantomW is a local variable in the previous block scope. We can't access it here directly.
        // We need to either make it a class property or find it in the children.
        // Or better, let's just make it a class property or move its creation up.
        // Actually, since I can't easily change the class property structure without reading/writing the whole file again or risking conflicts,
        // let's look at how I can hide it.
        // It was added to `this.root`.
        // Let's refactor `phantomW` to be a class property.
        
        // Since I'm in a SearchReplace, I can't easily refactor the whole class.
        // BUT, I can see `this.tracerDot` is a class property.
        // `phantomW` was defined as `const phantomW = createRef<Vector2D>();` inside `on_play`.
        // This is a problem for cleanup.
        
        // Let's fix this by finding the phantom vector by reference if possible, OR
        // modifying the code to store phantomW in a class property.
        
        // I will use `this.root.children()` to find it, or just refactor.
        // Refactoring is safer. I'll add `private phantomW = createRef<Vector2D>();` to the class properties
        // and update the usage.
        
        yield* all(
            this.vectorW().opacity(0, 0.5),
            this.vectorSum().opacity(0, 0.5),
            this.phantomW().opacity(0, 0.5), // Now we can access it
            this.vectorWLabel().opacity(0, 0.5),
            this.vectorSumLabel().opacity(0, 0.5),
            this.plusSign().opacity(0, 0.5),
            this.equalsSign().opacity(0, 0.5),
        );
        yield* waitUntil("cleanup_done");

        // Step 2: Introduce Scalar
        // Show "2" next to Vector V label
        // V Label is at (200, -300). Let's put "2" at (100, -300).
        const scalar = createRef<LatexText>();
        this.root.add(
            <LatexText
                ref={scalar}
                tex="2"
                x={140} // Left of V Label
                y={-300}
                fontFill={Colors.yellow}
                texFontSize={48}
                opacity={0}
            />
        );
        
        // Pop in scalar
        yield* scalar().scale(0, 0).to(1.5, 0.3).to(1, 0.2); // Pop effect
        yield* scalar().opacity(1, 0.1);
        yield* waitUntil("scalar_shown");

        // Step 3: Distribute Scalar
        // Animate "2" moving into the matrix
        // We will simulate this by replacing the V Label with a new one that shows the multiplication
        
        const calculationLabel = createRef<LatexText>();
        this.root.add(
            <LatexText
                ref={calculationLabel}
                tex="\begin{bmatrix} 2 \cdot 1 \\ 2 \cdot 2 \end{bmatrix}"
                x={200}
                y={-300}
                fontFill={Colors.green}
                texFontSize={48}
                opacity={0}
            />
        );

        // Transition: Hide "2" and "V Label", Show "Calculation Label"
        yield* all(
            scalar().opacity(0, 0.3),
            this.vectorVLabel().opacity(0, 0.3),
            calculationLabel().opacity(1, 0.3)
        );
        yield* waitUntil("scalar_distributed");

        // Show Result
        const resultLabel = createRef<LatexText>();
        this.root.add(
            <LatexText
                ref={resultLabel}
                tex="\begin{bmatrix} 2 \\ 4 \end{bmatrix}"
                x={200}
                y={-300}
                fontFill={Colors.green}
                texFontSize={48}
                opacity={0}
            />
        );
        
        yield* waitFor(0.5);
        yield* all(
            calculationLabel().opacity(0, 0.3),
            resultLabel().opacity(1, 0.3)
        );
        yield* waitUntil("calculation_done");

        // Step 4: Geometric Scaling
        // Vector V is currently at (100, -200) corresponding to (1, 2)
        // Scale to (200, -400) corresponding to (2, 4)
        yield* this.vectorV().to(new Vector2(200, -400), 1);
        yield* waitUntil("vector_scaled");

        // --- 6. 线性组合演示 ---
        
        // Step 1: Cleanup and Prep
        // Reset Vector V to (1, 2)
        // Show Vector W (Blue) at (2, -1)
        
        // Hide result label from previous step
        yield* resultLabel().opacity(0, 0.5);
        
        // Show Vector V label (restored)
        this.vectorVLabel().opacity(0); // Ensure it's hidden before appearing
        // Actually we can reuse vectorVLabel but we need to reset its text if it was changed?
        // Wait, vectorVLabel was hidden. We can just show it again.
        
        // Show W and its label
        yield* all(
            this.vectorV().to(new Vector2(100, -200), 1), // Shrink V back
            this.vectorVLabel().opacity(1, 1),
            this.vectorW().opacity(1, 1),
            this.vectorWLabel().opacity(1, 1),
            
            // Prepare for Linear Combination Equation: 1[v] + 2[w]
            // We need to show "1" and "2" scalars or just the equation.
            // Plan says: "右上角显示公式：1 [1,2] + 2 [2,-1]"
        );
        
        // Update equation components for Linear Combination
        // Current: + and = are hidden. VLabel and WLabel are visible.
        // We need: "1" before V, "+" between, "2" before W.
        
        // Let's create specific labels for the coefficients "1" and "2"
        const coeff1 = createRef<LatexText>();
        const coeff2 = createRef<LatexText>();
        
        this.root.add(
            <LatexText
                ref={coeff1}
                tex="1"
                x={140} // Left of V
                y={-300}
                fontFill={Colors.yellow}
                texFontSize={48}
                opacity={0}
            />
        );
        this.root.add(
            <LatexText
                ref={coeff2}
                tex="2"
                x={300} // Moved further left (was 320, W is at 400) to fix overlap with + and W
                y={-300}
                fontFill={Colors.yellow}
                texFontSize={48}
                opacity={0}
            />
        );
        
        // Also move plus sign a bit to left to accommodate
        // Plus sign was at 300. If coeff2 is at 300, they overlap.
        // Let's readjust the whole equation layout.
        // V Label: x=200
        // Coeff 1: x=140
        // Plus Sign: x=280 (was 300)
        // Coeff 2: x=340 (was 320/340)
        // W Label: x=420 (was 400)
        // Equals: x=520 (was 500)
        // Result: x=620 (was 600)
        
        // Let's update positions dynamically
        this.plusSign().x(270);
        this.equalsSign().x(520);
        this.vectorSumLabel().x(620);
        this.vectorWLabel().x(420);
        
        // Update Coeff positions
        // Coeff 1 is fine at 140 (V is 200)
        // Coeff 2 needs to be between Plus (270) and W (420)
        // 270 + (420-270)/2 = 345
        // Let's set Coeff 2 to 330
        
        yield* all(
            coeff1().opacity(1, 0.5),
            this.plusSign().opacity(1, 0.5),
            coeff2().x(330, 0), // Set position before showing
            coeff2().opacity(1, 0.5)
        );
        yield* waitUntil("lin_comb_setup");

        // Step 2: Geometric Transformation
        // Scale W to 2W: (2, -1) -> (4, -2) => (400, 200)
        yield* this.vectorW().to(new Vector2(400, 200), 1);
        
        // Step 3: Calculation / Geometric Addition
        // Simplified: Direct to result, no tracer dot
        
        // Show Result Vector
        this.vectorSum().from([0, 0]);
        this.vectorSum().to([500, 0]);
        this.vectorSum().color(Colors.orange);
        this.vectorSum().opacity(1);
        
        // Show Result Equation Part
        // Create linCombResult early
        const linCombResult = createRef<LatexText>();
        this.root.add(
            <LatexText
                ref={linCombResult}
                tex="\begin{bmatrix} 5 \\ 0 \end{bmatrix}"
                x={620} // Matched with updated layout
                y={-300}
                fontFill={Colors.orange}
                texFontSize={48}
                opacity={0}
            />
        );
        
        // Animate Vector and Result Label together
        yield* all(
             this.vectorSum().animateGrowth(),
             this.equalsSign().opacity(1, 0.5),
             linCombResult().opacity(1, 0.5)
        );
        
        yield* waitUntil("lin_comb_finished");
    }
}
