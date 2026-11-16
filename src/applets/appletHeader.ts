import type { AppletId } from '../console/consoleState.ts';
import type { PageHeader } from '../controls/SystemPage.tsx';
import { findAppletShortcut } from '../shortcuts/consoleShortcuts.ts';

export function createAppletHeader(applet: AppletId): PageHeader {
  const shortcut = findAppletShortcut(applet);

  return { kind: 'glyph', title: shortcut.label, glyphUrl: shortcut.glyphUrl };
}
