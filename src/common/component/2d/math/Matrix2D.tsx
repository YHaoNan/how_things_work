import { Layout, LayoutProps, Txt, Rect } from '@motion-canvas/2d';
import { SimpleSignal } from '@motion-canvas/core';
import { Colors } from '../../../colors';

export interface Matrix2DProps extends LayoutProps {
  data: (number | SimpleSignal<number>)[][];
  color?: string;
  columnColors?: string[];
  rowHighlights?: SimpleSignal<number>[];
  fontSize?: number;
  bracketWidth?: number;
}

export class Matrix2D extends Layout {
  constructor(props: Matrix2DProps) {
    const { 
      data, 
      color = Colors.yellow, 
      columnColors = [], 
      rowHighlights = [],
      fontSize = 40, 
      bracketWidth = 4, 
      ...rest 
    } = props;
    super(rest);

    const rows = data.length;
    const cols = data[0]?.length || 0;
    const cellWidth = 80;
    const cellHeight = 60;
    const totalWidth = cols * cellWidth;
    const totalHeight = rows * cellHeight;

    this.add(
      <Rect
        width={totalWidth + 40}
        height={totalHeight + 20}
        stroke={color}
        lineWidth={bracketWidth}
        radius={20}
      />
    );

    // Row Highlight Backgrounds
    data.forEach((_, i) => {
      this.add(
        <Rect
          width={totalWidth + 20}
          height={cellHeight - 10}
          fill={Colors.yellow}
          opacity={() => rowHighlights[i]?.() ?? 0}
          y={i * cellHeight - (totalHeight - cellHeight) / 2}
          radius={8}
          zIndex={-1}
        />
      );
    });

    data.forEach((row, i) => {
      row.forEach((sig, j) => {
        this.add(
          <Txt
            text={() => {
              const val = typeof sig === 'function' ? sig() : sig;
              return val.toFixed(0);
            }}
            fill={() => columnColors[j] || "#fff"}
            fontSize={fontSize}
            x={j * cellWidth - (totalWidth - cellWidth) / 2}
            y={i * cellHeight - (totalHeight - cellHeight) / 2}
            fontFamily={"Consolas, monospace"}
            fontWeight={700}
          />
        );
      });
    });
  }
}
