import R from "./ramda.js";
import {gameState, isMatch, shuffleCards, cards} from "./game_logic.js";

/**
 * @file main.js
 * @author Niki Kan
 * @description This file contains parts of the game in order for it to come together.
 */

/* jslint es6:true, browser:true, module:true */
const gameBoard = document.getElementById("board");
let currentPlayer = "p1";

/**
 * @param {Array} deck - The shuffled array of card image sources.
 */
const renderBoard = function (deck) {
    gameBoard.innerHTML = "";
    R.forEach(function (src) {
        const btn = document.createElement("button");
        btn.className = "card";

        // Flip effect
        const inner = document.createElement("div");
        inner.className = "card-inner";

        // Back of card
        const back = document.createElement("div");
        back.className = "card-back";
        back.textContent = "?";

        // Front of card
        const front = document.createElement("div");
        front.className = "card-front";
        const img = document.createElement("img");
        img.src = src;

        front.appendChild(img);
        inner.appendChild(back);
        inner.appendChild(front);
        btn.appendChild(inner);
        gameBoard.appendChild(btn);
    }, deck);
};

/**
 * Updates the game state after a non-matching move.
 */
const handlePostMove = function () {
    const c1 = gameState.flippedCards[0];
    const c2 = gameState.flippedCards[1];

    c1.classList.remove("flipped");
    c2.classList.remove("flipped");


    if (currentPlayer === "p1") {
        currentPlayer = "p2";
    } else {
        currentPlayer = "p1";
    }

    document.body.className = currentPlayer + "-bg";
    gameState.flippedCards = [];
};

/**
 * Checks if two flipped cards match.
 */
const checkMatch = function () {
    const c1 = gameState.flippedCards[0];
    const c2 = gameState.flippedCards[1];

    if (isMatch(c1.dataset, c2.dataset)) {
        gameState.scores[currentPlayer] += 1;
        gameState.flippedCards = [];
    } else {
        setTimeout(handlePostMove, 1000);
    }
};

/**
 * Handles the click interaction on a card.
 */
const handleCardClick = function (cardEl) {
    if (gameState.flippedCards.length < 2) {
        if (!cardEl.classList.contains("flipped")) {
            cardEl.classList.add("flipped");
            gameState.flippedCards.push(cardEl);
            if (gameState.flippedCards.length === 2) {
                checkMatch();
            }
        }
    }
};

/**
 * Initialises the game board.
 */
const setupGame = function () {
    const shuffled = shuffleCards(cards);
    renderBoard(shuffled);

    gameBoard.addEventListener("click", function (e) {
        const target = e.target.closest(".card");
        if (target !== null) {
            handleCardClick(target);
        }
    });

    gameBoard.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
            const target = e.target.closest(".card");
            if (target !== null) {
                e.preventDefault();
                handleCardClick(target);
            }
        }
    });
};

setupGame();