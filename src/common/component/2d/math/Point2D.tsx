import { Layout, LayoutProps, Circle, Txt } from '@motion-canvas/2d';
import { Vector2, SignalValue, SimpleSignal } from '@motion-canvas/core';
import { initial, signal } from '@motion-canvas/2d/lib/decorators';
import { Colors } from '../../../colors';

export interface Point2DProps extends LayoutProps {
  pointPosition?: SignalValue<Vector2>;
  radius?: SignalValue<number>;
  color?: SignalValue<string>;
  label?: SignalValue<string | null>;
  labelOffset?: SignalValue<Vector2>;
  labelSize?: SignalValue<number>;
}

export class Point2D extends Layout {
  @initial(new Vector2(0, 0))
  @signal()
  public declare readonly pointPosition: SimpleSignal<Vector2, this>;

  @initial(6)
  @signal()
  public declare readonly radius: SimpleSignal<number, this>;

  @initial(Colors.yellow)
  @signal()
  public declare readonly color: SimpleSignal<string, this>;

  @initial(null)
  @signal()
  public declare readonly label: SimpleSignal<string | null, this>;

  @initial(new Vector2(10, -10))
  @signal()
  public declare readonly labelOffset: SimpleSignal<Vector2, this>;

  @initial(24)
  @signal()
  public declare readonly labelSize: SimpleSignal<number, this>;

  constructor(props: Point2DProps) {
    super(props);

    this.add(
      <Circle
        position={() => this.pointPosition()}
        size={() => this.radius() * 2}
        fill={() => this.color()}
      />
    );

    this.add(
      <Txt
        text={() => this.label() ?? ''}
        position={() => this.pointPosition().add(this.labelOffset())}
        fontSize={() => this.labelSize()}
        fill={"#fff"}
        fontFamily={"Consolas, monospace"}
        opacity={() => this.label() !== null ? 1 : 0}
      />
    );
  }
}
