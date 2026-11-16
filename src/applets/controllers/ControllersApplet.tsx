import { ButtonGlyph } from '../../controls/ButtonGlyph.tsx';
import type { GlyphButton } from '../../controls/ButtonGlyph.tsx';
import { SystemPage } from '../../controls/SystemPage.tsx';
import { usePageExit } from '../../controls/usePageExit.ts';
import { useConsoleButtons } from '../../input/consoleInput.ts';
import type { ConsoleButton, DirectionButton } from '../../input/consoleButtons.ts';
import { listKeyNames } from '../../input/consoleButtons.ts';
import { createAppletHeader } from '../appletHeader.ts';
import './controllersApplet.css';

type ControllersAppletProps = {
  readonly onExit: () => void;
};

type ButtonGuide = {
  readonly label: string;
  readonly glyphs: readonly GlyphButton[];
  readonly buttons: readonly ConsoleButton[];
};

const DIRECTION_BUTTONS: readonly DirectionButton[] = ['left', 'up', 'right', 'down'];

const BUTTON_GUIDES: readonly ButtonGuide[] = [
  { label: 'A 버튼', glyphs: ['a'], buttons: ['a'] },
  { label: 'B 버튼', glyphs: ['b'], buttons: ['b'] },
  { label: 'X 버튼', glyphs: ['x'], buttons: ['x'] },
  { label: 'Y 버튼', glyphs: ['y'], buttons: ['y'] },
  { label: '− / + 버튼', glyphs: ['minus', 'plus'], buttons: ['minus', 'plus'] },
  { label: 'HOME 버튼', glyphs: ['home'], buttons: ['home'] },
  { label: '캡처 버튼', glyphs: ['capture'], buttons: ['capture'] },
  { label: '방향 버튼', glyphs: [], buttons: DIRECTION_BUTTONS },
];

export function ControllersApplet({ onExit }: ControllersAppletProps) {
  const { isLeaving, leave } = usePageExit();

  useConsoleButtons('screen', pressControllersButton);

  function pressControllersButton(button: ConsoleButton) {
    if (button === 'b' || button === 'home') {
      leave();
    }
  }

  return (
    <SystemPage
      layout="fullScreen"
      header={createAppletHeader('controllers')}
      hints={[{ buttons: ['b'], label: 'Back', onPress: leave }]}
      isLeaving={isLeaving}
      isCovered={false}
      onLeft={onExit}
    >
      <div className="button-guide">
        <p className="button-guide-intro">키보드 키가 컨트롤러 버튼처럼 동작합니다. 마우스 클릭은 화면 터치입니다.</p>
        <ul className="button-guide-list">
          {BUTTON_GUIDES.map(function showButtonGuide(guide) {
            return (
              <li key={guide.label} className="button-guide-row">
                <span className="button-guide-glyphs">
                  {guide.glyphs.map(function showGlyph(glyph) {
                    return <ButtonGlyph key={glyph} button={glyph} />;
                  })}
                </span>
                {guide.label}
                <span className="button-guide-keys">{guide.buttons.flatMap(listKeyNames).join(' · ')}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </SystemPage>
  );
}
