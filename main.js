import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

//  ID
const id = "Flansch";

const radialSegments = 32;
const heightSegments = 1;


const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: true });
const materialBlue = new THREE.MeshStandardMaterial({ color: 0x0000ff, wireframe: true });

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);




var e = 6.01 / 2; // Außendurchmesser / 2      6.01 bei M3
var d = 3 / 2; // M3 Mutter mit 3mm Innengewinde (Radius)  
var m = 2.4; // 2.4 bei M3 Mutter Dicke
var h = 4; //4 gesammtdicke bei m3 mutter
var s = h - m; // dicke des bereichs mit selbssicherung

let windungen = 0;  // 4.8 Windungen bei M3

if (Math.abs(m - 2.4) < 0.001) {
  windungen = m / 0.5;
} else if (Math.abs(m - 3.2) < 0.001) {
  windungen = m / 0.7;
} else if (Math.abs(m - 4) < 0.001) {
  windungen = m / 0.8;
} else if (Math.abs(m - 5) < 0.001) {
  windungen = m / 0.1;
} else if (Math.abs(m - 5.5) < 0.001) {
  windungen = m / 1;
} else if (Math.abs(m - 6.6) < 0.001) {
  windungen = m / 1.25;
}
else {
  Console.log(m);
}



// Funktion, um ein Hexagon zu erstellen
function createHexagonPath(radius) {
  const hexagonShape = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 60 Grad pro Seite
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) {
      hexagonShape.moveTo(x, y);
    } else {
      hexagonShape.lineTo(x, y);
    }
  }
  hexagonShape.closePath();
  return hexagonShape;
}

// Erstelle das äußere Hexagon
const shapeDeckel = createHexagonPath(e);

// Füge das Innenloch hinzu
shapeDeckel.holes.push(new THREE.Path().absarc(0, 0, d, 0, Math.PI * 2, true));

// Extrude-Einstellungen für abgerundete Kanten
var extrudeSettings = {
  depth: m, // Tiefe der Mutter
  steps: 90,
  bevelEnabled: true, // Bevel aktivieren
  bevelThickness: 0.2, // Dicke der Abrundung
  bevelSize: 0.2, // Größe der Abrundung an den Ecken
  bevelSegments: 20, // Glättung der Abrundung
  curveSegments: 200, // Anzahl der Segmente für die Geometrie
};

// Erstelle die Mutter-Geometrie mit den Extrude-Einstellungen
var mutterGeometry = new THREE.ExtrudeGeometry(shapeDeckel, extrudeSettings);

// Mesh für die Mutter
const mutterMesh = new THREE.Mesh(mutterGeometry, material);

// ########### Gewinde erstellen ###########
// Benutzerdefinierte Helix-Kurve für das Innengewinde
class HelixCurve extends THREE.Curve {
  constructor() {
    super();
  }

  getPoint(t) {
    const radius = d - d * 0.1; // Innenradius des Gewindes (leicht kleiner als das Loch)
    const angle = 1.5 * Math.PI * windungen * t; // 10 Umdrehungen
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    const z = m * t; // Höhe entlang der Z-Achse



    return new THREE.Vector3(-x, -y, z);
  }

}

// Erstelle die Helix-Kurve
const helixCurve = new HelixCurve();

// Erstelle die Geometrie für das Gewinde
const tubeGeometry = new THREE.TubeGeometry(helixCurve, 800, 0.2, 3, false);
const tubeMesh = new THREE.Mesh(tubeGeometry, material);


//###########  Dichtung erstellen


// Shape für Dichtung
const shapeReduOben = new THREE.Shape();
shapeReduOben.absarc(0, 0, d * 1.3, 0, Math.PI * 2, false);

//inneres Loch für die Dichtung
const holePathInnen = new THREE.Path();
holePathInnen.absarc(0, 0, d - d * 0.2, 0, Math.PI * 2, true);
shapeReduOben.holes.push(holePathInnen);

const extrudeDichtung = { depth: s / 4, bevelEnabled: false, curveSegments: 250 };
const dichtungExtru = new THREE.ExtrudeGeometry(shapeReduOben, extrudeDichtung);
const dichtungMesh = new THREE.Mesh(dichtungExtru, materialBlue);

//position der Dichtung
dichtungMesh.position.set(0, 0, d + s);


//################ mantel


// Erstellen des 2D-Profils
var mantel = new THREE.Shape();

mantel.moveTo(d * 1.5, m);   //bewege zu durchmesser dichtung Außen
mantel.lineTo(d * 1.5, d + s + (s / 2));  //linie an dichtung entlang
mantel.lineTo(d, d + s + (s / 2));    // linie an ca. hälfte der 
mantel.lineTo(d, d + s + (s / 4));


// Hol die Punkte 
var pointShape = mantel.getPoints();

var mantelGeom = new THREE.LatheGeometry(pointShape, 80, 0, Math.PI * 2);
var mantelMesh = new THREE.Mesh(mantelGeom, material);



mantelMesh.rotation.x = Math.PI * 0.5;


// ########### Gruppe erstellen ###########
const group = new THREE.Group();
mutterMesh.name = id;
group.name = id;
tubeMesh.name = id;
dichtungMesh.name = id;
mantelMesh.name = id;



group.add(mutterMesh); // Mutter
group.add(tubeMesh);  // Gewinde
group.add(dichtungMesh);
group.add(mantelMesh);



scene.add(group);

//########### end code Three.js ##############


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
