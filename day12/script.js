var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

const OPERATIONAL = ".";
const DAMAGED = "#";
const UNKNOWN = "?";

const springConditions = data.split('\n')
    .map(line => {
        const [symbolPart, numberPart] = line.split(' ');
        return [symbolPart, numberPart.split(',').map(Number)];
    });

springConditions.forEach(([s,n]) => console.log(`${s} ${n.toString()}`))

// Part 1
const splitPattern = new RegExp(`\\${OPERATIONAL}+`);
function toNumeric(springConfig) {
    return springConfig.split(splitPattern).map(v => v.length).filter(v => v > 0);
}

console.log(toNumeric(springConditions[0][0]));


function validateConfig(condition, ranges) {
    const computedRanges = toNumeric(condition);
    if (computedRanges.length !== ranges.length) return false;
    for (let i = 0; i < ranges.length; i++) {
        if (computedRanges[i] !== ranges[i]) return false;
    }
    return true;
}

let res = springConditions.map(v => validateConfig(...v))
console.log(res);


function generatePossibleArrangements(condition) {
    let arrangements = [];
    let i = condition.indexOf(UNKNOWN);
    if (i === -1) return [condition];
    [DAMAGED, OPERATIONAL].forEach(c => {
        // let subCondition = condition;
        // subCondition[i] = c;
        let subCondition = '';
        if (i < condition.length) {
            subCondition = condition.slice(0, i);
            subCondition += c;
            subCondition += condition.slice(i+1);
        }
        let subArrangements = generatePossibleArrangements(subCondition);
        arrangements = arrangements.concat(subArrangements);
        // console.log(subCondition);
    })

    // console.log(i);

    return arrangements;
}


let arrangements = springConditions.map(([arrangement, ranges]) => generatePossibleArrangements(arrangement).filter(a => validateConfig(a, ranges)))
let totalArrangements = arrangements.reduce((s,a) => s + a.length, 0)
console.log(totalArrangements);