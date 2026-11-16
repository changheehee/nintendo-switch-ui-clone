import { useConsoleButtons } from '../input/consoleInput.ts';
import './blankScreen.css';

type SleepScreenProps = {
  readonly onWake: () => void;
};

export function SleepScreen({ onWake }: SleepScreenProps) {
  useConsoleButtons('screen', onWake);

  return (
    <button className="blank-screen console-layer" type="button" onClick={onWake}>
      <span className="blank-screen-hint" data-tone="dim">절전 모드입니다. 버튼을 누르면 깨어납니다.</span>
    </button>
  );
}
