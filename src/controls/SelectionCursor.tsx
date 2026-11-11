import './selectionCursor.css';

type CursorShape = 'tile' | 'shortcut' | 'avatar' | 'row' | 'choice';

type SelectionCursorProps = {
  readonly shape: CursorShape;
  readonly isPressed: boolean;
};

export function SelectionCursor({ shape, isPressed }: SelectionCursorProps) {
  return <span className="selection-cursor" data-shape={shape} data-pressed={isPressed} aria-hidden="true" />;
}
