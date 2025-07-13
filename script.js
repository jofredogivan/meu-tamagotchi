let nome = "";
let moedas = 20;
let fome = 50, diversao = 50, energia = 50, vida = 100, xp = 0, nivel = 1;
let inventario = [];
let tickInterval;
let isSleeping = false;
let sleepStartTime = 0;
let isSick = false; // NOVA VARIÁVEL: Para controlar se está doente
let sickChance = 0.03; // NOVA VARIÁVEL: 3% de chance de ficar doente por tick se vida baixa

// NOVAS VARIÁVEIS: Pontos de cuidado para a evolução adulta
let carePoints = {
    alimentar: 0,
    brincar: 0,
    dormir: 0,
    geral: 0 // Para ações gerais ou XP
};

function iniciarJogo() {
  nome = document.getElementById("inputNome").value || "Tamagotchi";
  document.getElementById("nome").innerText = nome;
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("tamagotchi").style.display = "block";
  atualizarTudo();
  tickInterval = setInterval(tick, 60000); // Atualiza a cada 1 minuto
  atualizarBotoesAcao();
}

function atualizarTudo() {
  atualizarBarras();
  atualizarImagem();
  document.getElementById("moedas").innerText = moedas;
  document.getElementById("nivel").innerText = nivel;
  atualizarBotoesAcao();
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

  // NOVO: Imagem de doente tem prioridade
  if (isSick) {
    // Você pode criar imgs/bebe_doente.gif, imgs/crianca_doente.png, etc.
    // Por simplicidade, vamos usar uma genérica por enquanto ou uma para o bebê.
    if (nivel < 3) {
        img.src = "imgs/bebe_doente.gif"; // Exemplo: se tiver essa imagem
    } else if (nivel < 6) {
        img.src = "imgs/crianca_doente.png"; // Exemplo: se tiver essa imagem
    } else {
        // Para adultos doentes, pode ser uma imagem genérica ou um overlay.
        // Por agora, vou usar uma genérica de bebê doente se as específicas não existirem.
        img.src = "imgs/doente.gif"; // Crie uma imagem 'doente.gif'
    }
    return;
  }

  // Se estiver dormindo, mantém a imagem de dormindo (se não estiver doente)
  if (isSleeping) {
    if (nivel < 3) {
        img.src = "imgs/bebe.dormindo.gif";
    } else if (nivel < 6) {
        img.src = "imgs/crianca.dormindo.gif"; // Precisa criar
    } else {
        let forma = localStorage.getItem("formaAdulta"); // Se já evoluiu, mostra a forma adulta dormindo
        if (forma) {
            img.src = `imgs/adulto_${forma}.dormindo.gif`; // Precisa criar
        } else { // Se ainda não evoluiu para adulto, mas é nível >= 6 e está dormindo
            img.src = "imgs/bebe.dormindo.gif"; // Fallback
        }
    }
    return;
  }

  // Lógica de imagem normal (bebe, crianca, adulto - se não estiver doente nem dormindo)
  if (nivel < 3) {
    img.src = "imgs/bebe.gif";
  } else if (nivel < 6) {
    img.src = "imgs/crianca.png";
  } else {
    let forma = localStorage.getItem("formaAdulta");
    if (!forma) {
      // NOVA LÓGICA DE EVOLUÇÃO BASEADA NOS PONTOS DE CUIDADO
      const sortedCare = Object.entries(carePoints).sort(([,a],[,b]) => b - a);
      const topCareType = sortedCare[0][0]; // Pega o tipo de cuidado com mais pontos

      // Mapeamento dos tipos de cuidado para as formas adultas
      if (topCareType === 'brincar') {
          forma = "guerreiro"; // Brincou muito, virou guerreiro
      } else if (topCareType === 'alimentar') {
          forma = "preguica"; // Comeu muito, virou preguiça
      } else if (topCareType === 'dormir') {
          forma = "mistico"; // Dormiu muito, virou místico (NOVA FORMA!)
      } else { // Geral ou xp alto (default se não houver um dominante claro)
          forma = "tech"; // Crescimento geral, virou tech
      }
      localStorage.setItem("formaAdulta", forma);
    }
    img.src = `imgs/adulto_${forma}.png`;
  }
}

