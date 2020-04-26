var THREE = require("three");
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { CSG } from 'three-csg-ts';

// import { Mesh, Sphere, RedIntegerFormat } from 'three';
// var Fig1_1No1 = require("../src/Fig1_1No1.js");

var scene, camera, renderer, orbit;
var perspective_camera;
var ball;
var pointLight;
var earth;
var planeObjects;
var planes;
var clippedColorFront;
var planes, planeObjects, planeHelpers, object;


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
    renderer.setClearColor(0x222222);
    renderer.localClippingEnabled = true;
    view_3d.appendChild(renderer.domElement);

    perspective_camera = new THREE.PerspectiveCamera(45, position_info.width / position_info.height, 1, 1000);

    camera = perspective_camera;
    camera.position.set(10, 5, 10)
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    scene = new THREE.Scene();

    orbit = new OrbitControls(camera, renderer.domElement);
    orbit.addEventListener("change", render)
    orbit.saveState();


    // clipping planes..
    var clipPlanes = [
        new THREE.Plane(new THREE.Vector3(- 1, 0, 0), 0),
        new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    ];

    var helpers = new THREE.Group();
    helpers.add(new THREE.PlaneHelper(clipPlanes[0], 8, 0xff0000));
    helpers.add(new THREE.PlaneHelper(clipPlanes[1], 8, 0x00ff00));
    helpers.visible = true;
    scene.add(helpers);



    planes = [
        new THREE.Plane(new THREE.Vector3(- 1, 0, 0), 0),
        new THREE.Plane(new THREE.Vector3(0, - 1, 0), 0),
        new THREE.Plane(new THREE.Vector3(0, 0, - 1), 0)
    ];

    planeHelpers = planes.map(p => new THREE.PlaneHelper(p, 2, 0xffffff));
    planeHelpers.forEach(ph => {

        ph.visible = false;
        scene.add(ph);

    });

    var geometry = new THREE.SphereBufferGeometry(3, 60, 60);
    object = new THREE.Group();
    scene.add(object);

    var material = new THREE.MeshLambertMaterial({
        metalness: 0.1,
        roughness: 0.75,
        clippingPlanes: planes,
        clipShadows: true,
        shadowSide: THREE.DoubleSide,
        wireframe : true,
    });


    var earthDispalaceMapLoader = new THREE.TextureLoader();
    earthDispalaceMapLoader.load("textures/earth-displacement-map.jpg",
        function (texture) {
            material.displacementMap = texture;
            material.displacementScale = .5;
            // testMat.displacementBias = 90;
            material.needsUpdate = true;

            clippedColorFront = new THREE.Mesh(geometry, material);
            clippedColorFront.castShadow = true;
            console.log(clippedColorFront.geometry.attributes.position)
            clippedColorFront.renderOrder = 6;
            object.add(clippedColorFront);
            clippedColorFront.scale.set(1, 1, .4)
            console.log(clippedColorFront)

            renderer.render(scene, camera)
            console.log(clippedColorFront.geometry.attributes.position)

            var testMat = new THREE.MeshLambertMaterial({color : 0x8888ff});
            var oo = new THREE.Mesh(clippedColorFront.geometry, testMat)
            console.log(oo.geometry.attributes.position)
        //    scene.add(oo)
            

            renderer.render(scene, camera)

            // geometry.updateMatrix()

            return;

            planeObjects = [];
            var planeGeom = new THREE.PlaneBufferGeometry(20, 20);

            for (var i = 0; i < 3; i++) {

                var poGroup = new THREE.Group();
                var plane = planes[i];
                var stencilGroup = createPlaneStencilGroup(clippedColorFront.geometry, plane, i + 1);

                // plane is clipped by the other clipping planes
                var planeMat =
                    new THREE.MeshStandardMaterial({

                        color: 0xE91E63,
                        metalness: 0.1,
                        roughness: 0.75,
                        clippingPlanes: planes.filter(p => p !== plane),

                        stencilWrite: true,
                        stencilRef: 0,
                        stencilFunc: THREE.NotEqualStencilFunc,
                        stencilFail: THREE.ReplaceStencilOp,
                        stencilZFail: THREE.ReplaceStencilOp,
                        stencilZPass: THREE.ReplaceStencilOp,

                    });
                var po = new THREE.Mesh(planeGeom, planeMat);
                po.onAfterRender = function (renderer) {

                    renderer.clearStencil();

                };
                po.renderOrder = i + 1.1;

                object.add(stencilGroup);
                poGroup.add(po);
                planeObjects.push(po);
                scene.add(poGroup);

            }



            // add the color





            render();
        },
        function (error) {
            console.log(error)
        })





    // Set up clip plane rendering

    var testMat = new THREE.MeshPhongMaterial({});
    var testGoe = new THREE.SphereBufferGeometry(7, 70, 70)
    testGoe.dynamic = true;
    testGoe.rotateX(-Math.PI / 2)
    var testEarth = new THREE.Mesh(testGoe, testMat);

    // scene.add(testEarth);

    var earthTextureLoader = new THREE.TextureLoader();
    earthTextureLoader.load("textures/earth-texture.jpg",
        function (texture) {
            material.map = texture;
            material.needsUpdate = true;
            render();
        },
        function (error) {
            console.log(error)
        })

    var light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    scene.add(light);

}

function createPlaneStencilGroup(geometry, plane, renderOrder) {

    var group = new THREE.Group();
    var baseMat = new THREE.MeshBasicMaterial();
    baseMat.depthWrite = false;
    baseMat.depthTest = false;
    baseMat.colorWrite = false;
    baseMat.stencilWrite = true;
    baseMat.stencilFunc = THREE.AlwaysStencilFunc;

    // back faces
    var mat0 = baseMat.clone();
    mat0.side = THREE.BackSide;
    mat0.clippingPlanes = [plane];
    mat0.stencilFail = THREE.IncrementWrapStencilOp;
    mat0.stencilZFail = THREE.IncrementWrapStencilOp;
    mat0.stencilZPass = THREE.IncrementWrapStencilOp;

    var mesh0 = new THREE.Mesh(geometry, mat0);
    mesh0.renderOrder = renderOrder;
    group.add(mesh0);

    // front faces
    var mat1 = baseMat.clone();
    mat1.side = THREE.FrontSide;
    mat1.clippingPlanes = [plane];
    mat1.stencilFail = THREE.DecrementWrapStencilOp;
    mat1.stencilZFail = THREE.DecrementWrapStencilOp;
    mat1.stencilZPass = THREE.DecrementWrapStencilOp;

    var mesh1 = new THREE.Mesh(geometry, mat1);
    mesh1.renderOrder = renderOrder;

    group.add(mesh1);

    return group;

}



function render() {

    // for ( var i = 0; i < planeObjects.length; i ++ ) {

    //     var plane = planes[ i ];
    //     var po = planeObjects[ i ];
    //     plane.coplanarPoint( po.position );
    //     po.lookAt(
    //         po.position.x - plane.normal.x,
    //         po.position.y - plane.normal.y,
    //         po.position.z - plane.normal.z,
    //     );

    // }

    console.log(clippedColorFront.geometry.attributes.position)

    renderer.render(scene, camera);
}

init()

