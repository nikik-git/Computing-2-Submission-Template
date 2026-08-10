import R from "./ramda.js";
import {CardAssets, handleCardClick, updateUI} from "./game_logic.js";

const gameBoard = document.getElementById("game-board");

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
    renderCard: R.curry(function (clickHandler, iconPath) {
        const card = document.createElement("div");
        card.className = "card";
        card.tabIndex = 0;
        card.dataset.icon = iconPath;
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front"></div>
                <div class="card-back">
                    <img src="${iconPath}" class="card-icon" alt="card icon">
                </div>
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
            return;
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
    game.state.deck = CardAssets.getShuffledDeck();

    gameBoard.innerHTML = "";

    const render = UI.renderCard(handleCardClick);
    game.state.deck.forEach(function (iconPath) {
        gameBoard.appendChild(render(iconPath));
    });

    updateUI(game);
    initKeyboardNavigation();
};

startGame();