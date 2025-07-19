// --- Variáveis Globais (elementos HTML e estado do jogo) ---
let startScreen, tamagotchiScreen, petNameInput, startGameBtn;
let petNameDisplay, moodDisplay, statusDisplay, petImage;
let hungerIcon, funIcon, energyIcon, lifeIcon;
let levelDisplay, coinsDisplay; // Nível agora será a fase de vida
let feedButton, playButton, sleepButton, shopButton, inventoryButton, gamesButton, vaccinateButton;

// NOVOS ELEMENTOS HTML PARA CUIDADO DO OVO
let eggStatusGroup, eggWarmthIcon, eggWarmthDisplay, warmEggButton;

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
// Verifique se o nome do repositório (case-sensitive) está correto.
// Exemplo: se seu repositório é 'MeuTamagotchi', use 'MeuTamagotchi'.
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

// Função para obter o caminho da imagem com base no estado, nível e tipo de adulto
function getPetImagePath(currentPet) {
    let baseDir;
    // Verifica se está rodando localmente (file://) ou em um servidor (http/https)
    if (window.location.protocol === 'file:') {
        baseDir = './imgs/'; 
    } else {
        // Para GitHub Pages, o caminho precisa incluir o nome do repositório
        baseDir = `/${GITHUB_REPO_NAME}/imgs/`; 
    }

    let finalPath;

    // Garante que o pet não seja undefined antes de acessar suas propriedades
    if (!currentPet) {
        return baseDir + 'ovo.gif'; // Retorna uma imagem padrão se o pet não estiver inicializado
    }

    if (!currentPet.isAlive) {
        finalPath = baseDir + 'morto.png'; // Imagem de morte tem prioridade
    } else if (currentPet.isEgg) {
        // Lógica de imagem do ovo baseada no eggWarmth
        if (currentPet.eggWarmth < 30) {
            finalPath = baseDir + 'ovo_frio.gif'; // Você precisará criar esta imagem
        } else if (currentPet.ageCounter > currentPet.hatchTimerSeconds * 0.66) {
            finalPath = baseDir + 'ovo_quebrado.gif'; // Quase chocando
        } else if (currentPet.ageCounter > currentPet.hatchTimerSeconds * 0.33) {
            finalPath = baseDir + 'ovo_rachando.gif'; // Rachando
        } else {
            finalPath = baseDir + 'ovo.gif'; // Ovo normal
        }
    } else if (currentPet.isSleeping) {
        let prefix = '';
        if (currentPet.level === 1) prefix = 'bebe.';
        else if (currentPet.level === 2) prefix = 'crianca.';
        else if (currentPet.level === 3) prefix = 'adulto_padrao.'; // Pode haver variações de adulto dormindo
        else if (currentPet.level === 4) prefix = 'velho.'; // Pode haver variações de velho dormindo
        finalPath = baseDir + prefix + 'dormindo.gif'; 
    } else if (currentPet.isEating) {
        let prefix = '';
        if (currentPet.level === 1) prefix = 'bebe.';
        else if (currentPet.level === 2) prefix = 'crianca.';
        else if (currentPet.level === 3) prefix = 'adulto_padrao.'; // Pode haver variações de adulto comendo
        else if (currentPet.level === 4) prefix = 'velho.'; // Pode haver variações de velho comendo
        finalPath = baseDir + prefix + 'comendo.gif'; 
    } else if (currentPet.isBrincando) { 
        let prefix = '';
        if (currentPet.level === 1) prefix = 'bebe.';
        else if (currentPet.level === 2) prefix = 'crianca.';
        else if (currentPet.level === 3) prefix = 'adulto_padrao.'; // Pode haver variações de adulto brincando
        else if (currentPet.level === 4) prefix = 'velho.'; // Pode haver variações de velho brincando
        finalPath = baseDir + prefix + 'brincando.gif'; 
    } else if (currentPet.isSick) { 
        let prefix = '';
        if (currentPet.level === 1) prefix = 'bebe.';
        else if (currentPet.level === 2) prefix = 'crianca.';
        else if (currentPet.level === 3) prefix = 'adulto_padrao.'; // Pode haver variações de adulto doente
        else if (currentPet.level === 4) prefix = 'velho.'; // Pode haver variações de velho doente
        finalPath = baseDir + prefix + 'doente.gif'; 
    } else {
        // Imagem normal do pet por nível e tipo adulto
        if (currentPet.level === 1) {
            finalPath = baseDir + 'bebe.gif'; 
        } else if (currentPet.level === 2) {
            finalPath = baseDir + 'crianca.gif'; 
        } else if (currentPet.level === 3) {
            finalPath = baseDir + `adulto_${currentPet.adultType}.gif`; 
        } else if (currentPet.level === 4) {
            finalPath = baseDir + 'velho.gif'; 
        } else {
            finalPath = baseDir + 'ovo.gif'; 
        }
    }

    console.log("Caminho gerado da imagem:", finalPath); 
    return finalPath;
}

