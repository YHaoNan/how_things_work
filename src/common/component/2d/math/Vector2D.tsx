import { Layout, LayoutProps, Line, Circle } from '@motion-canvas/2d';
import { Vector2, SignalValue, SimpleSignal } from '@motion-canvas/core';
import { initial, signal } from '@motion-canvas/2d/lib/decorators';
import { Colors } from '../../../colors';

export interface Vector2DProps extends LayoutProps {
  from?: SignalValue<Vector2>;
  to?: SignalValue<Vector2>;
  color?: SignalValue<string>;
  lineWidth?: SignalValue<number>;
  headSize?: SignalValue<number>;
  showTail?: SignalValue<boolean>;
}

export class Vector2D extends Layout {
  @initial(new Vector2(0, 0))
  @signal()
  public declare readonly from: SimpleSignal<Vector2, this>;

  @initial(new Vector2(100, 0))
  @signal()
  public declare readonly to: SimpleSignal<Vector2, this>;

  @initial(Colors.green)
  @signal()
  public declare readonly color: SimpleSignal<string, this>;

  @initial(4)
  @signal()
  public declare readonly lineWidth: SimpleSignal<number, this>;

  @initial(20)
  @signal()
  public declare readonly headSize: SimpleSignal<number, this>;

  @initial(true)
  @signal()
  public declare readonly showTail: SimpleSignal<boolean, this>;

  constructor(props: Vector2DProps) {
    super(props);

    this.add(
      <Line
        points={() => [this.from(), this.to()]}
        stroke={() => this.color()}
        lineWidth={() => this.lineWidth()}
        endArrow
        arrowSize={() => this.headSize()}
      />
    );

    this.add(
      <Circle
        position={() => this.from()}
        size={() => this.lineWidth() * 2}
        fill={() => this.color()}
        opacity={() => this.showTail() ? 1 : 0}
      />
    );
  }
}
