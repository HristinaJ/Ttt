var canvas, ctx, data, player, ai, isPlayer, aiMoved, winner,winnerMsg;

	window.onload = function main() {

		canvas = document.createElement("canvas");
		canvas.width = canvas.height = 3*120 + 20;
		ctx = canvas.getContext("2d");

		document.body.appendChild(canvas);

		canvas.addEventListener("mousedown", mouseDown);

		init();
		tick();	
	}

	function init() {
		if (data == null) {
			data = [];

			for (var i = 0; i < 9; i++) {
				var x = (i % 3)*120 + 20;
				var y = Math.floor(i/3)*120 + 20;
				data.push(new Tile(x, y));
			}
		}

		player = Tile.CROSS;

		isPlayer = player ===Tile.CROSS;
		aiMoved = false;
		winner = false;
		winnerMsg = false;

		ai = new AIPlayer(data);
		ai.setSeed(player === Tile.CROSS ? Tile.NOUGHT : Tile.CROSS);

		console.log(ai.move());
	}

	function tick() {
		window.requestAnimationFrame(tick);
		update();
		render();
	}

	function update() {
		if (winnerMsg) return;
		var activeAnim = false;
		for (var i = data.length; i--;) {
			data[i].update();
			activeAnim = activeAnim || data[i].active();
		}
		if (!activeAnim) {
			if (!aiMoved && !isPlayer) {
				var m = ai.move();
				if (m === -1) {
					winner = true;
				} else {
					data[m].flip(ai.getSeed());
				}
				isPlayer = true;
			}

			if (winner) {
				if (winner === true) {
					winnerMsg = "The game is a draw!";
				} else if (winner === Tile.NOUGHT) {
					winnerMsg = "Computer won!";
				} else {
					winnerMsg = "You won!";
				}
			}

			aiMoved = true;
		} else {
			if (aiMoved) {
				winner = ai.hasWinner();
			}
			aiMoved = false;
		}
	}

	function render() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		for (var i = data.length; i--;) {
			data[i].draw(ctx);
		}

		if (winnerMsg) {
			var s = 10, lw = 2, w = 300, h = 80;

			w -= lw;
			h -= lw;

			ctx.save();
			ctx.translate((canvas.width - w + lw)/2, (canvas.height - h + lw)/2);
			ctx.fillStyle = "white";
			ctx.strokeStyle = "PaleVioletRed";
			ctx.lineWidth = lw;
			ctx.font = "20px Helvetica";

			ctx.beginPath();
			ctx.arc(s, s, s, Math.PI, 1.5*Math.PI);
			ctx.arc(w-s, s, s, 1.5*Math.PI, 0);
			ctx.arc(w-s, h-s, s, 0, 0.5*Math.PI);
			ctx.arc(s, h-s, s, 0.5*Math.PI, Math.PI);
			ctx.closePath();

			ctx.fill();
			ctx.stroke();

			ctx.fillStyle = "PaleVioletRed";
			var txt = winnerMsg;
			ctx.fillText(txt, w/2 -ctx.measureText(txt).width/2, 45);

			ctx.restore();

			if (_ctx) { 
			scene.draw(_ctx);
		} else {
			return scene.getCanvas();
		}
		}
	}

	function mouseDown(evt) {
		if (!isPlayer) return;
		var el = evt.target;

		var px = evt.clientX - el.offsetLeft;
		var py = evt.clientY - el.offsetTop;

		if (px % 120 >= 20 || py % 120 >=20) {
			var idx = Math.floor(px/120);
			idx += Math.floor(py/120)*3;

			if (data[idx].hasData()) {
				return;
			}
			data[idx].flip(player);
			isPlayer = false;
		}

	}

	function Tile(x, y) {

		var x = x, y = y;

		var tile = Tile.BLANK;

		var anim = 0;

		if (tile == null) {

			var _c = document.createElement("canvas");
			_c.width = _c.height = 100;
			var _ctx = _c.getContext("2d");

			_ctx.fillStyle = "PaleVioletRed";
			_ctx.lineWidth = 4;
			_ctx.strokeStyle = "white";
			_ctx.lineCap = "round";

			//BLANK
			_ctx.fillRect(0, 0, 100, 100);
			Tile.BLANK = new Image();
			Tile.BLANK.src = _c.toDataURL();

			//NOUGHT
			_ctx.fillRect(0, 0, 100, 100);

			_ctx.beginPath();
			_ctx.arc(50, 50, 30, 0, 2*Math.PI);
			_ctx.stroke();


			Tile.NOUGHT = new Image();
			Tile.NOUGHT.src = _c.toDataURL();

			//Cross
			_ctx.fillRect(0, 0, 100, 100);

			_ctx.beginPath();
			_ctx.moveTo(20, 20);
			_ctx.lineTo(80, 80);
			_ctx.moveTo(80, 20);
			_ctx.lineTo(20, 80);
			_ctx.stroke();


			Tile.CROSS = new Image();
			Tile.CROSS.src = _c.toDataURL();

			tile = Tile.BLANK;
		}

		this.active = function() {
			return anim > 0;
		}

		this.equals = function(_tile) {
			return tile === _tile;
		}

		this.hasData = function() {
			return tile !== Tile.BLANK;
		}

		this.flip = function(next) {
			tile = next;
			anim = 1;
		}

		this.set = function(next) {
			tile = next;
		}

		this.update = function() {
			if (anim > 0) {
				anim -= 0.02;
			}
		}

		this.draw = function(ctx) {
			if (anim <= 0) {
				ctx.drawImage(tile, x, y);
				return;
			}

			var res = 2;
			var t = anim > 0.5 ? Tile.BLANK : tile;
			var p = -Math.abs(2*anim - 1) + 1;

			for (var i = 0; i < 100; i += res) {
				var j = 50 - (anim > 0.5 ? 100 - i : i);
				ctx.drawImage(t, i, 0, res, 100, 
					x + i - p*i + 50*p,
					y - j*p*0.2, 
					res, 
					100 + j*p*0.4
				);
			}
		}

	}

