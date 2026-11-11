import type { ConsoleShortcut } from './consoleShortcuts.ts';
import './shortcutGlyph.css';

type ShortcutGlyphProps = {
  readonly shortcut: ConsoleShortcut;
};

export function ShortcutGlyph({ shortcut }: ShortcutGlyphProps) {
  return <span className="shortcut-glyph" data-glyph-tone={shortcut.glyphTone} style={{ maskImage: `url(${shortcut.glyphUrl})` }} aria-hidden="true" />;
}
