import { useId, useState } from 'react';
import type { AnimationEvent, ReactNode } from 'react';
import { useConsoleButtons } from '../input/consoleInput.ts';
import type { ConsoleButton } from '../input/consoleButtons.ts';
import { SelectionCursor } from './SelectionCursor.tsx';
import './systemDialog.css';

export type DialogChoice = {
  readonly label: string;
  readonly onChoose: () => void;
};

type SystemDialogProps = {
  readonly children: ReactNode;
  readonly choices: readonly DialogChoice[];
  readonly initialChoiceIndex: number;
  readonly onCancel: () => void;
};

type NoticeDialogProps = {
  readonly children: ReactNode;
  readonly onClose: () => void;
};

type DialogOutcome = { readonly kind: 'cancelled' } | { readonly kind: 'chosen'; readonly choiceIndex: number };

const CLOSE_ANIMATION = 'close-dialog';

export function SystemDialog({ children, choices, initialChoiceIndex, onCancel }: SystemDialogProps) {
  const [focusedIndex, setFocusedIndex] = useState(initialChoiceIndex);
  const [outcome, setOutcome] = useState<DialogOutcome | null>(null);
  const messageId = useId();
  const isClosing = outcome !== null;

  useConsoleButtons('overlay', pressDialogButton);

  function pressDialogButton(button: ConsoleButton) {
    if (button === 'a') {
      choose(focusedIndex);
    }

    if (button === 'b' || button === 'home') {
      startClosing({ kind: 'cancelled' });
    }

    if (button === 'left') {
      moveFocusTo(focusedIndex - 1);
    }

    if (button === 'right') {
      moveFocusTo(focusedIndex + 1);
    }
  }

  function moveFocusTo(index: number) {
    const isInsideRow = index >= 0 && index < choices.length;

    if (isInsideRow && !isClosing) {
      setFocusedIndex(index);
    }
  }

  function choose(index: number) {
    setFocusedIndex(index);
    startClosing({ kind: 'chosen', choiceIndex: index });
  }

  function startClosing(nextOutcome: DialogOutcome) {
    if (!isClosing) {
      setOutcome(nextOutcome);
    }
  }

  function finishClosing(event: AnimationEvent<HTMLDivElement>) {
    const hasClosed = event.target === event.currentTarget && event.animationName === CLOSE_ANIMATION;

    if (!hasClosed) {
      return;
    }

    if (outcome === null) {
      throw new Error('대화상자를 닫는 중이 아닌데 닫힘 효과가 끝났습니다.');
    }

    switch (outcome.kind) {
      case 'cancelled':
        onCancel();
        return;
      case 'chosen':
        readChoice(choices, outcome.choiceIndex).onChoose();
        return;
    }
  }

  return (
    <div className="system-dialog-backdrop" role="presentation" data-closing={isClosing} onAnimationEnd={finishClosing}>
      <div className="system-dialog" role="alertdialog" aria-modal="true" aria-labelledby={messageId} inert={isClosing}>
        <div id={messageId} className="system-dialog-message">
          {children}
        </div>
        <div className="system-dialog-choices">
          {choices.map(function showChoice(choice, index) {
            const isFocused = index === focusedIndex;
            const isPressed = outcome !== null && outcome.kind === 'chosen' && outcome.choiceIndex === index;

            function chooseByTouch() {
              choose(index);
            }

            return (
              <button
                key={choice.label}
                className="system-dialog-choice"
                type="button"
                data-focused={isFocused}
                data-pressed={isPressed}
                onClick={chooseByTouch}
              >
                {choice.label}
                {isFocused && <SelectionCursor shape="choice" isPressed={isPressed} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function NoticeDialog({ children, onClose }: NoticeDialogProps) {
  return (
    <SystemDialog choices={[{ label: 'OK', onChoose: onClose }]} initialChoiceIndex={0} onCancel={onClose}>
      <p className="system-dialog-notice">{children}</p>
    </SystemDialog>
  );
}

function readChoice(choices: readonly DialogChoice[], index: number): DialogChoice {
  const choice = choices[index];

  if (choice === undefined) {
    throw new Error(`대화상자에 ${index}번째 선택지가 없습니다.`);
  }

  return choice;
}
