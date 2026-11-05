// Sets up the party royale three.js stage: renderer, gradient sky, lights, chase camera and resize.

import * as THREE from 'three';

const SKY_VERT = `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`;
const SKY_FRAG = `uniform vec3 top; uniform vec3 low; varying vec3 vP; void main(){ float h = normalize(vP).y; gl_FragColor = vec4(mix(low, top, smoothstep(-0.2, 0.7, h)), 1.); }`;

export function createPartyScene() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xd8ecff, 60, 190);
  const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 500);
  const skyMat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, uniforms: { top: { value: new THREE.Color() }, low: { value: new THREE.Color() } } });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), skyMat);
  scene.add(sky, new THREE.HemisphereLight(0xffffff, 0x8a7cc8, 1.4));
  const sun = new THREE.DirectionalLight(0xfff4e6, 2.1);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 140 });
  scene.add(sun, sun.target);

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  const camPos = new THREE.Vector3(0, 14, 20), camLook = new THREE.Vector3(), tmp = new THREE.Vector3();
  return {
    THREE, renderer, scene, camera,
    // round theme: sky gradient [top, low] + fog colour
    setTheme({ sky: [top, low], fog }) {
      skyMat.uniforms.top.value.set(top); skyMat.uniforms.low.value.set(low);
      scene.fog.color.set(fog);
    },
    // chase camera: behind focus along yaw (0 = looking down -z), eased; snap on round start
    follow(focus, yaw, dt, { dist = 11, height = 7, snap = false } = {}) {
      const want = tmp.set(focus.x + Math.sin(yaw) * dist, focus.y + height, focus.z + Math.cos(yaw) * dist);
      if (snap) camPos.copy(want); else camPos.lerp(want, 1 - Math.exp(-dt * 4));
      const look = tmp.set(focus.x - Math.sin(yaw) * 3, focus.y + 1, focus.z - Math.cos(yaw) * 3);
      if (snap) camLook.copy(look); else camLook.lerp(look, 1 - Math.exp(-dt * 6));
      camera.position.copy(camPos);
      camera.lookAt(camLook);
      sun.position.set(camLook.x + 20, camLook.y + 55, camLook.z + 16);
      sun.target.position.copy(camLook);
    },
    render() { renderer.render(scene, camera); },
  };
}
