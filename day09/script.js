var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input_test.txt");
const data = fs.readFileSync(filepath).toString();

const inputs = data.split('\n').map(line => line.split(' ').map(Number));

// Part 1
function buildDerivatives(readings=[1]) {
    let stack = [[...readings]];
    let layer = 0;
    while (stack[layer].some(v => v !== 0)) {
        let newLayer = [...Array(stack[layer].length-1).keys()].map(i => stack[layer][i+1] - stack[layer][i]);
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

function getNextValue(readings) {
    let stacks = buildDerivatives(readings);
    const N = stacks.length;
    stacks.at(-1).push(0);
    stacks.forEach((_, idx) => {
        if (idx === 0) return;
        stacks[N - (idx+1)].push(stacks[N - (idx+1)].at(-1) + stacks[N-(idx)].at(-1));
    });
    // printPyramid(stacks);
    return stacks[0].at(-1);
}

let p1 = inputs.map((readings, idx) => {
    // console.log(`Readings ${idx}`)
    // printPyramid(buildDerivatives(readings));

    return getNextValue(readings)
}).reduce((a,b) => a+b);

console.log(p1);

