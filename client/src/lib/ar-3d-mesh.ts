import * as THREE from 'three';
import { AdvancedFaceLandmarks } from './advanced-face-detection';

export interface FaceMesh3D {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  mesh: THREE.Mesh;
  wireframe: THREE.LineSegments;
  boundingBox: THREE.Box3;
}

export interface ARProductPlacement {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  anchorPoints: THREE.Vector3[];
  category: 'jewelry' | 'clothes' | 'shoes' | 'furniture';
}

export class AR3DMeshService {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private faceMesh: FaceMesh3D | null = null;
  private isInitialized = false;
  
  // Face mesh topology for connecting landmarks
  private readonly FACE_TRIANGULATION = [
    // Face outline triangles
    [10, 338, 297], [338, 332, 297], [332, 284, 297], [284, 251, 297],
    [251, 389, 297], [389, 356, 297], [356, 454, 297], [454, 323, 297],
    [323, 361, 297], [361, 288, 297], [288, 397, 297], [397, 365, 297],
    [365, 379, 297], [379, 378, 297], [378, 400, 297], [400, 10, 297],
    
    // Eye region triangles
    [33, 7, 163], [7, 144, 163], [144, 145, 163], [145, 153, 163],
    [153, 154, 163], [154, 155, 163], [155, 133, 163], [133, 173, 163],
    [173, 157, 163], [157, 158, 163], [158, 33, 163],
    
    // Nose bridge triangles
    [1, 2, 5], [2, 4, 5], [4, 6, 5], [6, 19, 5], [19, 20, 5],
    
    // Mouth region triangles
    [61, 84, 17], [84, 314, 17], [314, 405, 17], [405, 320, 17],
    [320, 307, 17], [307, 375, 17], [375, 321, 17], [321, 308, 17]
  ];

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      preserveDrawingBuffer: true 
    });
  }

  initialize(canvas: HTMLCanvasElement): void {
    if (this.isInitialized) return;

    // Set up renderer
    this.renderer.setSize(canvas.width, canvas.height);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Set up camera
    this.camera.position.z = 5;

    // Add lighting
    this.setupLighting();

    canvas.parentElement?.appendChild(this.renderer.domElement);
    this.isInitialized = true;
  }

  private setupLighting(): void {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional light for shadows and depth
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Point light for face illumination
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
    pointLight.position.set(0, 0, 10);
    this.scene.add(pointLight);
  }

  createFaceMesh(landmarks: AdvancedFaceLandmarks): FaceMesh3D {
    // Create geometry from landmarks
    const geometry = new THREE.BufferGeometry();
    
    // Convert landmarks to vertices
    const vertices: number[] = [];
    const indices: number[] = [];
    
    landmarks.landmarks.forEach(landmark => {
      vertices.push(landmark.x, landmark.y, landmark.z);
    });

    // Add triangulation indices
    this.FACE_TRIANGULATION.forEach(triangle => {
      indices.push(triangle[0], triangle[1], triangle[2]);
    });

    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();

    // Create materials
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide
    });

    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.3
    });

    // Create mesh and wireframe
    const mesh = new THREE.Mesh(geometry, material);
    const wireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry(geometry),
      wireframeMaterial
    );

    // Calculate bounding box
    geometry.computeBoundingBox();
    const boundingBox = geometry.boundingBox!;

    this.faceMesh = {
      geometry,
      material,
      mesh,
      wireframe,
      boundingBox
    };

    // Add to scene
    this.scene.add(mesh);
    this.scene.add(wireframe);

    return this.faceMesh;
  }

  calculateProductPlacement(
    landmarks: AdvancedFaceLandmarks, 
    productCategory: 'jewelry' | 'clothes' | 'shoes' | 'furniture'
  ): ARProductPlacement {
    const faceGeometry = landmarks.faceGeometry;
    const center = new THREE.Vector3(
      faceGeometry.center.x,
      faceGeometry.center.y,
      faceGeometry.center.z
    );

    let position: THREE.Vector3;
    let rotation: THREE.Euler;
    let scale: THREE.Vector3;
    let anchorPoints: THREE.Vector3[] = [];

    switch (productCategory) {
      case 'jewelry':
        position = this.calculateJewelryPosition(landmarks);
        rotation = new THREE.Euler(0, 0, faceGeometry.rotation.z);
        scale = new THREE.Vector3(
          faceGeometry.scale * 0.8,
          faceGeometry.scale * 0.8,
          faceGeometry.scale * 0.8
        );
        anchorPoints = this.getJewelryAnchorPoints(landmarks);
        break;

      case 'clothes':
        position = this.calculateClothesPosition(landmarks);
        rotation = new THREE.Euler(0, 0, faceGeometry.rotation.z * 0.5);
        scale = new THREE.Vector3(
          faceGeometry.scale * 2.5,
          faceGeometry.scale * 3.0,
          faceGeometry.scale * 1.0
        );
        anchorPoints = this.getClothesAnchorPoints(landmarks);
        break;

      case 'shoes':
        position = this.calculateShoesPosition(landmarks);
        rotation = new THREE.Euler(0, 0, 0);
        scale = new THREE.Vector3(
          faceGeometry.scale * 1.5,
          faceGeometry.scale * 0.8,
          faceGeometry.scale * 1.0
        );
        anchorPoints = this.getShoesAnchorPoints(landmarks);
        break;

      case 'furniture':
        position = new THREE.Vector3(center.x - 200, center.y + 100, center.z - 50);
        rotation = new THREE.Euler(0, 0, 0);
        scale = new THREE.Vector3(2.0, 2.0, 2.0);
        anchorPoints = [position];
        break;

      default:
        position = center;
        rotation = new THREE.Euler(0, 0, 0);
        scale = new THREE.Vector3(1, 1, 1);
    }

    return {
      position,
      rotation,
      scale,
      anchorPoints,
      category: productCategory
    };
  }

  private calculateJewelryPosition(landmarks: AdvancedFaceLandmarks): THREE.Vector3 {
    // Use neck area (below chin)
    const chin = landmarks.landmarks[175]; // Chin landmark
    const neckY = chin.y + landmarks.faceGeometry.height * 0.3;
    
    return new THREE.Vector3(
      landmarks.faceGeometry.center.x,
      neckY,
      landmarks.faceGeometry.center.z + 5
    );
  }

  private calculateClothesPosition(landmarks: AdvancedFaceLandmarks): THREE.Vector3 {
    // Position clothes on chest/torso area
    const chest = landmarks.faceGeometry.center;
    const clothesY = chest.y + landmarks.faceGeometry.height * 1.5;
    
    return new THREE.Vector3(
      chest.x,
      clothesY,
      chest.z - 10
    );
  }

  private calculateShoesPosition(landmarks: AdvancedFaceLandmarks): THREE.Vector3 {
    // Position shoes at bottom of screen
    const center = landmarks.faceGeometry.center;
    const shoesY = center.y + landmarks.faceGeometry.height * 4;
    
    return new THREE.Vector3(
      center.x,
      shoesY,
      center.z - 20
    );
  }

  private getJewelryAnchorPoints(landmarks: AdvancedFaceLandmarks): THREE.Vector3[] {
    return [
      new THREE.Vector3(landmarks.nose[0].x, landmarks.nose[0].y, landmarks.nose[0].z),
      new THREE.Vector3(landmarks.lips[0].x, landmarks.lips[0].y, landmarks.lips[0].z)
    ];
  }

  private getClothesAnchorPoints(landmarks: AdvancedFaceLandmarks): THREE.Vector3[] {
    return [
      new THREE.Vector3(landmarks.faceGeometry.center.x - landmarks.faceGeometry.width/2, landmarks.faceGeometry.center.y + landmarks.faceGeometry.height, landmarks.faceGeometry.center.z),
      new THREE.Vector3(landmarks.faceGeometry.center.x + landmarks.faceGeometry.width/2, landmarks.faceGeometry.center.y + landmarks.faceGeometry.height, landmarks.faceGeometry.center.z)
    ];
  }

  private getShoesAnchorPoints(landmarks: AdvancedFaceLandmarks): THREE.Vector3[] {
    const center = landmarks.faceGeometry.center;
    return [
      new THREE.Vector3(center.x - 50, center.y + landmarks.faceGeometry.height * 4, center.z),
      new THREE.Vector3(center.x + 50, center.y + landmarks.faceGeometry.height * 4, center.z)
    ];
  }

  updateFaceMesh(landmarks: AdvancedFaceLandmarks): void {
    if (!this.faceMesh) return;

    // Update vertices
    const vertices: number[] = [];
    landmarks.landmarks.forEach(landmark => {
      vertices.push(landmark.x, landmark.y, landmark.z);
    });

    this.faceMesh.geometry.setAttribute(
      'position', 
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    this.faceMesh.geometry.computeVertexNormals();
    this.faceMesh.geometry.computeBoundingBox();
  }

  adaptToLighting(videoElement: HTMLVideoElement): void {
    // Analyze video frame for lighting conditions
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 100;
    canvas.height = 100;
    
    ctx.drawImage(videoElement, 0, 0, 100, 100);
    const imageData = ctx.getImageData(0, 0, 100, 100);
    
    // Calculate average brightness
    let totalBrightness = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      totalBrightness += (r + g + b) / 3;
    }
    
    const averageBrightness = totalBrightness / (imageData.data.length / 4);
    const brightnessFactor = averageBrightness / 255;
    
    // Adjust scene lighting
    this.scene.children.forEach(child => {
      if (child instanceof THREE.AmbientLight) {
        child.intensity = 0.4 + (brightnessFactor * 0.4);
      } else if (child instanceof THREE.DirectionalLight) {
        child.intensity = 0.6 + (brightnessFactor * 0.4);
      }
    });
  }

  render(): void {
    if (!this.isInitialized) return;
    this.renderer.render(this.scene, this.camera);
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  dispose(): void {
    if (this.faceMesh) {
      this.scene.remove(this.faceMesh.mesh);
      this.scene.remove(this.faceMesh.wireframe);
      this.faceMesh.geometry.dispose();
      (this.faceMesh.material as THREE.Material).dispose();
    }
    
    this.renderer.dispose();
    this.isInitialized = false;
  }
}