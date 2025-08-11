// Direction and Input
let canChangeDirection = true;

const direction = {
  current: "down",
  down: {
    value: [1, 0],
    "a": "left",
    "d": "right",
  },
  left: {
    value: [0, -1],
    "w": "up",
    "s": "down",
  },
  right: {
    value: [0, 1],
    "w": "up",
    "s": "down",
  },
  up: {
    value: [-1, 0],
    "a": "left",
    "d": "right",
  },
}

const stdin = process.stdin;

stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

stdin.on('data', function(key) {
  // ctrl-c (end of text)
  if (key === '\u0003') {
    process.exit();
  }

  if (direction[direction.current][key] && canChangeDirection) {
    direction.current = direction[direction.current][key];
    canChangeDirection = false;
  }
});

// GLobals
const error = {
  0: ["Game Over", { cause: "you can't eat walls :O"}],
  1: ["Game Over", { cause: "death by self-consumption :("}],
  2: ["You Win!", { cause: "good job" }],
}

const colorCode = {
  ".": "\x1b[37m",
  "#": "\x1b[37m",
  "s": "\x1b[32m",
  "@": "\x1b[31m",
}

let state;
let snake = [];
let apple;
let points = 0;
let width, height;

// Game
function init(w=8, h=8) {
  width = Math.max(+w, 8);
  height = Math.max(+h, 8);

  // create snake data
  snake.push([Math.floor(height/2)+1, Math.floor(width/4)-1]); // snake head
  for (let i = 0; i < 3; i++) {
    snake.push([snake[i][0]-1, snake[i][1]]);
  }

  apple = [Math.floor(Math.random() * height) + 1, Math.floor(Math.random() * width) + 1];

  state = cleanState();
  setInterval(loop, 400);
}

function cleanState() {
  let newState = [];
  newState.push(new Array(width+2).fill("#"));
  for (let i = 0; i < height; i++) {
    newState.push(["#", ...new Array(width).fill("."), "#"]);
  }
  newState.push(new Array(width+2).fill("#"));
  return newState;
}

function loop() {
  update();
  draw();
}

function update() {
  // check for snake overlap
  let snakeCheck = snake.map(cell => cell.toString());
  if (new Set(snakeCheck).size < snakeCheck.length) {
    throw Error(...error[1]);
  }

  // check for wall collision
  if (snake[0][0] == width + 1 || snake[0][1] == height + 1 || snake[0][0] == 0 || snake [0][1] == 0) {
    throw Error(...error[0]);
  }

  // handle growth and apple consumption
  for (let i = 0; i < snake.length; i++) {
    if (snake[i].toString() == apple.toString()) {
      apple = [Math.floor(Math.random() * height) + 1, Math.floor(Math.random() * width) + 1];
      points += 5;
      snake.push([]);
      break;
    }
  }
  if (snake.length == width * height) {
    throw Error(...error[2]);
  }

  // move snake
  for (let i = snake.length - 1; i > 0; i--) {
    snake[i] = snake[i - 1];
  }
  let c = direction[direction.current].value;
  snake[0] = [snake[0][0] + c[0], snake[0][1] + c[1]];

  canChangeDirection = true;

  // reset state with new positions
  state = cleanState();
  
  state[apple[0]][apple[1]] = "@";

  for (let i = 0; i < snake.length; i++) {
    let pos = [snake[i][0], snake[i][1]];
    state[pos[0]][pos[1]] = i != 0 ? "s" : "S";
  }
}

function draw() {
  console.clear();
  state.forEach(row => {
    row.forEach(cell => {
      process.stdout.write(colorCode[cell.toLowerCase()] + cell);
    });
    process.stdout.write("\n");
  });
  console.log("\x1b[0m"); // reset console
  console.log(points);
}

let args = process.argv;
args.shift();
args.shift();
init(...args);
