import type { ReactNode } from 'react';
import { SelectionCursor } from '../SelectionCursor.tsx';
import type { PageLayout } from '../pageLayout.ts';
import { isRowFocused } from './menuFocus.ts';
import type { MenuFocus } from './menuFocus.ts';
import './menuPanes.css';

export type MenuSection = {
  readonly label: string;
  readonly startsGroup: boolean;
};

type RowSize = 'compact' | 'tall';

type MenuPanesProps = {
  readonly layout: PageLayout;
  readonly sections: readonly MenuSection[];
  readonly focus: MenuFocus;
  readonly onTouchSection: (sectionIndex: number) => void;
  readonly children: ReactNode;
};

type MenuRowProps = {
  readonly focus: MenuFocus;
  readonly rowIndex: number;
  readonly size: RowSize;
  readonly onTouchRow: (rowIndex: number) => void;
  readonly children: ReactNode;
};

type MenuLabelProps = {
  readonly children: ReactNode;
};

type MenuValueProps = {
  readonly tone: 'accent' | 'muted';
  readonly children: ReactNode;
};

export function MenuPanes({ layout, sections, focus, onTouchSection, children }: MenuPanesProps) {
  return (
    <div className="menu-panes" data-layout={layout}>
      <ul className="menu-sections">
        {sections.map(function showSection(section, index) {
          const isSelected = index === focus.sectionIndex;
          const isFocused = isSelected && focus.pane === 'sections';

          function touchSection() {
            onTouchSection(index);
          }

          return (
            <li key={section.label} className="menu-section-slot" data-starts-group={section.startsGroup}>
              <button className="menu-section" type="button" data-selected={isSelected} data-focused={isFocused} onClick={touchSection}>
                <MenuLabel>{section.label}</MenuLabel>
                {isFocused && <SelectionCursor shape="row" isPressed={false} />}
              </button>
            </li>
          );
        })}
      </ul>
      <ul key={focus.sectionIndex} className="menu-rows">
        {children}
      </ul>
    </div>
  );
}

export function MenuRow({ focus, rowIndex, size, onTouchRow, children }: MenuRowProps) {
  const isFocused = isRowFocused(focus, rowIndex);

  function touchRow() {
    onTouchRow(rowIndex);
  }

  return (
    <li className="menu-row-slot">
      <button className="menu-row" type="button" data-size={size} data-focused={isFocused} onClick={touchRow}>
        {children}
        {isFocused && <SelectionCursor shape="row" isPressed={false} />}
      </button>
    </li>
  );
}

export function MenuLabel({ children }: MenuLabelProps) {
  return <span className="menu-label">{children}</span>;
}

export function MenuValue({ tone, children }: MenuValueProps) {
  return (
    <span className="menu-value" data-tone={tone}>
      {children}
    </span>
  );
}
