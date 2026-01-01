import { Layout, Rect, Txt, Line, Circle, Spline } from "@motion-canvas/2d";
import { ThreadGenerator, createRef, all, any, createSignal, map, easeInOutCubic, tween, Reference, waitFor } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";

// Simulated Pixel Ball Component
const PixelBall = (props: {
  resolution: Reference<number>; // 0 (low) to 1 (high)
  size: number;
  color: string;
} & any) => {
  const container = createRef<Layout>();
  
  // Generate pixel grid
  const pixels: Rect[] = [];
  const gridSize = 10;
  const cellSize = props.size / gridSize;
  
  for(let y=0; y<gridSize; y++) {
    for(let x=0; x<gridSize; x++) {
      // Circular mask logic
      const cx = (x + 0.5) - gridSize/2;
      const cy = (y + 0.5) - gridSize/2;
      if (Math.sqrt(cx*cx + cy*cy) <= gridSize/2) {
        pixels.push(
          <Rect
            width={cellSize}
            height={cellSize}
            x={(x - gridSize/2) * cellSize + cellSize/2}
            y={(y - gridSize/2) * cellSize + cellSize/2}
            fill={props.color}
            opacity={() => 1 - props.resolution()} // Hide pixels when high res
          />
        );
      }
    }
  }

  return (
    <Layout ref={container} {...props}>
      {/* Pixel Layer */}
      <Layout>
        {pixels}
      </Layout>
      {/* HD Layer */}
      <Circle
        width={props.size}
        height={props.size}
        fill={props.color}
        opacity={() => props.resolution()} // Show when high res
      />
    </Layout>
  );
};

export class TradeoffLayer extends AnimLayer {
    // Refs
    private chartContainer = createRef<Layout>();
    private ballContainer = createRef<Layout>();
    private indicatorRef = createRef<Circle>();
    private spline = createRef<Spline>();
    private resText = createRef<Txt>();
    private fpsText = createRef<Txt>();

    // Signals
    private progress = createSignal(0);
    private ballY = createSignal(0);
    
    // Config
    private readonly chartWidth = 600;
    private readonly chartHeight = 400;
    private readonly chartX = -200;
    private readonly ballX = 350;

    // Derived Signals
    private currentRes = createSignal(() => {
        const p = this.progress();
        if (p < 0.5) return map(720, 1080, p * 2);
        return map(1080, 2160, (p - 0.5) * 2);
    });

    private currentFps = createSignal(() => {
        const p = this.progress();
        if (p < 0.5) return map(60, 30, p * 2);
        return map(30, 10, (p - 0.5) * 2);
    });

    private resolutionQuality = createSignal(() => {
        const res = this.currentRes();
        return map(0, 1, (res - 720) / (2160 - 720));
    });

