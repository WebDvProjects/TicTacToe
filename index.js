const cells = document.getElementsByClassName("cell");

/* 
!MODULES
*/

const gameBoard = (function () {
  "use strict";

  let board = [
    ["", "", "X"],
    ["", "O", ""],
    ["O", "", ""],
  ];

  function Board() {
    return board;
  }

  function boardValues() {
    return board.reduce((sofar, row) => sofar.concat([...row]), []);
  }

  function resetBoard() {
    board = [
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
    if (!!board[row][col]) return false;
    else {
      board[row][col] = value;
      //   checkWin();
      return true;
    }
  }

  function checkWin() {
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

  function checkTie() {
    if (!checkWin() && boardFull()) {
      return true;
    }

    return false;
  }

  function boardFull() {
    return !boardValues().some((val) => val === "");
  }

  return { boardValues, resetBoard, Board, updateBoard, checkWin, checkTie };
})();

const gameDisplay = (function () {
  "use strict";
  // DOM Elements
  const gameCanvas = document.getElementById("game-area");

  function displayGameBoard() {
    const boardValues = gameBoard.boardValues();

    const cellArr = [...cells];

    for (const i in cellArr) {
      cellArr[i].textContent = boardValues[i];
    }
  }

  function resetGame() {
    gameBoard.resetBoard();
    displayGameBoard();
  }
  //   function updateGameBoard() {}

  //   function resetGameBoard() {}

  return { displayGameBoard, resetGame };
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

    return { getScore, resetScore };
  })();

  function Token() {
    return !!token ? "X" : "O";
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

  const messageLog = document.querySelector("p.message-logger");
  const gameBoardElement = document.getElementById("board");

  const resetBtn = document.getElementById("reset");
  const startBtn = document.getElementById("start");

  let currentPlayer = null;
  let player1 = null;
  let player2 = null;

  startBtn.onclick = (e) => startGame();
  resetBtn.onclick = (e) => restartGame();

  player2Icons.forEach(
    (icon) =>
      (icon.onclick = () => {
        if (icon.classList.contains("selected")) return;

        // clear all player 2 current selections
        clearPlayer2Icons();

        icon.classList.add("selected");
        // clear selection error
        logMessage("");
      })
  );

  function clearPlayer2Icons() {
    player2Icons.forEach((icon) => icon.classList.remove("selected"));
  }

  function startGame() {
    let player2Option = document.querySelector(".player2 .selected");

    // if user has not picked second player option
    if (!!!player2Option) {
      logMessage("Please choose a player 2");
    } else {
      // activate game board
      gameBoardElement.classList.remove("hide");

      const player2Type = player2Option.id;

      player1 = Player("user", 1, "You");
      player2 = Player(player2Type, 0);

      // hide icons
      playerOptionsDisplay.classList.add("hide");

      selectRandomStartPlayer();
    }
  }

  function restartGame() {
    clearPlayer2Icons();

    logMessage("");

    // deactivate game board
    gameDisplay.resetGame();
    gameBoardElement.classList.add("hide");

    // show player 2 options
    playerOptionsDisplay.classList.remove("hide");

    // ??reset player info
  }

  function logMessage(msg) {
    messageLog.textContent = msg;
  }

  function selectRandomStartPlayer() {
    // set one of the players to current player
    currentPlayer = player1;
  }

  [...cells].forEach((cell) => {
    cell.onclick = (e) => {
      if (!!!currentPlayer) return;
      const cell = e.currentTarget;
      const value = currentPlayer.Token();
      const position = [cell.getAttribute("row"), cell.getAttribute("col")];

      // if the move was accepted then transfer turn
      if (gameBoard.updateBoard(value, ...position)) {
        //  check win
        if (gameBoard.checkWin() || gameBoard.checkTie()) {
          if (gameBoard.checkWin()) {
            // display win message delay a few seconds and reset level
            logMessage(`${currentPlayer.Name()} has Won the round`);
          } else {
            logMessage("A tie");
          }

          setTimeout(() => {
            gameDisplay.resetGame();
          }, 2000);

          selectRandomStartPlayer();
        } else {
          currentPlayer = currentPlayer === player1 ? player2 : player1;
          logMessage(`${currentPlayer.Name()}'s Turn`);
        }
      }
      gameDisplay.displayGameBoard();
      e.stopPropagation();
    };
  });

  return {};
})();

gameDisplay.resetGame();
