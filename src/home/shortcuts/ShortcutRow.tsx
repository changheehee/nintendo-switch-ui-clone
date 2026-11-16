import { SelectionCursor } from '../../controls/SelectionCursor.tsx';
import { opensApplet } from '../../shortcuts/consoleShortcuts.ts';
import type { ConsoleShortcut } from '../../shortcuts/consoleShortcuts.ts';
import { ShortcutGlyph } from '../../shortcuts/ShortcutGlyph.tsx';
import './shortcutRow.css';

type ShortcutRowProps = {
  readonly shortcuts: readonly ConsoleShortcut[];
  readonly focusedIndex: number | null;
  readonly pressedIndex: number | null;
  readonly hasUnreadNews: boolean;
  readonly onTouchShortcut: (index: number) => void;
};

export function ShortcutRow({ shortcuts, focusedIndex, pressedIndex, hasUnreadNews, onTouchShortcut }: ShortcutRowProps) {
  return (
    <ol className="shortcut-row">
      {shortcuts.map(function showShortcut(shortcut, index) {
        const isFocused = index === focusedIndex;
        const isPressed = index === pressedIndex;
        const hasNotification = hasUnreadNews && opensApplet(shortcut, 'news');

        function touchShortcut() {
          onTouchShortcut(index);
        }

        return (
          <li key={shortcut.label} className="shortcut-row-slot">
            <button className="shortcut-icon" type="button" data-pressed={isPressed} aria-label={shortcut.label} onClick={touchShortcut}>
              <span className="shortcut-icon-glyph">
                <ShortcutGlyph shortcut={shortcut} />
              </span>
            </button>
            {hasNotification && (
              <span className="shortcut-row-notification">
                <span className="screen-reader-only">새 소식이 있습니다.</span>
              </span>
            )}
            {isFocused && <SelectionCursor shape="shortcut" isPressed={isPressed} />}
            {isFocused && <p className="shortcut-row-label">{shortcut.label}</p>}
          </li>
        );
      })}
    </ol>
  );
}
