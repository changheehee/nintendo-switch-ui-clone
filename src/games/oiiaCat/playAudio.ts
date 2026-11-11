export function playAudio(audio: HTMLAudioElement, soundName: string) {
  audio.play().catch(function reportPlaybackFailure(error: unknown) {
    if (isInterruptedByPause(error)) {
      return;
    }

    console.error(`소리를 재생하지 못했습니다: ${soundName}`, error);
  });
}

function isInterruptedByPause(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}
