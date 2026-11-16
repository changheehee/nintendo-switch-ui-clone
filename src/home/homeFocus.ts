import type { DirectionButton } from '../input/consoleButtons.ts';

export type HomeRow = 'users' | 'games' | 'shortcuts';

export type HomeRowSizes = Readonly<Record<HomeRow, number>>;

export type HomeFocus = {
  readonly row: HomeRow;
  readonly indexByRow: Readonly<Record<HomeRow, number>>;
};

const ROWS_FROM_TOP: readonly HomeRow[] = ['users', 'games', 'shortcuts'];

export function createHomeFocus(row: HomeRow, index: number): HomeFocus {
  return { row, indexByRow: { users: 0, games: 0, shortcuts: 0, [row]: index } };
}

export function moveHomeFocus(focus: HomeFocus, direction: DirectionButton, rowSizes: HomeRowSizes): HomeFocus {
  switch (direction) {
    case 'left':
      return moveAlongRow(focus, -1, rowSizes);
    case 'right':
      return moveAlongRow(focus, 1, rowSizes);
    case 'up':
      return moveToNeighbourRow(focus, -1);
    case 'down':
      return moveToNeighbourRow(focus, 1);
  }
}

export function focusHomeItem(focus: HomeFocus, row: HomeRow, index: number): HomeFocus {
  return { row, indexByRow: { ...focus.indexByRow, [row]: index } };
}

export function readFocusedIndex(focus: HomeFocus): number {
  return focus.indexByRow[focus.row];
}

export function isHomeItemFocused(focus: HomeFocus, row: HomeRow, index: number): boolean {
  return focus.row === row && readFocusedIndex(focus) === index;
}

function moveAlongRow(focus: HomeFocus, step: number, rowSizes: HomeRowSizes): HomeFocus {
  const nextIndex = readFocusedIndex(focus) + step;
  const isInsideRow = nextIndex >= 0 && nextIndex < rowSizes[focus.row];

  if (!isInsideRow) {
    return focus;
  }

  return focusHomeItem(focus, focus.row, nextIndex);
}

function moveToNeighbourRow(focus: HomeFocus, step: number): HomeFocus {
  const neighbourRow = ROWS_FROM_TOP[ROWS_FROM_TOP.indexOf(focus.row) + step];

  if (neighbourRow === undefined) {
    return focus;
  }

  return { ...focus, row: neighbourRow };
}
