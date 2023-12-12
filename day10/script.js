var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

const rawMap = data.split('\n').reverse().map(line => line.split(''));
const height = rawMap.length;
const width = rawMap[0].length;
const SYMBOL_CONNECTIONS = {
    '|': {N: true, E: false, S: true, W: false},
    '-': {N: false, E: true, S: false, W: true},
    'L': {N: true, E: true, S: false, W: false},
    'J': {N: true, E: false, S: false, W: true},
    '7': {N: false, E: false, S: true, W: true},
    'F': {N: false, E: true, S: true, W: false},
    'S': {N: true, E: true, S: true, W: true},
    '.': {N: false, E: false, S: false, W: false},
};

// N E S W
const NEIGHBOURS = [
    [1,0],
    [0,1],
    [-1,0],
    [0,-1],
];

const isInBounds = ([y,x]) => (y>=0 && y<height && x>=0 && x<width);

const displaySymbol = (symbol) => {
    if (symbol === "-") return "─";
    if (symbol === "|") return "│";
    if (symbol === "L") return "└";
    if (symbol === "J") return "┘";
    if (symbol === "7") return "┐";
    if (symbol === "F") return "┌";
    return symbol;
}
function drawMap(map, toFile=false) {
    let prefixWidth = map.length.toString().length;
    let lines = [];
    for (let i = map.length-1; i >= 0; i--)
        lines.push(i.toString().padStart(prefixWidth) + ' ' + map[i].map(displaySymbol).join(''));

    lines.forEach(line => console.log(line));

    if (toFile) fs.writeFileSync(path.join(__dirname, "solution.map"), lines.join('\n'));
}

function findStartPosition(map) {
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[0].length; x++) {
            if (map[y][x] === "S") return [y,x];
        }
    }
    throw Error("Start not found.")
};

function isConnected([y1,x1], [y2, x2], map) {
    // bounds check
    if (!isInBounds([y1,x1]) || !isInBounds([y2,x2])) return false;
    if (Math.abs(y2-y1) + Math.abs(x2-x1) !== 1)
        throw Error("Comparing non-neighbour nodes...");

    const con1 = SYMBOL_CONNECTIONS[map[y1][x1]];
    const con2 = SYMBOL_CONNECTIONS[map[y2][x2]];
    if ((y2 - y1) ===  1 && con2.S && con1.N) return true;
    if ((y2 - y1) === -1 && con2.N && con1.S) return true;
    if ((x2 - x1) ===  1 && con2.W && con1.E) return true;
    if ((x2 - x1) === -1 && con2.E && con1.W) return true;
    return false;
}

function determineStartSymbol(map) {
    const [y,x] = findStartPosition(map);
    const [north, east, south, west] = NEIGHBOURS.map(([dy, dx]) => isConnected([y, x], [y+dy, x+dx], map));

    let symbol;
    if (north && south) symbol = '|';
    if (east  && west) symbol = '-';
    if (north && east) symbol = 'L';
    if (north && west) symbol = 'J';
    if (south && west) symbol = '7';
    if (south && east) symbol = 'F';

    if (symbol === undefined) throw Error('No startSymbol found!');

    return [[y,x], symbol];
}

const coordsToString = (coords) => coords.map(c => c.toString()).join(',');
const stringToCoords = (s) => s.split(',').map(Number);

function buildLoopMap(rawMap) {
    const [[y0,x0], startSymbol] = determineStartSymbol(rawMap);

    let map = rawMap.map(r => r.slice().map(() => '.'));
    map[y0][x0] = startSymbol;

    let distances = map.map(r => r.slice().map(() => -1));
    distances[y0][x0] = 0;
    let maxDistance = 0;

    drawMap(rawMap);
    // drawMap(map);
    let frontier = new Set([coordsToString([y0,x0])]);

    const getNext = () => {
        const newPair = frontier.values().next().value;
        frontier.delete(newPair);
        return stringToCoords(newPair);
    }

    while (frontier.size > 0) {
        const [y,x] = getNext();
        NEIGHBOURS
            .filter(([dy,dx]) => isConnected([y,x], [y+dy, x+dx], rawMap)) // Filter only connected.
            .filter(([dy,dx]) => map[y+dy][x+dx] === '.') // Filter already explored.
            .forEach(([dy,dx]) => {
                if (distances[y+dy][x+dx] === -1) distances[y+dy][x+dx] = distances[y][x] + 1;
                if (distances[y+dy][x+dx] > distances[y][x] + 1) distances[y+dy][x+dx] = distances[y][x] + 1;
                if (distances[y+dy][x+dx] > maxDistance) maxDistance = distances[y+dy][x+dx];
                map[y+dy][x+dx] = rawMap[y+dy][x+dx];
                frontier.add(coordsToString([y+dy, x+dx]));
            });
    }

    return [map, distances, maxDistance];
}

let [map, distances, maxDistance] = buildLoopMap(rawMap);
console.log(maxDistance);
drawMap(map);


