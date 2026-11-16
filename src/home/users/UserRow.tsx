import { SelectionCursor } from '../../controls/SelectionCursor.tsx';
import { formatUserPageTitle } from '../../user/userProfile.ts';
import type { UserProfile } from '../../user/userProfile.ts';
import './userRow.css';

type UserRowProps = {
  readonly users: readonly UserProfile[];
  readonly focusedIndex: number | null;
  readonly pressedIndex: number | null;
  readonly onTouchUser: (index: number) => void;
};

export function UserRow({ users, focusedIndex, pressedIndex, onTouchUser }: UserRowProps) {
  return (
    <ol className="user-row">
      {users.map(function showUser(user, index) {
        const isFocused = index === focusedIndex;
        const isPressed = index === pressedIndex;

        function touchUser() {
          onTouchUser(index);
        }

        return (
          <li key={user.nickname} className="user-row-slot">
            <button className="user-icon" type="button" data-pressed={isPressed} onClick={touchUser}>
              <img className="user-icon-avatar" src={user.avatarUrl} alt={user.nickname} draggable={false} />
            </button>
            {isFocused && <SelectionCursor shape="avatar" isPressed={isPressed} />}
            {isFocused && <p className="user-row-label">{formatUserPageTitle(user)}</p>}
          </li>
        );
      })}
    </ol>
  );
}
