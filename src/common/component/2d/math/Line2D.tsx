import { Layout, LayoutProps, Line } from '@motion-canvas/2d';
import { Vector2, SignalValue, SimpleSignal } from '@motion-canvas/core';
import { initial, signal } from '@motion-canvas/2d/lib/decorators';
import { Colors } from '../../../colors';

export interface Line2DProps extends LayoutProps {
  from?: SignalValue<Vector2>;
  to?: SignalValue<Vector2>;
  lineColor?: SignalValue<string>;
  lineWidth?: SignalValue<number>;
  lineDash?: SignalValue<number[]>;
}

export class Line2D extends Layout {
  @initial(new Vector2(0, 0))
  @signal()
  public declare readonly from: SimpleSignal<Vector2, this>;

  @initial(new Vector2(100, 0))
  @signal()
  public declare readonly to: SimpleSignal<Vector2, this>;

  @initial(Colors.orange)
  @signal()
  public declare readonly lineColor: SimpleSignal<string, this>;

  @initial(4)
  @signal()
  public declare readonly lineWidth: SimpleSignal<number, this>;

  @initial(null)
  @signal()
  public declare readonly lineDash: SimpleSignal<number[] | null, this>;

  constructor(props: Line2DProps) {
    super(props);

    this.add(
      <Line
        points={() => [this.from(), this.to()]}
        stroke={() => this.lineColor()}
        lineWidth={() => this.lineWidth()}
        lineDash={() => this.lineDash()}
      />
    );
  }
}
