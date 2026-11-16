import type { AppletId, Capture, ConsoleSettings } from '../console/consoleState.ts';
import { AlbumApplet } from './album/AlbumApplet.tsx';
import { ControllersApplet } from './controllers/ControllersApplet.tsx';
import { OfflineApplet } from './offline/OfflineApplet.tsx';
import { SystemSettingsApplet } from './settings/SystemSettingsApplet.tsx';

type AppletScreenProps = {
  readonly applet: AppletId;
  readonly settings: ConsoleSettings;
  readonly captures: readonly Capture[];
  readonly onSettingsChange: (settings: ConsoleSettings) => void;
  readonly onExit: () => void;
};

export function AppletScreen({ applet, settings, captures, onSettingsChange, onExit }: AppletScreenProps) {
  switch (applet) {
    case 'news':
    case 'eshop':
      return <OfflineApplet applet={applet} onExit={onExit} />;
    case 'album':
      return <AlbumApplet captures={captures} onExit={onExit} />;
    case 'controllers':
      return <ControllersApplet onExit={onExit} />;
    case 'settings':
      return <SystemSettingsApplet settings={settings} onSettingsChange={onSettingsChange} onExit={onExit} />;
  }
}