function alimentar() {
  if (isSleeping || isSick || document.getElementById("gameVelha").style.display === "block") return;
  
  const img = document.getElementById("petImage");
  fome = Math.min(fome + 20, 100);
  xp += 5;
  carePoints.alimentar += 1; // NOVO: Adiciona ponto de cuidado

  img.src = "imgs/bebe.comendo.gif";
  atualizarBarras();
  document.getElementById("moedas").innerText = moedas;
  document.getElementById("nivel").innerText = nivel;

  setTimeout(() => {
    atualizarImagem();
  }, 4000);
}

function brincar() {
  if (isSleeping || isSick || document.getElementById("gameVelha").style.display === "block") return;
  
  diversao = Math.min(diversao + 20, 100);
  xp += 5;
  carePoints.brincar += 1; // NOVO: Adiciona ponto de cuidado
  atualizarTudo();
}

function dormir() {
  if (isSleeping || isSick || document.getElementById("gameVelha").style.display === "block") return;
  
  isSleeping = true;
  sleepStartTime = new Date().getTime();
  document.getElementById("status").innerText = "Seu Tamagotchi está dormindo... Zzz";
  carePoints.dormir += 1; // NOVO: Adiciona ponto de cuidado
  atualizarTudo();
}

function acordar() {
  if (!isSleeping) return;
  
  isSleeping = false;
  document.getElementById("status").innerText = "Seu Tamagotchi acordou!";
  atualizarTudo();
}

