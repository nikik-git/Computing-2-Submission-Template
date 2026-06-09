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
            "<div class=\"card-back\">", iconHtml, "</div></div>"
        ];
        card.className = "card";
        card.dataset.icon = iconHtml;
        card.innerHTML = html.join("");
        card.addEventListener("click", () => clickHandler(card));
        return card;
    })
};

// --- UI scoring ---
const updateScoreUI = () => {
    R.forEach((id) => {
        const p = game.players[id];
        const el = document.getElementById(p.el);
        const activeClass = game.state.activePlayer == id ? `p${id}-active` : "";
        el.querySelector(".p-score").textContent = p.score;
        el.className = `score-box ${activeClass}`;
    }, ["1", "2"]);
    document.getElementById("turn-display").textContent = `${game.players[game.state.activePlayer].name}'s Turn`;
};

const showWinner = () => {
    const p1 = game.players["1"].score;
    const p2 = game.players["2"].score;
    const winnerText = p1 === p2 ? "It's a Draw!" : (p1 > p2 ? "Player 1 Wins!":"Player 2 Wins!");
    document.getElementById("winner-message").textContent = winnerText;
    document.getElementById("win-modal").classList.remove("hidden");
};

// --- game logic ---
const processMatch = () => {
    const updated = StateManager.addScoreToActive(game.state, game.players);
    game.state = updated.state;
    Object.assign(game.players, updated.players);
    game.state.flippedCards = [];
    updateScoreUI();
    if (game.state.matchesFound === game.state.totalPairs) showWinner();
    game.state.isLocked = false;
};

const processMismatch = () => {
    setTimeout(() => {
        R.forEach((card) => card.classList.remove("flipped"), game.state.flippedCards);
        game.state.flippedCards = [];
        game.state = StateManager.switchTurn(game.state);
        updateScoreUI();
        game.state.isLocked = false;
    }, 1000);
};

const handleCardClick = (card) => {
    if (game.state.isLocked || card.classList.contains("flipped")) return;
    card.classList.add("flipped");
    game.state.flippedCards.push(card);
    if (game.state.flippedCards.length === 2) {
        game.state.isLocked = true;
        const [c1, c2] = game.state.flippedCards;
        c1.dataset.icon === c2.dataset.icon ? processMatch() : processMismatch();
    }
};

// --- set up ---
document.getElementById("play-btn").addEventListener("click", () => {
    document.getElementById("start-screen").classList.add("hidden");
    document.getElementById("game-screen").classList.remove("hidden");
    const deck = CardAssets.getShuffledDeck();
    const board = document.getElementById("game-board");
    R.forEach((icon) => board.appendChild(UI.renderCard(handleCardClick, icon)), deck);
    updateScoreUI();
});

export { game, UI };