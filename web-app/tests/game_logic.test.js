import fc from "fast-check";
import {CardAssets, StateManager} from "../game_logic.js";
import {describe, it} from "mocha";

/**
 * Test property: Shuffling should always preserve the same number of elements
 * and contain the same elements (just in a different order).
 * @returns {void}
 */
describe("CardAssets.shuffle", function () {
    it("preserves length and all original elements after shuffle", function () {
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
 * Test property: Swapping the turn twice should
 * always return to the original player.
 * @returns {void}
 */
describe("StateManager.switchTurn", function () {
    it("toggles back to original player when called twice (involutive)", function () {
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
});

/**
 * Test property: Adding a score should always increase the existing score by 1
 * regardless of what the initial score was.
 * @returns {void}
 */
describe("StateManager.addScoreToActive", function () {
    it("increments active player score by exactly one", function () {
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
                    return result.players[activePlayer].score === initialScore + 1;
                }
            )
        );
    });
});