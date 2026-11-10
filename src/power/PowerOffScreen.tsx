import { useConsoleButtons } from '../input/consoleInput.ts';
import './blankScreen.css';

type PowerOffScreenProps = {
  readonly onPowerPressed: () => void;
};

export function PowerOffScreen({ onPowerPressed }: PowerOffScreenProps) {
  useConsoleButtons('screen', onPowerPressed);

  return (
    <button className="blank-screen console-layer" type="button" onClick={onPowerPressed}>
      <span className="blank-screen-hint">버튼을 누르거나 화면을 클릭하면 전원이 켜집니다.</span>
      <span className="blank-screen-detail">A·B·X·Y 키 · 방향키 · H(HOME) · C(캡처) · +/− · 마우스 클릭(터치)</span>
    </button>
  );
}
