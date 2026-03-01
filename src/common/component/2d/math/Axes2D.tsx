import { Layout, LayoutProps, Line, Grid, Txt } from '@motion-canvas/2d';
import { Vector2, createRef } from '@motion-canvas/core';
import { Colors } from '../../../colors';

export interface Axes2DProps extends LayoutProps {
  xRange?: [number, number];
  yRange?: [number, number];
  step?: number;
  showGrid?: boolean;
  colorX?: string;
  colorY?: string;
  gridColor?: string;
  gridOpacity?: number;
  axisWidth?: number;
  arrowSize?: number;
}

export class Axes2D extends Layout {
  constructor(props: Axes2DProps) {
    const {
      xRange = [-500, 500],
      yRange = [-300, 300],
      step = 100,
      showGrid = true,
      colorX = Colors.red,
      colorY = Colors.green,
      gridColor = '#333',
      gridOpacity = 0.5,
      axisWidth = 2,
      arrowSize = 16,
      ...rest
    } = props;
    super(rest);

    const width = xRange[1] - xRange[0];
    const height = yRange[1] - yRange[0];

    // Grid
    if (showGrid) {
      this.add(
        <Grid
          width={width}
          height={height}
          spacing={step}
          stroke={gridColor}
          lineWidth={1}
          opacity={gridOpacity}
        />
      );
    }

    // X Axis
    this.add(
      <Line
        points={[new Vector2(xRange[0], 0), new Vector2(xRange[1], 0)]}
        stroke={colorX}
        lineWidth={axisWidth}
        endArrow
        arrowSize={arrowSize}
      />
    );

    // Y Axis
    this.add(
      <Line
        points={[new Vector2(0, -yRange[0]), new Vector2(0, -yRange[1])]}
        stroke={colorY}
        lineWidth={axisWidth}
        endArrow
        arrowSize={arrowSize}
      />
    );
  }
}
