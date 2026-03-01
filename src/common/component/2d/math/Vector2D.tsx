import { Layout, LayoutProps, Line, Circle } from '@motion-canvas/2d';
import { Vector2, SimpleSignal } from '@motion-canvas/core';
import { Colors } from '../../../colors';

export interface Vector2DProps extends LayoutProps {
  from?: Vector2 | (() => Vector2);
  to?: Vector2 | (() => Vector2);
  color?: string;
  lineWidth?: number;
  headSize?: number;
  showTail?: boolean;
}

export class Vector2D extends Layout {
  constructor(props: Vector2DProps) {
    const { from = new Vector2(0, 0), to = new Vector2(100, 0), color = Colors.green, lineWidth = 4, headSize = 20, showTail = true, ...rest } = props;
    super(rest);

    const getFrom = () => (typeof from === 'function' ? from() : from);
    const getTo = () => (typeof to === 'function' ? to() : to);

    this.add(
      <Line
        points={() => [getFrom(), getTo()]}
        stroke={color}
        lineWidth={lineWidth}
        endArrow
        arrowSize={headSize}
      />
    );

    if (showTail) {
      this.add(
        <Circle
          position={() => getFrom()}
          size={lineWidth * 2}
          fill={color}
        />
      );
    }
  }
}
