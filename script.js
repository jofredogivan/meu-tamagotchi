let nome = "";
let moedas = 20;
let fome = 50, diversao = 50, energia = 50, vida = 100, xp = 0, nivel = 1;
let inventario = [];
let tickInterval;
let isSleeping = false; // Variável para controlar o sono
let sleepStartTime = 0; // Para armazenar quando ele começou a dormir

function iniciarJogo() {
  nome = document.getElementById("inputNome").value || "Tamagotchi";
  document.getElementById("nome").innerText = nome;
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("tamagotchi").style.display = "block";
  atualizarTudo();
  tickInterval = setInterval(tick, 60000); // Atualiza a cada 1 minuto
  atualizarBotoesAcao(); // Garante que os botões são atualizados no início
}

function atualizarTudo() {
  atualizarBarras();
  atualizarImagem();
  document.getElementById("moedas").innerText = moedas;
  document.getElementById("nivel").innerText = nivel;
  atualizarBotoesAcao(); // Sempre atualiza o estado dos botões ao atualizar o jogo
}

function atualizarBarras() {
  document.getElementById("fome").value = fome;
  document.getElementById("diversao").value = diversao;
  document.getElementById("energia").value = energia;
  document.getElementById("vida").value = vida;
}

function atualizarImagem() {
  const img = document.getElementById("petImage");

  if (vida <= 0) {
    img.src = "imgs/morto.png";
    document.getElementById("status").innerText = "Seu Tamagotchi se foi... 😢";
    clearInterval(tickInterval);
    return;
  }

  // Se estiver dormindo, mantém a imagem de dormindo
  if (isSleeping) {
    // Você pode ter imagens específicas para criança/adulto dormindo aqui
    img.src = "imgs/bebe.dormindo.gif";
    return;
  }

  // Lógica de imagem normal (bebe, crianca, adulto)
  if (nivel < 3) {
    img.src = "imgs/bebe.gif";
  } else if (nivel < 6) {
    img.src = "imgs/crianca.png";
  } else {
    let forma = localStorage.getItem("formaAdulta");
    if (!forma) {
      const opcoes = ["guerreiro", "preguica", "artista", "tech"];
      forma = opcoes[Math.floor(Math.random() * opcoes.length)];
      localStorage.setItem("formaAdulta", forma);
    }
    img.src = `imgs/adulto_${forma}.png`;
  }
}

function alimentar() {
  if (isSleeping || document.getElementById("gameVelha").style.display === "block") return;
  
  const img = document.getElementById("petImage");
  fome = Math.min(fome + 20, 100);
  xp += 5;

  img.src = "imgs/bebe.comendo.gif";
  atualizarBarras();
  document.getElementById("moedas").innerText = moedas;
  document.getElementById("nivel").innerText = nivel;

  setTimeout(() => {
    atualizarImagem();
  }, 4000);
}

function brincar() {
  if (isSleeping || document.getElementById("gameVelha").style.display === "block") return;
  
  diversao = Math.min(diversao + 20, 100);
  xp += 5;
  atualizarTudo();
}

function dormir() {
  if (isSleeping || document.getElementById("gameVelha").style.display === "block") return; // Já está dormindo ou jogando
  
  isSleeping = true;
  sleepStartTime = new Date().getTime();
  document.getElementById("status").innerText = "Seu Tamagotchi está dormindo... Zzz";
  atualizarTudo(); // Atualiza imagem para dormindo e desabilita botões
}

function acordar() {
  if (!isSleeping) return; // Não está dormindo
  
  isSleeping = false;
  document.getElementById("status").innerText = "Seu Tamagotchi acordou!";
  atualizarTudo(); // Volta para a imagem normal e habilita botões
}

