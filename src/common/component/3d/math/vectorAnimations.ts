import {ThreadGenerator, easeInOutCubic, easeOutCubic, tween} from '@motion-canvas/core';
import * as THREE from 'three';
import {Vector3D} from './Vector3D';

export interface VectorAnimationOptions {
  duration?: number;
  easing?: (t: number) => number;
}

function toVec3(v: THREE.Vector3 | [number, number, number]) {
  return Array.isArray(v) ? new THREE.Vector3(v[0], v[1], v[2]) : v;
}

export function* createVector3D(vector: Vector3D, from: THREE.Vector3 | [number, number, number], to: THREE.Vector3 | [number, number, number], options: VectorAnimationOptions = {}): ThreadGenerator {
  const duration = options.duration ?? 0.6;
  const easing = options.easing ?? easeOutCubic;

  const a = toVec3(from).clone();
  const b = toVec3(to).clone();
  const dir = b.clone().sub(a);
  const len = dir.length();
  const safeDir = len > 0 ? dir.clone().divideScalar(len) : new THREE.Vector3(1, 0, 0);

  vector.setFromTo(a, a);

  yield* tween(duration, (value) => {
    const t = easing(value);
    vector.setFromTo(a, a.clone().add(safeDir.clone().multiplyScalar(len * t)));
  });
}

export function* moveVector3D(
  vector: Vector3D,
  startFrom: THREE.Vector3 | [number, number, number],
  startTo: THREE.Vector3 | [number, number, number],
  endFrom: THREE.Vector3 | [number, number, number],
  endTo: THREE.Vector3 | [number, number, number],
  options: VectorAnimationOptions = {},
): ThreadGenerator {
  const duration = options.duration ?? 0.8;
  const easing = options.easing ?? easeInOutCubic;

  const a0 = toVec3(startFrom).clone();
  const b0 = toVec3(startTo).clone();
  const a1 = toVec3(endFrom).clone();
  const b1 = toVec3(endTo).clone();

  yield* tween(duration, (value) => {
    const t = easing(value);
    const a = a0.clone().lerp(a1, t);
    const b = b0.clone().lerp(b1, t);
    vector.setFromTo(a, b);
  });
}

export function* morphVector3DAtOrigin(
  vector: Vector3D,
  origin: THREE.Vector3 | [number, number, number],
  startTip: THREE.Vector3 | [number, number, number],
  endTip: THREE.Vector3 | [number, number, number],
  options: VectorAnimationOptions = {},
): ThreadGenerator {
  const duration = options.duration ?? 0.9;
  const easing = options.easing ?? easeInOutCubic;

  const o = toVec3(origin).clone();
  const p0 = toVec3(startTip).clone();
  const p1 = toVec3(endTip).clone();

  const v0 = p0.clone().sub(o);
  const v1 = p1.clone().sub(o);

  const len0 = v0.length();
  const len1 = v1.length();

  const up = new THREE.Vector3(0, 1, 0);
  const dir0 = len0 > 0 ? v0.clone().divideScalar(len0) : new THREE.Vector3(1, 0, 0);
  const dir1 = len1 > 0 ? v1.clone().divideScalar(len1) : new THREE.Vector3(1, 0, 0);

  const q0 = new THREE.Quaternion().setFromUnitVectors(up, dir0);
  const q1 = new THREE.Quaternion().setFromUnitVectors(up, dir1);

  yield* tween(duration, (value) => {
    const t = easing(value);
    const q = q0.clone().slerp(q1, t);
    const dir = up.clone().applyQuaternion(q).normalize();
    const len = len0 + (len1 - len0) * t;
    vector.setFromTo(o, o.clone().add(dir.multiplyScalar(len)));
  });
}

