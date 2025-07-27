// --- Elementos do DOM ---
const startScreen = document.getElementById('startScreen');
const tamagotchiScreen = document.getElementById('tamagotchiScreen');
const shopScreen = document.getElementById('shopScreen');
const inventoryScreen = document.getElementById('inventoryScreen');
const gamesScreen = document.getElementById('gamesScreen');

const petNameInput = document.getElementById('petNameInput');
const startGameBtn = document.getElementById('startGameBtn');

const petNameDisplay = document.getElementById('petName');
const moodDisplay = document.getElementById('mood');
const statusDisplay = document.getElementById('status');
const petImage = document.getElementById('petImage');
const nivelDisplay = document.getElementById('nivel');
const moedasDisplay = document.getElementById('moedas');

const feedButton = document.getElementById('feedButton');
const playButton = document.getElementById('playButton');
const sleepButton = document.getElementById('sleepButton');
const vaccinateButton = document.getElementById('vaccinateButton');
const shopButton = document.getElementById('shopButton');
const inventoryButton = document.getElementById('inventoryButton');
const gamesButton = document.getElementById('gamesButton');
const passDayButton = document.getElementById('passDayButton');
const actionsContainer = document.getElementById('actions');

const gameMessage = document.getElementById('gameMessage');
const alertIconsContainer = document.getElementById('alertIcons');

const statusIconsContainer = document.querySelector('.status-icons');

const eggStatusGroup = document.getElementById('eggStatusGroup');
const eggWarmthDisplay = document.getElementById('eggWarmthDisplay');
const warmEggButton = document.getElementById('warmEggButton');


// --- Variáveis do Jogo ---
const GITHUB_REPO_NAME = 'meu-tamagotchi';

let pet = {
    name: '',
    level: 0,
    hunger: 100,
    fun: 100,
    energy: 100,
    health: 100,
    isSleeping: false,
    isSick: false,
    ageDays: 0,
    moedas: 0,
    eggWarmth: 100,
    isHatching: false,
    isHot: false,
    evolutionStage: 'egg',
    personality: 'default',
    currentAction: null
};

const evolutionThresholds = {
    baby: 2,
    child: 9,
    adult: 16,
    elder: 23
};

const itemPrices = {
    "ração premium": 10,
    "brinquedo de bolinhas": 15,
    "vacina forte": 20
};

let inventory = {
    "ração premium": 0,
    "brinquedo de bolinhas": 0,
    "vacina forte": 0
};

let gameInterval;
let statusUpdateInterval;

// --- Funções Auxiliares de Caminho de Imagem ---
function getPetImagePath(imageName) {
    const isGitHubPages = window.location.hostname.endsWith('github.io');
    if (isGitHubPages && GITHUB_REPO_NAME) {
        return `/${GITHUB_REPO_NAME}/imgs/${imageName}`;
    }
    return `imgs/${imageName}`;
}

// --- Funções do Jogo ---

function showScreen(screenToShow) {
    const screens = [startScreen, tamagotchiScreen, shopScreen, inventoryScreen, gamesScreen, document.getElementById('rpsGame'), document.getElementById('numberGuessingGame'), document.getElementById('ticTacToeGame')];
    screens.forEach(screen => {
        if (screen) {
            screen.classList.add('hidden');
        }
    });
    if (screenToShow) {
        screenToShow.classList.remove('hidden');
    }
}

function updateDisplay() {
    petNameDisplay.textContent = `Nome: ${pet.name}`;
    moodDisplay.textContent = `Humor: ${getMood()}`;
    nivelDisplay.textContent = `Nível: ${getEvolutionStageText()} (Idade: ${pet.ageDays} dias)`;
    moedasDisplay.textContent = `Moedas: ${pet.moedas}`;

    petImage.src = getPetImageSrc();

    let statusText = '';
    if (pet.isSick) statusText += 'Doente 😞 ';
    if (pet.isSleeping) statusText += 'Dormindo 😴 ';
    if (pet.evolutionStage === 'egg') {
        if (pet.eggWarmth < 30) statusText += 'Ovo Frio 🥶 ';
        else if (pet.eggWarmth < 60) statusText += 'Ovo Esfriando 🤔 ';
        else statusText += 'Ovo 🥚 ';
    } else {
        if (pet.hunger < 30) statusText += 'Fome 🍔 ';
        if (pet.fun < 30) statusText += 'Entediado 🙁 ';
        if (pet.energy < 30 && !pet.isSleeping) statusText += 'Cansado 😪 ';
    }
    statusDisplay.textContent = `Status: ${statusText.trim()}`;

    if (statusIconsContainer) {
        statusIconsContainer.classList.add('hidden');
    }

    updateEggDisplay();
    updateActionButtonsVisibility();
    checkAlerts();
}

