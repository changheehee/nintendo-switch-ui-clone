import { ButtonHints } from './ButtonHints.tsx';
import type { ButtonHint } from './ButtonHints.tsx';
import type { PageLayout } from './pageLayout.ts';
import './screenFooter.css';

type ScreenFooterProps = {
  readonly hints: readonly ButtonHint[];
  readonly layout: PageLayout;
};

export function ScreenFooter({ hints, layout }: ScreenFooterProps) {
  return (
    <footer className="screen-footer" data-layout={layout}>
      <span className="screen-footer-play-mode" aria-hidden="true" />
      <div className="screen-footer-hints">
        <ButtonHints hints={hints} />
      </div>
    </footer>
  );
}
