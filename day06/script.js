var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

// Part 1
const races = data.split('\n')
    .map(line => line.split(':')[1].trim().split(/\s+/).map(Number))
    .reduce((times, distances) => [...times.keys()].map(i => ([times[i], distances[i]])));

function findStrategies([time, distance]) {
    for (let i = 1; i < Math.floor(time / 2); i++) {
        if (i * (time-i) > distance) return [i, time-i];
    }
    return null;
}

let p1 = races.map((race) => findStrategies(race))
    .map(([start, end]) => end-start + 1)
    .reduce((a,b) => a*b);

console.log(p1);

// Part 2
let monsterRace = data.split('\n').map(line => line.replaceAll(' ', '').split(':')[1]).map(Number)
let p2 = findStrategies(monsterRace).reduceRight((a,b) => a - b) + 1;
console.log(p2);
