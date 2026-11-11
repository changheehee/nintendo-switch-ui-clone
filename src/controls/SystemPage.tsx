import type { AnimationEvent, ReactNode } from 'react';
import type { ButtonHint } from './ButtonHints.tsx';
import type { PageLayout } from './pageLayout.ts';
import { ScreenFooter } from './ScreenFooter.tsx';
import './systemPage.css';

export type PageHeader =
  | { readonly kind: 'glyph'; readonly title: string; readonly glyphUrl: string }
  | { readonly kind: 'picture'; readonly title: string; readonly pictureUrl: string; readonly details: readonly string[] };

type SystemPageProps = {
  readonly layout: PageLayout;
  readonly header: PageHeader;
  readonly hints: readonly ButtonHint[];
  readonly isLeaving: boolean;
  readonly isCovered: boolean;
  readonly onLeft: () => void;
  readonly children: ReactNode;
};

type PageHeadingProps = {
  readonly header: PageHeader;
};

const LEAVE_ANIMATIONS: Readonly<Record<PageLayout, string>> = {
  fullScreen: 'run-timeline',
  modal: 'fade-out',
};

export function SystemPage({ layout, header, hints, isLeaving, isCovered, onLeft, children }: SystemPageProps) {
  function finishLeaving(event: AnimationEvent<HTMLElement>) {
    const hasLeft = event.target === event.currentTarget && event.animationName === LEAVE_ANIMATIONS[layout];

    if (!hasLeft) {
      return;
    }

    if (!isLeaving) {
      throw new Error('페이지를 떠나는 중이 아닌데 퇴장 효과가 끝났습니다.');
    }

    onLeft();
  }

  return (
    <section
      className="system-page console-layer"
      data-layout={layout}
      data-leaving={isLeaving}
      onAnimationEnd={finishLeaving}
      aria-label={header.title}
    >
      <div className="system-page-panel" inert={isLeaving || isCovered}>
        <PageHeading header={header} />
        <div className="system-page-body">{children}</div>
        <ScreenFooter hints={hints} layout={layout} />
      </div>
    </section>
  );
}

function PageHeading({ header }: PageHeadingProps) {
  if (header.kind === 'glyph') {
    return (
      <header className="system-page-header">
        <span className="system-page-glyph" style={{ maskImage: `url(${header.glyphUrl})` }} aria-hidden="true" />
        <h1 className="system-page-title">{header.title}</h1>
      </header>
    );
  }

  return (
    <header className="system-page-header">
      <img className="system-page-picture" src={header.pictureUrl} alt="" draggable={false} />
      <div className="system-page-heading">
        <h1 className="system-page-title">{header.title}</h1>
        <p className="system-page-details">
          {header.details.map(function showDetail(detail) {
            return (
              <span key={detail} className="system-page-detail">
                {detail}
              </span>
            );
          })}
        </p>
      </div>
    </header>
  );
}
