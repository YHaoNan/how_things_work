import { ThreadGenerator, all, usePlayback, waitFor, tween, easeInOutCubic, createSignal, SimpleSignal, Vector2 } from "@motion-canvas/core";
import { Txt, Layout } from "@motion-canvas/2d";
import { AnimLayer } from "@src/common/animLayer";
import { Axes2D, Vector2D, Matrix2D, Line2D } from "@src/common/component/2d/math";
import { Colors } from "@src/common/colors";

export class EliminationLayer extends AnimLayer {
  private matrixSignals: SimpleSignal<number>[][] = [];
  private opText = createSignal("");
  private rowHighlights: SimpleSignal<number>[] = [];
  
  private v1Ref = createSignal(new Vector2(0, 0));
  private v2Ref = createSignal(new Vector2(0, 0));
  private spanPoints = createSignal<Vector2[]>([new Vector2(0, 0), new Vector2(0, 0)]);

  protected override on_build_ui(): void {
    // 1. Initialize signals (2x2)
    if (this.matrixSignals.length === 0) {
      for (let i = 0; i < 2; i++) {
        this.matrixSignals[i] = [createSignal(0), createSignal(0)];
        this.rowHighlights[i] = createSignal(0);
      }
    }

    const A = [[1, 2], [1, 2]];
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        this.matrixSignals[i][j](A[i][j]);
      }
    }
    this.opText("Initial Matrix A");

    const scale = 100; // 1 unit = 100 pixels

    this.root.add(
      <Layout>
        {/* Background Grid and Axes */}
        <Axes2D 
          xRange={[-600, 600]} 
          yRange={[-400, 400]} 
          step={scale} 
          showGrid 
          gridOpacity={0.1}
        />

        {/* Column Space Span Line */}
        <Line2D 
          from={() => this.spanPoints()[0]} 
          to={() => this.spanPoints()[1]} 
          lineColor={Colors.orange} 
          lineWidth={2}
          opacity={0.3}
        />

        {/* Column Vectors */}
        <Vector2D 
          to={() => this.v1Ref().scale(scale)} 
          color={Colors.red} 
          lineWidth={6}
          headSize={20}
        />
        <Vector2D 
          to={() => this.v2Ref().scale(scale)} 
          color={Colors.green} 
          lineWidth={6}
          headSize={20}
        />

        {/* 2D Matrix UI Overlay */}
        <Layout x={-650} y={-350}>
          <Txt
            text={() => this.opText()}
            fill={Colors.yellow}
            fontSize={32}
            y={-100}
            fontFamily={"Consolas, monospace"}
          />
          <Matrix2D 
            data={this.matrixSignals}
            columnColors={[Colors.red, Colors.green]}
            rowHighlights={this.rowHighlights}
            bracketColor={Colors.yellow}
            fontSize={40}
          />
        </Layout>
      </Layout>
    );
  }

  protected override *on_play(): ThreadGenerator {
    const origin = new Vector2(0, 0);
    const scale = 100;

    // Initial Matrix A = [[1, 2], [1, 2]]
    const A0 = [[1, 2], [1, 2]];
    const c1_0 = new Vector2(1, 1);
    const c2_0 = new Vector2(2, 2);

    // Final Matrix A' = [[1, 2], [0, 0]]
    const A1 = [[1, 2], [0, 0]];
    const c1_1 = new Vector2(1, 0);
    const c2_1 = new Vector2(2, 0);

    // Initial setup
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        this.matrixSignals[i][j](A0[i][j]);
      }
    }
    this.v1Ref(c1_0);
    this.v2Ref(c2_0);
    this.opText("Initial Matrix A");
    this.updateSpan(c1_0, c2_0);

    yield* waitFor(2);

    // Animation: R2 = R2 - R1
    this.opText("Elimination: R2 = R2 - R1");
    
    // Highlight Row 2
    yield* all(
      this.rowHighlights[1](0.3, 0.4),
      tween(3, (t) => {
        const val = easeInOutCubic(t);
        
        // Update Vectors
        const curV1 = c1_0.lerp(c1_1, val);
        const curV2 = c2_0.lerp(c2_1, val);
        this.v1Ref(curV1);
        this.v2Ref(curV2);
        this.updateSpan(curV1, curV2);

        // Update Matrix UI
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 2; j++) {
            const start = A0[i][j];
            const end = A1[i][j];
            this.matrixSignals[i][j](start + (end - start) * val);
          }
        }
      })
    );

    yield* this.rowHighlights[1](0, 0.4);

    this.opText("Elimination Complete: Rank = 1");
    yield* waitFor(2);
  }

  private updateSpan(v1: Vector2, v2: Vector2) {
    const scale = 100;
    // For 2D redundant matrix, col space is a line.
    // We draw a line through origin and the tips.
    const dir = v1.magnitude > 0.1 ? v1.normalized : v2.normalized;
    this.spanPoints([
      dir.scale(-1000), // Far in one direction
      dir.scale(1000)   // Far in other direction
    ]);
  }
}