function getMood() {
    if (pet.isSick) return 'Doente 😞';
    if (pet.isSleeping) return 'Dormindo 😴';
    if (pet.hunger < 30 || pet.fun < 30 || pet.energy < 30) return 'Triste 😟';
    if (pet.hunger > 80 && pet.fun > 80 && pet.energy > 80) return 'Radiante 😄';
    return 'Normal 🙂';
}

function getEvolutionStageText() {
    switch (pet.evolutionStage) {
        case 'egg': return 'Ovo';
        case 'baby': return 'Bebê';
        case 'child': return 'Criança';
        case 'adult': return 'Adulto';
        case 'elder': return 'Velho';
        case 'dead': return 'Morto';
        default: return 'Desconhecido';
    }
}

function getPetImageSrc() {
    if (pet.evolutionStage === 'dead') {
        return getPetImagePath('morto.png');
    }
    
    if (pet.currentAction) {
        const stage = pet.evolutionStage;
        if (pet.currentAction === 'eating') {
            if (stage === 'baby') return getPetImagePath('bebe_comendo.png');
            if (stage === 'child') return getPetImagePath('crianca_comendo.png');
            if (stage === 'adult') return getPetImagePath('adulto_comilao.png');
            if (stage === 'elder') return getPetImagePath('velha_comilona.png');
        } else if (pet.currentAction === 'playing') {
            if (stage === 'baby') return getPetImagePath('bebe_brincando.png');
            if (stage === 'child') return getPetImagePath('crianca_brincando.png');
            if (stage === 'adult') return getPetImagePath('adulto_feliz.png');
            if (stage === 'elder') return getPetImagePath('velho_feliz.png');
        }
    }

    if (pet.isSleeping) {
        const stage = pet.evolutionStage;
        if (stage === 'baby') return getPetImagePath('bebe_dormindo.png');
        if (stage === 'child') return getPetImagePath('crianca_dormindo.png');
        if (stage === 'adult') return getPetImagePath('adulto_preguicoso.png');
        if (stage === 'elder') return getPetImagePath('velho_dormindo.png');
        return getPetImagePath('dormindo.png');
    }
    
    if (pet.isSick) {
        const stage = pet.evolutionStage;
        if (stage === 'baby') return getPetImagePath('bebe_doente.png');
        if (stage === 'child') return getPetImagePath('crianca_doente.png');
        if (stage === 'elder') return getPetImagePath('velho_doente.png');
        return getPetImagePath('doente.png');
    }
    
    const stage = pet.evolutionStage;
    if (stage === 'egg') {
        if (pet.isHatching) return getPetImagePath('ovo_rachando.png');
        if (pet.isHot) return getPetImagePath('ovo_quente.png');
        if (pet.eggWarmth < 40) return getPetImagePath('ovo_frio.png');
        return getPetImagePath('ovo.png');
    }
    
    if (stage === 'baby') return getPetImagePath('bebe.png');
    if (stage === 'child') return getPetImagePath('crianca.png');
    if (stage === 'adult') return getPetImagePath('adulto_feliz.png');
    if (stage === 'elder') return getPetImagePath('velho_feliz.png');

    return getPetImagePath('ovo.png');
}

function updateEggDisplay() {
    if (pet.evolutionStage === 'egg') {
        eggStatusGroup.classList.remove('hidden');
        if (typeof pet.eggWarmth !== 'number' || isNaN(pet.eggWarmth)) {
            pet.eggWarmth = 100; // Reseta o valor se for inválido
        }
        eggWarmthDisplay.textContent = `Aquecimento: ${pet.eggWarmth.toFixed(0)}%`;
    } else {
        eggStatusGroup.classList.add('hidden');
    }
}