// Lógica de Atualização do Display
function updateDisplay() {
    if (petNameDisplay) petNameDisplay.textContent = pet.level > 0 ? `Nome: ${pet.name}` : 'Nome: ???';
    if (moodDisplay) moodDisplay.textContent = `Humor: ${pet.mood}`;
    if (statusDisplay) statusDisplay.textContent = `Status: ${pet.status}`;
    
    if (levelDisplay) {
        let levelText = '';
        if (pet.isEgg) levelText = 'Ovo';
        else if (pet.level === 1) levelText = 'Bebê';
        else if (pet.level === 2) levelText = 'Criança';
        else if (pet.level === 3) levelText = `Adulto (${pet.adultType.charAt(0).toUpperCase() + pet.adultType.slice(1)})`; 
        else if (pet.level === 4) levelText = 'Velho';
        
        const ageInDays = pet.age.toFixed(1); 
        levelDisplay.textContent = `Nível: ${levelText} (Idade: ${ageInDays} dias)`;
    }
    if (coinsDisplay) coinsDisplay.textContent = pet.coins;
    
    updatePetImage(); 
    updateStatusIcons();
}

function updateStatusIcons() {
    // Gerencia visibilidade do status do ovo
    if (eggStatusGroup) {
        if (pet.isEgg && pet.isAlive) {
            eggStatusGroup.classList.remove('hidden');
            eggWarmthDisplay.textContent = `Aquecimento: ${pet.eggWarmth.toFixed(0)}%`;
            eggWarmthIcon.classList.toggle('cold', pet.eggWarmth < 40);
            eggWarmthIcon.classList.toggle('critical', pet.eggWarmth < 20);
        } else {
            eggStatusGroup.classList.add('hidden');
        }
    }

    // Gerencia visibilidade dos ícones de status do pet
    if (pet.isEgg || !pet.isAlive) { // Esconde ícones para ovo e morto
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

    // O hatchTimer agora representa 12 horas (43200 segundos)
    const totalHatchTicks = pet.hatchTimerSeconds; // Total de segundos para chocar
    const currentHatchProgress = pet.ageCounter; // Segundos passados no ovo

    // Imagem do ovo baseada no eggWarmth e progresso
    petImage.src = getPetImagePath(pet);

    if (pet.eggWarmth <= 0) {
        pet.isAlive = false; // Ovo morre se esfriar demais
        showGameMessage(`Oh não! O ovo esfriou demais e não sobreviveu...`, 5000);
        updatePetImage();
        clearInterval(gameInterval);
        return;
    }

    if (currentHatchProgress >= totalHatchTicks) {
        pet.isEgg = false;
        pet.level = 1; // Transforma em Bebê
        pet.age = pet.evolutionThresholds.baby; // Define idade inicial de bebê (0.5 dias)
        showGameMessage(`${pet.name} chocou! Bem-vindo(a) ao mundo!`, 3000);
        
        petImage.src = getPetImagePath(pet); 
        disableActionButtons(false); 
        
        return;
    }
    // Se ainda é ovo, mantém os botões de ação desabilitados, exceto o de aquecer
    disableActionButtons(true); 
}

// Atualiza a imagem do Tamagotchi e gerencia os botões de ação
function updatePetImage() {
    if (!petImage) return; 

    if (pet.isEgg) {
        hatchEgg(); 
        // Gerencia a visibilidade do botão de aquecer
        if (warmEggButton) warmEggButton.classList.remove('hidden');
        if (feedButton) feedButton.classList.add('hidden');
        if (playButton) playButton.classList.add('hidden');
        if (sleepButton) sleepButton.classList.add('hidden');
        if (vaccinateButton) vaccinateButton.classList.add('hidden');
        if (shopButton) shopButton.classList.add('hidden'); // Loja também escondida para ovo
        if (inventoryButton) inventoryButton.classList.add('hidden'); // Inventário também escondido
        if (gamesButton) gamesButton.classList.add('hidden'); // Minigames também escondido
        return;
    } else {
        // Se não é ovo, esconde o botão de aquecer
        if (warmEggButton) warmEggButton.classList.add('hidden');
        if (feedButton) feedButton.classList.remove('hidden');
        if (playButton) playButton.classList.remove('hidden');
        if (sleepButton) sleepButton.classList.remove('hidden');
        if (vaccinateButton) vaccinateButton.classList.remove('hidden');
        if (shopButton) shopButton.classList.remove('hidden');
        if (inventoryButton) inventoryButton.classList.remove('hidden');
        if (gamesButton) gamesButton.classList.remove('hidden');
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
            if (restartButton) restartButton.classList.remove('hidden');
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
    // O botão de aquecer é gerenciado separadamente
    if (warmEggButton) warmEggButton.disabled = !pet.isEgg || shouldDisable;
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
    showScreen(startScreen); // Volta para a tela inicial
}

function checkStatus() {
    if (!pet || typeof pet.isEgg === 'undefined') return; 

    if (pet.isEgg) {
        pet.mood = 'Esperando...';
        if (pet.eggWarmth < 30) {
            pet.status = 'Esfriando!';
        } else {
            pet.status = 'Em desenvolvimento';
        }
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

// --- Funções para determinar o tipo adulto ---
function determineAdultType() {
    let avgCareScore = (pet.hunger + pet.fun + pet.energy + pet.life) / 4;

    if (avgCareScore > 90) {
        return 'feliz'; 
    } else if (pet.fun > 80 && avgCareScore > 70) {
        return 'ativo'; 
    } else if (pet.hunger > 80 && avgCareScore > 70) {
        return 'forte'; 
    } else {
        return 'padrao'; 
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

        if (!pet.isAlive) { 
            clearInterval(gameInterval);
            updateDisplay(); 
            return;
        }

        // Lógica de tempo "realista"
        pet.ageCounter++; // A cada segundo real
        if (pet.ageCounter >= pet.ageIntervalSeconds) {
            pet.age += 1; // Avança 1 "dia" no Tamagotchi
            pet.ageCounter = 0; // Reseta o contador de segundos
        }

        if (pet.isEgg) {
            // Decaimento de Aquecimento do Ovo
            pet.eggWarmth = Math.max(0, pet.eggWarmth - (100 / pet.hatchTimerSeconds)); // Decai para 0 em hatchTimerSeconds
            
            if (pet.eggWarmth <= 0) {
                pet.isAlive = false; // Ovo morre se não for aquecido
                showGameMessage(`Oh não! O ovo esfriou demais e não sobreviveu. Inicie um novo jogo.`, 5000);
                updatePetImage();
                clearInterval(gameInterval);
                return;
            }

            // A lógica de eclosão está dentro de hatchEgg(), que é chamada por updatePetImage()
            updateDisplay();
            return; 
        }

        // Lógica de evolução (baseada nos "dias" de pet.age)
        if (pet.level === 1 && pet.age >= pet.evolutionThresholds.child) {
            pet.level = 2; // Evolui para Criança
            showGameMessage(`${pet.name} cresceu e virou uma Criança!`, 4000);
            pet.hunger = Math.min(100, pet.hunger + 10);
            pet.fun = Math.min(100, pet.fun + 10);
            pet.energy = Math.min(100, pet.energy + 10);
        } else if (pet.level === 2 && pet.age >= pet.evolutionThresholds.adult) {
            pet.level = 3; // Evolui para Adulto
            pet.adultType = determineAdultType(); 
            showGameMessage(`${pet.name} se tornou um Adulto (${pet.adultType.charAt(0).toUpperCase() + pet.adultType.slice(1)})!`, 4000);
            pet.hunger = Math.min(100, pet.hunger + 10);
            pet.fun = Math.min(100, pet.fun + 10);
            pet.energy = Math.min(100, pet.energy + 10);
        } else if (pet.level === 3 && pet.age >= pet.evolutionThresholds.elder) {
            pet.level = 4; // Evolui para Velho
            showGameMessage(`${pet.name} está envelhecendo e se tornou Velho.`, 4000);
            pet.hunger = Math.min(100, pet.hunger + 5);
            pet.fun = Math.min(100, pet.fun + 5);
            pet.energy = Math.min(100, pet.energy + 5);
        }

        // Lógica para doença (chance baseada no tempo, maior para velhos)
        const decayPerSecond = 1 / pet.ageIntervalSeconds; 
        let sickChancePerSecond = (pet.level === 4) ? 0.000005 : 0.000002; 
        
        if (pet.life < 30 && !pet.isSick && Math.random() < sickChancePerSecond) { 
            pet.isSick = true;
            showGameMessage(`${pet.name} parece doente! Use um remédio!`, 4000);
        }

        // Lógica de decadência de atributos
        const hungerDecayPerSecond = (pet.level === 4 ? 20 : 10) * decayPerSecond; 
        const funDecayPerSecond = (pet.level === 4 ? 15 : 8) * decayPerSecond;    
        const energyDecayPerSecond = (pet.level === 4 ? 10 : 5) * decayPerSecond;  
        const lifeDecayPerSecond = (pet.level === 4 ? 5 : 1) * decayPerSecond;     

        if (!pet.isSleeping && !pet.isEating && !pet.isBrincando) {
            pet.hunger = Math.max(0, pet.hunger - hungerDecayPerSecond);
            pet.fun = Math.max(0, pet.fun - funDecayPerSecond);
            pet.energy = Math.max(0, pet.energy - energyDecayPerSecond);
            
            if (pet.isSick) {
                pet.life = Math.max(0, pet.life - (lifeDecayPerSecond * 4)); 
            } else {
                pet.life = Math.max(0, pet.life - lifeDecayPerSecond);
            }

            if (pet.hunger < 10 || pet.fun < 10 || pet.energy < 10) { 
                pet.life = Math.max(0, pet.life - (lifeDecayPerSecond * 2));
            }
        }
        
        // Ganhos de atributos durante o sono
        if (pet.isSleeping) {
            pet.energy = Math.min(100, pet.energy + (10 * decayPerSecond)); 
            pet.life = Math.min(100, pet.life + (2 * decayPerSecond)); 
        }

        checkStatus(); 
        updateDisplay(); 

        // Condições de Morte
        if (pet.life <= 0) {
            pet.isAlive = false;
            showGameMessage(`Oh não! ${pet.name} não aguentou...`, 5000);
            updatePetImage(); 
            clearInterval(gameInterval); 
        } else if (pet.age >= pet.evolutionThresholds.death) { 
            pet.isAlive = false;
            showGameMessage(`Lamentável! ${pet.name} viveu uma vida plena e faleceu de velhice.`, 5000);
            updatePetImage();
            clearInterval(gameInterval);
        }
    }, 1000); // O loop roda a cada 1 segundo (1 "tick" real)
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
        hatchProgress: 0, 
        hatchTimerSeconds: 43200, // 12 horas em segundos (para o ovo chocar)
        eggWarmth: 100, // Novo: Aquecimento do ovo (0-100)
        age: 0, 
        ageCounter: 0, 
        ageIntervalSeconds: 3600, 
        evolutionThresholds: { 
            baby: 0.5,    
            child: 1.5,   
            adult: 3.5,   
            elder: 6.5,   
            death: 7.5    
        },
        adultType: 'padrao', 
        lastSaveTime: Date.now(), inventory: [], 
        mood: 'Esperando...', status: 'Em desenvolvimento', isBrincando: false
    };

    updateDisplay();
    showScreen(tamagotchiScreen);
    showGameMessage(`Um ovo foi colocado! Ele chocará em aproximadamente 12 horas. Cuide da temperatura dele!`, 3000);
    startGameLoop(); // Inicia o loop do jogo
}

function handleWarmEgg() {
    if (!pet.isEgg) { showGameMessage('Isso não é um ovo!', 1500); return; }
    if (!pet.isAlive) { showGameMessage('Não posso aquecer um ovo morto...', 1500); return; }

    if (pet.eggWarmth >= 95) {
        showGameMessage('O ovo já está bem aquecido!', 1500);
        return;
    }

    pet.eggWarmth = Math.min(100, pet.eggWarmth + 10); // Aumenta o aquecimento
    showGameMessage('Você está aquecendo o ovo...');
    updateDisplay();
}

function handleFeed() {
    if (pet.isEgg) { showGameMessage('O ovo não precisa ser alimentado!', 1500); return; }
    if (!pet.isAlive) { showGameMessage('Não posso alimentar um Tamagotchi morto...'); return; }
    if (pet.isSleeping) { showGameMessage(`${pet.name} está dormindo! Não o incomode.`); return; }
    if (pet.isSick) { showGameMessage(`${pet.name} está doente e não quer comer! Use um remédio.`); return; } 
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
    if (pet.isSick) { showGameMessage(`${pet.name} está doente e precisa de remédio, não de sono!`); return; } 

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
    if (pet.coins < 5) { showGameMessage('Você não tem moedas suficientes para o remédio! (Custa 5 moedas)', 2500); return; }

    showGameMessage(`Dando remédio para ${pet.name}...`); 
    disableActionButtons(true); 

    setTimeout(() => {
        pet.isSick = false; 
        pet.life = Math.min(100, pet.life + 15); 
        pet.coins = Math.max(0, pet.coins - 5); 
        showGameMessage(`${pet.name} tomou o remédio e se sente melhor! (-5 Moedas)`);
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
    rpsRockBtn.disabled = false;
    rpsPaperBtn.disabled = false;
    rpsScissorsBtn.disabled = false;
    rpsPlayAgainBtn.style.display = 'none';
    rpsBackToGamesBtn.style.display = 'none';
}

function playRPS(playerChoice) {
    rpsRockBtn.disabled = true;
    rpsPaperBtn.disabled = true;
    rpsScissorsBtn.disabled = true;

    const choices = ['pedra', 'papel', 'tesoura'];
    const tamagotchiChoice = choices[Math.floor(Math.random() * choices.length)];

    let result = '';
    let reward = 0;

    if (playerChoice === tamagotchiChoice) {
        result = `Empate! Tamagotchi escolheu ${tamagotchiChoice}.`;
        reward = 1; 
    } else if (
        (playerChoice === 'pedra' && tamagotchiChoice === 'tesoura') ||
        (playerChoice === 'papel' && tamagotchiChoice === 'pedra') ||
        (playerChoice === 'tesoura' && tamagotchiChoice === 'papel')
    ) {
        result = `Você Venceu! Tamagotchi escolheu ${tamagotchiChoice}.`;
        reward = 5;
        pet.fun = Math.min(100, pet.fun + 10); 
    } else {
        result = `Você Perdeu! Tamagotchi escolheu ${tamagotchiChoice}.`;
        reward = 0;
        pet.fun = Math.max(0, pet.fun - 5); 
    }

    pet.coins += reward;
    updateDisplay();
    rpsResult.textContent = result + ` Você ganhou ${reward} moedas!`;

    rpsPlayAgainBtn.style.display = 'block';
    rpsBackToGamesBtn.style.display = 'block';
}

// --- Jogo: Adivinhe o Número (Number Guessing) ---
function initNumberGuessingGame() {
    showSubGameScreen(numberGuessingGameScreen);
    secretNumber = Math.floor(Math.random() * 100) + 1; 
    attempts = 0;
    ngInstructions.textContent = 'Estou pensando em um número entre 1 e 100. Tente adivinhar!';
    ngGuessInput.value = '';
    ngResult.textContent = '';
    ngSubmitGuessBtn.disabled = false; 
    ngGuessInput.disabled = false; 
    ngPlayAgainBtn.style.display = 'none';
    ngBackToGamesBtn.style.display = 'none';
    console.log("Número secreto:", secretNumber); 
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
        const reward = Math.max(1, 15 - attempts); 
        pet.coins += reward;
        pet.fun = Math.min(100, pet.fun + 15);
        showGameMessage(`Você ganhou ${reward} moedas!`, 2000);
        updateDisplay();
        ngSubmitGuessBtn.disabled = true; 
        ngGuessInput.disabled = true; 
        ngPlayAgainBtn.style.display = 'block';
        ngBackToGamesBtn.style.display = 'block';
    } else if (guess < secretNumber) {
        ngResult.textContent = `Tente um número MAIOR. Tentativas: ${attempts}`;
    } else {
        ngResult.textContent = `Tente um número MENOR. Tentativas: ${attempts}`;
    }
    ngGuessInput.value = ''; 
}


// --- Jogo: Jogo da Velha (Tic Tac Toe) ---
const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
]; 

function initTicTacToeGame() {
    showSubGameScreen(ticTacToeGameScreen);
    ticTacToePlayAgainBtn.style.display = 'none'; 
    ticTacToeBackToGamesBtn.style.display = 'none'; 

    board = ['', '', '', '', '', '', '', '', '']; 
    currentPlayer = 'X'; 
    gameActive = true; 

    const cells = ticTacToeBoard.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        cell.textContent = ''; 
        cell.className = 'cell'; 
        cell.removeEventListener('click', handleCellClick);
        cell.addEventListener('click', handleCellClick); 
        cell.style.pointerEvents = 'auto'; 
    });

    ticTacToeStatus.textContent = `É a vez do Jogador ${currentPlayer}`;
}

