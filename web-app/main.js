import R from "./ramda.js";
import {CardAssets, handleCardClick} from "./game_logic.js";

const startButton = document.getElementById("start-button");
const gameBoard = document.getElementById("game-board");
const startScreen = document.getElementById("start-screen");

const thisGame = {
const game = {
    players: {
        "1": {
            color: "#EF4444",
            el: "player1-score",
            name: "Player 1",
            score: 0
        },
        "2": {
            color: "#3B82F6",
            el: "player2-score",
            name: "Player 2",
            score: 0
        }
    },
    state: {
        activePlayer: 1,
        flippedCards: [],
        isLocked: false,
        matchesFound: 0,
        totalPairs: 8
    }
};

const UI = {
    renderCard: R.curry(function (clickHandler, cardData) {
        const card = document.createElement("div");
        card.className = "card";
        card.tabIndex = 0;
        card.dataset.icon = cardData.icon;
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front"></div>
                <div class="card-back">${cardData.icon}</div>
            </div>`;

        const activateCard = function () {
            clickHandler(card, game);
        };

        card.addEventListener("click", activateCard);
        card.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                activateCard();
            }
        });
        return card;
    })
};

const initKeyboardNavigation = function () {
    document.addEventListener("keydown", function (e) {
        const cards = Array.from(document.querySelectorAll(".card"));
        const focusedEl = document.activeElement;
        const index = cards.indexOf(focusedEl);

        if (index === -1) {
            return; // Ignore if no card is focused
        }

        const cols = 4;
        let nextIndex = index;
        if (e.key === "ArrowRight") {
            nextIndex = (index + 1) % cards.length;
        } else if (e.key === "ArrowLeft") {
            nextIndex = (index - 1 + cards.length) % cards.length;
        } else if (e.key === "ArrowDown") {
            nextIndex = (index + cols) % cards.length;
        } else if (e.key === "ArrowUp") {
            nextIndex = (index - cols + cards.length) % cards.length;
        } else {
            return;
        }
        cards[nextIndex].focus();
    });
};

const startGame = function () {
    startScreen.classList.add("hidden");
    gameBoard.classList.remove("hidden");

    //shuffle the deck and assign it to the game state
    game.state.deck = CardAssets.getShuffledDeck();

    // lear the board for next game
    gameBoard.innerHTML = "";

    // render the cards on the board
    const render = UI.renderCard(handleCardClick);
    game.state.deck.forEach(function (cardData) {
        gameBoard.appendChild(render(cardData));
    });
};

startButton.addEventListener("click", startGame);

export {game, UI, initKeyboardNavigation};