import R from "./ramda.js";

/**
 * CardAssets manages icon asset paths, shuffling logic and deck generation
 */
const CardAssets = {
    iconFiles: [
        "./assets/Cake.svg", "./assets/Clock.svg", "./assets/Dice.svg",
        "./assets/Fish.svg", "./assets/Flower.svg", "./assets/Football.svg",
        "./assets/Ghost.svg", "./assets/Heart.svg",
        "./assets/Hieroglyphics.svg", "./assets/Images.svg",
        "./assets/Ladybug.svg", "./assets/Moon.svg",
        "./assets/Mouse.svg", "./assets/Star.svg", "./assets/Sun.svg",
        "./assets/Watermelon.svg"
    ],

    /**
     * shuffle
     * Implements Fisher-Yates shuffle algorithm to randomise array order.
     * Creates a copy of input array to avoid changing the source
     * @param {Array} array - collection of file paths to shuffle
     * @returns {Array} new shuffled array
     */
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

    /**
     * getShuffledDeck
     * Sequence: shuffle icons, take first 8, duplicate to
     * create matching pairs, then shuffle the full set again for random layout
     * @returns {Array} final shuffled list of icon paths for the game board
     */
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

export {CardAssets};