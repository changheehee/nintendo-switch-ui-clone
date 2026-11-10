import { useState } from 'react';
import { useConsoleButtons } from '../../input/consoleInput.ts';
import type { InputLayer } from '../../input/consoleInput.ts';
import type { ConsoleButton } from '../../input/consoleButtons.ts';
import { usePageExit } from '../usePageExit.ts';
import { FIRST_MENU_FOCUS, readMenuIntent, readRowTouchIntent, readSectionTouchIntent } from './menuFocus.ts';
import type { MenuFocus, MenuIntent } from './menuFocus.ts';

export type MenuPageRules = {
  readonly sectionCount: number;
  readonly countRows: (sectionIndex: number) => number;
  readonly chooseRow: (sectionIndex: number, rowIndex: number) => void;
};

export type MenuPage = {
  readonly focus: MenuFocus;
  readonly isLeaving: boolean;
  readonly pressBack: () => void;
  readonly pressOk: () => void;
  readonly touchSection: (sectionIndex: number) => void;
  readonly touchRow: (rowIndex: number) => void;
};

export function useMenuPage(layer: InputLayer, rules: MenuPageRules): MenuPage {
  const { isLeaving, leave } = usePageExit();
  const [focus, setFocus] = useState<MenuFocus>(FIRST_MENU_FOCUS);

  useConsoleButtons(layer, pressMenuButton);

  function pressMenuButton(button: ConsoleButton) {
    const sizes = { sectionCount: rules.sectionCount, rowCount: rules.countRows(focus.sectionIndex) };

    followIntent(readMenuIntent(focus, button, sizes));
  }

  function followIntent(intent: MenuIntent) {
    if (isLeaving) {
      return;
    }

    switch (intent.kind) {
      case 'move':
        setFocus(intent.focus);
        return;
      case 'chooseRow':
        rules.chooseRow(focus.sectionIndex, intent.rowIndex);
        return;
      case 'leave':
        leave();
        return;
      case 'ignore':
        return;
    }
  }

  function pressBack() {
    pressMenuButton('b');
  }

  function pressOk() {
    pressMenuButton('a');
  }

  function touchSection(sectionIndex: number) {
    followIntent(readSectionTouchIntent(focus, sectionIndex));
  }

  function touchRow(rowIndex: number) {
    followIntent(readRowTouchIntent(focus, rowIndex));
  }

  return { focus, isLeaving, pressBack, pressOk, touchSection, touchRow };
}
