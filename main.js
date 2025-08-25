const prompt = require('prompt-sync')({ sigint: true });

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';

class Field {
    constructor(field) {
        this._field = field;
        this._position = this._field[0][0]
        this._j = 0;
        this._i = 0;
    }

    move(input) {
        if (input === "r") {
            this._j++;

        } else if (input === "l") {
            this._j--;

        } else if (input === "u") {
            this._i--;

        } else if (input === "d") {
            this._i++;

        }

        if (!this._field[this._i] || !this._field[this._i][this._j]) {
            return { code: false, msg: "Sorry, Out of bounds!" }
        }
        else if (this._field[this._i][this._j] === 'O') {
            return { code: false, msg: "Sorry, You fell into a hole!" }
        } else if (this._field[this._i][this._j] === '^') {
            return { code: false, msg: "Congrats! You found your hat!" }
        } else {
            this._field[this._i][this._j] = "*";
            return { code: true }
        }

    }
    print() {
        for (const r of this._field) {
            console.log(r.toString())

        }
    }

    static getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    static generate(height, width, percentage) {
        const numOfHoles = Math.floor(height * width * (percentage / 100));
        const field = []

        for (let i = 0; i < height; i++) {
            // console.log(Array(width).fill('░'))
            field.push(Array(width).fill('░'));
        }
        let j = numOfHoles === 0 ? 1 : numOfHoles;
        // console.log(field)
        while (j > 0) {
            let randWidth = Math.floor(this.getRandomArbitrary(1, width));
            let randHeight = Math.floor(this.getRandomArbitrary(0, height));
            // console.log(width, height)
            if (field[randHeight][randWidth] !== 'O') {
                field[randHeight][randWidth] = 'O'
                j--;
            }
            // console.log(field)
        }
        let place = true
        while (place) {
            let randWidth = Math.floor(this.getRandomArbitrary(0, width));
            let randHeight = Math.floor(this.getRandomArbitrary(0, height));
            // console.log(width, height)
            if (field[randHeight][randWidth] !== 'O') {
                field[randHeight][randWidth] = '^'
                place = false;
            }
            // console.log(field)
        }
        // console.log(field)
        field[0][0] = '*';
        return field
    }
}

const myField = new Field(Field.generate(15, 10, 50));
let play = true;
let res;
while (play) {
    myField.print()
    let move = prompt("Which way?").toLowerCase();
    res = myField.move(move)
    play = res.code;
}
console.log(res.msg);



