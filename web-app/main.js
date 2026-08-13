import R from "./ramda.js";
import {handleCardClick, updateUI} from "./game_logic.js";
import {CardAssets} from "./card_assets.js";

const gameBoard = document.getElementById("game-board");

/**
 * Stores all active information for the memory matching game.
 * Organises player details and live game progress separately
 * Links every unique card identifier to its picture file
 * the main game logic uses this to show card images on screen
 */

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
    cardLookup: {},
    state: {
        activePlayer: 1,
        flippedCards: [],
        isLocked: false,
        matchesFound: 0,
        totalPairs: 8
    }
};

/**
 * stores mapping between unique cardId strings and card DOM elements
 * Used only within main.js for UI manipulation and card position swapping
 */
const cardDomMap = {};
let nextCardId = 0;

/**
 * swapCardPositions
 * Animates sliding swap between two cards WITHOUT removing from grid
 * @param {string} idA - unique card identifier
 * @param {string} idB - unique card identifier
 */
const swapCardPositions = function (idA, idB) {
    const cardA = cardDomMap[idA];
    const cardB = cardDomMap[idB];

    const rectA = cardA.getBoundingClientRect();
    const rectB = cardB.getBoundingClientRect();
    const offsetX = rectB.left - rectA.left;
    const offsetY = rectB.top - rectA.top;

    cardA.classList.add("sliding");
    cardB.classList.add("sliding");

    setTimeout(function () {
        cardA.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        cardB.style.transform = `translate(${-offsetX}px, ${-offsetY}px)`;
    }, 0);
};


/**
 * handleCardOutcome
 * Receives outcome object returned from game_logic handleCardClick.
 * Executes all DOM / visual behaviours based on the action type.
 * @param {object|null} outcome - action instruction from game logic
 */
const handleCardOutcome = function (outcome) {
    if (!outcome) {
        return;
    }

    if (outcome.action === "flip_single") {
        return;
    }

    if (outcome.action === "match") {
        const [id1, id2] = outcome.cardIds;
        cardDomMap[id1].classList.add("matched");
        cardDomMap[id2].classList.add("matched");

        // Matched cards remain flipped permanently
        updateUI(game);
        game.state.flippedCards = [];
        game.state.isLocked = false;

        if (outcome.gameComplete) {
            const p1Score = game.players["1"].score;
            const p2Score = game.players["2"].score;
            const winnerMsg = document.getElementById("winner-message");

            if (p1Score > p2Score) {
                winnerMsg.textContent = "Player 1 Wins!";
            } else if (p2Score > p1Score) {
                winnerMsg.textContent = "Player 2 Wins!";
            } else {
                winnerMsg.textContent = "It's a Draw!";
            }
            document.getElementById("win-modal").classList.remove("hidden");
        }
    } else if (outcome.action === "no_match_swap") {
        const [cardOneId, cardTwoId] = outcome.cardIds;

        setTimeout(function () {
            cardDomMap[cardOneId].classList.remove("flipped");
            cardDomMap[cardTwoId].classList.remove("flipped");

            // triggers sliding animation
            swapCardPositions(cardOneId, cardTwoId);

            // Wait for slide animation - gives duration
            setTimeout(function () {
                const cardA = cardDomMap[cardOneId];
                const cardB = cardDomMap[cardTwoId];

                // Step 1: Remove transform FIRST, let cards snap back visually
                cardA.style.transform = "";
                cardB.style.transform = "";

                // Step 2: Tiny delay to reorder grid
                setTimeout(function () {
                    const parent = cardA.parentNode;
                    const nextA = cardA.nextSibling;
                    const nextB = cardB.nextSibling;

                    if (nextA === cardB) {
                        parent.insertBefore(cardB, cardA);
                    } else if (nextB === cardA) {
                        parent.insertBefore(cardA, cardB);
                    } else {
                        parent.insertBefore(cardB, nextA);
                        parent.insertBefore(cardA, nextB);
                    }

                    cardA.classList.remove("sliding");
                    cardB.classList.remove("sliding");

                    game.state.flippedCards = [];
                    game.state.isLocked = false;
                    updateUI(game);
                }, 50);
            }, 450);
        }, 1000);
    }

};

