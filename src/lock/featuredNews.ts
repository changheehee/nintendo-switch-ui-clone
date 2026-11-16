import { CONSOLE_BRAND } from '../brand/consoleBrand.ts';
import { findGame } from '../games/gameLibrary.ts';
import { findAppletShortcut } from '../shortcuts/consoleShortcuts.ts';

export type NewsArtwork =
  | { readonly kind: 'picture'; readonly pictureUrl: string }
  | { readonly kind: 'shopBanner'; readonly shopName: string; readonly glyphUrl: string };

export type FeaturedNewsItem = {
  readonly id: string;
  readonly headline: string;
  readonly artwork: NewsArtwork;
};

const eshopShortcut = findAppletShortcut('eshop');

export const FEATURED_NEWS: readonly FeaturedNewsItem[] = [
  {
    id: 'oiiaCatArrives',
    headline: `OIIA CAT Spins onto Your ${CONSOLE_BRAND.makerName} ${CONSOLE_BRAND.consoleName}!`,
    artwork: { kind: 'picture', pictureUrl: findGame('oiiaCat').coverUrl },
  },
  {
    id: 'shopOpens',
    headline: 'Games? Demos? Spins? Tell me more!',
    artwork: { kind: 'shopBanner', shopName: eshopShortcut.label, glyphUrl: eshopShortcut.glyphUrl },
  },
];
