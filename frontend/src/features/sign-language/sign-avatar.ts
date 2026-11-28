import {
  Clock,
  Color,
  DirectionalLight,
  HemisphereLight,
  PerspectiveCamera,
  Quaternion,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils, type VRM, type VRMHumanBoneName } from '@pixiv/three-vrm';
import { restPose, toVrm1, type BonePose } from './sign-rig';
import { cameraFor, type Framing } from './avatar-framing';

/**
 * The 3D signing avatar: a VRM model in a small three.js scene framed on the signing space (head to waist). This
 * module pulls in three.js, so it is only loaded when a sign view is opened. Model: "Business_Male_02" of the
 * Microsoft Rocketbox library, MIT, converted to VRM 0.x (public/avatars/README.md); any VRM with finger bones works.
 */
export const DEFAULT_AVATAR_URL = '/avatars/business-male-02.vrm';

export interface SignAvatar {
  /** Pose for the next frames (bones not given go back to the rest pose). */
  setPose(pose: BonePose): void;
  /** Called every animation frame with the elapsed time (ms) — the caller samples its clips there. */
  onFrame(callback: ((deltaMs: number) => void) | null): void;
  resize(width: number, height: number): void;
  dispose(): void;
}

/** Bones a sign may move: those not in the next pose return to rest (identity) instead of keeping a stale angle. */
const TRACKED_BONES = [
  'spine', 'chest',
  'leftUpperArm', 'leftLowerArm', 'leftHand', 'rightUpperArm', 'rightLowerArm', 'rightHand',
  ...['left', 'right'].flatMap((side) => ['Thumb', 'Index', 'Middle', 'Ring', 'Little'].flatMap((finger) =>
    (finger === 'Thumb' ? ['Metacarpal', 'Proximal', 'Distal'] : ['Proximal', 'Intermediate', 'Distal']).map((joint) => `${side}${finger}${joint}`))),
];

interface AvatarScene {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  vrm: VRM;
  /** Camera on the signing space for the current aspect. */
  frame: () => void;
  /** Writes a pose on the bones (VRM 0 convention in, converted for a VRM 1 model). */
  apply: (pose: BonePose) => void;
}

/** Bytes of the model file downloaded so far, of its total (0 when the server does not say). */
export type AvatarLoadProgress = (loaded: number, total: number) => void;

async function loadAvatarScene(canvas: HTMLCanvasElement, url: string, options: { alpha: boolean; pixelRatio: number; framing?: Framing; onProgress?: AvatarLoadProgress }): Promise<AvatarScene> {
  const renderer = new WebGLRenderer({ canvas, alpha: options.alpha, antialias: true, preserveDrawingBuffer: true });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setPixelRatio(options.pixelRatio);
  const scene = new Scene();
  const camera = new PerspectiveCamera(26, 1, 0.1, 20);
  // Studio lighting for a lifelike (PBR) model: soft sky/ground fill, a warm key light from the upper left that models
  // the face, a cool fill from the right so no side goes dark, and a rim light from behind that lifts the outline off
  // the background (and off the lesson video under the transparent track).
  scene.add(new HemisphereLight(0xffffff, 0xb9c3cf, 1.1));
  const key = new DirectionalLight(0xfff4e8, 2.2);
  key.position.set(-1.2, 2.2, 2.4);
  const fill = new DirectionalLight(0xe8f0ff, 0.8);
  fill.position.set(1.6, 1, 1.8);
  const rim = new DirectionalLight(0xffffff, 1.4);
  rim.position.set(0.6, 2, -2.5);
  scene.add(key, fill, rim);

  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  const gltf = await loader.loadAsync(url, (event) => options.onProgress?.(event.loaded, event.lengthComputable ? event.total : 0));
  const vrm = gltf.userData.vrm as VRM;
  VRMUtils.removeUnnecessaryVertices(gltf.scene);
  VRMUtils.combineSkeletons(gltf.scene);
  VRMUtils.rotateVRM0(vrm);
  vrm.scene.traverse((object) => { object.frustumCulled = false; });
  scene.add(vrm.scene);

  // Frame the signing space from the heights of the head and hips bones (see cameraFor).
  const head = vrm.humanoid.getNormalizedBoneNode('head');
  const hips = vrm.humanoid.getNormalizedBoneNode('hips');
  vrm.scene.updateMatrixWorld(true);
  const headY = head ? head.getWorldPosition(new Vector3()).y : 1.5;
  const hipsY = hips ? hips.getWorldPosition(new Vector3()).y : 0.9;
  const frame = () => {
    const { x, y, z } = cameraFor(options.framing ?? 'preview', headY, hipsY, camera.aspect, camera.fov);
    camera.position.set(x, y, z);
    camera.lookAt(x, y, 0);
  };
  frame();

  const rest = restPose();
  const identity = new Quaternion();
  // Rotations come in the VRM 0 convention (Kalidokit); a VRM 1 model faces the other way.
  const isVrm0 = vrm.meta?.metaVersion === '0';
  const apply = (pose: BonePose) => {
    for (const name of new Set([...Object.keys(rest), ...Object.keys(pose), ...TRACKED_BONES])) {
      const node = vrm.humanoid.getNormalizedBoneNode(name as VRMHumanBoneName);
      if (!node) continue;
      const q = pose[name] ?? rest[name] ?? identity;
      node.quaternion.copy(isVrm0 ? q : toVrm1(q));
    }
  };

  return { renderer, scene, camera, vrm, frame, apply };
}

