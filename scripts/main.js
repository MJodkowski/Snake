const canvas = document.getElementById("canvas");

const PIXELSIZE = 50;



class PlayingField {
    constructor (pixel) {
        this.eatenFruit = 0;
        this.speed = 200;
        this.pixelSize = pixel;
        this.snake = new Snake(this.pixelSize);
        this.moved = false;
        this.dom = {
            button: document.querySelector('.play-button'),
            titleDiv: document.querySelector('.title-div'),
            canvas: document.getElementById("canvas")
        }
    }
    logKey (e) {
        this.keyCode = e.keyCode;
        if (!this.moved && this.keyCode !== 40) {
            this.game();
            this.moved = true;
        } 
    }
    initializeTitle() {
        this.dom.button.addEventListener('click', ()=> {
            this.dom.titleDiv.style.display = 'none';
            this.dom.canvas.style.display = 'block';
            this.initializeGame();
        })
    }
    initializeGame() {
        this.dom.canvas.width = this.pixelSize * 21;
        this.dom.canvas.height = this.pixelSize * 10;
        this.x = canvas.width;
        this.y = canvas.height;
        this.snake.head = new Square(this.x/2 - 0.5 * this.pixelSize, this.y/2, "black", this.pixelSize);
        this.snake.body = [];
        for (let x = 1; x < 3; x++) {
           this.snake.body.push(new Square(this.snake.head.x, this.snake.head.y + this.pixelSize * x, "black", this.pixelSize)); //DOES NOT TAKE IN VALUES!!!
        }
        window.addEventListener("keydown", (e) => this.logKey(e), false);
        this.snake.head.draw();
        //draw body
        for (let x = 0; x < this.snake.body.length; x++) {
            this.snake.body[x].draw();
        }
        //draw fruit
        this.fruit = new Square(generateCoords(this.x, this.pixelSize), generateCoords(this.y, this.pixelSize), "green", this.pixelSize);
        this.fruit.draw(); 
    }
    game() {
        //listen for key input and change direction
        this.changeDirection();
        //check for collision with wall
        if (collDetectWall(this.snake.head.x, this.snake.head.y, this.x, this.y, this.snake.head.direction, this.snake.head.pixelSize)) {
            this.reset();
            return;
        }
        //collision with itself
        for (let x = 0; x < this.snake.body.length; x ++) {
            if (collDetect(this.snake.head.x, this.snake.head.y, this.snake.body[x]["x"], this.snake.body[x]["y"], this.snake.head.direction, this.pixelSize)) {
                this.reset();
                return;
            }
        }
        //check if fruit was eaten and, if so, generate new fruit
        if (this.eatFruit()) {
            this.fruit = new Square(generateCoords(this.x, this.pixelSize, this.snake.body), generateCoords(this.y, this.pixelSize, this.snake.body), "green", this.pixelSize);
            //check if fruit is not on the snake
            for (let x = 0; x < this.snake.body.length; x++) {
                if ((this.snake.body[x]["x"] === this.fruit.x &&
                    this.snake.body[x]["y"] === this.fruit.y) || (this.snake.head.x === this.fruit.x &&
                    this.snake.head.y === this.fruit.y)) {
                    this.fruit = new Square(generateCoords(this.x, this.pixelSize, this.snake.body), generateCoords(this.y, this.pixelSize, this.snake.body), "green", this.pixelSize);
                    x = 0;
                }
            }
            this.fruit.draw();
        }
        else {
        this.snake.move(this.snake.head.direction);
        }
        //draw head in new position
        this.snake.head.draw();
        //request new frame
        setTimeout(() => this.game(), this.speed);
    }
    changeDirection() {
        switch (this.keyCode) {
            case 37:
                if (this.snake.head.direction !== "right")
                this.snake.head.direction = "left";
                break;
            case 40:
                if (this.snake.head.direction !== "up")
                this.snake.head.direction = "down";
                break;
            case 39:
                if (this.snake.head.direction !== "left")
                this.snake.head.direction = "right";
                break;
            case 38:
                if (this.snake.head.direction !== "down")
                this.snake.head.direction = "up";
                break;
        }
    }
    eatFruit () {
        if (collDetect (this.snake.head.x, this.snake.head.y, this.fruit.x, this.fruit.y, this.snake.head.direction, this.pixelSize)){
            this.snake.extend(this.snake.head.direction);
            this.speed -= 5;
            return true;
        }
    }
    reset() {
        this.dom.titleDiv.style.display = 'block';
        this.dom.canvas.style.display = 'none';
        this.moved = false;
        this.speed = 200;
    }
}
class Snake {
    constructor(pixel) {
        this.pixelSize = pixel;
    }
    move(direction) {
        let popped;
        this.body.unshift(new Square(this.head.x, this.head.y, "black", this.pixelSize))
        this.body.pop().clear();
        this.slide(direction);
    }
    extend(direction) {
        this.body.unshift(new Square(this.head.x, this.head.y, "black", this.pixelSize));
        this.slide(direction);
    }
    slide(direction) {
        switch (direction) {
            case "left":
                this.head.x -= this.head.pixelSize;
                break;
            case "down":
                this.head.y += this.head.pixelSize;
                break;
            case "right":
                this.head.x += this.head.pixelSize;
                break;
            case "up":
                this.head.y -= this.head.pixelSize;
                break;
        }
    }
}
class Square {
    constructor(x, y, color, size) {
        this.ctx = canvas.getContext("2d");
        this.x = x;
        this.y = y;
        this.color = color;
        this.pixelSize = size;
    }
    draw () {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.pixelSize, this.pixelSize);   
    }
    clear () {
        this.ctx.clearRect (this.x, this.y, this.pixelSize, this.pixelSize); 
    }
}

//helper functions

function generateCoords (x, pixels) {
    return pixels * Math.floor(randomNumber(0, x/pixels));
}

function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
}    

function collDetect (xx, xy, yx, yy, direction, pixels) {
        if ((xx === yx - pixels && 
            xy === yy &&
            direction === "right") ||
            (xx === yx + pixels &&
            xy === yy &&
            direction === "left") ||
            (xx === yx &&
            xy === yy - pixels &&
            direction === "down") ||
            (xx === yx &&
            xy === yy + pixels &&
            direction === "up"))
           {
            return true;
        } 
    }
function collDetectWall (x, y, canvasX, canvasY, direction, pixels) {
    if ((y === 0 && direction === "up") ||
        (y === canvasY - pixels && direction === "down") ||
        (x === 0 && direction === "left") ||
        (x === canvasX - pixels && direction === "right")) {
        return true;
    }        
}

// run program
let playingField = new PlayingField(PIXELSIZE);
playingField.initializeTitle();