import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';

// Function to create grass texture
function createGrassTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#2e8b57';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 100; i++) {
        ctx.strokeStyle = 'rgba(20,80,40,0.1)';
        ctx.beginPath();
        ctx.moveTo(Math.random() * 256, Math.random() * 256);
        ctx.lineTo(Math.random() * 256, Math.random() * 256);
        ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
}

// Function to create parking texture with stripes
function createParkingTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#666666';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 10; i++) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, i * 25.6, 256, 12.8);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    return texture;
}

// Function to create a lamp at given position
function createLamp(x, z) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.1, 4), lampMat);
    pole.position.set(x, 2, z);
    scene.add(pole);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.3), bulbMat);
    bulb.position.set(x, 4.2, z);
    scene.add(bulb);
    const light = new THREE.PointLight(0xffee88, 0.6, 14);
    light.position.set(x, 4.2, z);
    light.castShadow = true;
    scene.add(light);
    return light;
}

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(70, 40, 70);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);

// Lights
const hemiLight = new THREE.HemisphereLight(0xbfefff, 0x444422, 0.45);
scene.add(hemiLight);
const dirLight = new THREE.DirectionalLight(0xfff1c4, 1.2);
dirLight.position.set(30, 40, 20);
dirLight.castShadow = true;
scene.add(dirLight);

// Ground with texture
const grassTex = createGrassTexture();
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(75, 75),
    new THREE.MeshStandardMaterial({ color: 0x2e8b57, map: grassTex })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Roads
const roadMat = new THREE.MeshStandardMaterial({ color: 0x808080 });
const roads = [
    { pos: [0, 0.03, -10], size: [75, 8], rot: 0 },
    { pos: [10, 0.03, 13], size: [55, 8], rot: -Math.PI / 3 },
    { pos: [-10, 0.03, 13], size: [50, 8], rot: Math.PI / 2 }
];
roads.forEach(road => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(...road.size), roadMat);
    mesh.position.set(...road.pos);
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = road.rot;
    scene.add(mesh);
});

// Parking area
const parkingTex = createParkingTexture();
const parking = new THREE.Mesh(
    new THREE.PlaneGeometry(25, 23.5),
    new THREE.MeshStandardMaterial({ map: parkingTex })
);
parking.position.set(18, 0.04, -25.75);
parking.rotation.x = -Math.PI / 2;
scene.add(parking);

// Buildings
const buildingMat = new THREE.MeshStandardMaterial({ color: 0xe6ffff, roughness: 0.35, metalness: 0.1 });
const buildings = [
    { pos: [-15, 2, -23], size: [25, 8, 14], rot: 0, name: 'Rectorate' },
    { pos: [14, 2, 2], size: [8, 4, 6], rot: -Math.PI / 3, name: 'Repair Building' },
    { pos: [24, 2, 20], size: [8, 4, 6], rot: -Math.PI / 3, name: 'Tech Park' },
    { pos: [0, 2, 20], size: [22, 4, 6], rot: -Math.PI / 3, name: 'Student Services' }
];

const labeledBuildings = [];
buildings.forEach(b => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...b.size), buildingMat);
    mesh.position.set(...b.pos);
    mesh.rotation.y = b.rot;
    mesh.castShadow = mesh.receiveShadow = true;
    scene.add(mesh);
    labeledBuildings.push({ mesh, label: b.name });
});

// Lamps
const lampMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffee88 });
const lamps = [];
const lampPositions = [
    [-15, -5], [2, -15], [15, -5],  // sides of horizontal road
    [14.33, 10], [5.67, 15],  // sides of diagonal road
    [-15, 5], [-5, 5], [-15, 15],   // sides of vertical road
];
lampPositions.forEach(([x, z]) => {
    lamps.push(createLamp(x, z));
});

// Sky and fog
const daySky = new THREE.Color(0x87ceeb), duskSky = new THREE.Color(0x2b2d42);
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.FogExp2(0x87ceeb, 0.0015);

// GUI
const gui = new GUI();
const params = { sunSpeed: 1, sunIntensity: 1.2, fogDensity: 0.0015, lampIntensity: 0.6 };
gui.add(params, 'sunSpeed', 0.1, 5, 0.1);
gui.add(params, 'sunIntensity', 0, 2, 0.1).onChange(v => dirLight.intensity = v);
gui.add(params, 'fogDensity', 0.001, 0.01, 0.001).onChange(v => scene.fog.density = v);
gui.add(params, 'lampIntensity', 0, 2, 0.1).onChange(v => lamps.forEach(l => l.intensity = v));

// Labels
const labelDiv = document.createElement('div');
labelDiv.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none';
document.body.appendChild(labelDiv);

labeledBuildings.forEach(item => {
    const div = document.createElement('div');
    div.textContent = item.label;
    div.style.cssText = 'position:absolute;background:rgba(0,0,0,0.6);color:white;padding:4px;border-radius:4px;font:12px Arial;transform:translate(-50%,-100%)';
    labelDiv.appendChild(div);
    item.el = div;
});

// Animation
function animate() {
    requestAnimationFrame(animate);
    const t = performance.now() * 0.0001 * params.sunSpeed;
    dirLight.position.set(Math.cos(t) * 60, Math.max(10, Math.sin(t) * 60), Math.sin(t) * 60);
    
    const f = Math.max(0, Math.min(1, (dirLight.position.y - 10) / 50));
    scene.background.lerpColors(duskSky, daySky, f);
    scene.fog.color.copy(scene.background);
    
    labeledBuildings.forEach(item => {
        const pos = item.mesh.position.clone();
        pos.y += 5;
        pos.project(camera);
        item.el.style.left = ((pos.x + 1) / 2 * window.innerWidth) + 'px';
        item.el.style.top = (-(pos.y - 1) / 2 * window.innerHeight) + 'px';
        item.el.style.display = pos.z > 1 ? 'none' : '';
    });
    
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});