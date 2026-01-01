import { Layout, Rect, Circle, Line, Txt, Spline, Grid } from "@motion-canvas/2d";
import { ThreadGenerator, createRef, all, createSignal, waitFor, map, easeInOutCubic, tween, any, waitUntil, Vector2, Color } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";

export class TradeoffLayer extends AnimLayer {
    private chartLayout = createRef<Layout>();
    private ballLayout = createRef<Layout>();
    
    private chartDot = createRef<Circle>();
    private resolutionLabel = createRef<Txt>();
    private fpsLabel = createRef<Txt>();

    // Signals
    private currentResolution = createSignal(720); // 720 -> 1080 -> 2160
    private currentFps = createSignal(60); // 60 -> 30 -> 10
    
    private ball = createRef<Layout>();
    private ballY = createRef<Layout>();

    protected on_build_ui(): void {
        // Left: Chart
        this.root.add(
            <Layout ref={this.chartLayout} x={-400} y={0}>
                {/* Axes */}
                <Line
                    points={[new Vector2(-200, 200), new Vector2(200, 200)]}
                    stroke={'#fff'}
                    lineWidth={4}
                    endArrow
                />
                <Txt text="FPS" x={220} y={200} fill={'#fff'} fontSize={24} fontFamily={'JetBrains Mono'} />
                
                <Line
                    points={[new Vector2(-200, 200), new Vector2(-200, -200)]}
                    stroke={'#fff'}
                    lineWidth={4}
                    endArrow
                />
                <Txt text="Resolution" x={-200} y={-230} fill={'#fff'} fontSize={24} fontFamily={'JetBrains Mono'} />

                {/* Curve: (FPS, Res) -> Map to (X, Y) */}
                {/* 
                    FPS: 0-70 -> X: -200 to 200
                    Res: 0-2500 -> Y: 200 to -200 
                */}
                <Spline
                    points={[
                        this.getChartPos(60, 720),
                        this.getChartPos(30, 1080),
                        this.getChartPos(10, 2160),
                    ]}
                    stroke={Colors.yellow}
                    lineWidth={4}
                    smoothness={0.5}
                />

                <Circle
                    ref={this.chartDot}
                    size={20}
                    fill={Colors.red}
                    position={() => this.getChartPos(this.currentFps(), this.currentResolution())}
                />
                
                <Txt
                    ref={this.resolutionLabel}
                    text={() => `${this.currentResolution().toFixed(0)}P`}
                    x={() => this.getChartPos(this.currentFps(), this.currentResolution()).x}
                    y={() => this.getChartPos(this.currentFps(), this.currentResolution()).y - 40}
                    fill={'#fff'}
                    fontSize={24}
                    fontFamily={'JetBrains Mono'}
                />
            </Layout>
        );

        // Right: Ball & Info
        this.root.add(
            <Layout ref={this.ballLayout} x={400} y={0}>
                <Txt
                    text={() => `FPS: ${this.currentFps().toFixed(0)}`}
                    y={-250}
                    fill={Colors.green}
                    fontSize={48}
                    fontFamily={'JetBrains Mono'}
                />
                 <Txt
                    text={() => `RES: ${this.currentResolution().toFixed(0)}P`}
                    y={-180}
                    fill={Colors.yellow}
                    fontSize={32}
                    fontFamily={'JetBrains Mono'}
                />

                <Layout ref={this.ballY}>
                    <Layout ref={this.ball}>
                         {/* Pixel Ball Construction */}
                        {this.createPixelBall()}
                    </Layout>
                </Layout>
            </Layout>
        );
    }

    private getChartPos(fps: number, res: number): Vector2 {
        // FPS: 0 at -200, 70 at 200 -> Range 70
        // Res: 0 at 200, 2500 at -200 -> Range 2500
        const x = map(-200, 200, fps / 70);
        const y = map(200, -200, res / 2500);
        return new Vector2(x, y);
    }

    private createPixelBall() {
        const radius = 140 / 2;
        const maxResolution = 30; // Max blocks in one dimension
        
        return (
            <Layout>
                {/* High Res Representation - Smooth Circle */}
                <Circle
                    size={140}
                    fill={Colors.orange}
                    opacity={() => map(0, 1, (this.currentResolution() - 720) / (2160 - 720))}
                />
                
                {/* Low Res Representation - Dynamic Grid */}
                <Layout
                     opacity={() => map(1, 0, (this.currentResolution() - 720) / (2160 - 720))}
                >
                    {/* We generate a grid of rectangles. 
                        As resolution changes, we ideally want more blocks.
                        But re-rendering DOM is expensive/complex in on_play signal.
                        Instead, let's create a fixed high-res grid and scale/mask it? 
                        Or just use a fixed 'pixelated' look that doesn't change resolution 
                        but fades out as the smooth circle fades in. 
                        User wants "approximated ball" not just a square.
                    */}
                    
                    {Array.from({length: 100}).map((_, i) => {
                        // 10x10 grid
                        const col = i % 10;
                        const row = Math.floor(i / 10);
                        const x = (col - 4.5) * 14;
                        const y = (row - 4.5) * 14;
                        
                        // Check if inside circle
                        const dist = Math.sqrt(x*x + y*y);
                        if (dist > radius) return null;
                        
                        return (
                            <Rect
                                width={12}
                                height={12}
                                x={x}
                                y={y}
                                fill={Colors.orange}
                                radius={2} // Slight rounding
                            />
                        );
                    })}
                </Layout>
            </Layout>
        )
    }

    protected *on_play(): ThreadGenerator {
        // Start Loop for Bouncing Ball
        const self = this;
        let isRunning = true;

        function* bounceLoop() {
            let t = 0;
            while(isRunning) {
                const fps = self.currentFps();
                // Avoid infinite loop if fps is 0 or very low, though logic ensures >=10
                const dt = 1 / Math.max(1, fps); 
                
                // Calculate position at time t
                // We use a separate time accumulator for the physics to keep it consistent
                // irrespective of frame rate, but here we update the VIEW only every dt.
                
                // Simple bounce:
                const y = Math.abs(Math.sin(t * 3)) * -200 + 100;
                self.ballY().y(y);
                
                t += dt;
                yield* waitFor(dt);
            }
        }

        function* mainTimeline() {
            yield* waitUntil('to_1080p');
            yield* all(
                self.currentFps(30, 1, easeInOutCubic),
                self.currentResolution(1080, 1, easeInOutCubic),
            );

            yield* waitUntil('to_4k');
            yield* all(
                self.currentFps(10, 1, easeInOutCubic),
                self.currentResolution(2160, 1, easeInOutCubic),
            );
            
            yield* waitUntil('end_tradeoff');
            isRunning = false;
        }

        yield* any(
            bounceLoop(),
            mainTimeline()
        );
    }
}
