import { createContext, useContext, useEffect, useEffectEvent } from 'react';
import type { ConsoleButton } from './consoleButtons.ts';

export type InputLayer = 'game' | 'screen' | 'overlay';

export type ButtonPressHandler = (button: ConsoleButton, isRepeat: boolean) => void;

type ConsoleInput = {
  readonly listen: (layer: InputLayer, press: ButtonPressHandler) => () => void;
  readonly deliver: ButtonPressHandler;
};

type Listener = {
  readonly layer: InputLayer;
  readonly press: ButtonPressHandler;
};

const LAYER_PRIORITY: Readonly<Record<InputLayer, number>> = { game: 0, screen: 1, overlay: 2 };

export const ConsoleInputContext = createContext<ConsoleInput | null>(null);

export function createConsoleInput(): ConsoleInput {
  const listeners: Listener[] = [];

  function listen(layer: InputLayer, press: ButtonPressHandler) {
    const listener: Listener = { layer, press };
    listeners.push(listener);

    return function stopListening() {
      const index = listeners.indexOf(listener);

      if (index === -1) {
        throw new Error('이미 해제된 버튼 입력 구독을 다시 해제하려 했습니다.');
      }

      listeners.splice(index, 1);
    };
  }

  function deliver(button: ConsoleButton, isRepeat: boolean) {
    const frontListener = findFrontListener(listeners);

    if (frontListener !== undefined) {
      frontListener.press(button, isRepeat);
    }
  }

  return { listen, deliver };
}

export function useConsoleButtons(layer: InputLayer, onPress: ButtonPressHandler) {
  const input = useConsoleInput();
  const pressLatestHandler = useEffectEvent(onPress);

  useEffect(
    function listenWhileShown() {
      function pressButton(button: ConsoleButton, isRepeat: boolean) {
        pressLatestHandler(button, isRepeat);
      }

      return input.listen(layer, pressButton);
    },
    [input, layer],
  );
}

function useConsoleInput(): ConsoleInput {
  const input = useContext(ConsoleInputContext);

  if (input === null) {
    throw new Error('ConsoleInputContext 안에서만 버튼 입력을 받을 수 있습니다.');
  }

  return input;
}

function findFrontListener(listeners: readonly Listener[]): Listener | undefined {
  let frontListener: Listener | undefined;

  for (const listener of listeners) {
    const isInFront = frontListener === undefined || LAYER_PRIORITY[listener.layer] >= LAYER_PRIORITY[frontListener.layer];

    if (isInFront) {
      frontListener = listener;
    }
  }

  return frontListener;
}