function updateActionButtonsVisibility() {
    const isEgg = pet.evolutionStage === 'egg';
    const isSleeping = pet.isSleeping;
    const isDead = pet.evolutionStage === 'dead';

    feedButton.classList.add('hidden');
    playButton.classList.add('hidden');
    sleepButton.classList.add('hidden');
    vaccinateButton.classList.add('hidden');
    warmEggButton.classList.add('hidden');
    passDayButton.classList.add('hidden');

    let restartBtn = document.getElementById('restartButton');
    if (restartBtn) {
        restartBtn.remove();
    }

    if (isDead) {
        restartBtn = document.createElement('button');
        restartBtn.id = 'restartButton';
        restartBtn.className = 'action-button';
        restartBtn.textContent = 'Reiniciar Jogo';
        restartBtn.addEventListener('click', restartGame);
        actionsContainer.appendChild(restartBtn);

        shopButton.classList.add('hidden');
        inventoryButton.classList.add('hidden');
        gamesButton.classList.add('hidden');
    } else if (isEgg) {
        warmEggButton.classList.remove('hidden');
        shopButton.classList.add('hidden');
        inventoryButton.classList.add('hidden');
        gamesButton.classList.add('hidden');
        
        if(pet.eggWarmth >= 100) {
            passDayButton.classList.remove('hidden');
            passDayButton.textContent = 'Chocar o Ovo';
        } else {
            passDayButton.classList.add('hidden');
        }
        
    } else if (isSleeping) {
        sleepButton.classList.remove('hidden');
        sleepButton.textContent = 'Acordar';
        shopButton.classList.add('hidden');
        inventoryButton.classList.add('hidden');
        gamesButton.classList.add('hidden');
        passDayButton.classList.add('hidden');
    } else {
        feedButton.classList.remove('hidden');
        playButton.classList.remove('hidden');
        sleepButton.classList.remove('hidden');
        sleepButton.textContent = 'Dormir';
        vaccinateButton.classList.remove('hidden');
        shopButton.classList.remove('hidden');
        inventoryButton.classList.remove('hidden');
        gamesButton.classList.remove('hidden');
        passDayButton.classList.remove('hidden');
        passDayButton.textContent = 'Passar o Dia';
    }
}

function checkAlerts() {
    alertIconsContainer.innerHTML = '';
    if (pet.evolutionStage !== 'egg') {
        if (pet.hunger < 30) {
            const hungryIcon = document.createElement('span');
            hungryIcon.textContent = '🍔';
            hungryIcon.classList.add('blinking');
            alertIconsContainer.appendChild(hungryIcon);
        }
        if (pet.fun < 30) {
            const boredIcon = document.createElement('span');
            boredIcon.textContent = '🙁';
            boredIcon.classList.add('blinking');
            alertIconsContainer.appendChild(boredIcon);
        }
        if (pet.energy < 30) {
            const tiredIcon = document.createElement('span');
            tiredIcon.textContent = '😪';
            tiredIcon.classList.add('blinking');
            alertIconsContainer.appendChild(tiredIcon);
        }
        if (pet.isSick) {
            const sickIcon = document.createElement('span');
            sickIcon.textContent = '🤒';
            sickIcon.classList.add('blinking');
            alertIconsContainer.appendChild(sickIcon);
        }
    } else {
        if (pet.eggWarmth < 30) {
            const coldIcon = document.createElement('span');
            coldIcon.textContent = '🥶';
            coldIcon.classList.add('blinking');
            alertIconsContainer.appendChild(coldIcon);
        }
    }
}


function showMessage(msg, duration = 2000) {
    gameMessage.textContent = msg;
    gameMessage.classList.add('visible');
    setTimeout(() => {
        gameMessage.classList.remove('visible');
    }, duration);
}

function feedPet(amount = 20) {
    if (pet.evolutionStage === 'dead' || pet.isSleeping || pet.evolutionStage === 'egg') {
        showMessage('Não é o momento certo para alimentar!');
        return;
    }
    pet.hunger = Math.min(100, pet.hunger + amount);
    pet.health = Math.min(100, pet.health + 5);
    pet.moedas += 1;
    showMessage(`${pet.name} comeu e está mais feliz! +1 moeda!`);
}

function playWithPet(amount = 20) {
    if (pet.evolutionStage === 'dead' || pet.isSleeping || pet.evolutionStage === 'egg') {
        showMessage('Não é o momento certo para brincar!');
        return;
    }
    if (pet.energy < 20) {
        showMessage(`${pet.name} está muito cansado para brincar!`);
        return;
    }
    pet.fun = Math.min(100, pet.fun + amount);
    pet.energy = Math.max(0, pet.energy - 10);
    pet.moedas += 2;
    showMessage(`${pet.name} brincou e se divertiu muito! +2 moedas!`);
}

