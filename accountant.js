/**
 * Shoot enemies before they collect all the incriminating data!
 * The closer you are to an enemy, the more damage you do but don't get too close or you'll get killed.
 **/
 const width = 16000;
 const height = 9000;
 
 function Pos(x, y){
     this.x = x;
     this.y = y;
 }

 Pos.prototype.print = function() {
    return this.x + ' ' + this.y;
 };

 function euclideanDist(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
 }

 function Data(input) {
    this.id = +input[0];
    this.pos = new Pos(+input[1], +input[2]);
 }

 function Hero(input) {
    this.pos = new Pos(+input[0], +input[1]);
 }

 function Enemy(input) {
    this.id = +input[0];
    this.pos = new Pos(+input[1], +input[2]);
    this.life = +input[3];
    this.closest = undefined;
 }

 Enemy.prototype.reachIn = function() {
    return euclideanDist(this.closest.pos, this.pos) / 500;
 };

function State(me, data, enemies) {
    this.me = me;
    this.data = data;
    this.enemies = enemies;
    this.enemiesMap = enemies.reduce((m, e) => {
        m[e.id] = e;
        return m;
    }, {});
    this.priority = {};
}

State.prototype.compute = function() {
    var computeEnemy = (enemy) => {
        var closest;
        this.data.forEach((d) => {
            if (closest) {
                if (euclideanDist(closest.pos, enemy.pos) > euclideanDist(d.pos, enemy.pos)) {
                    closest = d;
                }
            } else {
                closest = d;
            }
        });
        enemy.closest = closest;
    };
    computeEnemy = computeEnemy.bind(this);
    this.enemies.forEach(computeEnemy);
    this.priority = this.enemies.reduce((p, c) => {
        return p ? (p.reachIn() > c.reachIn() ? c : p) : c;
    });
};

State.prototype.damage = function(enemy) {
    var dist = euclideanDist(this.me.pos, this.enemiesMap[enemy.id].pos);
    return Math.floor(125000/Math.pow(dist, 1.2));
};

State.prototype.willKill = function(enemy) {
    var dmg = this.damage(enemy);
    return dmg >= this.enemiesMap[enemy.id].life;
};

State.prototype.needToShoot = function(enemy) {
    return enemy.reachIn() < (enemy.life - this.damage(enemy));
};

function readData() {
    return new Data(readline().split(' '));
}

function readEnemy() {
    return new Enemy(readline().split(' '));
}

function str(obj, msg) {
    printErr((msg ? msg : '') + JSON.stringify(obj));
}

// game loop
while (true) {
    var me = new Hero(readline().split(' '));
    var data = Array(+readline()).fill().map(readData);
    var enemies = Array(+readline()).fill().map(readEnemy);
    var state = new State(me, data, enemies);
    
    state.compute();

    var move = (state.willKill(state.priority) || state.needToShoot(state.priority)) ? 
        ('SHOOT ' + state.priority.id + ' dealing ' + state.damage(state.priority)) : 
        'MOVE ' + state.priority.closest.pos.print();

    print(move); // MOVE x y or SHOOT id
}