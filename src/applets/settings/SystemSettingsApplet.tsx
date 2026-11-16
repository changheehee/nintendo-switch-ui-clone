import type { ConsoleSettings, ThemeName } from '../../console/consoleState.ts';
import { MenuLabel, MenuPanes, MenuRow, MenuValue } from '../../controls/menu/MenuPanes.tsx';
import type { MenuSection } from '../../controls/menu/MenuPanes.tsx';
import { useMenuPage } from '../../controls/menu/useMenuPage.ts';
import { SystemPage } from '../../controls/SystemPage.tsx';
import { createAppletHeader } from '../appletHeader.ts';
import './systemSettings.css';

type SystemSettingsAppletProps = {
  readonly settings: ConsoleSettings;
  readonly onSettingsChange: (settings: ConsoleSettings) => void;
  readonly onExit: () => void;
};

type SettingsSection = MenuSection & {
  readonly id: 'themes' | 'system';
};

type ThemeChoice = {
  readonly theme: ThemeName;
  readonly label: string;
};

type SystemToggle = {
  readonly label: string;
  readonly readIsOn: (settings: ConsoleSettings) => boolean;
  readonly toggle: (settings: ConsoleSettings) => ConsoleSettings;
};

const SETTINGS_SECTIONS: readonly SettingsSection[] = [
  { id: 'themes', label: 'Themes', startsGroup: false },
  { id: 'system', label: 'System', startsGroup: true },
];

const THEME_CHOICES: readonly ThemeChoice[] = [
  { theme: 'basicWhite', label: 'Basic White' },
  { theme: 'basicBlack', label: 'Basic Black' },
];

const SYSTEM_TOGGLES: readonly SystemToggle[] = [
  { label: '24-Hour Clock', readIsOn: readUsesTwentyFourHourClock, toggle: toggleClockFormat },
  { label: 'Console Battery (%)', readIsOn: readShowsBatteryPercentage, toggle: toggleBatteryPercentage },
];

export function SystemSettingsApplet({ settings, onSettingsChange, onExit }: SystemSettingsAppletProps) {
  const menu = useMenuPage('screen', { sectionCount: SETTINGS_SECTIONS.length, countRows, chooseRow });
  const section = readSection(menu.focus.sectionIndex);

  function chooseRow(sectionIndex: number, rowIndex: number) {
    switch (readSection(sectionIndex).id) {
      case 'themes':
        onSettingsChange({ ...settings, theme: readThemeChoice(rowIndex).theme });
        return;
      case 'system':
        onSettingsChange(readSystemToggle(rowIndex).toggle(settings));
        return;
    }
  }

  return (
    <SystemPage
      layout="fullScreen"
      header={createAppletHeader('settings')}
      hints={[
        { buttons: ['b'], label: 'Back', onPress: menu.pressBack },
        { buttons: ['a'], label: 'OK', onPress: menu.pressOk },
      ]}
      isLeaving={menu.isLeaving}
      isCovered={false}
      onLeft={onExit}
    >
      <MenuPanes layout="fullScreen" sections={SETTINGS_SECTIONS} focus={menu.focus} onTouchSection={menu.touchSection}>
        {section.id === 'themes' &&
          THEME_CHOICES.map(function showThemeChoice(choice, rowIndex) {
            return (
              <MenuRow key={choice.theme} focus={menu.focus} rowIndex={rowIndex} size="tall" onTouchRow={menu.touchRow}>
                <span className="theme-swatch" data-theme-swatch={choice.theme} />
                <MenuLabel>{choice.label}</MenuLabel>
                {choice.theme === settings.theme && (
                  <span className="theme-check">
                    <span className="screen-reader-only">사용 중입니다.</span>
                  </span>
                )}
              </MenuRow>
            );
          })}
        {section.id === 'system' &&
          SYSTEM_TOGGLES.map(function showSystemToggle(systemToggle, rowIndex) {
            const isOn = systemToggle.readIsOn(settings);

            return (
              <MenuRow key={systemToggle.label} focus={menu.focus} rowIndex={rowIndex} size="compact" onTouchRow={menu.touchRow}>
                <MenuLabel>{systemToggle.label}</MenuLabel>
                <MenuValue tone={isOn ? 'accent' : 'muted'}>{isOn ? 'ON' : 'OFF'}</MenuValue>
              </MenuRow>
            );
          })}
      </MenuPanes>
    </SystemPage>
  );
}

function countRows(sectionIndex: number): number {
  switch (readSection(sectionIndex).id) {
    case 'themes':
      return THEME_CHOICES.length;
    case 'system':
      return SYSTEM_TOGGLES.length;
  }
}

function readSection(sectionIndex: number): SettingsSection {
  const section = SETTINGS_SECTIONS[sectionIndex];

  if (section === undefined) {
    throw new Error(`시스템 설정에 ${sectionIndex}번째 항목이 없습니다.`);
  }

  return section;
}

function readThemeChoice(rowIndex: number): ThemeChoice {
  const choice = THEME_CHOICES[rowIndex];

  if (choice === undefined) {
    throw new Error(`테마 목록에 ${rowIndex}번째 테마가 없습니다.`);
  }

  return choice;
}

function readSystemToggle(rowIndex: number): SystemToggle {
  const systemToggle = SYSTEM_TOGGLES[rowIndex];

  if (systemToggle === undefined) {
    throw new Error(`시스템 설정에 ${rowIndex}번째 항목이 없습니다.`);
  }

  return systemToggle;
}

function readUsesTwentyFourHourClock(settings: ConsoleSettings): boolean {
  return settings.clockFormat === 'twentyFourHour';
}

function toggleClockFormat(settings: ConsoleSettings): ConsoleSettings {
  return { ...settings, clockFormat: settings.clockFormat === 'twentyFourHour' ? 'twelveHour' : 'twentyFourHour' };
}

function readShowsBatteryPercentage(settings: ConsoleSettings): boolean {
  return settings.showsBatteryPercentage;
}

function toggleBatteryPercentage(settings: ConsoleSettings): ConsoleSettings {
  return { ...settings, showsBatteryPercentage: !settings.showsBatteryPercentage };
}
