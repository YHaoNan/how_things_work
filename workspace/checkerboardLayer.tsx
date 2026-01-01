import { Layout, Rect, Txt, Circle } from "@motion-canvas/2d";
import { ThreadGenerator, createRef, all, any, createSignal, map, easeInOutCubic, tween, waitFor, Reference } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";

const createGrid = (ref: Reference<Layout>, modeFunc: (isWhite: boolean) => number, gridRows: number, gridCols: number, cellSize: number) => (
    <Layout ref={ref}>
        {Array.from({length: gridRows * gridCols}).map((_, i) => {
            const col = i % gridCols;
            const row = Math.floor(i / gridCols);
            const x = (col - gridCols / 2 + 0.5) * cellSize;
            const y = (row - gridRows / 2 + 0.5) * cellSize;
            const isWhite = (row + col) % 2 === 0;
            
            return (
                <Rect
                    width={cellSize - 2}
                    height={cellSize - 2}
                    x={x}
                    y={y}
                    fill={'#ddd'}
                    radius={4}
                    opacity={() => modeFunc(isWhite)}
                />
            );
        })}
    </Layout>
);

export class CheckerboardLayer extends AnimLayer {
    // Refs
    private leftGrid = createRef<Layout>();
    private rightGrid = createRef<Layout>();
    private leftBall = createRef<Circle>();
    private rightBall = createRef<Circle>();
    private fpsText = createRef<Txt>();
    private description = createRef<Txt>();

    // Signals
    private renderMode = createSignal(0); // 0: All, 1: White, 2: Black
    private fpsSignal = createSignal(10);
    private fpsX = createSignal(0);
    private rightSideActive = createSignal(0);

    protected on_build_ui(): void {
        const gridRows = 10;
        const gridCols = 10;
        const cellSize = 60;

        // 5.1 Left Side: Full Rendering
        this.root.add(
            <Layout x={-450} y={50}>
                {createGrid(this.leftGrid, () => 0.8, gridRows, gridCols, cellSize)}
                <Circle
                    ref={this.leftBall}
                    size={80}
                    fill={Colors.orange}
                    x={0}
                    y={0}
                />
                <Txt
                    text="Full Rendering"
                    y={-350}
                    fill={'#ffffff'}
                    fontSize={40}
                    fontFamily={'JetBrains Mono'}
                />
                <Txt
                    text="100% Workload"
                    y={350}
                    fill={Colors.red}
                    fontSize={32}
                    fontFamily={'JetBrains Mono'}
                />
            </Layout>
        );

        // 5.2 Right Side: Checkerboard
        this.root.add(
            <Layout x={450} y={50} opacity={() => this.rightSideActive()}>
                {createGrid(this.rightGrid, (isWhite) => {
                    const mode = this.renderMode();
                    if (mode === 0) return 0.8; 
                    if (mode === 1) return isWhite ? 0.8 : 0.1;
                    if (mode === 2) return !isWhite ? 0.8 : 0.1;
                    return 0.8;
                }, gridRows, gridCols, cellSize)}
                 <Circle
                    ref={this.rightBall}
                    size={80}
                    fill={Colors.orange}
                    x={0}
                    y={0}
                />
                <Txt
                    text="Checkerboard"
                    y={-350}
                    fill={'#ffffff'}
                    fontSize={40}
                    fontFamily={'JetBrains Mono'}
                />
                <Txt
                    text="50% Workload"
                    y={350}
                    fill={Colors.green}
                    fontSize={32}
                    fontFamily={'JetBrains Mono'}
                />
            </Layout>
        );

        // 5.3 Center/Floating FPS
        this.root.add(
            <Layout x={0} y={0}>
                 <Txt
                    ref={this.description}
                    text="VS"
                    fill={'#ffffff'}
                    fontSize={80}
                    fontFamily={'JetBrains Mono'}
                    fontWeight={700}
                    opacity={1}
                />
                <Txt
                    ref={this.fpsText}
                    text={() => `${this.fpsSignal().toFixed(0)} FPS`}
                    x={() => this.fpsX()}
                    y={150}
                    fill={Colors.yellow}
                    fontSize={64}
                    fontFamily={'JetBrains Mono'}
                    fontWeight={700}
                    shadowBlur={10}
                    shadowColor={'rgba(0,0,0,0.5)'}
                />
            </Layout>
        );
    }

    protected *on_play(): ThreadGenerator {
        let isPlaying = true;
        const self = this;

        function* toggleGrid() {
            while (isPlaying) {
                const fps = self.fpsSignal();
                const dt = 1 / fps;
                
                if (fps > 15) {
                    self.renderMode(self.renderMode() === 1 ? 2 : 1);
                } else {
                    self.renderMode(0);
                }
                
                yield* waitFor(dt);
            }
        }

        function* moveBalls() {
            let t = 0;
            const radius = 150;
            
            while (isPlaying) {
                const currentFps = self.fpsSignal();
                t += 0.02; 
                
                // Left Ball (10 FPS)
                const tLeft = Math.floor(t * 10) / 10; 
                self.leftBall().position([
                    Math.cos(tLeft * 3) * radius,
                    Math.sin(tLeft * 3) * radius
                ]);
                
                // Right Ball (Dynamic FPS)
                if (self.rightSideActive() > 0) {
                    const step = 1 / currentFps;
                    const tRight = Math.floor(t / step) * step;
                    self.rightBall().position([
                        Math.cos(tRight * 3) * radius,
                        Math.sin(tRight * 3) * radius
                    ]);
                } else {
                     self.rightBall().position([
                        radius,
                        0
                    ]);
                }

                yield* waitFor(0.016); 
            }
        }

        function* mainTimeline() {
            self.fpsX(-450); 
            self.fpsSignal(10);
            self.rightSideActive(0); 
            
            yield* waitFor(2);
            
            yield* all(
                self.fpsX(450, 2, easeInOutCubic),
                self.fpsSignal(30, 2, easeInOutCubic),
                self.description().opacity(0, 1),
                tween(2, value => {
                    if (value > 0.3) {
                        self.rightSideActive(map(0, 1, (value - 0.3) / 0.7));
                    }
                })
            );
            
            yield* waitFor(5); // Run for 5 seconds
            
            isPlaying = false;
        }

        yield* any(
            toggleGrid(),
            moveBalls(),
            mainTimeline()
        );
    }
}
