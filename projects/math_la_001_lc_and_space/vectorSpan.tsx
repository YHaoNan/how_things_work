import { Layout, Circle } from "@motion-canvas/2d";
import { ThreadGenerator, createRef, all, waitFor, waitUntil, Vector2, createSignal } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";
import { Axes2D } from "@src/common/component/2d/math/Axes2D";
import { Vector2D } from "@src/common/component/2d/math/Vector2D";
import { LatexText } from "@src/common/component/2d/math/LatexText";

export class VectorSpanLayer extends AnimLayer {
    private axes = createRef<Axes2D>();
    private vectorV = createRef<Vector2D>(); // Base V
    private vectorWOrigin = createRef<Vector2D>(); // Base W
    
    // Dynamic components for c1*v + c2*w
    private vectorVComp = createRef<Vector2D>(); // c1 * v
    private vectorWComp = createRef<Vector2D>(); // c2 * w (attached to VComp)
    private vectorSum = createRef<Vector2D>();   // Result
    
    private equation = createRef<LatexText>();
    private coeffText = createRef<LatexText>();
    
    private vCoords = new Vector2(1, 2);
    private wCoords = new Vector2(2, -1);
    private scale = 100;

    // Reactive signals
    private angle = createSignal(0);
    private spanRadius = createSignal(1); // Radius multiplier for span
    
    // Derived coefficients
    private c1 = createSignal(() => {
        const theta = this.angle();
        const r = this.spanRadius();
        // Formula: c1 = r * (sqrt(5)/5) * (cos(theta) + 2*sin(theta))
        return r * (Math.cos(theta) + 2 * Math.sin(theta)) / Math.sqrt(5);
    });
    
    private c2 = createSignal(() => {
        const theta = this.angle();
        const r = this.spanRadius();
        // Formula: c2 = r * (sqrt(5)/5) * (2*cos(theta) - sin(theta))
        return r * (2 * Math.cos(theta) - Math.sin(theta)) / Math.sqrt(5);
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
                
                {/* Reference Vectors (Fixed, semi-transparent) */}
                <Vector2D
                    ref={this.vectorV}
                    from={[0, 0]}
                    to={[0,0]}
                    color={Colors.green}
                    lineWidth={8}
                    opacity={0.3}
                    endArrow
                />
                <Vector2D
                    ref={this.vectorWOrigin}
                    from={[0, 0]}
                    to={[0,0]}
                    color={Colors.blue}
                    lineWidth={8}
                    opacity={0.3}
                    endArrow
                />
                
                {/* Component Vectors (Dynamic) */}
                <Vector2D
                    ref={this.vectorVComp}
                    from={[0, 0]}
                    to={() => this.vCoords.mul(this.scale).mul(this.c1())}
                    color={Colors.green}
                    lineWidth={6}
                    endArrow
                />
                
                <Vector2D
                    ref={this.vectorWComp}
                    from={() => {
                        const vPos = this.vectorVComp().to();
                        return vPos instanceof Vector2 ? vPos : new Vector2(vPos);
                    }}
                    to={() => {
                        const start = this.vectorVComp().to();
                        const startVec = start instanceof Vector2 ? start : new Vector2(start);
                        return startVec.add(this.wCoords.mul(this.scale).mul(this.c2()));
                    }}
                    color={Colors.blue}
                    lineWidth={6}
                    endArrow
                />

                {/* Result Vector (Orange) */}
                <Vector2D
                    ref={this.vectorSum}
                    from={[0, 0]}
                    to={() => {
                        const start = this.vectorVComp().to();
                        const startVec = start instanceof Vector2 ? start : new Vector2(start);
                        return startVec.add(this.wCoords.mul(this.scale).mul(this.c2()));
                    }}
                    color={Colors.orange}
                    lineWidth={8}
                    endArrow
                />

                {/* Labels */}
                <LatexText
                    ref={this.equation}
                    tex="\vec{u} = c_1 \vec{v} + c_2 \vec{w}"
                    x={400}
                    y={-350}
                    fontFill={Colors.orange}
                    texFontSize={48}
                    opacity={0}
                />
                
                <LatexText
                    ref={this.coeffText}
                    tex={() => `c_1=${this.c1().toFixed(2)}, c_2=${this.c2().toFixed(2)}`}
                    x={400}
                    y={-280}
                    fontFill={Colors.text}
                    texFontSize={40}
                    opacity={0}
                />
            </Layout>
        );
    }

