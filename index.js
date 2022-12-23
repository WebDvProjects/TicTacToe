const cells = document.getElementsByClassName("cell");

/* 
!MODULES
*/

const gameBoard = (function () {
  "use strict";

  let boardInstance = [
    ["", "", "X"],
    ["", "O", ""],
    ["O", "", ""],
  ];

  function Board() {
    return boardInstance;
  }

  function boardValues(board = boardInstance) {
    return board.reduce((sofar, row) => sofar.concat([...row]), []);
  }

  function resetBoard() {
    boardInstance = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];
  }

  function updateBoard(value, row, col) {
    try {
      [row, col] = [parseInt(row), parseInt(col)];
    } catch (error) {
      alert(error.toString());
    }
    // if there is a value in current cell do not update
    if (!!boardInstance[row][col]) return false;
    else {
      boardInstance[row][col] = value;
      return true;
    }
  }

  function checkWin(board = boardInstance) {
    return (
      (board[0][0] == board[0][1] &&
        board[0][0] == board[0][2] &&
        board[0][0] != "") ||
      (board[1][0] == board[1][1] &&
        board[1][0] == board[1][2] &&
        board[1][0] != "") ||
      (board[2][0] == board[2][1] &&
        board[2][0] == board[2][2] &&
        board[2][0] != "") ||
      (board[0][0] == board[1][1] &&
        board[0][0] == board[2][2] &&
        board[0][0] != "") ||
      (board[0][2] != "" &&
        board[0][2] == board[1][1] &&
        board[0][2] == board[2][0]) ||
      (board[0][0] != "" &&
        board[0][0] == board[1][0] &&
        board[0][0] == board[2][0]) ||
      (board[0][1] != "" &&
        board[0][1] == board[1][1] &&
        board[0][1] == board[2][1]) ||
      (board[0][2] != "" &&
        board[0][2] == board[1][2] &&
        board[0][2] == board[2][2])
    );
  }

  function checkTie(board = boardInstance) {
    if (!checkWin(board) && boardFull(board)) {
      return true;
    }

    return false;
  }

  function isGameOver(board = boardInstance) {
    return checkTie(board) || checkWin(board);
  }

  function boardFull(board = boardInstance) {
    return !boardValues(board).some((val) => val === "");
  }

  return { boardValues, resetBoard, Board, updateBoard, checkWin, isGameOver };
})();

const gameDisplay = (function () {
  "use strict";
  // DOM Elements
  const gameCanvas = document.getElementById("game-area");

  function updateBoardDisplay() {
    const boardValues = gameBoard.boardValues();

    const cellArr = [...cells];

    for (const i in cellArr) {
      cellArr[i].textContent = boardValues[i];
    }
  }

  function resetBoardDisplay() {
    gameBoard.resetBoard();
    updateBoardDisplay();
  }

  return { updateBoardDisplay, resetBoardDisplay };
})();

/* 
!FACTORIES
*/
const Player = (type, token = 0, name = "Player 1") => {
  let score = 0;
  //   let boardToken = token;

  const Type = () => type;
  const Name = () => name;

  // gets and resets score
  const Score = (() => {
    function getScore() {
      return score;
    }

    function resetScore() {
      score = 0;
    }

    function increment() {
      score++;
    }

    return { getScore, resetScore, increment };
  })();

  function Token() {
    return !!token ? "X" : "O";
  }

  if (type === "computer") {
  }

  return { Type, Name, Score, Token };
};

/* 
!OPERATIONS
*/

