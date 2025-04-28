
# Three.js Objekt Export Projekt

Dieses Projekt zeigt, wie man in einer modernen Vite + Three.js Umgebung ein 3D-Objekt erstellt und es als `.gltf` Datei exportiert.

## Projektinhalt

- Erstellung eines 3D-Modells mit Three.js
- Nutzung von LatheGeometry und ExtrudeGeometry
- Nutzung von GLTFExporter zum Exportieren des 3D-Modells
- Setup mit Vite für modernes Development (ES6-Module)

## Voraussetzungen

- Node.js (>= v16)
- npm (wird mit Node.js installiert)
- Vite (wird automatisch installiert)

## Installation

1. Projekt clonen oder herunterladen
2. Terminal öffnen und ins Projektverzeichnis wechseln
3. Folgende Befehle ausführen:

```bash
npm install
npx vite
```

Das Projekt wird über `http://localhost:5173` erreichbar sein.

## Nutzung

- Das Objekt wird automatisch beim Laden der Seite erstellt.
- Mit der Taste `E` kann das aktuelle 3D-Objekt als `.gltf` Datei heruntergeladen werden.

## Projektstruktur

```plaintext
/
├── index.html
├── main.js
├── package.json
├── vite.config.js (optional)
└── node_modules/ (automatisch nach npm install)
```

## Technologien

- [Three.js](https://threejs.org/)
- [Vite](https://vitejs.dev/)

## Hinweise

- Alle Three.js Abhängigkeiten werden über `npm` verwaltet.
- Das Projekt verwendet moderne `import/export` Module.
- Es wird kein klassischer "Live Server" genutzt, sondern der Vite Development Server.

## Lizenz

Dieses Projekt steht unter keiner speziellen Lizenz und ist für Lern- und Demonstrationszwecke gedacht.

## Autor

- Erstellt von Alexander Hoffmann (Drotok)
