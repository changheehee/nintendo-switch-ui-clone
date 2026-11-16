import { lazy } from 'react';
import type { ComponentType } from 'react';
import makerLogoUrl from './oiiaCat/assets/makerLogo@2x.png';
import oiiaCatCoverUrl from './oiiaCat/assets/oiiaCatCover@2x.png';

export type GameId = 'oiiaCat';

export type GameScreenProps = {
  readonly isSuspended: boolean;
  readonly onCapture: (imageUrl: string) => void;
};

type GameScreenModule = {
  readonly default: ComponentType<GameScreenProps>;
};

export type Game = {
  readonly id: GameId;
  readonly title: string;
  readonly publisher: string;
  readonly version: string;
  readonly coverUrl: string;
  readonly makerLogoUrl: string;
  readonly Screen: ComponentType<GameScreenProps>;
  readonly preloadScreen: () => Promise<GameScreenModule>;
};

function loadOiiaCatGame(): Promise<GameScreenModule> {
  return import('./oiiaCat/OiiaCatGame.tsx').then(function pickOiiaCatGame(module) {
    return { default: module.OiiaCatGame };
  });
}

export const GAME_LIBRARY: readonly Game[] = [
  {
    id: 'oiiaCat',
    title: 'OIIA CAT',
    publisher: 'OIIA Studio',
    version: '1.0.0',
    coverUrl: oiiaCatCoverUrl,
    makerLogoUrl,
    Screen: lazy(loadOiiaCatGame),
    preloadScreen: loadOiiaCatGame,
  },
];

export function findGame(gameId: GameId): Game {
  return readGame(findGameIndex(gameId));
}

export function findGameIndex(gameId: GameId): number {
  const index = GAME_LIBRARY.findIndex(function hasGameId(candidate) {
    return candidate.id === gameId;
  });

  if (index === -1) {
    throw new Error(`게임 목록에 없는 게임입니다: ${gameId}`);
  }

  return index;
}

export function readGame(index: number): Game {
  const game = GAME_LIBRARY[index];

  if (game === undefined) {
    throw new Error(`게임 목록에 ${index}번째 게임이 없습니다.`);
  }

  return game;
}

export function preloadGameScreen(game: Game) {
  game.preloadScreen().catch(function reportPreloadFailure(error: unknown) {
    console.error(`게임 화면을 미리 불러오지 못했습니다: ${game.title}`, error);
  });
}
