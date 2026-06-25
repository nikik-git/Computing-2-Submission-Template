import R from "./ramda.js";
import {CardAssets, StateManager} from "./memory_card.js";

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
    state: {
        activePlayer: 1,
        flippedCards: [],
        isLocked: false,
        matchesFound: 0,
        totalPairs: 8
    }
};

const UI = {
    renderCard: R.curry(function (clickHandler, iconHtml) {
        var card = document.createElement("div");
        var html = [
            "<div class=\"card-inner\">",
            "<div class=\"card-front\"></div>",
            "<div class=\"card-back\">",
            iconHtml,
            "</div></div>"
        ];
        card.className = "card";
        card.dataset.icon = iconHtml;
        card.innerHTML = html.join("");
        card.addEventListener("click", function () {
            clickHandler(card);
        });
        return card;
    })
};

export {game, UI};