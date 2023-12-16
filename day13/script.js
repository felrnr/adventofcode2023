var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

const patterns = data.split('\n\n').map(section => section.split('\n').map(row => row.split('')));

function findHorizontalReflection(pattern, expectedMismatches) {
    for (let i = 1; i < pattern[0].length; i++) {
        // Mirror position between i-1 and i
        const range = Math.min(i, pattern[0].length - i);
        let mismatches = 0;
        for (let j = 1; j <= range; j++) {
            mismatches += pattern.filter(row => row[i-j] !== row[i+j-1]).length
            if (mismatches > expectedMismatches) break;
        }
        if (mismatches === expectedMismatches)
            return { mirrorPosition: i, value: i, orientation: 'Column'};
    }
    return null;
}

function findVerticalReflection(pattern, expectedMismatches) {
    for (let i = 1; i < pattern.length; i++) {
        // Mirror position between i-1 and i
        const range = Math.min(i, pattern.length - i);
        let mismatches = 0;
        for (let j = 1; j <= range; j++) {
            // Compare the rows at offset j from potential mirror.
            mismatches += pattern[i-j].filter((v, col) => v !== pattern[i+j-1][col]).length;
            if (mismatches > expectedMismatches) break;
        }
        if (mismatches === expectedMismatches)
            return { mirrorPosition: i, value: 100 * i, orientation: 'Row' };
    }
    return null;
}

function findMirrorPosition(pattern, expectedMismatches=0) {
    let result = findHorizontalReflection(pattern, expectedMismatches);
    if (result === null) result = findVerticalReflection(pattern, expectedMismatches);
    return result;
}

const p1SummaryValue = patterns.map(p => findMirrorPosition(p))
    .reduce((s, {value}) => s + value, 0);
console.log(p1SummaryValue);


// Part 2
const p2SummaryValue = patterns.map(p => findMirrorPosition(p, expectedMismatches=1))
    .reduce((s, {value}) => s + value, 0);
console.log(p2SummaryValue);
