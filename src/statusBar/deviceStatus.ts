import { useEffect, useState } from 'react';

export type BatteryStatus =
  | { readonly kind: 'unknown' }
  | { readonly kind: 'measured'; readonly level: number; readonly isCharging: boolean };

const MILLISECONDS_PER_MINUTE = 60_000;
const UNKNOWN_BATTERY: BatteryStatus = { kind: 'unknown' };

export function useCurrentMinute(): Date {
  const [now, setNow] = useState(readNow);

  useEffect(function updateAtEveryMinute() {
    let timerId = 0;

    function showNextMinute() {
      setNow(readNow());
      waitForNextMinute();
    }

    function waitForNextMinute() {
      timerId = window.setTimeout(showNextMinute, readMillisecondsToNextMinute());
    }

    waitForNextMinute();

    return function stopUpdating() {
      window.clearTimeout(timerId);
    };
  }, []);

  return now;
}

export function useBatteryStatus(): BatteryStatus {
  const [battery, setBattery] = useState<BatteryStatus>(UNKNOWN_BATTERY);

  useEffect(function followBatteryLevel() {
    const following = new AbortController();

    function watchBattery(manager: BatteryManager) {
      function showBattery() {
        setBattery({ kind: 'measured', level: manager.level, isCharging: manager.charging });
      }

      if (following.signal.aborted) {
        return;
      }

      showBattery();
      manager.addEventListener('levelchange', showBattery, { signal: following.signal });
      manager.addEventListener('chargingchange', showBattery, { signal: following.signal });
    }

    function reportBatteryFailure(error: unknown) {
      console.error('배터리 상태를 읽지 못했습니다.', error);
    }

    if (navigator.getBattery !== undefined) {
      navigator.getBattery().then(watchBattery).catch(reportBatteryFailure);
    }

    return function stopFollowingBattery() {
      following.abort();
    };
  }, []);

  return battery;
}

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(readOnline);

  useEffect(function followNetwork() {
    function updateOnline() {
      setIsOnline(readOnline());
    }

    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);

    return function stopFollowingNetwork() {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, []);

  return isOnline;
}

function readNow(): Date {
  return new Date();
}

function readOnline(): boolean {
  return navigator.onLine;
}

function readMillisecondsToNextMinute(): number {
  return MILLISECONDS_PER_MINUTE - (Date.now() % MILLISECONDS_PER_MINUTE);
}
