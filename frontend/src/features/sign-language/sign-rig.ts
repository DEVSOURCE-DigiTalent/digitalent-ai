import { Hand } from 'kalidokit';
import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import type { Landmark, MotionFrame } from './motion-format';

/**
 * Landmarks → bone rotations of a VRM avatar (three-vrm normalized bones, VRM 1 bone names).
 *
 * Signing depends on where the hands are, so arms are not guessed from angles: each arm bone is turned to point the
 * way the signer's bone points in MediaPipe's 3D world landmarks (shoulder → elbow → wrist), and the hand takes the
 * orientation of the signer's palm (wrist, index and little-finger knuckles). Only the finger curls come from Kalidokit.
 *
 * Space: rotations are in the VRM 0 convention, which three-vrm keeps for the normalized bones of a VRM 0 model
 * (model facing −Z, its right side +X, T-pose); the avatar converts them for a VRM 1 model (`toVrm1`). MediaPipe world
 * landmarks have x toward the image right (the signer's left), y down and z negative toward the camera, so a point
 * maps to (−x, −y, z): the avatar signs like the signer, not like a mirror. A source video that is itself mirrored
 * (`mirrored`) is flipped first.
 */

export type BonePose = Record<string, Quaternion>;

/** Left / right landmark pairs of MediaPipe Pose. */
const POSE_PAIRS: [number, number][] = [
  [1, 4], [2, 5], [3, 6], [7, 8], [9, 10], [11, 12], [13, 14], [15, 16], [17, 18], [19, 20], [21, 22],
  [23, 24], [25, 26], [27, 28], [29, 30], [31, 32],
];

/** Undoes a mirrored source video: x mirrored, left / right landmarks and hands swapped. */
export function flipFrame(frame: MotionFrame): MotionFrame {
  const flipPose = (points: Landmark[] | null, world: boolean) => {
    if (!points) return null;
    const out = points.map((p) => ({ x: world ? -p.x : 1 - p.x, y: p.y, z: p.z }));
    for (const [a, b] of POSE_PAIRS) [out[a], out[b]] = [out[b], out[a]];
    return out;
  };
  const flipHand = (points: Landmark[] | null) => (points ? points.map((p) => ({ x: -p.x, y: p.y, z: p.z })) : null);
  return {
    pose: flipPose(frame.pose, false),
    poseWorld: flipPose(frame.poseWorld, true),
    leftHand: flipHand(frame.rightHand),
    rightHand: flipHand(frame.leftHand),
  };
}

/** MediaPipe world point → avatar model space (VRM 0 convention). */
const toModel = (p: Landmark) => new Vector3(-p.x, -p.y, p.z);

/** A VRM 0 rotation for a VRM 1 model (facing +Z instead of −Z): a half turn about Y flips x and z. */
export function toVrm1(q: Quaternion): Quaternion {
  return new Quaternion(-q.x, q.y, -q.z, q.w);
}

type Side = 'left' | 'right';

/** T-pose of a VRM 0 model: arms out to the sides, palms down, thumbs forward (−Z). */
const REST_AXIS: Record<Side, Vector3> = { left: new Vector3(-1, 0, 0), right: new Vector3(1, 0, 0) };
const REST_ACROSS = new Vector3(0, 0, -1);
const ARM_POINTS: Record<Side, [number, number, number]> = { left: [11, 13, 15], right: [12, 14, 16] };

/** Rotation taking the rest basis (axis, across) to the target one; across is made perpendicular to axis. */
function basisRotation(restAxis: Vector3, restAcross: Vector3, axis: Vector3, across: Vector3): Quaternion | null {
  if (axis.lengthSq() < 1e-8) return null;
  const a = axis.clone().normalize();
  const c = across.clone().sub(a.clone().multiplyScalar(across.dot(a)));
  if (c.lengthSq() < 1e-8) return null;
  c.normalize();
  const rest = new Matrix4().makeBasis(restAxis, restAcross, restAxis.clone().cross(restAcross));
  const target = new Matrix4().makeBasis(a, c, a.clone().cross(c));
  return new Quaternion().setFromRotationMatrix(target.multiply(rest.transpose()));
}

/** Upper arm, lower arm and hand of one side: local rotations (the chest is kept still). */
function solveArm(side: Side, world: Landmark[], hand: Landmark[] | null, bones: BonePose) {
  const [s, e, w] = ARM_POINTS[side].map((i) => toModel(world[i]));
  const rest = REST_AXIS[side];
  const upperDir = e.clone().sub(s);
  const lowerDir = w.clone().sub(e);
  if (upperDir.lengthSq() < 1e-6 || lowerDir.lengthSq() < 1e-6) return;
  const upper = new Quaternion().setFromUnitVectors(rest, upperDir.normalize());
  const lowerLocalDir = lowerDir.normalize().applyQuaternion(upper.clone().invert());
  const lower = new Quaternion().setFromUnitVectors(rest, lowerLocalDir);
  bones[`${side}UpperArm`] = upper;
  bones[`${side}LowerArm`] = lower;

  if (!hand) return;
  // Palm: wrist → middle knuckle along the hand, little-finger → index knuckle across it (toward the thumb).
  const [wrist, index, middle, little] = [0, 5, 9, 17].map((i) => toModel(hand[i]));
  const handWorld = basisRotation(rest, REST_ACROSS, middle.sub(wrist), index.sub(little));
  if (!handWorld) return;
  const parentWorld = upper.clone().multiply(lower);
  bones[`${side}Hand`] = parentWorld.invert().multiply(handWorld);
}

