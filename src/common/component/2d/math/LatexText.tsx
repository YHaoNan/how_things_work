import {Layout, LayoutProps, Latex} from '@motion-canvas/2d';
import {SignalValue, SimpleSignal} from '@motion-canvas/core';
import {initial, signal} from '@motion-canvas/2d/lib/decorators';

export interface LatexSegment {
  tex: SignalValue<string>;
  color?: SignalValue<string>;
}

export interface LatexTextProps extends LayoutProps {
  tex?: SignalValue<string>;
  segments?: LatexSegment[];
  charColors?: SignalValue<string>[];
  fill?: SignalValue<string>;
  fontSize?: SignalValue<number>;
}

export class LatexText extends Layout {
  @initial('#fff')
  @signal()
  public declare readonly fill: SimpleSignal<string, this>;

  @initial(32)
  @signal()
  public declare readonly fontSize: SimpleSignal<number, this>;

  constructor(props: LatexTextProps) {
    const {tex, segments, charColors, fill = '#fff', fontSize = 32, ...rest} = props;
    super(rest);

    const buildTex = () => {
      if (segments && segments.length > 0) {
        return segments
          .map(seg => {
            const text = typeof seg.tex === 'function' ? seg.tex() : seg.tex;
            const color = seg.color ? (typeof seg.color === 'function' ? seg.color() : seg.color) : undefined;
            if (color) {
              return `{\\color{${color}} ${text}}`;
            }
            return text;
          })
          .join('');
      }
      const base = tex ? (typeof tex === 'function' ? tex() : tex) : '';
      if (charColors && charColors.length > 0) {
        const chars = Array.from(base);
        return chars
          .map((ch, i) => {
            const color = charColors[i]
              ? typeof charColors[i] === 'function'
                ? (charColors[i] as any)()
                : charColors[i]
              : undefined;
            if (color) {
              return `{\\color{${color}} ${ch}}`;
            }
            return ch;
          })
          .join('');
      }
      return base;
    };

    this.add(
      <Latex
        tex={() => buildTex()}
        fill={() => this.fill()}
        fontSize={() => this.fontSize()}
      />,
    );
  }
}
