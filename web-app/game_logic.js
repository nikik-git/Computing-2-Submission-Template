import R from "./ramda.js";
/**
 * @file game_logic.js
 * @author Niki Kan
 * @description This file contains the core game logic.
 */

/**
 * StateManager contains pure functions to safely update game state
 * without mutating the original state object.
 */
const StateManager = {
    /**
     * addScoreToActive function
     * Increases the active player's score and adds to the total matched pairs.
     * @param {object} state - current game state object
     * @param {object} players - player score data
     * @returns {object} fresh updated state and players object
     */
    addScoreToActive: function (state, players) {
        return {
            players: R.assoc(
                state.activePlayer,
                R.evolve({score: R.inc}, players[state.activePlayer]),
                players
            ),
            state: R.evolve({matchesFound: R.inc}, state)
        };
    },

    /**
     * switchTurn
     * Toggles active player between player 1 and player 2.
     * Returns new state object rather than mutating the existing state.
     * @param {object} state - current game state
     * @returns {object} state with updated activePlayer
     */
    switchTurn: function (state) {
        return R.evolve({
            activePlayer: function (active) {
                if (active === 1) {
                    return 2;
                } else {
                    return 1;
                }
            }
        }, state);
    }
};

/**
 * updateUI
 * Syncs the webpage display to match the current game state.
 * Updates score text, turn label, active player highlighting background
 * @param {object} game - combined game object containing players and state
 */
const updateUI = function (game) {
    const p1ScoreEl = document.querySelector("#player1-score .p-score");
    const p2ScoreEl = document.querySelector("#player2-score .p-score");
    p1ScoreEl.textContent = game.players["1"].score;
    p2ScoreEl.textContent = game.players["2"].score;

    const p1Box = document.getElementById("player1-score");
    const p2Box = document.getElementById("player2-score");
    const turnDisplay = document.getElementById("turn-display");
    const bgOverlay = document.getElementById("bg-overlay");

    if (game.state.activePlayer === 1) {
        p1Box.classList.add("p1-active");
        p2Box.classList.remove("p2-active");
        turnDisplay.textContent = "Player 1's Turn";
        bgOverlay.style.backgroundColor = "rgba(239, 68, 68, 0.15)";
    } else {
        p2Box.classList.add("p2-active");
        p1Box.classList.remove("p1-active");
        turnDisplay.textContent = "Player 2's Turn";
        bgOverlay.style.backgroundColor = "rgba(59, 130, 246, 0.15)";
    }
};

/**
 * handleCardClick
 * Calculates game state changes after a card selection.
 * Returns outcome data for UI layer in main.js.
 * @param {object} game - main game object holding players and state
 * @param {string} cardId - unique identifier string for selected card
 * @returns {object|null} outcome instruction or null if click is invalid
 */
const handleCardClick = function (game, cardId) {
    // Prevents new selections while game is comparing an existing pair
    if (game.state.isLocked) {
        return null;
    }

    // Prevent selecting the same already flipped card twice
    if (game.state.flippedCards.includes(cardId)) {
        return null;
    }

    // Add card to flipped list
    game.state.flippedCards.push(cardId);

    // Less than two cards selected -> trigger single flip in UI
    if (game.state.flippedCards.length < 2) {
        return {
            action: "flip_single",
            cardId: cardId
        };
    }

    game.state.isLocked = true;
    const [firstId, secondId] = game.state.flippedCards;
    const icon1 = game.cardLookup[firstId];
    const icon2 = game.cardLookup[secondId];

    if (icon1 === icon2) {
        // Two cards match -> update scores and match counter
        const updated = StateManager.addScoreToActive(game.state, game.players);
        game.state = updated.state;
        game.players = updated.players;

        const matchedCount = game.state.matchesFound;
        const totalPairCount = game.state.totalPairs;
        const gameComplete = matchedCount === totalPairCount;
        return {
            action: "match",
            cardIds: [firstId, secondId],
            gameComplete: gameComplete
        };
    } else {
        // Cards do not match -> signal UI to flip back and swap positions
        game.state = StateManager.switchTurn(game.state);
        return {
            action: "no_match_swap",
            cardIds: [firstId, secondId]
        };
    }
};

export {StateManager, handleCardClick, updateUI};
