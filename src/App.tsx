import { useReducer, useState } from 'react';
import type { ActionDispatch } from 'react';
import './app.css';
import { INITIAL_CONSOLE_STATE, updateConsole } from './console/consoleState.ts';
import type { ConsoleAction, ConsoleState } from './console/consoleState.ts';
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

  useKeyboardButtons(pressConsoleButton);

  function pressConsoleButton(button: ConsoleButton, isRepeat: boolean) {
    if (button === 'home' && state.screen.kind === 'playing') {
      dispatch({ type: 'homePressed' });
      return;
    }

    input.deliver(button, isRepeat);
  }

  return (
    <ConsoleInputContext value={input}>
      <div className="console-screen" data-theme={state.settings.theme}>
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

  function wakeUp() {
    dispatch({ type: 'wokeUp' });
  }

  switch (screen.kind) {
    case 'off':
      return <PowerOffScreen onPowerPressed={powerOn} />;
    case 'booting':
      return null;
    case 'locked':
      return null;
    case 'home':
      return null;
    case 'launching':
      return null;
    case 'playing':
      return null;
    case 'applet':
      return null;
    case 'asleep':
      return <SleepScreen onWake={wakeUp} />;
  }
}
