var inputs = readline().split(' ');

var width = +inputs[0];
var height = +inputs[1];
var myId = +inputs[2];

// FUNCTIONS

function str(obj, prefix) {
    var app = '';
    if (prefix) {
        app = prefix;
    }
    printErr(app + JSON.stringify(obj));
}

function readRow() {
    return readline().split('');
}

function newTile(type, idx) {
    return new Tile(type, idx);
}

function newEntity() {
    return new Entity(readline().split(' '));
}

function isBlock(item) {
    return item.block;
}

function blockTiles(tiles, entities) {
    var softClone = [].concat.apply([], tiles);
    var blockFunc = (entity) => {
        if (entity.block) {
            var idx = entity.y * width + entity.x;
            var tileClone = tiles[idx].clone();
            tileClone.block = true;
            softClone[idx] = tileClone;
        }
    };
    entities.forEach(blockFunc);
    return softClone;
}

function dist(o1, o2) {
    return Math.abs(o1.x - o2.x + o1.y - o2.y);
}

// MODEL

function Tile(type, idx) {
    this.x = idx % width;
    this.y = Math.floor(idx / width);
    this.pos = new Pos(this.x, this.y);
    this.type = type;
    switch (type) {
        case 'X':
        case '0':
        case '1':
        case '2':
            this.block = true;
            break;
        default:
            this.block = false;
    }
    this.dangerous = -1;
}

Tile.prototype.clone = function() {
    return new Tile(this.type, (this.y * width + this.x));
};

function Entity(inputs) {
    this.type = +inputs[0];
    this.owner = +inputs[1];
    this.x = +inputs[2];
    this.y = +inputs[3];
    this.p1 = +inputs[4];
    this.p2 = +inputs[5];
    this.block = this.type === 1;
    this.pos = new Pos(this.x, this.y);
    this.tiles = []; // affect tiles by explosion
}

Entity.prototype.toArray = function() {
    return [this.type, this.owner, this.x, this.y, this.p1, this.p2];
};

Entity.prototype.clone = function() {
    return new Entity(this.toArray());
};

// POSITION

function Pos(x, y)  {
    this.x = x;
    this.y = y;
}

Pos.prototype.toIdx = function() {
    return this.y * width + this.x;
};

Pos.prototype.neighbors = function(qtd) {
    var coords = [];
    qtd = qtd ? qtd : 1;
    for (var i = 1; i <= qtd; i++) {
        var lx = this.x - i;
        var rx = this.x + i;
        var uy = this.y - i;
        var dy = this.y + i;
        if (lx >= 0)
            coords.push(new Pos(lx, this.y));
        if (rx < width)
            coords.push(new Pos(rx, this.y));
        if (uy >= 0)
            coords.push(new Pos(this.x, uy));
        if (dy < height)
            coords.push(new Pos(this.x, dy));
    }    
    return coords;
};

Pos.prototype.equals = function(pos) {
    return this.x === pos.x && this.y === pos.y;
};


// Node

function Node(obj, target, parent) {
    this.pos = new Pos(obj.x, obj.y);
    this.g = parent ? (parent.g + 1) : 1;
    this.h = dist(obj, target);
    this.f = this.g + this.h;
    this.parent = parent;
}

Node.prototype.equals = function(node) {
    return this.pos.equals(node.pos);
};

Node.prototype.compareTo = function(node) {
    return this.f === node.f ? 0 : (this.f > node.f ? 1 : -1);
};

// State model

function countNeighbors(coord) {
    var result = [0, 0, 0];
    var idx = coord.toIdx();
    if (this.bombsMap[idx]) {
        result[0]++;
    } else if (this.boxesMap[idx]) {
        result[1]++;
    } else if (this.itemsMap[idx]) {
        result[2]++;
    }
    return result;
}

function State(tiles, entities) {
    this.tiles = tiles;
    this.entities = entities;
    this.enemies = [];
    this.items = [];
    this.itemsMap = {};
    this.bombs = [];
    this.bombsMap = {};
    this.boxesMap = {};
    this.boxesCount = 0;
    this.wallsMap = {};
    tiles.forEach(classifyTiles.bind(this));
    entities.forEach(classifyEntity.bind(this));    
}

State.prototype.clone = function() {
    var tiles = this.tiles.map((tile) => { return tile.clone(); });
    var entities = this.entities.map((entity) => { return entity.clone(); });
    return new State(tiles, entities);
};

State.prototype.tick = function() {
    var clone = this.clone();
    clone.bombs.forEach((bomb) => {
        bomb.p1--;
    });
    return clone;
};

State.prototype.canPlaceBomb = function(move) {
    // there is a bomb?
    var meIdx = this.me.pos.toIdx();
    var moveIdx = move.tile.pos.toIdx();

    if (this.bombsMap[meIdx] || meIdx !== moveIdx) {
        return false;
    } else {
        // verify
        var clone = this.clone();
        var testBomb = new Entity([1, this.me.owner, this.me.x, this.me.y, 8, this.me.p2]);
        clone.bombs.push(testBomb);
        clone.bombsMap[meIdx] = testBomb;

        clone.processBombs();
        var items = clone.reachables();
        var countSafeReachables = items.reduce((p,n,idx) => {
            if (n.cost < 8 && n.tile.dangerous < 0) {
                return p + 1;
            } else {
                return p;
            }
        }, 0);
        return countSafeReachables > 0;
    }
};

