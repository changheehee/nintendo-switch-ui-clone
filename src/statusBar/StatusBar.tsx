import type { ClockFormat, ConsoleSettings } from '../console/consoleState.ts';
import { useBatteryStatus, useCurrentMinute, useOnlineStatus } from './deviceStatus.ts';
import type { BatteryStatus } from './deviceStatus.ts';
import './statusBar.css';

type StatusBarProps = {
  readonly settings: ConsoleSettings;
};

type ConsoleClockProps = {
  readonly now: Date;
  readonly clockFormat: ClockFormat;
};

type BatteryGaugeProps = {
  readonly battery: BatteryStatus;
  readonly showsPercentage: boolean;
};

const HOURS_PER_HALF_DAY = 12;
const PERCENT = 100;

export function StatusBar({ settings }: StatusBarProps) {
  const now = useCurrentMinute();
  const battery = useBatteryStatus();
  const isOnline = useOnlineStatus();

  return (
    <div className="status-bar">
      <ConsoleClock now={now} clockFormat={settings.clockFormat} />
      <span className="status-bar-wifi" data-online={isOnline}>
        <span className="screen-reader-only">{isOnline ? '인터넷에 연결되어 있습니다.' : '인터넷에 연결되어 있지 않습니다.'}</span>
      </span>
      <BatteryGauge battery={battery} showsPercentage={settings.showsBatteryPercentage} />
    </div>
  );
}

function ConsoleClock({ now, clockFormat }: ConsoleClockProps) {
  const minutes = String(now.getMinutes()).padStart(2, '0');

  if (clockFormat === 'twentyFourHour') {
    return (
      <span className="status-bar-clock">
        {now.getHours()}:{minutes}
      </span>
    );
  }

  return (
    <span className="status-bar-clock">
      {readTwelveHourClockHour(now)}:{minutes}
      <span className="status-bar-small-text status-bar-meridiem">{now.getHours() < HOURS_PER_HALF_DAY ? 'AM' : 'PM'}</span>
    </span>
  );
}

function BatteryGauge({ battery, showsPercentage }: BatteryGaugeProps) {
  if (battery.kind === 'unknown') {
    return (
      <span className="battery-gauge">
        <span className="screen-reader-only">배터리 상태를 알 수 없습니다.</span>
        <span className="battery-gauge-body">
          <span className="battery-gauge-frame" />
        </span>
      </span>
    );
  }

  const levelPercent = Math.round(battery.level * PERCENT);

  return (
    <span className="battery-gauge" data-charging={battery.isCharging}>
      <span className="screen-reader-only">{`배터리가 ${levelPercent}% 남았습니다.`}</span>
      {showsPercentage && (
        <span className="battery-gauge-percentage">
          {levelPercent}
          <span className="status-bar-small-text">%</span>
        </span>
      )}
      <span className="battery-gauge-body">
        <span className="battery-gauge-frame" />
        <span className="battery-gauge-level" style={{ '--battery-level-ratio': battery.level }} />
        {battery.isCharging && <span className="battery-gauge-bolt" />}
      </span>
    </span>
  );
}

function readTwelveHourClockHour(now: Date): number {
  const hour = now.getHours() % HOURS_PER_HALF_DAY;

  return hour === 0 ? HOURS_PER_HALF_DAY : hour;
}