interface Rotation { x: number; y: number; z: number; rotationOrder?: string }

/** Kalidokit finger names (VRM 0) → three-vrm VRM 1 names (the VRM 0 thumb chain starts one bone earlier). */
function vrmBoneName(kalidokitName: string): string {
  const name = kalidokitName.charAt(0).toLowerCase() + kalidokitName.slice(1);
  return name.replace('ThumbProximal', 'ThumbMetacarpal').replace('ThumbIntermediate', 'ThumbProximal');
}

/**
 * Finger curls from Kalidokit. It rigs as a mirror (selfie webcams), so the hand is given mirrored (x negated) under
 * the other side's name, which yields the signer's own side.
 */
function solveFingers(side: Side, hand: Landmark[], bones: BonePose) {
  const kalidokitSide = side === 'left' ? 'Left' : 'Right';
  const mirrored = hand.map((p) => ({ x: -p.x, y: p.y, z: p.z }));
  const solved = Hand.solve(mirrored as never, kalidokitSide) as Record<string, Rotation> | undefined;
  if (!solved) return;
  for (const [name, rotation] of Object.entries(solved)) {
    if (name.endsWith('Wrist')) continue;
    bones[vrmBoneName(name)] = new Quaternion().setFromEuler(new Euler(rotation.x, rotation.y, rotation.z, (rotation.rotationOrder ?? 'XYZ') as 'XYZ'));
  }
}

/** Bone rotations of one frame; bones the frame says nothing about are left out. */
export function solveFrame(frame: MotionFrame, mirrored: boolean): BonePose {
  const source = mirrored ? flipFrame(frame) : frame;
  const bones: BonePose = {};
  for (const side of ['left', 'right'] as Side[]) {
    const hand = side === 'left' ? source.leftHand : source.rightHand;
    if (source.poseWorld) solveArm(side, source.poseWorld, hand, bones);
    if (hand) solveFingers(side, hand, bones);
  }
  return bones;
}

/** Arms down, hands relaxed: the pose before, between and after signs (VRM 0 convention). */
export function restPose(): BonePose {
  return {
    leftUpperArm: new Quaternion().setFromEuler(new Euler(0, 0, 1.2)),
    rightUpperArm: new Quaternion().setFromEuler(new Euler(0, 0, -1.2)),
    leftLowerArm: new Quaternion().setFromEuler(new Euler(0, 0, 0.15)),
    rightLowerArm: new Quaternion().setFromEuler(new Euler(0, 0, -0.15)),
  };
}

export interface MotionClip {
  fps: number;
  durationMs: number;
  frames: BonePose[];
}

/**
 * Solves every frame once. A part MediaPipe missed holds its last seen rotation (the first seen one at the start),
 * then each bone is smoothed over time to calm the landmark jitter.
 */
export function buildClip(frames: MotionFrame[], fps: number, mirrored: boolean, smoothing = 0.45): MotionClip {
  const solved = frames.map((frame) => solveFrame(frame, mirrored));
  const names = new Set(solved.flatMap((pose) => Object.keys(pose)));
  const filled: BonePose[] = solved.map(() => ({}));
  for (const name of names) {
    let last = solved.find((pose) => pose[name])![name];
    let smooth: Quaternion | null = null;
    solved.forEach((pose, i) => {
      if (pose[name]) last = pose[name];
      smooth = smooth ? smooth.clone().slerp(last, 1 - smoothing) : last.clone();
      filled[i][name] = smooth;
    });
  }
  return { fps, durationMs: Math.round((frames.length * 1000) / fps), frames: filled };
}

/** The pose at `timeMs` of a clip, interpolated between its two nearest frames. */
export function sampleClip(clip: MotionClip, timeMs: number): BonePose {
  if (clip.frames.length === 0) return {};
  const position = Math.max(0, Math.min(clip.frames.length - 1, (timeMs * clip.fps) / 1000));
  const i = Math.floor(position);
  const t = position - i;
  const a = clip.frames[i];
  const b = clip.frames[Math.min(i + 1, clip.frames.length - 1)];
  const out: BonePose = {};
  for (const name of Object.keys(a)) out[name] = b[name] ? a[name].clone().slerp(b[name], t) : a[name].clone();
  return out;
}

/** Blend two poses (bones missing from one side come from the rest pose). */
export function blendPoses(from: BonePose, to: BonePose, t: number): BonePose {
  const rest = restPose();
  const names = new Set([...Object.keys(from), ...Object.keys(to)]);
  const out: BonePose = {};
  for (const name of names) {
    const a = from[name] ?? rest[name] ?? new Quaternion();
    const b = to[name] ?? rest[name] ?? new Quaternion();
    out[name] = a.clone().slerp(b, t);
  }
  return out;
}
