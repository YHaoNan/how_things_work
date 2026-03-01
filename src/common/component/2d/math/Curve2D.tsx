import { Layout, LayoutProps, Spline } from '@motion-canvas/2d';
import { Vector2 } from '@motion-canvas/core';
import { Colors } from '../../../colors';

export interface Curve2DProps extends LayoutProps {
  fn: (t: number) => Vector2;
  tMin?: number;
  tMax?: number;
  segments?: number;
  color?: string;
  lineWidth?: number;
  lineDash?: number[];
}

export class Curve2D extends Layout {
  constructor(props: Curve2DProps) {
    const { 
      fn, 
      tMin = 0, 
      tMax = 1, 
      segments = 100, 
      color = Colors.red, 
      lineWidth = 4, 
      lineDash,
      ...rest 
    } = props;
    super(rest);

    this.add(
      <Spline
        points={() => {
          const pts: Vector2[] = [];
          for (let i = 0; i <= segments; i++) {
            const t = tMin + (tMax - tMin) * (i / segments);
            pts.push(fn(t));
          }
          return pts;
        }}
        stroke={color}
        lineWidth={lineWidth}
        lineDash={lineDash}
      />
    );
  }
}
