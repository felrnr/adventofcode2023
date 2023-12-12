var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

const rawMap = data.split('\n').map(line => line.split(''));
const galaxiesPerRow = rawMap.map(row => row.filter(v => v === "#").length);
const galaxiesPerCol = rawMap[0].map((_,x) => rawMap.filter(v => v[x] === "#").length);

function computeTotalDistance(expansionSize) {
    totalDistance = 0;
    // Total vertical distance
    for (let y1 = 0; y1 < rawMap.length; y1++) {
        let srcGalaxies = galaxiesPerRow[y1];
        let weight = 1;
        for (let y2 = y1+1; y2 < rawMap.length; y2++) {
            totalDistance += weight * srcGalaxies * galaxiesPerRow[y2];
            weight += (galaxiesPerRow[y2] === 0) ? expansionSize : 1;
        }
    }
    // Total horizontal distance
    for (let x1 = 0; x1 < rawMap[0].length; x1++) {
        let srcGalaxies = galaxiesPerCol[x1];
        let weight = 1;
        for (let x2 = x1+1; x2 < rawMap[0].length; x2++) {
            totalDistance += weight * srcGalaxies * galaxiesPerCol[x2];
            weight += (galaxiesPerCol[x2] === 0) ? expansionSize : 1;
        }
    }
    console.log(totalDistance);
}

computeTotalDistance(2);
computeTotalDistance(1e6);
