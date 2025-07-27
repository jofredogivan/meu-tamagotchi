// --- Elementos do DOM ---
const startScreen = document.getElementById('startScreen');
const tamagotchiScreen = document.getElementById('tamagotchiScreen');
const shopScreen = document.getElementById('shopScreen');
const inventoryScreen = document.getElementById('inventoryScreen');
const gamesScreen = document.getElementById('gamesScreen'); // Nova tela de seleção de minigames

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
const gamesButton = document.getElementById('gamesButton'); // Botão para minigames
const actionsContainer = document.getElementById('actions'); // Contêiner para os botões de ação

const gameMessage = document.getElementById('gameMessage');

// Ícones de status
const hungerIcon = document.getElementById('hungerIcon');
const funIcon = document.getElementById('funIcon');
const energyIcon = document.getElementById('energyIcon');
const lifeIcon = document.getElementById('lifeIcon');

// Elementos para o cuidado do ovo
const eggStatusGroup = document.getElementById('eggStatusGroup');
const eggWarmthIcon = document.getElementById('eggWarmthIcon');
const eggWarmthDisplay = document.getElementById('eggWarmthDisplay');
const warmEggButton = document.getElementById('warmEggButton');


// --- Variáveis do Jogo ---
const GITHUB_REPO_NAME = 'meu-tamagotchi'; // **Mude isso para o nome exato do seu repositório GitHub**

let pet = {
    name: '',
    level: 0, // 0 = Ovo, 1 = Bebê, 2 = Criança, 3 = Adulto, 4 = Velho
    hunger: 100, // 0-100 (100 = satisfeito)
    fun: 100,    // 0-100 (100 = divertido)
    energy: 100, // 0-100 (100 = energizado)
    health: 100, // 0-100 (100 = saudável)
    isSleeping: false,
    isSick: false,
    ageDays: 0,
    moedas: 0,
    eggWarmth: 100, // 0-100 (100 = temperatura ideal para o ovo)
    isHatching: false,
    evolutionStage: 'egg' // 'egg', 'baby', 'child', 'adult', 'elder', 'dead'
};

