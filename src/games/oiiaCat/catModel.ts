import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';
import catModelUrl from './oiiaCat.glb?url';

export const catModelLoading: Promise<GLTF> = new GLTFLoader().loadAsync(catModelUrl);
