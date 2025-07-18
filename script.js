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
// Definidas no escopo global para serem acessíveis por todo o script.
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
    // Adicione outras telas que você possa ter (ex: gameOverScreen.style.display = 'none';)
}

function showScreen(screenElement) {
    hideAllScreens();
    if (screenElement) {
        screenElement.style.display = 'flex';
    }
}

// Função para obter o caminho da imagem com base no estado e nível
function getPetImagePath(currentPet) {
    // ATENÇÃO CRÍTICA: SUBSTITUA 'meu-tamagotchi' pelo NOME EXATO do seu repositório GitHub!
    // Ex: Se o seu repositório for 'tamagotchi-game', use 'tamagotchi-game' (sem as barras)
    const GITHUB_REPO_NAME = 'meu-tamagotchi'; // <<< ALTERAR APENAS ESTA STRING!

    let baseDir;
    // Verifica se estamos no ambiente local (file://) ou no GitHub Pages (http/https)
    if (window.location.protocol === 'file:') {
        // Para ambiente LOCAL: O caminho é relativo à pasta do script
        baseDir = './imgs/';
    } else {
        // Para GitHub Pages: Construa o caminho completo usando o nome do repositório
        // Isso resolve o erro 404 pois ele vai procurar em /meu-tamagotchi/imgs/
        baseDir = `/${GITHUB_REPO_NAME}/imgs/`; 
    }

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
    return baseDir + prefix.slice(0, -1) + suffix; // Remove o '.' extra do prefixo
}

// Lógica de Atualização do Display
function updateDisplay() {
    // Garantir que os elementos existem antes de tentar acessá-los
    if (petNameDisplay) petNameDisplay.textContent = pet.level > 0 ? `Nome: ${pet.name}` : 'Nome: ???';
    if (moodDisplay) moodDisplay.textContent = `Humor: ${pet.mood}`;
    if (statusDisplay) statusDisplay.textContent = `Status: ${pet.status}`;
    
    if (levelDisplay) levelDisplay.textContent = pet.level;
    if (coinsDisplay) coinsDisplay.textContent = pet.coins;
    
    updatePetImage(); // Atualiza a imagem com base no estado atual do pet
    updateStatusIcons();
}

function updateStatusIcons() {
    const icons = [hungerIcon, funIcon, energyIcon, lifeIcon];
    
    // Esconde ícones se o pet for um ovo
    if (pet.isEgg) {
        icons.forEach(icon => { if (icon) icon.classList.add('hidden'); });
        return;
    }

    // Mostra/esconde e pisca ícones com base nos status do pet
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
    if (!petImage) return; // Garante que petImage foi carregado

    if (pet.hatchProgress < 33) {
        petImage.src = getPetImagePath({ isEgg: true, level: 0, type: 'ovo' });
        showGameMessage(`O ovo está quietinho...`);
    } else if (pet.hatchProgress < 66) {
        petImage.src = getPetImagePath({ isEgg: true, level: 0, type: 'ovo.rachando' });
        showGameMessage(`O ovo está rachando!`, 1500);
    } else if (pet.hatchProgress < 100) {
        petImage.src = getPetImagePath({ isEgg: true, level: 0, type: 'ovo.quebrado' });
        showGameMessage(`Está quase!`);
    } else { // Chocou!
        pet.isEgg = false;
        pet.level = 1; // Nível 1: Bebê
        showGameMessage(`${pet.name} chocou! Bem-vindo(a) ao mundo!`, 3000);
        
        petImage.src = getPetImagePath(pet); // Define a imagem do bebê imediatamente
        disableActionButtons(false); // Habilita os botões após chocar
        
        clearInterval(gameInterval); // Para o intervalo do ovo
        startGameLoop(); // Inicia o loop normal do Tamagotchi
        return;
    }
    disableActionButtons(true); // Botões desabilitados enquanto é ovo
}

