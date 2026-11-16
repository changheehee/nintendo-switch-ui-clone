import type { ConsoleButton } from '../../input/consoleButtons.ts';

type MenuPane = 'sections' | 'rows';

export type MenuFocus = {
  readonly pane: MenuPane;
  readonly sectionIndex: number;
  readonly rowIndex: number;
};

type MenuSizes = {
  readonly sectionCount: number;
  readonly rowCount: number;
};

export type MenuIntent =
  | { readonly kind: 'move'; readonly focus: MenuFocus }
  | { readonly kind: 'chooseRow'; readonly rowIndex: number }
  | { readonly kind: 'leave' }
  | { readonly kind: 'ignore' };

const IGNORE: MenuIntent = { kind: 'ignore' };

export const FIRST_MENU_FOCUS: MenuFocus = { pane: 'sections', sectionIndex: 0, rowIndex: 0 };

export function readMenuIntent(focus: MenuFocus, button: ConsoleButton, sizes: MenuSizes): MenuIntent {
  if (button === 'home') {
    return { kind: 'leave' };
  }

  if (focus.pane === 'sections') {
    return readSectionIntent(focus, button, sizes);
  }

  return readRowIntent(focus, button, sizes);
}

export function readSectionTouchIntent(focus: MenuFocus, sectionIndex: number): MenuIntent {
  const isAlreadyFocused = focus.pane === 'sections' && focus.sectionIndex === sectionIndex;

  return isAlreadyFocused ? IGNORE : { kind: 'move', focus: { pane: 'sections', sectionIndex, rowIndex: 0 } };
}

export function readRowTouchIntent(focus: MenuFocus, rowIndex: number): MenuIntent {
  if (isRowFocused(focus, rowIndex)) {
    return { kind: 'chooseRow', rowIndex };
  }

  return { kind: 'move', focus: enterRows(focus, rowIndex) };
}

export function isRowFocused(focus: MenuFocus, rowIndex: number): boolean {
  return focus.pane === 'rows' && focus.rowIndex === rowIndex;
}

function enterRows(focus: MenuFocus, rowIndex: number): MenuFocus {
  return { ...focus, pane: 'rows', rowIndex };
}

function readSectionIntent(focus: MenuFocus, button: ConsoleButton, sizes: MenuSizes): MenuIntent {
  const hasRows = sizes.rowCount > 0;

  switch (button) {
    case 'up':
      return moveSection(focus, focus.sectionIndex - 1, sizes);
    case 'down':
      return moveSection(focus, focus.sectionIndex + 1, sizes);
    case 'right':
    case 'a':
      return hasRows ? { kind: 'move', focus: enterRows(focus, 0) } : IGNORE;
    case 'b':
      return { kind: 'leave' };
    default:
      return IGNORE;
  }
}

function readRowIntent(focus: MenuFocus, button: ConsoleButton, sizes: MenuSizes): MenuIntent {
  switch (button) {
    case 'up':
      return moveRow(focus, focus.rowIndex - 1, sizes);
    case 'down':
      return moveRow(focus, focus.rowIndex + 1, sizes);
    case 'left':
    case 'b':
      return { kind: 'move', focus: { ...focus, pane: 'sections' } };
    case 'a':
      return { kind: 'chooseRow', rowIndex: focus.rowIndex };
    default:
      return IGNORE;
  }
}

function moveSection(focus: MenuFocus, sectionIndex: number, sizes: MenuSizes): MenuIntent {
  const isInsideMenu = sectionIndex >= 0 && sectionIndex < sizes.sectionCount;

  return isInsideMenu ? { kind: 'move', focus: { ...focus, sectionIndex, rowIndex: 0 } } : IGNORE;
}

function moveRow(focus: MenuFocus, rowIndex: number, sizes: MenuSizes): MenuIntent {
  const isInsideRows = rowIndex >= 0 && rowIndex < sizes.rowCount;

  return isInsideRows ? { kind: 'move', focus: { ...focus, rowIndex } } : IGNORE;
}
