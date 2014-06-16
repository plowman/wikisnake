// A map of english to arrow keyCodes so things are more readable.
var Direction = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40
};

// The width/height of the square game board.
var BOARD_SIZE = 9;

/*
Serves as a single point of contact between SnakeGame and the page.
   onStart(): function called when the start button is pressed.
   onReset(): function called when the reset button is pressed.
   setDirection(Direction): function called with a Direction argument when the user inputs a direction.
 */
var SnakeGameUi = function (onStart, onReset, setDirection) {
  var self = this;
  this.scoreHolder = $('#score-holder');
  this.resetButton = $('#reset-button');
  this.startButton = $('#start-button');
  this.downButton = $('#button-down');
  this.upButton = $('#button-up');
  this.leftButton = $('#button-left');
  this.rightButton = $('#button-right');
  this.gameTable = $('#game-holder').find('tbody');
  this.highScoresHolder = $('#high-scores');
  this.onStart = onStart;
  this.onReset = onReset;
  this.setDirection = setDirection;
  this.board = {};

  // Sets the "Score:" header to be the value given
  this.updateCurrentScore = function (score) {
    self.scoreHolder.html(score);
  };

  // Initializes button click listeners for the start, reset, and arrow buttons.
  this.addButtonListeners = function () {
    self.startButton.click(function () {
      self.onStart();
      self.resetButton.removeClass('disabled');
    });

    self.resetButton.click(function () {
      self.onReset();
      self.resetButton.addClass('disabled');
    });

    self.leftButton.click(function () {
      self.setDirection(Direction.LEFT);
    });

    self.rightButton.click(function () {
      self.setDirection(Direction.RIGHT);
    });

    self.upButton.click(function () {
      self.setDirection(Direction.UP);
    });

    self.downButton.click(function () {
      self.setDirection(Direction.DOWN);
    });
  };

  // Listens for the up/left/down/right arrow keys and calls SnakeGame with the direction.
  this.addKeyListeners = function () {
    $(window).on('keydown', function (e) {
      switch (e.which) {
        case Direction.UP:
        case Direction.RIGHT:
        case Direction.DOWN:
        case Direction.LEFT:
          e.preventDefault();
          self.setDirection(e.which);
          break;
        default:
          return;
      }
    });
  };

  // Resets the gameTable to its initial, empty state.
  this.resetBoard = function () {
    self.gameTable.empty();
    self.board = {};
    for (var y = 0; y < BOARD_SIZE; y++) {
      var tr = $('<tr/>');
      self.gameTable.append(tr);
      self.board[y] = {};
      for (var x = 0; x < BOARD_SIZE; x++) {
        var td = $('<td/>');
        tr.append(td);
        self.board[y][x] = td;
      }
    }
  };

  // Returns the Direction that points from (fromX, fromY) to (toX, toY)
  this.getDirection = function (fromX, fromY, toX, toY) {
    if (toX > fromX) {
      return Direction.RIGHT;
    } else if (toX < fromX) {
      return Direction.LEFT;
    } else if (toY > fromY) {
      return Direction.DOWN;
    } else if (toY < fromY) {
      return Direction.UP;
    }
  };

  // Move snake from (fromX, fromY) to (toX, toY), taking care to round corners so the snake path is visible.
  this.moveSnakeTo = function (fromX, fromY, toX, toY) {
    var direction = self.getDirection(fromX, fromY, toX, toY);
    var toDiv = self.board[toY][toX];
    var fromDiv = self.board[fromY][fromX];
    if (direction == Direction.LEFT) {
      fromDiv.removeClass('border-tl border-bl vertical');
      toDiv.addClass('visited border-tl border-bl horizontal');
    } else if (direction == Direction.RIGHT) {
      fromDiv.removeClass('border-tr border-br vertical');
      toDiv.addClass('visited border-tr border-br horizontal');
    } else if (direction == Direction.DOWN) {
      fromDiv.removeClass('border-bl border-br horizontal');
      toDiv.addClass('visited border-bl border-br vertical');
    } else if (direction == Direction.UP) {
      fromDiv.removeClass('border-tl border-tr horizontal');
      toDiv.addClass('visited border-tl border-tr vertical');
    }
  };

  // Draws a rounded squircle at position (x,y).
  this.moveSnakeToStart = function (x, y) {
    var div = self.board[y][x];
    div.addClass('visited border-tl border-tr border-bl border-br');
  };

  // Draw the given array of high scores in the order given
  this.updateHighScores = function (highScores) {
    self.highScoresHolder.empty();
    for (var i = 0; i < highScores.length; i++) {
      var li = $('<li/>');
      li.text(highScores[i]);
      self.highScoresHolder.append(li);
    }
  };

  // Initialize the UI
  self.addButtonListeners();
  self.addKeyListeners();

  return self;
};

