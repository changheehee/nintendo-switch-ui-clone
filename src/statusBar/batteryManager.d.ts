interface BatteryManager extends EventTarget {
  readonly level: number;
  readonly charging: boolean;
}

interface Navigator {
  readonly getBattery?: () => Promise<BatteryManager>;
}
