import { useEffect } from 'react';
import type { AnimationEvent } from 'react';
import { ConsoleLogo } from '../brand/ConsoleLogo.tsx';
import { findGame, preloadGameScreen } from './gameLibrary.ts';
import type { GameId } from './gameLibrary.ts';
import './gameLaunchScreen.css';

type GameLaunchScreenProps = {
  readonly gameId: GameId;
  readonly onReady: () => void;
};

const TIMELINE_ANIMATION = 'run-timeline';

export function GameLaunchScreen({ gameId, onReady }: GameLaunchScreenProps) {
  const game = findGame(gameId);

  useEffect(
    function loadGameWhileLogosShow() {
      preloadGameScreen(game);
    },
    [game],
  );

  function finishWhenTimelineEnds(event: AnimationEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && event.animationName === TIMELINE_ANIMATION) {
      onReady();
    }
  }

  return (
    <div className="game-launch console-layer" onAnimationEnd={finishWhenTimelineEnds}>
      <div className="game-launch-logos">
        <img className="game-launch-maker" src={game.makerLogoUrl} alt={game.publisher} draggable={false} />
        <span className="game-launch-console">
          <ConsoleLogo layout="row" />
        </span>
      </div>
    </div>
  );
}
