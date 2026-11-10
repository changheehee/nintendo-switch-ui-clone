import type { GameId } from '../games/gameLibrary.ts';

export type ThemeName = 'basicWhite' | 'basicBlack';

export type ClockFormat = 'twelveHour' | 'twentyFourHour';

export type AppletId = 'news' | 'eshop' | 'album' | 'controllers' | 'settings';

export type ConsoleSettings = {
  readonly theme: ThemeName;
  readonly clockFormat: ClockFormat;
  readonly showsBatteryPercentage: boolean;
};

export type Capture = {
  readonly id: number;
  readonly gameId: GameId;
  readonly imageUrl: string;
  readonly capturedAt: Date;
};

export type HomeEntrance =
  | { readonly kind: 'fromUnlock' }
  | { readonly kind: 'fromGame' }
  | { readonly kind: 'fromApplet'; readonly applet: AppletId };

type ConsoleScreen =
  | { readonly kind: 'off' }
  | { readonly kind: 'booting' }
  | { readonly kind: 'locked'; readonly skipsUnlockPrompt: boolean }
  | { readonly kind: 'home'; readonly entrance: HomeEntrance }
  | { readonly kind: 'launching'; readonly gameId: GameId }
  | { readonly kind: 'playing'; readonly gameId: GameId }
  | { readonly kind: 'applet'; readonly applet: AppletId }
  | { readonly kind: 'asleep' };

export type ConsoleState = {
  readonly screen: ConsoleScreen;
  readonly suspendedGameId: GameId | null;
  readonly settings: ConsoleSettings;
  readonly captures: readonly Capture[];
  readonly hasUnreadNews: boolean;
  readonly skipsNextLock: boolean;
};

export type ConsoleAction =
  | { readonly type: 'powerPressed' }
  | { readonly type: 'bootFinished' }
  | { readonly type: 'unlocked' }
  | { readonly type: 'nextLockSkipChanged'; readonly skipsNextLock: boolean }
  | { readonly type: 'gameStarted'; readonly gameId: GameId }
  | { readonly type: 'gameReady' }
  | { readonly type: 'homePressed' }
  | { readonly type: 'gameContinued' }
  | { readonly type: 'gameClosed' }
  | { readonly type: 'appletOpened'; readonly applet: AppletId }
  | { readonly type: 'appletClosed' }
  | { readonly type: 'sleepRequested' }
  | { readonly type: 'wokeUp' }
  | { readonly type: 'settingsChanged'; readonly settings: ConsoleSettings }
  | { readonly type: 'screenCaptured'; readonly captureId: number; readonly imageUrl: string; readonly capturedAt: Date };

export const INITIAL_CONSOLE_STATE: ConsoleState = {
  screen: { kind: 'off' },
  suspendedGameId: null,
  settings: { theme: 'basicWhite', clockFormat: 'twelveHour', showsBatteryPercentage: false },
  captures: [],
  hasUnreadNews: true,
  skipsNextLock: false,
};

type ScreenKind = ConsoleScreen['kind'];

const SCREENS_ACCEPTING_ACTION: Readonly<Record<ConsoleAction['type'], readonly ScreenKind[]>> = {
  powerPressed: ['off'],
  bootFinished: ['booting'],
  unlocked: ['locked'],
  nextLockSkipChanged: ['locked'],
  gameStarted: ['home'],
  gameReady: ['launching'],
  homePressed: ['playing'],
  gameContinued: ['home'],
  gameClosed: ['home'],
  appletOpened: ['home'],
  appletClosed: ['applet'],
  sleepRequested: ['home'],
  wokeUp: ['asleep'],
  settingsChanged: ['applet'],
  screenCaptured: ['playing'],
};

type ScreenCapturedAction = Extract<ConsoleAction, { readonly type: 'screenCaptured' }>;

