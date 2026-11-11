import { Suspense } from 'react';
import { findGame } from './gameLibrary.ts';
import type { GameId } from './gameLibrary.ts';

type RunningGameProps = {
  readonly gameId: GameId;
  readonly isSuspended: boolean;
  readonly onCapture: (imageUrl: string) => void;
};

export function RunningGame({ gameId, isSuspended, onCapture }: RunningGameProps) {
  const { Screen } = findGame(gameId);

  return (
    <div className="console-layer" inert={isSuspended}>
      <Suspense fallback={null}>
        <Screen isSuspended={isSuspended} onCapture={onCapture} />
      </Suspense>
    </div>
  );
}
