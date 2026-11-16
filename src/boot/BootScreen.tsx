import type { AnimationEvent } from 'react';
import { CONSOLE_BRAND } from '../brand/consoleBrand.ts';
import makerBadgeUrl from './assets/makerBadge@2x.png';
import { ConsoleLogo } from '../brand/ConsoleLogo.tsx';
import './bootScreen.css';

type BootScreenProps = {
  readonly onFinished: () => void;
};

const TIMELINE_ANIMATION = 'run-timeline';

export function BootScreen({ onFinished }: BootScreenProps) {
  function finishWhenTimelineEnds(event: AnimationEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && event.animationName === TIMELINE_ANIMATION) {
      onFinished();
    }
  }

  return (
    <div className="boot-screen console-layer" onAnimationEnd={finishWhenTimelineEnds}>
      <img className="boot-screen-maker" src={makerBadgeUrl} alt={CONSOLE_BRAND.makerName} draggable={false} />
      <span className="boot-screen-console">
        <ConsoleLogo layout="stack" />
      </span>
    </div>
  );
}
