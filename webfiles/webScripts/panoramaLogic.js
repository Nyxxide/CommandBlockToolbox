import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const container = document.getElementById("pano-bg");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: false
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const loader = new THREE.CubeTextureLoader();

renderer.domElement.style.opacity = "0";

const texture = loader.load(
    [
        "/Images/MainMenu/east.webp",
        "/Images/MainMenu/west.webp",
        "/Images/MainMenu/up.webp",
        "/Images/MainMenu/down.webp",
        "/Images/MainMenu/north.webp",
        "/Images/MainMenu/south.webp"
    ],
    () => {
        renderer.domElement.style.opacity = "1";
    }
);

texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.NearestFilter;

scene.background = texture;

function animate() {
    requestAnimationFrame(animate);

    camera.rotation.y -= 0.0002;
    camera.rotation.x = Math.sin(performance.now() * 0.00015) * 0.03;

    renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});