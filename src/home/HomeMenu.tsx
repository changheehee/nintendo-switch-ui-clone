import { useState } from 'react';
import type { AnimationEvent, ReactElement } from 'react';
import type { AppletId, ConsoleSettings, HomeEntrance } from '../console/consoleState.ts';
import type { ButtonHint } from '../controls/ButtonHints.tsx';
import { ScreenFooter } from '../controls/ScreenFooter.tsx';
import { findGameIndex, GAME_LIBRARY, readGame } from '../games/gameLibrary.ts';
import type { Game, GameId } from '../games/gameLibrary.ts';
import { useConsoleButtons } from '../input/consoleInput.ts';
import type { ConsoleButton } from '../input/consoleButtons.ts';
import { isDirectionButton } from '../input/consoleButtons.ts';
import { CONSOLE_SHORTCUTS, findAppletShortcutIndex, readShortcut } from '../shortcuts/consoleShortcuts.ts';
import { StatusBar } from '../statusBar/StatusBar.tsx';
import { CONSOLE_USER } from '../user/userProfile.ts';
import type { UserProfile } from '../user/userProfile.ts';
import { CloseSoftwareDialog } from './games/CloseSoftwareDialog.tsx';
import { GameRow } from './games/GameRow.tsx';
import { SoftwareOptions } from './games/SoftwareOptions.tsx';
import { createHomeFocus, focusHomeItem, isHomeItemFocused, moveHomeFocus, readFocusedIndex } from './homeFocus.ts';
import type { HomeFocus, HomeRow, HomeRowSizes } from './homeFocus.ts';
import { ShortcutRow } from './shortcuts/ShortcutRow.tsx';
import { UserPage } from './users/UserPage.tsx';
import { UserRow } from './users/UserRow.tsx';
import './homeMenu.css';

type HomeMenuProps = {
  readonly entrance: HomeEntrance;
  readonly suspendedGameId: GameId | null;
  readonly settings: ConsoleSettings;
  readonly hasUnreadNews: boolean;
  readonly onStartGame: (gameId: GameId) => void;
  readonly onContinueGame: () => void;
  readonly onCloseGame: () => void;
  readonly onOpenApplet: (applet: AppletId) => void;
  readonly onSleep: () => void;
};

type HomePanel =
  | { readonly kind: 'closeSoftware'; readonly gameId: GameId }
  | { readonly kind: 'softwareOptions'; readonly gameId: GameId }
  | { readonly kind: 'userPage'; readonly user: UserProfile };

type ContinueTrigger = 'gameTile' | 'homeButton';

type HomeExit =
  | { readonly kind: 'startingGame'; readonly gameId: GameId }
  | { readonly kind: 'continuingGame'; readonly trigger: ContinueTrigger }
  | { readonly kind: 'openingApplet'; readonly applet: AppletId }
  | { readonly kind: 'sleeping' };

type CurtainExit = Exclude<HomeExit, { readonly kind: 'continuingGame' }>;

type HomePanelLayerProps = {
  readonly panel: HomePanel;
  readonly onClosePanel: () => void;
  readonly onCloseGame: () => void;
};

type HomeCurtainProps = {
  readonly exit: CurtainExit;
  readonly onFinished: () => void;
};

const HOME_USERS: readonly UserProfile[] = [CONSOLE_USER];

const LEAVE_TO_GAME_ANIMATION = 'leave-home-to-game';

const CURTAIN_ANIMATIONS: Readonly<Record<CurtainExit['kind'], string>> = {
  startingGame: 'fade-in',
  sleeping: 'fade-in',
  openingApplet: 'run-timeline',
};

const ROW_SIZES: HomeRowSizes = {
  users: HOME_USERS.length,
  games: GAME_LIBRARY.length,
  shortcuts: CONSOLE_SHORTCUTS.length,
};

