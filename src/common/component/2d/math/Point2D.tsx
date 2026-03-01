import { Layout, LayoutProps, Circle, Txt } from '@motion-canvas/2d';
import { Vector2 } from '@motion-canvas/core';
import { Colors } from '../../../colors';

export interface Point2DProps extends LayoutProps {
  position?: Vector2 | (() => Vector2);
  radius?: number;
  color?: string;
  label?: string | (() => string);
  labelOffset?: Vector2;
  labelSize?: number;
}

export class Point2D extends Layout {
  constructor(props: Point2DProps) {
    const { 
      position = new Vector2(0, 0), 
      radius = 6, 
      color = Colors.yellow, 
      label,
      labelOffset = new Vector2(10, -10),
      labelSize = 24,
      ...rest 
    } = props;
    super(rest);

    const getPos = () => (typeof position === 'function' ? position() : position);

    this.add(
      <Circle
        position={() => getPos()}
        size={radius * 2}
        fill={color}
      />
    );

    if (label) {
      this.add(
        <Txt
          text={() => (typeof label === 'function' ? label() : label)}
          position={() => getPos().add(labelOffset)}
          fontSize={labelSize}
          fill={"#fff"}
          fontFamily={"Consolas, monospace"}
        />
      );
    }
  }
}
