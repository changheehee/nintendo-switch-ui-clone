import { useState } from 'react';
import type { AnimationEvent } from 'react';
import { NoticeDialog } from '../../controls/SystemDialog.tsx';
import { SystemPage } from '../../controls/SystemPage.tsx';
import { usePageExit } from '../../controls/usePageExit.ts';
import { useConsoleButtons } from '../../input/consoleInput.ts';
import type { ConsoleButton } from '../../input/consoleButtons.ts';
import { createAppletHeader } from '../appletHeader.ts';
import './offlineApplet.css';

type OfflineAppletProps = {
  readonly applet: 'news' | 'eshop';
  readonly onExit: () => void;
};

type Connection = 'connecting' | 'failed';

const CONNECTING_ANIMATION = 'spin-connecting-spinner';

export function OfflineApplet({ applet, onExit }: OfflineAppletProps) {
  const { isLeaving, leave } = usePageExit();
  const [connection, setConnection] = useState<Connection>('connecting');

  useConsoleButtons('screen', pressOfflineButton);

  function pressOfflineButton(button: ConsoleButton) {
    if (button === 'b' || button === 'home') {
      leave();
    }
  }

  function showConnectionError(event: AnimationEvent<HTMLSpanElement>) {
    const hasGivenUp = event.target === event.currentTarget && event.animationName === CONNECTING_ANIMATION;

    if (hasGivenUp && !isLeaving) {
      setConnection('failed');
    }
  }

  return (
    <>
      <SystemPage
        layout="fullScreen"
        header={createAppletHeader(applet)}
        hints={[{ buttons: ['b'], label: 'Back', onPress: leave }]}
        isLeaving={isLeaving}
        isCovered={connection === 'failed'}
        onLeft={onExit}
      >
        {connection === 'connecting' && (
          <span className="connecting-spinner" onAnimationEnd={showConnectionError}>
            <span className="screen-reader-only">서버에 연결하는 중입니다.</span>
          </span>
        )}
      </SystemPage>
      {connection === 'failed' && !isLeaving && (
        <NoticeDialog onClose={leave}>
          Unable to connect to the server.
          <br />
          Please try again later.
        </NoticeDialog>
      )}
    </>
  );
}
