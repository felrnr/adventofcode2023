var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

// Part 1
const schematic = data.split('\n');

function findMatches(row, lineNr) {
    let matches = [];
    let iStart = null;
    for (let i = 0; i < row.length; i++) {
        const char = row.charAt(i);
        if (/\d/.test(char)) {
            if (iStart === null) iStart = i;
            continue;
        }
        if (iStart !== null) {
            matches.push({lineNr, idx: iStart, span: (i - iStart), num: Number(row.substring(iStart, i))})
            iStart = null;
        }
    }
    if (iStart !== null) matches.push({lineNr, idx: iStart, span: 1 + (row.length - iStart), num: Number(row.substring(iStart))});

    return matches;
}

function findNeighbours(lineNr, iStart, span) {
    let neighbours = [];
    for (let i = iStart-1; i <= iStart+span; i++) {
        neighbours.push([lineNr - 1, i]);
        neighbours.push([lineNr + 1, i]);
        if (i === iStart-1 || i === iStart+span) {
            neighbours.push([lineNr, i]);
        }
    }
    return neighbours.filter(([y,x]) => ((y >= 0 && y < schematic.length) && (x >= 0 && x < schematic[0].length)));
}

const engineParts = schematic
    .flatMap(findMatches)
    .filter(({lineNr, idx, span}) =>
        findNeighbours(lineNr, idx, span)
            .some(([y,x]) => /[^\d.]/.test(schematic[y].charAt(x)))
    );
const sumParts = engineParts.reduce((total, {num}) => total + num, 0);
console.log(sumParts);

// Part 2
const GEAR_SYMBOL = '*';
const gearNeighbours = engineParts.reduce((partResult, {lineNr, idx, span, num}) =>
    findNeighbours(lineNr, idx, span)
        .filter(([y, x]) => schematic[y].charAt(x) === GEAR_SYMBOL)
        .map(([y, x]) => `${y},${x}`)
        .reduce((gearResult, key) => ({...gearResult, [key]: [num].concat(gearResult[key] || [])}), partResult)
, {});

const sumGearRatios = Object.values(gearNeighbours)
    .filter(v => v.length === 2)
    .reduce((sum, [p1, p2]) => sum + (p1 * p2), 0);

console.log(sumGearRatios);
