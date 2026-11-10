import { useEffect, useEffectEvent } from 'react';
import { findConsoleButton, isDirectionButton } from './consoleButtons.ts';
import type { ButtonPressHandler } from './consoleInput.ts';

const BUTTON_ACTIVATION_CODES: readonly string[] = ['Enter', 'NumpadEnter', 'Space'];

export function useKeyboardButtons(onPress: ButtonPressHandler) {
  const pressLatestHandler = useEffectEvent(onPress);

  useEffect(function listenToKeyboard() {
    let isFocusFromTab = false;

    function pressMatchingButton(event: KeyboardEvent) {
      const isBrowserShortcut = event.ctrlKey || event.metaKey || event.altKey;
      const isActivatingTabbedButton = isFocusFromTab && event.target instanceof HTMLButtonElement && BUTTON_ACTIVATION_CODES.includes(event.code);
      const button = findConsoleButton(event.code);

      if (event.code === 'Tab') {
        isFocusFromTab = true;
      }

      if (isBrowserShortcut || isActivatingTabbedButton || button === undefined) {
        return;
      }

      event.preventDefault();

      if (event.repeat && !isDirectionButton(button)) {
        return;
      }

      pressLatestHandler(button, event.repeat);
    }

    function forgetTabFocus() {
      isFocusFromTab = false;
    }

    window.addEventListener('keydown', pressMatchingButton);
    window.addEventListener('pointerdown', forgetTabFocus);

    return function stopListeningToKeyboard() {
      window.removeEventListener('keydown', pressMatchingButton);
      window.removeEventListener('pointerdown', forgetTabFocus);
    };
  }, []);
}