function tick() {
  const agora = new Date();
  const hora = agora.getHours();

  if (isSleeping) {
    energia = Math.min(energia + 5, 100); // Aumenta energia enquanto dorme
    const tempoDormido = agora.getTime() - sleepStartTime;
    const seisHorasEmMs = 6 * 60 * 60 * 1000; // 6 horas em milissegundos

    if (tempoDormido >= seisHorasEmMs) {
      acordar(); // Acorda automaticamente após 6 horas
    } else {
      // Apenas atualiza barras enquanto dorme, sem outras perdas
      atualizarBarras();
    }
    return; // Sai da função tick para não aplicar outras reduções enquanto dorme
  } else {
    // Sono natural entre 22h e 6h (se não estiver dormindo forçadamente)
    if (hora >= 22 || hora < 6) {
      energia = Math.min(energia + 5, 100);
      document.getElementById("status").innerText = "Seu Tamagotchi está com sono.";
    } else {
      energia = Math.max(energia - 1, 0);
      // Mantém o status customizado se houver (por exemplo, de level up)
      if (!document.getElementById("status").innerText.includes("nível") && !document.getElementById("status").innerText.includes("divertiu") && !document.getElementById("status").innerText.includes("venceu") && !document.getElementById("status").innerText.includes("empate")) {
        document.getElementById("status").innerText = "";
      }
    }
  }

  // Fome a cada 3 horas (em hora cheia)
  if (agora.getMinutes() === 0 && hora % 3 === 0) {
    fome = Math.max(fome - 5, 0);
  }

  diversao = Math.max(diversao - 1, 0);

  if (fome < 30 || diversao < 30 || energia < 30) {
    vida = Math.max(vida - 1, 0);
  } else {
    vida = Math.min(vida + 1, 100);
  }

  if (xp >= nivel * 20) {
    xp = 0;
    nivel++;
    localStorage.removeItem("formaAdulta");
    document.getElementById("status").innerText = `${nome} subiu para o nível ${nivel}!`;
  }

  atualizarTudo();
}

// NOVO: Função centralizada para controlar o estado dos botões
function atualizarBotoesAcao() {
    const botoes = document.querySelectorAll('#actions button');
    const isGameVelhaActive = document.getElementById("gameVelha").style.display === "block";

    botoes.forEach(btn => {
        // O botão de Resetar está sempre habilitado
        if (btn.id === "resetButton") {
            btn.disabled = false;
            return; // Pula para o próximo botão
        }

        // Se o Jogo da Velha estiver ativo, desabilita todos os outros botões
        if (isGameVelhaActive) {
            btn.disabled = true;
            // Esconde o botão "Acordar" se o jogo estiver ativo, pois não é relevante
            if (btn.id === "acordarButton") {
                btn.style.display = "none";
            }
            return; // Pula para o próximo botão
        }

        // Lógica para quando o Jogo da Velha NÃO está ativo
        if (isSleeping) {
            // Se estiver dormindo, apenas o botão "Acordar" deve estar habilitado e visível
            if (btn.id === "acordarButton") {
                btn.style.display = "inline-block";
                btn.disabled = false;
            } else {
                // Todos os outros botões (exceto reset) são desabilitados, mas visíveis
                btn.style.display = "inline-block"; // Garante que estejam visíveis
                btn.disabled = true;
            }
        } else {
            // Se não estiver dormindo, o botão "Acordar" é escondido e os outros são habilitados
            if (btn.id === "acordarButton") {
                btn.style.display = "none";
            } else {
                // Todos os outros botões (exceto reset) são habilitados e visíveis
                btn.style.display = "inline-block"; // Garante que estejam visíveis
                btn.disabled = false;
            }
        }
    });
}


function abrirLoja() {
  if (isSleeping || document.getElementById("gameVelha").style.display === "block") return;
  document.getElementById("loja").style.display = "block";
}

function fecharLoja() {
  document.getElementById("loja").style.display = "none";
}

function abrirInventario() {
  if (isSleeping || document.getElementById("gameVelha").style.display === "block") return;
  const lista = document.getElementById("itens");
  lista.innerHTML = "";
  inventario.forEach((item, i) => {
    const li = document.createElement("li");
    li.innerText = `${item} `;
    const btn = document.createElement("button");
    btn.innerText = "Usar";
    btn.onclick = () => usarItem(i);
    li.appendChild(btn);
    lista.appendChild(li);
  });
  document.getElementById("inventario").style.display = "block";
}

function fecharInventario() {
  document.getElementById("inventario").style.display = "none";
}

function comprar(item) {
  const precos = { pao: 10, suco: 15, bola: 20, urso: 25 };
  if (moedas >= precos[item]) {
    moedas -= precos[item];
    inventario.push(item);
    atualizarTudo();
  }
}

