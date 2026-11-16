import type { AnimationEvent } from 'react';
import type { Capture } from '../../console/consoleState.ts';
import { ButtonHints } from '../../controls/ButtonHints.tsx';
import { findGame } from '../../games/gameLibrary.ts';
import './captureViewer.css';

type CaptureViewerProps = {
  readonly capture: Capture;
  readonly hasPrevious: boolean;
  readonly hasNext: boolean;
  readonly isClosing: boolean;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
  readonly onBack: () => void;
  readonly onClosed: () => void;
};

const CLOSE_ANIMATION = 'fade-out';

export function CaptureViewer({ capture, hasPrevious, hasNext, isClosing, onPrevious, onNext, onBack, onClosed }: CaptureViewerProps) {
  const game = findGame(capture.gameId);

  function finishClosing(event: AnimationEvent<HTMLDivElement>) {
    const hasClosed = event.target === event.currentTarget && event.animationName === CLOSE_ANIMATION;

    if (!hasClosed) {
      return;
    }

    if (!isClosing) {
      throw new Error('캡처 보기 화면을 닫는 중이 아닌데 닫힘 효과가 끝났습니다.');
    }

    onClosed();
  }

  return (
    <figure className="capture-viewer console-layer">
      <div className="capture-viewer-stage" data-closing={isClosing} onAnimationEnd={finishClosing}>
        <img key={capture.id} className="capture-viewer-image" src={capture.imageUrl} alt={`${game.title} 화면 캡처`} draggable={false} />
        {hasPrevious && <button className="capture-viewer-arrow" type="button" data-direction="previous" onClick={onPrevious} aria-label="이전 캡처" />}
        {hasNext && <button className="capture-viewer-arrow" type="button" data-direction="next" onClick={onNext} aria-label="다음 캡처" />}
      </div>
      {!isClosing && (
        <figcaption className="capture-viewer-bar">
          <span className="screen-reader-only">{`${game.title} 화면을 ${formatCaptureTime(capture.capturedAt)}에 캡처했습니다.`}</span>
          <span className="capture-viewer-hints">
            <ButtonHints hints={[{ buttons: ['b'], label: 'Back', onPress: onBack }]} />
          </span>
        </figcaption>
      )}
    </figure>
  );
}

function formatCaptureTime(capturedAt: Date): string {
  return capturedAt.toLocaleString('ko-KR', { dateStyle: 'long', timeStyle: 'short' });
}
