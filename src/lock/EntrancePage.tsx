import type { AnimationEvent } from 'react';
import type { ConsoleSettings } from '../console/consoleState.ts';
import { ButtonGlyph } from '../controls/ButtonGlyph.tsx';
import { TouchArea } from '../controls/TouchArea.tsx';
import { useConsoleButtons } from '../input/consoleInput.ts';
import { StatusBar } from '../statusBar/StatusBar.tsx';
import { FeaturedNewsPanel } from './FeaturedNewsPanel.tsx';
import { HomeMenuMark } from './HomeMenuMark.tsx';
import './entrancePage.css';

type EntrancePageProps = {
  readonly settings: ConsoleSettings;
  readonly hasUnreadNews: boolean;
  readonly isCovered: boolean;
  readonly isLeaving: boolean;
  readonly onPress: () => void;
  readonly onLeft: () => void;
};

const LEAVE_ANIMATION = 'run-timeline';

export function EntrancePage({ settings, hasUnreadNews, isCovered, isLeaving, onPress, onLeft }: EntrancePageProps) {
  useConsoleButtons('screen', pressAnyButton);

  function pressAnyButton() {
    if (!isLeaving) {
      onPress();
    }
  }

  function finishLeaving(event: AnimationEvent<HTMLDivElement>) {
    const hasLeft = event.target === event.currentTarget && event.animationName === LEAVE_ANIMATION;

    if (!hasLeft) {
      return;
    }

    if (!isLeaving) {
      throw new Error('Entrance 화면을 떠나는 중이 아닌데 퇴장 효과가 끝났습니다.');
    }

    onLeft();
  }

  return (
    <div className="entrance-page console-layer" data-leaving={isLeaving} inert={isCovered || isLeaving} onAnimationEnd={finishLeaving}>
      <TouchArea label="화면 터치" onTouch={pressAnyButton} />
      <FeaturedNewsPanel hasUnreadNews={hasUnreadNews} />
      <div className="entrance-main">
        <StatusBar settings={settings} />
        <HomeMenuMark placement="entrance" />
        <p className="entrance-start">
          <ButtonGlyph button="a" />
          Start
        </p>
      </div>
    </div>
  );
}