const evolutionThresholds = {
    baby: 3,   // Dias para evoluir de ovo para bebê
    child: 7,  // Dias para evoluir de bebê para criança
    adult: 15, // Dias para evoluir de criança para adulto
    elder: 25  // Dias para evoluir de adulto para velho
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
let petEvolutionTimeout;

// --- Funções Auxiliares de Caminho de Imagem ---
function getPetImagePath(imageName) {
    const isGitHubPages = window.location.hostname.endsWith('github.io');
    if (isGitHubPages && GITHUB_REPO_NAME) {
        return `/${GITHUB_REPO_NAME}/imgs/${imageName}`;
    }
    return `imgs/${imageName}`; // Caminho para execução local
}

function getIconPath(iconName) {
    const isGitHubPages = window.location.hostname.endsWith('github.io');
    if (isGitHubPages && GITHUB_REPO_NAME) {
        return `/${GITHUB_REPO_NAME}/imgs/${iconName}`;
    }
    return `imgs/${iconName}`;
}

// --- Funções do Jogo ---

function showScreen(screenToShow) {
    const screens = [startScreen, tamagotchiScreen, shopScreen, inventoryScreen, gamesScreen, rpsGame, numberGuessingGame, ticTacToeGame];
    screens.forEach(screen => {
        if (screen) { // Garante que o elemento existe
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
    statusDisplay.textContent = `Status: ${getStatus()}`;
    nivelDisplay.textContent = `Nível: ${getEvolutionStageText()} (Idade: ${pet.ageDays} dias)`;
    moedasDisplay.textContent = `Moedas: ${pet.moedas}`;

    // Atualiza a imagem do pet
    petImage.src = getPetImageSrc();

    // Atualiza visibilidade e estado dos ícones de status
    updateStatusIcons();

    // Atualiza o display do ovo
    updateEggDisplay();

    // Gerencia a visibilidade dos botões de ação
    updateActionButtonsVisibility();
}

function getMood() {
    if (pet.isSick) return 'Doente 😞';
    if (pet.isSleeping) return 'Dormindo 😴';
    if (pet.hunger < 30 || pet.fun < 30 || pet.energy < 30) return 'Triste 😟';
    if (pet.hunger > 80 && pet.fun > 80 && pet.energy > 80) return 'Radiante 😄';
    return 'Normal 🙂';
}

function getStatus() {
    if (pet.isSick) return 'Doente';
    if (pet.isSleeping) return 'Dormindo';
    if (pet.evolutionStage === 'egg' && pet.isHatching) return 'Ovo está rachando!';
    if (pet.evolutionStage === 'egg') {
        if (pet.eggWarmth < 30) return 'Ovo Frio!';
        if (pet.eggWarmth < 60) return 'Ovo Esfriando...';
        return 'Ovo';
    }
    if (pet.hunger < 20) return 'Morrendo de Fome!';
    if (pet.hunger < 50) return 'Com Fome';
    if (pet.fun < 20) return 'Entediado!';
    if (pet.fun < 50) return 'Um pouco entediado';
    if (pet.energy < 20) return 'Exausto!';
    if (pet.energy < 50) return 'Cansado';
    return 'Bem';
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
    if (pet.isSleeping) {
        // Imagens específicas para dormir por estágio
        if (pet.evolutionStage === 'baby') return getPetImagePath('bebe.dormindo.png');
        if (pet.evolutionStage === 'child') return getPetImagePath('crianca.dormindo.png');
        if (pet.evolutionStage === 'adult') return getPetImagePath('adulto.dormindo.png'); // Você precisaria criar essa imagem
        if (pet.evolutionStage === 'elder') return getPetImagePath('velho.dormindo.png'); // Você precisaria criar essa imagem
        return getPetImagePath('dormindo.png'); // Imagem genérica para dormir se não houver estágio específico
    }
    if (pet.isSick) {
        // Imagens específicas para doente por estágio
        if (pet.evolutionStage === 'baby') return getPetImagePath('bebe.doente.png');
        if (pet.evolutionStage === 'child') return getPetImagePath('crianca.doente.png');
        if (pet.evolutionStage === 'adult') return getPetImagePath('adulto.doente.png'); // Você precisaria criar essa imagem
        if (pet.evolutionStage === 'elder') return getPetImagePath('velho.doente.png'); // Você precisaria criar essa imagem
        return getPetImagePath('doente.png'); // Imagem genérica para doente
    }

    switch (pet.evolutionStage) {
        case 'egg':
            if (pet.isHatching) return getPetImagePath('ovo.rachando.png');
            if (pet.eggWarmth < 40) return getPetImagePath('ovo.frio.png'); // Imagem de ovo frio
            if (pet.eggWarmth > 100) return getPetImagePath('ovo.quente.png'); // Imagem de ovo queimando (se implementar)
            return getPetImagePath('ovo.png');
        case 'baby':
            if (pet.hunger < 50) return getPetImagePath('bebe.comendo.png'); // Você pode adicionar mais condições para fome/brincadeira
            if (pet.fun < 50) return getPetImagePath('bebe.brincando.png');
            return getPetImagePath('bebe.png');
        case 'child':
            if (pet.hunger < 50) return getPetImagePath('crianca.comendo.png');
            if (pet.fun < 50) return getPetImagePath('crianca.brincando.png');
            return getPetImagePath('crianca.png');
        case 'adult':
            return getPetImagePath('adulto.feliz.png'); // Imagem de adulto padrão
        case 'elder':
            return getPetImagePath('velho.feliz.png'); // Imagem de velho
        default:
             return getPetImagePath('adulto.preguicoso.png'); // Imagem de adulto padrão
        case 'elder':
            return getPetImagePath('velho.preguicoso.png'); // Imagem de velho
        default:
             return getPetImagePath('adulto.comilona.png'); // Imagem de adulto padrão
        case 'elder':
            return getPetImagePath('velha.comilona.png'); // Imagem de velho
        default:
            return getPetImagePath('ovo.png');
    }
}

function updateStatusIcons() {
    // Esconde todos os ícones primeiro
    hungerIcon.classList.add('hidden');
    funIcon.classList.add('hidden');
    energyIcon.classList.add('hidden');
    lifeIcon.classList.add('hidden');

    // Remove classes de blinking e cold/critical
    hungerIcon.classList.remove('blinking');
    funIcon.classList.remove('blinking');
    energyIcon.classList.remove('blinking');
    lifeIcon.classList.remove('blinking');
    eggWarmthIcon.classList.remove('cold', 'critical');
    eggStatusGroup.classList.add('hidden'); // Esconde o grupo do ovo por padrão

    if (pet.evolutionStage === 'dead') return;

    // Mostra e anima o ícone de fome
    if (pet.hunger < 70) {
        hungerIcon.classList.remove('hidden');
        if (pet.hunger < 30) hungerIcon.classList.add('blinking');
    }
    // Mostra e anima o ícone de diversão
    if (pet.fun < 70) {
        funIcon.classList.remove('hidden');
        if (pet.fun < 30) funIcon.classList.add('blinking');
    }
    // Mostra e anima o ícone de energia
    if (pet.energy < 70 && !pet.isSleeping) { // Não mostra o ícone de energia baixa se estiver dormindo
        energyIcon.classList.remove('hidden');
        if (pet.energy < 30) energyIcon.classList.add('blinking');
    }
    // Mostra e anima o ícone de saúde
    if (pet.isSick) {
        lifeIcon.classList.remove('hidden');
        lifeIcon.classList.add('blinking');
    }

    // Mostra e atualiza o display de aquecimento do ovo
    if (pet.evolutionStage === 'egg') {
        eggStatusGroup.classList.remove('hidden');
        eggWarmthDisplay.textContent = `Aquecimento: ${pet.eggWarmth}%`;
        if (pet.eggWarmth < 40) {
            eggWarmthIcon.classList.add('cold');
        }
        if (pet.eggWarmth < 20) {
            eggWarmthIcon.classList.add('critical');
        }
    }
}

function updateEggDisplay() {
    if (pet.evolutionStage === 'egg') {
        eggStatusGroup.classList.remove('hidden');
        eggWarmthDisplay.textContent = `Aquecimento: ${pet.eggWarmth}%`;
        eggWarmthIcon.classList.remove('cold', 'critical'); // Limpa estados anteriores
        
        if (pet.eggWarmth < 40 && pet.eggWarmth >= 20) {
            eggWarmthIcon.classList.add('cold');
        } else if (pet.eggWarmth < 20) {
            eggWarmthIcon.classList.add('critical');
        }
    } else {
        eggStatusGroup.classList.add('hidden'); // Esconde o status do ovo para outros estágios
    }
}

function updateActionButtonsVisibility() {
    const isEgg = pet.evolutionStage === 'egg';
    const isSleeping = pet.isSleeping;
    const isDead = pet.evolutionStage === 'dead';

    // Oculta todos os botões por padrão, exceto os de navegação
    feedButton.classList.add('hidden');
    playButton.classList.add('hidden');
    sleepButton.classList.add('hidden');
    vaccinateButton.classList.add('hidden');
    warmEggButton.classList.add('hidden');

    // Remove o botão de reiniciar se estiver lá
    let restartBtn = document.getElementById('restartButton');
    if (restartBtn) {
        restartBtn.remove();
    }

    if (isDead) {
        // Mostra apenas o botão de reiniciar se estiver morto
        restartBtn = document.createElement('button');
        restartBtn.id = 'restartButton';
        restartBtn.className = 'action-button';
        restartBtn.textContent = 'Reiniciar Jogo';
        restartBtn.addEventListener('click', restartGame);
        actionsContainer.appendChild(restartBtn);
        // Oculta os botões de navegação quando morto
        shopButton.classList.add('hidden');
        inventoryButton.classList.add('hidden');
        gamesButton.classList.add('hidden');
    } else if (isEgg) {
        warmEggButton.classList.remove('hidden');
        // Oculta os botões de navegação para o ovo
        shopButton.classList.add('hidden');
        inventoryButton.classList.add('hidden');
        gamesButton.classList.add('hidden');
    } else if (isSleeping) {
        // Mostrar apenas o botão de acordar
        sleepButton.classList.remove('hidden');
        sleepButton.textContent = 'Acordar';
        // Oculta os botões de navegação quando dormindo
        shopButton.classList.add('hidden');
        inventoryButton.classList.add('hidden');
        gamesButton.classList.add('hidden');
    } else {
        // Mostra os botões de ação normais e os de navegação
        feedButton.classList.remove('hidden');
        playButton.classList.remove('hidden');
        sleepButton.classList.remove('hidden');
        sleepButton.textContent = 'Dormir'; // Garante que o texto esteja correto
        vaccinateButton.classList.remove('hidden');
        shopButton.classList.remove('hidden');
        inventoryButton.classList.remove('hidden');
        gamesButton.classList.remove('hidden');
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
    pet.health = Math.min(100, pet.health + 5); // Pequeno boost na saúde
    pet.moedas += 1; // Ganha uma moeda ao alimentar
    showMessage(`${pet.name} comeu e está mais feliz! +1 moeda!`);
    updateDisplay();
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
    pet.energy = Math.max(0, pet.energy - 10); // Gasta energia ao brincar
    pet.moedas += 2; // Ganha duas moedas ao brincar
    showMessage(`${pet.name} brincou e se divertiu muito! +2 moedas!`);
    updateDisplay();
}

function toggleSleep() {
    if (pet.evolutionStage === 'dead' || pet.evolutionStage === 'egg') {
        showMessage('Não é possível fazer isso agora.');
        return;
    }

    pet.isSleeping = !pet.isSleeping;
    if (pet.isSleeping) {
        showMessage(`${pet.name} foi dormir... Zzzzz`);
        clearInterval(gameInterval); // Pausa o jogo
        statusUpdateInterval = setInterval(() => {
            pet.energy = Math.min(100, pet.energy + 5); // Recupera energia mais rápido
            pet.health = Math.min(100, pet.health + 2); // Recupera saúde lentamente
            updateDisplay();
            if (pet.energy >= 100) {
                showMessage(`${pet.name} acordou revigorado!`);
                toggleSleep(); // Acorda automaticamente quando a energia está cheia
            }
        }, 1000); // Atualiza a cada 1 segundo enquanto dorme
    } else {
        showMessage(`${pet.name} acordou!`);
        clearInterval(statusUpdateInterval); // Limpa o intervalo de atualização de status
        startGameLoop(); // Reinicia o loop principal do jogo
    }
    updateDisplay();
}

function vaccinatePet() {
    if (pet.evolutionStage === 'dead' || pet.isSleeping || pet.evolutionStage === 'egg') {
        showMessage('Não é o momento certo para vacinar!');
        return;
    }
    const vaccinePrice = 5; // Preço da vacina
    if (pet.moedas >= vaccinePrice) {
        pet.moedas -= vaccinePrice;
        pet.isSick = false;
        pet.health = Math.min(100, pet.health + 30); // Grande boost na saúde
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
    pet.moedas += 1; // Ganha moeda por cuidar do ovo
    showMessage('Você aqueceu o ovo! +1 moeda!');
    updateDisplay();
}

function evolvePet() {
    if (pet.evolutionStage === 'egg' && pet.ageDays >= evolutionThresholds.baby) {
        // Animação de rachar o ovo
        pet.isHatching = true;
        petImage.src = getPetImagePath('ovo.rachando.png');
        showMessage('O ovo está rachando!', 3000);

        setTimeout(() => {
            pet.evolutionStage = 'baby';
            pet.level = 1;
            pet.isHatching = false; // Termina a animação
            showMessage(`${pet.name} nasceu! É um bebê!`, 3000);
            updateDisplay();
        }, 3000); // Tempo para a animação do ovo rachando
    } else if (pet.evolutionStage === 'baby' && pet.ageDays >= evolutionThresholds.child) {
        pet.evolutionStage = 'child';
        pet.level = 2;
        showMessage(`${pet.name} cresceu! Agora é uma criança!`, 3000);
    } else if (pet.evolutionStage === 'child' && pet.ageDays >= evolutionThresholds.adult) {
        pet.evolutionStage = 'adult';
        pet.level = 3;
        showMessage(`${pet.name} cresceu! Agora é um adulto!`, 3000);
    } else if (pet.evolutionStage === 'adult' && pet.ageDays >= evolutionThresholds.elder) {
        pet.evolutionStage = 'elder';
        pet.level = 4;
        showMessage(`${pet.name} cresceu! Agora é um velhinho!`, 3000);
    }
    updateDisplay();
}

function checkPetStatus() {
    if (pet.evolutionStage === 'dead') return; // Não verifica status se estiver morto

    // Decrementa stats apenas se não estiver dormindo ou for um ovo
    if (!pet.isSleeping && pet.evolutionStage !== 'egg') {
        pet.hunger = Math.max(0, pet.hunger - 2);
        pet.fun = Math.max(0, pet.fun - 2);
        pet.energy = Math.max(0, pet.energy - 2);
    }
    
    // Decrementa aquecimento do ovo
    if (pet.evolutionStage === 'egg') {
        pet.eggWarmth = Math.max(0, pet.eggWarmth - 1);
        if (pet.eggWarmth <= 0 && !pet.isHatching) {
            showMessage('O ovo está congelando! Aqueça-o!', 2000);
        }
    }


    // Verifica a saúde e doença
    if (pet.hunger < 20 || pet.fun < 20 || pet.energy < 20 || pet.eggWarmth <= 0) {
        if (Math.random() < 0.1) { // 10% de chance de ficar doente se o status estiver muito baixo
            pet.isSick = true;
            showMessage(`${pet.name} está ficando doente!`, 2000);
        }
    }

    if (pet.isSick) {
        pet.health = Math.max(0, pet.health - 5); // Perde saúde mais rápido se doente
    } else {
        pet.health = Math.min(100, pet.health + 1); // Recupera saúde lentamente se saudável
    }

    // Morte
    if (pet.health <= 0 || (pet.evolutionStage === 'egg' && pet.eggWarmth <= 0 && pet.ageDays > 0)) {
        pet.evolutionStage = 'dead';
        showMessage(`${pet.name} faleceu. 😢`, 5000);
        clearInterval(gameInterval); // Para o loop do jogo
        petImage.src = getPetImagePath('morto.png');
        updateActionButtonsVisibility(); // Atualiza para mostrar apenas o restart
        return;
    }

    updateDisplay();
}

function passDay() {
    pet.ageDays++;
    // Adiciona moedas por dia vivo (excluindo ovo e morto)
    if (pet.evolutionStage !== 'egg' && pet.evolutionStage !== 'dead') {
        pet.moedas += 5;
    }
    evolvePet();
    updateDisplay();
}

function startGameLoop() {
    // Limpa qualquer intervalo existente para evitar duplicidade
    if (gameInterval) clearInterval(gameInterval);
    if (statusUpdateInterval) clearInterval(statusUpdateInterval);

    // Loop principal do jogo: a cada 2 segundos
    gameInterval = setInterval(() => {
        checkPetStatus();
    }, 2000);

    // Loop para passar os dias: a cada 10 segundos
    // Pode ser ajustado para um dia real ou mais longo para um ciclo de vida mais lento
    setInterval(() => {
        passDay();
    }, 10000); // 10 segundos = 1 dia do pet
}

function initializeGame() {
    pet.name = petNameInput.value.trim();
    if (pet.name === '') {
        pet.name = 'Seu Tamago'; // Nome padrão
    }

    // Reseta o estado do pet para o início de um novo jogo
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
        evolutionStage: 'egg'
    };

    inventory = {
        "ração premium": 0,
        "brinquedo de bolinhas": 0,
        "vacina forte": 0
    };

    showScreen(tamagotchiScreen);
    updateDisplay();
    startGameLoop(); // Inicia os loops do jogo
}

function restartGame() {
    // Redefine todas as variáveis para o estado inicial
    pet = {
        name: '', // Será definido na tela inicial
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
        evolutionStage: 'egg'
    };

    inventory = {
        "ração premium": 0,
        "brinquedo de bolinhas": 0,
        "vacina forte": 0
    };

    // Limpa quaisquer intervalos de jogo
    clearInterval(gameInterval);
    clearInterval(statusUpdateInterval);
    clearTimeout(petEvolutionTimeout); // Limpa qualquer timeout de evolução pendente

    // Limpa o campo de nome do pet na tela inicial
    petNameInput.value = '';

    // Volta para a tela inicial
    showScreen(startScreen);
    updateDisplay(); // Atualiza para o estado inicial
}

// --- Funções da Loja ---
function showShop() {
    showScreen(shopScreen);
    renderShopItems();
}

function renderShopItems() {
    const shopItemsDiv = document.getElementById('shopItems');
    shopItemsDiv.innerHTML = ''; // Limpa itens anteriores

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
        updateDisplay(); // Atualiza moedas no display principal
        renderShopItems(); // Re-renderiza a loja para refletir a moeda atualizada
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
    inventoryItemsDiv.innerHTML = ''; // Limpa itens anteriores

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
            feedPet(40); // Rações premium alimentam mais
            showMessage(`${pet.name} comeu a ração premium!`);
        } else if (item === "brinquedo de bolinhas") {
            playWithPet(40); // Brinquedos de bolinhas divertem mais
            showMessage(`${pet.name} brincou com o brinquedo de bolinhas!`);
        } else if (item === "vacina forte") {
            pet.isSick = false;
            pet.health = Math.min(100, pet.health + 50); // Vacina forte cura mais
            showMessage(`${pet.name} tomou a vacina forte!`);
        }
        updateDisplay();
        renderInventoryItems(); // Re-renderiza o inventário
    } else {
        showMessage('Você não tem este item!');
    }
}

// --- Funções de Minigames ---
const rpsGame = document.getElementById('rpsGame');
const numberGuessingGame = document.getElementById('numberGuessingGame');
const ticTacToeGame = document.getElementById('ticTacToeGame');

// Pedra, Papel e Tesoura
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

// Adivinhe o Número
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

// Jogo da Velha (Tic Tac Toe)
const ticTacToeBoard = document.getElementById('ticTacToeBoard');
const ticTacToeStatus = document.getElementById('ticTacToeStatus');
const ticTacToeCells = document.querySelectorAll('.tic-tac-toe-board .cell');
const ticTacToePlayAgainBtn = document.getElementById('ticTacToePlayAgainBtn');
const ticTacToeBackToGamesBtn = document.getElementById('ticTacToeBackToGamesBtn');

let board;
let currentPlayer; // 'X' para jogador, 'O' para AI
let gameActive;

const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
    [0, 4, 8], [2, 4, 6]             // Diagonais
];

function showTicTacToeGame() {
    showScreen(ticTacToeGame);
    startTicTacToe();
    ticTacToeBackToGamesBtn.classList.remove('hidden');
}

function startTicTacToe() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X'; // Sempre começa com o jogador
    gameActive = true;
    ticTacToeStatus.textContent = "Sua vez (X)";
    ticTacToeCells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('player-x', 'player-o', 'winning-cell');
        cell.addEventListener('click', handleCellClick, { once: true }); // Garante que o click só funciona uma vez por célula
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
    
    if (gameActive) { // Verifica se o jogo ainda está ativo após o movimento do jogador
        setTimeout(aiMove, 500); // AI joga após um pequeno atraso
    }
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

function aiMove() {
    // Implementação simples: AI tenta ganhar, bloquear, ou joga aleatoriamente
    let bestMove = getBestAIMove();

    if (gameActive && bestMove !== -1) {
        const cell = ticTacToeCells[bestMove];
        makeMove(cell, bestMove, currentPlayer);
    }
}

function getBestAIMove() {
    // 1. Tentar ganhar
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            if (checkWin('O')) {
                board[i] = ''; // Desfaz o movimento de teste
                return i;
            }
            board[i] = '';
        }
    }

    // 2. Tentar bloquear o jogador
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

    // 3. Preferir o centro
    if (board[4] === '') return 4;

    // 4. Preferir cantos
    const corners = [0, 2, 6, 8];
    for (let i of corners) {
        if (board[i] === '') return i;
    }

    // 5. Jogada aleatória
    const availableCells = board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
    if (availableCells.length > 0) {
        return availableCells[Math.floor(Math.random() * availableCells.length)];
    }
    return -1; // Sem movimentos disponíveis (deve ser um empate ou vitória já)
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
feedButton.addEventListener('click', () => feedPet());
playButton.addEventListener('click', () => playWithPet());
sleepButton.addEventListener('click', toggleSleep);
vaccinateButton.addEventListener('click', vaccinatePet);
warmEggButton.addEventListener('click', warmEgg);

// Navegação
shopButton.addEventListener('click', showShop);
document.getElementById('shopBackButton').addEventListener('click', () => showScreen(tamagotchiScreen));

inventoryButton.addEventListener('click', showInventory);
document.getElementById('inventoryBackButton').addEventListener('click', () => showScreen(tamagotchiScreen));

gamesButton.addEventListener('click', () => showScreen(gamesScreen)); // Abre a tela de seleção de minigames
document.getElementById('gamesBackButton').addEventListener('click', () => showScreen(tamagotchiScreen)); // Volta da seleção de minigames

// Event Listeners para Minigames
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
    updateDisplay(); // Para garantir que os valores iniciais e botões estejam corretos
});