function usarItem(i) {
  if (isSleeping || document.getElementById("gameVelha").style.display === "block") return;
  const item = inventario[i];
  if (item === "pao") fome = Math.min(fome + 30, 100);
  if (item === "suco") energia = Math.min(energia + 30, 100);
  if (item === "bola") diversao = Math.min(diversao + 30, 100);
  if (item === "urso") vida = Math.min(vida + 30, 100);
  inventario.splice(i, 1);
  atualizarTudo();
  fecharInventario();
}

function resetar() {
  localStorage.clear();
  location.reload();
}

// --- Funções do Jogo da Velha ---
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X'; // 'X' para o jogador, 'O' para o Tamagotchi
let gameActive = false;

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function iniciarJogoVelha() {
    if (isSleeping) return; // Não pode jogar dormindo

    document.getElementById("tamagotchi").style.display = "none";
    document.getElementById("gameVelha").style.display = "block";
    resetGameVelha();
    gameActive = true;
    document.getElementById("gameStatus").innerText = `É a vez do ${currentPlayer}`;
    atualizarBotoesAcao(); // Desabilita os botões do Tamagotchi enquanto joga
}

function resetGameVelha() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    document.querySelectorAll('.cell').forEach(cell => {
        cell.innerText = '';
        cell.classList.remove('x', 'o');
    });
    document.getElementById("gameStatus").innerText = '';
    gameActive = true;
}

function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.id.replace('cell-', ''));

    if (board[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    board[clickedCellIndex] = currentPlayer;
    clickedCell.innerText = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());

    checkResult();

    if (gameActive) {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        document.getElementById("gameStatus").innerText = `É a vez do ${currentPlayer}`;
        if (currentPlayer === 'O') {
            setTimeout(tamagotchiMove, 500); // Tamagotchi joga após um pequeno atraso
        }
    }
}

function tamagotchiMove() {
    if (!gameActive) return;

    let availableCells = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            availableCells.push(i);
        }
    }

    if (availableCells.length > 0) {
        // Lógica simples: joga aleatoriamente
        const randomIndex = Math.floor(Math.random() * availableCells.length);
        const cellToPlay = availableCells[randomIndex];

        board[cellToPlay] = 'O';
        document.getElementById(`cell-${cellToPlay}`).innerText = 'O';
        document.getElementById(`cell-${cellToPlay}`).classList.add('o');

        checkResult();

        if (gameActive) {
            currentPlayer = 'X';
            document.getElementById("gameStatus").innerText = `É a vez do ${currentPlayer}`;
        }
    }
}

function checkResult() {
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
            break;
        }
    }

    if (roundWon) {
        document.getElementById("gameStatus").innerText = `O jogador ${currentPlayer} venceu!`;
        gameActive = false;
        if (currentPlayer === 'X') { // Se o jogador venceu
            diversao = Math.min(diversao + 15, 100);
            xp += 10;
            document.getElementById("status").innerText = `${nome} se divertiu muito jogando!`;
        } else { // Se o Tamagotchi venceu
            diversao = Math.min(diversao + 5, 100);
            xp += 5;
            document.getElementById("status").innerText = `${nome} te venceu! Que esperto!`;
        }
        setTimeout(voltarParaTamagotchi, 1500); // Volta após um pequeno atraso para ver o resultado
        return;
    }

    let roundDraw = !board.includes('');
    if (roundDraw) {
        document.getElementById("gameStatus").innerText = `Empate!`;
        gameActive = false;
        diversao = Math.min(diversao + 10, 100);
        xp += 7;
        document.getElementById("status").innerText = `${nome} se divertiu com o empate!`;
        setTimeout(voltarParaTamagotchi, 1500); // Volta após um pequeno atraso para ver o resultado
        return;
    }
}

function voltarParaTamagotchi() {
    document.getElementById("gameVelha").style.display = "none";
    document.getElementById("tamagotchi").style.display = "block";
    atualizarTudo(); // Re-atualiza tudo ao voltar, o que chama atualizarBotoesAcao()
}

// Adiciona event listeners para as células do jogo da velha
document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', handleCellClick));
