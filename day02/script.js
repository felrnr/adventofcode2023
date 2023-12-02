var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

// Part 1
const COLOURS = ['red', 'green', 'blue'];

const games = data.split('\n').map(row => {
    const [gamePart, resultPart] = row.split(':');
    const gameId = Number(gamePart.split(' ')[1]);

    const rounds = resultPart.split(';').map(round => {
        let colorCounts = Object.fromEntries(COLOURS.map(c => [c, null]));
        round.split(',')
            .map(s => s.trim())
            .map(s => s.split(' '))
            .forEach(([count, color]) => colorCounts[color] = Number(count));
        return colorCounts;
    });
    return {gameId, rounds};
});


const maxDice = {'red': 12, 'green': 13, 'blue': 14};
let p1 = games.filter(({rounds}) =>
        rounds.every(colorCounts =>
            COLOURS.every(color => (colorCounts[color] === null || colorCounts[color] <= maxDice[color])))
    )
    .reduce((sum, {gameId}) => sum + gameId, 0);
console.log(p1);


// Part 2
let p2 = games.map(({rounds}) =>
        rounds.map(({red, green, blue}) => [red, green, blue])
            .reduce((currentMax, round) => [0, 1, 2].map(i => Math.max(currentMax[i], round[i])), [0, 0, 0])
    )
    .map(([r, g, b]) => r * g * b)
    .reduce((a, b) => a + b);

console.log(p2);