// Atualiza a imagem do Tamagotchi e gerencia os botões de ação
function updatePetImage() {
    if (!petImage) return; // Garante que petImage foi carregado

    if (pet.isEgg) {
        hatchEgg(); // Gerencia as imagens do ovo e a transição
        return;
    }

    petImage.src = getPetImagePath(pet); // Define a imagem com base no estado e nível

    // Lógica de desabilitar/habilitar botões e gerenciar o botão "Acordar" / "Recomeçar"
    const wakeBtn = document.getElementById('wakeUpButton');
    const restartBtn = document.getElementById('restartButton');

    // Remove o botão de acordar se não estiver dormindo
    if (wakeBtn && !pet.isSleeping) {
        wakeBtn.remove();
    }

    if (!pet.isAlive) {
        disableActionButtons(true); // Desabilita todos os botões se o pet estiver morto
        if (!restartBtn) { // Adiciona o botão "Recomeçar Jogo" se não existir
            const newRestartBtn = document.createElement('button');
            newRestartBtn.id = 'restartButton';
            newRestartBtn.textContent = 'Recomeçar Jogo';
            newRestartBtn.addEventListener('click', restartGame);
            getElement('actions').appendChild(newRestartBtn);
        }
    } else if (pet.isSleeping) {
        if (!wakeBtn) { // Adiciona o botão de acordar se não existir
            const newWakeBtn = document.createElement('button');
            newWakeBtn.id = 'wakeUpButton';
            newWakeBtn.textContent = 'Acordar';
            newWakeBtn.addEventListener('click', wakeUpPet);
            getElement('actions').appendChild(newWakeBtn);
        }
        disableActionButtons(true); // Desabilita outros botões enquanto dorme
        if (getElement('wakeUpButton')) { // Garante que o botão existe antes de tentar habilitar
            getElement('wakeUpButton').disabled = false; // Habilita apenas o botão de acordar
        }
        if (restartBtn) restartBtn.remove(); // Remove o botão de reiniciar se o pet estiver dormindo
    } else if (pet.isEating || pet.isBrincando) {
        disableActionButtons(true); // Desabilita outros botões enquanto comendo ou brincando
        if (restartBtn) restartBtn.remove(); // Remove o botão de reiniciar
    } else {
        disableActionButtons(false); // Habilita os botões normais
        if (restartBtn) restartBtn.remove(); // Remove o botão de reiniciar
    }
}

function disableActionButtons(shouldDisable) {
    // Adiciona uma verificação se o botão existe antes de tentar desabilitar
    const buttons = [feedButton, playButton, sleepButton, shopButton, inventoryButton, gamesButton];
    buttons.forEach(button => {
        if (button) button.disabled = shouldDisable;
    });
}

function wakeUpPet() {
    if (pet.isSleeping) {
        pet.isSleeping = false;
        showGameMessage(`${pet.name} acordou!`);
        updatePetImage(); // Atualiza para o estado normal do pet
        updateDisplay();
    }
}

function restartGame() {
    clearInterval(gameInterval); // Limpa o intervalo do jogo atual
    // Chama initializeGame para redefinir o estado do jogo e a tela de início
    initializeGame();
}

function checkStatus() {
    // Garante que pet está definido antes de acessar suas propriedades
    if (!pet || typeof pet.isEgg === 'undefined') return; 

    if (pet.isEgg) {
        pet.mood = 'Esperando...';
        pet.status = 'Em desenvolvimento';
        return;
    }
    
    // Lógica de humor
    if (pet.hunger < 30 || pet.fun < 30 || pet.energy < 30) {
        pet.mood = 'Triste';
    } else if (pet.hunger > 80 && pet.fun > 80 && pet.energy > 80) {
        pet.mood = 'Radiante';
    } else {
        pet.mood = 'Normal';
    }

    // Lógica de status (ordem de prioridade importa)
    if (!pet.isAlive) {
        pet.status = 'Morto';
    } else if (pet.isSleeping) {
        pet.status = 'Dormindo';
    } else if (pet.isEating) {
        pet.status = 'Comendo';
    } else if (pet.isBrincando) {
        pet.status = 'Brincando';
    } else if (pet.life < 50) { // Doente
        pet.status = 'Doente';
    } else if (pet.energy < 20) { // Cansado
        pet.status = 'Cansado';
    } else {
        pet.status = 'Bem';
    }
}

