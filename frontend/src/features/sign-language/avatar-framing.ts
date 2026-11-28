/**
 * Where the camera of the signing avatar stands (pure, no three.js).
 *
 * `preview`: the whole upper body with room around it (dictionary preview). `signing`: closer, from just above the head
 * to the hips and an arm's reach to each side — the signing space fills the opaque tile of a lesson video.
 * `corner-left` / `corner-right`: the transparent avatar standing in that bottom corner of the lesson video — the frame
 * bottom just under the hips (the video's bottom edge cuts the body there, like a presenter), the body near the side
 * edge, and invisible room above the head and toward the middle so a raised or outstretched hand is never cut in mid-air.
 */
export type Framing = 'preview' | 'signing' | 'corner-left' | 'corner-right';

/** Room around the corner avatar, in torso lengths (head bone − hips bone). */
export const CORNER_FRAMING = {
  /** Under the hips bone, down to the frame's bottom edge. */
  below: 0.1,
  /** Above the head bone (the hair ends about 0.5 above it): the rest is for raised hands. */
  above: 0.95,
  /** From the body's middle to the side edge of the video (the signer's dominant hand reaches there). */
  edgeRoom: 0.8,
  /** At least this much from the body's middle toward the middle of the video: an arm stretched out sideways fits. */
  farRoom: 1.3,
} as const;

export interface CameraPlacement {
  /** Where the camera stands; it looks straight ahead (−z), at the same x and y. */
  x: number;
  y: number;
  z: number;
}

/**
 * Camera of a framing, from the heights of the avatar's head and hips bones (the model faces the camera, centred on
 * x = 0), the picture's aspect (width / height) and the vertical field of view.
 */
export function cameraFor(framing: Framing, headY: number, hipsY: number, aspect: number, fovDeg: number): CameraPlacement {
  const torso = headY - hipsY;
  const tan = Math.tan((fovDeg * Math.PI) / 360);
  const ratio = Math.max(aspect, 0.1);
  if (framing === 'corner-left' || framing === 'corner-right') {
    const bottom = hipsY - torso * CORNER_FRAMING.below;
    const height = Math.max(
      torso * (1 + CORNER_FRAMING.below + CORNER_FRAMING.above),
      (torso * (CORNER_FRAMING.edgeRoom + CORNER_FRAMING.farRoom)) / ratio,
    );
    // The body's middle sits edgeRoom from the side edge: the camera moves toward the middle of the picture.
    const shift = (height * ratio) / 2 - torso * CORNER_FRAMING.edgeRoom;
    return { x: framing === 'corner-left' ? shift : -shift, y: bottom + height / 2, z: height / 2 / tan };
  }

  const signing = framing === 'signing';
  const top = headY + torso * 0.45;
  const bottom = hipsY - torso * 0.12;
  const centreY = signing ? (top + bottom) / 2 : (headY + hipsY) / 2 + 0.1;
  const heightSpan = signing ? top - bottom : torso * 2.05;
  // Hands reach about an arm's length to each side of the chest.
  const widthSpan = torso * (signing ? 1.8 : 2.4);
  return { x: 0, y: centreY, z: Math.max(heightSpan / 2, widthSpan / 2 / ratio) / tan };
}
