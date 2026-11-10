import { useState } from 'react';

type PageExit = {
  readonly isLeaving: boolean;
  readonly leave: () => void;
};

export function usePageExit(): PageExit {
  const [isLeaving, setIsLeaving] = useState(false);

  function leave() {
    setIsLeaving(true);
  }

  return { isLeaving, leave };
}
