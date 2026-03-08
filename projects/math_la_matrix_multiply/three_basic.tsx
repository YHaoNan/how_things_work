import {ThreadGenerator, all, tween, usePlayback, waitFor} from '@motion-canvas/core';
import * as THREE from 'three';
import {
  Axes3D,
  Curve3D,
  Line3D,
  Plane3D,
  Surface3D,
  Vector3D,
  createVector3D,
  morphVector3DAtOrigin,
} from '@src/common/component/3d/math';
import {Colors} from '@src/common/colors';
import {ThreeAnimLayer} from '@src/common/three/ThreeAnimLayer';

export class ThreeBasicLayer extends ThreeAnimLayer {
  private keyLight?: THREE.DirectionalLight;
  private fillLight?: THREE.DirectionalLight;

  private axes?: Axes3D;
  private plane?: Plane3D;
  private line?: Line3D;
  private vecA?: Vector3D;
  private vecB?: Vector3D;
  private vecBShifted?: Vector3D;
  private vecSum?: Vector3D;
  private dot?: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;
  private curve?: Curve3D;
  private surface?: Surface3D;

  protected override on_setup_scene(): void {
    this.scene.background = new THREE.Color(Colors.background);

    this.axes = new Axes3D({
      length: 4,
      colorX: Colors.red,
      colorY: Colors.green,
      colorZ: Colors.yellow,
      showGrid: true,
      gridSize: 12,
      gridDivisions: 12,
      gridPlanes: ['xz'],
      gridColorCenterLine: Colors.brown,
      gridColor: Colors.red,
      gridOpacity: 0.18,
    });
    this.scene.add(this.axes.object);

    this.plane = new Plane3D({
      size: 12,
      opacity: 0.08,
      color: Colors.yellow,
      normal: new THREE.Vector3(0, 1, 0),
      offset: 0,
      showGrid: false,
    });
    this.scene.add(this.plane.object);

    this.keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    this.keyLight.position.set(2, 2, 3);
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.DirectionalLight(0xffffff, 0.45);
    this.fillLight.position.set(-4, 2.5, -2);
    this.scene.add(this.fillLight);

    const ambient = new THREE.AmbientLight(0xffffff, 0.25);
    this.scene.add(ambient);

    this.line = new Line3D({
      start: new THREE.Vector3(-2.6, 0.02, -1.2),
      end: new THREE.Vector3(2.6, 0.02, 1.2),
      color: Colors.orange,
      opacity: 0.9,
      dashed: true,
      dashSize: 0.25,
      gapSize: 0.2,
    });
    this.scene.add(this.line.object);

    this.vecA = new Vector3D({
      from: new THREE.Vector3(0, 0.02, 0),
      to: new THREE.Vector3(2.0, 0.02, 0.9),
      color: Colors.green,
      emissive: Colors.green,
      emissiveIntensity: 0.65,
    });
    this.scene.add(this.vecA.object);

    this.vecB = new Vector3D({
      from: new THREE.Vector3(0, 0.02, 0),
      to: new THREE.Vector3(0.9, 0.02, 1.6),
      color: Colors.yellow,
      emissive: Colors.yellow,
      emissiveIntensity: 0.65,
    });
    this.scene.add(this.vecB.object);

    this.vecBShifted = new Vector3D({
      from: new THREE.Vector3(0, 0.02, 0),
      to: new THREE.Vector3(0, 0.02, 0),
      color: Colors.yellow,
      emissive: Colors.yellow,
      emissiveIntensity: 0.55,
      showTail: false,
    });
    this.scene.add(this.vecBShifted.object);

    this.vecSum = new Vector3D({
      from: new THREE.Vector3(0, 0.02, 0),
      to: new THREE.Vector3(0, 0.02, 0),
      color: Colors.orange,
      emissive: Colors.orange,
      emissiveIntensity: 0.8,
      showTail: true,
    });
    this.scene.add(this.vecSum.object);

    this.dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 16, 16),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(Colors.red),
        emissive: new THREE.Color(Colors.red),
        emissiveIntensity: 0.9,
        metalness: 0.05,
        roughness: 0.25,
      }),
    );
    this.scene.add(this.dot);

    this.curve = new Curve3D({
      tMin: 0,
      tMax: Math.PI * 4,
      segments: 220,
      color: Colors.red,
      opacity: 0.95,
      fn: (t) => [Math.cos(t) * 2.2, 0.2 + t * 0.12, Math.sin(t) * 2.2],
    });
    this.scene.add(this.curve.object);

    this.surface = new Surface3D({
      uMin: -Math.PI,
      uMax: Math.PI,
      vMin: -Math.PI,
      vMax: Math.PI,
      segmentsU: 64,
      segmentsV: 64,
      color: Colors.yellow,
      opacity: 0.14,
      wireframe: true,
      fn: (u, v) => [u * 1.2, 0.8 * Math.sin(u) * Math.cos(v), v * 1.2],
    });
    this.scene.add(this.surface.object);

    this.plane.object.visible = false;
    this.line.object.visible = false;
    this.vecA.object.visible = false;
    this.vecB.object.visible = false;
    this.vecBShifted.object.visible = false;
    this.vecSum.object.visible = false;
    this.dot.visible = false;
    this.curve.object.visible = false;
    this.surface.object.visible = false;
  }

  protected *on_play_3d(): ThreadGenerator {
    const playback = usePlayback();

    const keyLight = this.keyLight;
    const axes = this.axes;
    const plane = this.plane;
    const line = this.line;
    const vecA = this.vecA;
    const vecB = this.vecB;
    const vecBShifted = this.vecBShifted;
    const vecSum = this.vecSum;
    const dot = this.dot;
    const curve = this.curve;
    const surface = this.surface;

    if (!keyLight || !axes || !plane || !line || !vecA || !vecB || !vecBShifted || !vecSum || !dot || !curve || !surface) {
      yield;
      return;
    }

    const items = [plane.object, line.object, vecA.object, vecB.object, vecBShifted.object, vecSum.object, dot, curve.object, surface.object];
    const showOnly = (target: THREE.Object3D) => {
      axes.object.visible = true;
      for (const obj of items) obj.visible = obj === target;
    };

    const start = playback.time;
    const stage = 1.6;
    const settle = 0.25;

    const animateCamera = (t: number) => {
      const camR = 6.2;
      this.camera.position.set(Math.cos(t * 0.35) * camR, 3.1, Math.sin(t * 0.35) * camR);
      this.camera.lookAt(0, 0.8, 0);
      keyLight.position.set(Math.cos(t * 0.9) * 4, 3.5, Math.sin(t * 0.9) * 4);
      this.fillLight?.position.set(Math.cos(t * 0.7) * -4, 2.5, Math.sin(t * 0.7) * -2);
    };

    axes.object.visible = true;
    for (const obj of items) obj.visible = false;
    for (let t0 = playback.time; playback.time - t0 < stage; ) {
      const t = playback.time - start;
      animateCamera(t);
      yield;
    }
    yield* waitFor(settle);

    showOnly(plane.object);
    for (let t0 = playback.time; playback.time - t0 < stage; ) {
      const t = playback.time - start;
      animateCamera(t);
      yield;
    }
    yield* waitFor(settle);

    showOnly(line.object);
    for (let t0 = playback.time; playback.time - t0 < stage; ) {
      const t = playback.time - start;
      animateCamera(t);
      line.setStartEnd(
        new THREE.Vector3(-2.6, 0.02, -1.2),
        new THREE.Vector3(2.6, 0.02, 1.2 + Math.sin(t * 1.6) * 0.5),
      );
      yield;
    }
    yield* waitFor(settle);

    axes.object.visible = true;
    for (const obj of items) obj.visible = false;
    vecA.object.visible = true;
    vecB.object.visible = true;
    vecSum.object.visible = false;
    vecBShifted.object.visible = false;
    dot.visible = true;

    const cameraOrbit = function* (duration: number): ThreadGenerator {
      for (let t0 = playback.time; playback.time - t0 < duration; ) {
        const t = playback.time - start;
        animateCamera(t);
        yield;
      }
    };

    const o = new THREE.Vector3(0, 0.02, 0);
    const aTip = new THREE.Vector3(2.0, 0.02, 0.9);
    const bTip0 = new THREE.Vector3(0.9, 0.02, 1.6);
    const bTip1 = new THREE.Vector3(-0.6, 0.02, 2.0);

    vecA.setFromTo(o, o);
    vecB.setFromTo(o, o);
    vecBShifted.setFromTo(aTip, aTip);
    vecSum.setFromTo(o, o);
    dot.position.copy(o);

    const dCreateA = 0.45;
    const dCreateB = 0.45;
    const dMorph = 0.85;
    const dGap = 0.22;
    const dTravel = 0.75;
    const dEmit = 0.55;
    const dSum = 0.55;
    const dVector = dCreateA + dGap + dCreateB + dGap + dMorph + dGap + dTravel + dGap + dEmit + dGap + dSum;

    yield* all(
      cameraOrbit(dVector),
      (function* (): ThreadGenerator {
        yield* createVector3D(vecA, o, aTip, {duration: dCreateA});
        yield* waitFor(dGap);

        yield* createVector3D(vecB, o, bTip0, {duration: dCreateB});
        yield* waitFor(dGap);

        yield* morphVector3DAtOrigin(vecB, o, bTip0, bTip1, {duration: dMorph});
        yield* waitFor(dGap);

        yield* tween(dTravel, (value) => {
          const p = o.clone().lerp(aTip, value);
          dot.position.copy(p);
        });
        yield* waitFor(dGap);

        const bTip = bTip1.clone();
        vecBShifted.object.visible = true;
        yield* createVector3D(vecBShifted, aTip, aTip.clone().add(bTip.clone().sub(o)), {duration: dEmit});
        yield* waitFor(dGap);

        const sumTip = aTip.clone().add(bTip).sub(o);
        vecSum.object.visible = true;
        yield* createVector3D(vecSum, o, sumTip, {duration: dSum});
      })(),
    );
    yield* waitFor(settle);

    showOnly(curve.object);
    for (let t0 = playback.time; playback.time - t0 < stage; ) {
      const t = playback.time - start;
      animateCamera(t);
      curve.setFunction((tt) => [Math.cos(tt + t * 0.6) * 2.2, 0.2 + tt * 0.12, Math.sin(tt + t * 0.6) * 2.2]);
      yield;
    }
    yield* waitFor(settle);

    showOnly(surface.object);
    for (let t0 = playback.time; playback.time - t0 < stage; ) {
      const t = playback.time - start;
      animateCamera(t);
      surface.setFunction((u, v) => [u * 1.2, 0.8 * Math.sin(u + t * 0.9) * Math.cos(v + t * 0.6), v * 1.2]);
      yield;
    }

    for (const obj of items) obj.visible = false;
    yield* waitFor(0.5);
  }
}