function toggleSleep() {
    if (pet.evolutionStage === 'dead' || pet.evolutionStage === 'egg') {
        showMessage('Não é possível fazer isso agora.');
        return;
    }

    pet.isSleeping = !pet.isSleeping;
    if (pet.isSleeping) {
        showMessage(`${pet.name} foi dormir... Zzzzz`);
        clearInterval(gameInterval);
        statusUpdateInterval = setInterval(() => {
            pet.energy = Math.min(100, pet.energy + 5);
            pet.health = Math.min(100, pet.health + 2);
            updateDisplay();
            if (pet.energy >= 100) {
                showMessage(`${pet.name} acordou revigorado!`);
                toggleSleep();
            }
        }, 1000);
    } else {
        showMessage(`${pet.name} acordou!`);
        clearInterval(statusUpdateInterval);
        startGameLoop();
    }
    updateDisplay();
}

function vaccinatePet() {
    if (pet.evolutionStage === 'dead' || pet.isSleeping || pet.evolutionStage === 'egg') {
        showMessage('Não é o momento certo para vacinar!');
        return;
    }
    const vaccinePrice = 5;
    if (pet.moedas >= vaccinePrice) {
        pet.moedas -= vaccinePrice;
        pet.isSick = false;
        pet.health = Math.min(100, pet.health + 30);
        showMessage(`${pet.name} foi vacinado e está se sentindo melhor!`);
    } else {
        showMessage('Você não tem moedas suficientes para vacinar!');
    }
    updateDisplay();
}

function warmEgg(amount = 10) {
    if (pet.evolutionStage !== 'egg') {
        showMessage('Isso não é um ovo!');
        return;
    }
    pet.eggWarmth = Math.min(100, pet.eggWarmth + amount);
    pet.moedas += 1;
    showMessage('Você aqueceu o ovo! +1 moeda!');

    pet.isHot = true;
    updateDisplay();
    setTimeout(() => {
        pet.isHot = false;
        updateDisplay();
    }, 2000);
}

function evolvePet() {
    if (pet.evolutionStage === 'egg') {
        // A lógica de chocar agora está no passDay()
    } else if (pet.evolutionStage === 'baby' && pet.ageDays >= evolutionThresholds.child) {
        pet.evolutionStage = 'child';
        pet.level = 2;
        showMessage(`${pet.name} cresceu! Agora é uma criança!`, 3000);
    } else if (pet.evolutionStage === 'child' && pet.ageDays >= evolutionThresholds.adult) {
        pet.evolutionStage = 'adult';
        pet.level = 3;
        if (pet.hunger < 50) {
            pet.personality = 'comilao';
        } else if (pet.fun < 50) {
            pet.personality = 'preguicoso';
        } else {
            pet.personality = 'feliz';
        }
        showMessage(`${pet.name} cresceu! Agora é um adulto!`, 3000);
    } else if (pet.evolutionStage === 'adult' && pet.ageDays >= evolutionThresholds.elder) {
        pet.evolutionStage = 'elder';
        pet.level = 4;
        showMessage(`${pet.name} envelheceu! Agora é um velhinho!`, 3000);
    }
    updateDisplay();
}

function checkPetStatus() {
    if (pet.evolutionStage === 'dead') return;

    if (!pet.isSleeping && pet.evolutionStage !== 'egg') {
        pet.hunger = Math.max(0, pet.hunger - 2);
        pet.fun = Math.max(0, pet.fun - 2);
        pet.energy = Math.max(0, pet.energy - 2);
    }
    
    if (pet.evolutionStage === 'egg') {
        pet.eggWarmth = Math.max(0, pet.eggWarmth - 2);
    }

    if (pet.hunger < 20 || pet.fun < 20 || pet.energy < 20 || pet.eggWarmth <= 0) {
        if (Math.random() < 0.1) {
            pet.isSick = true;
        }
    }

    if (pet.isSick) {
        pet.health = Math.max(0, pet.health - 5);
    } else {
        pet.health = Math.min(100, pet.health + 1);
    }

    if (pet.health <= 0 || (pet.evolutionStage === 'egg' && pet.eggWarmth <= 0)) {
        pet.evolutionStage = 'dead';
        showMessage(`${pet.name} faleceu. 😢`, 5000);
        clearInterval(gameInterval);
        petImage.src = getPetImagePath('morto.png');
        updateActionButtonsVisibility();
        return;
    }
    
    // Log para depuração e para mostrar a lógica de morte ao usuário
    console.log(`[Status de Debug] ${pet.name} - Fome: ${pet.hunger}, Diversão: ${pet.fun}, Energia: ${pet.energy}, Saúde: ${pet.health}, Aquecimento: ${pet.eggWarmth}`);


    updateDisplay();
}

