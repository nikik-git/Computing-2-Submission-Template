import R from "./ramda.js";
/**
 * @file game_logic.js
 * @author Niki Kan
 * @description This file contains the core game logic.
 */

const CardAssets = {
    iconFiles: [
        "assets/Cake.svg", "assets/Clock.svg", "assets/Dice.svg",
        "assets/Fish.svg", "assets/Flower.svg", "assets/Football.svg",
        "assets/Ghost.svg", "assets/Heart.svg", "assets/Hieroglyphic.svg",
        "assets/Images.svg", "assets/Ladybug.svg", "assets/Moon.svg",
        "assets/Mouse.svg", "assets/Star.svg", "assets/Sun.svg",
        "assets/Watermelon.svg"
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

    toIconHtml: function () {
        return R.map(function (file) {
            return "<img src=\"" + file + "\" class=\"card-icon\">";
        }, CardAssets.iconFiles);
    },

    getShuffledDeck: function () {
        return R.pipe(
            CardAssets.toIconHtml,
            function (icons) {
                return [...icons, ...icons];
            },
            CardAssets.shuffle
        )();
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

export {CardAssets, StateManager};