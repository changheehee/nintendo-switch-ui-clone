import type { AnimationEvent } from 'react';
import './captureToast.css';

type CaptureToastProps = {
  readonly imageUrl: string;
  readonly onFinished: () => void;
};

const FADE_ANIMATION = 'fade-out';

export function CaptureToast({ imageUrl, onFinished }: CaptureToastProps) {
  function finishWhenFaded(event: AnimationEvent<HTMLOutputElement>) {
    if (event.target === event.currentTarget && event.animationName === FADE_ANIMATION) {
      onFinished();
    }
  }

  return (
    <output className="capture-toast" onAnimationEnd={finishWhenFaded}>
      <img className="capture-toast-thumbnail" src={imageUrl} alt="" draggable={false} />
      Capture taken.
    </output>
  );
}