function passDay() {
    if(pet.evolutionStage === 'dead' || pet.isSleeping) {
        showMessage('Não é possível passar o dia agora.');
        return;
    }
    
    if (pet.evolutionStage === 'egg') {
        if (pet.eggWarmth >= 100) {
            pet.isHatching = true;
            showMessage('O ovo está rachando!', 3000);
            updateDisplay();
            
            setTimeout(() => {
                petImage.src = getPetImagePath('ovo_quebrado.png');
                showMessage('O ovo quebrou!', 2000);
                
                setTimeout(() => {
                    pet.evolutionStage = 'baby';
                    pet.level = 1;
                    pet.ageDays = 1;
                    pet.isHatching = false;
                    showMessage(`${pet.name} nasceu! É um bebê!`, 3000);
                    updateDisplay();
                }, 2000);
            }, 3000);
        } else {
            showMessage('O ovo precisa estar totalmente aquecido para chocar!');
        }
    } else {
        pet.ageDays++;
        pet.moedas += 5;
        evolvePet();
        showMessage(`Um novo dia começou! ${pet.name} ganhou 5 moedas!`);
    }
    updateDisplay();
}

function startGameLoop() {
    if (gameInterval) clearInterval(gameInterval);
    if (statusUpdateInterval) clearInterval(statusUpdateInterval);

    gameInterval = setInterval(() => {
        checkPetStatus();
    }, 5000);
}

function initializeGame() {
    pet.name = petNameInput.value.trim();
    if (pet.name === '') {
        pet.name = 'Seu Tamago';
    }

    pet = {
        name: pet.name,
        level: 0,
        hunger: 100,
        fun: 100,
        energy: 100,
        health: 100,
        isSleeping: false,
        isSick: false,
        ageDays: 0,
        moedas: 0,
        eggWarmth: 100,
        isHatching: false,
        isHot: false,
        evolutionStage: 'egg',
        personality: 'default',
        currentAction: null
    };
    
    // Prevenção de bug com valor NaN
    if (typeof pet.eggWarmth !== 'number') {
        pet.eggWarmth = 100;
    }

    inventory = {
        "ração premium": 0,
        "brinquedo de bolinhas": 0,
        "vacina forte": 0
    };

    showScreen(tamagotchiScreen);
    updateDisplay();
    startGameLoop();
}

function restartGame() {
    pet = {
        name: '',
        level: 0,
        hunger: 100,
        fun: 100,
        energy: 100,
        health: 100,
        isSleeping: false,
        isSick: false,
        ageDays: 0,
        moedas: 0,
        eggWarmth: 100,
        isHatching: false,
        isHot: false,
        evolutionStage: 'egg',
        personality: 'default',
        currentAction: null
    };

    inventory = {
        "ração premium": 0,
        "brinquedo de bolinhas": 0,
        "vacina forte": 0
    };

    clearInterval(gameInterval);
    clearInterval(statusUpdateInterval);

    petNameInput.value = '';
    alertIconsContainer.innerHTML = '';

    showScreen(startScreen);
    updateDisplay();
}

// --- Funções da Loja ---
function showShop() {
    showScreen(shopScreen);
    renderShopItems();
}

function renderShopItems() {
    const shopItemsDiv = document.getElementById('shopItems');
    shopItemsDiv.innerHTML = '';

    for (const item in itemPrices) {
        const itemCard = document.createElement('div');
        itemCard.classList.add('item-card');
        itemCard.innerHTML = `
            <span class="item-name">${item.toUpperCase()}</span>
            <span class="item-price">${itemPrices[item]} Moedas</span>
            <button data-item="${item}">Comprar</button>
        `;
        shopItemsDiv.appendChild(itemCard);
    }

    shopItemsDiv.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', (event) => {
            const itemToBuy = event.target.dataset.item;
            buyItem(itemToBuy);
        });
    });
}

function buyItem(item) {
    const price = itemPrices[item];
    if (pet.moedas >= price) {
        pet.moedas -= price;
        inventory[item]++;
        showMessage(`Você comprou ${item}!`);
        updateDisplay();
        renderShopItems();
    } else {
        showMessage('Moedas insuficientes!');
    }
}

