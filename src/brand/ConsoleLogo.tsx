import { CONSOLE_BRAND } from './consoleBrand.ts';
import './consoleLogo.css';

type LogoLayout = 'row' | 'stack';

type ConsoleLogoProps = {
  readonly layout: LogoLayout;
};

const CONSOLE_NAME_LETTERS = Array.from(CONSOLE_BRAND.consoleName);

export function ConsoleLogo({ layout }: ConsoleLogoProps) {
  return (
    <span className="console-logo" data-layout={layout}>
      <span className="console-logo-wordmark">
        <span className="console-logo-maker">{CONSOLE_BRAND.makerName}</span>
        <span className="console-logo-console">
          <span className="screen-reader-only">{CONSOLE_BRAND.consoleName}</span>
          {CONSOLE_NAME_LETTERS.map(function showLetter(letter, letterIndex) {
            return (
              <span key={`${letterIndex}-${letter}`} className="console-logo-letter" style={{ '--logo-letter-index': letterIndex }} aria-hidden="true">
                {letter}
              </span>
            );
          })}
        </span>
      </span>
      <span className="console-logo-emblem" aria-hidden="true">
        <span className="console-logo-emblem-half" data-half="left" />
        <span className="console-logo-emblem-half" data-half="right" />
      </span>
    </span>
  );
}
