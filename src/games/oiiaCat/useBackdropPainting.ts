import { useEffect } from 'react';
import type { RefObject } from 'react';
import { loadBackdropFont, paintBackdrop, readDrawingContext } from './oiiaBackdrop.ts';

export function useBackdropPainting(backdropRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(
    function paintBackdropWhenFontIsReady() {
      const context = readDrawingContext(backdropRef.current!);
      let isShown = true;

      function paintLoadedBackdrop() {
        if (isShown) {
          paintBackdrop(context);
        }
      }

      function reportFontFailure(error: unknown) {
        console.error('게임 제목 글꼴을 불러오지 못했습니다.', error);
      }

      function reportPaintFailure(error: unknown) {
        console.error('게임 배경을 그리지 못했습니다.', error);
      }

      loadBackdropFont().then(paintLoadedBackdrop, reportFontFailure).catch(reportPaintFailure);

      return function stopPainting() {
        isShown = false;
      };
    },
    [backdropRef],
  );
}
