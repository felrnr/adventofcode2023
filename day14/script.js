var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

const rockMap = data.split('\n').map(row => row.split(''));
const mapWidth = rockMap[0].length;
const mapHeight = rockMap.length;

const ROLLING_ROCK = 'O';
const SQUARE_ROCK = '#';
const EMPTY = '.';

//  Coordinate orientation
// +------>
// |
// |
// |
// V
function tiltVertical(inputMap, toNorth) {
    let tiltedMap = inputMap.map(row => row.map(c => c === SQUARE_ROCK ? c : EMPTY));
    for (let x = 0; x < mapWidth; x++) {
        let openSlot = (toNorth) ? 0 : mapHeight - 1;
        let dy = (toNorth) ? 1 : -1;
        for (let j = 0; j < mapHeight; j++) {
            let y = (toNorth) ? j : mapHeight - (j+1);
            if (inputMap[y][x] === SQUARE_ROCK) openSlot = y + dy;
            if (inputMap[y][x] === ROLLING_ROCK) {
                tiltedMap[openSlot][x] = ROLLING_ROCK;
                openSlot += dy;
            }
        }
    }
    return tiltedMap;
}

function tiltHorizontal(inputMap, toWest) {
    let tiltedMap = inputMap.map(row => row.map(c => c === SQUARE_ROCK ? c : EMPTY));
    for (let y = 0; y < mapHeight; y++) {
        let openSlot = (toWest) ? 0 : mapWidth - 1;
        let dx = (toWest) ? 1 : -1;
        for (let j = 0; j < mapWidth; j++) {
            let x = (toWest) ? j : mapWidth - (j+1);
            if (inputMap[y][x] === SQUARE_ROCK) openSlot = x + dx;
            if (inputMap[y][x] === ROLLING_ROCK) {
                tiltedMap[y][openSlot] = ROLLING_ROCK;
                openSlot += dx;
            }
        }
    }
    return tiltedMap;
}

function computeLoad(inputMap) {
    return inputMap.map((row, y) =>
         row.reduce((rowLoad, rock) => rowLoad + (rock===ROLLING_ROCK ? (inputMap.length - y) : 0), 0)
    ).reduce((a,b) => a+b);
}

const p1Map = tiltVertical(rockMap, toNorth=true);
const p1Load = computeLoad(p1Map);
console.log(p1Load);

// Part 2
function spin(inputMap, cycles=1) {
    let cycleStartMap = inputMap;
    let allStarts = {};
    const mapToString = (map1) => map1.map(row => row.join('')).join('');
    for (let i = 0; i < cycles; i++) {
        console.log(`Cycle ${i}`);
        if (allStarts[mapToString(cycleStartMap)] !== undefined) {
            console.log(`Seen start before during cycle ${allStarts[mapToString(cycleStartMap)]}`);
            const cycleLength = (i) - allStarts[mapToString(cycleStartMap)];
            const cyclesToGo = ((cycles - (i)) % cycleLength);
            console.log(`Cycle length = ${cycleLength}. CyclesToGo = ${cyclesToGo}`);
            return spin(cycleStartMap, cycles=cyclesToGo);
        }
        allStarts[mapToString(cycleStartMap)] = i;

        // N W S E
        let newMap = tiltVertical(cycleStartMap, toNorth=true);
        newMap = tiltHorizontal(newMap, toWest=true);
        newMap = tiltVertical(newMap, toNorth=false);
        newMap = tiltHorizontal(newMap, toWest=false);
        cycleStartMap = newMap;
    }

    return cycleStartMap;
}

const p2Map = spin(rockMap, cycles=1e9);
const p2Load = computeLoad(p2Map);
console.log(p2Load);