export function HomeMenu({
  entrance,
  suspendedGameId,
  settings,
  hasUnreadNews,
  onStartGame,
  onContinueGame,
  onCloseGame,
  onOpenApplet,
  onSleep,
}: HomeMenuProps) {
  const [focus, setFocus] = useState(function focusWhereHomeWasEntered() {
    return createEntranceFocus(entrance, suspendedGameId);
  });
  const [panel, setPanel] = useState<HomePanel | null>(null);
  const [exit, setExit] = useState<HomeExit | null>(null);
  const isLeaving = exit !== null;
  const isGameFocused = focus.row === 'games';

  useConsoleButtons('screen', pressHomeMenuButton);

  function pressHomeMenuButton(button: ConsoleButton) {
    if (isLeaving) {
      return;
    }

    if (isDirectionButton(button)) {
      setFocus(moveHomeFocus(focus, button, ROW_SIZES));
      return;
    }

    switch (button) {
      case 'a':
        activateFocusedItem();
        return;
      case 'home':
        returnToSuspendedGame();
        return;
      case 'plus':
      case 'minus':
        if (isGameFocused) {
          openSoftwareOptions();
        }
        return;
      case 'x':
        if (isGameFocused && isFocusedGameSuspended()) {
          openCloseSoftwareDialog();
        }
        return;
      case 'b':
      case 'y':
      case 'capture':
        return;
    }
  }

  function touchItem(row: HomeRow, index: number) {
    if (isLeaving) {
      return;
    }

    if (isHomeItemFocused(focus, row, index)) {
      activateFocusedItem();
      return;
    }

    setFocus(focusHomeItem(focus, row, index));
  }

  function touchUser(index: number) {
    touchItem('users', index);
  }

  function touchGame(index: number) {
    touchItem('games', index);
  }

  function touchShortcut(index: number) {
    touchItem('shortcuts', index);
  }

  function activateFocusedItem() {
    switch (focus.row) {
      case 'users':
        setPanel({ kind: 'userPage', user: readHomeUser(readFocusedIndex(focus)) });
        return;
      case 'games':
        startFocusedGame();
        return;
      case 'shortcuts':
        activateShortcut(readFocusedIndex(focus));
        return;
    }
  }

  function startFocusedGame() {
    const game = readFocusedGame();

    if (game.id === suspendedGameId) {
      setExit({ kind: 'continuingGame', trigger: 'gameTile' });
      return;
    }

    setExit({ kind: 'startingGame', gameId: game.id });
  }

  function returnToSuspendedGame() {
    if (suspendedGameId !== null) {
      setExit({ kind: 'continuingGame', trigger: 'homeButton' });
    }
  }

  function activateShortcut(shortcutIndex: number) {
    const { target } = readShortcut(shortcutIndex);

    if (target.kind === 'sleep') {
      setExit({ kind: 'sleeping' });
      return;
    }

    setExit({ kind: 'openingApplet', applet: target.applet });
  }

  function readFocusedGame(): Game {
    return readGame(focus.indexByRow.games);
  }

  function isFocusedGameSuspended(): boolean {
    return readFocusedGame().id === suspendedGameId;
  }

  function openSoftwareOptions() {
    setPanel({ kind: 'softwareOptions', gameId: readFocusedGame().id });
  }

  function openCloseSoftwareDialog() {
    setPanel({ kind: 'closeSoftware', gameId: readFocusedGame().id });
  }

  function closePanel() {
    setPanel(null);
  }

  function closeSuspendedGame() {
    setPanel(null);
    onCloseGame();
  }

  function finishLeaving() {
    if (exit === null) {
      throw new Error('HOME 메뉴를 떠나는 중이 아닌데 전환 효과가 끝났습니다.');
    }

    switch (exit.kind) {
      case 'startingGame':
        onStartGame(exit.gameId);
        return;
      case 'continuingGame':
        onContinueGame();
        return;
      case 'openingApplet':
        onOpenApplet(exit.applet);
        return;
      case 'sleeping':
        onSleep();
        return;
    }
  }

  function finishMenuAnimation(event: AnimationEvent<HTMLDivElement>) {
    const hasLeftToGame = event.target === event.currentTarget && event.animationName === LEAVE_TO_GAME_ANIMATION;

    if (hasLeftToGame) {
      finishLeaving();
    }
  }

  function createFooterHints(): readonly ButtonHint[] {
    if (!isGameFocused) {
      return [{ buttons: ['a'], label: 'OK', onPress: activateFocusedItem }];
    }

    const optionsHint: ButtonHint = { buttons: ['minus', 'plus'], label: 'Options', onPress: openSoftwareOptions };

    if (isFocusedGameSuspended()) {
      return [
        optionsHint,
        { buttons: ['x'], label: 'Close Software', onPress: openCloseSoftwareDialog },
        { buttons: ['a'], label: 'Continue', onPress: activateFocusedItem },
      ];
    }

    return [optionsHint, { buttons: ['a'], label: 'Start', onPress: activateFocusedItem }];
  }

  return (
    <div className="home-menu console-layer" data-entrance={entrance.kind} data-exit={exit === null ? 'none' : exit.kind} onAnimationEnd={finishMenuAnimation}>
      <div className="home-menu-screen" inert={isLeaving || panel !== null}>
        <div className="home-menu-content">
          <UserRow
            users={HOME_USERS}
            focusedIndex={readRowFocus(focus, 'users')}
            pressedIndex={readPressedIndex(focus, exit, 'users')}
            onTouchUser={touchUser}
          />
          <StatusBar settings={settings} />
          <GameRow
            games={GAME_LIBRARY}
            focusedIndex={readRowFocus(focus, 'games')}
            pressedIndex={readPressedIndex(focus, exit, 'games')}
            launchingIndex={readLaunchingIndex(focus, exit)}
            suspendedGameId={suspendedGameId}
            onTouchGame={touchGame}
          />
          <ShortcutRow
            shortcuts={CONSOLE_SHORTCUTS}
            focusedIndex={readRowFocus(focus, 'shortcuts')}
            pressedIndex={readPressedIndex(focus, exit, 'shortcuts')}
            hasUnreadNews={hasUnreadNews}
            onTouchShortcut={touchShortcut}
          />
        </div>
        <ScreenFooter hints={createFooterHints()} layout="fullScreen" />
      </div>
      {panel !== null && <HomePanelLayer panel={panel} onClosePanel={closePanel} onCloseGame={closeSuspendedGame} />}
      {exit !== null && exit.kind !== 'continuingGame' && <HomeCurtain exit={exit} onFinished={finishLeaving} />}
    </div>
  );
}

