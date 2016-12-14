/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/
function * readlineGen () {
  yield '10 10 10';
}

if (!readline) {
  var readline = function () {
    return readlineGen.next().value;
  };
}

if (!print) {
  var print = function (param) {
    console.log(param);
  };
}

var inputs = readline().split(' ');
var rows = +inputs[0]; // number of rows.
var cols = +inputs[1]; // number of columns.
var turns = +inputs[2]; // number of rounds between the time the alarm countdown is activated and the time the alarm goes off.

var cellsCount = rows * cols;

var open = [];
var closed = [];

var founded = false;

function Cell (idx, parent, category) {
  this.idx = idx;
  this.parent = parent;
  this.category = category;
}
// game loop
while (true) {
  inputs = readline().split(' ');
  var kirkRow = +inputs[0]; // row where Kirk is located.
  var kirkCol = +inputs[1]; // column where Kirk is located.
  var kirkIdx = kirkRow * cols + kirkCol;

  var topIdx = (kirkRow - 1) * cols + kirkCol;
  var bottomIdx = (kirkRow + 1) * cols + kirkCol;
  var leftIdx = kirkRow * cols + kirkCol - 1;
  var rightIdx = kirkRow * cols + kirkCol + 1;

  var maze = '';
  for (var i = 0; i < rows; i++) {
    maze += readline();
  }
  var cIdx = maze.indexOf('C');

  if (cIdx !== -1) {
    if (!founded && kirkIdx === cIdx) {
      founded = true;
    }

    if (founded) {
      // escape
      print('LEFT');
    } else {
      // guided scan
      print('RIGHT');
    }
  } else {
    // blinded scan
    print('RIGHT');
  }
}
