/**
 * Grab Snaffles and try to throw them through the opponent's goal!
 * Move towards a Snaffle and use your team id to determine where you need to throw it.
 **/

 const MAX_X = 1600;
 const MAX_Y = 7500;
 const MAX_THRUST = 150;
 const MAX_SEE_AHEAD = 800;

 const goalL = new Vector(0, 3750);
 const goalR = new Vector(16000, 3750);

function Vector(x, y) {
  this.x = x;
  this.y = y;

  this.dist = (other) => {
    return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
  };

  this.add = (other) => {
    return new Vector(this.x + other.x, this.y - other.y);
  };

  this.sub = (other) => {
    return new Vector(this.x - other.x, this.y - other.y);
  };

  this.mul = (scalar) => {
    return new Vector(this.x * scalar, this.y * scalar);
  }

  this.mag = () => {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  };

  this.normalize = () => {
    var mag = this.mag();
    return new Vector(this.x / mag, this.y / mag);
  };

  this.setMag = (scalar) => {
    var normalized = this.normalize();
    return new Vector(normalized.x * scalar, normalized.y * scalar);
  };

  this.limit = (max) => {
    if (this.mag() > max) {
      return this.setMag(max);
    } else {
      return new Vector(this.x, this.y);
    }
  };


}

function Entity(id, x, y, vx, vy, state, mass) {
  this.id = id;
  this.pos = new Vector(x, y);
  this.vel = new Vector(vx, vy);
  this.state = state;
  this.mass = mass;

  this.closest = (entities) => {
    var result, resultDist;
    for (var i = 0, len = entities.length; i < len; i++) {
      var curr = entities[i];
      var currDist = this.pos.dist(curr.pos);
      if (!result || currDist < resultDist ) {
        result = curr;
        resultDist = currDist;
      }
    }
    return result;
  };

}

var myTeamId = +readline();

// game loop
while (true) {
    var entities = parseInt(readline()); // number of entities still in game
    var snaffles = [];
    var myWizards = [];
    var enemyWizards = [];
    var bludgers = [];
    for (var i = 0; i < entities; i++) {
        var inputs = readline().split(' ');
        var id = parseInt(inputs[0]); // entity identifier
        var type = inputs[1]; // "WIZARD", "OPPONENT_WIZARD" or "SNAFFLE" (or "BLUDGER" after first league)
        var x = parseInt(inputs[2]); // position
        var y = parseInt(inputs[3]); // position
        var vx = parseInt(inputs[4]); // velocity
        var vy = parseInt(inputs[5]); // velocity
        var state = parseInt(inputs[6]); // 1 if the wizard is holding a Snaffle, 0 otherwise
        var entity = new Entity(id, x, y, vx, vy, state);
        switch(type) {
          case 'WIZARD':
            entity.mass = 1;
            myWizards.push(entity);
            break;
          case 'OPPONENT_WIZARD':
            entity.mass = 1;
            enemyWizards.push(entity);
            break;
          case 'SNAFFLE':
            entity.mass = 0.5;
            snaffles.push(entity);
            break;
          default:
            entity.mass = 8;
            bludgers.push(entity);
            break;
        }
    }
    for (var i = 0, len = myWizards.length; i < len; i++) {

      var myWizard = myWizards[i];

      if (myWizard.state === 0) {
        if (snaffles.length > 0) {
          var closestSnaffle = myWizard.closest(snaffles);
          printErr(`Closest id: ${closestSnaffle.id}`)
          var closestBludger = myWizard.closest(bludgers);

          var desiredVel = closestSnaffle.pos.sub(myWizard.pos).setMag(MAX_THRUST);

          var steer = desiredVel.sub(myWizard.vel).limit(MAX_THRUST);

          var newVel = myWizard.vel.add(steer);

          var thrust = Math.min(Math.ceil(newVel.mag()), 150);

          var newPos = myWizard.pos.add(newVel);

          snaffles = snaffles.filter((s) => {
            return s.id != closestSnaffle.id;
          });

          print(`MOVE ${Math.ceil(newPos.x)} ${Math.ceil(newPos.y)} ${thrust}`);
        } else {
          print("MOVE 8000 3750 150");
        }
      } else {
        var goal = goalL;
        if (myTeamId === 0) {
          goal = goalR;
        }
        print(`THROW ${goal.x} ${goal.y} 500`);
      }

        // Write an action using print()
        // To debug: printErr('Debug messages...');


        // Edit this line to indicate the action for each wizard (0 ≤ thrust ≤ 150, 0 ≤ power ≤ 500)
        // i.e.: "MOVE x y thrust" or "THROW x y power"
        // print('MOVE 8000 3750 100');
    }
}
