import { Layout, LayoutProps, Line } from '@motion-canvas/2d';
import { Vector2 } from '@motion-canvas/core';
import { Colors } from '../../../colors';

export interface Line2DProps extends LayoutProps {
  from?: Vector2 | (() => Vector2);
  to?: Vector2 | (() => Vector2);
  color?: string;
  lineWidth?: number;
  lineDash?: number[];
}

export class Line2D extends Layout {
  constructor(props: Line2DProps) {
    const { 
      from = new Vector2(0, 0), 
      to = new Vector2(100, 0), 
      color = Colors.orange, 
      lineWidth = 4, 
      lineDash,
      ...rest 
    } = props;
    super(rest);

    const getFrom = () => (typeof from === 'function' ? from() : from);
    const getTo = () => (typeof to === 'function' ? to() : to);

    this.add(
      <Line
        points={() => [getFrom(), getTo()]}
        stroke={color}
        lineWidth={lineWidth}
        lineDash={lineDash}
      />
    );
  }
}