function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

    if (board[clickedCellIndex] !== '' || !gameActive || currentPlayer !== 'X') {
        return;
    }

    board[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add(`player-${currentPlayer.toLowerCase()}`); 

    checkTicTacToeResult(); 

    if (gameActive && currentPlayer === 'O') {
        setTimeout(tamagotchiMove, 800); 
    }
}

function tamagotchiMove() {
    if (!gameActive) return;

    let bestMove = findBestMove(board, 'O'); 
    if (bestMove === -1) { 
        bestMove = findBestMove(board, 'X'); 
    }

    if (bestMove !== -1) {
        makeTicTacToeMove(bestMove, 'O');
    } else {
        let availableCells = [];
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                availableCells.push(i);
            }
        }
        if (availableCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableCells.length);
            makeTicTacToeMove(availableCells[randomIndex], 'O');
        }
    }
}

function findBestMove(currentBoard, player) {
    let opponent = (player === 'X') ? 'O' : 'X';

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (currentBoard[a] === player && currentBoard[b] === player && currentBoard[c] === '') return c;
        if (currentBoard[a] === player && currentBoard[c] === player && currentBoard[b] === '') return b;
        if (currentBoard[b] === player && currentBoard[c] === player && currentBoard[a] === '') return a;
    }

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (currentBoard[a] === opponent && currentBoard[b] === opponent && currentBoard[c] === '') return c;
        if (currentBoard[a] === opponent && currentBoard[c] === opponent && currentBoard[b] === '') return b;
        if (currentBoard[b] === opponent && currentBoard[c] === opponent && currentBoard[a] === '') return a;
    }

    if (currentBoard[4] === '') return 4;

    const corners = [0, 2, 6, 8];
    for (let i = 0; i < corners.length; i++) {
        if (currentBoard[corners[i]] === '') return corners[i];
    }

    const sides = [1, 3, 5, 7];
    for (let i = 0; i < sides.length; i++) {
        if (currentBoard[sides[i]] === '') return sides[i];
    }

    return -1; 
}

