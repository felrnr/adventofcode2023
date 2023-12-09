var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

const [directionPart, mappingPart] = data.split('\n\n');
const directions = directionPart.split('').map(c => ((c==="L") ? 0 : 1));
const routeMap = Object.fromEntries(
    mappingPart.split('\n')
        .map(line => [...line.matchAll("[\\w]{3}")].flat())
        .map(([k,l,r]) => [k,[l,r]])
);

// Part 1
function findRoute(start="AAA", end="ZZZ") {
    let steps = 0;
    let current = start;
    while (!current.endsWith(end)) {
        current = routeMap[current][directions[steps % directions.length]];
        steps++;
    }
    return steps;
}

let p1 = findRoute();
console.log(p1);

// Part 2
function buildLookup(start) {
    let steps = 0;
    let round = 0;
    let roundStep = 0;
    let current = start;
    let ZEncounters = {};
    while (true) {
        current = routeMap[current][directions[roundStep]];
        steps++;
        roundStep = steps % directions.length;
        if (roundStep === 0) round++;

        if (current.endsWith("Z")) {
            if (ZEncounters[current] === undefined) {
                ZEncounters[current] = [];
            } else if (ZEncounters[current].some(([, rs]) => rs === roundStep)) {
                // Already seen at the same point in the cycle.
                break;
            }
            ZEncounters[current].push([round, roundStep])
        }
    }
    if (Object.keys(ZEncounters).length > 1) throw Error("Multiple ends detected");

    return ZEncounters[current].at(-1);
}
let stepsToEnd = Object.keys(routeMap).filter(v => v.endsWith("A")).map(start => [start, ...buildLookup(start)]);
console.log(JSON.stringify(stepsToEnd, undefined, 2));

// All have exactly one cycle with a single end node and 0 offset...
// Find the first round where all cycles are aligned.
function findFirstCycleAlignmentRound(...inputs) {
    let prime = 2;
    let primes = [];
    let result = inputs.map(remaining => ({remaining, factorization: {}}));
    do {
        if (prime > Math.max(...result.map(e => e.remaining)))
            throw Error("Woops something went wrong during factorization");

        result = result.map(({remaining, factorization}) => {
            let factor = 0;
            while (remaining % prime === 0) {
                factor ++;
                remaining /= prime;
            }
            return {
                remaining,
                factorization: {...factorization, [prime]: factor},
            };
        });

        // Find next prime
        primes.push(prime);
        while (primes.some(p => ((prime % p) === 0))) prime++;
    } while (result.some(({remaining}) => remaining > 1))

    // Find least common multiple
    return primes
        .map(p => [p, Math.max(...result.map(({factorization}) => factorization[p]))])
        .filter(([,factor]) => factor > 0)
        .reduce((num, [p,factor]) => num * p**factor, 1);
}

let p2 = findFirstCycleAlignmentRound(...stepsToEnd.map(([,rounds,]) => rounds)) * directions.length;
console.log(p2);