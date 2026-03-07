import {Layout, LayoutProps, Latex, Txt} from '@motion-canvas/2d';
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
  fontFill?: SignalValue<string>;
  texFontSize?: SignalValue<number>;
  isText?: boolean; // New prop to indicate if it's plain text (Chinese support)
}

export class LatexText extends Layout {
  @initial('#fff')
  @signal()
  public declare readonly fontFill: SimpleSignal<string, this>;

  @initial(32)
  @signal()
  public declare readonly texFontSize: SimpleSignal<number, this>;

  @initial('')
  @signal()
  public declare readonly tex: SimpleSignal<string, this>;

  private isText: boolean = false;

  constructor(props: LatexTextProps) {
    const {tex, segments, charColors, fontFill = '#fff', texFontSize = 32, isText = false, ...rest} = props;
    super(rest);
    
    this.isText = isText;

    // Initialize tex signal if provided in props
    if (tex) {
        this.tex(tex);
    }
    // Initialize other signals
    this.fontFill(fontFill);
    this.texFontSize(texFontSize);

    const buildTex = () => {
      // ... (rest of logic remains same, but using signals) ...
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
      // Use the this.tex() signal instead of the prop directly
      const base = this.tex();
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

    if (this.isText) {
        this.add(
            <Txt
                text={() => this.tex()} // Use tex signal as text source
                fill={() => this.fontFill()}
                fontSize={() => this.texFontSize()}
                fontFamily={'JetBrains Mono'} // Or project default
            />
        );
    } else {
        this.add(
          <Latex
            tex={() => buildTex()}
            fill={() => this.fontFill()}
            fontSize={() => this.texFontSize()}
          />,
        );
    }
  }
}
