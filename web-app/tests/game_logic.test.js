import fc from "fast-check";
import {StateManager} from "../game_logic.js";
import {CardAssets} from "../card_assets.js";
import {describe, it} from "mocha";
import R from "../ramda.js";

/**
 * Test property: Shuffling should always preserve the same number of elements
 * and contain the same elements (just in a different order).
 * @returns {void}
 */
describe("CardAssets.shuffle", function () {
    it("keeps length and all original elements after shuffle", function () {
        const shufflePreservesData = function (data) {
            const result = CardAssets.shuffle(data);
            const sameLength = (result.length === data.length);
            const hasAllElements = result.every(function (item) {
                return data.includes(item);
            });
            return sameLength && hasAllElements;
        };

        fc.assert(
            fc.property(
                fc.array(fc.integer()),
                shufflePreservesData
            )
        );
    });
});

/**
 * Test property: getShuffledDeck builds a valid playable pair deck
 * Rules:
 * 1. Final deck length always equals 16 (8 pairs)
 * 2. Every icon appears exactly twice
 * 3. Every icon inside the deck comes from CardAssets.iconFiles
 * @returns {void}
 */
describe("CardAssets.getShuffledDeck", function () {
    it("generates 16cards where everyicon occurs exactly twice", function () {
        const validDeckPredicate = function () {
            const deck = CardAssets.getShuffledDeck();
            const lengthValid = deck.length === 16;

            // Count occurrences of each icon
            const countIcons = R.countBy(R.identity);
            const iconCounts = countIcons(deck);
            const allPairs = R.all(R.equals(2), Object.values(iconCounts));

            // Every icon in deck exists inside original iconFiles
            const allIconsValid = R.all(
                (icon) => R.includes(icon, CardAssets.iconFiles),
                deck
            );


            return lengthValid && allPairs && allIconsValid;
        };

        fc.assert(
            fc.property(fc.constant(null), validDeckPredicate)
        );
    });

    it("checks shuffle randomness", function () {
        const deckA = CardAssets.getShuffledDeck();
        const deckB = CardAssets.getShuffledDeck();
        fc.pre(!R.equals(deckA, deckB));
    });
});

/**
 * Test property: Swapping the turn twice should
 * always return to the original player.
 * @returns {void}
 */
describe("StateManager.switchTurn", function () {
    it("goes back to original player when called twice", function () {
        const isSwitchTurnInvolutive = function (player) {
            const state = {activePlayer: player};
            const nextState = StateManager.switchTurn(state);
            const originalState = StateManager.switchTurn(nextState);
            return originalState.activePlayer === player;
        };

        const playerGenerator = fc.oneof(
            fc.constant(1),
            fc.constant(2)
        );

        fc.assert(
            fc.property(playerGenerator, isSwitchTurnInvolutive)
        );
    });

    it("always switches activePlayer from 1 to 2 and 2 to 1", function () {
        const turnSwapsCorrectly = function (startingPlayer) {
            const state = {activePlayer: startingPlayer};
            const updated = StateManager.switchTurn(state);

            if (startingPlayer === 1) {
                return updated.activePlayer === 2;
            }
            if (startingPlayer === 2) {
                return updated.activePlayer === 1;
            }

            return false;
        };

        fc.assert(
            fc.property(
                fc.oneof(fc.constant(1), fc.constant(2)),
                turnSwapsCorrectly
            )
        );
    });
});


/**
 * Test property: Adding a score should always increase the existing score by 1
 * regardless of what the initial score was.
 * @returns {void}
 */
describe("StateManager.addScoreToActive", function () {
    it("adds to active player score by exactly one", function () {
        fc.assert(
            fc.property(
                fc.integer({min: 0, max: 1000}),
                fc.oneof(fc.constant(1), fc.constant(2)),
                function (initialScore, activePlayer) {
                    const mockPlayers = {
                        "1": {score: 0},
                        "2": {score: 0}
                    };
                    if (activePlayer === 1) {
                        mockPlayers["1"].score = initialScore;
                    } else if (activePlayer === 2) {
                        mockPlayers["2"].score = initialScore;
                    }

                    const mockState = {activePlayer: activePlayer};
                    const result = StateManager.addScoreToActive(
                        mockState,
                        mockPlayers
                    );
                    const newScore = result.players[activePlayer].score;
                    return newScore === initialScore + 1;

                }
            )
        );
    });

    it("does NOT modify the score of the inactive player", function () {
        const checkScore = function (scoreP1, scoreP2, activePlayer) {
            const mockPlayers = {
                "1": {score: scoreP1},
                "2": {score: scoreP2}
            };
            const mockState = {activePlayer: activePlayer};
            const updated = StateManager.addScoreToActive(
                mockState,
                mockPlayers
            );

            if (activePlayer === 1) {
                return updated.players["2"].score === scoreP2;
            } else {
                return updated.players["1"].score === scoreP1;
            }
        };

        fc.assert(
            fc.property(
                fc.nat(),
                fc.nat(),
                fc.oneof(fc.constant(1), fc.constant(2)),
                checkScore
            )
        );
    });
});
