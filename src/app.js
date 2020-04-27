var THREE = require("three");
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// import {translateCamera} from "./cameraTranslator.js"

// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { CSG } from 'three-csg-ts';

// import { Mesh, Sphere, RedIntegerFormat } from 'three';
// var Fig1_1No1 = require("../src/Fig1_1No1.js");

var scene, camera, renderer, orbit;
var perspective_camera;
var ball;
var pointLight, light;

var clipPlanes;
var material, materialCloud;
const earthRadius = 4;
const layers = []
const materialLayersRight = []
const earthMeshSegment = 50;
var cloud;
var readyCount = 0;
const cameraPos = new THREE.Vector3(11, 5, 11);
const cameraLookat = new THREE.Vector3(0, 0, 0);

function init() {
    var view_3d = document.getElementById("view-3d");

    var body = document.body,
        html = document.documentElement;

    var height = Math.max(body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight);

    view_3d.style.width = 100 + "%"
    view_3d.style.height = height + "px";

    var position_info = view_3d.getBoundingClientRect();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.canvas = view_3d;
    renderer.setSize(position_info.width, position_info.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000);
    renderer.localClippingEnabled = true;

    view_3d.appendChild(renderer.domElement);

    perspective_camera = new THREE.PerspectiveCamera(45, position_info.width / position_info.height, .1, 1000);

    camera = perspective_camera;
    camera.position.copy(cameraPos);
    camera.lookAt(cameraLookat);

    scene = new THREE.Scene();

    orbit = new OrbitControls(camera, renderer.domElement);
    orbit.enableDamping = true;
    orbit.dampingFactor = .1;
    orbit.saveState();

    scene.add(new THREE.AxesHelper(8))

    // clipping planes..
    clipPlanes = [
        new THREE.Plane(new THREE.Vector3(- 1, 0, 0), 0),
        new THREE.Plane(new THREE.Vector3(1, 0, 0), 0),
    ];

    var geometry = new THREE.SphereBufferGeometry(earthRadius, earthMeshSegment, earthMeshSegment);

    material = new THREE.MeshBasicMaterial({
        clippingPlanes: clipPlanes,
        clipIntersection: true
    });

    scene.add(new THREE.Mesh(geometry, material));

    var earthTextureLoader = new THREE.TextureLoader();
    earthTextureLoader.load("textures/earth.jpg",
        function (texture) {
            material.map = texture;
            material.needsUpdate = true;

            readyCount += 1;
            if (readyCount == 7) {
                animate();
            }
        },
        function (error) { console.log(error) })

    var geoStarField = new THREE.SphereBufferGeometry(earthRadius * 4, 20, 20);
    var matStarField = new THREE.MeshBasicMaterial({ side: THREE.BackSide });
    var starFieldTextureLoader = new THREE.TextureLoader();
    starFieldTextureLoader.load("textures/starfield.png",
        function (texture) {
            matStarField.map = texture;
            matStarField.needsUpdate = true;

            readyCount += 1;
            if (readyCount == 7) {
                animate();
            }

        },
        function (error) { console.log(error) })

    var starField = new THREE.Mesh(geoStarField, matStarField);
    scene.add(starField);

    var light1 = new THREE.AmbientLight(0xaaaaaa)
    scene.add(light1)

    light = new THREE.DirectionalLight(0xffffff, .7)
    light.position.set(5, 5, 5)
    scene.add(light)
    light.castShadow = true
    light.shadow.camera.near = 0.01
    light.shadow.camera.far = 15
    light.shadow.camera.fov = 45

    light.shadow.camera.left = -1
    light.shadow.camera.right = 1
    light.shadow.camera.top = 1
    light.shadow.camera.bottom = -1
    // light.shadowCameraVisible = true

    light.shadow.bias = 0.001

    light.shadow.mapSize.width = 1024
    light.shadow.mapSize.height = 1024

    //// 
    var cloudTextureLoader = new THREE.TextureLoader();
    cloudTextureLoader.load("textures/cloudimage.png",
        function (texture) {
            var geometryCloud = new THREE.SphereBufferGeometry(earthRadius + .07, 32, 32)
            materialCloud = new THREE.MeshBasicMaterial({
                map: texture,
                // side: THREE.DoubleSide,
                opacity: 0.8,
                transparent: true,
                depthWrite: false,
                clippingPlanes: clipPlanes,
                clipIntersection: true
            })

            cloud = new THREE.Mesh(geometryCloud, materialCloud)
            scene.add(cloud)

            readyCount += 1;
            if (readyCount == 7) {
                animate();
            }
        },
        function (error) { console.log(error) })

    /// add half rings for layers..

    const endRadius = [1, 2.2, earthRadius - .15, earthRadius - .007]
    // const colors = [0xff00ff, 0xf0f033, 0x00f2f2, 0x10f013]

    var geoCore = new THREE.SphereBufferGeometry(endRadius[0], 50, 50);
    var matCore = new THREE.MeshLambertMaterial({});
    var core = new THREE.Mesh(geoCore, matCore);
    scene.add(core);

    var textureLoaderCore = new THREE.TextureLoader();
    textureLoaderCore.load("textures/core.jpg", function (texture) {
        matCore.map = texture;
        matCore.needsUpdate = true;

        readyCount += 1;
        if (readyCount == 7) {
            animate();
        }

    }, function (error) { console.log("error") })

    for (var i = 1; i <= 3; i++) {
        var geometryLayer = new THREE.RingBufferGeometry(endRadius[i - 1], endRadius[i], earthMeshSegment, 4, Math.PI / 2, Math.PI);
        geometryLayer.rotateY(-Math.PI / 2)
        var materialLayer = new THREE.MeshLambertMaterial({ side: THREE.BackSide });

        materialLayersRight.push(materialLayer)
        var layer = new THREE.Mesh(geometryLayer, materialLayer);
        scene.add(layer);
    }

    for (var i = 1; i <= 3; i++) {
        var geometryLayer = new THREE.RingBufferGeometry(endRadius[i - 1], endRadius[i], earthMeshSegment, 4, Math.PI / 2, Math.PI);
        geometryLayer.rotateY(-Math.PI / 2);
        var materialLayer = new THREE.MeshLambertMaterial({ side: THREE.FrontSide });

        var layer = new THREE.Mesh(geometryLayer, materialLayer);
        scene.add(layer);
        layers.push(layer);
    }

    addTextures();
    setupListeners();

}

