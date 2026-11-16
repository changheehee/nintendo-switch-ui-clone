import { CONSOLE_BRAND } from '../brand/consoleBrand.ts';
import type { AppletId } from '../console/consoleState.ts';
import albumUrl from './assets/album@2x.png';
import controllersUrl from './assets/controllers@2x.png';
import eshopUrl from './assets/eshop@2x.png';
import newsUrl from './assets/news@2x.png';
import settingsUrl from './assets/settings@2x.png';
import sleepUrl from './assets/sleep@2x.png';

type ShortcutTarget = { readonly kind: 'applet'; readonly applet: AppletId } | { readonly kind: 'sleep' };

type GlyphTone = 'news' | 'eshop' | 'album' | 'system';

export type ConsoleShortcut = {
  readonly label: string;
  readonly glyphUrl: string;
  readonly glyphTone: GlyphTone;
  readonly target: ShortcutTarget;
};

export const CONSOLE_SHORTCUTS: readonly ConsoleShortcut[] = [
  { label: 'News', glyphUrl: newsUrl, glyphTone: 'news', target: { kind: 'applet', applet: 'news' } },
  { label: `${CONSOLE_BRAND.makerName} eShop`, glyphUrl: eshopUrl, glyphTone: 'eshop', target: { kind: 'applet', applet: 'eshop' } },
  { label: 'Album', glyphUrl: albumUrl, glyphTone: 'album', target: { kind: 'applet', applet: 'album' } },
  { label: 'Controllers', glyphUrl: controllersUrl, glyphTone: 'system', target: { kind: 'applet', applet: 'controllers' } },
  { label: 'System Settings', glyphUrl: settingsUrl, glyphTone: 'system', target: { kind: 'applet', applet: 'settings' } },
  { label: 'Sleep Mode', glyphUrl: sleepUrl, glyphTone: 'system', target: { kind: 'sleep' } },
];

export function findAppletShortcutIndex(applet: AppletId): number {
  const index = CONSOLE_SHORTCUTS.findIndex(function opensRequestedApplet(shortcut) {
    return opensApplet(shortcut, applet);
  });

  if (index === -1) {
    throw new Error(`바로가기에 없는 애플릿입니다: ${applet}`);
  }

  return index;
}

export function opensApplet(shortcut: ConsoleShortcut, applet: AppletId): boolean {
  return shortcut.target.kind === 'applet' && shortcut.target.applet === applet;
}

export function findAppletShortcut(applet: AppletId): ConsoleShortcut {
  return readShortcut(findAppletShortcutIndex(applet));
}

export function readShortcut(index: number): ConsoleShortcut {
  const shortcut = CONSOLE_SHORTCUTS[index];

  if (shortcut === undefined) {
    throw new Error(`바로가기에 ${index}번째 항목이 없습니다.`);
  }

  return shortcut;
}