function makeTicTacToeMove(index, player) {
    board[index] = player;
    const cellElement = ticTacToeBoard.children[index];
    cellElement.textContent = player;
    cellElement.classList.add(`player-${player.toLowerCase()}`);
    checkTicTacToeResult();
}

function checkTicTacToeResult() {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = board[winCondition[0]];
        let b = board[winCondition[1]];
        let c = board[winCondition[2]];

        if (a === '' || b === '' || c === '') {
            continue; 
        }
        if (a === b && b === c) {
            roundWon = true;
            winningConditions[i].forEach(index => {
                ticTacToeBoard.children[index].classList.add('winning-cell');
            });
            break;
        }
    }

    if (roundWon) {
        ticTacToeStatus.textContent = `Jogador ${currentPlayer} Venceu!`;
        gameActive = false;
        disableTicTacToeCells();
        showGameReward(currentPlayer); 
        ticTacToePlayAgainBtn.style.display = 'block';
        ticTacToeBackToGamesBtn.style.display = 'block';
        return;
    }

    let roundDraw = !board.includes(''); 
    if (roundDraw) {
        ticTacToeStatus.textContent = 'Empate!';
        gameActive = false;
        disableTicTacToeCells();
        showGameReward('draw'); 
        ticTacToePlayAgainBtn.style.display = 'block';
        ticTacToeBackToGamesBtn.style.display = 'block';
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    ticTacToeStatus.textContent = `É a vez do Jogador ${currentPlayer}`;
}

