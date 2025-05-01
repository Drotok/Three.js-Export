import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


//  ID
const id = "Flansch";

const radialSegments = 32;
const heightSegments = 1;


const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: false });
const materialBlue = new THREE.MeshStandardMaterial({ color: 0x0000ff, wireframe: true });

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


//#################   Ab Hier Three.js Code adden  #############



const schraube = new THREE.Group();

  

var l = 40;
var screw = "M12";

var positionY = 40;


//###############  Gewinde
// Definiert typische ISO-Gewindewerte
const screwSizes = {

M2:   { d_nenn: 2,   pitch: 0.4,  s: 4 },

M3:   { d_nenn: 3,   pitch: 0.5,  s: 5.5 },

M4:   { d_nenn: 4,   pitch: 0.7,  s: 7 },
M5:   { d_nenn: 5,   pitch: 0.8,  s: 8 },
M6:   { d_nenn: 6,   pitch: 1.0,  s: 10 },
M7:   { d_nenn: 7,   pitch: 1.0,  s: 11 },
M8:   { d_nenn: 8,   pitch: 1.25, s: 13 },
M10:  { d_nenn: 10,  pitch: 1.5,  s: 17 },
M12:  { d_nenn: 12,  pitch: 1.75, s: 19 },
M14:  { d_nenn: 14,  pitch: 2.0,  s: 22 },
M16:  { d_nenn: 16,  pitch: 2.0,  s: 24 },
M18:  { d_nenn: 18,  pitch: 2.5,  s: 27 },
M20:  { d_nenn: 20,  pitch: 2.5,  s: 30 },
M22:  { d_nenn: 22,  pitch: 2.5,  s: 32 },
M24:  { d_nenn: 24,  pitch: 3.0,  s: 36 }
};

// Berechnet die Kerndurchmesser
function calculateCoreDiameter(d_nenn, pitch) {
return d_nenn - (1.22687 * pitch);
}

// Hauptfunktion: Schraubenparameter berechnen
function generateScrew(mSize, l) {
const entry = screwSizes[mSize];
if (!entry) throw new Error("Unbekannte Schraubengröße: " + mSize);

const d_nenn = entry.d_nenn;
const pitch = entry.pitch;
let s = entry.s;
const d_kern = calculateCoreDiameter(d_nenn, pitch);

// Kopfhöhe  
const kopfhoehe = 0.625 * d_nenn;

// Anzahl Windungen für das Gewinde
const gewindeLaenge = l; 
// const gewindeLaenge = l - (2*d_nenn);  //gewindelaenge bei teilgewinde
const anzahlWindungen = Math.round(gewindeLaenge / pitch);  // Beil Teilgewinde das nutzen

 return {
  d_nenn,
  d_kern,
  pitch,
  s,
  kopfhoehe,
  gewindeLaenge,
  anzahlWindungen
};
}


// Gewindeprofil (Trapez) erstellen
function createGewindeShape(base = 0.02, top = meineSchraube.pitch, height = meineSchraube.pitch) {
return [
  new THREE.Vector2(0, -base / 2),
  new THREE.Vector2(height, -top / 2),
  new THREE.Vector2(height, top / 2),
  new THREE.Vector2(0, base / 2),
  new THREE.Vector2(0, -base / 2)
]}



// Helix-Kurvefür das gewinde    //bei Helix (pitch) ist der Abstand zwischen den windungen
class HelixCurve extends THREE.Curve {
constructor(radius, pitch, height) {
  super();
  this.radius = radius;
  this.pitch = pitch;
  this.height = height;
}

getPoint(t) {
  const angle = 2 * Math.PI * (this.height / this.pitch) * t;
  const x = this.radius * Math.cos(angle);
  const y = this.radius * Math.sin(angle);
  const z = this.height * t;
  return new THREE.Vector3(x, y, z);
}
}