State.prototype.bestMove = function() {
    var reachables = this.reachables();
    reachables.forEach(printFunc);
    var move = reachables.reduce((p, n) => {
        if (p) {
            var pTile = p.tile;
            var nTile = n.tile;
            if (nTile.dangerous < pTile.dangerous) {
                return n;
            } else {
                return p;
            }
        } else {
            return n;
        }
        
    });
    return move;
};

State.prototype.processBombs = function() {
    // calc bomb explosion, chain reaction, etc...
    var forEachBomb = (bomb) => {
        var idx = bomb.pos.toIdx();
        var x = bomb.x, y = bomb.y;
        var dangerous = (8 - bomb.p1);
        var tile = this.tiles[idx];
        if (tile.dangerous < dangerous) {
            tile.dangerous = dangerous;
        }
        var setDanger = function(x, y, bomb) {
            var idxI = new Pos(x, y).toIdx();
            var tileI = this.tiles[idxI];
            var dangerousI = tileI.dangerous;
            // Does have a box?
            if (tileI.type === '.') {
                // already processed?
                var tileBomb = this.bombsMap[idxI];
                var tileItem = this.itemsMap[idxI];
                var processed = dangerousI >= 0;
                var result = true;
            
                if (dangerousI < dangerous) {
                    tileI.dangerous = dangerous;
                    if (tileBomb) {
                        tileBomb.tiles.forEach((t) => {
                            t.dangerous = dangerous;
                        });
                    }
                }

                if (tileBomb || tileItem) {
                    result = false;
                }

                bomb.tiles.push(tileI);
                return result;
            } else {
                return false;
            }
        };
        setDanger = setDanger.bind(this);
        var up = true, down = true, left = true, right = true;
        for (var i = 1; i < bomb.p2; i++) {
            if (left && (x - i) >= 0) {
                left = setDanger(x - i, y, bomb);
            }
            if (right && (x + i) < width) {
                right = setDanger(x + i, y, bomb);
            }
            if (up && (y - i) >= 0) {
                up = setDanger(x, y - i, bomb);
            }
            if (down && (y + i) < height) {
                down = setDanger(x, y + i, bomb);
            }
        }
    };

    this.bombs.forEach(forEachBomb);
};

function Reachable(reachable, cost, tile) {
    this.reachable = reachable;
    this.cost = cost;
    this.tile = tile;
    this.bombCount = 0;
    this.boxCount = 0;
    this.itemCount = 0;
}

function sortFunc(o1, o2) {
    return o1.compareTo(o2);
}

// Verify if target node is reachable (a* implementation)
function reachable(origin, target, tiles) {
    var open = [];
    var close = {};
    open.push(new Node(origin, target));
    var iterations = 0;

    var includeOrRemove = (coord) => {
        var idx = coord.toIdx();
        var tile = tiles[idx];
        if (!close[idx] && !tile.block) {
            open.push(new Node(tile, target, open[0]));
        }
    };

    while(open.length > 0) {
        iterations++;
        var current = open[0];
        var coords = current.pos.neighbors();
        coords.forEach(includeOrRemove);
        open.splice(0, 1);
        open.sort(sortFunc);
        close[current.pos.toIdx()] = current;
        if (current.pos.equals(target.pos)) {
            break;
        }
    }
    var inClose = close[target.pos.toIdx()];
    if (inClose) {
        return new Reachable(true, inClose.g, target);
    }
    return new Reachable(false);
}

function classifyTiles(tile, idx) {
    switch (tile.type) {
        case '0':
        case '1':
        case '2':
            this.boxesMap[idx] = tile;
            this.boxesCount++;
            break;
        case 'X':
            this.wallsMap[idx] = tile;
            break;
        default:
            break;
    }
}


function classifyEntity(entity) {
    switch (entity.type) {
        case 0: // isBot?
            if (entity.owner === myId) {
                this.me = entity;
            } else {
                this.enemies.push(entity);
            }
            break;
        case 1: // isBomb?
            this.bombs.push(entity);
            this.bombsMap[entity.pos.toIdx()] = entity;
            break;
        default:
            this.items.push(entity);
            this.itemsMap[entity.pos.toIdx()] = entity;
    }    
}

State.prototype.reachables = function () {
    var tiles = blockTiles(this.tiles, this.entities);
    var items = [];
    var origin = this.me;
    tiles.forEach((tile) => {
        var result = reachable(origin, tile, tiles);
        if(result.reachable) {
            items.push(result);
        }
    });
    
    var bindedCountNeighbors = countNeighbors.bind(this);
    items.forEach((reachable) => {
        var coords = reachable.tile.pos.neighbors();
        coords.forEach((coord) => {
            var result = bindedCountNeighbors(coord);
            reachable.bombCount += result[0];
            reachable.boxCount += result[1];
            reachable.itemCount += result[2];
        });        
    });

    return items;
};

var printFunc = (item, idx) => {
    str(item, ''+ idx + ': ');
};

var initialBoxCount;
// game loop
while (true) {
    var tiles = [].concat.apply([], Array(height).fill().map(readRow)).map(newTile);
    var entities = Array(+readline()).fill().map(newEntity);
    var before = new Date().getMilliseconds();
    var state = new State(tiles, entities);
    if (!initialBoxCount) {
        initialBoxCount = state.boxesCount;
    }
    state.processBombs();
    var move = state.bestMove();
    var prefix = state.canPlaceBomb(move) ? 'BOMB' : 'MOVE';
    var after = new Date().getMilliseconds();
    print(prefix + ' ' + move.tile.x + ' ' + move.tile.y + ' ' + (after - before) + 'ms');
}