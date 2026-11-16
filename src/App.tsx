import { useReducer, useRef, useState } from 'react';
import type { ActionDispatch } from 'react';
import './app.css';
import { BootScreen } from './boot/BootScreen.tsx';
import { CaptureToast } from './capture/CaptureToast.tsx';
import { findRunningGameId, INITIAL_CONSOLE_STATE, updateConsole } from './console/consoleState.ts';
import type { AppletId, ConsoleAction, ConsoleState, HomeEntrance } from './console/consoleState.ts';
import { GameLaunchScreen } from './games/GameLaunchScreen.tsx';
import type { GameId } from './games/gameLibrary.ts';
import { RunningGame } from './games/RunningGame.tsx';
import { HomeMenu } from './home/HomeMenu.tsx';
import { ConsoleInputContext, createConsoleInput } from './input/consoleInput.ts';
import type { ConsoleButton } from './input/consoleButtons.ts';
import { useKeyboardButtons } from './input/useKeyboardButtons.ts';
import { LockScreen } from './lock/LockScreen.tsx';
import { PowerOffScreen } from './power/PowerOffScreen.tsx';
import { SleepScreen } from './power/SleepScreen.tsx';

type ConsoleDispatch = ActionDispatch<[action: ConsoleAction]>;

type ScreenProps = {
  readonly state: ConsoleState;
  readonly dispatch: ConsoleDispatch;
};

type HomeScreenProps = ScreenProps & {
  readonly entrance: HomeEntrance;
};

type ShownCapture = {
  readonly id: number;
  readonly imageUrl: string;
};

export function App() {
  const [state, dispatch] = useReducer(updateConsole, INITIAL_CONSOLE_STATE);
  const [input] = useState(createConsoleInput);
  const nextCaptureIdRef = useRef(1);
  const [shownCapture, setShownCapture] = useState<ShownCapture | null>(null);
  const runningGameId = findRunningGameId(state);

  useKeyboardButtons(pressConsoleButton);

  function pressConsoleButton(button: ConsoleButton, isRepeat: boolean) {
    if (button === 'home' && state.screen.kind === 'playing') {
      dispatch({ type: 'homePressed' });
      return;
    }

    input.deliver(button, isRepeat);
  }

  function saveCapture(imageUrl: string) {
    const captureId = nextCaptureIdRef.current;
    nextCaptureIdRef.current += 1;
    dispatch({ type: 'screenCaptured', captureId, imageUrl, capturedAt: new Date() });
    setShownCapture({ id: captureId, imageUrl });
  }

  function hideCaptureToast() {
    setShownCapture(null);
  }

  return (
    <ConsoleInputContext value={input}>
      <div className="console-screen" data-theme={state.settings.theme}>
        {runningGameId !== null && <RunningGame key={runningGameId} gameId={runningGameId} isSuspended={state.screen.kind !== 'playing'} onCapture={saveCapture} />}
        <CurrentScreen state={state} dispatch={dispatch} />
        {shownCapture !== null && <CaptureToast key={shownCapture.id} imageUrl={shownCapture.imageUrl} onFinished={hideCaptureToast} />}
      </div>
    </ConsoleInputContext>
  );
}

function CurrentScreen({ state, dispatch }: ScreenProps) {
  const { screen } = state;

  function powerOn() {
    dispatch({ type: 'powerPressed' });
  }

  function finishBoot() {
    dispatch({ type: 'bootFinished' });
  }

  function unlock() {
    dispatch({ type: 'unlocked' });
  }

  function changeNextLockSkip(skipsNextLock: boolean) {
    dispatch({ type: 'nextLockSkipChanged', skipsNextLock });
  }

  function startPlaying() {
    dispatch({ type: 'gameReady' });
  }

  function wakeUp() {
    dispatch({ type: 'wokeUp' });
  }

  switch (screen.kind) {
    case 'off':
      return <PowerOffScreen onPowerPressed={powerOn} />;
    case 'booting':
      return <BootScreen onFinished={finishBoot} />;
    case 'locked':
      return (
        <LockScreen
          skipsUnlockPrompt={screen.skipsUnlockPrompt}
          skipsNextLock={state.skipsNextLock}
          settings={state.settings}
          hasUnreadNews={state.hasUnreadNews}
          onSkipNextLockChange={changeNextLockSkip}
          onUnlocked={unlock}
        />
      );
    case 'home':
      return <HomeScreen state={state} entrance={screen.entrance} dispatch={dispatch} />;
    case 'launching':
      return <GameLaunchScreen gameId={screen.gameId} onReady={startPlaying} />;
    case 'playing':
      return null;
    case 'applet':
      return null;
    case 'asleep':
      return <SleepScreen onWake={wakeUp} />;
  }
}

function HomeScreen({ state, entrance, dispatch }: HomeScreenProps) {
  function startGame(gameId: GameId) {
    dispatch({ type: 'gameStarted', gameId });
  }

  function continueGame() {
    dispatch({ type: 'gameContinued' });
  }

  function closeGame() {
    dispatch({ type: 'gameClosed' });
  }

  function openApplet(applet: AppletId) {
    dispatch({ type: 'appletOpened', applet });
  }

  function sleep() {
    dispatch({ type: 'sleepRequested' });
  }

  return (
    <HomeMenu
      entrance={entrance}
      suspendedGameId={state.suspendedGameId}
      settings={state.settings}
      hasUnreadNews={state.hasUnreadNews}
      onStartGame={startGame}
      onContinueGame={continueGame}
      onCloseGame={closeGame}
      onOpenApplet={openApplet}
      onSleep={sleep}
    />
  );
}
