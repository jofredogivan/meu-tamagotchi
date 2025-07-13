// script.js
let nome = "";
let moedas = 20;
let fome = 50, diversao = 50, energia = 50, vida = 100, xp = 0, nivel = 1;
let inventario = [];
let tickInterval;

function iniciarJogo() {
  nome = document.getElementById("inputNome").value || "Tamagotchi";
  document.getElementById("nome").innerText = nome;
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("tamagotchi").style.display = "block";
  atualizarTudo();
  tickInterval = setInterval(tick, 2000);
}

function atualizarTudo() {
  atualizarBarras();
  atualizarImagem();
  document.getElementById("moedas").innerText = moedas;
  document.getElementById("nivel").innerText = nivel;
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

  if (nivel < 3) {
    img.src = "imgs/bebe.png";
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
  fome = Math.min(fome + 20, 100);
  xp += 5;
  atualizarTudo();
}

function brincar() {
  diversao = Math.min(diversao + 20, 100);
  xp += 5;
  atualizarTudo();
}

function dormir() {
  energia = Math.min(energia + 30, 100);
  xp += 5;
  atualizarTudo();
}

function tick() {
  fome -= 3;
  diversao -= 2;
  energia -= 1;

  if (fome < 30 || diversao < 30 || energia < 30) vida -= 2;
  else vida = Math.min(vida + 1, 100);

  if (xp >= nivel * 20) {
    xp = 0;
    nivel++;
    localStorage.removeItem("formaAdulta");
  }

  atualizarTudo();
}

function abrirLoja() {
  document.getElementById("loja").style.display = "block";
}

function fecharLoja() {
  document.getElementById("loja").style.display = "none";
}

function abrirInventario() {
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
