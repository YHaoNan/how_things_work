import { Layout, LayoutProps, Line, Grid } from '@motion-canvas/2d';
import { Vector2, SignalValue, SimpleSignal } from '@motion-canvas/core';
import { initial, signal } from '@motion-canvas/2d/lib/decorators';
import { Colors } from '../../../colors';

export interface Axes2DProps extends LayoutProps {
  xRange?: SignalValue<[number, number]>;
  yRange?: SignalValue<[number, number]>;
  step?: SignalValue<number>;
  showGrid?: SignalValue<boolean>;
  colorX?: SignalValue<string>;
  colorY?: SignalValue<string>;
  gridColor?: SignalValue<string>;
  gridOpacity?: SignalValue<number>;
  axisWidth?: SignalValue<number>;
  arrowSize?: SignalValue<number>;
}

export class Axes2D extends Layout {
  @initial([-500, 500])
  @signal()
  public declare readonly xRange: SimpleSignal<[number, number], this>;

  @initial([-300, 300])
  @signal()
  public declare readonly yRange: SimpleSignal<[number, number], this>;

  @initial(100)
  @signal()
  public declare readonly step: SimpleSignal<number, this>;

  @initial(true)
  @signal()
  public declare readonly showGrid: SimpleSignal<boolean, this>;

  @initial(Colors.red)
  @signal()
  public declare readonly colorX: SimpleSignal<string, this>;

  @initial(Colors.green)
  @signal()
  public declare readonly colorY: SimpleSignal<string, this>;

  @initial('#333')
  @signal()
  public declare readonly gridColor: SimpleSignal<string, this>;

  @initial(0.5)
  @signal()
  public declare readonly gridOpacity: SimpleSignal<number, this>;

  @initial(2)
  @signal()
  public declare readonly axisWidth: SimpleSignal<number, this>;

  @initial(16)
  @signal()
  public declare readonly arrowSize: SimpleSignal<number, this>;

  constructor(props: Axes2DProps) {
    super(props);

    this.add(
      <Grid
        width={() => this.xRange()[1] - this.xRange()[0]}
        height={() => this.yRange()[1] - this.yRange()[0]}
        spacing={() => this.step()}
        stroke={() => this.gridColor()}
        lineWidth={1}
        opacity={() => this.showGrid() ? this.gridOpacity() : 0}
      />
    );

    // X Axis
    this.add(
      <Line
        points={() => [new Vector2(this.xRange()[0], 0), new Vector2(this.xRange()[1], 0)]}
        stroke={() => this.colorX()}
        lineWidth={() => this.axisWidth()}
        endArrow
        arrowSize={() => this.arrowSize()}
      />
    );

    // Y Axis
    this.add(
      <Line
        points={() => [new Vector2(0, -this.yRange()[0]), new Vector2(0, -this.yRange()[1])]}
        stroke={() => this.colorY()}
        lineWidth={() => this.axisWidth()}
        endArrow
        arrowSize={() => this.arrowSize()}
      />
    );
  }
}
