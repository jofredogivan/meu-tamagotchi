// --- Variáveis Globais (elementos HTML e estado do jogo) ---
let startScreen, tamagotchiScreen, petNameInput, startGameBtn;
let petNameDisplay, moodDisplay, statusDisplay, petImage;
let hungerIcon, funIcon, energyIcon, lifeIcon;
let levelDisplay, coinsDisplay;
let feedButton, playButton, sleepButton, shopButton, inventoryButton, gamesButton, vaccinateButton;

// NOVOS ELEMENTOS HTML PARA LOJA/INVENTÁRIO
let shopScreen, shopItemsContainer, shopBackButton;
let inventoryScreen, inventoryItemsContainer, inventoryBackButton;

// NOVOS ELEMENTOS HTML PARA MINIGAMES
let gamesScreen, gamesListContainer, gamesBackButton;
let rockPaperScissorsBtn, numberGuessingBtn, ticTacToeBtn; // Botões para escolher o jogo

// Pedra, Papel, Tesoura
let rpsGameScreen, rpsResult, rpsRockBtn, rpsPaperBtn, rpsScissorsBtn, rpsPlayAgainBtn, rpsBackToGamesBtn;

// Adivinhe o Número
let numberGuessingGameScreen, ngInstructions, ngGuessInput, ngSubmitGuessBtn, ngResult, ngPlayAgainBtn, ngBackToGamesBtn;
let secretNumber; // Variável para o número secreto
let attempts; // Contador de tentativas

// Jogo da Velha (Tic Tac Toe)
let ticTacToeGameScreen, ticTacToeBoard, ticTacToeStatus, ticTacToePlayAgainBtn, ticTacToeBackToGamesBtn;
let board; // Representa o tabuleiro (array)
let currentPlayer; // 'X' ou 'O'
let gameActive; // Se o jogo está em andamento

// ATENÇÃO CRÍTICA: SUBSTITUA 'meu-tamagotchi' pelo NOME EXATO do seu repositório GitHub!
const GITHUB_REPO_NAME = 'meu-tamagotchi'; 

let pet = {}; 
let gameInterval; 

// --- Definição dos Itens da Loja ---
const shopItems = [
    { id: 'burger', name: 'Super Hambúrguer', price: 10, effect: { hunger: 30, energy: 5 }, type: 'food' },
    { id: 'ball', name: 'Bola de Brinquedo', price: 8, effect: { fun: 25 }, type: 'toy' },
    { id: 'medicine', name: 'Remédio', price: 15, effect: { life: 20, isSick: false }, type: 'medicine' }
];

