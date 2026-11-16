import { MenuLabel, MenuPanes, MenuRow, MenuValue } from '../../controls/menu/MenuPanes.tsx';
import type { MenuSection } from '../../controls/menu/MenuPanes.tsx';
import { useMenuPage } from '../../controls/menu/useMenuPage.ts';
import { SystemPage } from '../../controls/SystemPage.tsx';
import { GAME_LIBRARY } from '../../games/gameLibrary.ts';
import { formatUserPageTitle } from '../../user/userProfile.ts';
import type { UserProfile } from '../../user/userProfile.ts';

type UserPageProps = {
  readonly user: UserProfile;
  readonly onExit: () => void;
};

type ProfileRow = {
  readonly label: string;
  readonly value: string;
};

const PROFILE_SECTIONS: readonly MenuSection[] = [{ label: 'Profile', startsGroup: false }];

export function UserPage({ user, onExit }: UserPageProps) {
  const profileRows = listProfileRows(user);
  const menu = useMenuPage('overlay', { sectionCount: PROFILE_SECTIONS.length, countRows, chooseRow: keepProfileRowsReadOnly });

  function countRows(): number {
    return profileRows.length;
  }

  return (
    <SystemPage
      layout="modal"
      header={{ kind: 'picture', title: formatUserPageTitle(user), pictureUrl: user.avatarUrl, details: ['User'] }}
      hints={[{ buttons: ['b'], label: 'Back', onPress: menu.pressBack }]}
      isLeaving={menu.isLeaving}
      isCovered={false}
      onLeft={onExit}
    >
      <MenuPanes layout="modal" sections={PROFILE_SECTIONS} focus={menu.focus} onTouchSection={menu.touchSection}>
        {profileRows.map(function showProfileRow(row, rowIndex) {
          return (
            <MenuRow key={`${row.label}-${row.value}`} focus={menu.focus} rowIndex={rowIndex} size="compact" onTouchRow={menu.touchRow}>
              <MenuLabel>{row.label}</MenuLabel>
              <MenuValue tone="muted">{row.value}</MenuValue>
            </MenuRow>
          );
        })}
      </MenuPanes>
    </SystemPage>
  );
}

function listProfileRows(user: UserProfile): readonly ProfileRow[] {
  const playActivityRows = GAME_LIBRARY.map(function describePlayActivity(game) {
    return { label: 'Play Activity', value: game.title };
  });

  return [{ label: 'Nickname', value: user.nickname }, ...playActivityRows];
}

function keepProfileRowsReadOnly() {}
