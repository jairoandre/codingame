class Move {
  constructor(angle, thrust) {
    this.angle = angle;
    this.thrust = thrust;
  }
  act() {
    print(`${this.angle} ${this.thrust}`);
  }
}

class Gene {
  constructor() {
    this.a = Math.random();
    this.b = Math.random();
  }
  toMove() {
    let angle = 0;
    if (this.a <= 0.5) {
      angle = -15 + (15 * (this.a / 0.5));
    } else {
      angle = 30 - 15 / this.a;
    }
    angle = Math.round(angle);
    let thrust = 0;
    if (this.b <= 0.2) {
      thrust = 4;
    } else if (this.b <= 0.4) {
      thrust = 3;
    } else if (this.b <= 0.6) {
      thrust = 2;
    } else if (this.b <= 0.8) {
      thrust = 1;
    }
    return new Move(angle, thrust);
  }
}

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  sub(other) {
    return new Vector(this.x - other.x, this.y - other.y);
  }
  angle() {
    return Math.atan2(this.y, this.x);
  }
  inBetween(pair) {
    return this.x >= pair[0].x && this.x <= pair[1].x;
  }
  cross(other) {
    return this.x * other.y - this.y * other.x;
  }
}

class Ship {
  constructor(inputs) {
    this.inputs = inputs;
    this.pos = new Vector(+inputs[0], +inputs[1]);
    this.speed = new Vector(+inputs[2], +inputs[3]);
    this.fuel = +inputs[4];
    this.rotate = +inputs[5];
    this.power = +inputs[6];
  }
  clone() {
    return new Ship(this.inputs);
  }
  check(terrain) {
    let pair;
    for (let i = 0; i < (terrain.len - 1); i += 1) {
      pair = [terrain.coords[i], terrain.coords[i + 1]];
      if (this.pos.inBetween(pair)) {
        break;
      }
    }
    printErr(JSON.stringify(pair[0]));
    printErr(JSON.stringify(pair[1]));
    const v1 = pair[1].sub(pair[0]);
    const v2 = pair[1].sub(this.pos);
    const cross = v1.cross(v2);
    if (cross === 0) {
      printErr('Contact');
    } else if (cross > 0) {
      printErr('Bellow');
    } else {
      printErr('Above');
    }
    const angle = v1.angle();
    if (angle === 0 && angle === Math.PI) {
      printErr('Plane');
    }
  }
}

class Terrain {
  constructor(coords, len) {
    this.coords = coords;
    this.len = len;
  }
}

const surfaceN = parseInt(readline()); // the number of points used to draw the surface of Mars.
const coords = [];

for (let i = 0; i < surfaceN; i++) {
  let inputs = readline().split(' ');
  coords.push(new Vector(+inputs[0], +inputs[1]));
}

const terrain = new Terrain(coords, surfaceN);

// game loop
while (true) {
  const ship = new Ship(readline().split(' '));
  ship.check(terrain);
  print('-90 3');
}
