import { useState } from 'react';
import type { ConsoleSettings } from '../console/consoleState.ts';
import { EntrancePage } from './EntrancePage.tsx';
import { UnlockPrompt } from './UnlockPrompt.tsx';
import './lockScreen.css';

type LockScreenProps = {
  readonly skipsUnlockPrompt: boolean;
  readonly skipsNextLock: boolean;
  readonly settings: ConsoleSettings;
  readonly hasUnreadNews: boolean;
  readonly onSkipNextLockChange: (skipsNextLock: boolean) => void;
  readonly onUnlocked: () => void;
};

type LockStep = 'entrance' | 'prompt' | 'leavingToHome';

export function LockScreen({ skipsUnlockPrompt, skipsNextLock, settings, hasUnreadNews, onSkipNextLockChange, onUnlocked }: LockScreenProps) {
  const [step, setStep] = useState<LockStep>('entrance');

  function leaveEntrance() {
    setStep(skipsUnlockPrompt ? 'leavingToHome' : 'prompt');
  }

  function returnToEntrance() {
    setStep('entrance');
  }

  return (
    <div className="lock-screen console-layer">
      <EntrancePage
        settings={settings}
        hasUnreadNews={hasUnreadNews}
        isCovered={step === 'prompt'}
        isLeaving={step === 'leavingToHome'}
        onPress={leaveEntrance}
        onLeft={onUnlocked}
      />
      {step === 'prompt' && (
        <UnlockPrompt skipsNextLock={skipsNextLock} onSkipNextLockChange={onSkipNextLockChange} onBack={returnToEntrance} onUnlocked={onUnlocked} />
      )}
    </div>
  );
}
