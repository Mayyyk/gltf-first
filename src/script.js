import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Pane } from 'tweakpane';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// Initialize pane for debugging
const pane = new Pane();

// Loaders
const cubeTextureLoader = new THREE.CubeTextureLoader().setPath('textures/');
const dracoLoader = new DRACOLoader().setDecoderPath('/examples/js/libs/draco/');
const gltfLoader = new GLTFLoader().setDRACOLoader(dracoLoader);

// Scene setup
const scene = new THREE.Scene();

// Environment map
const envMap = cubeTextureLoader.load(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']);
scene.background = envMap;
scene.environment = envMap;

// Utility function to load models
const loadModel = async (path, position = { x: 0, y: 0, z: 0 }, scale = 1, rotation = { x: 0, y: 0, z: 0 }) => {
  const model = await gltfLoader.loadAsync(path);
  const sceneObject = model.scene;
  sceneObject.position.set(position.x, position.y, position.z);
  sceneObject.rotation.set(rotation.x, rotation.y, rotation.z);
  sceneObject.scale.setScalar(scale);

  // Apply environment map and tweakpane bindings if materials exist
  sceneObject.traverse((child) => {
    if (child.isMesh && child.material) {
      child.material.envMap = envMap;
      pane.addBinding(child.material, 'roughness', { min: 0, max: 1, step: 0.01 });
      pane.addBinding(child.material, 'metalness', { min: 0, max: 1, step: 0.01 });
    }
  });

  scene.add(sceneObject);
};

// Load models
loadModel('/models/red_brick_2k.gltf/red_brick_2k.gltf', { x: 0, y: 0, z: 0 }, 2);
loadModel('/models/blue_metal_plate_2k.gltf/blue_metal_plate_2k.gltf', { x: 5, y: 0, z: 0 }, 1);
loadModel('/models/milkTruckGLB/CesiumMilkTruck.glb', { x: -5, y: 0, z: 0 }, 1, { x: 0, y: Math.PI / 2, z: 0 });

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.2));
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(0, 5, 5);
scene.add(directionalLight);

// Camera
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.z = 5;

// Renderer
const canvas = document.querySelector('canvas.threejs');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Handle resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Render loop
const renderloop = () => {
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(renderloop);
};

renderloop();
