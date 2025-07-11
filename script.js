// Valores iniciais
let fome = parseInt(localStorage.getItem("fome")) || 100;
let diversao = parseInt(localStorage.getItem("diversao")) || 100;
let energia = parseInt(localStorage.getItem("energia")) || 100;
let vida = parseInt(localStorage.getItem("vida")) || 100;
let xp = parseInt(localStorage.getItem("xp")) || 0;
let nivel = parseInt(localStorage.getItem("nivel")) || 1;
let moedas = parseInt(localStorage.getItem("moedas")) || 20;
let inventario = JSON.parse(localStorage.getItem("inventario")) || {};
let nome = localStorage.getItem("nome") || prompt("Nome do seu Tamagotchi:");
let lastTick = parseInt(localStorage.getItem("lastTick")) || Date.now();

document.getElementById("name").textContent = "🐾 Nome: " + nome;

function salvarDados() {
  localStorage.setItem("fome", fome);
  localStorage.setItem("diversao", diversao);
  localStorage.setItem("energia", energia);
  localStorage.setItem("vida", vida);
  localStorage.setItem("xp", xp);
  localStorage.setItem("nivel", nivel);
  localStorage.setItem("moedas", moedas);
  localStorage.setItem("inventario", JSON.stringify(inventario));
  localStorage.setItem("nome", nome);
  localStorage.setItem("lastTick", lastTick);
}

function atualizarImagem() {
  const img = document.getElementById("petImage");
  if (vida <= 0) {
    img.src = "https://i.imgur.com/3dZgXEh.png"; // morto
  } else if (nivel < 3) {
    img.src = "https://i.imgur.com/yTnMMSb.png"; // bebê fofo
  } else if (nivel < 6) {
    img.src = "https://i.imgur.com/SsUvYCh.png"; // criança kawaii
  } else {
    img.src = "https://i.imgur.com/X3fKoMn.png"; // adulto fofo
  }
}

function cor(p) {
  if (p > 70) return "#4caf50";
  if (p > 30) return "#ffeb3b";
  return "#f44336";
}

function atualizarBarras() {
  document.getElementById("hungerBar").style.width = fome + "%";
  document.getElementById("funBar").style.width = diversao + "%";
  document.getElementById("energyBar").style.width = energia + "%";
  document.getElementById("lifeBar").style.width = vida + "%";

  document.getElementById("hungerBar").style.backgroundColor = cor(fome);
  document.getElementById("funBar").style.backgroundColor = cor(diversao);
  document.getElementById("energyBar").style.backgroundColor = cor(energia);
  document.getElementById("lifeBar").style.backgroundColor = cor(vida);

  let xpMax = nivel * 100;
  let xpPercent = Math.min(100, (xp / xpMax) * 100);
  document.getElementById("xpBar").style.width = xpPercent + "%";
  document.getElementById("nivelLabel").textContent = `(${nivel})`;

  document.getElementById("coins").textContent = `🪙 Moedas: ${moedas}`;

  const status = document.getElementById("status");
  if (vida <= 0) {
    status.textContent = "💀 " + nome + " morreu...";
    clearInterval(tickInterval);
  } else if (fome < 20 || diversao < 20 || energia < 20) {
    status.textContent = "😓 Estou muito cansado ou triste!";
  } else if (fome < 50 || diversao < 50 || energia < 50) {
    status.textContent = "😐 Estou ok... cuide bem de mim!";
  } else {
    status.textContent = "😄 Estou ótimo!";
  }

  salvarDados();
}

function ganharXP(qtd) {
  xp += qtd;
  moedas += Math.floor(qtd / 5);
  const xpMax = nivel * 100;
  if (xp >= xpMax) {
    xp -= xpMax;
    nivel++;
    alert(`🎉 ${nome} evoluiu para o nível ${nivel}!`);
  }
  atualizarImagem();
  atualizarBarras();
}

function alimentar() {
  if (vida <= 0) return;
  fome = Math.min(fome + 20, 100);
  ganharXP(10);
}

function brincar() {
  if (vida <= 0) return;
  diversao = Math.min(diversao + 20, 100);
  energia = Math.max(energia - 10, 0);
  ganharXP(15);
}

function dormir() {
  if (vida <= 0) return;
  energia = Math.min(energia + 30, 100);
  vida = Math.min(vida + 5, 100);
  ganharXP(5);
}

function resetar() {
  if (confirm("Deseja recomeçar seu Tamagotchi?")) {
    localStorage.clear();
    location.reload();
  }
}

function tick() {
  let now = Date.now();
  let segundos = Math.floor((now - lastTick) / 1000);
  lastTick = now;

  for (let i = 0; i < segundos / 2; i++) {
    fome = Math.max(fome - 2, 0);
    diversao = Math.max(diversao - 2, 0);
    energia = Math.max(energia - 1, 0);
    if (fome < 20 || diversao < 20 || energia < 20) {
      vida = Math.max(vida - 3, 0);
    } else {
      vida = Math.max(vida - 1, 0);
    }
  }

  atualizarImagem();
  atualizarBarras();
}

// -------- LOJA --------
function abrirLoja() {
  document.getElementById("loja").style.display = "block";
}
function fecharLoja() {
  document.getElementById("loja").style.display = "none";
}
function abrirInventario() {
  atualizarInventario();
  document.getElementById("inventario").style.display = "block";
}
function fecharInventario() {
  document.getElementById("inventario").style.display = "none";
}

function comprar(item) {
  const precos = { pao: 10, suco: 15, bola: 20, urso: 25 };
  if (moedas >= precos[item]) {
    moedas -= precos[item];
    inventario[item] = (inventario[item] || 0) + 1;
    alert("Item comprado!");
    atualizarBarras();
    salvarDados();
    atualizarInventario();
  } else {
    alert("Moedas insuficientes!");
  }
}

function atualizarInventario() {
  const nomes = {
    pao: "🥖 Pão (+20 Fome)",
    suco: "🥤 Suco (+15 Fome, +5 Energia)",
    bola: "⚽ Bola (+20 Diversão)",
    urso: "🧸 Urso (+15 Diversão, +5 Energia)"
  };
  let html = "";
  for (let item in inventario) {
    if (inventario[item] > 0) {
      html += `<div>${nomes[item]} — ${inventario[item]} <button onclick="usarItem('${item}')">Usar</button></div>`;
    }
  }
  if (html === "") html = "<p>Seu inventário está vazio.</p>";
  document.getElementById("itens").innerHTML = html;
}

function usarItem(item) {
  if (!inventario[item] || inventario[item] <= 0) return;
  switch (item) {
    case "pao":
      fome = Math.min(fome + 20, 100);
      break;
    case "suco":
      fome = Math.min(fome + 15, 100);
      energia = Math.min(energia + 5, 100);
      break;
    case "bola":
      diversao = Math.min(diversao + 20, 100);
      break;
    case "urso":
      diversao = Math.min(diversao + 15, 100);
      energia = Math.min(energia + 5, 100);
      break;
  }
  inventario[item]--;
  ganharXP(5);
  atualizarInventario();
  atualizarBarras();
}

atualizarImagem();
atualizarBarras();
tick();
let tickInterval = setInterval(tick, 2000);
