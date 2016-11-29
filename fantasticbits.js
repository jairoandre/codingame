/**
 * Grab Snaffles and try to throw them through the opponent's goal!
 * Move towards a Snaffle and use your team id to determine where you need to throw it.
 **/

 const MAX_X = 1600;
 const MAX_Y = 7500;
 const MAX_THRUST = 150;
 const MAX_SEE_AHEAD = 1000;
 const MAX_VELOCITY = Math.ceil(Math.pow(10, 6) * Math.sqrt(2));
 const SNAFFLE_RADIUS = 150;
 const WIZARD_RADIUS = 400;
 const BLUDGER_RADIUS = 200;
 const BLUDGER_COLISION_RADIUS = WIZARD_RADIUS + BLUDGER_RADIUS;

 const goalL = new Vector(0, 3750);
 const goalR = new Vector(16000, 3750);



 function Vector(x, y) {
  this.x = x;
  this.y = y;

  this.dist = (other) => {
    return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
  };

  this.add = (other) => {
    return new Vector(this.x + other.x, this.y + other.y);
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

var mana = 0;

// game loop
while (true) {
    mana++;
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
          var closestBludger = myWizard.closest(bludgers);
          var futureClosestBudgerPos = closestBludger.pos.add(closestBludger.vel);

          var desiredVel = closestSnaffle.pos.sub(myWizard.pos).setMag(MAX_VELOCITY);
          var steer = desiredVel.sub(myWizard.vel);
          var newVel = myWizard.vel.add(steer).limit(MAX_THRUST);

          // AVOIDANCE

          var newPos = myWizard.pos.add(newVel);

          printErr(JSON.stringify(newPos));

          var ahead = newPos.setMag(MAX_SEE_AHEAD);
          var ahead2 = newPos.setMag(MAX_SEE_AHEAD * 0.5);

          var delta1 = ahead.sub(futureClosestBudgerPos).mag();
          var delta2 = ahead2.sub(futureClosestBudgerPos).mag();

          printErr(delta1);
          printErr(delta2);

          if (delta1 <= BLUDGER_COLISION_RADIUS || delta2 <= BLUDGER_COLISION_RADIUS) {
            if (mana > 10) {
              print(`PETRIFICUS ${closestBludger.id}`);
              mana = mana - 10;
              continue;
            }
            if (mana >= 5) {
              print(`OBLIVIATE ${closestBludger.id}`);
              mana = mana - 5;
              continue;
            }
            var avoidanceForce = ahead.sub(futureClosestBudgerPos);
            newVel = newVel.add(avoidanceForce);
            newPos = myWizard.pos.add(newVel);
          }



          var thrust = Math.min(Math.ceil(newVel.mag()), 150);

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

      mana = Math.min(mana, 100);



        // Write an action using print()
        // To debug: printErr('Debug messages...');


        // Edit this line to indicate the action for each wizard (0 ≤ thrust ≤ 150, 0 ≤ power ≤ 500)
        // i.e.: "MOVE x y thrust" or "THROW x y power"
        // print('MOVE 8000 3750 100');
    }
}