// Encapsulates the state of a single snake.
var Snake = function () {
  var self = this;

  // Current x coordinate
  this.x = 4;

  // Current y coordinate
  this.y = 4;

  // An array of coordinates the snake has visited
  this.history = [
    [this.x, this.y]
  ];

  // The current direction of travel
  this.direction = Direction.RIGHT;

  // Returns true if the snake has previously visited coordinates (x, y)
  this.hasVisited = function (x, y) {
    for (var i = 0; i < self.history.length; i++) {
      if (self.history[i][0] == x && self.history[i][1] == y) {
        return true;
      }
    }
    return false;
  };

  // Sets the snake's current position to (x, y) and adds that position to its history.
  this.moveTo = function (x, y) {
    self.x = x;
    self.y = y;
    self.history.push([x, y]);
  };

  // Returns the current score for this snake.
  this.getScore = function () {
    return self.history.length - 1;
  };

  // Returns an array [x, y] of the coordinates that will result from the snake traveling one step in self.direction.
  this.getNextCoordinates = function () {
    var x = self.x;
    var y = self.y;
    var direction = self.direction;

    /* Squares are set up like below, with the origin at top left and all coordinates positive.
     *  ---------------
     * |(0,0)|(1,0)|...|
     * |(0,1)|(1,1)|...|
     * |  :     :      |
     *  ---------------
     */
    if (direction == Direction.RIGHT) {
      x += 1;
    } else if (direction == Direction.UP) {
      y -= 1;
    } else if (direction == Direction.DOWN) {
      y += 1;
    } else if (direction == Direction.LEFT) {
      x -= 1;
    } else {
      throw 'Unrecognized direction: ' + direction;
    }

    return [x, y];
  };

  return self;
};

// Controls the whole game and connects to the UI. Must call initialize();
var SnakeGame = function () {
  var self = this;

  // the LocalStorage key where the high scores are stored
  var HIGH_SCORES_KEY = 'high_scores';

  // how frequently to update the game, in milliseconds
  var UPDATE_INTERVAL_MS = 500;

  // the result of calling setInterval(), needed to later stop the snake using stopInterval()
  this.intervalId = null;

  // the state of the snake
  this.snake = new Snake();

  // link with the game UI
  this.ui = new SnakeGameUi(
    function () {
      // called when the start button is pressed. game is re-initialized in case the game was already running.
      self.initialize();
      self.start();
    },
    function () {
      // called when the reset button is pressed. causes the game to return to a pristine state
      self.initialize();
    },
    function (direction) {
      // called whenever a use inputs a direction on the keyboard or using the html buttons
      self.snake.direction = direction;
    }
  );

  // Returns true if the given coordinates are outside the dimensions of the board.
  this.isWallCollision = function (x, y) {
    return x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE;
  };

  // Sets everything to its initial value including all of the UI.
  this.initialize = function () {
    self.snake = new Snake();
    self.stop();
    self.ui.resetBoard();
    self.ui.updateCurrentScore(self.snake.getScore());
    self.ui.moveSnakeToStart(self.snake.x, self.snake.y);
    self.ui.updateHighScores(self.getHighScores());
  };

  // Gets the array of high scores from local storage or returns an empty array if there are none yet.
  this.getHighScores = function () {
    // Use JSON because localStorage cannot handle complex data types like arrays
    var highScores = JSON.parse(localStorage.getItem(HIGH_SCORES_KEY));
    if (highScores == undefined) {
      highScores = [];
    }
    return highScores;
  };

  // Saves the given array of high scores into local storage.
  this.saveHighScores = function (highScores) {
    // Use JSON because localStorage cannot handle complex data types like arrays.
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(highScores));
  };

  // If the given score is in the top 10, it will be added to the list of top scores in local storage.
  this.addScoreToHighScores = function (score) {
    var highScores = self.getHighScores();
    highScores.push(score);
    // sort highest to lowest
    highScores = highScores.sort(function (a, b) {
      return b - a
    });
    highScores = highScores.slice(0, 10);
    self.saveHighScores(highScores);
  };

  // Stops the automatic updating of the board.
  this.stop = function () {
    clearInterval(self.intervalId);
  };

  // Stop moving the snake and update the high scores.
  this.gameOver = function () {
    self.stop();
    self.addScoreToHighScores(self.snake.getScore());
    self.ui.updateHighScores(self.getHighScores());
  };

  // Moves the snake forward and updates the score. Ends the game if a collision occurs.
  this.updateBoard = function () {
    var coords = self.snake.getNextCoordinates();
    var x = coords[0];
    var y = coords[1];
    if (self.snake.hasVisited(x, y)) {
      // collision with self
      self.gameOver();
    } else if (self.isWallCollision(x, y)) {
      // collision with wall
      self.gameOver();
    } else {
      self.ui.moveSnakeTo(self.snake.x, self.snake.y, x, y);
      self.snake.moveTo(x, y);
    }
    self.ui.updateCurrentScore(self.snake.getScore());
  };

  // Starts the snake moving.
  this.start = function () {
    self.intervalId = setInterval(self.updateBoard, UPDATE_INTERVAL_MS);
  };

  return self;
};