var layersTexturesNames = ["outerCore.jpg", "rock2.jpg", "clean-brown-soil-texture.jpg"];

function addTextures() {
    var textureLoader1 = new THREE.TextureLoader();
    textureLoader1.load("textures/" + layersTexturesNames[0], function (texture) {
        layers[0].material.map = texture;
        layers[0].material.needsUpdate = true;

        materialLayersRight[0].map = texture;
        materialLayersRight[0].needsUpdate = true;

        readyCount += 1;
        if (readyCount == 7) {
            animate();
        }

    },
        function (error) { console.log(error) })

    var textureLoader2 = new THREE.TextureLoader();
    textureLoader2.load("textures/" + layersTexturesNames[1], function (texture) {
        layers[1].material.map = texture;
        layers[1].material.needsUpdate = true;

        materialLayersRight[1].map = texture;
        materialLayersRight[1].needsUpdate = true;

        readyCount += 1;
        if (readyCount == 7) {
            animate();
        }
    },
        function (error) { console.log(error) })

    var textureLoader3 = new THREE.TextureLoader();
    textureLoader3.load("textures/" + layersTexturesNames[2], function (texture) {
        layers[2].material.map = texture;
        layers[2].material.needsUpdate = true;

        materialLayersRight[2].map = texture;
        materialLayersRight[2].needsUpdate = true;

        readyCount += 1;

        if (readyCount == 7) {
            animate();
        }
    },
        function (error) { console.log(error); })

    // add labels...
    var loader = new THREE.FontLoader();
    loader.load('styles/Zawgyi-One_Regular.json', function (font) {

        var matLayerText = new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.DoubleSide,
        });

        var mantleTextShape = font.generateShapes("အကာပိုင္း", .3);

        var geoMantleText = new THREE.ShapeBufferGeometry(mantleTextShape);
        geoMantleText.computeBoundingBox();

        var mantleText = new THREE.Mesh(geoMantleText, matLayerText);

        var xMid = - (geoMantleText.boundingBox.max.x - geoMantleText.boundingBox.min.x);
        geoMantleText.translate(xMid / 2, -.1, 0);

        mantleText.rotateY(Math.PI / 2)
        mantleText.rotateZ(-.5)

        mantleText.position.y = Math.cos(-.5) * 3;
        mantleText.position.x = .05;
        mantleText.position.z = Math.sin(-.5) * 3;

        scene.add(mantleText);

        // inner core
        var outerCoreTextShape = font.generateShapes("အျပင္အႏွစ္ပိုင္း", .2);

        var geoOuterCoreText = new THREE.ShapeBufferGeometry(outerCoreTextShape);
        geoOuterCoreText.computeBoundingBox();

        var outerCoreText = new THREE.Mesh(geoOuterCoreText, matLayerText);

        var xMid = - (geoOuterCoreText.boundingBox.max.x - geoOuterCoreText.boundingBox.min.x);
        geoOuterCoreText.translate(xMid / 2, -.1, 0);

        outerCoreText.rotateY(Math.PI / 2)
        outerCoreText.rotateZ(-.52)

        outerCoreText.position.y = Math.cos(-.52) * 1.6;
        outerCoreText.position.x = .05;
        outerCoreText.position.z = Math.sin(-.52) * 1.6  ;

        scene.add(outerCoreText);

        // inner core..
        var innerCoreTextShape = font.generateShapes("အတြင္းအႏွစ္ပိုင္း", .16);

        var geoInnerCoreText = new THREE.ShapeBufferGeometry(innerCoreTextShape);
        geoInnerCoreText.computeBoundingBox();

        var innerCoreText = new THREE.Mesh(geoInnerCoreText, matLayerText);

        var xMid = - (geoInnerCoreText.boundingBox.max.x - geoInnerCoreText.boundingBox.min.x);
        geoInnerCoreText.translate(xMid / 2, -.1, 0);

        innerCoreText.rotateY(-(2 * Math.PI - (Math.PI / 2) - (Math.PI / 4)))
        innerCoreText.rotateX(-.2)

        innerCoreText.position.y = .3;
        innerCoreText.position.x = .77;
        innerCoreText.position.z = -.65;

        scene.add(innerCoreText);


    })

}

