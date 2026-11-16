export type ConsoleButton =
  | 'a'
  | 'b'
  | 'x'
  | 'y'
  | 'home'
  | 'capture'
  | 'plus'
  | 'minus'
  | 'up'
  | 'down'
  | 'left'
  | 'right';

export type DirectionButton = Extract<ConsoleButton, 'up' | 'down' | 'left' | 'right'>;

type KeyBinding = {
  readonly code: string;
  readonly keyName: string;
  readonly button: ConsoleButton;
};

const KEY_BINDINGS: readonly KeyBinding[] = [
  { code: 'KeyA', keyName: 'A', button: 'a' },
  { code: 'Enter', keyName: 'Enter', button: 'a' },
  { code: 'NumpadEnter', keyName: 'Enter', button: 'a' },
  { code: 'Space', keyName: 'Space', button: 'a' },
  { code: 'KeyB', keyName: 'B', button: 'b' },
  { code: 'Escape', keyName: 'Esc', button: 'b' },
  { code: 'Backspace', keyName: 'Backspace', button: 'b' },
  { code: 'KeyX', keyName: 'X', button: 'x' },
  { code: 'KeyY', keyName: 'Y', button: 'y' },
  { code: 'KeyH', keyName: 'H', button: 'home' },
  { code: 'Home', keyName: 'Home', button: 'home' },
  { code: 'KeyC', keyName: 'C', button: 'capture' },
  { code: 'Equal', keyName: '+', button: 'plus' },
  { code: 'NumpadAdd', keyName: '+', button: 'plus' },
  { code: 'Minus', keyName: '−', button: 'minus' },
  { code: 'NumpadSubtract', keyName: '−', button: 'minus' },
  { code: 'ArrowUp', keyName: '↑', button: 'up' },
  { code: 'ArrowDown', keyName: '↓', button: 'down' },
  { code: 'ArrowLeft', keyName: '←', button: 'left' },
  { code: 'ArrowRight', keyName: '→', button: 'right' },
];

const DIRECTION_BUTTONS: readonly ConsoleButton[] = ['up', 'down', 'left', 'right'];

export function findConsoleButton(code: string): ConsoleButton | undefined {
  const binding = KEY_BINDINGS.find(function matchesCode(candidate) {
    return candidate.code === code;
  });

  return binding === undefined ? undefined : binding.button;
}

export function isDirectionButton(button: ConsoleButton): button is DirectionButton {
  return DIRECTION_BUTTONS.includes(button);
}

export function listKeyNames(button: ConsoleButton): readonly string[] {
  const keyNames = KEY_BINDINGS.filter(function isBoundToButton(binding) {
    return binding.button === button;
  }).map(function nameKey(binding) {
    return binding.keyName;
  });

  return [...new Set(keyNames)];
}