// --- Funções do Inventário ---
function showInventory() {
    showScreen(inventoryScreen);
    renderInventoryItems();
}

function renderInventoryItems() {
    const inventoryItemsDiv = document.getElementById('inventoryItems');
    inventoryItemsDiv.innerHTML = '';

    let hasItems = false;
    for (const item in inventory) {
        if (inventory[item] > 0) {
            hasItems = true;
            const itemCard = document.createElement('div');
            itemCard.classList.add('item-card');
            itemCard.innerHTML = `
                <span class="item-name">${item.toUpperCase()}</span>
                <span class="item-quantity">Quantidade: ${inventory[item]}</span>
                <button data-item="${item}">Usar</button>
            `;
            inventoryItemsDiv.appendChild(itemCard);
        }
    }

    if (!hasItems) {
        inventoryItemsDiv.innerHTML = '<p>Seu inventário está vazio.</p>';
    }

    inventoryItemsDiv.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', (event) => {
            const itemToUse = event.target.dataset.item;
            useItem(itemToUse);
        });
    });
}

function useItem(item) {
    if (pet.evolutionStage === 'dead' || pet.isSleeping || pet.evolutionStage === 'egg') {
        showMessage('Não é o momento certo para usar itens!');
        return;
    }

    if (inventory[item] > 0) {
        inventory[item]--;
        if (item === "ração premium") {
            feedPet(40);
            showMessage(`${pet.name} comeu a ração premium!`);
        } else if (item === "brinquedo de bolinhas") {
            playWithPet(40);
            showMessage(`${pet.name} brincou com o brinquedo de bolinhas!`);
        } else if (item === "vacina forte") {
            pet.isSick = false;
            pet.health = Math.min(100, pet.health + 50);
            showMessage(`${pet.name} tomou a vacina forte!`);
        }
        updateDisplay();
        renderInventoryItems();
    } else {
        showMessage('Você não tem este item!');
    }
}

// --- Funções de Minigames ---
const rpsGame = document.getElementById('rpsGame');
const numberGuessingGame = document.getElementById('numberGuessingGame');
const ticTacToeGame = document.getElementById('ticTacToeGame');

const rpsResult = document.getElementById('rpsResult');
const rpsRockBtn = document.getElementById('rpsRock');
const rpsPaperBtn = document.getElementById('rpsPaper');
const rpsScissorsBtn = document.getElementById('rpsScissors');
const rpsPlayAgainBtn = document.getElementById('rpsPlayAgainBtn');
const rpsBackToGamesBtn = document.getElementById('rpsBackToGamesBtn');

function showRPSGame() {
    showScreen(rpsGame);
    rpsResult.textContent = 'Faça sua escolha!';
    rpsPlayAgainBtn.classList.add('hidden');
    rpsRockBtn.disabled = false;
    rpsPaperBtn.disabled = false;
    rpsScissorsBtn.disabled = false;
    rpsBackToGamesBtn.classList.remove('hidden');
}

function playRPS(playerChoice) {
    const choices = ['pedra', 'papel', 'tesoura'];
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];

    let resultText = `Você escolheu ${playerChoice}, o computador escolheu ${computerChoice}. `;
    let win = false;
    let draw = false;

    if (playerChoice === computerChoice) {
        resultText += 'Empate!';
        draw = true;
    } else if (
        (playerChoice === 'pedra' && computerChoice === 'tesoura') ||
        (playerChoice === 'papel' && computerChoice === 'pedra') ||
        (playerChoice === 'tesoura' && computerChoice === 'papel')
    ) {
        resultText += 'Você venceu!';
        win = true;
    } else {
        resultText += 'Você perdeu!';
    }

    if (win) {
        pet.fun = Math.min(100, pet.fun + 15);
        pet.moedas += 5;
        showMessage('Você ganhou 5 moedas e diversão!', 2000);
    } else if (draw) {
        pet.fun = Math.min(100, pet.fun + 5);
        pet.moedas += 1;
        showMessage('Empate! +1 moeda e um pouco de diversão.', 2000);
    } else {
        pet.fun = Math.max(0, pet.fun - 10);
        showMessage('Você perdeu. -10 diversão.', 2000);
    }

    rpsResult.textContent = resultText;
    rpsPlayAgainBtn.classList.remove('hidden');
    rpsRockBtn.disabled = true;
    rpsPaperBtn.disabled = true;
    rpsScissorsBtn.disabled = true;
    updateDisplay();
}

