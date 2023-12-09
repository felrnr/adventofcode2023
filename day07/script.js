var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

const LABELS = {
    FIVE_OF_A_KIND: 6,
    FOUR_OF_A_KIND: 5,
    FULL_HOUSE: 4,
    THREE_OF_A_KIND: 3,
    TWO_PAIR: 2,
    ONE_PAIR: 1,
    HIGH_CARD: 0,
};

const P1_CARD_VALUES = {
    "A": 14,
    "K": 13,
    "Q": 12,
    "J": 11,
    "T": 10,
    "9": 9,
    "8": 8,
    "7": 7,
    "6": 6,
    "5": 5,
    "4": 4,
    "3": 3,
    "2": 2
};

function getHandType(cards, enableJokers=false) {
    const cardMap = cards.split('').reduce((counts, card) => ({...counts, [card]: (counts[card] || 0) + 1}), {});
    let jokers = enableJokers ? (cardMap["J"] || 0) : 0;
    let cardCounts = enableJokers
        ? Object.entries(cardMap).filter(([c]) => c !== "J").map(([,v]) => v).sort((a,b) => b - a)
        : Object.values(cardMap).sort((a,b) => b - a);

    if ((cardCounts[0] || 0) + jokers === 5) return LABELS.FIVE_OF_A_KIND;
    if (cardCounts[0] + jokers === 4) return LABELS.FOUR_OF_A_KIND;
    if (cardCounts[0] + jokers === 3 && cardCounts[1] === 2) return LABELS.FULL_HOUSE;
    if (cardCounts[0] + jokers === 3 && cardCounts[1] === 1) return LABELS.THREE_OF_A_KIND;
    if (cardCounts[0] + jokers === 2 && cardCounts[1] === 2) return LABELS.TWO_PAIR;
    if (cardCounts[0] + jokers === 2 && cardCounts[1] === 1) return LABELS.ONE_PAIR;
    return LABELS.HIGH_CARD;
}

const compare = (cardLookup) => (hand1, hand2) => {
    if (hand1.type !== hand2.type) return hand1.type - hand2.type;
    for (let i = 0; i < hand1.cards.length; i++) {
        const delta = cardLookup[hand1.cards.charAt(i)] - cardLookup[hand2.cards.charAt(i)];
        if (delta !== 0) return delta;
    }
    return 0;
}

// Part 1
const p1winnings = data.split('\n')
    .map(line => line.split(' '))
    .map(([cards, bid]) => ({cards, type: getHandType(cards), bid: Number(bid)}))
    .sort(compare(P1_CARD_VALUES))
    .reduce((total, {bid}, rank) => total + (bid * (rank + 1)), 0)
console.log(p1winnings);

// Part 2
const p2winnings = data.split('\n')
    .map(line => line.split(' '))
    .map(([cards, bid]) => ({cards, type: getHandType(cards, enableJokers=true), bid: Number(bid)}))
    .sort(compare({...P1_CARD_VALUES, "J":1}))
    .reduce((total, {bid}, rank) => total + (bid * (rank + 1)), 0)
console.log(p2winnings);
