/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/
var inputs = readline().split(' ');
var rows = +inputs[0]; // number of rows.
var cols = +inputs[1]; // number of columns.
var turns = +inputs[2]; // number of rounds between the time the alarm countdown is activated and the time the alarm goes off.

var cellsCount = rows * cols;

var reached = false;

var visited = [];

function checkEdges (idx) {
  return idx >= 0 && idx < cellsCount;
}

function checkIdxForBlindedScan (idx, m) {
  return checkEdges(idx) && visited.indexOf(idx) === -1 && (m[idx] === '.' || m[idx] === 'C');
}

function idxToCoords (idx) {
  return [Math.floor(idx / cols), idx % cols];
}

function getMove (fromX, fromY, toX, toY) {
  if (fromX === toX) {
    if (fromY > toY) {
      return 'UP';
    } else {
      return 'DOWN';
    }
  } else {
    if (fromX > toX) {
      return 'LEFT';
    } else {
      return 'RIGHT';
    }
  }
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

  var lastIdx, coords;

  if (cIdx !== -1) {
    if (!reached && kirkIdx === cIdx) {
      reached = true;
    }

    if (reached) {
      printErr('????')
      lastIdx = visited.pop();
      coords = idxToCoords(lastIdx);
      print(getMove(kirkCol, kirkRow, coords[0], coords[1]));
      continue;
    }
  }

  if (checkIdxForBlindedScan(topIdx, maze)) {
    print('UP');
    visited.push(topIdx);
  } else if (checkIdxForBlindedScan(bottomIdx, maze)) {
    print('DOWN');
    visited.push(bottomIdx);
  } else if (checkIdxForBlindedScan(leftIdx, maze)) {
    print('LEFT');
    visited.push(leftIdx);
  } else if (checkIdxForBlindedScan(rightIdx, maze)) {
    print('RIGHT');
  } else {
    lastIdx = visited.pop();
    coords = idxToCoords(lastIdx);
    print(getMove(kirkCol, kirkRow, coords[0], coords[1]));
  }
}