// let layerOuterLef;
let clock = new THREE.Clock();
const twoPi = Math.PI * 2;
var t;

function animate() {
    requestAnimationFrame(animate);

    t = ((clock.getElapsedTime() % 80) / 80) * twoPi;

    cloud.rotation.z = Math.sin(t);
    cloud.rotation.y = Math.cos(t);

    orbit.update();

    render();
}

function render() {
    renderer.render(scene, camera);
}

var firstTime = true;

function setupListeners() {
    var angleSlider = document.getElementById("angle-slider");
    angleSlider.addEventListener("input", function (evt) {

        var angle = angleSlider.value;
        var x = Math.cos(angle);
        var y = Math.sin(angle);

        for (var i = 0; i < layers.length; i++) {
            layers[i].rotation.y = -angle;
        }

        if (angle > Math.PI) {
            if (material.clipIntersection) { material.needsUpdate = true; }

            materialCloud.clipIntersection = false;
            material.clipIntersection = false;
        }
        else {
            if (!material.clipIntersection) { material.needsUpdate = true; }

            materialCloud.clipIntersection = true;
            material.clipIntersection = true;
        }

        clipPlanes[1].set(new THREE.Vector3(x, 0, y), 0);
    })
}

function resetView() {
    orbit.reset();
}

init()

export { resetView }

