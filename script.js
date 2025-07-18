// --- Variáveis Globais (elementos HTML e estado do jogo) ---
// Declaradas aqui para serem acessíveis por todas as funções. Serão inicializadas em initializeGame().
let startScreen, tamagotchiScreen, petNameInput, startGameBtn;
let petNameDisplay, moodDisplay, statusDisplay, petImage;
let hungerIcon, funIcon, energyIcon, lifeIcon;
let levelDisplay, coinsDisplay;
let feedButton, playButton, sleepButton, shopButton, inventoryButton, gamesButton;

let pet = {}; // Objeto pet será inicializado em initializeGame()
let gameInterval; // Para o loop principal do jogo

// --- Funções Auxiliares ---
// Estas funções são definidas no escopo global para serem acessíveis por todo o script.
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
}

function showScreen(screenElement) {
    hideAllScreens();
    if (screenElement) {
        screenElement.style.display = 'flex';
    }
}

// Função para obter o caminho da imagem com base no estado e nível
function getPetImagePath(currentPet) {
    // ATENÇÃO: SUBSTITUA 'meu-tamagotchi' pelo NOME EXATO do seu repositório GitHub
    // Se você estiver testando LOCALMENTE, pode usar um caminho relativo como './imgs/'
    // Mas para o GitHub Pages, precisamos do nome do repositório.
    // A melhor prática é usar um caminho absoluto do root do seu GitHub Pages:
    const GITHUB_REPO_PATH = '/meu-tamagotchi/'; // <<< MUDAR AQUI PARA O SEU REPOSITÓRIO!
    
    // Verifica se estamos no ambiente local (file://) ou no GitHub Pages (http/https)
    // Se o protocolo for 'file:', use um caminho relativo direto
    // Caso contrário (GitHub Pages), use o caminho absoluto do repositório
    let baseDir = window.location.protocol === 'file:' ? './imgs/' : GITHUB_REPO_PATH + 'imgs/';

    // Lógica especial para imagens de ovo antes de chocar
    if (currentPet.isEgg) {
        if (currentPet.type === 'ovo.rachando') return baseDir + 'ovo.rachando.gif';
        if (currentPet.type === 'ovo.quebrado') return baseDir + 'ovo.quebrado.gif';
        return baseDir + 'ovo.gif'; // Imagem padrão do ovo
    }

    let prefix = currentPet.level === 1 ? 'bebe.' : 'crianca.'; // Prefixo baseado no nível
    let suffix = '.gif'; // Assumindo GIFs para a maioria das animações

    // Lógica de prioridade para as imagens do pet (não ovo)
    if (!currentPet.isAlive) {
        return baseDir + 'morto.png'; // Sempre morto.png
    } else if (currentPet.isSleeping) {
        return baseDir + prefix + 'dormindo' + suffix;
    } else if (currentPet.isEating) {
        return baseDir + prefix + 'comendo' + suffix;
    } else if (currentPet.isBrincando) {
        return baseDir + prefix + 'brincando' + suffix;
    } else if (currentPet.status === 'Doente') { // Reutilizando a lógica de status
        return baseDir + prefix + 'doente' + suffix;
    }
    
    // Imagem padrão (normal) para o nível atual
    // Remove o '.' extra do prefixo (ex: "bebe" + ".gif" ou "crianca" + ".gif")
    return baseDir + prefix.slice(0, -1) + suffix; 
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
    const icons = [hungerIcon, funIcon, energyIcon, lifeIcon];
    
    if (pet.isEgg) {
        icons.forEach(icon => { if (icon) icon.classList.add('hidden'); });
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
        if (pet.life < 50) { lifeIcon.classList.remove('hidden'); lifeIcon.classList.toggle('blinking', pet.life < 20); }
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

// Atualiza a imagem do Tamagotchi e gerencia os botões
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
    } else if (pet.isEating || pet.isBrincando) {
        disableActionButtons(true);
        if (restartBtn) restartBtn.remove();
    } else {
        disableActionButtons(false);
        if (restartBtn) restartBtn.remove();
    }
}

function disableActionButtons(shouldDisable) {
    const buttons = [feedButton, playButton, sleepButton, shopButton, inventoryButton, gamesButton];
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
    initializeGame(); // Volta para a tela inicial e reinicia o pet
}

