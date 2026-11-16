import { useState } from 'react';
import type { AnimationEvent, ChangeEvent } from 'react';
import { TouchArea } from '../controls/TouchArea.tsx';
import { useConsoleButtons } from '../input/consoleInput.ts';
import type { ConsoleButton } from '../input/consoleButtons.ts';
import { HomeMenuMark } from './HomeMenuMark.tsx';
import './unlockPrompt.css';

type UnlockPromptProps = {
  readonly skipsNextLock: boolean;
  readonly onSkipNextLockChange: (skipsNextLock: boolean) => void;
  readonly onBack: () => void;
  readonly onUnlocked: () => void;
};

type UnlockButton = Exclude<ConsoleButton, 'b'> | 'touch';

type UnlockProgress = {
  readonly button: UnlockButton;
  readonly pressCount: number;
};

const UNLOCK_STEPS = ['first', 'second', 'third'] as const;
const REQUIRED_PRESS_COUNT = UNLOCK_STEPS.length;
const BACK_ANIMATION = 'fade-out';
const UNLOCK_ANIMATION = 'run-timeline';

export function UnlockPrompt({ skipsNextLock, onSkipNextLockChange, onBack, onUnlocked }: UnlockPromptProps) {
  const [progress, setProgress] = useState<UnlockProgress | null>(null);
  const [isGoingBack, setIsGoingBack] = useState(false);
  const pressCount = progress === null ? 0 : progress.pressCount;
  const isUnlocked = pressCount === REQUIRED_PRESS_COUNT;
  const isLeaving = isUnlocked || isGoingBack;

  useConsoleButtons('overlay', pressPromptButton);

  function pressPromptButton(button: ConsoleButton, isRepeat: boolean) {
    if (isRepeat) {
      return;
    }

    if (button === 'b') {
      goBack();
      return;
    }

    countPress(button);
  }

  function goBack() {
    if (!isLeaving) {
      setIsGoingBack(true);
    }
  }

  function countPress(button: UnlockButton) {
    if (isLeaving) {
      return;
    }

    const isSameButton = progress !== null && progress.button === button;

    setProgress({ button, pressCount: isSameButton ? pressCount + 1 : 1 });
  }

  function countTouch() {
    countPress('touch');
  }

  function changeSkipNextLock(event: ChangeEvent<HTMLInputElement>) {
    onSkipNextLockChange(event.currentTarget.checked);
  }

  function finishLeaving(event: AnimationEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (isGoingBack && event.animationName === BACK_ANIMATION) {
      onBack();
    }

    if (isUnlocked && event.animationName === UNLOCK_ANIMATION) {
      onUnlocked();
    }
  }

  return (
    <div className="unlock-prompt console-layer" data-going-back={isGoingBack} data-unlocked={isUnlocked} onAnimationEnd={finishLeaving}>
      <div className="unlock-prompt-content" inert={isLeaving}>
        <TouchArea label="화면 터치" onTouch={countTouch} />
        <button className="unlock-prompt-back" type="button" onClick={goBack}>
          Back
        </button>
        <label className="unlock-prompt-skip">
          <input className="unlock-prompt-skip-box" type="checkbox" checked={skipsNextLock} onChange={changeSkipNextLock} />
          Don&apos;t lock next time
        </label>
        <span className="unlock-prompt-disc" aria-hidden="true" />
        <HomeMenuMark placement="prompt" />
        <div className="unlock-prompt-band">
          <p className="unlock-prompt-message">Press the same button three times.</p>
          <ol className="unlock-prompt-progress" aria-label={`같은 버튼을 ${REQUIRED_PRESS_COUNT}번 중 ${pressCount}번 눌렀습니다.`}>
            {UNLOCK_STEPS.map(function showStep(step, index) {
              return <li key={step} className="unlock-prompt-dot" data-filled={index < pressCount} />;
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