function HomePanelLayer({ panel, onClosePanel, onCloseGame }: HomePanelLayerProps): ReactElement {
  switch (panel.kind) {
    case 'closeSoftware':
      return <CloseSoftwareDialog gameId={panel.gameId} onCancel={onClosePanel} onClose={onCloseGame} />;
    case 'softwareOptions':
      return <SoftwareOptions gameId={panel.gameId} onExit={onClosePanel} />;
    case 'userPage':
      return <UserPage user={panel.user} onExit={onClosePanel} />;
  }
}

function HomeCurtain({ exit, onFinished }: HomeCurtainProps) {
  function finishCurtain(event: AnimationEvent<HTMLSpanElement>) {
    const hasFinished = event.target === event.currentTarget && event.animationName === CURTAIN_ANIMATIONS[exit.kind];

    if (hasFinished) {
      onFinished();
    }
  }

  return <span className="home-menu-curtain" data-exit={exit.kind} onAnimationEnd={finishCurtain} />;
}

function createEntranceFocus(entrance: HomeEntrance, suspendedGameId: GameId | null): HomeFocus {
  switch (entrance.kind) {
    case 'fromApplet':
      return createHomeFocus('shortcuts', findAppletShortcutIndex(entrance.applet));
    case 'fromGame':
      return createHomeFocus('games', readSuspendedGameIndex(suspendedGameId));
    case 'fromUnlock':
      return createHomeFocus('games', 0);
  }
}

function readSuspendedGameIndex(suspendedGameId: GameId | null): number {
  if (suspendedGameId === null) {
    throw new Error('게임에서 HOME으로 왔는데 일시 정지된 게임이 없습니다.');
  }

  return findGameIndex(suspendedGameId);
}

function readHomeUser(index: number): UserProfile {
  const user = HOME_USERS[index];

  if (user === undefined) {
    throw new Error(`HOME에 ${index}번째 사용자가 없습니다.`);
  }

  return user;
}

function readRowFocus(focus: HomeFocus, row: HomeRow): number | null {
  return focus.row === row ? readFocusedIndex(focus) : null;
}

function readPressedIndex(focus: HomeFocus, exit: HomeExit | null, row: HomeRow): number | null {
  const showsPressedItem = exit !== null && wasItemActivated(exit);

  return showsPressedItem ? readRowFocus(focus, row) : null;
}

function wasItemActivated(exit: HomeExit): boolean {
  return exit.kind !== 'continuingGame' || exit.trigger === 'gameTile';
}

function readLaunchingIndex(focus: HomeFocus, exit: HomeExit | null): number | null {
  const isStartingGame = exit !== null && exit.kind === 'startingGame';

  return isStartingGame ? readRowFocus(focus, 'games') : null;
}