const Game = (() => {
  "use strict";
  const playerOptionsDisplay = document.querySelector("header .options");
  const player2Icons = document.querySelectorAll(".player2 img");
  const player1Icons = document.querySelectorAll(".player1 img");

  const messageLog = document.querySelector("p.message-logger");
  const gameBoardElement = document.getElementById("board");

  const startBtn = document.getElementById("start");

  let currentPlayer = null;
  let player1 = null;
  let player2 = null;

  startBtn.onclick = (e) => {
    if (startBtn.textContent.toLowerCase() == "start") {
      startGame();
      startBtn.textContent = "EXIT";
      startBtn.setAttribute("game-playing", "true");
    } else {
      restartGame();
    }
  };

  // Set selecting events for player 1 and player 2 selections
  iconGroupSetup(player1Icons);
  iconGroupSetup(player2Icons);

  // Sets the selecting events for the player type icons depending on
  // the player group (player 1 or player 2)
  function iconGroupSetup(iconGroup) {
    iconGroup.forEach(
      (icon) =>
        (icon.onclick = () => {
          if (icon.classList.contains("selected")) return;

          // clear all player 1/2 current selections
          clearSelectedIcons(iconGroup);

          icon.classList.add("selected");
          // clear selection error
          logMessage("");
        })
    );
  }

  // Unselects all icons in a particular player group
  function clearSelectedIcons(iconGroup) {
    iconGroup.forEach((icon) => icon.classList.remove("selected"));
  }

  // Starts the first round of the game
  function startGame() {
    let player2Option = document.querySelector(".player2 .selected");
    let player1Option = document.querySelector(".player1 .selected");
    let player1Name = document.getElementById("player1-name").value;
    let player2Name = document.getElementById("player2-name").value;

    // activate game board
    gameBoardElement.classList.remove("hide");

    // Get player names if no names then use default names
    player1Name = !!player1Name ? player1Name : "Player 1";
    player2Name = !!player2Name ? player2Name : "Player 2";

    // create player objects
    player1 = Player(player1Option.id, 1, player1Name);
    player2 = Player(player2Option.id, 0, player2Name);

    // hide icons
    playerOptionsDisplay.classList.add("hide");

    // starts by setting the starting player for the first round
    selectRandomStartPlayer();
    logMessage(`${currentPlayer.Name()}'s Turn`);

    // if the current player is a computer then simulate a computer turn
    simulateComputerTurn();
  }

  // executes a new game round if user selects to go again
  function nextRound() {
    selectRandomStartPlayer();
    gameDisplay.resetBoardDisplay();
    logMessage(`${currentPlayer.Name()}'s Turn`);

    // if the current player is a computer then simulate a computer turn
    simulateComputerTurn();
  }

  function restartGame() {
    startBtn.textContent = "START";
    startBtn.setAttribute("game-playing", "false");
    logMessage("");

    // deactivate game board
    gameDisplay.resetBoardDisplay();
    gameBoardElement.classList.add("hide");

    // show player 2 options
    playerOptionsDisplay.classList.remove("hide");
  }

  function logMessage(msg) {
    messageLog.textContent = msg;
  }

  function selectRandomStartPlayer() {
    // set one of the players to current player
    currentPlayer = [player1, player2][Math.floor(Math.random() * 2)];
  }

  // Check the state of current game (win/tie) otherwise transfers turn to next player
  function transferTurn() {
    // update displayer before turn goes to next player
    gameDisplay.updateBoardDisplay();
    //  check win
    if (gameBoard.isGameOver()) {
      let displayMsg = "";
      if (gameBoard.checkWin()) {
        // display win message delay a few seconds and reset level
        displayMsg = `${currentPlayer.Name()} has Won the round`;
        currentPlayer.Score.increment();
      } else {
        displayMsg = "It's A Tie";
      }

      // Popup message box
      messageDisplay.roundEnd(displayMsg);
    } else {
      // change current player to next player
      currentPlayer = currentPlayer === player1 ? player2 : player1;
      logMessage(`${currentPlayer.Name()}'s Turn`);

      simulateComputerTurn();
    }
  }

  function userTurn(cell) {
    const value = currentPlayer.Token();
    const position = [cell.getAttribute("row"), cell.getAttribute("col")];

    // if the move was accepted then transfer turn
    if (gameBoard.updateBoard(value, ...position)) {
      transferTurn();
    }
  }

  function computerTurn() {
    if (currentPlayer.Type() != "computer") alert("Wrong player");
    const token = currentPlayer.Token();
    // copy of the board that we can simulate with minimax function
    const boardCopy = gameBoard.Board();
    // computer Algorithm
    let bestScore = -Infinity;
    let bestMove = [0, 0];
    for (let i = 0; i < boardCopy.length; i++) {
      for (let j = 0; j < boardCopy[i].length; j++) {
        const element = boardCopy[i][j];
        // check if position is playable
        if (!!!element) {
          boardCopy[i][j] = token;

          // calculate the score for the move (We minimize because the next player is the opponent)
          const score = minimax(boardCopy, 5, false);

          // reset board state at position i,j
          boardCopy[i][j] = "";

          // update best score and move
          if (score > bestScore) {
            [bestScore, bestMove] = [score, [i, j]];
          }
        }
      }
    }

    // The computed position from a minmax algorithm
    const copmuterMove = bestMove;
    // console.log(bestMove);

    if (gameBoard.updateBoard(currentPlayer.Token(), ...copmuterMove)) {
      transferTurn();
      return;
    }

    alert("Computer could not make move");
  }

  // Checks if current player is a computer and allows it to take a turn
  function simulateComputerTurn() {
    if (currentPlayer.Type() != "user") {
      setTimeout(() => computerTurn(), 300);
      //   computerTurn();
    }
  }

  // Register click events on the game board cells allowing users to take turns
  [...cells].forEach((cell) => {
    cell.onclick = (e) => {
      // if current player is null/undefined
      if (!!!currentPlayer) return;

      //   if currentPlayer is bot then ignore
      if (currentPlayer.Type() != "user") {
        return;
      }
      const cell = e.currentTarget;

      // execute the move for the user
      userTurn(cell);

      e.stopPropagation();
    };
  });

  function getCurrentPlayer() {
    return currentPlayer;
  }

  return { startGame, nextRound, restartGame, getCurrentPlayer };
})();