export function updateConsole(state: ConsoleState, action: ConsoleAction): ConsoleState {
  requireAcceptingScreen(state.screen, action);

  switch (action.type) {
    case 'powerPressed':
      return { ...state, screen: { kind: 'booting' } };
    case 'bootFinished':
      return showLockScreen(state);
    case 'unlocked':
      return { ...state, screen: { kind: 'home', entrance: { kind: 'fromUnlock' } } };
    case 'nextLockSkipChanged':
      return { ...state, skipsNextLock: action.skipsNextLock };
    case 'gameStarted':
      return startGame(state, action.gameId);
    case 'gameReady':
      return playLaunchedGame(state);
    case 'homePressed':
      return suspendGame(state);
    case 'gameContinued':
      return continueSuspendedGame(state);
    case 'gameClosed':
      return closeSuspendedGame(state);
    case 'appletOpened':
      return openApplet(state, action.applet);
    case 'appletClosed':
      return closeApplet(state);
    case 'sleepRequested':
      return { ...state, screen: { kind: 'asleep' } };
    case 'wokeUp':
      return showLockScreen(state);
    case 'settingsChanged':
      return { ...state, settings: action.settings };
    case 'screenCaptured':
      return addCapture(state, action);
  }
}

export function findRunningGameId(state: ConsoleState): GameId | null {
  if (state.screen.kind === 'playing') {
    return state.screen.gameId;
  }

  return state.suspendedGameId;
}

function requireAcceptingScreen(screen: ConsoleScreen, action: ConsoleAction) {
  const isAccepted = SCREENS_ACCEPTING_ACTION[action.type].includes(screen.kind);

  if (!isAccepted) {
    throw new Error(`${screen.kind} 화면은 ${action.type} 신호를 받을 수 없습니다.`);
  }
}

function showLockScreen(state: ConsoleState): ConsoleState {
  return { ...state, screen: { kind: 'locked', skipsUnlockPrompt: state.skipsNextLock }, skipsNextLock: false };
}

function startGame(state: ConsoleState, gameId: GameId): ConsoleState {
  if (state.suspendedGameId !== null) {
    throw new Error(`일시 정지된 게임을 닫지 않고 다른 게임을 시작하려 했습니다: ${state.suspendedGameId}`);
  }

  return { ...state, screen: { kind: 'launching', gameId } };
}

function playLaunchedGame(state: ConsoleState): ConsoleState {
  if (state.screen.kind !== 'launching') {
    throw new Error(`게임 실행 화면이 아닌데 실행 완료 신호를 받았습니다: ${state.screen.kind}`);
  }

  return { ...state, screen: { kind: 'playing', gameId: state.screen.gameId } };
}

function suspendGame(state: ConsoleState): ConsoleState {
  if (state.screen.kind !== 'playing') {
    throw new Error(`게임 중이 아닌데 HOME 버튼 신호를 받았습니다: ${state.screen.kind}`);
  }

  return { ...state, screen: { kind: 'home', entrance: { kind: 'fromGame' } }, suspendedGameId: state.screen.gameId };
}

function continueSuspendedGame(state: ConsoleState): ConsoleState {
  if (state.suspendedGameId === null) {
    throw new Error('일시 정지된 게임이 없는데 이어 하기를 요청했습니다.');
  }

  return { ...state, screen: { kind: 'playing', gameId: state.suspendedGameId }, suspendedGameId: null };
}

function closeSuspendedGame(state: ConsoleState): ConsoleState {
  if (state.suspendedGameId === null) {
    throw new Error('일시 정지된 게임이 없는데 소프트웨어 종료를 요청했습니다.');
  }

  return { ...state, suspendedGameId: null };
}

function openApplet(state: ConsoleState, applet: AppletId): ConsoleState {
  const hasUnreadNews = state.hasUnreadNews && applet !== 'news';

  return { ...state, screen: { kind: 'applet', applet }, hasUnreadNews };
}

function closeApplet(state: ConsoleState): ConsoleState {
  if (state.screen.kind !== 'applet') {
    throw new Error(`열린 애플릿이 없는데 애플릿 종료 신호를 받았습니다: ${state.screen.kind}`);
  }

  return { ...state, screen: { kind: 'home', entrance: { kind: 'fromApplet', applet: state.screen.applet } } };
}

function addCapture(state: ConsoleState, { captureId, imageUrl, capturedAt }: ScreenCapturedAction): ConsoleState {
  if (state.screen.kind !== 'playing') {
    throw new Error(`게임 중이 아닌데 화면 캡처 신호를 받았습니다: ${state.screen.kind}`);
  }

  const capture: Capture = { id: captureId, gameId: state.screen.gameId, imageUrl, capturedAt };

  return { ...state, captures: [capture, ...state.captures] };
}
