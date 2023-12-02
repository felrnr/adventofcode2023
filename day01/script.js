var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();

// Part 1
const computeRowTotals = (rows) => {
    const totalSum = rows.map(value => {
        let numbers = Array.from(value).filter(c => /\d/.test(c))
        return Number(numbers.at(0) + numbers.at(-1));
    }).reduce((subTotal, row) => subTotal + row, 0);
    console.log(totalSum);
}
computeRowTotals(data.split('\n'));

// Part 2
const NUMBER_MAP = [['one', '1'], ['two', '2'], ['three', '3'], ['four', '4'], ['five', '5'], ['six', '6'], ['seven', '7'], ['eight', '8'], ['nine', '9']];
function cleanString(sValue) {
    let idx = 0;
    let result = '';

    while (idx < sValue.length) {
        const startIdx = idx;
        for (let i = 0; i < NUMBER_MAP.length; i++) {
            const [patt, repl] = NUMBER_MAP[i];
            if (sValue.startsWith(patt, idx)) {
                idx++; /* important, 'oneight' should count as '18' not '1ight'. Dont skip too far ahead. */
                result += repl;
                break;
            }
        }
        if (idx > startIdx) continue;

        result += sValue.charAt(idx);
        idx++;
    }

    return result;
}
computeRowTotals(data.split('\n').map(cleanString));
