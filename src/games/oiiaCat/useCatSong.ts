import { useEffect, useRef } from 'react';
import { playAudio } from './playAudio.ts';
import oiiaSongUrl from './oiiaSong.mp3';

type CatSong = {
  readonly singAfterDelay: () => void;
  readonly pause: () => void;
  readonly resume: () => void;
  readonly release: () => void;
};

const SONG_VOLUME = 0.6;
const SONG_DELAY_MILLISECONDS = 600;
const SONG_NAME = '고양이 노래';

export function useCatSong(spinNumber: number, isSuspended: boolean) {
  const songRef = useRef<CatSong | null>(null);

  useEffect(function prepareSong() {
    const song = createCatSong();
    songRef.current = song;

    return function releaseSong() {
      songRef.current = null;
      song.release();
    };
  }, []);

  useEffect(
    function singForEverySpin() {
      songRef.current!.singAfterDelay();
    },
    [spinNumber],
  );

  useEffect(
    function freezeWhileSuspended() {
      if (isSuspended) {
        songRef.current!.pause();
        return;
      }

      songRef.current!.resume();
    },
    [isSuspended],
  );
}

function createCatSong(): CatSong {
  const audio = new Audio(oiiaSongUrl);
  let startTimerId: number | null = null;
  let isStartWaiting = false;
  let isPaused = false;

  audio.volume = SONG_VOLUME;

  function startFromBeginning() {
    startTimerId = null;
    isStartWaiting = false;
    audio.currentTime = 0;
    playAudio(audio, SONG_NAME);
  }

  function waitForStart() {
    startTimerId = window.setTimeout(startFromBeginning, SONG_DELAY_MILLISECONDS);
  }

  function cancelWaitingStart() {
    if (startTimerId !== null) {
      window.clearTimeout(startTimerId);
      startTimerId = null;
    }
  }

  function singAfterDelay() {
    cancelWaitingStart();
    audio.pause();
    isStartWaiting = true;

    if (!isPaused) {
      waitForStart();
    }
  }

  function pause() {
    isPaused = true;
    cancelWaitingStart();
    audio.pause();
  }

  function resume() {
    if (!isPaused) {
      return;
    }

    isPaused = false;

    if (isStartWaiting) {
      waitForStart();
      return;
    }

    const wasInterrupted = audio.currentTime > 0 && !audio.ended;

    if (wasInterrupted) {
      playAudio(audio, SONG_NAME);
    }
  }

  function release() {
    cancelWaitingStart();
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
  }

  return { singAfterDelay, pause, resume, release };
}
