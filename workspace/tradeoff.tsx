import { Layout, Circle, Txt, Line, Rect } from "@motion-canvas/2d";
import { ThreadGenerator, createRef, all, createSignal, map, easeInOutCubic, waitFor, waitUntil, any } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";

export class TradeoffLayer extends AnimLayer {
    private chartLayout = createRef<Layout>();
    private ballLayout = createRef<Layout>();
    private ball = createRef<Circle>();
    private pixelBall = createRef<Layout>();
    private indicator = createRef<Circle>();
    
    // Data signals
    // 0 = 720p (60fps), 0.5 = 1080p (30fps), 1 = 4K (10fps)
    private progress = createSignal(0);
    
    // FPS Display
    private fpsText = createRef<Txt>();
    private resText = createRef<Txt>();

    protected on_build_ui(): void {
        const axisColor = '#ffffff';

        // Left: Chart
        this.root.add(
            <Layout ref={this.chartLayout} x={-450} opacity={0}>
                {/* Y Axis (Resolution) */}
                <Line
                    points={[[-300, 300], [-300, -300]]}
                    stroke={axisColor}
                    lineWidth={4}
                    endArrow
                    arrowSize={10}
                />
                <Txt text="Resolution" x={-300} y={-340} fill={axisColor} fontSize={24} />
                
                {/* Y Axis Ticks */}
                {/* 720P (Bottom) */}
                <Line points={[[-300, 250], [-290, 250]]} stroke={axisColor} lineWidth={2} />
                <Txt text="720P" x={-340} y={250} fill={axisColor} fontSize={20} />
                
                {/* 1080P (Middle-ish) */}
                <Line points={[[-300, 50], [-290, 50]]} stroke={axisColor} lineWidth={2} />
                <Txt text="1080P" x={-340} y={50} fill={axisColor} fontSize={20} />
                
                {/* 4K (Top) */}
                <Line points={[[-300, -250], [-290, -250]]} stroke={axisColor} lineWidth={2} />
                <Txt text="4K" x={-340} y={-250} fill={axisColor} fontSize={20} />

                {/* X Axis (FPS) */}
                 <Line
                    points={[[-300, 300], [300, 300]]}
                    stroke={axisColor}
                    lineWidth={4}
                    endArrow
                    arrowSize={10}
                />
                <Txt text="FPS" x={340} y={300} fill={axisColor} fontSize={24} />

                {/* X Axis Ticks */}
                {/* 10 FPS (Left) */}
                <Line points={[[-250, 300], [-250, 290]]} stroke={axisColor} lineWidth={2} />
                <Txt text="10" x={-250} y={330} fill={axisColor} fontSize={20} />

                {/* 30 FPS (Middle) */}
                <Line points={[[0, 300], [0, 290]]} stroke={axisColor} lineWidth={2} />
                <Txt text="30" x={0} y={330} fill={axisColor} fontSize={20} />

                {/* 60 FPS (Right) */}
                <Line points={[[250, 300], [250, 290]]} stroke={axisColor} lineWidth={2} />
                <Txt text="60" x={250} y={330} fill={axisColor} fontSize={20} />

                {/* Curve: 
                    Start (720p, 60fps) -> Bottom Right -> (250, 250)
                    End (4K, 10fps) -> Top Left -> (-250, -250)
                */}
                <Line
                    stroke={Colors.red}
                    lineWidth={4}
                    points={() => {
                        const points = [];
                        for(let i=0; i<=20; i++) {
                            const p = i/20;
                            // p=0: 720p (250 Y), 60fps (250 X)
                            // p=1: 4K (-250 Y), 10fps (-250 X)
                            
                            // Let's use a standard inverse curve y = 1/x type shape
                            // Map p to X: 250 -> -250
                            const x = map(250, -250, p);
                            
                            // Map p to Y: 250 -> -250. 
                            // Linear would be straight line.
                            // We want "Higher Res costs MORE FPS" or "Lower Res gives MORE FPS"
                            // The curve usually bows towards origin (convex) or away (concave)?
                            // (High FPS, Low Res) to (Low FPS, High Res).
                            // A typical tradeoff curve (Pareto frontier) is usually convex to origin.
                            // Let's just use a power function to make it look nice.
                            // Y changes slowly at first then fast? Or X changes fast then slow?
                            
                            // Let's try simple power on the interpolation factor
                            // x = linear
                            // y = power
                            
                            // Using a slight curve
                            const y = map(250, -250, Math.pow(p, 0.8));
                            
                            points.push([x, y]);
                        }
                        return points;
                    }}
                />
                
                {/* Indicator Point */}
                <Circle
                    ref={this.indicator}
                    size={20}
                    fill={Colors.yellow}
                    position={() => {
                        const p = this.progress();
                        const x = map(250, -250, p);
                        const y = map(250, -250, Math.pow(p, 0.8));
                        return [x, y];
                    }}
                />
            </Layout>
        );

        // Right: Ball Demo
        this.root.add(
            <Layout ref={this.ballLayout} x={450} opacity={0}>
                <Txt
                    ref={this.resText}
                    text={() => {
                        const p = this.progress();
                        if (p < 0.3) return "720P";
                        if (p < 0.8) return "1080P";
                        return "4K";
                    }}
                    y={-200}
                    fill={Colors.yellow}
                    fontSize={48}
                    fontFamily={'JetBrains Mono'}
                />
                 <Txt
                    ref={this.fpsText}
                    text={() => {
                        const p = this.progress();
                        // Map progress to FPS: 0 -> 60, 1 -> 10
                        // Linear map is fine for display
                        const fps = map(60, 10, p);
                        return `${fps.toFixed(0)} FPS`;
                    }}
                    y={-140}
                    fill={Colors.green}
                    fontSize={32}
                    fontFamily={'JetBrains Mono'}
                />

                {/* Smooth Ball */}
                <Circle
                    ref={this.ball}
                    size={100}
                    fill={Colors.orange}
                    opacity={() => this.progress() > 0.6 ? 1 : 0} // Show when high res
                />

                {/* Pixel Ball (Layout of Rects) */}
                <Layout
                    ref={this.pixelBall}
                    opacity={() => this.progress() > 0.6 ? 0 : 1} // Show when low res
                >
                    {this.createPixelCircle(100, Colors.orange)}
                </Layout>
            </Layout>
        );
    }