function startGameLoop() {
    if (gameInterval) clearInterval(gameInterval); // Limpa qualquer intervalo anterior
    gameInterval = setInterval(() => {
        // Adiciona uma verificação para garantir que 'pet' está definido
        if (!pet || typeof pet.isEgg === 'undefined') {
            clearInterval(gameInterval); // Se pet não está definido, para o loop
            console.error("Objeto 'pet' não definido, parando game loop.");
            return;
        }

        if (pet.isEgg) {
            pet.hatchProgress += (100 / pet.hatchTimer);
            if (pet.hatchProgress >= 100) {
                pet.hatchProgress = 100;
                hatchEgg(); // Chama a eclosão quando o progresso chega a 100
            }
            updateDisplay();
            return; // Não executa a lógica de decadência enquanto for ovo
        }

        // Lógica de evolução do Tamagotchi (de bebê para criança)
        if (pet.isAlive && pet.level === 1 && pet.ageProgress < pet.ageToChild) {
            pet.ageProgress++;
            if (pet.ageProgress >= pet.ageToChild) {
                pet.level = 2; // Evolui para criança
                showGameMessage(`${pet.name} evoluiu para Criança!`, 4000);
                // Opcional: Resetar alguns status ou dar um bônus na evolução
                pet.hunger = Math.min(100, pet.hunger + 10);
                pet.fun = Math.min(100, pet.fun + 10);
                pet.energy = Math.min(100, pet.energy + 10);
            }
        }

        // Lógica principal do jogo (decadência de status, morte)
        if (pet.isAlive) {
            // Diminui os atributos apenas se não estiver dormindo, comendo ou brincando
            if (!pet.isSleeping && !pet.isEating && !pet.isBrincando) {
                pet.hunger = Math.max(0, pet.hunger - 1);
                pet.fun = Math.max(0, pet.fun - 1);
                pet.energy = Math.max(0, pet.energy - 0.5);
                pet.life = Math.max(0, pet.life - 0.2);

                // Se qualquer atributo crítico chegar a zero, a vida diminui mais rápido
                if (pet.hunger === 0 || pet.fun === 0 || pet.energy === 0) {
                    pet.life = Math.max(0, pet.life - 1);
                }
            }
            
            checkStatus(); // Atualiza humor e status
            updateDisplay(); // Atualiza a interface

            if (pet.life === 0) {
                pet.isAlive = false;
                showGameMessage(`Oh não! ${pet.name} não aguentou...`, 5000);
                updatePetImage(); // Para mostrar a imagem de morto
                clearInterval(gameInterval); // Para o loop do jogo
            }
        } else if (pet.isSleeping) {
            // Recupera energia e vida quando dormindo
            pet.energy = Math.min(100, pet.energy + 2);
            pet.life = Math.min(100, pet.life + 0.5);
            checkStatus();
            updateDisplay();
        }
    }, 1000); // Roda a cada 1 segundo
}

// --- Handlers de Eventos dos Botões (separados para clareza) ---
function handleStartGame() {
    const nameValue = petNameInput ? petNameInput.value.trim() : '';
    if (nameValue === "") {
        alert('Por favor, dê um nome ao seu Tamagotchi!');
        return;
    }
    
    // Reinicializa pet para um novo jogo (importante para "Recomeçar")
    pet = {
        name: nameValue, // Usa o nome inserido
        hunger: 100, fun: 100, energy: 100, life: 100,
        level: 0, coins: 0, // Inicia como ovo (level 0)
        isSleeping: false, isAlive: true, isEating: false, isEgg: true,
        hatchProgress: 0, hatchTimer: 60, // 60 segundos para chocar
        ageProgress: 0, ageToChild: 120, // 120 segundos para evoluir de bebê para criança
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
        level: 0, // 0 para ovo
        coins: 0,
        isSleeping: false,
        isAlive: true,
        isEating: false,
        isEgg: true,
        hatchProgress: 0,
        hatchTimer: 60, // 60 segundos para chocar
        ageProgress: 0,
        ageToChild: 120, // 120 segundos para evoluir de bebê para criança
        lastSaveTime: Date.now(),
        inventory: [],
        mood: 'Normal',
        status: 'Bem',
        isBrincando: false
    };

    // Remove event listeners antigos antes de adicionar novos para evitar duplicações
    // (Importante ao reiniciar o jogo)
    if (startGameBtn) startGameBtn.removeEventListener('click', handleStartGame);
    if (feedButton) feedButton.removeEventListener('click', handleFeed);
    if (playButton) playButton.removeEventListener('click', handlePlay);
    if (sleepButton) sleepButton.removeEventListener('click', handleSleep);
    if (shopButton) shopButton.removeEventListener('click', handleShop);
    if (inventoryButton) inventoryButton.removeEventListener('click', handleInventory);
    if (gamesButton) gamesButton.removeEventListener('click', handleGames);

    // Adiciona event listeners (agora as funções de handler separadas)
    if (startGameBtn) startGameBtn.addEventListener('click', handleStartGame);
    if (feedButton) feedButton.addEventListener('click', handleFeed);
    if (playButton) playButton.addEventListener('click', handlePlay);
    if (sleepButton) sleepButton.addEventListener('click', handleSleep);
    if (shopButton) shopButton.addEventListener('click', handleShop);
    if (inventoryButton) inventoryButton.addEventListener('click', handleInventory);
    if (gamesButton) gamesButton.addEventListener('click', handleGames);
    
    showScreen(startScreen); // Inicia na tela de nome
    updateDisplay(); // Atualiza o display inicial (mostrará o ovo na imagem padrão)
}


// Garante que o script só rode depois que todo o HTML for carregado
document.addEventListener('DOMContentLoaded', initializeGame);
