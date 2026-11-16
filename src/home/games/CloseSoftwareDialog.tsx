import { SystemDialog } from '../../controls/SystemDialog.tsx';
import type { DialogChoice } from '../../controls/SystemDialog.tsx';
import { findGame } from '../../games/gameLibrary.ts';
import type { GameId } from '../../games/gameLibrary.ts';
import { CONSOLE_USER } from '../../user/userProfile.ts';
import './closeSoftwareDialog.css';

type CloseSoftwareDialogProps = {
  readonly gameId: GameId;
  readonly onCancel: () => void;
  readonly onClose: () => void;
};

const CLOSE_CHOICE_INDEX = 1;

export function CloseSoftwareDialog({ gameId, onCancel, onClose }: CloseSoftwareDialogProps) {
  const game = findGame(gameId);
  const choices: readonly DialogChoice[] = [
    { label: 'Cancel', onChoose: onCancel },
    { label: 'Close', onChoose: onClose },
  ];

  return (
    <SystemDialog choices={choices} initialChoiceIndex={CLOSE_CHOICE_INDEX} onCancel={onCancel}>
      <div className="close-software">
        <span className="close-software-icon">
          <img className="close-software-cover" src={game.coverUrl} alt={game.title} draggable={false} />
          <img className="close-software-user" src={CONSOLE_USER.avatarUrl} alt="" draggable={false} />
        </span>
        <p className="close-software-message">
          Close the software you are currently
          <br />
          using?
        </p>
      </div>
    </SystemDialog>
  );
}
