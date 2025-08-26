// npm i prompt-sync
const prompt = require('prompt-sync')({ sigint: true });

// ---------- Constants ----------
const HAT = '^';
const HOLE = 'O';
const FIELD = '░';
const PATH = '*';

const DIRS = {
    // Arrow-style aliases
    r: [0, 1], right: [0, 1],
    l: [0, -1], left: [0, -1],
    u: [-1, 0], up: [-1, 0],
    down: [1, 0],

    // True WASD
    w: [-1, 0], // up
    a: [0, -1], // left
    s: [1, 0],  // down
    d: [0, 1],  // right
};


// ---------- Utils ----------
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ---------- Field ----------
class Field {
    constructor(field) {
        this._field = field;
        this._i = 0;
        this._j = 0;
    }

    inBounds(i, j) {
        return i >= 0 && j >= 0 && i < this._field.length && j < this._field[0].length;
    }

    tile(i, j) {
        return this._field[i][j];
    }

    setTile(i, j, v) {
        this._field[i][j] = v;
    }

    print() {
        for (const row of this._field) console.log(row.join(''));
    }

    move(inputRaw) {
        const key = (inputRaw || '').toLowerCase();
        const dir = DIRS[key] || null;

        if (!dir) return { code: true, msg: "Use w/a/s/d or u/l/d/r. (q to quit)" };

        const [di, dj] = dir;
        const ni = this._i + di;
        const nj = this._j + dj;

        if (!this.inBounds(ni, nj)) {
            return { code: false, msg: "Sorry, out of bounds!" };
        }

        const t = this.tile(ni, nj);
        if (t === HOLE) return { code: false, msg: "Sorry, you fell into a hole!" };
        if (t === HAT) return { code: false, msg: "Congrats! You found your hat!" };

        // advance and leave a trail
        this._i = ni;
        this._j = nj;
        this.setTile(this._i, this._j, PATH);
        return { code: true };
    }

    // ---------- Generation ----------
    static generate(height, width, percentage = 20) {
        // sanitize inputs
        height = Math.max(2, Math.floor(height));
        width = Math.max(2, Math.floor(width));
        percentage = Math.max(0, Math.min(percentage, 80)); // keep it playable

        const maxCells = height * width;
        const maxHoles = Math.max(0, maxCells - 2); // leave room for start + hat
        const holeCount = Math.min(Math.floor(maxCells * (percentage / 100)), maxHoles);

        // Build until solvable (cap attempts)
        const MAX_TRIES = 500;
        for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
            // base field
            const field = Array.from({ length: height }, () => Array(width).fill(FIELD));
            field[0][0] = PATH; // start

            // choose unique hole cells (exclude 0,0)
            const used = new Set(['0,0']);
            let placed = 0;
            while (placed < holeCount) {
                const i = randInt(0, height - 1);
                const j = randInt(0, width - 1);
                const key = `${i},${j}`;
                if (!used.has(key)) {
                    field[i][j] = HOLE;
                    used.add(key);
                    placed++;
                }
            }

            // place hat on a non-hole, non-start cell
            let hi, hj;
            do {
                hi = randInt(0, height - 1);
                hj = randInt(0, width - 1);
            } while (field[hi][hj] !== FIELD);
            field[hi][hj] = HAT;

            // check solvable
            if (Field._isSolvable(field)) return field;
        }

        // Fallback: super sparse field if we somehow failed a lot
        const fallback = Array.from({ length: height }, () => Array(width).fill(FIELD));
        fallback[0][0] = PATH;
        fallback[height - 1][width - 1] = HAT;
        return fallback;
    }

    static _isSolvable(field) {
        const H = field.length, W = field[0].length;
        const q = [[0, 0]];
        const seen = new Set(['0,0']);
        const moves = [[1, 0], [-1, 0], [0, 1], [0, -1]];

        while (q.length) {
            const [i, j] = q.shift();
            if (field[i][j] === HAT) return true;
            for (const [di, dj] of moves) {
                const ni = i + di, nj = j + dj;
                const key = `${ni},${nj}`;
                if (
                    ni >= 0 && nj >= 0 && ni < H && nj < W &&
                    !seen.has(key) &&
                    field[ni][nj] !== HOLE
                ) {
                    seen.add(key);
                    q.push([ni, nj]);
                }
            }
        }
        return false;
    }
}

// ---------- Game loop ----------
function runGame({ height = 15, width = 10, holePercent = 35 } = {}) {
    const myField = new Field(Field.generate(height, width, holePercent));
    console.log(`\nFind the ${HAT}. Avoid ${HOLE}. You are ${PATH}.`);
    console.log("Move with w/a/s/d (or u/l/d/r). Press q to quit.\n");

    let play = true;
    let res = { code: true };
    while (play) {
        myField.print();
        const move = prompt("\nWhich way? ").trim().toLowerCase();
        if (move === 'q') return console.log("\nGoodbye!");
        res = myField.move(move);
        if (res.msg) console.log(res.code ? `\n${res.msg}\n` : "");
        play = res.code;
    }
    console.log(`\n${res.msg}\n`);
}

// Tweak sizes/holes here if you like:
runGame({ height: 15, width: 10, holePercent: 50 });
