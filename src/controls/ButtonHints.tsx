import { Fragment } from 'react';
import { ButtonGlyph } from './ButtonGlyph.tsx';
import type { GlyphButton } from './ButtonGlyph.tsx';
import './buttonHints.css';

export type ButtonHint = {
  readonly buttons: readonly GlyphButton[];
  readonly label: string;
  readonly onPress: () => void;
};

type ButtonHintsProps = {
  readonly hints: readonly ButtonHint[];
};

export function ButtonHints({ hints }: ButtonHintsProps) {
  return (
    <div className="button-hints">
      {hints.map(function showHint(hint) {
        return (
          <button key={hint.label} className="button-hint" type="button" onClick={hint.onPress}>
            {hint.buttons.map(function showGlyph(button, index) {
              return (
                <Fragment key={button}>
                  {index > 0 && <span className="button-hint-separator">/</span>}
                  <ButtonGlyph button={button} />
                </Fragment>
              );
            })}
            <span className="button-hint-label">{hint.label}</span>
          </button>
        );
      })}
    </div>
  );
}
