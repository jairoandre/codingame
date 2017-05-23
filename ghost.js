/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/


const distances = [];


function init() {
  const factoryCount = +readline(); // the number of factories
  const linkCount = +readline(); // the number of links between factories

  for (var i = 0; i < linkCount; i++) {
      var inputs = readline().split(' ');
      var f1 = +inputs[0];
      var f2 = +inputs[1];
      var dist = +inputs[2];
      if (!distances[f1]) {
        distances[f1] = [];
      }
      if (!distances[f2]) {
        distances[f2] = [];
      }
      distances[f1][f2] = dist;
      distances[f2][f1] = dist;
  }
}

init();

function Entity (inputs) {
  this.id = +inputs[0];
  this.type = inputs[1];
  this.arg1 = +inputs[2];
  this.arg2 = +inputs[3];
  this.arg3 = +inputs[4];
  this.arg4 = +inputs[5];
  this.arg5 = +inputs[6];
}

function Factory (entity) {
  this.id = entity.id;
  this.owner = entity.arg1;
  this.troops = entity.arg2;
  this.production = entity.arg3;
  this.turnsToProduce = entity.arg4;
}

Factory.prototype.troopsProjection = function (turns) {
  if (this.owner === 0) {
    return this.troops;
  } else {
    this.troops + this.production * turns;
  }
};

function Troop (entity) {
  this.owner = entity.arg1;
  this.origin = entity.arg2;
  this.target = entity.arg3;
  this.quantity = entity.arg4;
  this.turnsToArrive = entity.arg5;
}

function Bomb (entity) {
  this.owner = entity.arg1;
  this.origin = entity.arg2;
  this.target = entity.arg3;
  this.turnsToArrive = entity.arg4;
}
// game loop
while (true) {
    let gameState = tick();

    let actions = plan(gameState);

    if (actions.length) {
      print(actions.join(';'));
    } else {
      print ('WAIT');
    }
}

function plan(gameState) {
  let { factories, myFactories } = gameState;

  let actions = [];

  myFactories.forEach((myFactory) => {

    distances[myFactory.id].forEach((dist, targetId) => {
      if (dist) {
        let targetFactory = factories[targetId];
        if (targetFactory.owner !== 1) {
          var troopsToInvade = targetFactory.troops + (targetFactory.owner === 0 ? 0 : dist * targetFactory.production);
          if (troopsToInvade <= myFactory.troops) {

          }
        }
      }
    });
  });

  return actions;
}

function debug(obj) {
  printErr(JSON.stringify(obj));
}

function tick() {
  let factories = {};
  let troops = [];
  let bombs = [];
  let myFactories = [];

  var entityCount = +readline(); // the number of entities (e.g. factories and troops)

  for (var i = 0; i < entityCount; i++) {
      var inputs = readline().split(' ');
      var entity = new Entity(inputs);
      switch (entity.type) {
        case 'FACTORY':
          let factory = new Factory(entity);
          debug(factory);
          factories[factory.id] = factory;
          if (factory.owner) {
            myFactories.push(factory);
          }
          break;
        case 'TROOP':
          troops.push(new Troop(entity));
          break;
        default:
          bombs.push(new Bomb(entity));
          break;
      }
  }

  return { factories: factories, myFactories: myFactories, bombs: bombs, troops: troops };
}