const messageDisplay = (() => {
  const main = document.querySelector("main");
  const header = document.querySelector("header");

  const messageBox = document.querySelector(".message-box");
  const msgTextContainer = document.createElement("div");
  const btnContainer = document.createElement("div");
  btnContainer.classList.add("btn-container");
  msgTextContainer.classList.add("txt-container");
  messageBox.append(msgTextContainer, btnContainer);

  function toggleMesageBox() {
    messageBox.classList.toggle("hide");
    if (messageBox.classList.contains("hide")) {
      toggleOtherContent(false);
    } else {
      toggleOtherContent(true);
    }
  }

  function clearMessageBox() {
    msgTextContainer.innerHTML = "";
    btnContainer.innerHTML = "";
    toggleMesageBox();
  }

  function displayMessage(msg, error = true) {
    toggleMesageBox();
    const message = document.createElement("p");
    if (error) message.classList.add("error");

    message.textContent = msg;

    msgTextContainer.appendChild(message);

    const okBtn = document.createElement("button");
    okBtn.textContent = "Ok!";
    okBtn.classList.add("ok-btn");
    okBtn.onclick = () => clearMessageBox();
    btnContainer.appendChild(okBtn);
  }

  function roundEnd(msg) {
    toggleMesageBox();
    const nextBtn = document.createElement("button");
    const resetBtn = document.createElement("button");
    nextBtn.classList.add("nxt-btn");
    nextBtn.textContent = "Again";
    resetBtn.classList.add("reset-btn");
    resetBtn.textContent = "Reset";

    nextBtn.onclick = () => {
      clearMessageBox();
      Game.nextRound();
    };

    resetBtn.onclick = () => {
      clearMessageBox();
      Game.restartGame();
    };

    const message = document.createElement("p");
    message.textContent = msg;
    msgTextContainer.append(message);

    btnContainer.append(nextBtn, resetBtn);
  }

  function toggleOtherContent(disable = true) {
    main.setAttribute("aria-disabled", disable);
    header.setAttribute("aria-disabled", disable);
  }

  return { displayMessage, roundEnd };
})();

// ON LOAD

window.onload = () => {
  // reset and startup new game environment
  gameDisplay.resetBoardDisplay();
};

/* 
MINIMAX ALGORITHM
*/
function minimax(board, depth, isMaximizingPlayer) {
  // Check for a terminal state (e.g. someone wins or it's a draw)
  if (gameBoard.isGameOver(board) || depth == 0) {
    return evaluateBoard(board);
  }

  //   console.log("in the minimax function");
  // Generate all possible next moves
  var bestValue;
  if (isMaximizingPlayer) {
    // This is the maximizing player (i.e. the computer)
    bestValue = -Infinity;
    for (var i = 0; i < board.length; i++) {
      for (var j = 0; j < board[i].length; j++) {
        // Try making the move and recursively calling minimax
        if (board[i][j] == "") {
          board[i][j] = Game.getCurrentPlayer().Token();
          bestValue = Math.max(bestValue, minimax(board, depth - 1, false));
          board[i][j] = "";
        }
      }
    }
  } else {
    // This is the minimizing player (i.e. the opponent)
    bestValue = Infinity;
    for (var i = 0; i < board.length; i++) {
      for (var j = 0; j < board[i].length; j++) {
        // Try making the move and recursively calling minimax
        if (board[i][j] == "") {
          board[i][j] = Game.getCurrentPlayer().Token() == "X" ? "O" : "X";
          bestValue = Math.min(bestValue, minimax(board, depth - 1, true));
          board[i][j] = "";
        }
      }
    }
  }

  return bestValue;
}

function evaluateBoard(board) {
  // since we know that the player who executed the minmax function is the currentplayer
  const currentPlayerToken = Game.getCurrentPlayer().Token();
  const otherPlayerToken = currentPlayerToken == "X" ? "O" : "X";
  if (checkWin(board, currentPlayerToken)) {
    return 1;
  } else if (checkWin(board, otherPlayerToken)) {
    return -1;
  } else {
    // A tie
    return 0;
  }
}

// returns true if the playerToken is the winner
function checkWin(board, playerToken) {
  // if playerToken is the winnning token return true otherwise false

  // check horizontally
  if (
    board[0][0] == board[0][1] &&
    board[0][0] == board[0][2] &&
    board[0][0] == playerToken
  )
    return true;

  if (
    board[1][0] == board[1][1] &&
    board[1][0] == board[1][2] &&
    board[1][0] == playerToken
  )
    return true;
  if (
    board[2][0] == board[2][1] &&
    board[2][0] == board[2][2] &&
    board[2][0] == playerToken
  )
    return true;

  // check diagonally
  if (
    board[0][0] == board[1][1] &&
    board[0][0] == board[2][2] &&
    board[0][0] == playerToken
  )
    return true;
  if (
    board[0][2] == playerToken &&
    board[0][2] == board[1][1] &&
    board[0][2] == board[2][0]
  )
    return true;

  // check veritcally
  if (
    board[0][0] == playerToken &&
    board[0][0] == board[1][0] &&
    board[0][0] == board[2][0]
  )
    return true;
  if (
    board[0][1] == playerToken &&
    board[0][1] == board[1][1] &&
    board[0][1] == board[2][1]
  )
    return true;
  if (
    board[0][2] == playerToken &&
    board[0][2] == board[1][2] &&
    board[0][2] == board[2][2]
  )
    return true;

  // otherwise return false
  return false;
}
