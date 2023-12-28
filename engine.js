// Definindo os dados das cartas
const cardData = [
  {
    id: 0,
    name: "Blue Eyes White Dragon",
    type: "Paper",
    img: "./src/assets/icons/dragon.png",
    Winof: [1],
    Loseof: [2],
  },
  {
    id: 1,
    name: "Dark Magician",
    type: "Rock",
    img: "./src/assets/icons/magician.png",
    Winof: [2],
    Loseof: [0],
  },
  {
    id: 2,
    name: "Exodia",
    type: "Scissors",
    img: "./src/assets/icons/exodia.png",
    Winof: [0],
    Loseof: [1],
  },
  // ... adicione outros dados conforme necessário
];

// Estado do jogo
const state = {
  score: {
    playerScore: 0,
    computerScore: 0,
    scoreBox: document.getElementById("score_points"),
  },

  cardSprites: {
    avatar: document.getElementById("card-image"),
    name: document.getElementById("card-name"),
    type: document.getElementById("card-type"),
  },

  fieldCards: {
    player: document.getElementById("player-field-card"),
    computer: document.getElementById("computer-field-card"),
  },

  playerSides: {
    player1: "player-cards",
    computer: "computer-cards",
    player1BOX: document.querySelector("#player-cards"),
    computerBOX: document.querySelector("#computer-cards"),
  },

  action: {
    button: document.getElementById("next-duel"),
  },
};

// Desestruturando para obter referências diretas
const { player1BOX, computerBOX } = state.playerSides;

// Flag para verificar se a imagem do Millennium está definida
let isMillenniumImageSet = false;

// Função para remover todas as imagens de cartas do campo
async function removeAllCardsImages() {
  [player1BOX, computerBOX].forEach((box) => {
    box.innerHTML = "";
  });
}

// Atualizar a pontuação exibida
async function updateScore() {
  const { playerScore, computerScore, scoreBox } = state.score;
  scoreBox.innerText = `Win: ${playerScore} | Lose: ${computerScore}`;
}

// Função para desenhar um botão com o texto fornecido
async function drawButton(text) {
  const { button } = state.action;
  button.innerText = text.toUpperCase();
  button.style.display = "block";
}

// Desenha um número específico de cartas em um lado do campo
async function drawCards(cardNumbers, fieldSide) {
  for (let i = 0; i < cardNumbers; i++) {
    const randomIdCard = await getRandomCardId();
    const CardImage = await createCardImage(randomIdCard, fieldSide);
    document.getElementById(fieldSide).appendChild(CardImage);
  }
}

// Reseta o duelo para um novo conjunto de cartas
async function resetDuel(cardNumbers, fieldSide) {
  // Limpa a imagem do avatar
  state.cardSprites.avatar.src = "";
  // Reseta a flag do Millennium
  isMillenniumImageSet = false;
  // Torna o botão visível novamente
  state.action.button.style.display = "";
  // Oculta os campos de cartas dos jogadores
  state.fieldCards.player.style.display = "none";
  state.fieldCards.computer.style.display = "none";
  // Remove todas as imagens de cartas do campo
  removeAllCardsImages();
  // Inicializa um novo conjunto de cartas
  init();

  // Adiciona e remove a classe 'hidden' para reiniciar a animação
  const cardVersusContainer = document.querySelector(".card-versus__container");
  cardVersusContainer.classList.add("");
  setTimeout(() => {
    cardVersusContainer.classList.remove("hidden");
  }, 0);
}

// Toca um som de acordo com o resultado do duelo
async function playAudio(status) {
  const audio = new Audio(`./src/assets/audios/${status}.wav`);

  try {
    audio.play();
  } catch (error) {
    // Trata erros de reprodução de áudio, se necessário
  }
}

// Cria um elemento de imagem para representar uma carta
async function createCardImage(IdCard, fieldSide) {
  const CardImage = document.createElement("img");
  CardImage.setAttribute("height", "100px");
  CardImage.setAttribute("src", "./src/assets/icons/card-back.png");
  CardImage.setAttribute("data-id", IdCard);
  CardImage.classList.add("card");

  // Adiciona eventos de mouseover e clique para cartas do jogador
  if (fieldSide === state.playerSides.player1) {
    CardImage.addEventListener("mouseover", () => {
      drawSelectCard(IdCard);
    });
    CardImage.addEventListener("click", () => {
      setCardsField(CardImage.getAttribute("data-id"));
    });
  }

  return CardImage;
}

// Atualiza o avatar e informações da carta ao passar o mouse sobre ela
async function drawSelectCard(index) {
  state.cardSprites.avatar.src = cardData[index].img;
  state.cardSprites.name.innerText = cardData[index].name;
  state.cardSprites.type.innerText = "Attribute: " + cardData[index].type;
}

// Define as cartas no campo e verifica os resultados do duelo
async function setCardsField(cardId) {
  if (!isMillenniumImageSet) {
    await removeAllCardsImages();
    let computerCardId = await getRandomCardId();

    state.fieldCards.player.style.display = "block";
    state.fieldCards.computer.style.display = "block";

    state.cardSprites.avatar.src = "./src/assets/icons/millenium.png";
    state.cardSprites.name.innerText = "Yuuu - Giii- OOOOOOhhhh!";
    state.cardSprites.type.innerText = "Pedra - Papel e Tesouraaaaaa!";

    state.fieldCards.player.src = cardData[cardId].img;
    state.fieldCards.computer.src = cardData[computerCardId].img;

    let duelResults = await checkDuelResults(cardId, computerCardId);

    await updateScore();
    await drawButton(duelResults);

    // Se a carta do jogador for a "Millennium", mantenha a imagem
    if (cardData[cardId].name.toLowerCase().includes('millennium')) {
      isMillenniumImageSet = true;
      state.cardSprites.avatar.src = "./src/assets/icons/millennium.png";
    }
  }
}

// Gera um ID de carta aleatório
async function getRandomCardId() {
  const randomIndex = Math.floor(Math.random() * cardData.length);
  return cardData[randomIndex].id;
}

// Verifica os resultados do duelo com base nas cartas escolhidas
async function checkDuelResults(playerCardId, computerCardId) {
  let duelResults = "Draw";
  let playerCard = cardData[playerCardId];

  if (playerCard.Winof.includes(computerCardId)) {
    duelResults = "Win";
    state.score.playerScore++;
  }

  if (playerCard.Loseof.includes(computerCardId)) {
    duelResults = "Lose";
    state.score.computerScore++;
  }
  await playAudio(duelResults);
  return duelResults;
}

// Inicializa o jogo desenhando as cartas iniciais
function init() {
  drawCards(5, state.playerSides.player1);
  drawCards(5, state.playerSides.computer);

  const bgm = document.getElementById("bgm");
  bgm.play();
}

// Chama a função de inicialização ao carregar a página
init();
