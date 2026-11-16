import { useState } from 'react';
import type { Capture } from '../../console/consoleState.ts';
import type { ButtonHint } from '../../controls/ButtonHints.tsx';
import { SelectionCursor } from '../../controls/SelectionCursor.tsx';
import { SystemPage } from '../../controls/SystemPage.tsx';
import { usePageExit } from '../../controls/usePageExit.ts';
import { findGame } from '../../games/gameLibrary.ts';
import { useConsoleButtons } from '../../input/consoleInput.ts';
import type { ConsoleButton, DirectionButton } from '../../input/consoleButtons.ts';
import { isDirectionButton } from '../../input/consoleButtons.ts';
import { createAppletHeader } from '../appletHeader.ts';
import { CaptureViewer } from './CaptureViewer.tsx';
import './albumApplet.css';

type AlbumAppletProps = {
  readonly captures: readonly Capture[];
  readonly onExit: () => void;
};

type ViewerPhase = 'open' | 'closing';

const COLUMN_COUNT = 4;
const ROWS_ABOVE_FOCUS = 2;

const FOCUS_STEPS: Readonly<Record<DirectionButton, number>> = {
  left: -1,
  right: 1,
  up: -COLUMN_COUNT,
  down: COLUMN_COUNT,
};

export function AlbumApplet({ captures, onExit }: AlbumAppletProps) {
  const { isLeaving, leave } = usePageExit();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [viewerPhase, setViewerPhase] = useState<ViewerPhase | null>(null);
  const hasCaptures = captures.length > 0;
  const isViewerShown = viewerPhase !== null;
  const scrolledRows = Math.max(Math.floor(focusedIndex / COLUMN_COUNT) - ROWS_ABOVE_FOCUS, 0);

  useConsoleButtons('screen', pressAlbumButton);

  function pressAlbumButton(button: ConsoleButton) {
    if (isLeaving) {
      return;
    }

    if (button === 'home') {
      leave();
      return;
    }

    if (isViewerShown) {
      pressViewerButton(button);
      return;
    }

    if (button === 'b') {
      leave();
    }

    if (button === 'a' && hasCaptures) {
      viewFocusedCapture();
    }

    if (isDirectionButton(button)) {
      moveFocusTo(focusedIndex + FOCUS_STEPS[button]);
    }
  }

  function pressViewerButton(button: ConsoleButton) {
    if (viewerPhase === 'closing') {
      return;
    }

    if (button === 'b') {
      setViewerPhase('closing');
    }

    if (button === 'left') {
      moveFocusTo(focusedIndex - 1);
    }

    if (button === 'right') {
      moveFocusTo(focusedIndex + 1);
    }
  }

  function moveFocusTo(index: number) {
    const isInsideAlbum = index >= 0 && index < captures.length;

    if (isInsideAlbum) {
      setFocusedIndex(index);
    }
  }

  function viewFocusedCapture() {
    setViewerPhase('open');
  }

  function removeViewer() {
    setViewerPhase(null);
  }

  function touchCapture(index: number) {
    if (index === focusedIndex) {
      viewFocusedCapture();
      return;
    }

    moveFocusTo(index);
  }

  function pressBack() {
    pressAlbumButton('b');
  }

  function pressView() {
    pressAlbumButton('a');
  }

  function showPreviousCapture() {
    pressAlbumButton('left');
  }

  function showNextCapture() {
    pressAlbumButton('right');
  }

  function createAlbumHints(): readonly ButtonHint[] {
    const backHint: ButtonHint = { buttons: ['b'], label: 'Back', onPress: pressBack };

    if (isViewerShown || !hasCaptures) {
      return [backHint];
    }

    return [backHint, { buttons: ['a'], label: 'View', onPress: pressView }];
  }

  return (
    <>
      <SystemPage layout="fullScreen" header={createAppletHeader('album')} hints={createAlbumHints()} isLeaving={isLeaving} isCovered={isViewerShown} onLeft={onExit}>
        {!hasCaptures && <p className="album-empty">There are no screenshots or videos.</p>}
        {hasCaptures && (
          <ol className="album-grid" style={{ '--album-columns': COLUMN_COUNT, '--album-scrolled-rows': scrolledRows }}>
            {captures.map(function showCapture(capture, index) {
              const isFocused = index === focusedIndex;

              function touchThisCapture() {
                touchCapture(index);
              }

              return (
                <li key={capture.id} className="album-slot">
                  <button className="album-thumbnail" type="button" onClick={touchThisCapture}>
                    <img className="album-thumbnail-image" src={capture.imageUrl} alt={`${findGame(capture.gameId).title} 화면 캡처`} draggable={false} />
                  </button>
                  {isFocused && <SelectionCursor shape="tile" isPressed={false} />}
                </li>
              );
            })}
          </ol>
        )}
      </SystemPage>
      {isViewerShown && (
        <CaptureViewer
          capture={readCapture(captures, focusedIndex)}
          hasPrevious={focusedIndex > 0}
          hasNext={focusedIndex < captures.length - 1}
          isClosing={viewerPhase === 'closing' || isLeaving}
          onPrevious={showPreviousCapture}
          onNext={showNextCapture}
          onBack={pressBack}
          onClosed={removeViewer}
        />
      )}
    </>
  );
}

function readCapture(captures: readonly Capture[], index: number): Capture {
  const capture = captures[index];

  if (capture === undefined) {
    throw new Error(`앨범에 ${index}번째 캡처가 없습니다.`);
  }

  return capture;
}
