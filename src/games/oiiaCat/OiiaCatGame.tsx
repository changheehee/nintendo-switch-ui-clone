import { useRef, useState } from 'react';
import { ButtonGlyph } from '../../controls/ButtonGlyph.tsx';
import { TouchArea } from '../../controls/TouchArea.tsx';
import { useConsoleButtons } from '../../input/consoleInput.ts';
import type { ConsoleButton } from '../../input/consoleButtons.ts';
import type { GameScreenProps } from '../gameLibrary.ts';
import { BACKDROP_HEIGHT, BACKDROP_WIDTH, readDrawingContext } from './oiiaBackdrop.ts';
import { useBackdropPainting } from './useBackdropPainting.ts';
import { useCatSong } from './useCatSong.ts';
import { useCatStage } from './useCatStage.ts';
import type { CatStage } from './useCatStage.ts';
import './oiiaCatGame.css';

const BACKDROP_PIXEL_RATIO = 2;
const CAPTURE_IMAGE_TYPE = 'image/jpeg';
const CAPTURE_IMAGE_QUALITY = 0.92;

export function OiiaCatGame({ isSuspended, onCapture }: GameScreenProps) {
  const backdropRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [spinNumber, setSpinNumber] = useState(1);
  const catStage = useCatStage(stageRef, spinNumber, isSuspended);

  useCatSong(spinNumber, isSuspended);
  useBackdropPainting(backdropRef);
  useConsoleButtons('game', pressGameButton);

  function pressGameButton(button: ConsoleButton) {
    if (isSuspended) {
      return;
    }

    if (button === 'a') {
      spinAgain();
    }

    if (button === 'capture') {
      captureScreen();
    }
  }

  function touchStage() {
    pressGameButton('a');
  }

  function spinAgain() {
    setSpinNumber(countNextSpin);
  }

  function captureScreen() {
    onCapture(composeCapture(backdropRef.current!, catStage));
  }

  return (
    <div className="oiia-game">
      <canvas
        ref={backdropRef}
        className="oiia-game-backdrop"
        width={BACKDROP_WIDTH * BACKDROP_PIXEL_RATIO}
        height={BACKDROP_HEIGHT * BACKDROP_PIXEL_RATIO}
      />
      <div ref={stageRef} className="oiia-game-stage" />
      <TouchArea label="고양이 다시 돌리기" onTouch={touchStage} />
      <ul className="oiia-game-hints">
        <li className="oiia-game-hint">
          <ButtonGlyph button="a" />
          다시 돌리기
        </li>
        <li className="oiia-game-hint">
          <ButtonGlyph button="capture" />
          화면 캡처 (C)
        </li>
        <li className="oiia-game-hint">
          <ButtonGlyph button="home" />
          HOME 메뉴 (H)
        </li>
      </ul>
    </div>
  );
}

function countNextSpin(spinNumber: number): number {
  return spinNumber + 1;
}

function composeCapture(backdrop: HTMLCanvasElement, catStage: CatStage): string {
  const capture = document.createElement('canvas');
  capture.width = BACKDROP_WIDTH;
  capture.height = BACKDROP_HEIGHT;
  const context = readDrawingContext(capture);

  context.drawImage(backdrop, 0, 0, BACKDROP_WIDTH, BACKDROP_HEIGHT);
  catStage.drawFrameOnto(context);

  return capture.toDataURL(CAPTURE_IMAGE_TYPE, CAPTURE_IMAGE_QUALITY);
}
