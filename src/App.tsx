import { useReducer, useRef, useState } from 'react';
import type { ActionDispatch } from 'react';
import './app.css';
import { BootScreen } from './boot/BootScreen.tsx';
import { findRunningGameId, INITIAL_CONSOLE_STATE, updateConsole } from './console/consoleState.ts';
import type { ConsoleAction, ConsoleState } from './console/consoleState.ts';
import { GameLaunchScreen } from './games/GameLaunchScreen.tsx';
import { RunningGame } from './games/RunningGame.tsx';
import { ConsoleInputContext, createConsoleInput } from './input/consoleInput.ts';
import type { ConsoleButton } from './input/consoleButtons.ts';
import { useKeyboardButtons } from './input/useKeyboardButtons.ts';
import { PowerOffScreen } from './power/PowerOffScreen.tsx';
import { SleepScreen } from './power/SleepScreen.tsx';

type ConsoleDispatch = ActionDispatch<[action: ConsoleAction]>;

type ScreenProps = {
  readonly state: ConsoleState;
  readonly dispatch: ConsoleDispatch;
};

export function App() {
  const [state, dispatch] = useReducer(updateConsole, INITIAL_CONSOLE_STATE);
  const [input] = useState(createConsoleInput);
  const nextCaptureIdRef = useRef(1);
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
  }

  return (
    <ConsoleInputContext value={input}>
      <div className="console-screen" data-theme={state.settings.theme}>
        {runningGameId !== null && <RunningGame key={runningGameId} gameId={runningGameId} isSuspended={state.screen.kind !== 'playing'} onCapture={saveCapture} />}
        <CurrentScreen state={state} dispatch={dispatch} />
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
      return null;
    case 'home':
      return null;
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
