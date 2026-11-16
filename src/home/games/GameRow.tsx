import { SelectionCursor } from '../../controls/SelectionCursor.tsx';
import type { Game, GameId } from '../../games/gameLibrary.ts';
import { CONSOLE_USER } from '../../user/userProfile.ts';
import './gameRow.css';

type GameRowProps = {
  readonly games: readonly Game[];
  readonly focusedIndex: number | null;
  readonly pressedIndex: number | null;
  readonly launchingIndex: number | null;
  readonly suspendedGameId: GameId | null;
  readonly onTouchGame: (index: number) => void;
};

const VISIBLE_TILE_COUNT = 5;

export function GameRow({ games, focusedIndex, pressedIndex, launchingIndex, suspendedGameId, onTouchGame }: GameRowProps) {
  const placeholderCount = Math.max(VISIBLE_TILE_COUNT - games.length, 0);

  return (
    <ol className="game-row">
      {games.map(function showGameTile(game, index) {
        const isFocused = index === focusedIndex;
        const isPressed = index === pressedIndex;
        const isLaunching = index === launchingIndex;

        function touchGame() {
          onTouchGame(index);
        }

        return (
          <li key={game.id} className="game-row-slot">
            {isFocused && <p className="game-row-label">{game.title}</p>}
            <button className="game-tile" type="button" data-pressed={isPressed} data-launching={isLaunching} onClick={touchGame}>
              <img className="game-tile-cover" src={game.coverUrl} alt={game.title} draggable={false} />
              {game.id === suspendedGameId && <PlayingBadge />}
            </button>
            {isFocused && <SelectionCursor shape="tile" isPressed={isPressed} />}
          </li>
        );
      })}
      {Array.from({ length: placeholderCount }, function showPlaceholder(_, index) {
        return <li key={`placeholder-${index}`} className="game-row-slot game-row-placeholder" aria-hidden="true" />;
      })}
    </ol>
  );
}

function PlayingBadge() {
  return (
    <span className="playing-badge">
      <img className="playing-badge-user" src={CONSOLE_USER.avatarUrl} alt="" draggable={false} />
      <span className="playing-badge-label">Playing</span>
    </span>
  );
}
