var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

const inputs = data.split('\n').map(line => line.split(' ').map(Number));

// Part 1
function buildDerivatives(readings=[1]) {
    let stack = [[...readings]];
    let layer = 0;
    while (stack[layer].some(v => v !== 0)) {
        const newLayer = [...Array(stack[layer].length-1).keys()].map(i => stack[layer][i+1] - stack[layer][i]);
        layer++;
        stack[layer] = newLayer;
        if (newLayer.length === 0) throw Error("Woops 0 length derivative left...");
    }
    return stack;
}

function printPyramid(stack) {
    let width = stack[0].at(-1).toString().length+1;
    if (width % 2 > 0) width++;
    stack.forEach((layer, idx) =>
        console.log(' '.repeat((idx*0.5) * width) + layer.map(v => v.toString().padStart(width)).join(''))
    );
}

function getNextValue(readings, mode="right") {
    let stacks = buildDerivatives(readings);
    if (mode==="right") stacks.at(-1).push(0);
    else stacks.at(-1).unshift(0);

    stacks.forEach((_, idx) => {
        if (idx === 0) return;
        if (mode === "right")
            stacks.at(-(idx+1)).push(stacks.at(-(idx+1)).at(-1) + stacks.at(-idx).at(-1));
        else
            stacks.at(-(idx+1)).unshift(stacks.at(-(idx+1))[0] - stacks.at(-idx)[0]);
    });

    // printPyramid(stacks);
    return (mode === "right") ? stacks[0].at(-1) : stacks[0][0];
}

const p1 = inputs
    .map(readings => getNextValue(readings))
    .reduce((a,b) => a+b);
console.log(p1);

// Part 2
const p2 = inputs
    .map(readings => getNextValue(readings, mode="left"))
    .reduce((a,b) => a+b);
console.log(p2);