/** The avatar animated live (dictionary preview): renders on every animation frame. */
export async function createSignAvatar(canvas: HTMLCanvasElement, url = DEFAULT_AVATAR_URL, onProgress?: AvatarLoadProgress): Promise<SignAvatar> {
  const { renderer, scene, camera, vrm, frame, apply } = await loadAvatarScene(canvas, url, {
    onProgress,
    alpha: true, pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
  });
  let target: BonePose = restPose();
  let frameCallback: ((deltaMs: number) => void) | null = null;
  const clock = new Clock();
  let running = true;

  const loop = () => {
    if (!running) return;
    const delta = clock.getDelta();
    frameCallback?.(delta * 1000);
    apply(target);
    vrm.update(delta);
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  return {
    setPose(pose) {
      target = pose;
    },
    onFrame(callback) {
      frameCallback = callback;
    },
    resize(width, height) {
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
      frame();
    },
    dispose() {
      running = false;
      VRMUtils.deepDispose(vrm.scene);
      renderer.dispose();
    },
  };
}

export interface AvatarFrameRenderer {
  /** Draws one frame: the pose, the eyelids (0–1) and the time step of the hair and clothes (seconds). */
  render(pose: BonePose, blink: number, stepSeconds: number): void;
  dispose(): void;
}

/**
 * The avatar drawn frame by frame at a fixed size (the video track of the sign-language video): no animation loop, the
 * caller decides the time of every frame, so the track sits exactly on the lesson's frame grid. On an opaque background,
 * or — `transparent` — on nothing (alpha 0 around the avatar), framed to stand in the bottom corner on `side`.
 */
export async function createAvatarFrameRenderer(
  canvas: HTMLCanvasElement,
  options: { width: number; height: number; background: string; transparent?: boolean; side?: 'LEFT' | 'RIGHT'; url?: string; onProgress?: AvatarLoadProgress },
): Promise<AvatarFrameRenderer> {
  canvas.width = options.width;
  canvas.height = options.height;
  const transparent = options.transparent === true;
  const { renderer, scene, camera, vrm, frame, apply } = await loadAvatarScene(canvas, options.url ?? DEFAULT_AVATAR_URL, {
    onProgress: options.onProgress,
    alpha: transparent, pixelRatio: 1, framing: transparent ? (options.side === 'RIGHT' ? 'corner-right' : 'corner-left') : 'signing',
  });
  renderer.setSize(options.width, options.height, false);
  if (transparent) renderer.setClearColor(0x000000, 0);
  else scene.background = new Color(options.background);
  camera.aspect = options.width / Math.max(1, options.height);
  camera.updateProjectionMatrix();
  frame();
  const blinkName = vrm.expressionManager?.getExpression('blink') ? 'blink' : null;

  return {
    render(pose, blink, stepSeconds) {
      apply(pose);
      if (blinkName) vrm.expressionManager?.setValue(blinkName, blink);
      vrm.update(stepSeconds);
      renderer.render(scene, camera);
    },
    dispose() {
      VRMUtils.deepDispose(vrm.scene);
      renderer.dispose();
    },
  };
}
