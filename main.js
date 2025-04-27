import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

//  ID
const id = "Flansch";

const radialSegments = 32;
const heightSegments = 1;


const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


//Code for Three.js Objeckt


    // Einlesen von Parametern für Flanschtyp 21
    var d4 = 755; // Außendurchmesser des Flansches
    var d3 = 670; // Lochkreisdurchmesser für Schrauben
    var d5 = 42;  // Durchmesser der Schraubenbohrungen
    var C = 57;   // Flanschdicke an der Basis
    var H = 4 * C; // Gesamthöhe des Flansches
    var N = 576;  // Ansatzdurchmesser (Durchmesser des mittleren Abschnitts)
    var A = 508;  // Außendurchmesser des Flansches
    var e1 = 14.2; // Wandstärke am oberen Abschnitt
    var r0 = 20;  // Eckradius (Radius des Übergangs zwischen Basis und Ansatz)

    var dicht_form = 2; // Dichtflächenform 
    var nB = 8; // Anzahl der Bohrungen für Schrauben
    var Flanschtyp = 5; // Definition des Flanschtyps

    var d1_dicht = 615; // Außendurchmesser der Dichtfläche
    var f1 = 4;  // Höhe der Dichtleiste

    // Berechnungen der Radien für die Geometrie
    var ra = d4 * 0.5; // Außenradius des Flansches
    var ri = (A * 0.5) - e1; // Innenradius, angepasst durch Wandstärke e1

    // Erstellen der Geometrie für Flanschtyp 21
    var typ_21_mesh = {};
    if (Flanschtyp == 5) {
        const type_21 = [];

     type_21.push(new THREE.Vector2(ri, C));
    type_21.push(new THREE.Vector2(0.5 * N, C));   //oben?
     
    type_21.push(new THREE.Vector2(0.5 * N - e1 -r0, H/2));

    type_21.push(new THREE.Vector2(0.5 * N-e1-r0 , H)); //punkt außenkante oben
    type_21.push(new THREE.Vector2(ri, H));
    type_21.push(new THREE.Vector2(ri, C)); // unden ende

        // Erstellen der Lathe-Geometrie durch Rotation des Querschnitts
        const type_21_geom = new THREE.LatheGeometry(type_21, 256);
        type_21_geom.rotateX(Math.PI / 2); // Rotation um die X-Achse zur richtigen Ausrichtung

        // Mesh für Flanschtyp 21 erzeugen
        typ_21_mesh = new THREE.Mesh(type_21_geom, material);
        typ_21_mesh.name = id;
        typ_21_mesh.updateMatrix();
    }

    // Erstellen der Bohrungen für Schrauben
    const arcShape = new THREE.Shape();
    arcShape.absarc(0, 0, ra, 0, Math.PI * 2, false);

    const holePath = new THREE.Path();
    holePath.absarc(0, 0, ri, 0, Math.PI * 2, true);
    arcShape.holes.push(holePath);

    for (let i = 0; i < nB; i++) {
        const angle = (i / nB) * 2 * Math.PI;
        const x = (d3 * 0.5) * Math.cos(angle);
        const y = (d3 * 0.5) * Math.sin(angle);
        const bolthole = new THREE.Path();
        bolthole.absarc(x, y, d5 * 0.5, 0, Math.PI * 2, true);
        arcShape.holes.push(bolthole);
    }

    // Erstellen der Geometrie für den Flanschring mit Bohrungen
    const extrudeSettings = {
        depth: C,
        bevelEnabled: false,
        curveSegments: radialSegments,
        steps: heightSegments
    };

    const flange_geometry = new THREE.ExtrudeGeometry(arcShape, extrudeSettings);
    const flange_ring = new THREE.Mesh(flange_geometry, material);
    flange_ring.name = id;

    // Erstellen der Dichtfläche, falls erforderlich
    var sealing_ring = {};
    if (dicht_form == 2) { // Dichtleiste
        flange_ring.translateZ(f1);  // Anheben des Flanschrings, um Platz für die Dichtleiste zu schaffen

        const sealingShape = new THREE.Shape();
        sealingShape.absarc(0, 0, 0.5 * d1_dicht + 0.5 * f1, 0, Math.PI * 2,0, false);

        console.log('d1_dicht? als folrmel', 0.5 * d1_dicht + 0.5 * f1);

        console.log('d1_dicht? als folrmel2', 0.5 * d3 - (0.5* d5));

        const sealingHole = new THREE.Path();
        sealingHole.absarc(0, 0, ri, 0, Math.PI * 2, true);
        sealingShape.holes.push(sealingHole);

        const sealingExtrudeSettings = {
            depth: f1,
            bevelEnabled: false,
            curveSegments: radialSegments,
            steps: heightSegments
        };

        const sealing_geometry = new THREE.ExtrudeGeometry(sealingShape, sealingExtrudeSettings);
        sealing_ring = new THREE.Mesh(sealing_geometry, material);
        sealing_ring.name = id;
    }

    // Erstellen einer Gruppe für das gesamte Flanschobjekt und zurückgeben
    const group = new THREE.Group();
    group.add(typ_21_mesh);  //"trichter" nach oben
    group.add(flange_ring);
    if (dicht_form == 2) {
        group.add(sealing_ring);
    }
    group.name = id;


scene.add(group);

const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 10, 10);
scene.add(light);

camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

const exporter = new GLTFExporter();
window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'e') {
        exporter.parse(scene, (result) => {
            const output = JSON.stringify(result, null, 2);
            const blob = new Blob([output], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = 'scene.gltf';
            link.click();
        }, { binary: false });
    }
});