    private createPixelCircle(size: number, color: string) {
        const gridSize = 8;
        const cellSize = size / gridSize;
        const rects = [];
        for(let y=0; y<gridSize; y++) {
            for(let x=0; x<gridSize; x++) {
                const cx = (x - gridSize/2 + 0.5);
                const cy = (y - gridSize/2 + 0.5);
                const dist = Math.sqrt(cx*cx + cy*cy);
                if (dist < gridSize/2 - 0.5) {
                    rects.push(
                        <Rect
                            width={cellSize}
                            height={cellSize}
                            x={cx * cellSize}
                            y={cy * cellSize}
                            fill={color}
                        />
                    );
                }
            }
        }
        return rects;
    }

    protected *on_play(): ThreadGenerator {
        // Initial state
        this.progress(0);
        
        // Appear
        yield* all(
            this.chartLayout().opacity(1, 1),
            this.ballLayout().opacity(1, 1)
        );

        // Start bouncing loop
        const self = this;
        let isPlaying = true;
        
        function* bounceLoop() {
            let t = 0;
            const radius = 150; 
            
            while(isPlaying) {
                const p = self.progress();
                const fps = map(60, 10, p);
                const dt = 1 / fps; 
                const y = Math.sin(t) * radius;
                
                self.ball().y(y);
                self.pixelBall().y(y);
                
                const tStep = 3 * dt; 
                t += tStep;
                
                yield* waitFor(dt);
            }
        }

        yield* any(
            bounceLoop(),
            this.scriptSequence()
        );
        
        isPlaying = false;
    }

    private *scriptSequence(): ThreadGenerator {
        // 00:23 - 00:30: Intro to Dev scenario
        yield* waitUntil('start_tradeoff'); 
        
        // 00:40: "1080P output is limit"
        yield* waitUntil('switch_1080p'); 
        // Move to 1080p (Progress 0.4 approx for 1080p/30fps range)
        yield* this.progress(0.4, 2, easeInOutCubic); 
        
        // 00:50 approx: Show move to 4K
        yield* waitUntil('switch_4k');
        // Move to 4K (Progress 1)
        yield* this.progress(1, 4, easeInOutCubic); 
        
        yield* waitUntil('end_tradeoff'); 
    }
}