function checkStatus() {
    if (pet.isEgg) {
        pet.mood = 'Esperando...';
        pet.status = 'Em desenvolvimento';
        return;
    }
    
    if (pet.hunger < 30 || pet.fun < 30 || pet.energy < 30) {
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
    } else if (pet.life < 50) {
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
            if (!pet.isSleeping && !pet.isEating && !pet.isBrincando) {
                pet.hunger = Math.max(0, pet.hunger - 1);
                pet.fun = Math.max(0, pet.fun - 1);
                pet.energy = Math.max(0, pet.energy - 0.5);
                pet.life = Math.max(0, pet.life - 0.2);

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

// --- Handlers de Eventos dos Botões (separados para clareza) ---
function handleStartGame() {
    const nameValue = petNameInput ? petNameInput.value.trim() : '';
    if (nameValue === "") {
        alert('Por favor, dê um nome ao seu Tamagotchi!');
        return;
    }
    pet.name = nameValue;
    
    // Reinicializa pet para um novo jogo (importante para "Recomeçar")
    pet = {
        name: nameValue, // Usa o nome inserido
        hunger: 100, fun: 100, energy: 100, life: 100,
        level: 0, coins: 0,
        isSleeping: false, isAlive: true, isEating: false, isEgg: true,
        hatchProgress: 0, hatchTimer: 60, ageProgress: 0, ageToChild: 120,
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

    pet.isSleeping = true;
    updatePetImage();
    showGameMessage(`${pet.name} foi dormir... Zzzzz`);
    updateDisplay();
}

function handleShop() {
    if (pet.isEgg) { showGameMessage('A loja não vende itens para ovos!', 1500); return; }
    if (!pet.isAlive) { showGameMessage('A loja não atende fantasmas...'); return; }
    if (pet.isSleeping) { showGameMessage(`${pet.name} está dormindo! Não o incomode.`); return; }
    if (pet.isEating || pet.isBrincando) { showGameMessage(`${pet.name} está ocupado!`); return; }
    showGameMessage('A loja ainda está fechada!');
}

function handleInventory() {
    if (pet.isEgg) { showGameMessage('Ovo não tem inventário!', 1500); return; }
    if (!pet.isAlive) { showGameMessage('Fantasmas não precisam de inventário...'); return; }
    if (pet.isSleeping) { showGameMessage(`${pet.name} está dormindo! Não o incomode.`); return; }
    if (pet.isEating || pet.isBrincando) { showGameMessage(`${pet.name} está ocupado!`); return; }
    showGameMessage('Seu inventário está vazio!');
}

function handleGames() {
    if (pet.isEgg) { showGameMessage('Ovo não joga!', 1500); return; }
    if (!pet.isAlive) { showGameMessage('Fantasmas não jogam...'); return; }
    if (pet.isSleeping) { showGameMessage(`${pet.name} está dormindo! Não o incomode.`); return; }
    if (pet.isEating || pet.isBrincando) { showGameMessage(`${pet.name} está ocupado!`); return; }
    showGameMessage('Os jogos ainda não estão disponíveis!');
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

    // Estado inicial do pet para um novo jogo
    pet = {
        name: '',
        hunger: 100,
        fun: 100,
        energy: 100,
        life: 100,
        level: 0,
        coins: 0,
        isSleeping: false,
        isAlive: true,
        isEating: false,
        isEgg: true,
        hatchProgress: 0,
        hatchTimer: 60,
        ageProgress: 0,
        ageToChild: 120,
        lastSaveTime: Date.now(),
        inventory: [],
        mood: 'Normal',
        status: 'Bem',
        isBrincando: false
    };

    // Remove event listeners antigos antes de adicionar novos para evitar duplicações ao reiniciar
    // É importante remover SOMENTE se o elemento e o listener existem.
    if (startGameBtn) {
        startGameBtn.removeEventListener('click', handleStartGame);
        startGameBtn.addEventListener('click', handleStartGame);
    }
    if (feedButton) {
        feedButton.removeEventListener('click', handleFeed);
        feedButton.addEventListener('click', handleFeed);
    }
    if (playButton) {
        playButton.removeEventListener('click', handlePlay);
        playButton.addEventListener('click', handlePlay);
    }
    if (sleepButton) {
        sleepButton.removeEventListener('click', handleSleep);
        sleepButton.addEventListener('click', handleSleep);
    }
    if (shopButton) {
        shopButton.removeEventListener('click', handleShop);
        shopButton.addEventListener('click', handleShop);
    }
    if (inventoryButton) {
        inventoryButton.removeEventListener('click', handleInventory);
        inventoryButton.addEventListener('click', handleInventory);
    }
    if (gamesButton) {
        gamesButton.removeEventListener('click', handleGames);
        gamesButton.addEventListener('click', handleGames);
    }
    
    showScreen(startScreen); // Inicia na tela de nome
    updateDisplay(); // Atualiza o display inicial
}


// Garante que o script só rode depois que todo o HTML for carregado
document.addEventListener('DOMContentLoaded', initializeGame);
