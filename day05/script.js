var fs = require('fs'),
  path = require('path');

const filepath = path.join(__dirname, "input.txt");
const data = fs.readFileSync(filepath).toString();
const [[seedLine], ...almanacBlocks] = data.split('\n\n').map(block => block.split('\n'))
const seeds = seedLine.split(':')[1].trim().split(' ').map(Number);

const almanac = Object.fromEntries(
    almanacBlocks.map(([header, ...lines], chapterNr) => {
        const [from,,to] = header.split(' ')[0].split('-');
        const mapping = lines.map(line => line.split(' ').map(Number))
            .map(([dest, start, size]) => ({start, dest, size, delta: (dest-start)}))
            .sort((m1,m2) => m1.start - m2.start);
        return [from, {chapterNr, to, mapping}];
    })
);


function findPropertyForSeed(property, seed) {
    let chapter = 'seed';
    let num = seed;
    let path = [[chapter, num]];
    let chaptersRead = new Set();
    while (chapter !== property) {
        if (chaptersRead.has(chapter)) {
            throw Error(`Cycle detected when searching property ${property} for seed ${seed}`);
        }
        if (almanac[chapter] === undefined) {
            throw Error(`Requested property not in almanac... ${property}`)
        }
        chaptersRead.add(chapter);


        let mappingLine = almanac[chapter].mapping.find(({start, size}) => (start <= num && num < start + size));
        if (mappingLine !== undefined) num += mappingLine.delta;

        chapter = almanac[chapter].to;
        path.push([chapter, num]);
    }
    return path.at(-1)[1];
}

let lowestLocation = seeds.map(seed => findPropertyForSeed('location', seed))
    .reduce((a,b) => Math.min(a,b));
console.log(lowestLocation);


// Part 2
const seedRanges = [...Array(seeds.length/2).keys()]
    .map(i => [seeds[2*i], seeds[2*i+1]])
    .sort((p1, p2) => p1[0] - p2[0]);


// Sizes too big, work in reverse. Ditch the dict :c
const almanacChapters = Object.entries(almanac)
    .map(([from, data]) => ({from, ...data}))
    .sort((c1, c2) => c1.chapterNr - c2.chapterNr);

// add "missing" ranges that map to themselves.
const maxSeed = seedRanges.at(-1).reduce((a,b) => a + b-1);
almanacChapters.forEach(chapter => {
    let extraRanges = [];
    let start = 0;
    chapter.mapping.forEach(mapLine => {
        if (start < mapLine.start) {
            extraRanges.push({start, dest: start, size: mapLine.start - start, delta: 0});
        }
        start = mapLine.start + mapLine.size;
    });
    if (start < maxSeed) {
        extraRanges.push({start, dest: start, size: maxSeed - start, delta: 0});
    }
    chapter.mapping = chapter.mapping.concat(extraRanges).sort((m1,m2) => m1.dest - m2.dest);
});


function findLowestInputForRange(property, rangeStart, rangeEnd) {
    if (property === 'seed') {
        for (let i = 0; i < seedRanges.length; i++) {
            const [start,size] = seedRanges[i];
            if (start  <= rangeStart && rangeStart <= start+size-1) return rangeStart;
            if (rangeStart <= start && start <= rangeEnd) return start;
        }
        // No overlapping ranges.
        console.log("       No seed found...");
        return null;
    }

    console.log(`   Checking range for property ${property}: ${rangeStart} - ${rangeEnd}`);

    // Non seed property
    // Find overlapping ranges
    const chapter = almanacChapters.find(chapter => property === chapter.to);
    for (let i = 0; i < chapter.mapping.length; i++) {
        const {delta,dest,size,start} = chapter.mapping[i];
        if (rangeEnd < dest) return null; // ranges increasing, already over target.
        if (dest+size-1 < rangeStart) continue; // Range too low.

        let res = findLowestInputForRange(chapter.from, Math.max(dest, rangeStart)-delta, Math.min(dest+size-1, rangeEnd)-delta);
        if (res !== null) {
            console.log(`       Found seed for property ${property}: ${res}`);
            return res;
        }
    }
    return null;
}


function findSeedForLowestProperty(property) {
    const chapter = almanacChapters.find(chapter => property === chapter.to);
    for (let i = 0; i < chapter.mapping.length; i++) {
        const {dest, start, delta, size} = chapter.mapping[i];
        console.log(`>>> findSeedForLowestProperty(${property}). Range: ${start} - ${start+size-1} =>  ${dest} - ${dest+size-1}`);
        let result = findLowestInputForRange(chapter.from, start, start+size-1);
        if (result !== null) return result;
    }
    return null;
}

let p2Seed = findSeedForLowestProperty('location');
let p2SeedLocation = findPropertyForSeed('location', p2Seed)
console.log(`Part2: Lowest location ${p2SeedLocation} found for seed ${p2Seed}`);
