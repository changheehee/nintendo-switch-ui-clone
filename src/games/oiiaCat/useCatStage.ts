import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import {
  AnimationMixer,
  Box3,
  DirectionalLight,
  HemisphereLight,
  LoopOnce,
  MathUtils,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import type { AnimationAction, Object3D } from 'three';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { catModelLoading } from './catModel.ts';

export type CatStage = {
  readonly drawFrameOnto: (context: CanvasRenderingContext2D) => void;
};

type CatStageControls = {
  readonly requestSpin: (spinNumber: number) => void;
  readonly pause: () => void;
  readonly resume: () => void;
  readonly drawFrameOnto: (context: CanvasRenderingContext2D) => void;
  readonly release: () => void;
};

type LoadedCat = {
  readonly mixer: AnimationMixer;
  readonly spinAction: AnimationAction;
};

type CatPlayback = {
  loadedCat: LoadedCat | null;
  requestedSpinNumber: number;
  playedSpinNumber: number;
  lastFrameTime: DOMHighResTimeStamp | null;
};

const FIELD_OF_VIEW_DEGREES = 30;
const PLACEHOLDER_ASPECT_RATIO = 1;
const CAMERA_NEAR_DISTANCE = 0.1;
const CAMERA_FAR_DISTANCE = 5000;
const SPIN_REPETITIONS = 1;
const MILLISECONDS_PER_SECOND = 1000;
const TRANSPARENT_ALPHA = 0;
const FRAMING_MARGIN = 1.9;
const CAMERA_LIFT_RATIO = 0.16;
const MAX_PIXEL_RATIO = 1.5;
const SKY_LIGHT_COLOR = 0xffffff;
const GROUND_LIGHT_COLOR = 0xdfe3ea;
const SKY_LIGHT_INTENSITY = 2.2;
const KEY_LIGHT_COLOR = 0xffffff;
const KEY_LIGHT_INTENSITY = 1.8;
const KEY_LIGHT_POSITION = new Vector3(3, 5, 4);

export function useCatStage(stageRef: RefObject<HTMLDivElement | null>, spinNumber: number, isSuspended: boolean): CatStage {
  const controlsRef = useRef<CatStageControls | null>(null);

  useEffect(
    function showCat() {
      const catStage = createCatStage(stageRef.current!);
      controlsRef.current = catStage;

      return function removeCat() {
        controlsRef.current = null;
        catStage.release();
      };
    },
    [stageRef],
  );

  useEffect(
    function spinWhenAsked() {
      controlsRef.current!.requestSpin(spinNumber);
    },
    [spinNumber],
  );

  useEffect(
    function freezeWhileSuspended() {
      if (isSuspended) {
        controlsRef.current!.pause();
        return;
      }

      controlsRef.current!.resume();
    },
    [isSuspended],
  );

  function drawFrameOnto(context: CanvasRenderingContext2D) {
    controlsRef.current!.drawFrameOnto(context);
  }

  return { drawFrameOnto };
}

function createCatStage(stage: HTMLDivElement): CatStageControls {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  const scene = new Scene();
  const camera = new PerspectiveCamera(FIELD_OF_VIEW_DEGREES, PLACEHOLDER_ASPECT_RATIO, CAMERA_NEAR_DISTANCE, CAMERA_FAR_DISTANCE);
  const resizeObserver = new ResizeObserver(fitToStage);
  const playback: CatPlayback = { loadedCat: null, requestedSpinNumber: 0, playedSpinNumber: 0, lastFrameTime: null };
  const shouldAnimate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isShown = true;

  function placeCat(gltf: GLTF) {
    if (!isShown) {
      return;
    }

    const [spinClip] = gltf.animations;

    if (spinClip === undefined) {
      throw new Error('고양이 모델에 회전 애니메이션이 없습니다.');
    }

    const cat = gltf.scene.clone(true);
    const mixer = new AnimationMixer(cat);
    frameModel(cat, camera);
    scene.add(cat);
    playback.loadedCat = { mixer, spinAction: mixer.clipAction(spinClip).setLoop(LoopOnce, SPIN_REPETITIONS) };
    renderer.render(scene, camera);
  }

  function startRequestedSpin(spinAction: AnimationAction) {
    if (playback.playedSpinNumber === playback.requestedSpinNumber) {
      return;
    }

    playback.playedSpinNumber = playback.requestedSpinNumber;
    spinAction.reset().play();
  }

  function drawFrame(time: DOMHighResTimeStamp) {
    const elapsedSeconds = playback.lastFrameTime === null ? 0 : (time - playback.lastFrameTime) / MILLISECONDS_PER_SECOND;
    playback.lastFrameTime = time;

    if (shouldAnimate && playback.loadedCat !== null) {
      startRequestedSpin(playback.loadedCat.spinAction);
      playback.loadedCat.mixer.update(elapsedSeconds);
    }

    renderer.render(scene, camera);
  }

  function fitToStage() {
    renderer.setSize(stage.clientWidth, stage.clientHeight, false);
    camera.aspect = stage.clientWidth / stage.clientHeight;
    camera.updateProjectionMatrix();
  }

  function reportLoadFailure(error: unknown) {
    console.error('고양이 3D 모델을 불러오지 못했습니다.', error);
  }

  function reportPlacementFailure(error: unknown) {
    console.error('고양이 모델을 무대에 올리지 못했습니다.', error);
  }

  function requestSpin(requestedSpinNumber: number) {
    playback.requestedSpinNumber = requestedSpinNumber;
  }

  function pause() {
    renderer.setAnimationLoop(null);
  }

  function resume() {
    playback.lastFrameTime = null;
    renderer.setAnimationLoop(drawFrame);
  }

  function drawFrameOnto(context: CanvasRenderingContext2D) {
    context.drawImage(renderer.domElement, 0, 0, context.canvas.width, context.canvas.height);
  }

  function release() {
    isShown = false;
    renderer.setAnimationLoop(null);
    resizeObserver.disconnect();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
  renderer.setClearColor(0x000000, TRANSPARENT_ALPHA);
  stage.append(renderer.domElement);
  addLights(scene);
  fitToStage();
  resizeObserver.observe(stage);
  catModelLoading.then(placeCat, reportLoadFailure).catch(reportPlacementFailure);

  return { requestSpin, pause, resume, drawFrameOnto, release };
}

function addLights(scene: Scene) {
  const keyLight = new DirectionalLight(KEY_LIGHT_COLOR, KEY_LIGHT_INTENSITY);
  keyLight.position.copy(KEY_LIGHT_POSITION);
  scene.add(new HemisphereLight(SKY_LIGHT_COLOR, GROUND_LIGHT_COLOR, SKY_LIGHT_INTENSITY), keyLight);
}

function frameModel(model: Object3D, camera: PerspectiveCamera) {
  const bounds = new Box3().setFromObject(model, true);
  const size = bounds.getSize(new Vector3());
  const visibleHeight = size.y * FRAMING_MARGIN;
  const distance = visibleHeight / (2 * Math.tan(MathUtils.degToRad(FIELD_OF_VIEW_DEGREES / 2)));

  model.position.sub(bounds.getCenter(new Vector3()));
  camera.position.set(0, size.y * CAMERA_LIFT_RATIO, distance + size.z / 2);
  camera.lookAt(0, 0, 0);
}
