import { P_START_TILES, P_WIN_TILE } from '$env/static/public';

class Tile {
	constructor(position, value) {
		this.x = position.x;
		this.y = position.y;
		this.value = value || 2;

		this.previousPosition = null;
		this.mergedFrom = null; // Tracks tiles that merged together
	}

	savePosition() {
		this.previousPosition = { x: this.x, y: this.y };
	}

	updatePosition(position) {
		this.x = position.x;
		this.y = position.y;
	}
}

export default class Grid {
	/* subs { onWin, onLoss, onAddScore } */
	constructor(sizex, sizey, subs) {
		this.sizex = sizex;
		this.sizey = sizey;

		this.subs = subs;

		this.cells = Array(sizex)
			.fill()
			.map((row) => Array(sizey).fill(null));
		this.addStartTiles(P_START_TILES);

		if (!this.movesAvailable()) {
			this.subs.onLoss();
		}
	}

	// Find the first available random position
	randomAvailableCell() {
		let cells = this.availableCells();

		if (cells.length) {
			return cells[Math.floor(Math.random() * cells.length)];
		}
	}

	availableCells() {
		let cells = [];

		this.eachCell((x, y, tile) => {
			if (!tile) {
				cells.push({ x: x, y: y });
			}
		});

		return cells;
	}

	// Call callback for every cell
	eachCell(callback) {
		for (let x = 0; x < this.sizex; x++) {
			for (let y = 0; y < this.sizey; y++) {
				callback(x, y, this.cells[x][y]);
			}
		}
	}

	// Check if there are any cells available
	cellsAvailable() {
		return !!this.availableCells().length;
	}

	// Check if the specified cell is taken
	cellAvailable(cell) {
		return !this.cellOccupied(cell);
	}

	cellOccupied(cell) {
		return !!this.cellContent(cell);
	}

	cellContent(cell) {
		if (this.withinBounds(cell)) {
			return this.cells[cell.x][cell.y];
		} else {
			return null;
		}
	}

	// Inserts a tile at its position
	insertTile(tile) {
		this.cells[tile.x][tile.y] = tile;
	}

	removeTile(tile) {
		this.cells[tile.x][tile.y] = null;
	}

	withinBounds(position) {
		return position.x >= 0 && position.x < this.sizex && position.y >= 0 && position.y < this.sizey;
	}

	// Set up the initial tiles to start the game with
	addStartTiles(startTiles) {
		for (let i = 0; i < startTiles; i++) {
			this.addRandomTile();
		}
	}

	// Adds a tile in a random position
	addRandomTile() {
		if (this.cellsAvailable()) {
			let value = Math.random() < 0.9 ? 2 : 4;
			let tile = new Tile(this.randomAvailableCell(), value);

			this.insertTile(tile);
		}
	}

	katkoReissu() {
		for (let x = 0; x < this.sizex; x++) {
			for (let y = 0; y < this.sizey; y++) {
				if (this.cells[x][y] && this.cells[x][y].value < 16) {
					this.cells[x][y] = null;
				}
			}
		}
	}

	// Save all tile positions and remove merger info
	prepareTiles() {
		this.eachCell((x, y, tile) => {
			if (tile) {
				tile.mergedFrom = null;
				tile.savePosition();
			}
		});
	}

	// Move a tile and its representation
	moveTile(tile, cell) {
		this.cells[tile.x][tile.y] = null;
		this.cells[cell.x][cell.y] = tile;
		tile.updatePosition(cell);
	}

	// Move tiles on the grid in the specified direction
	move(direction) {
		// 0: up, 1: right, 2:down, 3: left

		let cell, tile;

		let vector = this.getVector(direction);
		let traversals = this.buildTraversals(vector);
		let moved = false;

		// Save the current tile positions and remove merger information
		this.prepareTiles();

		// Traverse the grid in the right direction and move tiles
		traversals.x.forEach((x) => {
			traversals.y.forEach((y) => {
				cell = { x: x, y: y };
				tile = this.cellContent(cell);

				if (tile) {
					let positions = this.findFarthestPosition(cell, vector);
					let next = this.cellContent(positions.next);

					// Only one merger per row traversal?
					if (next && next.value === tile.value && !next.mergedFrom) {
						let merged = new Tile(positions.next, tile.value * 2);
						merged.mergedFrom = [tile, next];

						this.insertTile(merged);
						this.removeTile(tile);

						// Converge the two tiles' positions
						tile.updatePosition(positions.next);

						// Update the score
						this.subs.onAddScore(merged.value);

						// The mighty 2048 tile
						if (merged.value === P_WIN_TILE) {
							this.subs.onWin();
						}
					} else {
						this.moveTile(tile, positions.farthest);
					}

					if (!this.positionsEqual(cell, tile)) {
						moved = true; // The tile moved from its original cell!
					}
				}
			});
		});

		if (moved) {
			this.addRandomTile();

			if (!this.movesAvailable()) {
				this.subs.onLoss();
			}
		}
		return this;
	}

	// Get the vector representing the chosen direction
	getVector(direction) {
		// Vectors representing tile movement
		let map = {
			0: { x: 0, y: -1 }, // up
			1: { x: 1, y: 0 }, // right
			2: { x: 0, y: 1 }, // down
			3: { x: -1, y: 0 } // left
		};

		return map[direction];
	}

	// Build a list of positions to traverse in the right order
	buildTraversals(vector) {
		let traversals = { x: [], y: [] };

		for (let pos = 0; pos < this.sizey; pos++) {
			traversals.y.push(pos);
		}
		for (let pos = 0; pos < this.sizex; pos++) {
			traversals.x.push(pos);
		}

		// Always traverse from the farthest cell in the chosen direction
		if (vector.x === 1) traversals.x = traversals.x.reverse();
		if (vector.y === 1) traversals.y = traversals.y.reverse();

		return traversals;
	}

	findFarthestPosition(cell, vector) {
		let previous;

		// Progress towards the vector direction until an obstacle is found
		do {
			previous = cell;
			cell = { x: previous.x + vector.x, y: previous.y + vector.y };
		} while (this.withinBounds(cell) && this.cellAvailable(cell));

		return {
			farthest: previous,
			next: cell // Used to check if a merge is required
		};
	}

	movesAvailable() {
		return this.cellsAvailable() || this.tileMatchesAvailable();
	}

	// Check for available matches between tiles (more expensive check)
	tileMatchesAvailable() {
		let tile;

		for (let x = 0; x < this.sizex; x++) {
			for (let y = 0; y < this.sizey; y++) {
				tile = this.cellContent({ x: x, y: y });

				if (tile) {
					for (let direction = 0; direction < 4; direction++) {
						let vector = this.getVector(direction);
						let cell = { x: x + vector.x, y: y + vector.y };

						let other = this.cellContent(cell);

						if (other && other.value === tile.value) {
							return true; // These two tiles can be merged
						}
					}
				}
			}
		}

		return false;
	}

	positionsEqual(first, second) {
		return first.x === second.x && first.y === second.y;
	}
}
