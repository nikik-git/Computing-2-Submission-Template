/* jslint es6:true, node:true */
import {initialState, isMatch, shuffleCards} from "./game_logic.js";

/**
 * A helper to generate random numbers for testing ranges.
 * @param {number} min - Minimum value.
 * @param {number} max - Maximum value.
 * @returns {number} Random integer between min and max.
 */
const getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Property: Initial state must always contain the correct keys.
 */
const testInitialState = function () {
    const state = initialState();
    const expectedKeys = ["board", "currentPlayer", "scores", "flippedCards"];

    let i = 0;
    while (i < expectedKeys.length) {
        if (state[expectedKeys[i]] === undefined) {
            throw new Error("Missing key: " + expectedKeys[i]);
        }
        i = i + 1;
    }
    console.log("Passed: initialState structure.");
};

/**
 * Property: isMatch must return true for identical IDs and false for different.
 */
const testIsMatch = function () {
    const cardA = {id: 1};
    const cardB = {id: 1};
    const cardC = {id: 2};

    if (isMatch(cardA, cardB) !== true) {
        throw new Error("Match failed: Identical IDs should match.");
    }
    if (isMatch(cardA, cardC) !== false) {
        throw new Error("Match failed: Different IDs should not match.");
    }
    console.log("Passed: isMatch logic.");
};

/**
 * Property: shuffleCards must always return an array of the correct size.
 */
const testShuffleRange = function () {
    const testRuns = 100;
    let i = 0;

    while (i < testRuns) {
        const randomSize = getRandomInt(20, 100);
        const deck = [];
        let j = 0;

        while (j < randomSize) {
            deck.push({id: j});
            j = j + 1;
        }

        const result = shuffleCards(deck);

        if (result.length !== 16) {
            throw new Error("Shuffle failed: Result size is not 16.");
        }
        i = i + 1;
    }
    console.log("Passed: shuffleCards property range.");
};

/**
 * Run the tests.
 */
const runTests = function () {
    try {
        testInitialState();
        testIsMatch();
        testShuffleRange();
        console.log("All tests passed successfully!");
    } catch (error) {
        console.error("Test failed: " + error.message);
    }
};

runTests();