function tick() {
  const agora = new Date();
  const hora = agora.getHours();

  // NOVO: Lógica de Doença
  if (isSick) {
    vida = Math.max(vida - 3, 0); // Perde vida mais rápido quando doente
    fome = Math.max(fome - 1, 0); // Fica mais faminto
    diversao = Math.max(diversao - 1, 0); // Menos divertido
    energia = Math.max(energia - 1, 0); // Mais cansado
    document.getElementById("status").innerText = `${nome} está doente! 😷 Use a vacina!`;
    atualizarBarras(); // Atualiza apenas as barras para refletir a perda de vida
    if (vida <= 0) { // Verifica se morreu por doença
        atualizarTudo(); // Chama atualização final para imagem de morto
    }
    return; // Sai da função tick para não aplicar outras reduções se doente
  }

  // Lógica de sono forçado ou acordar após 6 horas
  if (isSleeping) {
    energia = Math.min(energia + 5, 100);
    const tempoDormido = agora.getTime() - sleepStartTime;
    const seisHorasEmMs = 6 * 60 * 60 * 1000;

    if (tempoDormido >= seisHorasEmMs) {
      acordar();
    } else {
      atualizarBarras();
    }
    return;
  } else {
    // Sono natural entre 22h e 6h (se não estiver dormindo forçadamente)
    if (hora >= 22 || hora < 6) {
      energia = Math.min(energia + 5, 100);
      document.getElementById("status").innerText = "Seu Tamagotchi está com sono.";
    } else {
      energia = Math.max(energia - 1, 0);
      // Mantém o status customizado se houver
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

  // NOVO: Chance de ficar doente se vida baixa e não estiver doente
  if (vida < 40 && !isSick && Math.random() < sickChance) {
      isSick = true;
      document.getElementById("status").innerText = `${nome} parece doente... 😷`;
  }

  if (xp >= nivel * 20) {
    xp = 0;
    nivel++;
    localStorage.removeItem("formaAdulta"); // Reseta a forma adulta ao subir de nível para re-evoluir
    document.getElementById("status").innerText = `${nome} subiu para o nível ${nivel}!`;
  }
  carePoints.geral += 1; // NOVO: Ponto de cuidado geral a cada tick

  atualizarTudo();
}

function atualizarBotoesAcao() {
    const botoes = document.querySelectorAll('#actions button');
    const isGameVelhaActive = document.getElementById("gameVelha").style.display === "block";

    botoes.forEach(btn => {
        if (btn.id === "resetButton") {
            btn.disabled = false;
            return;
        }

        if (isGameVelhaActive) {
            btn.disabled = true;
            if (btn.id === "acordarButton") {
                btn.style.display = "none";
            }
            return;
        }

        // NOVO: Desabilita a maioria dos botões se estiver doente, exceto loja, inventário e usar item
        if (isSick) {
            if (btn.id === "abrirLojaButton" || btn.id === "abrirInventarioButton" || btn.id === "acordarButton") { // Acordar também não é desabilitado, mas escondido se doente
                btn.disabled = false;
                if (btn.id === "acordarButton") btn.style.display = "none"; // Esconde acordar se doente
            } else {
                btn.disabled = true;
                btn.style.display = "inline-block";
            }
            return;
        }

        // Lógica de sono (se não estiver doente nem jogando)
        if (isSleeping) {
            if (btn.id === "acordarButton") {
                btn.style.display = "inline-block";
                btn.disabled = false;
            } else {
                btn.style.display = "inline-block";
                btn.disabled = true;
            }
        } else {
            if (btn.id === "acordarButton") {
                btn.style.display = "none";
            } else {
                btn.style.display = "inline-block";
                btn.disabled = false;
            }
        }
    });
}

function abrirLoja() {
  if (isSleeping || isSick || document.getElementById("gameVelha").style.display === "block") return;
  document.getElementById("loja").style.display = "block";
}

function fecharLoja() {
  document.getElementById("loja").style.display = "none";
}

function abrirInventario() {
  if (isSleeping || isSick || document.getElementById("gameVelha").style.display === "block") return;
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
  const precos = { pao: 10, suco: 15, bola: 20, urso: 25, vacina: 30 }; // NOVO: Preço da vacina
  if (moedas >= precos[item]) {
    moedas -= precos[item];
    inventario.push(item);
    atualizarTudo();
  }
}

function usarItem(i) {
  if (isSleeping || document.getElementById("gameVelha").style.display === "block") return; // Não impede usar se doente, para poder usar vacina
  
  const item = inventario[i];
  if (item === "pao") fome = Math.min(fome + 30, 100);
  if (item === "suco") energia = Math.min(energia + 30, 100);
  if (item === "bola") diversao = Math.min(diversao + 30, 100);
  if (item === "urso") vida = Math.min(vida + 30, 100);
  // NOVO: Usar Vacina
  if (item === "vacina") {
      if (isSick) { // Só funciona se estiver doente
          isSick = false;
          vida = Math.min(vida + 20, 100); // Recupera um pouco de vida
          document.getElementById("status").innerText = `${nome} se sentiu melhor após a vacina!`;
      } else {
          document.getElementById("status").innerText = `${nome} não está doente.`;
          return; // Não remove a vacina se não for usada
      }
  }
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
let currentPlayer = 'X';
let gameActive = false;

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function iniciarJogoVelha() {
    if (isSleeping || isSick) return; // Não pode jogar dormindo ou doente

    document.getElementById("tamagotchi").style.display = "none";
    document.getElementById("gameVelha").style.display = "block";
    resetGameVelha();
    gameActive = true;
    document.getElementById("gameStatus").innerText = `É a vez do ${currentPlayer}`;
    atualizarBotoesAcao();
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
            setTimeout(tamagotchiMove, 500);
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
        if (currentPlayer === 'X') {
            diversao = Math.min(diversao + 15, 100);
            xp += 10;
            document.getElementById("status").innerText = `${nome} se divertiu muito jogando!`;
        } else {
            diversao = Math.min(diversao + 5, 100);
            xp += 5;
            document.getElementById("status").innerText = `${nome} te venceu! Que esperto!`;
        }
        setTimeout(voltarParaTamagotchi, 1500);
        return;
    }

    let roundDraw = !board.includes('');
    if (roundDraw) {
        document.getElementById("gameStatus").innerText = `Empate!`;
        gameActive = false;
        diversao = Math.min(diversao + 10, 100);
        xp += 7;
        document.getElementById("status").innerText = `${nome} se divertiu com o empate!`;
        setTimeout(voltarParaTamagotchi, 1500);
        return;
    }
}

function voltarParaTamagotchi() {
    document.getElementById("gameVelha").style.display = "none";
    document.getElementById("tamagotchi").style.display = "block";
    atualizarTudo();
}

document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', handleCellClick));
