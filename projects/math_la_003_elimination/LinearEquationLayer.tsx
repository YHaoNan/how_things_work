import { ThreadGenerator, waitFor, waitUntil, all } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Rect } from "@motion-canvas/2d/lib/components";
import { createRef } from "@motion-canvas/core/lib/utils";
import { Vector2 } from "@motion-canvas/core/lib/types";
import { easeInOutCubic } from "@motion-canvas/core/lib/tweening";
import { Colors } from "@src/common/colors";

// Math Components
import { Axes2D } from "@src/common/component/2d/math/Axes2D";
import { Line2D } from "@src/common/component/2d/math/Line2D";
import { Point2D } from "@src/common/component/2d/math/Point2D";
import { LatexText } from "@src/common/component/2d/math/LatexText";

export class LinearEquationLayer extends AnimLayer {
    private equationsRef = createRef<LatexText>();
    private axesRef = createRef<Axes2D>();
    private line1Ref = createRef<Line2D>();
    private line2Ref = createRef<Line2D>();
    private point1Ref = createRef<Point2D>();
    private intersectionPointRef = createRef<Point2D>();

    protected on_build_ui(): void {
        this.root.add(
            <Rect
                width={1920}
                height={1080}
                fill={Colors.background}
            >
                <LatexText
                    ref={this.equationsRef}
                    tex="{\begin{cases} 2x + 3y = 5 \\ x - y = 1 \end{cases}}"
                    fontFill={Colors.text}
                    texFontSize={48}
                    x={-600}
                    y={-300}
                    opacity={0}
                />
                
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
                
                {/* Line 1: 2x + 3y = 5 => y = (5 - 2x) / 3 */}
                <Line2D
                    ref={this.line1Ref}
                    lineColor={Colors.cyan} // Teal like color
                    lineWidth={4}
                    from={new Vector2(-900, -1 * ((5 - 2 * -9) / 3) * 100)}
                    to={new Vector2(900, -1 * ((5 - 2 * 9) / 3) * 100)}
                    opacity={0}
                />

                {/* Line 2: x - y = 1 => y = x - 1 */}
                <Line2D
                    ref={this.line2Ref}
                    lineColor={Colors.orange} // Orange
                    lineWidth={4}
                    from={new Vector2(-900, -1 * (-9 - 1) * 100)}
                    to={new Vector2(900, -1 * (9 - 1) * 100)}
                    opacity={0}
                />

                <Point2D
                    ref={this.point1Ref}
                    radius={10}
                    color={Colors.yellow} // Yellow
                    opacity={0}
                    pointPosition={new Vector2(0,0)}
                />

                <Point2D
                    ref={this.intersectionPointRef}
                    radius={10}
                    color={Colors.red} // Red
                    opacity={0}
                    pointPosition={new Vector2(0,0)}
                />
            </Rect>
        );
    }

    protected *on_play(): ThreadGenerator {
        // Step 1: Show Equations
        yield* waitUntil("Show Equations");
        yield* this.equationsRef().opacity(1, 1);

        // Step 2: Show Grid
        yield* waitUntil("Show Grid");
        yield* this.axesRef().opacity(1, 1);

        // Step 3: Draw Line 1
        yield* waitUntil("Draw Line 1");
        yield* this.line1Ref().opacity(1, 1);

        // Step 4: Show Point on Line 1
        yield* waitUntil("Show Point on Line 1");
        // Start point: x=1, y=1.
        // Canvas y = -1 * 1 * 100 = -100
        const startP = new Vector2(100, -100);
        this.point1Ref().pointPosition(startP);
        yield* this.point1Ref().opacity(1, 0.5);
        
        // End point: x=-2, y=3.
        // Canvas y = -3 * 100 = -300
        const endP = new Vector2(-200, -300);
        yield* this.point1Ref().pointPosition(endP, 2, easeInOutCubic);

        // Step 5: Draw Line 2
        yield* waitUntil("Draw Line 2");
        yield* this.line2Ref().opacity(1, 1);

        // Step 6: Show Intersection
        yield* waitUntil("Show Intersection");
        // Intersection: x = 1.6 (8/5), y = 0.6 (3/5)
        // Canvas y = -0.6 * 100 = -60
        const intersection = new Vector2(160, -60);
        this.intersectionPointRef().pointPosition(intersection);
        yield* this.intersectionPointRef().opacity(1, 0.5);
        yield* this.intersectionPointRef().scale(1.5, 0.3).to(1, 0.3);
    }
}