function AIPlayer(data) {
	var data = data, seed, oppSeed;

	this.setSeed = function(_seed) {
		seed = _seed;
		oppSeed = _seed === Tile.CROSS ? Tile.NOUGHT : Tile.CROSS;
	}

	this.getSeed = function() {
		return seed;
	}

	this.move = function() {
		return minimax(2, seed)[1];
	}

	function minimax(depth, player) {
		var nextMoves = getValidMoves();
		
		var best = (player === seed) ? -1e100 : 1e100, 
			current, 
			bestidx = -1;

		if (nextMoves.length === 0 || depth === 0) {
			best = evaluate();
		} else {
			for (var i = nextMoves.length; i--;) {
				var m = nextMoves[i];
				data[m].set(player);

				if (player === seed) {
					current = minimax(depth-1, oppSeed)[0];
					if (current > best) {
						best = current;
						bestidx = m;
					}
				} else {
					current = minimax(depth-1, seed)[0];
					if (current < best) {
						best = current;
						bestidx = m;
					}
				}
				data[m].set(Tile.BLANK);
			}
		}

		return [best, bestidx];
	}

	function getValidMoves() {
		var nm = [];
		if (hasWon(seed) || hasWon(oppSeed)) {
			return nm;
		}
		for (var i = data.length; i--;) {
			if (!data[i].hasData()) {
				nm.push(i);
			}
		}
		return nm;
	}

	function evaluate() {
		var s = 0; 
		s += evaluateLine(0, 1, 2);
		s += evaluateLine(3, 4, 5);
		s += evaluateLine(6, 7, 8);
		s += evaluateLine(0, 3, 6);
		s += evaluateLine(1, 4, 7);
		s += evaluateLine(2, 5, 8);
		s += evaluateLine(0, 4, 8);
		s += evaluateLine(2, 4, 6);
		return s;
	}

	function evaluateLine(idx1, idx2, idx3) {
		var s = 0;

		if (data[idx1].equals(seed)) {
			s = 1;
		} else if (data[idx1].equals(oppSeed)) {
			s = -1;
		}
		if (data[idx2].equals(seed)) {
			if (s === 1) {
				s = 10;
			} else if (s === -1) {
				return 0;
			} else {
				s = 1;
			}
		} else if (data[idx2].equals(oppSeed)) {
			if (s === -1) {
				s = -10;
			} else if (s === 1) {
				return 0;
			} else {
				s = -1;
			}
		}
		if (data[idx3].equals(seed)) {
			if (s > 0) {
				s *= 10;
			} else if (s < 0) {
				return 0;
			} else {
				s = 1;
			}
		} else if (data[idx3].equals(oppSeed)) {
			if (s < 0) {
				s *= 10;
			} else if (s > 0) {
				return 0;
			} else {
				s = -1;
			}
		}
		return s;
	}

	var winningPatterns = (function() {
		var wp = ["111000000", "000111000", "000000111",
				  "100100100", "010010010", "001001001",
				  "100010001", "001010100"];
			r = new Array(wp.length);
		for (var i = wp.length; i--;) {
			r[i] = parseInt(wp[i], 2);
		}
		return r;
	})();

	var hasWon = this.hasWon = function(player) {
		var p = 0;
		for (var i = data.length; i--;) {
			if (data[i].equals(player)) {
				p |= (1 << i);
			}
		}
		for (var i = winningPatterns.length; i--;) {
			var wp = winningPatterns[i];
			if ((p & wp) === wp) return true;
		}
		return false;
	}

	this.hasWinner = function() {
		if (hasWon(seed)) {
			return seed;
		} if (hasWon(oppSeed)) {
			return oppSeed;
		}
		return false;
	}
}