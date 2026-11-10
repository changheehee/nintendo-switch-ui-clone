import 'react';

declare module 'react' {
  interface CSSProperties {
    readonly '--album-scrolled-rows'?: number;
    readonly '--album-columns'?: number;
    readonly '--logo-letter-index'?: number;
    readonly '--battery-level-ratio'?: number;
  }
}
