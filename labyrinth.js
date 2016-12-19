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
  return y * cols + x;
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

function getNeighbors (idx) {
  var coords = idxToCoords(idx);
  var neighbors = [];
  var x = coords[0];
  var y = coords[1];
  neighbors.push(coordsToIdx(x + 1, y));
  neighbors.push(coordsToIdx(x - 1, y));
  neighbors.push(coordsToIdx(x, y + 1));
  neighbors.push(coordsToIdx(x, y - 1));
  return neighbors;
}

function getScore (idx, maze) {
  if (!maze[idx] || maze[idx] === '#') {
    return -1;
  } else if (maze[idx] === 'C') {
    return 100;
  } else {
    var neighbors = getNeighbors(idx);
    return neighbors.reduce((p, nIdx) => {
      var value = maze[nIdx];
      if (value && value === '?') {
        return p + 1;
      } else {
        return p;
      }
    }, 0);
  }
}

var teleportIdx;

// game loop
while (true) {
  inputs = readline().split(' ');
  let kirkY = +inputs[0]; // row where Kirk is located.
  let kirkX = +inputs[1]; // column where Kirk is located.

  let kirkIdx = coordsToIdx(kirkX, kirkY);

  let maze = '';
  for (let i = 0; i < rows; i++) {
    let line = readline();
    maze += line;
  }

  if (!teleportIdx) {
    teleportIdx = maze.indexOf('T');
  }

  let cIdx = maze.indexOf('C');

  let lastIdx, coords;

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
      print(getMove(kirkX, kirkY, coords[0], coords[1]));
      continue;
    }
  }

  let neighbors = getNeighbors(kirkIdx);
  let picked, record;
  for (let i = 0, len = neighbors.length; i < len; i++) {
    let currScore = getScore(neighbors[i], maze);
    printErr(`${maze[neighbors[i]]}: ${currScore}`);
    if (!picked || currScore > record) {
      picked = neighbors[i];
      record = currScore;
    }
  }
  coords = idxToCoords(picked);
  let move = getMove(kirkX, kirkY, coords[0], coords[1]);
  print(move);
  visited.push(kirkIdx);

}
