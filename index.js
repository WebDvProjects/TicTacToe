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
  //   function updateGameBoard() {}

  //   function resetGameBoard() {}

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

  iconGroupSetup(player1Icons);
  iconGroupSetup(player2Icons);

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

  function clearSelectedIcons(iconGroup) {
    iconGroup.forEach((icon) => icon.classList.remove("selected"));
  }

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

    selectRandomStartPlayer();
    logMessage(`${currentPlayer.Name()}'s Turn`);
  }

  function nextRound() {
    selectRandomStartPlayer();
    gameDisplay.resetBoardDisplay();
    logMessage(`${currentPlayer.Name()}'s Turn`);
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
      // if current player is null/undefined
      if (!!!currentPlayer) return;

      //   if currentPlayer is bot then ignore
      if (currentPlayer.Type() != "user") {
        return;
      }
      const cell = e.currentTarget;
      const value = currentPlayer.Token();
      const position = [cell.getAttribute("row"), cell.getAttribute("col")];

      // if the move was accepted then transfer turn
      if (gameBoard.updateBoard(value, ...position)) {
        //  check win
        if (gameBoard.checkWin() || gameBoard.checkTie()) {
          let displayMsg = "";
          if (gameBoard.checkWin()) {
            // display win message delay a few seconds and reset level
            displayMsg = `${currentPlayer.Name()} has Won the round`;
          } else {
            displayMsg = "A tie";
          }

          // Popup message box
          messageDisplay.roundEnd(displayMsg);
        } else {
          currentPlayer = currentPlayer === player1 ? player2 : player1;
          logMessage(`${currentPlayer.Name()}'s Turn`);
        }
      }
      gameDisplay.updateBoardDisplay();
      e.stopPropagation();
    };
  });

  return { startGame, nextRound, restartGame };
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

  function playerInfoPrompt(type1, type2) {
    // if (type1 != "user" && type2 != "user") return ["Computer1", "Computer2"];
    // if (type1 === "user") {
    // }
    // if (type2 === "user") {
    // }
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
