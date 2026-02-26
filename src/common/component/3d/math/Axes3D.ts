import * as THREE from 'three';

export interface Axes3DOptions {
  length?: number;
  headLength?: number;
  headWidth?: number;
  origin?: THREE.Vector3;
  colorX?: THREE.ColorRepresentation;
  colorY?: THREE.ColorRepresentation;
  colorZ?: THREE.ColorRepresentation;
  showGrid?: boolean;
  gridSize?: number;
  gridDivisions?: number;
  gridPlanes?: Array<'xy' | 'xz' | 'yz'>;
  gridColorCenterLine?: THREE.ColorRepresentation;
  gridColor?: THREE.ColorRepresentation;
  gridOpacity?: number;
}

export class Axes3D {
  public readonly object: THREE.Group;

  private readonly x: THREE.ArrowHelper;
  private readonly y: THREE.ArrowHelper;
  private readonly z: THREE.ArrowHelper;
  private grid?: THREE.Group;

  private length: number;
  private headLength: number;
  private headWidth: number;

  constructor(options: Axes3DOptions = {}) {
    const {
      length = 4,
      headLength = Math.max(0.12, length * 0.08),
      headWidth = Math.max(0.08, length * 0.04),
      origin = new THREE.Vector3(0, 0, 0),
      colorX = 0xef4444,
      colorY = 0x22c55e,
      colorZ = 0x3b82f6,
      showGrid = false,
      gridSize = length * 3,
      gridDivisions = 12,
      gridPlanes = ['xz'],
      gridColorCenterLine = 0x475569,
      gridColor = 0x1f2937,
      gridOpacity = 0.28,
    } = options;

    this.length = length;
    this.headLength = headLength;
    this.headWidth = headWidth;

    this.object = new THREE.Group();

    this.x = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, length, colorX, headLength, headWidth);
    this.y = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), origin, length, colorY, headLength, headWidth);
    this.z = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), origin, length, colorZ, headLength, headWidth);

    this.object.add(this.x);
    this.object.add(this.y);
    this.object.add(this.z);

    if (showGrid) {
      this.setGrid({
        enabled: true,
        size: gridSize,
        divisions: gridDivisions,
        planes: gridPlanes,
        colorCenterLine: gridColorCenterLine,
        color: gridColor,
        opacity: gridOpacity,
      });
    }
  }

  public setOrigin(origin: THREE.Vector3) {
    this.x.position.copy(origin);
    this.y.position.copy(origin);
    this.z.position.copy(origin);
    this.grid?.position.copy(origin);
  }

  public setLength(length: number, headLength?: number, headWidth?: number) {
    this.length = length;
    this.headLength = headLength ?? Math.max(0.12, length * 0.08);
    this.headWidth = headWidth ?? Math.max(0.08, length * 0.04);

    this.x.setLength(this.length, this.headLength, this.headWidth);
    this.y.setLength(this.length, this.headLength, this.headWidth);
    this.z.setLength(this.length, this.headLength, this.headWidth);
  }

  public setGrid(options: {
    enabled: boolean;
    size?: number;
    divisions?: number;
    planes?: Array<'xy' | 'xz' | 'yz'>;
    colorCenterLine?: THREE.ColorRepresentation;
    color?: THREE.ColorRepresentation;
    opacity?: number;
  }) {
    if (!options.enabled) {
      if (this.grid) {
        this.object.remove(this.grid);
        this.grid = undefined;
      }
      return;
    }

    const size = options.size ?? this.length * 3;
    const divisions = options.divisions ?? 12;
    const planes = options.planes ?? ['xz'];
    const colorCenterLine = options.colorCenterLine ?? 0x475569;
    const color = options.color ?? 0x1f2937;
    const opacity = options.opacity ?? 0.28;

    if (this.grid) {
      this.object.remove(this.grid);
    }

    const gridGroup = new THREE.Group();

    const makeGrid = () => {
      const g = new THREE.GridHelper(size, divisions, colorCenterLine, color);
      const material = g.material as THREE.Material | THREE.Material[];
      const apply = (m: THREE.Material) => {
        (m as any).transparent = true;
        (m as any).opacity = opacity;
        (m as any).depthWrite = false;
        (m as any).needsUpdate = true;
      };
      if (Array.isArray(material)) {
        for (const m of material) apply(m);
      } else {
        apply(material);
      }
      return g;
    };

    for (const plane of planes) {
      const g = makeGrid();
      if (plane === 'xz') {
        g.rotation.x = 0;
      } else if (plane === 'xy') {
        g.rotation.x = Math.PI / 2;
      } else if (plane === 'yz') {
        g.rotation.z = Math.PI / 2;
      }
      gridGroup.add(g);
    }

    gridGroup.position.copy(this.x.position);
    this.grid = gridGroup;
    this.object.add(gridGroup);
  }
}
