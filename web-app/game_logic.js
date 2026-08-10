import R from "./ramda.js";
/**
 * @file game_logic.js
 * @author Niki
 * @description This file contains the core game logic.
 */

const CardAssets = {
    iconFiles: [
        "./assets/Cake.svg", "./assets/Clock.svg", "./assets/Dice.svg",
        "./assets/Fish.svg", "./assets/Flower.svg", "./assets/Football.svg",
        "./assets/Ghost.svg", "./assets/Heart.svg", "./assets/Hieroglyphic.svg",
        "./assets/Images.svg", "./assets/Ladybug.svg", "./assets/Moon.svg",
        "./assets/Mouse.svg", "./assets/Star.svg", "./assets/Sun.svg",
        "./assets/Watermelon.svg"
    ],

    shuffle: function (array) {
        const arr = [...array];
        const swap = function (acc, i) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = acc[i];
            acc[i] = acc[j];
            acc[j] = temp;
            return acc;
        };
        return R.reduce(swap, arr, R.reverse(R.range(1, arr.length)));
    },

    getShuffledDeck: function () {
        return R.pipe(
            CardAssets.shuffle,
            R.take(8),
            function (icons) {
                return [...icons, ...icons];
            },
            CardAssets.shuffle
        )(CardAssets.iconFiles);
    }
};

const StateManager = {
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

const updateUI = function (game) {
    document.querySelector("#player1-score .p-score").textContent=game.players["1"].score;
    document.querySelector("#player2-score .p-score").textContent=game.players["2"].score;

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

const handleCardClick = function (card, game) {
    if (game.state.isLocked) {
        return;
    }
    if (card.classList.contains("flipped") &&
    card.classList.contains("matched")) {
        return;
    }

    card.classList.add("flipped");
    game.state.flippedCards.push(card);

    if (game.state.flippedCards.length === 2) {
        game.state.isLocked = true;
        const [card1, card2] = game.state.flippedCards;
        const icon1 = card1.dataset.icon;
        const icon2 = card2.dataset.icon;

        if (icon1 === icon2) {
            card1.classList.add("matched");
            card2.classList.add("matched");

            const updated = StateManager.addScoreToActive(
                game.state, game.players
            );
            game.state = updated.state;
            game.players = updated.players;

            updateUI(game);
            game.state.flippedCards = [];
            game.state.isLocked = false;

            if (game.state.matchesFound === game.state.totalPairs) {
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
        } else {
            setTimeout(function () {
                card1.classList.remove("flipped");
                card2.classList.remove("flipped");

                game.state = StateManager.switchTurn(game.state);
                updateUI(game);

                game.state.flippedCards = [];
                game.state.isLocked = false;
            }, 1000);
        }
    }
};

export {CardAssets, StateManager, handleCardClick, updateUI};