const ngGuessInput = document.getElementById('ngGuessInput');
const ngSubmitGuessBtn = document.getElementById('ngSubmitGuessBtn');
const ngResult = document.getElementById('ngResult');
const ngInstructions = document.getElementById('ngInstructions');
const ngPlayAgainBtn = document.getElementById('ngPlayAgainBtn');
const ngBackToGamesBtn = document.getElementById('ngBackToGamesBtn');

let secretNumber;
let attempts;

function showNumberGuessingGame() {
    showScreen(numberGuessingGame);
    startGameGuessing();
    ngBackToGamesBtn.classList.remove('hidden');
}

function startGameGuessing() {
    secretNumber = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    ngInstructions.textContent = 'Estou pensando em um número entre 1 e 100.';
    ngResult.textContent = '';
    ngGuessInput.value = '';
    ngGuessInput.disabled = false;
    ngSubmitGuessBtn.disabled = false;
    ngPlayAgainBtn.classList.add('hidden');
}

function submitGuess() {
    const guess = parseInt(ngGuessInput.value);

    if (isNaN(guess) || guess < 1 || guess > 100) {
        ngResult.textContent = 'Por favor, digite um número válido entre 1 e 100.';
        return;
    }

    attempts++;

    if (guess === secretNumber) {
        ngResult.textContent = `Parabéns! Você adivinhou o número ${secretNumber} em ${attempts} tentativas!`;
        pet.moedas += 10;
        pet.fun = Math.min(100, pet.fun + 20);
        showMessage('Você ganhou 10 moedas e muita diversão!', 2000);
        ngGuessInput.disabled = true;
        ngSubmitGuessBtn.disabled = true;
        ngPlayAgainBtn.classList.remove('hidden');
    } else if (guess < secretNumber) {
        ngResult.textContent = 'Muito baixo! Tente novamente.';
    } else {
        ngResult.textContent = 'Muito alto! Tente novamente.';
    }
    updateDisplay();
}

const ticTacToeBoard = document.getElementById('ticTacToeBoard');
const ticTacToeStatus = document.getElementById('ticTacToeStatus');
const ticTacToeCells = document.querySelectorAll('.tic-tac-toe-board .cell');
const ticTacToePlayAgainBtn = document.getElementById('ticTacToePlayAgainBtn');
const ticTacToeBackToGamesBtn = document.getElementById('ticTacToeBackToGamesBtn');

let board;
let currentPlayer;
let gameActive;

const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function showTicTacToeGame() {
    showScreen(ticTacToeGame);
    startTicTacToe();
    ticTacToeBackToGamesBtn.classList.remove('hidden');
}

function startTicTacToe() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    ticTacToeStatus.textContent = "Sua vez (X)";
    ticTacToeCells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('player-x', 'player-o', 'winning-cell');
        cell.addEventListener('click', handleCellClick, { once: true });
    });
    ticTacToePlayAgainBtn.classList.add('hidden');
}

function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.dataset.cellIndex);

    if (board[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    makeMove(clickedCell, clickedCellIndex, currentPlayer);
    
    if (gameActive) {
        setTimeout(aiMove, 500);
    }
}

function aiMove() {
    const bestMove = getBestAIMove();
    if (bestMove !== -1) {
        const cell = ticTacToeCells[bestMove];
        makeMove(cell, bestMove, 'O');
    }
}

function getBestAIMove() {
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            if (checkWin('O')) {
                board[i] = '';
                return i;
            }
            board[i] = '';
        }
    }

    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = 'X';
            if (checkWin('X')) {
                board[i] = '';
                return i;
            }
            board[i] = '';
        }
    }

    if (board[4] === '') return 4;

    const corners = [0, 2, 6, 8];
    for (let i of corners) {
        if (board[i] === '') return i;
    }

    const availableCells = board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
    if (availableCells.length > 0) {
        return availableCells[Math.floor(Math.random() * availableCells.length)];
    }
    return -1;
}