    protected *on_play(): ThreadGenerator {
        // Init state
        this.vectorSum().opacity(0);
        this.vectorVComp().opacity(0);
        this.vectorWComp().opacity(0);
        
        // Show Reference Vectors
        this.vectorV().to(this.vCoords.mul(this.scale));
        this.vectorWOrigin().to(this.wCoords.mul(this.scale));
        
        yield* all(
            this.vectorV().animateGrowth(),
            this.vectorWOrigin().animateGrowth()
        );
        
        // Show equation
        yield* all(
            this.equation().opacity(1, 1),
            this.coeffText().opacity(1, 1)
        );

        // Start Circular Span Animation
        // Initial state: angle = 0
        // c1 = 1/sqrt(5) ~= 0.45, c2 = 2/sqrt(5) ~= 0.89
        // Result should be at (sqrt(5), 0) relative to axis?? No.
        // Let's check t=0:
        // c1 = 1/sqrt(5), c2 = 2/sqrt(5)
        // u = (1/sqrt(5))v + (2/sqrt(5))w
        // x = (1 + 4)/sqrt(5) = 5/sqrt(5) = sqrt(5)
        // y = (2 - 2)/sqrt(5) = 0
        // Correct, starts at (R, 0).
        
        // Reveal components
        this.vectorVComp().opacity(1);
        this.vectorWComp().opacity(1);
        this.vectorSum().opacity(1);
        
        yield* all(
             this.vectorVComp().animateGrowth(0.5),
             this.vectorWComp().animateGrowth(0.5),
             this.vectorSum().animateGrowth(0.5)
        );
        yield* waitFor(0.5);

        // Rotate 360 degrees (0 to 2PI)
        yield* this.angle(Math.PI * 2, 8); // 8 seconds full rotation
        yield* waitFor(0.5);
        
        // --- Full Span Demonstration ---
        
        // 1. Expand Coefficients (Spiral out / Fill screen)
        // Animate radius from 1 to 5 while rotating quickly
        // This simulates covering the plane
        
        // Change label to indicate expansion using scaling factor
        this.equation().tex("\\vec{u} = R(c_1 \\vec{v} + c_2 \\vec{w})");
        
        // Use coeffText to show the scaling factor R
        // We want to show "R = 1.00" growing to "R = 5.00"
        this.coeffText().tex(() => `R = ${this.spanRadius().toFixed(2)}`);
        
        yield* all(
            this.spanRadius(5, 3), // Expand radius
            this.angle(Math.PI * 6, 3), // Rotate 2 more times quickly
            this.vectorVComp().opacity(0.3, 1), // Fade out components slightly
            this.vectorWComp().opacity(0.3, 1)
        );
        
        // 2. Show Span Plane
        this.equation().tex("\\text{Span} = \\mathbb{R}^2");
        this.coeffText().opacity(0, 0.5); // Hide R value when done
        // Create a large rectangle to represent the plane
        // Since we don't have a 'Plane' component handy, we can use a large filled Rect or Layout
        // But the script says "From middle shoot out a plane".
        // Let's use a large Circle or Rect scaling up from zero.
        
        const plane = createRef<Circle>();
        this.root.add(
            <Circle
                ref={plane}
                size={0}
                fill={Colors.blue}
                opacity={0.2}
                zIndex={-10} // Behind vectors
            />
        );
        
        yield* plane().size(2000, 2); // Expand to fill screen
        
        yield* waitUntil("full_span_demo_finished");
    }
}