/**
 * UI namespace contains functions responsible for constructing visual elements.
 */
const UI = {
    /**
     * renderCard: function to create a single playable card element.
     * Supports mouse click and Enter key to pick cards
     * generates unique card IDs and saves required information.
     * @param {Function} clickHandler - callback for card activation
     * @param {string} iconPath - svg asset source path
     * @returns {HTMLElement} constructed card DOM node
     */
    renderCard: R.curry(function (clickHandler, iconPath) {
        const cardId = nextCardId.toString();
        nextCardId = nextCardId + 1;

        const card = document.createElement("div");
        card.className = "card";
        card.tabIndex = 0;
        card.dataset.icon = iconPath;
        card.dataset.cardId = cardId;
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front"></div>
                <div class="card-back">
                    <img src="${iconPath}" class="card-icon" alt="card icon">
                </div>
            </div>`;

        cardDomMap[cardId] = card;
        game.cardLookup[cardId] = iconPath;

        /**
         * activateCard passes unique cardId to logic function.
         * Immediately flip card visually BEFORE waiting for game outcome.
         */
        const activateCard = function () {
            // Block clicks on already matched cards
            if (card.classList.contains("matched")) {
                return;
            }
            card.classList.add("flipped");
            const outcome = clickHandler(game, cardId);
            handleCardOutcome(outcome);
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

/**
 * initKeyboardNavigation
 * Enables arrow key navigation between cards for accessibility.
 * Calculates next focused card position based on 4-column grid layout.
 */
const initKeyboardNavigation = function () {
    let activeIndex = null; // null = NO card selected at start
    const cols = 4;

    function clearActiveHighlight() {
        const allCards = Array.from(document.querySelectorAll(".card"));
        allCards.forEach(function (card) {
            card.classList.remove("active");
        });
    }

    function setActiveCard(index) {
        const cards = Array.from(document.querySelectorAll(".card"));
        if (cards[index]) {
            clearActiveHighlight();
            activeIndex = index;
            cards[activeIndex].classList.add("active");
        }
    }

    document.addEventListener("keydown", function (e) {
        const cards = Array.from(document.querySelectorAll(".card"));
        const totalCards = cards.length;
        if (totalCards === 0) {
            return;
        }

        const key = e.key.toLowerCase();
        const movementKeys = ["w", "a", "s", "d"];

        // If nothing is selected yet, first WASD
        // press jump to starting position
        if (activeIndex === null) {
            if (movementKeys.includes(key)) {
                setActiveCard(0);
            }
            return;
        }

        const currentRow = Math.floor(activeIndex / cols);
        const currentCol = activeIndex % cols;
        let nextRow = currentRow;
        let nextCol = currentCol;

        if (key === "d") {
            nextCol = currentCol + 1;
        } else if (key === "a") {
            nextCol = currentCol - 1;
        } else if (key === "s") {
            nextRow = currentRow + 1;
        } else if (key === "w") {
            nextRow = currentRow - 1;
        } else if (key === "enter") {
            e.preventDefault();
            cards[activeIndex].click();
            return;
        } else {
            return;
        }

        // Grid boundary checks
        if (nextCol < 0 || nextCol >= cols) {
            return;
        }
        const nextIndex = nextRow * cols + nextCol;
        if (nextIndex < 0 || nextIndex >= totalCards) {
            return;
        }

        e.preventDefault();
        setActiveCard(nextIndex);
    });
};


/**
 * startGame
 * Main setup routine: generate shuffled deck, clear board, reset card
 * render all cards, refresh UI scores/turn state
 * and activate keyboard navigation.
 */
const startGame = function () {
    game.state.deck = CardAssets.getShuffledDeck();

    gameBoard.innerHTML = "";
    nextCardId = 0;
    Object.keys(cardDomMap).forEach(function (key) {
        delete cardDomMap[key];
    });
    game.cardLookup = {};

    const render = UI.renderCard(handleCardClick);
    game.state.deck.forEach(function (iconPath) {
        gameBoard.appendChild(render(iconPath));
    });

    updateUI(game);
    initKeyboardNavigation();
};

// Launch game when script loads
startGame();