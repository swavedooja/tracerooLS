import { Component, ElementRef, Input, OnChanges, OnInit, ViewChild, AfterViewInit, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const COLORS: any = {
  Box: { base: 0x4fc3f7, top: 0x0288d1 },
  Carton: { base: 0xffb74d, top: 0xf57c00 },
  Bottle: { base: 0x81c784, top: 0x388e3c },
  Pallet: { base: 0x8d6e63, top: 0x5d4037 },
};

export interface PackagingLevel {
  levelIndex: number;
  levelName: string;
  containedQuantity: number;
  shapeType: 'Box' | 'Carton' | 'Bottle' | 'Pallet';
}

@Component({
  selector: 'app-packaging-threed-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './packaging-threed-view.component.html',
  styleUrl: './packaging-threed-view.component.scss'
})
export class PackagingThreedViewComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef;
  @Input() levels: PackagingLevel[] = [];

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private frameId: number | null = null;
  private shapesGroup!: THREE.Group;

  constructor() {}

  ngAfterViewInit() {
    this.initScene();
    this.animate();
    if (this.levels.length > 0) {
      this.updateScene();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.scene && changes['levels']) {
      this.updateScene();
    }
  }

  ngOnDestroy() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initScene() {
    const container = this.rendererContainer.nativeElement;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 400;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf8fafc);

    // Camera
    this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    this.camera.position.set(0, 1.5, 7);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 15;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);

    const sun = new THREE.SpotLight(0xffffff, 1);
    sun.position.set(10, 10, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    this.scene.add(sun);

    const fill = new THREE.PointLight(0xffffff, 0.4);
    fill.position.set(-10, -10, -10);
    this.scene.add(fill);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(50, 50);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, transparent: true, opacity: 0.5 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.5;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Group for shapes
    this.shapesGroup = new THREE.Group();
    this.scene.add(this.shapesGroup);

    // Resize Handling
    window.addEventListener('resize', this.onResize.bind(this));
  }

  private onResize() {
    if (!this.rendererContainer) return;
    const container = this.rendererContainer.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private updateScene() {
    // Clear old shapes
    while (this.shapesGroup.children.length > 0) {
      this.shapesGroup.remove(this.shapesGroup.children[0]);
    }

    const horizontalSpacing = 2.8;
    const startX = -((this.levels.length - 1) * horizontalSpacing) / 2;

    this.levels.forEach((lvl, idx) => {
      const x = startX + idx * horizontalSpacing;
      const group = this.createLevelGroup(lvl);
      group.position.set(x, 0, 0);
      this.shapesGroup.add(group);

      // Add Connector to next level
      if (idx < this.levels.length - 1) {
        const connector = this.createConnector(x + 0.6, x + horizontalSpacing - 0.6);
        this.shapesGroup.add(connector);
      }
    });

    // Reset controls look at
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  private createLevelGroup(lvl: PackagingLevel): THREE.Group {
    const group = new THREE.Group();
    const type = lvl.shapeType || 'Box';
    const color = COLORS[type]?.base || 0x4fc3f7;

    let mainMesh: THREE.Object3D;
    const scale = type === 'Pallet' ? 1.3 : (type === 'Bottle' ? 0.85 : 1.0);

    switch (type) {
      case 'Bottle':
        mainMesh = this.createBottle(scale, color);
        break;
      case 'Pallet':
        mainMesh = this.createPallet(scale, color);
        break;
      case 'Carton':
        mainMesh = this.createBox(scale, 1.2, 0.8, color); // Flat box
        break;
      case 'Box':
      default:
        mainMesh = this.createBox(scale, 1, 1, color);
        break;
    }

    mainMesh.castShadow = true;
    group.add(mainMesh);

    return group;
  }

  private createBox(s: number, w: number, d: number, color: number): THREE.Mesh {
    const geo = new THREE.BoxGeometry(s * w, s * 0.8, s * d);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.1 });
    return new THREE.Mesh(geo, mat);
  }

  private createBottle(s: number, color: number): THREE.Group {
    const group = new THREE.Group();
    // Body
    const bodyGeo = new THREE.CylinderGeometry(s * 0.25, s * 0.3, s * 1, 32);
    const bodyMat = new THREE.MeshPhysicalMaterial({ color, transmission: 0.2, thickness: 0.5, roughness: 0.1 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = -0.1;
    body.castShadow = true;
    group.add(body);

    // Cap
    const capGeo = new THREE.CylinderGeometry(s * 0.15, s * 0.15, s * 0.2, 16);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = s * 0.5;
    cap.castShadow = true;
    group.add(cap);

    return group;
  }

  private createPallet(s: number, color: number): THREE.Group {
    const group = new THREE.Group();
    // Base
    const baseGeo = new THREE.BoxGeometry(s * 1.4, s * 0.12, s * 1.1);
    const baseMat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -0.4;
    base.castShadow = true;
    group.add(base);

    // Slats
    const slatGeo = new THREE.BoxGeometry(s * 1.4, s * 0.08, s * 0.1);
    const slatMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
    [-0.3, 0, 0.3].forEach(z => {
      const slat = new THREE.Mesh(slatGeo, slatMat);
      slat.position.set(0, -0.3, z * s);
      slat.castShadow = true;
      group.add(slat);
    });

    return group;
  }

  private createConnector(xStart: number, xEnd: number): THREE.Line {
    const points = [
      new THREE.Vector3(xStart, 0, 0),
      new THREE.Vector3(xEnd, 0, 0)
    ];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: 0x94a3b8 });
    return new THREE.Line(geo, mat);
  }

  private animate() {
    this.frameId = requestAnimationFrame(() => this.animate());
    
    // Subtle rotation for shapes
    if (this.shapesGroup) {
      this.shapesGroup.children.forEach((child, i) => {
        if (child instanceof THREE.Group && !(child instanceof THREE.Line)) {
           child.rotation.y += 0.005;
           child.position.y = Math.sin(Date.now() * 0.001 + i) * 0.05;
        }
      });
    }

    if (this.controls) {
      this.controls.update();
    }
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
