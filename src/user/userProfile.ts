import oiiaAvatarUrl from './assets/oiiaAvatar@2x.png';

export type UserProfile = {
  readonly nickname: string;
  readonly avatarUrl: string;
};

export const CONSOLE_USER: UserProfile = { nickname: 'OIIA', avatarUrl: oiiaAvatarUrl };

export function formatUserPageTitle(user: UserProfile): string {
  return `${user.nickname}'s Page`;
}
