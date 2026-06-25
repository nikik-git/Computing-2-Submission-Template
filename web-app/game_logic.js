/**
 * @file game_logic.js
 * @author Niki Kan
 * @description This file contains the core game logic, including state management and utility functions.
 */

/* jslint es6:true, module:true */
import * as R from "./ramda.js";

/**
 * @returns {Object} The default game state structure.
 */
const board_size = 16;

export const cards = [
  "/assets/Cake.svg", "/assets/Clock.svg",
  "/assets/Dice.svg", "/assets/Fish.svg",
  "/assets/Flower.svg", "/assets/Football.svg",
  "/assets/Ghost.svg", "/assets/Heart.svg",
  "/assets/Hieroglyphics.svg", "/assets/Images.svg",
  "/assets/Ladybug.svg", "/assets/Moon.svg",
  "/assets/Mouse.svg", "/assets/Star.svg",
  "/assets/Sun.svg", "/assets/Watermelon.svg"
];

export const players = {
  p1: {name: "Player 1", color: "red"},
  p2: {name: "Player 2", color: "blue"}
};

export const initialState = () => ({
  board: [],
  currentPlayer: "p1",
  scores: { p1: 0, p2: 0 },
  flippedCards: [],
  gameOver: false
});

/**
 * Shufles the game cards and limits the result to the board size.
 * @param {Array} cards - The array of card objects.
 * @returns {Array} A shuffled and truncated array of cards.
 */
export const shuffleCards = (cards) =>
  R.pipe(
    R.sortBy(() => Math.random()),
    R.take(board_size)
  )(cards);

/**
 * Curried fnnction to determine if two cards match based on their ID.
 * @param {Object} card1 - The first card to compare.
 * @param {Object} card2 - The second card to compare.
 * @returns {boolean} True if the card IDs match, false otherwise.
 */
export const isMatch = R.curry((card1, card2) => card1.id === card2.id);


/** @type {Object} */
export let gameState = initialState();