function makeMove(cell, index, player) {
    board[index] = player;
    cell.textContent = player;
    cell.classList.add(`player-${player.toLowerCase()}`);

    if (checkWin(player)) {
        ticTacToeStatus.textContent = `${player === 'X' ? 'Você' : 'O computador'} venceu!`;
        highlightWinningCells(player);
        endGame(true, player);
        return;
    }

    if (checkDraw()) {
        ticTacToeStatus.textContent = 'Empate!';
        endGame(false);
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    ticTacToeStatus.textContent = `${currentPlayer === 'X' ? 'Sua' : 'Vez do computador'} vez (${currentPlayer})`;
}

function checkWin(player) {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return board[index] === player;
        });
    });
}

function highlightWinningCells(player) {
    WINNING_COMBINATIONS.forEach(combination => {
        if (combination.every(index => board[index] === player)) {
            combination.forEach(index => {
                ticTacToeCells[index].classList.add('winning-cell');
            });
        }
    });
}

function checkDraw() {
    return board.every(cell => cell !== '');
}

function endGame(win, winner = null) {
    gameActive = false;
    ticTacToeCells.forEach(cell => cell.removeEventListener('click', handleCellClick));
    ticTacToePlayAgainBtn.classList.remove('hidden');

    if (win) {
        if (winner === 'X') {
            pet.moedas += 15;
            pet.fun = Math.min(100, pet.fun + 25);
            showMessage('Você ganhou o Jogo da Velha! +15 moedas e muita diversão!', 2000);
        } else {
            pet.fun = Math.max(0, pet.fun - 15);
            showMessage('Você perdeu o Jogo da Velha. -15 diversão.', 2000);
        }
    } else {
        pet.moedas += 2;
        pet.fun = Math.min(100, pet.fun + 10);
        showMessage('Empate no Jogo da Velha! +2 moedas e um pouco de diversão.', 2000);
    }
    updateDisplay();
}

// --- Event Listeners ---
startGameBtn.addEventListener('click', initializeGame);

feedButton.addEventListener('click', () => {
    if (pet.evolutionStage !== 'dead' && !pet.isSleeping && pet.evolutionStage !== 'egg') {
        pet.currentAction = 'eating';
        updateDisplay();
        feedPet();
        setTimeout(() => {
            pet.currentAction = null;
            updateDisplay();
        }, 1500);
    } else {
        feedPet();
    }
});

playButton.addEventListener('click', () => {
    if (pet.evolutionStage !== 'dead' && !pet.isSleeping && pet.evolutionStage !== 'egg') {
        pet.currentAction = 'playing';
        updateDisplay();
        playWithPet();
        setTimeout(() => {
            pet.currentAction = null;
            updateDisplay();
        }, 1500);
    } else {
        playWithPet();
    }
});

sleepButton.addEventListener('click', toggleSleep);
vaccinateButton.addEventListener('click', vaccinatePet);
warmEggButton.addEventListener('click', warmEgg);
passDayButton.addEventListener('click', passDay);

shopButton.addEventListener('click', showShop);
document.getElementById('shopBackButton').addEventListener('click', () => showScreen(tamagotchiScreen));

inventoryButton.addEventListener('click', showInventory);
document.getElementById('inventoryBackButton').addEventListener('click', () => showScreen(tamagotchiScreen));

gamesButton.addEventListener('click', () => showScreen(gamesScreen));
document.getElementById('gamesBackButton').addEventListener('click', () => showScreen(tamagotchiScreen));

document.getElementById('rockPaperScissorsBtn').addEventListener('click', showRPSGame);
rpsRockBtn.addEventListener('click', () => playRPS('pedra'));
rpsPaperBtn.addEventListener('click', () => playRPS('papel'));
rpsScissorsBtn.addEventListener('click', () => playRPS('tesoura'));
rpsPlayAgainBtn.addEventListener('click', showRPSGame);
rpsBackToGamesBtn.addEventListener('click', () => showScreen(gamesScreen));

document.getElementById('numberGuessingBtn').addEventListener('click', showNumberGuessingGame);
ngSubmitGuessBtn.addEventListener('click', submitGuess);
ngPlayAgainBtn.addEventListener('click', startGameGuessing);
ngBackToGamesBtn.addEventListener('click', () => showScreen(gamesScreen));

document.getElementById('ticTacToeBtn').addEventListener('click', showTicTacToeGame);
ticTacToePlayAgainBtn.addEventListener('click', startTicTacToe);
ticTacToeBackToGamesBtn.addEventListener('click', () => showScreen(gamesScreen));


// --- Inicialização ao carregar a página ---
document.addEventListener('DOMContentLoaded', () => {
    showScreen(startScreen);
});
