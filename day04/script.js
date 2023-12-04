var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

// Part 1
const cards = data.split('\n').map(line => {
    let [cardPart, numberPart] = line.split(':');
    let [winningNumbersPart, cardNumbersPart] = numberPart.split('|');
    return {
        cardNr: Number(cardPart.split(/ +/)[1]),
        winningNumbers: new Set(winningNumbersPart.trim().split(/ +/).map(n => Number(n))),
        numbers: cardNumbersPart.trim().split(/ +/).map(n => Number(n)),
    };
});

const points = cards
    .map(({winningNumbers, numbers}) => numbers.filter(n => winningNumbers.has(n)).length)
    .filter(n => n > 0)
    .reduce((sum, n) => sum + Math.pow(2, n-1), 0);
console.log(points);

// part2
let cardCounts = (new Array(cards.length)).fill(1);
for (let i = 0; i < cards.length; i++) {
    const cardScore = cards[i].numbers.filter(n => cards[i].winningNumbers.has(n)).length;
    for (let j = 1; j <= cardScore; j++) cardCounts[i+j] += cardCounts[i];
}
console.log(cardCounts.reduce((a,b) => a+b));