// Part 2
const LEFT = -1;
const RIGHT = 1;
function leftOrRight([dy1,dx1],[dy2,dx2]) {
    return (dy1 * dx2) - (dx1 * dy2);
    // if (dy1 === 1 && dx2 === 1) return "R";
    // if (dy1 === 1 && dx2 === -1) return "L";
    // if (dy1 === -1 && dx2 === 1) return "L";
    // if (dy1 === -1 && dx2 === -1) return "R";
    // if (dx1 === 1 && dy2 === 1) return "L";
    // if (dx1 === 1 && dy2 === -1) return "R";
    // if (dx1 === -1 && dy2 === 1) return "R";
    // if (dx1 === -1 && dy2 === -1) return "L";

    // return "S";
}

function getPosition([dy,dx], side) {
    if (side === LEFT) return [dx, -dy || 0];
    if (side === RIGHT) return [-dx || 0, dy];
    return [dy,dx];
}


// Return next position, direction and what turn was made.
function getNextDirection([y,x], [dy,dx]) {
    let {N,E,S,W} = SYMBOL_CONNECTIONS[map[y+dy][x+dx]];
    if (N && dy === -1) N = false;
    else if (E && dx === -1) E = false;
    else if (S && dy === 1) S = false;
    else if (W && dx === 1) W = false;
    y += dy;
    x += dx;

    if (N) [dy,dx] = [1,0];
    if (E) [dy,dx] = [0,1];
    if (S) [dy,dx] = [-1,0];
    if (W) [dy,dx] = [0,-1];
    return [[y,x], [dy,dx]];
}

// Map that includes only the pipe segments that belong to the main loop.
// All other tiles are replaced with ground.
function buildCleanMap(srcMap, loop) {
    let cleanMap = srcMap.map(r => r.slice().map(() => '.'));
    loop.forEach(([y,x]) => cleanMap[y][x] = srcMap[y][x]);
    return cleanMap;
}

function findLoopRoute() {
    const [y0,x0] = findStartPosition(rawMap);
    const startSymbol = map[y0][x0];
    const startDirections = SYMBOL_CONNECTIONS[startSymbol];

    let [y,x] = [y0,x0];
    let loop = [[y0,x0]]; // Keep track of all segments connected to the loop (in order starting from startpoint.)

    let [dy,dx] = [0,0];
    if (startDirections.N) dy++;
    else if (startDirections.E) dx++;
    else if (startDirections.S) dy--;
    else if (startDirections.W) dx--;
    const startDirection = [dy,dx]; // Cache start direction for extra runs.

    console.log([y0,x0]);
    console.log([y,x]);
    console.log(startDirection);

    let [leftTurns, rightTurns] = [0,0];
    do {
        const oldDirection = [dy,dx]; // Cache direction.
        [[y,x], [dy,dx]] = getNextDirection([y,x], [dy,dx]);
        loop.push([y,x]);
        const turn = leftOrRight(oldDirection, [dy,dx])
        if (turn === RIGHT) rightTurns++;
        if (turn === LEFT) leftTurns++;
    } while (y !== y0 || x !== x0)
    console.log(`Done. Rightturns ${rightTurns}. Leftturns ${leftTurns}`);

    let cleanMap = buildCleanMap(map, loop);
    // Second iteration to paint the inside.
    [y,x] = [y0,x0]; // Reset start location
    [dy,dx] = startDirection; // Reset start direction
    const insideDirection = (leftTurns > rightTurns) ? LEFT : RIGHT;
    do {
        const [dy_o, dx_o] = [dy, dx]; // cache old direction for bends.
        [[y,x], [dy,dx]] = getNextDirection([y,x], [dy,dx]);
        [[dy,dx], [dy_o,dx_o]].forEach(([dy,dx]) => {
            const [dy_n, dx_n] = getPosition([dy,dx], insideDirection); // Get position of neighbour on "inside"
            if (isInBounds([y+dy_n, x+dx_n]) && cleanMap[y+dy_n][x+dx_n] === ".") {
                cleanMap[y+dy_n][x+dx_n] = "I";
                // drawMap(cleanMap);
            }
        });

    } while (y !== y0 || x !== x0)
    drawMap(cleanMap);


    // flood fill all areas to get grounds tiles that do not directly touch the inside of the loop.
    let frontier = new Set(
        cleanMap.flatMap((r,rowIdx) =>
            r.map((c, colIdx) => [rowIdx, colIdx])
             .filter(([rowIdx, colIdx]) => cleanMap[rowIdx][colIdx] === "I")
             .map(([rowIdx, colIdx]) => coordsToString([rowIdx,colIdx]))
    ));

    const getNext = () => {
        const newPair = frontier.values().next().value;
        frontier.delete(newPair);
        return stringToCoords(newPair);
    }
    let insideTiles = frontier.size;
    while (frontier.size > 0) {
        const [y,x] = getNext();
        NEIGHBOURS
            .filter(([dy,dx]) => cleanMap[y+dy][x+dx] === '.')
            .forEach(([dy,dx]) => {
                cleanMap[y+dy][x+dx] = "I";
                frontier.add(coordsToString([y+dy, x+dx]));
                insideTiles++;
            });
    }
    console.log(insideTiles);

    drawMap(cleanMap, toFile=true);
}

findLoopRoute();

