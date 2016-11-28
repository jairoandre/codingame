/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var inputs = readline().split(' ');

var nbFloors = parseInt(inputs[0]); // number of floors
var width = parseInt(inputs[1]); // width of the area
var nbRounds = parseInt(inputs[2]); // maximum number of rounds

var exit = new Exit(+inputs[3], +inputs[4]);

var nbTotalClones = parseInt(inputs[5]); // number of generated clones
var nbAdditionalElevators = parseInt(inputs[6]); // ignore (always zero)
var nbElevators = parseInt(inputs[7]); // number of elevators

function Exit(floor, position) {
	this.floor = floor;
	this.position = position;
}

function Elevator(floor, position) {
	this.floor = floor;
	this.position = position;
}

var elevators = Array(+inputs[7]).fill().map(() => {
	var inputs = readline().split(' ');
	return new Elevator(+inputs[0], +inputs[1]);
});


function LeadingClone(floor, position, direction) {
	this.floor = floor;
	this.position = position;
	this.direction = direction;

	this.nextPosition = function() {
		return this.direction === 'RIGHT' ? this.position + 1 : this.position - 1;
	};

	this.goingToLeft = function() {
		return this.direction === 'LEFT';
	};

	this.goingToRight = function() {
		return this.direction === 'RIGHT';
	};

	this.checkDirection = function(target) {
		if (this.floor === target.floor) {
			var deltaPos = this.position - target.position;
			var targetDirection;
			if (deltaPos > 0) {
				targetDirection = 'LEFT';
			} else if (deltaPos < 0) {
				targetDirection = 'RIGHT';
			}

			if (targetDirection) {
				if (this.direction === targetDirection) {
					print('WAIT');
				} else{
					print('BLOCK');
				}				
			} else {
				print('WAIT');
			}
			return true;
		}

		return false;

	};
}

// game loop
while (true) {
    var inputs = readline().split(' ');
    var leadingClone = new LeadingClone(+inputs[0], +inputs[1], inputs[2]);

    if (leadingClone.checkDirection(exit)) {		
    	continue;
	} else {

		var noElevatorMove = true;

		if (elevators.length > 0)  {
			for (var i = 0, len = elevators.length; i < len; i++) {
				if (leadingClone.checkDirection(elevators[i])) {
					noElevatorMove = false;
					break;
				}
			}
		}

		if (noElevatorMove) {
			var nextPos = leadingClone.nextPosition();
			if (nextPos === (width - 1) || nextPos === 0) {
				print('BLOCK');
		    } else {
		    	print('WAIT'); // action: WAIT or BLOCK	
		    }
		}
			
	}
    
}