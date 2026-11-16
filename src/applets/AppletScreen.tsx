import type { AppletId, Capture, ConsoleSettings } from '../console/consoleState.ts';
import { ControllersApplet } from './controllers/ControllersApplet.tsx';
import { SystemSettingsApplet } from './settings/SystemSettingsApplet.tsx';

type AppletScreenProps = {
  readonly applet: AppletId;
  readonly settings: ConsoleSettings;
  readonly captures: readonly Capture[];
  readonly onSettingsChange: (settings: ConsoleSettings) => void;
  readonly onExit: () => void;
};

export function AppletScreen({ applet, settings, onSettingsChange, onExit }: AppletScreenProps) {
  switch (applet) {
    case 'news':
      return null;
    case 'eshop':
      return null;
    case 'album':
      return null;
    case 'controllers':
      return <ControllersApplet onExit={onExit} />;
    case 'settings':
      return <SystemSettingsApplet settings={settings} onSettingsChange={onSettingsChange} onExit={onExit} />;
  }
}