    protected on_build_ui(): void {
        const axisColor = '#ffffff';
        const curveColor = Colors.orange;
        const ballColor = Colors.green;

        this.root.add(
            <Layout>
                {/* Title */}
                <Txt
                    text="Resolution vs FPS Trade-off"
                    y={-350}
                    fill={'#ffffff'}
                    fontSize={48}
                    fontFamily={'JetBrains Mono, Arial'}
                />

                {/* Chart Area */}
                <Layout ref={this.chartContainer} x={this.chartX}>
                    {/* Axes */}
                    <Line
                        points={[[-this.chartWidth/2, -this.chartHeight/2], [-this.chartWidth/2, this.chartHeight/2], [this.chartWidth/2, this.chartHeight/2]]}
                        stroke={axisColor}
                        lineWidth={4}
                        endArrow
                    />
                    <Txt text="FPS" x={this.chartWidth/2 + 40} y={this.chartHeight/2} fill={axisColor} fontSize={24} />
                    <Txt text="Resolution" x={-this.chartWidth/2} y={-this.chartHeight/2 - 40} fill={axisColor} fontSize={24} />
                    
                    {/* Ticks */}
                    <Txt text="10" x={this.chartWidth/2 - (this.chartWidth * 10/70)} y={this.chartHeight/2 + 30} fill={axisColor} fontSize={20} />
                    <Txt text="30" x={this.chartWidth/2 - (this.chartWidth * 30/70)} y={this.chartHeight/2 + 30} fill={axisColor} fontSize={20} />
                    <Txt text="60" x={this.chartWidth/2 - (this.chartWidth * 60/70)} y={this.chartHeight/2 + 30} fill={axisColor} fontSize={20} />
                    
                    <Txt text="720p" x={-this.chartWidth/2 - 50} y={this.chartHeight/2 - (this.chartHeight * 720/2500)} fill={axisColor} fontSize={20} />
                    <Txt text="1080p" x={-this.chartWidth/2 - 60} y={this.chartHeight/2 - (this.chartHeight * 1080/2500)} fill={axisColor} fontSize={20} />
                    <Txt text="4K" x={-this.chartWidth/2 - 40} y={this.chartHeight/2 - (this.chartHeight * 2160/2500)} fill={axisColor} fontSize={20} />

                    {/* Curve */}
                    <Spline
                        ref={this.spline}
                        lineWidth={6}
                        stroke={curveColor}
                        points={[
                            [ // P1: 60fps, 720p
                                -this.chartWidth/2 + (this.chartWidth * 60/70), 
                                this.chartHeight/2 - (this.chartHeight * 720/2500)
                            ],
                            [ // P2: 30fps, 1080p
                                -this.chartWidth/2 + (this.chartWidth * 30/70), 
                                this.chartHeight/2 - (this.chartHeight * 1080/2500)
                            ],
                            [ // P3: 10fps, 4K
                                -this.chartWidth/2 + (this.chartWidth * 10/70), 
                                this.chartHeight/2 - (this.chartHeight * 2160/2500)
                            ]
                        ]}
                        smoothness={0.4}
                        end={0} // Start hidden
                    />

                    {/* Indicator */}
                    <Circle
                        ref={this.indicatorRef}
                        size={20}
                        fill={'#ffffff'}
                        position={() => [
                            -this.chartWidth/2 + (this.chartWidth * this.currentFps()/70),
                            this.chartHeight/2 - (this.chartHeight * this.currentRes()/2500)
                        ]}
                        opacity={0}
                    />
                </Layout>

                {/* Demo Area (Right) */}
                <Layout x={this.ballX}>
                    <Txt
                        ref={this.resText}
                        y={-240}
                        text={() => `${this.currentRes().toFixed(0)}P`}
                        fill={'#ffffff'}
                        fontSize={40}
                        fontFamily={'JetBrains Mono'}
                        opacity={0} // Start hidden
                    />
                    <Txt
                        ref={this.fpsText}
                        y={-190}
                        text={() => `${this.currentFps().toFixed(0)} FPS`}
                        fill={curveColor}
                        fontSize={32}
                        fontFamily={'JetBrains Mono'}
                        opacity={0} // Start hidden
                    />

                    <PixelBall
                        ref={this.ballContainer}
                        size={150}
                        color={ballColor}
                        resolution={this.resolutionQuality}
                        y={() => this.ballY()}
                        opacity={0} // Start hidden
                    />
                </Layout>
            </Layout>
        );
    }

    protected *on_play(): ThreadGenerator {
        // Show elements
        yield* all(
             this.spline().end(1, 1),
             this.resText().opacity(1, 1),
             this.fpsText().opacity(1, 1),
             this.indicatorRef().opacity(1, 1),
             this.ballContainer().opacity(1, 1),
        );

        let isSimulationRunning = true;
        const self = this;

        function* ballPhysics() {
            let time = 0;
            const amplitude = 150;
            const frequency = 2; // Hz
            
            while (isSimulationRunning) {
                const fps = self.currentFps();
                const dt = 1 / fps; 
                
                time += dt;
                const newY = Math.sin(time * Math.PI * frequency) * amplitude;
                self.ballY(newY);

                yield* waitFor(dt);
            }
        }

        function* mainSequence() {
            // Phase 1: 720p Start
            yield* waitFor(1); 
            
            // Transition: 720p -> 1080p
            yield* tween(2, value => {
                self.progress(map(0, 0.5, easeInOutCubic(value)));
            });

            // Phase 2: 1080p Pause
            yield* waitFor(1);

            // Transition: 1080p -> 4K
            yield* tween(2, value => {
                self.progress(map(0.5, 1.0, easeInOutCubic(value)));
            });

            // Phase 3: 4K End
            yield* waitFor(2);
            
            isSimulationRunning = false;
        }

        yield* any(
            ballPhysics(),
            mainSequence()
        );
    }
}