// Gewinde extrudieren 
function extrudeGewindeAlongHelix(shapePoints, radius, pitch, height, material)
{
const helix = new HelixCurve(radius, pitch, height);
const segments = Math.floor(height / pitch * 32);
const pathPoints = helix.getSpacedPoints(segments);

const profilePoints = shapePoints.length;
const positions = [];
const indices = [];
const up = new THREE.Vector3(0, 0, 1);

for (let i = 0; i < pathPoints.length; i++) {
  const curr = pathPoints[i];
  const next = pathPoints[i + 1] || pathPoints[i];

  const tangent = new THREE.Vector3().subVectors(next, curr).normalize();
  const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();
  const normal = new THREE.Vector3().crossVectors(tangent, binormal).normalize();

  shapePoints.forEach(p => {
    const vertex = new THREE.Vector3()
      .addScaledVector(binormal, p.x)
      .addScaledVector(normal, p.y)
      .add(curr);
    positions.push(vertex.x, vertex.y, vertex.z);
  });
}

// Indices generieren
for (let i = 0; i < pathPoints.length - 1; i++) {
  const offset = i * profilePoints;
  for (let j = 0; j < profilePoints - 1; j++) {
    const a = offset + j;
    const b = offset + j + 1;
    const c = offset + j + 1 + profilePoints;
    const d = offset + j + profilePoints;
    indices.push(a, b, d);
    indices.push(b, c, d);
  }
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
geometry.setIndex(indices);
geometry.computeVertexNormals();

return new THREE.Mesh(geometry, material);
}


//Parameter für die schraube mit denen eine Schraube erzeugt wird
const meineSchraube = generateScrew(screw, l);




const trapezShape = createGewindeShape();    
           
const gewindeMesh = extrudeGewindeAlongHelix(trapezShape, meineSchraube.d_nenn / 1.9, meineSchraube.pitch, meineSchraube.gewindeLaenge, material);


//####################### Schaft #######################



const geometry = new THREE.CylinderGeometry(meineSchraube.d_kern/2, meineSchraube.d_kern/2, l, 64);

const shaft_mesh = new THREE.Mesh(geometry, material);



//########## Hexagon Kopf ###########

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

   //erstellen des "Basis" Kopf teil. 
  function createHexagonBase(radius, height) {
      const shape = createHexagonPath(radius);
      const extrudeSettings = {
          steps: 1,
          depth: height,
          bevelEnabled: false
      };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateX(Math.PI / 2);
    geometry.translate(0, (l -meineSchraube.kopfhoehe/2 ), 0);
    return geometry;
  }

  //erstellen des "Abgerundeten" kopf teil. oben
  function createTopRounding(radius, height, segments = 6) {
      const shape = new THREE.Shape();
      for (let i = 0; i < segments; i++) {
          const angle = (i / segments) * Math.PI * 2;
          const r = radius * 0.88445; // etwas kleiner für sauberen Übergang
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          if (i === 0) shape.moveTo(x, y);
          else shape.lineTo(x, y);
      }
      shape.closePath();

      const extrudeSettings = {
          steps: 5,
          depth: height,
          bevelEnabled: true,
          bevelSegments: 1,
          bevelSize: radius * 0.1,
          bevelThickness: height
      };

      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geometry.rotateX(Math.PI / 2);
    geometry.translate(0, (l - meineSchraube.kopfhoehe / 2) * 1.0005, 0); // nach oben auf Kopf setzen
      return geometry;
  }


//########## Hexagon Kopf Geometrie und Gruppe ###########
const hexBase = createHexagonBase(meineSchraube.s / 2, meineSchraube.kopfhoehe);
const hexTop = createTopRounding(meineSchraube.s / 2, meineSchraube.kopfhoehe / 12);

const hexHead = new THREE.Group();

const hexBaseMid = new THREE.Mesh(hexBase, material)
const hexBaseTOP = new THREE.Mesh(hexTop, material)
 
  hexHead.add(hexBaseMid);
  hexHead.add(hexBaseTOP);



//####################### Rotation / Position #########


shaft_mesh.position.set(0,(l/2) -meineSchraube.kopfhoehe , 0);
gewindeMesh.rotation.x = Math.PI * 1.5;
gewindeMesh.position.set(0, - meineSchraube.kopfhoehe*0.9 , 0);


//Meshes in gruppe adden
schraube.add(gewindeMesh);
schraube.add(shaft_mesh);

//"hexHead" gruppe für den Kopbzw. beide Kopfteile
hexHead.position.y = meineSchraube.kopfhoehe/2;
schraube.add(hexHead);



schraube.position.set(0, -l+meineSchraube.kopfhoehe +positionY, 0);


hexBaseMid.name = id;
hexBaseTOP.name = id;
hexHead.name = id;
gewindeMesh.name = id;
shaft_mesh.name = id;
schraube.name = id;


 




scene.add(schraube);

//########### end code Three.js ##############


const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
light.position.set(10, 10, 10);
scene.add(light);

camera.position.set(0, 40, 450);


const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 0, 0);
controls.update();

fitCameraToObject(camera, schraube, controls);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
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



function fitCameraToObject(camera, object, controls) {

  const box = new THREE.Box3().setFromObject(object);

  const size = box.getSize(new THREE.Vector3());

  const center = box.getCenter(new THREE.Vector3());



  const maxDim = Math.max(size.x, size.y, size.z);

  const fov = camera.fov * (Math.PI / 180);

  let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));



  cameraZ *= 0.6; // Zoomfaktor 



  const offsetX = -maxDim * 0.65; // leicht von der Seite

  const offsetY = maxDim * 0.3; // leicht von oben



  camera.position.set(center.x + offsetX, center.y + offsetY, center.z + cameraZ);



  camera.near = maxDim / 100;

  camera.far = maxDim * 10;

  camera.updateProjectionMatrix();



  camera.lookAt(center);



  if (controls) {

    controls.target.copy(center);

    controls.update();

  }

}