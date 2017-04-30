/**
 * Game Logic
 */
let game = {
	/**
	 * Game Consturctor
	 * @param {Object} userInput User's input data
	 */
	consutructor: function(userInput) {
		// Information about the game
		// TODO:MAKE IT AS AN OBJECT
		this.generation = 1;
		this.produced = 0;
		this.died = 0;
		this.stayedDead = 0;
		this.stayedAlive = 0;
		this.userInput = userInput;

		this.axis = axis;
		this.gameSize = this.calcGameSize();
		// Number of neighbours for each cell
		this.numNeigh = [[[]]];

		// Range for the conditions
		this.deathRange = [];
		this.produceRange = [];
		console.log(userInput);
		// Generate a random or a loaded game
		switch(userInput.generateWay) {
			case generateWay.RANDOM:
				this.map = this.randomGenerator();
				myMode = mode.PLAYING;
				break;
			case generateWay.USER:
				this.map = this.generateEmpty();
				myMode = mode.GENERATING;
				mapStart();
				break;
			case generateWay.LOAD:
				this.map = userInput.gameSelected;
				myMode = mode.PLAYING;
		}
	},
	/**
	 * Set a cell in the map
	 * @param {Integer} x position of the cell in X-axis
	 * @param {Integer} y position of the cell in Y-axis
	 * @param {Integer} z position of the cell in Z-axis
	 */
	setCell: function(x, y, z) {
		this.map[z][y][x] = this.map[z][y][x] === 1 ? 0 : 1;
	},
	/**
	 * Gets the size of the map
	 * @return {Integer} the size of the map
	 */
	calcGameSize: function() {
		return this.userInput.z * this.userInput.y * this.userInput.x;
	},
	/**
	 * Generates a random game
	 * @return {Array} A random generated map of the game
	 */
	randomGenerator: function() {
		let array = [[[]]];
		for (let z = 0; z < this.userInput.z; z++) {
			array[z] = [];
			for (let y = 0; y < this.userInput.y; y++) {
				array[z][y] = [];
				for (let x = 0; x < this.userInput.x; x++) {
					array[z][y][x] = Math.floor(Math.random()*2);
				}
			}
		}
		return array;
	},
	/**
	 * Generates a random game
	 * @return {Array} A random generated map of the game
	 */
	generateEmpty: function() {
		let array = [[[]]];
		for (let z = 0; z < this.userInput.z; z++) {
			array[z] = [];
			for (let y = 0; y < this.userInput.y; y++) {
				array[z][y] = [];
				for (let x = 0; x < this.userInput.x; x++) {
					array[z][y][x] = 0;
				}
			}
		}
		return array;
	},
	/**
	 * Moving the map to the next generation
	 * @param {Integer} firstAxis  Axis used for nextGen
	 * @param {Integer} secondAxis Axis used for nextGen
	 */
	nextGen2D: function(firstAxis, secondAxis) {
		// Copying the current map
		let nextmap = this.map.map(function(arr) {
			return arr.slice();
		});
		let firstAxisSize = this.getAxisSize(firstAxis);
		let secondAxisSize = this.getAxisSize(secondAxis);

		let remainingAxis = this.getRemainingAxis([firstAxis, secondAxis]);
		let remainingAxisSize = this.getAxisSize(remainingAxis);

		for (let plane = 0; plane < remainingAxisSize; plane++) {
			let game2D = this.getPlane(remainingAxis, plane);
			let nextGame2D = game2D.map(function(arr) {
											return arr.slice();
										});
			for (let row = 0; row < firstAxisSize; row++) {
				for (let col = 0; col < secondAxisSize; col++) {
					let cell = game2D[row][col];
					let aliveNeigh = this.getAliveNeigh(row, col, game2D);
					let nextGenStatus = this.cellNextGen(cell, aliveNeigh);
					nextGame2D[row][col] = nextGenStatus;
					this.updateStatistics(cell, nextGenStatus);
				}
			}
			this.storePlane(remainingAxis, plane, nextGame2D, nextmap);
		}
		this.map = nextmap;
	},
	/**
	 * Next generation for 3D
	 */
	nextGen3D: function() {
		let nextmap = this.map.map(function(arr) {
			return arr.map(function(arr1) {
				return arr1.slice();
			});
		});
		for (let z = 0; z < userInput.z; z++) {
			for (let y = 0; y < userInput.y; y++) {
				for (let x = 0; x < userInput.x; x++) {
					let cell = this.map[z][y][x];
					let numNeigh = this.get3DNeigh(z, y, x);
					let nextGenStatus = this.cellNextGen3D(cell, numNeigh);
					nextmap[z][y][x] = nextGenStatus;
					this.updateStatistics(cell, nextGenStatus);
				}
			}
		}
		this.map = nextmap;
	},
	/**
	 * Returns the number of alive neighbours in 3D
	 * @param {Integer} indexZ Position of a cell in Z axis
	 * @param {Integer} indexY Position of a cell in Y axis
	 * @param {Integer} indexX Position of a cell in X axis
	 * @return {Integer} Number of alive neighbours
	 */
	get3DNeigh: function(indexZ, indexY, indexX) {
		let Alive = 0;
		for (let z = indexZ - 1; z <= indexZ + 1; z++) {
			for (let y = indexY - 1; y <= indexY + 1; y++) {
				for (let x = indexX - 1; x <= indexX + 1; x++) {
					// Skip the cell itself
					if (indexX == x
					&&	indexY == y
					&& 	indexZ == z
					) {
						continue;
					}
					let indexxX;
					let indexyY;
					let indexzZ;
					// If the cell is on the edge
					[indexzZ, indexyY, indexxX] = this.get3DIndex(z, y, x);
					if (this.map[indexzZ][indexyY][indexxX] === 1) {
						Alive++;
					}
				}
			}
		}
		return Alive;
	},
	/**
	 * Returns the state of a certain cell in the next generation
	 * @param {Integer} cell 0-1 dead or alive cell respectively
	 * @param {Integer} aliveNeigh Number of alive neighbors
	 * @return {Integer} The state of the cell in the next gen.
	 */
	cellNextGen3D: function(cell, aliveNeigh) {
		if (cell === 1) {
			if (this.deathRange.includes(aliveNeigh)) {
				return 0;
			} else {
				return 1;
			}
		} else {
			if (this.produceRange.includes(aliveNeigh)) {
				return 1;
			} else {
				return 0;
			}
		}
	},
	/**
	 * Get the index of a cell
	 * @param {Integer} indexZ Index of a cell in x-axis
	 * @param {Integer} indexY Index of a cell in y-axis
	 * @param {Integer} indexX Index of a cell in z-axis
	 * @return {Integer} Number of alive neighbours
	 */
	get3DIndex: function(indexZ, indexY, indexX) {
		if (indexZ === -1) {
			indexZ = this.map.length-1;
		} else if (indexZ === this.map.length) {
			indexZ = 0;
		}
		if (indexY === -1) {
			indexY = this.map[0].length-1;
		} else if (indexY === this.map[0].length) {
			indexY = 0;
		}
		if (indexX === -1) {
			indexX = this.map[0][0].length-1;
		} else if (indexX === this.map[0][0].length) {
			indexX = 0;
		}
		return [indexZ, indexY, indexX];
	},
	getPlanesNeigh: function(firstIndex, secondIndex, thirdIndex) {

	},
	/**
	 * Get an X plane
	 * @param {Integer} indexZ Index of a cell in x-axis
	 * @param {Integer} indexY Index of a cell in y-axis
	 * @param {Integer} indexX Index of a cell in z-axis
	 * @return {Integer} Number of alive neighbours
	 */
	getXPlaneNeigh: function(indexZ, indexY, indexX) {
		let Alive = 0;
		for (let row = indeyY - 1; row <= indeyY + 1; row++) {
			for (let col = indexZ - 1; col <= indexZ + 1; col++) {
				// If the cell is on the edge
				[indexzZ, indexyY, indexxX] = this.get3DIndex(col, row, indexX);
				if (this.map[indexzZ][indexyY][indexxX] === 1) {
					Alive++;
				}
			}
		}
		return Alive;
	},
	/**
	 * Get a Y plane
	 * @param {Integer} indexZ Index of a cell in x-axis
	 * @param {Integer} indexY Index of a cell in y-axis
	 * @param {Integer} indexX Index of a cell in z-axis
	 *
	 * @return {Integer} Number of alive neighbours
	 */
	getYPlaneNeigh: function(indexZ, indexY, indexX) {
		let Alive = 0;
		for (let row = indexX - 1; row <= indexX + 1; row++) {
			for (let col = indexZ - 1; col <= indexZ + 1; col++) {
				// If the cell is on the edge
				[indexzZ, indexyY, indexxX] = this.get3DIndex(col, indexY, row);
				if (this.map[indexzZ][indexyY][indexxX] === 1) {
					Alive++;
				}
			}
		}
		return Alive;
	},
	/**
	 * Get a Z plane
	 * @param {Integer} indexZ Index of a cell in x-axis
	 * @param {Integer} indexY Index of a cell in y-axis
	 * @param {Integer} indexX Index of a cell in z-axis
	 *
	 * @return {Integer} Number of alive neighbours
	 */
	getZPlaneNeigh: function(indexZ, indexY, indexX) {
		let Alive = 0;
		for (let row = indeyY - 1; row <= indeyY + 1; row++) {
			for (let col = indexX - 1; col <= indexX + 1; col++) {
				// If the cell is on the edge
				[indexzZ, indexyY, indexxX] = this.get3DIndex(indexZ, row, col);
				if (this.map[indexzZ][indexyY][indexxX] === 1) {
					Alive++;
				}
			}
		}
		return Alive;
	},
	/**
	 * Get a plane from map that represents a game in 2D
	 * @param {Integer} remainingAxis Representation of the remaining axis
	 * @param {Integer} plane         Position of the plane
	 *
	 * @return {Array} 2D array
	 */
	getPlane: function(remainingAxis, plane) {
		switch(remainingAxis) {
			case this.axis.X:
			return this.getXPlane(plane);
			break;
			case this.axis.Y:
			return this.getYPlane(plane);
			break;
			case this.axis.Z:
			return this.getZPlane(plane);
			break;
		}
	},
	/**
	 * Get an X plane
	 * @param {Integer} plane         Position of the plane
	 *
	 * @return {Array} - 2D array
	 */
	getXPlane: function(plane) {
		array = [[]];
		for (let z = 0; z < this.userInput.z; z++) {
			array[z] = [];
			for (let y = 0; y < this.userInput.y; y++) {
				array[z][y] = this.map[z][y][plane];
			}
		}
		return array;
	},
	/**
	 * Get a Y plane
	 * @param {Integer} plane         Position of the plane
	 *
	 * @return {Array} - 2D array
	 */
	getYPlane: function(plane) {
		array = [[]];
		for (let z = 0; z < this.userInput.z; z++) {
			array[z] = [];
			for (let x = 0; x < this.userInput.x; x++) {
				array[z][x] = this.map[z][plane][x];
			}
		}
		return array;
	},
	/**
	 * Get a Z plane
	 * @param {Integer} plane         Position of the plane
	 *
	 * @return {Array} - 2D array
	 */
	getZPlane: function(plane) {
		array = [[]];
		for (let y = 0; y < this.userInput.y; y++) {
			array[y] = [];
			for (let x = 0; x < this.userInput.x; x++) {
				array[y][x] = this.map[plane][y][x];
			}
		}
		return array;
	},
	/**
	 * Updates the game
	 * @param {Integer} remainingAxis Representation of the remaining axis
	 * @param {Integer} plane         Position in the remaining axis
	 * @param {Array}   game2D        A 2D game
	 * @param {Array}   nextmap	  A 3D game
	 */
	storePlane: function(remainingAxis, plane, game2D, nextmap) {
		switch(remainingAxis) {
			case this.axis.X:
			this.storeXPlane(plane, game2D, nextmap);
			break;
			case this.axis.Y:
			this.storeYPlane(plane, game2D, nextmap);
			break;
			case this.axis.Z:
			// return nextmap[plane] = game2D;
			this.storeZPlane(plane, game2D, nextmap);
			break;
		}
	},
	/**
	 * store an X plane
	 * @param {Integer} plane         Position of the plane
	 * @param {Array} 	game2D		  2D array
	 * @param {Array}   nextmap	  A 3D game
	 */
	storeXPlane: function(plane, game2D, nextmap) {
		for (let z = 0; z < this.userInput.z; z++) {
			for (let y = 0; y < this.userInput.y; y++) {
				nextmap[z][y][plane] = game2D[z][y];
			}
		}
	},
	/**
	 * Store a Y plane
	 * @param {Integer} plane         Position of the plane
	 * @param {Array} 	game2D		  2D array
	 * @param {Array}   nextmap	  A 3D game
	 */
	storeYPlane: function(plane, game2D, nextmap) {
		for (let z = 0; z < this.userInput.z; z++) {
			for (let x = 0; x < this.userInput.x; x++) {
				nextmap[z][plane][x] = game2D[z][x];
			}
		}
	},
	/**
	 * Store a Z plane
	 * @param {Integer} plane         Position of the plane
	 * @param {Array} 	game2D		  2D array
	 * @param {Array}   nextmap	  A 3D game
	 */
	storeZPlane: function(plane, game2D, nextmap) {
		for (let y = 0; y < this.userInput.y; y++) {
			for (let x = 0; x < this.userInput.x; x++) {
				nextmap[plane][y][x] = game2D[y][x];
			}
		}
	},
	/**
	 * Gets the axis that's not included in an array
	 * @param {Array} usedAxises Array containing the used axises
	 * @return {Integer} Representation of an axis
	 */
	getRemainingAxis: function(usedAxises) {
		if(!usedAxises.includes(this.axis.X)) {
			return this.axis.X;
		} else if(!usedAxises.includes(this.axis.Y)) {
			return this.axis.Y;
		} else if(!usedAxises.includes(this.axis.Z)) {
			return this.axis.Z;
		}
	},
	/**
	 * Returns the size of an axis
	 * @param {Integer} axis Representation of an axis
	 * @return {Integer} Size of the given axis
	 */
	getAxisSize: function(axis) {
		switch(axis) {
			case this.axis.X:
			return this.userInput.x;
			case this.axis.Y:
			return this.userInput.y;
			case this.axis.Z:
			return this.userInput.z;
		}
	},
	/**
	 * Moving the map to the next generation
	 * @param {Integer} Xindex index of a cell in x-axis
	 * @param {Integer} Yindex index of a cell in y-axis
	 */
	nextGen: function() {
		let numRules = rulesUsed.length;
		for (let rule = 0; rule < numRules; rule++) {
			switch (rulesUsed[rule]) {
				case gameRules.XY:
				this.nextGen2D(axis.Y, axis.X);
				break;
				case gameRules.XZ:
				this.nextGen2D(axis.Z, axis.X);
				break;
				case gameRules.YZ:
				this.nextGen2D(axis.Z, axis.Y);
				break;
				case gameRules.thirdD:
				this.nextGen3D();
				break;
			}
		}
		this.generation++;
	},
	/**
	 *  Returns the state of a certain cell in the next generation
	 * @param {Integer} cell 0-1 dead or alive cell respectively
	 * @param {Integer} aliveNeigh Number of alive neighbors
	 * @return {Integer} The state of the cell in the next gen.
	 */
	cellNextGen: function(cell, aliveNeigh) {
		if (cell === 1) {
			if (aliveNeigh < 2 || aliveNeigh > 3) {
				return 0;
			} else {
				return 1;
			}
		} else {
			if (aliveNeigh === 3) {
				return 1;
			} else {
				return 0;
			}
		}
	},
	/**
	 * Gets the alive neighbors around a certain cell
	 * @param {Integer} firstIndex  index of a cell in first axis
	 * @param {Integer} secondIndex index of a cell in second axis
	 * @param {Array}   game2D 2D array representing a game
	 * @return {Integer} Number of alive neighbors
	 */
	getAliveNeigh: function(firstIndex, secondIndex, game2D) {
		let Alive = 0;
		for (let row = firstIndex - 1; row <= firstIndex + 1; row++) {
			for (let col = secondIndex - 1; col <= secondIndex + 1; col++) {
				// If the cell is on the edge
				let firstindexX;
				let secondIndexX;
				// Dodge the cell itself
				if (row === firstIndex && col === secondIndex) {
					continue;
				}
				[firstindexX, secondIndexX] = this.get2DIndex(row, col, game2D);
				// console.log(firstindexX, secondIndexX);
				if (game2D[firstindexX][secondIndexX] === 1) {
					Alive++;
				}
			}
		}
		return Alive;
	},
	/**
	 * Get the index of a cell / If it exceeds the range get the one
	 * that's on the opposite side
	 * @param {Integer} indexX Index of a cell in x-axis
	 * @param {Integer} indexY index of a cell in y-axis
	 * @param {Array}   game2D 2D array representing a game
	 * @return {Array} - The index of the cell
	 */
	get2DIndex: function(indexX, indexY, game2D) {
		if (indexX === -1) {
			indexX = game2D.length-1;
		} else if (indexX === game2D.length) {
			indexX = 0;
		}
		if (indexY === -1) {
			indexY = game2D[0].length-1;
		} else if (indexY === game2D[0].length) {
			indexY = 0;
		}
		return [indexX, indexY];
	},
	/**
	 * Updates the next generation statistics
	 * @param {Integer} currStatus current cell status 1-0
	 * @param {Integer} nextStatus next generation cell status 1-0
	 */
	updateStatistics: function(currStatus, nextStatus) {
		if (currStatus === 1) {
			if (nextStatus === 1) {
				this.stayedAlive++;
			} else {
				this.died++;
			}
		} else {
			if (nextStatus === 1) {
				this.produced++;
			} else {
				this.stayedDead++;
			}
		}
	},
	/**
	 * Resets the statiscts
	 */
	resetStatus: function() {
		this.produced = 0;
		this.stayedAlive = 0;
		this.died = 0;
		this.stayedDead = 0;
		this.numNeigh = [[[]]];
	},
};