// --- Funções Auxiliares ---
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Erro: Elemento com ID "${id}" não encontrado no DOM. Verifique seu HTML e IDs.`);
    }
    return element;
}

function showGameMessage(message, duration = 3000) {
    const msgElement = getElement('gameMessage');
    if (msgElement) {
        msgElement.textContent = message;
        msgElement.classList.add('visible');
        setTimeout(() => {
            msgElement.classList.remove('visible');
        }, duration);
    }
}

// --- Lógica de Exibição de Telas ---
function hideAllScreens() {
    if (startScreen) startScreen.style.display = 'none';
    if (tamagotchiScreen) tamagotchiScreen.style.display = 'none';
    if (shopScreen) shopScreen.style.display = 'none'; 
    if (inventoryScreen) inventoryScreen.style.display = 'none'; 
    if (gamesScreen) gamesScreen.style.display = 'none'; 
}

// Função para esconder todas as sub-telas de jogos
function hideAllSubGameScreens() {
    if (rpsGameScreen) rpsGameScreen.style.display = 'none';
    if (numberGuessingGameScreen) numberGuessingGameScreen.style.display = 'none';
    if (ticTacToeGameScreen) ticTacToeGameScreen.style.display = 'none';
}

function showScreen(screenElement) {
    hideAllScreens();
    if (screenElement) {
        screenElement.style.display = 'flex'; 
    }
}

// Função para obter o caminho da imagem com base no estado e nível
function getPetImagePath(currentPet) {
    let baseDir;
    if (window.location.protocol === 'file:') {
        baseDir = './imgs/'; 
    } else {
        baseDir = `/${GITHUB_REPO_NAME}/imgs/`; 
    }

    let finalPath;

    if (currentPet.isEgg) {
        if (currentPet.type === 'ovo.rachando') finalPath = baseDir + 'ovo.rachando.gif';
        else if (currentPet.type === 'ovo.quebrado') finalPath = baseDir + 'ovo.quebrado.gif';
        else finalPath = baseDir + 'ovo.gif'; 
    } else if (!currentPet.isAlive) {
        finalPath = baseDir + 'morto.png'; 
    } else if (currentPet.isSleeping) {
        let prefix = currentPet.level === 1 ? 'bebe.' : 'crianca.';
        finalPath = baseDir + prefix + 'dormindo.gif';
    } else if (currentPet.isEating) {
        let prefix = currentPet.level === 1 ? 'bebe.' : 'crianca.';
        finalPath = baseDir + prefix + 'comendo.gif';
    } else if (currentPet.isBrincando) { 
        let prefix = currentPet.level === 1 ? 'bebe.' : 'crianca.';
        finalPath = baseDir + prefix + 'brincando.gif';
    } else if (currentPet.isSick) { 
        let prefix = currentPet.level === 1 ? 'bebe.' : 'crianca.';
        finalPath = baseDir + prefix + 'doente.gif';
    } else {
        let prefix = currentPet.level === 1 ? 'bebe.' : 'crianca.';
        finalPath = baseDir + prefix.slice(0, -1) + '.gif'; 
    }

    console.log("Caminho gerado da imagem:", finalPath); 
    return finalPath;
}

// Lógica de Atualização do Display
function updateDisplay() {
    if (petNameDisplay) petNameDisplay.textContent = pet.level > 0 ? `Nome: ${pet.name}` : 'Nome: ???';
    if (moodDisplay) moodDisplay.textContent = `Humor: ${pet.mood}`;
    if (statusDisplay) statusDisplay.textContent = `Status: ${pet.status}`;
    
    if (levelDisplay) levelDisplay.textContent = pet.level;
    if (coinsDisplay) coinsDisplay.textContent = pet.coins;
    
    updatePetImage(); 
    updateStatusIcons();
}

function updateStatusIcons() {
    if (pet.isEgg) {
        if (hungerIcon) hungerIcon.classList.add('hidden');
        if (funIcon) funIcon.classList.add('hidden');
        if (energyIcon) energyIcon.classList.add('hidden');
        if (lifeIcon) lifeIcon.classList.add('hidden');
        return;
    }

    if (hungerIcon) {
        if (pet.hunger < 40) { hungerIcon.classList.remove('hidden'); hungerIcon.classList.toggle('blinking', pet.hunger < 20); }
        else { hungerIcon.classList.add('hidden'); hungerIcon.classList.remove('blinking'); }
    }

    if (funIcon) {
        if (pet.fun < 40) { funIcon.classList.remove('hidden'); funIcon.classList.toggle('blinking', pet.fun < 20); }
        else { funIcon.classList.add('hidden'); funIcon.classList.remove('blinking'); }
    }

    if (energyIcon) {
        if (pet.energy < 40) { energyIcon.classList.remove('hidden'); energyIcon.classList.toggle('blinking', pet.energy < 20); }
        else { energyIcon.classList.add('hidden'); energyIcon.classList.remove('blinking'); }
    }

    if (lifeIcon) {
        if (pet.isSick || pet.life < 50) { 
            lifeIcon.classList.remove('hidden'); 
            lifeIcon.classList.toggle('blinking', pet.isSick || pet.life < 20); 
        }
        else { lifeIcon.classList.add('hidden'); lifeIcon.classList.remove('blinking'); }
    }
}

// Função para gerenciar a eclosão (com imagens de ovo)
function hatchEgg() {
    if (!petImage) return; 

    if (pet.hatchProgress < 33) {
        petImage.src = getPetImagePath({ isEgg: true, level: 0, type: 'ovo' });
        showGameMessage(`O ovo está quietinho...`);
    } else if (pet.hatchProgress < 66) {
        petImage.src = getPetImagePath({ isEgg: true, level: 0, type: 'ovo.rachando' });
        showGameMessage(`O ovo está rachando!`, 1500);
    } else if (pet.hatchProgress < 100) {
        petImage.src = getPetImagePath({ isEgg: true, level: 0, type: 'ovo.quebrado' });
        showGameMessage(`Está quase!`);
    } else { 
        pet.isEgg = false;
        pet.level = 1; 
        showGameMessage(`${pet.name} chocou! Bem-vindo(a) ao mundo!`, 3000);
        
        petImage.src = getPetImagePath(pet); 
        disableActionButtons(false); 
        
        clearInterval(gameInterval); 
        startGameLoop(); 
        return;
    }
    disableActionButtons(true); 
}

// Atualiza a imagem do Tamagotchi e gerencia os botões de ação
function updatePetImage() {
    if (!petImage) return; 

    if (pet.isEgg) {
        hatchEgg(); 
        return;
    }

    petImage.src = getPetImagePath(pet); 

    const wakeBtn = document.getElementById('wakeUpButton');
    const restartBtn = document.getElementById('restartButton');

    if (wakeBtn && !pet.isSleeping) {
        wakeBtn.remove();
    }

    if (!pet.isAlive) {
        disableActionButtons(true); 
        if (!restartBtn) { 
            const newRestartBtn = document.createElement('button');
            newRestartBtn.id = 'restartButton';
            newRestartBtn.textContent = 'Recomeçar Jogo';
            newRestartBtn.addEventListener('click', restartGame);
            getElement('actions').appendChild(newRestartBtn);
        }
    } else if (pet.isSleeping) {
        if (!wakeBtn) { 
            const newWakeBtn = document.createElement('button');
            newWakeBtn.id = 'wakeUpButton';
            newWakeBtn.textContent = 'Acordar';
            newWakeBtn.addEventListener('click', wakeUpPet);
            getElement('actions').appendChild(newWakeBtn);
        }
        disableActionButtons(true); 
        if (getElement('wakeUpButton')) { 
            getElement('wakeUpButton').disabled = false; 
        }
        if (restartBtn) restartBtn.remove(); 
    } else if (pet.isEating || pet.isBrincando || pet.isSick) { 
        disableActionButtons(true); 
        if (pet.isSick) { 
            if (vaccinateButton) vaccinateButton.disabled = false;
        }
        if (restartBtn) restartBtn.remove(); 
    } else {
        disableActionButtons(false); 
        if (restartBtn) restartBtn.remove(); 
    }
}

function disableActionButtons(shouldDisable) {
    const buttons = [feedButton, playButton, sleepButton, shopButton, inventoryButton, gamesButton, vaccinateButton]; 
    buttons.forEach(button => {
        if (button) button.disabled = shouldDisable;
    });
}

function wakeUpPet() {
    if (pet.isSleeping) {
        pet.isSleeping = false;
        showGameMessage(`${pet.name} acordou!`);
        updatePetImage(); 
        updateDisplay();
    }
}

function restartGame() {
    clearInterval(gameInterval); 
    initializeGame();
}

function checkStatus() {
    if (!pet || typeof pet.isEgg === 'undefined') return; 

    if (pet.isEgg) {
        pet.mood = 'Esperando...';
        pet.status = 'Em desenvolvimento';
        return;
    }
    
    if (pet.hunger < 30 || pet.fun < 30 || pet.energy < 30 || pet.isSick) { 
        pet.mood = 'Triste';
    } else if (pet.hunger > 80 && pet.fun > 80 && pet.energy > 80) {
        pet.mood = 'Radiante';
    } else {
        pet.mood = 'Normal';
    }

    if (!pet.isAlive) {
        pet.status = 'Morto';
    } else if (pet.isSleeping) {
        pet.status = 'Dormindo';
    } else if (pet.isEating) {
        pet.status = 'Comendo';
    } else if (pet.isBrincando) {
        pet.status = 'Brincando';
    } else if (pet.isSick) { 
        pet.status = 'Doente';
    } else if (pet.energy < 20) { 
        pet.status = 'Cansado';
    } else {
        pet.status = 'Bem';
    }
}

function startGameLoop() {
    if (gameInterval) clearInterval(gameInterval); 
    gameInterval = setInterval(() => {
        if (!pet || typeof pet.isEgg === 'undefined') {
            clearInterval(gameInterval); 
            console.error("Objeto 'pet' não definido, parando game loop.");
            return;
        }

        if (pet.isEgg) {
            pet.hatchProgress += (100 / pet.hatchTimer);
            if (pet.hatchProgress >= 100) {
                pet.hatchProgress = 100;
                hatchEgg(); 
            }
            updateDisplay();
            return; 
        }

        if (pet.isAlive && pet.level === 1 && pet.ageProgress < pet.ageToChild) {
            pet.ageProgress++;
            if (pet.ageProgress >= pet.ageToChild) {
                pet.level = 2; 
                showGameMessage(`${pet.name} evoluiu para Criança!`, 4000);
                pet.hunger = Math.min(100, pet.hunger + 10);
                pet.fun = Math.min(100, pet.fun + 10);
                pet.energy = Math.min(100, pet.energy + 10);
            }
        }

        if (pet.isAlive) {
            if (pet.life < 30 && !pet.isSick && Math.random() < 0.01) { 
                pet.isSick = true;
                showGameMessage(`${pet.name} parece doente! Use uma vacina!`, 4000);
            }

            if (!pet.isSleeping && !pet.isEating && !pet.isBrincando) {
                pet.hunger = Math.max(0, pet.hunger - 1);
                pet.fun = Math.max(0, pet.fun - 1);
                pet.energy = Math.max(0, pet.energy - 0.5);
                
                if (pet.isSick) {
                    pet.life = Math.max(0, pet.life - 2); 
                } else {
                    pet.life = Math.max(0, pet.life - 0.2);
                }

                if (pet.hunger === 0 || pet.fun === 0 || pet.energy === 0) {
                    pet.life = Math.max(0, pet.life - 1);
                }
            }
            
            checkStatus(); 
            updateDisplay(); 

            if (pet.life === 0) {
                pet.isAlive = false;
                showGameMessage(`Oh não! ${pet.name} não aguentou...`, 5000);
                updatePetImage(); 
                clearInterval(gameInterval); 
            }
        } else if (pet.isSleeping) {
            pet.energy = Math.min(100, pet.energy + 2);
            pet.life = Math.min(100, pet.life + 0.5);
            checkStatus();
            updateDisplay();
        }
    }, 1000); 
}

// --- Handlers de Eventos dos Botões ---
function handleStartGame() {
    const nameValue = petNameInput ? petNameInput.value.trim() : '';
    if (nameValue === "") {
        alert('Por favor, dê um nome ao seu Tamagotchi!');
        return;
    }
    
    pet = {
        name: nameValue, 
        hunger: 100, fun: 100, energy: 100, life: 100,
        level: 0, coins: 0, 
        isSleeping: false, isAlive: true, isEating: false, isEgg: true, isSick: false, 
        hatchProgress: 0, hatchTimer: 60, 
        ageProgress: 0, ageToChild: 120, 
        lastSaveTime: Date.now(), inventory: [], 
        mood: 'Esperando...', status: 'Em desenvolvimento', isBrincando: false
    };

    updateDisplay();
    showScreen(tamagotchiScreen);
    showGameMessage(`Um ovo foi colocado! Cuide bem dele.`, 3000);
    startGameLoop();
}

function handleFeed() {
    if (pet.isEgg) { showGameMessage('O ovo não precisa ser alimentado!', 1500); return; }
    if (!pet.isAlive) { showGameMessage('Não posso alimentar um Tamagotchi morto...'); return; }
    if (pet.isSleeping) { showGameMessage(`${pet.name} está dormindo! Não o incomode.`); return; }
    if (pet.isSick) { showGameMessage(`${pet.name} está doente e não quer comer!`); return; } 
    if (pet.hunger > 90) { showGameMessage(`${pet.name} não está com tanta fome.`); return; }

    pet.isEating = true;
    updatePetImage();
    showGameMessage(`${pet.name} está comendo!`);
    disableActionButtons(true);

    setTimeout(() => {
        pet.hunger = Math.min(100, pet.hunger + 15);
        pet.energy = Math.min(100, pet.energy + 5);
        pet.isEating = false;
        updatePetImage();
        updateDisplay();
        showGameMessage(`${pet.name} comeu e está mais satisfeito.`);
    }, 1500);
}

function handlePlay() {
    if (pet.isEgg) { showGameMessage('Ovo não sabe brincar!', 1500); return; }
    if (!pet.isAlive) { showGameMessage('Não posso brincar com um Tamagotchi morto...'); return; }
    if (pet.isSleeping) { showGameMessage(`${pet.name} está dormindo! Não o incomode.`); return; }
    if (pet.isSick) { showGameMessage(`${pet.name} está doente e não quer brincar!`); return; } 
    if (pet.energy < 20) { showGameMessage(`${pet.name} está muito cansado para brincar.`); return; }
    if (pet.fun > 90) { showGameMessage(`${pet.name} já está se divertindo o bastante.`); return; }

    pet.isBrincando = true;
    updatePetImage();
    showGameMessage(`${pet.name} está brincando!`);
    disableActionButtons(true);

    setTimeout(() => {
        pet.fun = Math.min(100, pet.fun + 20);
        pet.energy = Math.max(0, pet.energy - 10);
        pet.hunger = Math.max(0, pet.hunger - 5);
        pet.coins += 1;
        pet.isBrincando = false;
        updatePetImage();
        updateDisplay();
        showGameMessage(`${pet.name} se divertiu muito! (+1 Moeda)`);
    }, 2000);
}

function handleSleep() {
    if (pet.isEgg) { showGameMessage('Ovo não precisa dormir!', 1500); return; }
    if (!pet.isAlive) { showGameMessage('Não posso fazer um Tamagotchi morto dormir...'); return; }
    if (pet.isSleeping) { showGameMessage(`${pet.name} já está dormindo.`); return; }
    if (pet.isSick) { showGameMessage(`${pet.name} está doente e precisa de vacina, não de sono!`); return; } 

    pet.isSleeping = true;
    updatePetImage();
    showGameMessage(`${pet.name} foi dormir... Zzzzz`);
    updateDisplay();
}

function handleVaccinate() {
    if (pet.isEgg) { showGameMessage('Ovo não precisa de vacina!', 1500); return; }
    if (!pet.isAlive) { showGameMessage('Não posso vacinar um Tamagotchi morto...'); return; }
    if (!pet.isSick) { showGameMessage(`${pet.name} não está doente no momento.`); return; }
    if (pet.isSleeping) { showGameMessage(`${pet.name} está dormindo! Não o incomode.`); return; }
    if (pet.coins < 5) { showGameMessage('Você não tem moedas suficientes para a vacina! (Custa 5 moedas)', 2500); return; }

    showGameMessage(`Vacinando ${pet.name}...`);
    disableActionButtons(true); 

    setTimeout(() => {
        pet.isSick = false; 
        pet.life = Math.min(100, pet.life + 15); 
        pet.coins = Math.max(0, pet.coins - 5); 
        showGameMessage(`${pet.name} foi vacinado e se sente melhor! (-5 Moedas)`);
        updatePetImage();
        updateDisplay();
    }, 1500);
}

// --- Lógica da Loja ---
function handleShop() {
    if (pet.isEgg) { showGameMessage('A loja não vende itens para ovos!', 1500); return; }
    if (!pet.isAlive) { showGameMessage('A loja não atende fantasmas...'); return; }
    if (pet.isSleeping) { showGameMessage(`${pet.name} está dormindo! Não o incomode.`); return; }
    if (pet.isEating || pet.isBrincando || pet.isSick) { showGameMessage(`${pet.name} está ocupado!`); return; }
    
    renderShopItems();
    showScreen(shopScreen);
}

function renderShopItems() {
    if (!shopItemsContainer) return;
    shopItemsContainer.innerHTML = ''; 

    shopItems.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.classList.add('item-card');
        itemCard.innerHTML = `
            <span class="item-name">${item.name}</span>
            <span class="item-price">${item.price} Moedas</span>
            <button data-item-id="${item.id}">Comprar</button>
        `;
        shopItemsContainer.appendChild(itemCard);

        const buyButton = itemCard.querySelector('button');
        buyButton.addEventListener('click', () => buyItem(item.id));
    });
}

function buyItem(itemId) {
    const itemToBuy = shopItems.find(item => item.id === itemId);

    if (!itemToBuy) {
        showGameMessage('Item não encontrado na loja!', 1500);
        return;
    }

    if (pet.coins < itemToBuy.price) {
        showGameMessage('Moedas insuficientes!', 1500);
        return;
    }

    pet.coins -= itemToBuy.price;
    
    const existingItem = pet.inventory.find(invItem => invItem.id === itemId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        pet.inventory.push({ ...itemToBuy, quantity: 1 }); 
    }

    updateDisplay();
    showGameMessage(`Você comprou ${itemToBuy.name}! (-${itemToBuy.price} Moedas)`, 2000);
    renderShopItems(); 
}

// --- Lógica do Inventário ---
function handleInventory() {
    if (pet.isEgg) { showGameMessage('Ovo não tem inventário!', 1500); return; }
    if (!pet.isAlive) { showGameMessage('Fantasmas não precisam de inventário...'); return; }
    if (pet.isSleeping) { showGameMessage(`${pet.name} está dormindo! Não o incomode.`); return; }
    if (pet.isEating || pet.isBrincando || pet.isSick) { showGameMessage(`${pet.name} está ocupado!`); return; }

    renderInventoryItems();
    showScreen(inventoryScreen);
}

function renderInventoryItems() {
    if (!inventoryItemsContainer) return;
    inventoryItemsContainer.innerHTML = ''; 

    if (pet.inventory.length === 0) {
        inventoryItemsContainer.innerHTML = '<p style="text-align: center; width: 100%;">Seu inventário está vazio!</p>';
        return;
    }

    pet.inventory.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.classList.add('item-card');
        itemCard.innerHTML = `
            <span class="item-name">${item.name}</span>
            <span class="item-quantity">x${item.quantity}</span>
            <button data-item-id="${item.id}" ${item.type === 'food' || item.type === 'medicine' || item.type === 'toy' ? '' : 'disabled'}>Usar</button>
        `;
        inventoryItemsContainer.appendChild(itemCard);

        const useButton = itemCard.querySelector('button');
        useButton.addEventListener('click', () => useItem(item.id));
    });
}

function useItem(itemId) {
    const itemToUse = pet.inventory.find(item => item.id === itemId);

    if (!itemToUse) {
        showGameMessage('Item não encontrado no inventário!', 1500);
        return;
    }
    if (itemToUse.quantity <= 0) {
        showGameMessage('Você não tem mais deste item!', 1500);
        return;
    }
    
    let message = '';
    let usedSuccessfully = false;

    if (pet.isEating || pet.isBrincando || pet.isSleeping) {
        showGameMessage(`${pet.name} está ocupado e não pode usar o item agora!`, 2000);
        return;
    }

    if (itemToUse.type === 'food') {
        if (pet.hunger === 100) { showGameMessage(`${pet.name} não está com fome!`, 1500); return; }
        pet.hunger = Math.min(100, pet.hunger + (itemToUse.effect.hunger || 0));
        pet.energy = Math.min(100, pet.energy + (itemToUse.effect.energy || 0));
        message = `${pet.name} comeu ${itemToUse.name}!`;
        usedSuccessfully = true;
    } else if (itemToUse.type === 'toy') {
        if (pet.fun === 100) { showGameMessage(`${pet.name} não está entediado!`, 1500); return; }
        pet.fun = Math.min(100, pet.fun + (itemToUse.effect.fun || 0));
        message = `${pet.name} brincou com ${itemToUse.name}!`;
        usedSuccessfully = true;
    } else if (itemToUse.type === 'medicine') {
        if (!pet.isSick) { showGameMessage(`${pet.name} não está doente!`, 1500); return; }
        pet.life = Math.min(100, pet.life + (itemToUse.effect.life || 0));
        pet.isSick = false; 
        message = `${pet.name} tomou o remédio e se sente melhor!`;
        usedSuccessfully = true;
    } else {
        showGameMessage('Este item não pode ser usado no momento.', 1500);
    }

    if (usedSuccessfully) {
        itemToUse.quantity--;
        if (itemToUse.quantity <= 0) {
            pet.inventory = pet.inventory.filter(item => item.id !== itemId); 
        }
        showGameMessage(message, 2000);
        updateDisplay();
        renderInventoryItems(); 
    }
}

// --- Lógica de Minigames ---
function handleGames() {
    if (pet.isEgg) { showGameMessage('Ovo não joga!', 1500); return; }
    if (!pet.isAlive) { showGameMessage('Fantasmas não jogam...'); return; }
    if (pet.isSleeping) { showGameMessage(`${pet.name} está dormindo! Não o incomode.`); return; }
    if (pet.isEating || pet.isBrincando || pet.isSick) { showGameMessage(`${pet.name} está ocupado!`); return; }
    
    // Mostra a tela principal de seleção de jogos e esconde as sub-telas
    hideAllSubGameScreens();
    showScreen(gamesScreen);
    // Esconde os botões de voltar dos sub-jogos e mostra os de seleção
    if (gamesListContainer) gamesListContainer.style.display = 'flex';
    if (gamesBackButton) gamesBackButton.style.display = 'block';
}

function showSubGameScreen(subScreenElement) {
    hideAllSubGameScreens(); // Esconde todos os outros jogos
    if (gamesListContainer) gamesListContainer.style.display = 'none'; // Esconde a lista de jogos
    if (gamesBackButton) gamesBackButton.style.display = 'none'; // Esconde o botão de voltar geral
    if (subScreenElement) subScreenElement.style.display = 'flex'; // Mostra o jogo específico
}

// --- Jogo: Pedra, Papel, Tesoura (RPS) ---
function initRPSGame() {
    showSubGameScreen(rpsGameScreen);
    rpsResult.textContent = 'Faça sua escolha!';
    // Reabilita os botões de escolha e esconde os de "jogar novamente" e "voltar"
    rpsRockBtn.disabled = false;
    rpsPaperBtn.disabled = false;
    rpsScissorsBtn.disabled = false;
    rpsPlayAgainBtn.style.display = 'none';
    rpsBackToGamesBtn.style.display = 'none';
}

function playRPS(playerChoice) {
    // Desabilita botões de escolha
    rpsRockBtn.disabled = true;
    rpsPaperBtn.disabled = true;
    rpsScissorsBtn.disabled = true;

    const choices = ['pedra', 'papel', 'tesoura'];
    const tamagotchiChoice = choices[Math.floor(Math.random() * choices.length)];

    let result = '';
    let reward = 0;

    if (playerChoice === tamagotchiChoice) {
        result = `Empate! Tamagotchi escolheu ${tamagotchiChoice}.`;
        reward = 1; // Pequena recompensa por empate
    } else if (
        (playerChoice === 'pedra' && tamagotchiChoice === 'tesoura') ||
        (playerChoice === 'papel' && tamagotchiChoice === 'pedra') ||
        (playerChoice === 'tesoura' && tamagotchiChoice === 'papel')
    ) {
        result = `Você Venceu! Tamagotchi escolheu ${tamagotchiChoice}.`;
        reward = 5;
        pet.fun = Math.min(100, pet.fun + 10); // Aumenta um pouco a diversão
    } else {
        result = `Você Perdeu! Tamagotchi escolheu ${tamagotchiChoice}.`;
        reward = 0;
        pet.fun = Math.max(0, pet.fun - 5); // Diminui um pouco a diversão
    }

    pet.coins += reward;
    updateDisplay();
    rpsResult.textContent = result + ` Você ganhou ${reward} moedas!`;

    // Mostra os botões de "jogar novamente" e "voltar"
    rpsPlayAgainBtn.style.display = 'block';
    rpsBackToGamesBtn.style.display = 'block';
}

// --- Jogo: Adivinhe o Número (Number Guessing) ---
function initNumberGuessingGame() {
    showSubGameScreen(numberGuessingGameScreen);
    secretNumber = Math.floor(Math.random() * 100) + 1; // Número entre 1 e 100
    attempts = 0;
    ngInstructions.textContent = 'Estou pensando em um número entre 1 e 100. Tente adivinhar!';
    ngGuessInput.value = '';
    ngResult.textContent = '';
    ngSubmitGuessBtn.disabled = false; // Habilita o botão de submissão
    ngGuessInput.disabled = false; // Habilita o input
    ngPlayAgainBtn.style.display = 'none';
    ngBackToGamesBtn.style.display = 'none';
    console.log("Número secreto:", secretNumber); // Para depuração
}

function submitNumberGuess() {
    const guess = parseInt(ngGuessInput.value);

    if (isNaN(guess) || guess < 1 || guess > 100) {
        ngResult.textContent = 'Por favor, insira um número válido entre 1 e 100.';
        return;
    }

    attempts++;

    if (guess === secretNumber) {
        ngResult.textContent = `Parabéns! Você adivinhou o número ${secretNumber} em ${attempts} tentativas!`;
        const reward = Math.max(1, 15 - attempts); // Recompensa baseada em tentativas
        pet.coins += reward;
        pet.fun = Math.min(100, pet.fun + 15);
        showGameMessage(`Você ganhou ${reward} moedas!`, 2000);
        updateDisplay();
        ngSubmitGuessBtn.disabled = true; // Desabilita o botão após acertar
        ngGuessInput.disabled = true; // Desabilita o input
        ngPlayAgainBtn.style.display = 'block';
        ngBackToGamesBtn.style.display = 'block';
    } else if (guess < secretNumber) {
        ngResult.textContent = `Tente um número MAIOR. Tentativas: ${attempts}`;
    } else {
        ngResult.textContent = `Tente um número MENOR. Tentativas: ${attempts}`;
    }
    ngGuessInput.value = ''; // Limpa o input
}


// --- Jogo: Jogo da Velha (Tic Tac Toe) --- (Placeholder por enquanto)
function initTicTacToeGame() {
    showSubGameScreen(ticTacToeGameScreen);
    ticTacToeStatus.textContent = 'Jogo da Velha (Em Breve!)';
    // Desabilitar células e botões de jogar/voltar do Tic Tac Toe por enquanto
    const cells = ticTacToeBoard.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell'; // Limpa classes de jogador
        cell.removeEventListener('click', handleCellClick); // Remove listeners antigos
        cell.style.pointerEvents = 'none'; // Desabilita clique
    });
    ticTacToePlayAgainBtn.style.display = 'none';
    ticTacToeBackToGamesBtn.style.display = 'none';
}


// --- Função de Inicialização do Jogo ---
// Esta função é chamada uma vez quando o DOM é carregado ou para reiniciar o jogo.
function initializeGame() {
    // Inicializa as referências aos elementos HTML
    startScreen = getElement('startScreen');
    tamagotchiScreen = getElement('tamagotchiScreen');
    petNameInput = getElement('petNameInput');
    startGameBtn = getElement('startGameBtn');

    petNameDisplay = getElement('petName');
    moodDisplay = getElement('mood');
    statusDisplay = getElement('status');
    petImage = getElement('petImage'); 

    hungerIcon = getElement('hungerIcon');
    funIcon = getElement('funIcon');
    energyIcon = getElement('energyIcon');
    lifeIcon = getElement('lifeIcon');

    levelDisplay = getElement('nivel');
    coinsDisplay = getElement('moedas');

    feedButton = getElement('feedButton');
    playButton = getElement('playButton');
    sleepButton = getElement('sleepButton');
    shopButton = getElement('shopButton');
    inventoryButton = getElement('inventoryButton');
    gamesButton = getElement('gamesButton');
    vaccinateButton = getElement('vaccinateButton'); 

    // Referências para as novas telas de Loja/Inventário
    shopScreen = getElement('shopScreen');
    shopItemsContainer = getElement('shopItems');
    shopBackButton = getElement('shopBackButton');

    inventoryScreen = getElement('inventoryScreen');
    inventoryItemsContainer = getElement('inventoryItems');
    inventoryBackButton = getElement('inventoryBackButton');

    // Referências para as novas telas de Minigames
    gamesScreen = getElement('gamesScreen');
    gamesListContainer = getElement('gamesList'); 
    gamesBackButton = getElement('gamesBackButton');
    rockPaperScissorsBtn = getElement('rockPaperScissorsBtn'); 
    numberGuessingBtn = getElement('numberGuessingBtn');
    ticTacToeBtn = getElement('ticTacToeBtn');

    // Referências para elementos de Pedra, Papel, Tesoura
    rpsGameScreen = getElement('rpsGame');
    rpsResult = getElement('rpsResult');
    rpsRockBtn = getElement('rpsRock');
    rpsPaperBtn = getElement('rpsPaper');
    rpsScissorsBtn = getElement('rpsScissors');
    rpsPlayAgainBtn = getElement('rpsPlayAgainBtn');
    rpsBackToGamesBtn = getElement('rpsBackToGamesBtn');

    // Referências para elementos de Adivinhe o Número
    numberGuessingGameScreen = getElement('numberGuessingGame');
    ngInstructions = getElement('ngInstructions');
    ngGuessInput = getElement('ngGuessInput');
    ngSubmitGuessBtn = getElement('ngSubmitGuessBtn');
    ngResult = getElement('ngResult');
    ngPlayAgainBtn = getElement('ngPlayAgainBtn');
    ngBackToGamesBtn = getElement('ngBackToGamesBtn');

    // Referências para elementos do Jogo da Velha (Tic Tac Toe)
    ticTacToeGameScreen = getElement('ticTacToeGame');
    ticTacToeBoard = getElement('ticTacToeBoard');
    ticTacToeStatus = getElement('ticTacToeStatus');
    ticTacToePlayAgainBtn = getElement('ticTacToePlayAgainBtn');
    ticTacToeBackToGamesBtn = getElement('ticTacToeBackToGamesBtn');


    // Estado inicial do pet para um novo jogo
    pet = {
        name: '',
        hunger: 100, fun: 100, energy: 100, life: 100,
        level: 0, coins: 0, 
        isSleeping: false, isAlive: true, isEating: false, isEgg: true, isSick: false, 
        isBrincando: false, 
        hatchProgress: 0, hatchTimer: 60, 
        ageProgress: 0, ageToChild: 120, 
        lastSaveTime: Date.now(),
        inventory: [], 
        mood: 'Normal',
        status: 'Bem',
    };

    // --- Limpeza de Event Listeners Antigos (para evitar duplicações) ---
    // Botões principais
    if (startGameBtn) startGameBtn.removeEventListener('click', handleStartGame);
    if (feedButton) feedButton.removeEventListener('click', handleFeed);
    if (playButton) playButton.removeEventListener('click', handlePlay);
    if (sleepButton) sleepButton.removeEventListener('click', handleSleep);
    if (shopButton) shopButton.removeEventListener('click', handleShop);
    if (inventoryButton) inventoryButton.removeEventListener('click', handleInventory);
    if (gamesButton) gamesButton.removeEventListener('click', handleGames);
    if (vaccinateButton) vaccinateButton.removeEventListener('click', handleVaccinate);
    
    // Botões de navegação das telas principais
    if (shopBackButton) shopBackButton.removeEventListener('click', () => showScreen(tamagotchiScreen));
    if (inventoryBackButton) inventoryBackButton.removeEventListener('click', () => showScreen(tamagotchiScreen));
    if (gamesBackButton) gamesBackButton.removeEventListener('click', () => showScreen(tamagotchiScreen));
    
    // Botões de seleção de jogos
    if (rockPaperScissorsBtn) rockPaperScissorsBtn.removeEventListener('click', initRPSGame);
    if (numberGuessingBtn) numberGuessingBtn.removeEventListener('click', initNumberGuessingGame);
    if (ticTacToeBtn) ticTacToeBtn.removeEventListener('click', initTicTacToeGame);

    // Botões de Pedra, Papel, Tesoura
    if (rpsRockBtn) rpsRockBtn.removeEventListener('click', () => playRPS('pedra'));
    if (rpsPaperBtn) rpsPaperBtn.removeEventListener('click', () => playRPS('papel'));
    if (rpsScissorsBtn) rpsScissorsBtn.removeEventListener('click', () => playRPS('tesoura'));
    if (rpsPlayAgainBtn) rpsPlayAgainBtn.removeEventListener('click', initRPSGame);
    if (rpsBackToGamesBtn) rpsBackToGamesBtn.removeEventListener('click', handleGames);

    // Botões de Adivinhe o Número
    if (ngSubmitGuessBtn) ngSubmitGuessBtn.removeEventListener('click', submitNumberGuess);
    if (ngPlayAgainBtn) ngPlayAgainBtn.removeEventListener('click', initNumberGuessingGame);
    if (ngBackToGamesBtn) ngBackToGamesBtn.removeEventListener('click', handleGames);

    // Botões do Jogo da Velha (placeholder)
    if (ticTacToePlayAgainBtn) ticTacToePlayAgainBtn.removeEventListener('click', initTicTacToeGame);
    if (ticTacToeBackToGamesBtn) ticTacToeBackToGamesBtn.removeEventListener('click', handleGames);


    // --- Adição de Event Listeners ---
    // Botões principais
    if (startGameBtn) startGameBtn.addEventListener('click', handleStartGame);
    if (feedButton) feedButton.addEventListener('click', handleFeed);
    if (playButton) playButton.addEventListener('click', handlePlay);
    if (sleepButton) sleepButton.addEventListener('click', handleSleep);
    if (shopButton) shopButton.addEventListener('click', handleShop);
    if (inventoryButton) inventoryButton.addEventListener('click', handleInventory);
    if (gamesButton) gamesButton.addEventListener('click', handleGames);
    if (vaccinateButton) vaccinateButton.addEventListener('click', handleVaccinate);
    
    // Botões de navegação das telas principais
    if (shopBackButton) shopBackButton.addEventListener('click', () => showScreen(tamagotchiScreen));
    if (inventoryBackButton) inventoryBackButton.addEventListener('click', () => showScreen(tamagotchiScreen));
    if (gamesBackButton) gamesBackButton.addEventListener('click', () => showScreen(tamagotchiScreen));
    
    // Botões de seleção de jogos
    if (rockPaperScissorsBtn) rockPaperScissorsBtn.addEventListener('click', initRPSGame);
    if (numberGuessingBtn) numberGuessingBtn.addEventListener('click', initNumberGuessingGame);
    if (ticTacToeBtn) ticTacToeBtn.addEventListener('click', initTicTacToeGame); // Este ainda é um placeholder

    // Botões de Pedra, Papel, Tesoura
    if (rpsRockBtn) rpsRockBtn.addEventListener('click', () => playRPS('pedra'));
    if (rpsPaperBtn) rpsPaperBtn.addEventListener('click', () => playRPS('papel'));
    if (rpsScissorsBtn) rpsScissorsBtn.addEventListener('click', () => playRPS('tesoura'));
    if (rpsPlayAgainBtn) rpsPlayAgainBtn.addEventListener('click', initRPSGame);
    if (rpsBackToGamesBtn) rpsBackToGamesBtn.addEventListener('click', handleGames);

    // Botões de Adivinhe o Número
    if (ngSubmitGuessBtn) ngSubmitGuessBtn.addEventListener('click', submitNumberGuess);
    if (ngPlayAgainBtn) ngPlayAgainBtn.addEventListener('click', initNumberGuessingGame);
    if (ngBackToGamesBtn) ngBackToGamesBtn.addEventListener('click', handleGames);

    // Botões do Jogo da Velha (placeholder)
    if (ticTacToePlayAgainBtn) ticTacToePlayAgainBtn.addEventListener('click', initTicTacToeGame);
    if (ticTacToeBackToGamesBtn) ticTacToeBackToGamesBtn.addEventListener('click', handleGames);
    
    // Logs de depuração
    console.log("Protocolo da URL:", window.location.protocol); 
    console.log("Nome do Repositório (configurado no JS):", GITHUB_REPO_NAME); 

    showScreen(startScreen); 
    updateDisplay(); 
}

document.addEventListener('DOMContentLoaded', initializeGame);
