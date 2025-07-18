// Garante que o script só rode depois que todo o HTML for carregado
document.addEventListener('DOMContentLoaded', () => {

    // --- Funções Auxiliares - DEFINIDAS NO INÍCIO E NO ESCOPO CORRETO ---
    // Esta função deve ser a primeira coisa definida dentro do DOMContentLoaded.
    function getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            // Logar um erro mais claro se o elemento não for encontrado
            console.error(`Erro: Elemento com ID "${id}" não encontrado no DOM. Verifique seu HTML e IDs.`);
        }
        return element;
    }

    function showGameMessage(message, duration = 3000) {
        const msgElement = getElement('gameMessage');
        if (msgElement) { // Verifica se msgElement foi encontrado
            msgElement.textContent = message;
            msgElement.classList.add('visible');
            setTimeout(() => {
                msgElement.classList.remove('visible');
            }, duration);
        }
    }

    // --- Referências aos Elementos HTML ---
    // Estas referências usam getElement, então getElement precisa estar definido antes.
    const startScreen = getElement('startScreen');
    const tamagotchiScreen = getElement('tamagotchiScreen');
    const petNameInput = getElement('petNameInput');
    const startGameBtn = getElement('startGameBtn');

    const petNameDisplay = getElement('petName');
    const moodDisplay = getElement('mood');
    const statusDisplay = getElement('status');
    const petImage = getElement('petImage'); // Agora é uma IMG

    const hungerIcon = getElement('hungerIcon');
    const funIcon = getElement('funIcon');
    const energyIcon = getElement('energyIcon');
    const lifeIcon = getElement('lifeIcon');

    const levelDisplay = getElement('nivel');
    const coinsDisplay = getElement('moedas');

    const feedButton = getElement('feedButton');
    const playButton = getElement('playButton');
    const sleepButton = getElement('sleepButton');
    const shopButton = getElement('shopButton');
    const inventoryButton = getElement('inventoryButton');
    const gamesButton = getElement('gamesButton');

    // --- Variáveis do Jogo ---
    // O objeto pet é inicializado aqui.
    let pet = {
        name: '',
        hunger: 100,
        fun: 100,
        energy: 100,
        life: 100,
        level: 0, // Nível 0 para ovo, Nível 1 para bebê, Nível 2 para criança
        coins: 0,
        isSleeping: false,
        isAlive: true,
        isEating: false,
        isEgg: true,
        hatchProgress: 0,
        hatchTimer: 60, // Tempo em segundos para o ovo chocar
        ageProgress: 0, // Progresso da idade para evolução
        ageToChild: 120, // Tempo em segundos para evoluir para criança (2 minutos)
        lastSaveTime: Date.now(),
        inventory: [],
        mood: 'Normal',
        status: 'Bem',
        isBrincando: false
    };

    let gameInterval; // Variável para o loop principal do jogo

    // --- Lógica de Exibição de Telas ---
    function hideAllScreens() {
        // Verifica se os elementos existem antes de tentar esconder
        if (startScreen) startScreen.style.display = 'none';
        if (tamagotchiScreen) tamagotchiScreen.style.display = 'none';
        // Se tiver outras telas (Game Over, Loja, etc.), esconda-as aqui também.
        // Ex: if (gameOverScreen) gameOverScreen.style.display = 'none';
    }

    function showScreen(screenElement) {
        hideAllScreens(); // Esconde tudo primeiro
        if (screenElement) { // Garante que o elemento foi encontrado
            screenElement.style.display = 'flex'; // Mostra a tela desejada
        }
    }

    // --- Lógica de Atualização do Display ---
    function updateDisplay() {
        // Nome do pet só aparece depois que chocar (pet.level > 0)
        if (petNameDisplay) petNameDisplay.textContent = pet.level > 0 ? `Nome: ${pet.name}` : 'Nome: ???';
        
        if (moodDisplay) moodDisplay.textContent = `Humor: ${pet.mood}`;
        if (statusDisplay) statusDisplay.textContent = `Status: ${pet.status}`;
        
        // Verifica se levelDisplay e coinsDisplay existem antes de usar
        if (levelDisplay) levelDisplay.textContent = pet.level;
        if (coinsDisplay) coinsDisplay.textContent = pet.coins;
        
        updatePetImage(); // Esta função agora lida com imagens
        updateStatusIcons();
    }

    function updateStatusIcons() {
        // Verifica se os ícones existem antes de manipular suas classes
        const icons = [hungerIcon, funIcon, energyIcon, lifeIcon];
        
        if (pet.isEgg) {
            icons.forEach(icon => { if (icon) icon.classList.add('hidden'); });
            return;
        }

        // Fome
        if (hungerIcon) {
            if (pet.hunger < 40) { hungerIcon.classList.remove('hidden'); hungerIcon.classList.toggle('blinking', pet.hunger < 20); }
            else { hungerIcon.classList.add('hidden'); hungerIcon.classList.remove('blinking'); }
        }

        // Diversão
        if (funIcon) {
            if (pet.fun < 40) { funIcon.classList.remove('hidden'); funIcon.classList.toggle('blinking', pet.fun < 20); }
            else { funIcon.classList.add('hidden'); funIcon.classList.remove('blinking'); }
        }

        // Energia
        if (energyIcon) {
            if (pet.energy < 40) { energyIcon.classList.remove('hidden'); energyIcon.classList.toggle('blinking', pet.energy < 20); }
            else { energyIcon.classList.add('hidden'); energyIcon.classList.remove('blinking'); }
        }

        // Vida
        if (lifeIcon) {
            if (pet.life < 50) { lifeIcon.classList.remove('hidden'); lifeIcon.classList.toggle('blinking', pet.life < 20); }
            else { lifeIcon.classList.add('hidden'); lifeIcon.classList.remove('blinking'); }
        }
    }

    // Função para gerenciar a eclosão (com imagens de ovo)
    function hatchEgg() {
        if (!petImage) return; // Garante que o elemento img#petImage foi encontrado

        // Estágios do ovo baseados no progresso
        if (pet.hatchProgress < 33) {
            petImage.src = 'imgs/ovo.gif';
            showGameMessage(`O ovo está quietinho...`);
        } else if (pet.hatchProgress < 66) {
            petImage.src = 'imgs/ovo.rachando.gif';
            showGameMessage(`O ovo está rachando!`, 1500);
        } else if (pet.hatchProgress < 100) {
            petImage.src = 'imgs/ovo.quebrado.gif';
            showGameMessage(`Está quase!`);
        } else { // Chocou!
            pet.isEgg = false;
            pet.level = 1; // Nível 1: Bebê
            showGameMessage(`${pet.name} chocou! Bem-vindo(a) ao mundo!`, 3000);
            
            petImage.src = 'imgs/bebe.gif'; 
            disableActionButtons(false); // Habilita os botões após chocar
            
            clearInterval(gameInterval); // Para o intervalo do ovo
            startGameLoop(); // Inicia o loop normal do Tamagotchi
            return;
        }
        disableActionButtons(true); // Botões desabilitados enquanto é ovo
    }

    // Função para obter o caminho da imagem com base no estado e nível
    function getPetImagePath(currentPet) {
        let baseDir = 'imgs/';
        let prefix = currentPet.level === 1 ? 'bebe.' : 'crianca.'; // Prefixo baseado no nível
        let suffix = '.gif'; // Assumindo GIFs para a maioria das animações

        // Lógica de prioridade para as imagens
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

    // Atualiza a imagem do Tamagotchi e gerencia os botões
    function updatePetImage() {
        if (!petImage) return; // Garante que o elemento img#petImage foi encontrado

        if (pet.isEgg) {
            hatchEgg(); // Gerencia as imagens do ovo
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
            disableActionButtons(true);
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
            disableActionButtons(true);
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
        // Resetar todas as variáveis do pet para o estado inicial de ovo
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
        // Remove o botão de reiniciar se ele existir
        const restartBtn = document.getElementById('restartButton');
        if (restartBtn) restartBtn.remove();
        // Volta para a tela inicial
        initializeGame();
    }

    function checkStatus() {
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

    // --- Event Listeners dos Botões de Ação ---

    if (startGameBtn) { // Verifica se o botão "Começar" existe
        startGameBtn.addEventListener('click', () => {
            if (petNameInput) { // Verifica se o campo de nome existe
                const nameValue = petNameInput.value.trim();
                if (nameValue === "") {
                    alert('Por favor, dê um nome ao seu Tamagotchi!');
                    return;
                }
                pet.name = nameValue; // Define o nome do pet
                
                // Reinicializa todas as variáveis do pet para um novo jogo
                pet.hunger = 100;
                pet.fun = 100;
                pet.energy = 100;
                pet.life = 100;
                pet.level = 0; // Começa como ovo (nível 0)
                pet.coins = 0;
                pet.isSleeping = false;
                pet.isAlive = true;
                pet.isEating = false;
                pet.isEgg = true;
                pet.hatchProgress = 0;
                pet.ageProgress = 0;
                pet.mood = 'Esperando...';
                pet.status = 'Em desenvolvimento';
                pet.isBrincando = false;

                updateDisplay(); // Chama para exibir o ovo
                showScreen(tamagotchiScreen); // Muda para a tela do Tamagotchi
                showGameMessage(`Um ovo foi colocado! Cuide bem dele.`, 3000);
                startGameLoop(); // Inicia o loop de jogo (com a lógica do ovo)
            }
        });
    }

    // Botão Alimentar
    if (feedButton) {
        feedButton.addEventListener('click', () => {
            // Verificações de estado antes de permitir a ação
            if (pet.isEgg) { showGameMessage('O ovo não precisa ser alimentado!', 1500); return; }
            if (!pet.isAlive) { showGameMessage('Não posso alimentar um Tamagotchi morto...'); return; }
            if (pet.isSleeping) { showGameMessage(`${pet.name} está dormindo! Não o incomode.`); return; }
            if (pet.hunger > 90) { showGameMessage(`${pet.name} não está com tanta fome.`); return; }

            pet.isEating = true; // Define o estado de comendo
            updatePetImage(); // Atualiza a imagem para a de "comendo"
            showGameMessage(`${pet.name} está comendo!`);
            disableActionButtons(true); // Desabilita botões durante a ação

            setTimeout(() => {
                pet.hunger = Math.min(100, pet.hunger + 15);
                pet.energy = Math.min(100, pet.energy + 5);
                pet.isEating = false; // Volta ao estado normal
                updatePetImage(); // Atualiza a imagem para o estado normal
                updateDisplay(); // Atualiza os status na tela
                showGameMessage(`${pet.name} comeu e está mais satisfeito.`);
            }, 1500); // Duração da animação de comer
        });
    }

    // Botão Brincar
    if (playButton) {
        playButton.addEventListener('click', () => {
            if (pet.isEgg) { showGameMessage('O ovo não sabe brincar!', 1500); return; }
            if (!pet.isAlive) { showGameMessage('Não posso brincar com um Tamagotchi morto...'); return; }
            if (pet.isSleeping) { showGameMessage(`${pet.name} está dormindo! Não o incomode.`); return; }
            if (pet.energy < 20) { showGameMessage(`${pet.name} está muito cansado para brincar.`); return; }
            if (pet.fun > 90) { showGameMessage(`${pet.name} já está se divertindo o bastante.`); return; }

            pet.isBrincando = true; // Define o estado de brincando
            updatePetImage(); // Atualiza a imagem para a de "brincando"
            showGameMessage(`${pet.name} está brincando!`);
            disableActionButtons(true); // Desabilita botões durante a ação

            setTimeout(() => {
                pet.fun = Math.min(100, pet.fun + 20);
                pet.energy = Math.max(0, pet.energy - 10);
                pet.hunger = Math.max(0, pet.hunger - 5);
                pet.coins += 1;
                pet.isBrincando = false; // Volta ao estado normal
                updatePetImage(); // Atualiza a imagem para o estado normal
                updateDisplay(); // Atualiza os status na tela
                showGameMessage(`${pet.name} se divertiu muito! (+1 Moeda)`);
            }, 2000); // Duração da animação de brincar
        });
    }

    // Botão Dormir
    if (sleepButton) {
        sleepButton.addEventListener('click', () => {
            if (pet.isEgg) { showGameMessage('O ovo não precisa dormir!', 1500); return; }
            if (!pet.isAlive) { showGameMessage('Não posso fazer um Tamagotchi morto dormir...'); return; }
            if (pet.isSleeping) { showGameMessage(`${pet.name} já está dormindo.`); return; }

            pet.isSleeping = true;
            updatePetImage();
            showGameMessage(`${pet.name} foi dormir... Zzzzz`);
            updateDisplay();
        });
    }

    // Outros botões (com as mesmas verificações de ovo/morte/sono)
    if (shopButton) {
        shopButton.addEventListener('click', () => {
            if (pet.isEgg) { showGameMessage('A loja não vende itens para ovos!', 1500); return; }
            if (!pet.isAlive) { showGameMessage('A loja não atende fantasmas...'); return; }
            if (pet.isSleeping) { showGameMessage(`${pet.name} está dormindo! Não o incomode.`); return; }
            if (pet.isEating || pet.isBrincando) { showGameMessage(`${pet.name} está ocupado!`); return; }
            showGameMessage('A loja ainda está fechada!');
        });
    }
    if (inventoryButton) {
        inventoryButton.addEventListener('click', () => {
            if (pet.isEgg) { showGameMessage('Ovo não tem inventário!', 1500); return; }
            if (!pet.isAlive) { showGameMessage('Fantasmas não precisam de inventário...'); return; }
            if (pet.isSleeping) { showGameMessage(`${pet.name} está dormindo! Não o incomode.`); return; }
            if (pet.isEating || pet.isBrincando) { showGameMessage(`${pet.name} está ocupado!`); return; }
            showGameMessage('Seu inventário está vazio!');
        });
    }
    if (gamesButton) {
        gamesButton.addEventListener('click', () => {
            if (pet.isEgg) { showGameMessage('Ovo não joga!', 1500); return; }
            if (!pet.isAlive) { showGameMessage('Fantasmas não jogam...'); return; }
            if (pet.isSleeping) { showGameMessage(`${pet.name} está dormindo! Não o incomode.`); return; }
            if (pet.isEating || pet.isBrincando) { showGameMessage(`${pet.name} está ocupado!`); return; }
            showGameMessage('Os jogos ainda não estão disponíveis!');
            // Para mostrar a tela de jogos, você adicionaria: showScreen(gamesScreen);
        });
    }

    // Chama a função de inicialização quando o DOM estiver completamente carregado
    initializeGame();
});