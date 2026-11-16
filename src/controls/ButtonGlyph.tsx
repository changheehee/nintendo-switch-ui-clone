import type { ConsoleButton, DirectionButton } from '../input/consoleButtons.ts';
import './buttonGlyph.css';

export type GlyphButton = Exclude<ConsoleButton, DirectionButton>;

type ButtonGlyphProps = {
  readonly button: GlyphButton;
};

export function ButtonGlyph({ button }: ButtonGlyphProps) {
  return <span className="button-glyph" data-button={button} aria-hidden="true" />;
}
