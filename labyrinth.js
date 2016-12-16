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
var movementStack = [];

function checkEdges (idx) {
  return idx >= 0 && idx < cellsCount;
}

function checkIdxForBlindedScan (idx, m) {
  return checkEdges(idx) && visited.indexOf(idx) === -1 && (m[idx] === '.' || m[idx] === 'C');
}

function idxToCoords (idx) {
  return [idx % cols, Math.floor(idx / cols)];
}

function coordsToIdx (x, y) {
  return x * cols + y;
}

function getMove (fromX, fromY, toX, toY) {
  printErr(`from: ${fromX}, ${fromY}; to: ${toX}, ${toY}`);
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

var teleportIdx;

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
    var line = readline();
    maze += line;
  }

  if (!teleportIdx) {
    teleportIdx = maze.indexOf('T');
  }

  var cIdx = maze.indexOf('C');

  var lastIdx, coords;

  if (cIdx !== -1) {
    if (!reached && kirkIdx === cIdx) {
      reached = true;
    }

    if (reached) {
      lastIdx = visited.pop();
      if (lastIdx) {
        coords = idxToCoords(lastIdx);
      } else {
        coords = idxToCoords(teleportIdx);
      }
      print(getMove(kirkCol, kirkRow, coords[0], coords[1]));
      continue;
    }
  }

  if (checkIdxForBlindedScan(topIdx, maze)) {
    visited.push(kirkIdx);
    movementStack.push(kirkIdx);
    print('UP');
  } else if (checkIdxForBlindedScan(bottomIdx, maze)) {
    visited.push(kirkIdx);
    movementStack.push(kirkIdx);
    print('DOWN');
  } else if (checkIdxForBlindedScan(leftIdx, maze)) {
    visited.push(kirkIdx);
    movementStack.push(kirkIdx);
    print('LEFT');
  } else if (checkIdxForBlindedScan(rightIdx, maze)) {
    visited.push(kirkIdx);
    movementStack.push(kirkIdx);
    print('RIGHT');
  } else {
    lastIdx = movementStack.pop();
    printErr(movementStack.length);
    coords = idxToCoords(lastIdx);
    print(getMove(kirkCol, kirkRow, coords[0], coords[1]));
  }
}