function disableTicTacToeCells() {
    const cells = ticTacToeBoard.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.style.pointerEvents = 'none'; 
    });
}

function showGameReward(winner) {
    let reward = 0;
    let message = '';

    if (winner === 'X') { 
        reward = 10;
        pet.coins += reward;
        pet.fun = Math.min(100, pet.fun + 20);
        message = `Você ganhou ${reward} moedas!`;
    } else if (winner === 'O') { 
        reward = 2; 
        pet.coins += reward;
        pet.fun = Math.min(100, pet.fun + 5); 
        message = `Tamagotchi venceu, você ganhou ${reward} moedas.`;
    } else if (winner === 'draw') {
        reward = 5;
        pet.coins += reward;
        pet.fun = Math.min(100, pet.fun + 10);
        message = `Empate! Você ganhou ${reward} moedas.`;
    }
    updateDisplay();
    showGameMessage(message, 2500);
}


// --- Função de Inicialização do Jogo ---
function initializeGame() {
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

    // NOVOS ELEMENTOS DO OVO
    eggStatusGroup = getElement('eggStatusGroup');
    eggWarmthIcon = getElement('eggWarmthIcon');
    eggWarmthDisplay = getElement('eggWarmthDisplay');
    warmEggButton = getElement('warmEggButton');

    levelDisplay = getElement('nivel'); 
    coinsDisplay = getElement('moedas');

    feedButton = getElement('feedButton');
    playButton = getElement('playButton');
    sleepButton = getElement('sleepButton');
    shopButton = getElement('shopButton');
    inventoryButton = getElement('inventoryButton');
    gamesButton = getElement('gamesButton');
    vaccinateButton = getElement('vaccinateButton'); 

    shopScreen = getElement('shopScreen');
    shopItemsContainer = getElement('shopItems');
    shopBackButton = getElement('shopBackButton');

    inventoryScreen = getElement('inventoryScreen');
    inventoryItemsContainer = getElement('inventoryItems');
    inventoryBackButton = getElement('inventoryBackButton');

    gamesScreen = getElement('gamesScreen');
    gamesListContainer = getElement('gamesList'); 
    gamesBackButton = getElement('gamesBackButton');
    rockPaperScissorsBtn = getElement('rockPaperScissorsBtn'); 
    numberGuessingBtn = getElement('numberGuessingBtn');
    ticTacToeBtn = getElement('ticTacToeBtn');

    rpsGameScreen = getElement('rpsGame');
    rpsResult = getElement('rpsResult');
    rpsRockBtn = getElement('rpsRock');
    rpsPaperBtn = getElement('rpsPaper');
    rpsScissorsBtn = getElement('rpsScissors');
    rpsPlayAgainBtn = getElement('rpsPlayAgainBtn');
    rpsBackToGamesBtn = getElement('rpsBackToGamesBtn');

    numberGuessingGameScreen = getElement('numberGuessingGame');
    ngInstructions = getElement('ngInstructions');
    ngGuessInput = getElement('ngGuessInput');
    ngSubmitGuessBtn = getElement('ngSubmitGuessBtn');
    ngResult = getElement('ngResult');
    ngPlayAgainBtn = getElement('ngPlayAgainBtn');
    ngBackToGamesBtn = getElement('ngBackToGamesBtn');

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
        hatchProgress: 0, 
        hatchTimerSeconds: 43200, 
        eggWarmth: 100, // NOVO: Inicializa o aquecimento do ovo
        age: 0, 
        ageCounter: 0, 
        ageIntervalSeconds: 3600, 
        evolutionThresholds: { 
            baby: 0.5,    
            child: 1.5,   
            adult: 3.5,   
            elder: 6.5,   
            death: 7.5    
        },
        adultType: 'padrao', 
        lastSaveTime: Date.now(),
        inventory: [], 
        mood: 'Normal',
        status: 'Bem',
    };

    // --- Limpeza de Event Listeners Antigos (para evitar duplicações) ---
    // Remove o botão de reiniciar se ele existir de uma partida anterior
    const oldRestartBtn = getElement('restartButton');
    if (oldRestartBtn) oldRestartBtn.remove();

    if (startGameBtn) startGameBtn.removeEventListener('click', handleStartGame);
    if (feedButton) feedButton.removeEventListener('click', handleFeed);
    if (playButton) playButton.removeEventListener('click', handlePlay);
    if (sleepButton) sleepButton.removeEventListener('click', handleSleep);
    if (shopButton) shopButton.removeEventListener('click', handleShop);
    if (inventoryButton) inventoryButton.removeEventListener('click', handleInventory);
    if (gamesButton) gamesButton.removeEventListener('click', handleGames);
    if (vaccinateButton) vaccinateButton.removeEventListener('click', handleVaccinate);
    if (warmEggButton) warmEggButton.removeEventListener('click', handleWarmEgg); // NOVO

    if (shopBackButton) shopBackButton.removeEventListener('click', () => showScreen(tamagotchiScreen));
    if (inventoryBackButton) inventoryBackButton.removeEventListener('click', () => showScreen(tamagotchiScreen));
    if (gamesBackButton) gamesBackButton.removeEventListener('click', () => showScreen(tamagotchiScreen));
    
    if (rockPaperScissorsBtn) rockPaperScissorsBtn.removeEventListener('click', initRPSGame);
    if (numberGuessingBtn) numberGuessingBtn.removeEventListener('click', initNumberGuessingGame);
    if (ticTacToeBtn) ticTacToeBtn.removeEventListener('click', initTicTacToeGame);

    if (rpsRockBtn) rpsRockBtn.removeEventListener('click', () => playRPS('pedra'));
    if (rpsPaperBtn) rpsPaperBtn.removeEventListener('click', () => playRPS('papel'));
    if (rpsScissorsBtn) rpsScissorsBtn.removeEventListener('click', () => playRPS('tesoura'));
    if (rpsPlayAgainBtn) rpsPlayAgainBtn.removeEventListener('click', initRPSGame);
    if (rpsBackToGamesBtn) rpsBackToGamesBtn.removeEventListener('click', handleGames);

    if (ngSubmitGuessBtn) ngSubmitGuessBtn.removeEventListener('click', submitNumberGuess);
    if (ngPlayAgainBtn) ngPlayAgainBtn.removeEventListener('click', initNumberGuessingGame);
    if (ngBackToGamesBtn) ngBackToGamesBtn.removeEventListener('click', handleGames);

    if (ticTacToePlayAgainBtn) ticTacToePlayAgainBtn.removeEventListener('click', initTicTacToeGame);
    if (ticTacToeBackToGamesBtn) ticTacToeBackToGamesBtn.removeEventListener('click', handleGames);


    // --- Adição de Event Listeners ---
    if (startGameBtn) startGameBtn.addEventListener('click', handleStartGame);
    if (feedButton) feedButton.addEventListener('click', handleFeed);
    if (playButton) playButton.addEventListener('click', handlePlay);
    if (sleepButton) sleepButton.addEventListener('click', handleSleep);
    if (shopButton) shopButton.addEventListener('click', handleShop);
    if (inventoryButton) inventoryButton.addEventListener('click', handleInventory);
    if (gamesButton) gamesButton.addEventListener('click', handleGames);
    if (vaccinateButton) vaccinateButton.addEventListener('click', handleVaccinate);
    if (warmEggButton) warmEggButton.addEventListener('click', handleWarmEgg); // NOVO
    
    if (shopBackButton) shopBackButton.addEventListener('click', () => showScreen(tamagotchiScreen));
    if (inventoryBackButton) inventoryBackButton.addEventListener('click', () => showScreen(tamagotchiScreen));
    if (gamesBackButton) gamesBackButton.addEventListener('click', () => showScreen(tamagotchiScreen));
    
    if (rockPaperScissorsBtn) rockPaperScissorsBtn.addEventListener('click', initRPSGame);
    if (numberGuessingBtn) numberGuessingBtn.addEventListener('click', initNumberGuessingGame);
    if (ticTacToeBtn) ticTacToeBtn.addEventListener('click', initTicTacToeGame);

    if (rpsRockBtn) rpsRockBtn.addEventListener('click', () => playRPS('pedra'));
    if (rpsPaperBtn) rpsPaperBtn.addEventListener('click', () => playRPS('papel'));
    if (rpsScissorsBtn) rpsScissorsBtn.addEventListener('click', () => playRPS('tesoura'));
    if (rpsPlayAgainBtn) rpsPlayAgainBtn.addEventListener('click', initRPSGame);
    if (rpsBackToGamesBtn) rpsBackToGamesBtn.addEventListener('click', handleGames);

    if (ngSubmitGuessBtn) ngSubmitGuessBtn.addEventListener('click', submitNumberGuess);
    if (ngPlayAgainBtn) ngPlayAgainBtn.addEventListener('click', initNumberGuessingGame);
    if (ngBackToGamesBtn) ngBackToGamesBtn.addEventListener('click', handleGames);

    if (ticTacToePlayAgainBtn) ticTacToePlayAgainBtn.addEventListener('click', initTicTacToeGame);
    if (ticTacToeBackToGamesBtn) ticTacToeBackToGamesBtn.addEventListener('click', handleGames);
    
    console.log("Protocolo da URL:", window.location.protocol); 
    console.log("Nome do Repositório (configurado no JS):", GITHUB_REPO_NAME); 

    showScreen(startScreen); 
    updateDisplay(); 
}

document.addEventListener('DOMContentLoaded', initializeGame);
