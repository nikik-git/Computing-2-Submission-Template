import fc from "fast-check";
import {CardAssets, StateManager} from "./game_logic.js";

/**
 * @property Shuffling should always preserve the same number of elements
 * and contain the same elements (just in a different order).
 */
const testShuffleProperty = function () {

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
};

/**
 * @property Swapping the turn twice should
 * always return to the original player.
 */

const testSwitchTurnProperty = function () {

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

    console.log("Passed: PBT switchTurn is involutive (toggles back).");
};

/**
 * @property Adding a score should always increase the existing score by 1
 * regardless of what the initial score was.
 */
const testScoreIncrementProperty = function () {
    fc.assert(
        fc.property(
            fc.integer({min: 0, max: 1000}), // Any reasonable starting score
            fc.oneof(fc.constant(1), fc.constant(2)), // Any player
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
    console.log("Passed: PBT score increment is additive.");
};

// Run the suite
try {
    testShuffleProperty();
    testSwitchTurnProperty();
    testScoreIncrementProperty();
    console.log("All properties verified successfully!");
} catch (err) {
    console.error("Property verification failed:", err);
}