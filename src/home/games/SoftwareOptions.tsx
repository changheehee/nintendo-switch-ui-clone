import { useState } from 'react';
import { MenuLabel, MenuPanes, MenuRow, MenuValue } from '../../controls/menu/MenuPanes.tsx';
import type { MenuSection } from '../../controls/menu/MenuPanes.tsx';
import { useMenuPage } from '../../controls/menu/useMenuPage.ts';
import { NoticeDialog } from '../../controls/SystemDialog.tsx';
import { SystemPage } from '../../controls/SystemPage.tsx';
import { findGame } from '../../games/gameLibrary.ts';
import type { Game, GameId } from '../../games/gameLibrary.ts';

type SoftwareOptionsProps = {
  readonly gameId: GameId;
  readonly onExit: () => void;
};

type OptionsSection = MenuSection & {
  readonly id: 'information' | 'update';
};

type InformationRow = {
  readonly label: string;
  readonly readValue: (game: Game) => string;
};

const OPTIONS_SECTIONS: readonly OptionsSection[] = [
  { id: 'information', label: 'Software Information', startsGroup: false },
  { id: 'update', label: 'Software Update', startsGroup: false },
];

const INFORMATION_ROWS: readonly InformationRow[] = [
  { label: 'Title', readValue: readTitle },
  { label: 'Publisher', readValue: readPublisher },
  { label: 'Version', readValue: readVersion },
];

const UPDATE_ROWS: readonly string[] = ['Via the Internet'];

export function SoftwareOptions({ gameId, onExit }: SoftwareOptionsProps) {
  const game = findGame(gameId);
  const [isUpdateNoticeShown, setIsUpdateNoticeShown] = useState(false);
  const menu = useMenuPage('overlay', { sectionCount: OPTIONS_SECTIONS.length, countRows, chooseRow });
  const section = readOptionsSection(menu.focus.sectionIndex);

  function chooseRow(sectionIndex: number) {
    switch (readOptionsSection(sectionIndex).id) {
      case 'information':
        return;
      case 'update':
        setIsUpdateNoticeShown(true);
        return;
    }
  }

  function closeUpdateNotice() {
    setIsUpdateNoticeShown(false);
  }

  return (
    <>
      <SystemPage
        layout="modal"
        header={{ kind: 'picture', title: game.title, pictureUrl: game.coverUrl, details: [`Ver. ${game.version}`, game.publisher] }}
        hints={[
          { buttons: ['b'], label: 'Back', onPress: menu.pressBack },
          { buttons: ['a'], label: 'OK', onPress: menu.pressOk },
        ]}
        isLeaving={menu.isLeaving}
        isCovered={isUpdateNoticeShown}
        onLeft={onExit}
      >
        <MenuPanes layout="modal" sections={OPTIONS_SECTIONS} focus={menu.focus} onTouchSection={menu.touchSection}>
          {section.id === 'information' &&
            INFORMATION_ROWS.map(function showInformationRow(row, rowIndex) {
              return (
                <MenuRow key={row.label} focus={menu.focus} rowIndex={rowIndex} size="compact" onTouchRow={menu.touchRow}>
                  <MenuLabel>{row.label}</MenuLabel>
                  <MenuValue tone="muted">{row.readValue(game)}</MenuValue>
                </MenuRow>
              );
            })}
          {section.id === 'update' &&
            UPDATE_ROWS.map(function showUpdateRow(label, rowIndex) {
              return (
                <MenuRow key={label} focus={menu.focus} rowIndex={rowIndex} size="compact" onTouchRow={menu.touchRow}>
                  <MenuLabel>{label}</MenuLabel>
                </MenuRow>
              );
            })}
        </MenuPanes>
      </SystemPage>
      {isUpdateNoticeShown && <NoticeDialog onClose={closeUpdateNotice}>This software is already up to date.</NoticeDialog>}
    </>
  );
}

function countRows(sectionIndex: number): number {
  switch (readOptionsSection(sectionIndex).id) {
    case 'information':
      return INFORMATION_ROWS.length;
    case 'update':
      return UPDATE_ROWS.length;
  }
}

function readOptionsSection(sectionIndex: number): OptionsSection {
  const section = OPTIONS_SECTIONS[sectionIndex];

  if (section === undefined) {
    throw new Error(`소프트웨어 옵션에 ${sectionIndex}번째 항목이 없습니다.`);
  }

  return section;
}

function readTitle(game: Game): string {
  return game.title;
}

function readPublisher(game: Game): string {
  return game.publisher;
}

function readVersion(game: Game): string {
  return game.version;
}
