// --- LÓGICA DE NAVEGAÇÃO GERAL ---

let loopCobrinha = null;
let loopTorre = null;

function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));

    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');
    }
}

function pararJogoEVoltar() {
    if (loopCobrinha) { clearInterval(loopCobrinha); loopCobrinha = null; }
    if (loopTorre) { clearInterval(loopTorre); loopTorre = null; }
    window.onkeydown = null;
    showScreen('game-details');
}

function setTheme(mode) {
    const body = document.body;
    const sunMoon = document.querySelector('.sun-moon');

    if (mode === 'dark') {
        body.classList.add('dark-theme');
        body.classList.remove('light-theme');
        if(sunMoon) sunMoon.textContent = '🌙'; 
    } else {
        body.classList.add('light-theme');
        body.classList.remove('dark-theme');
        if(sunMoon) sunMoon.textContent = '☀️'; 
    }
}

// --- BASE DE DADOS DOS JOGOS ---
const gameData = {
    'cobrinha': {
        title: 'Cobrinha',
        icon: '🐍',
        text: 'Controle uma cobrinha pela tela e coma as comidinhas. Cada vez que ela come, ela cresce e fica mais comprida. O desafio é desviar das paredes e do próprio corpo dela; se você bater ou morder o própria calda, o jogo acaba.',
        color: 'var(--color-blue)',
        textColor: 'light',
        audio: 'audio/Cobrinha.m4a',
        targetScreen: 'play-pong'
    },
    'velha': {
        title: 'Jogo da Velha',
        icon: '❌⭕',
        text: 'O Jogo da Velha é um jogo de estratégia para dois jogadores. Você escolhe X ou O e tente fazer uma linha, coluna ou uma diagonal antes do seu amigo.',
        color: 'var(--color-green)',
        textColor: 'light',
        audio: 'audio/JogoDaVelha.m4a',
        targetScreen: 'play-velha'
    },
    'memoria': {
        title: 'Memória Espacial',
        icon: '🧠',
        text: 'Encontre os pares das figuras escondidas. Vire as cartas e memorize onde está cada desenho. Ajuda a melhorar a concentração e a memória visual.',
        color: 'var(--color-purple)',
        textColor: 'light',
        audio: 'audio/JogodaMemoria.m4a ',
        targetScreen: 'play-memoria'
    },
    'empilhar': {
        title: 'Empilhar',
        icon: '🧱',
        text: 'O jogo de empilhar é super divertido e testa o seu reflexo! Vários blocos ficam passando de um lado para o outro na tela, e você precisa apertar o botão no momento exato para soltar e encaixar um bloco direitinho em cima do outro. O objetivo é construir a torre mais alta que você conseguir.',
        color: 'var(--color-pink)',
        textColor: 'light',
        audio: 'audio/Torre.m4a',
        targetScreen: 'play-empilhar'
    },
    'dado': {
        title: 'Dado',
        icon: '🎲',
        text: 'Clique para rolar o dado de forma aleatória, veja ele girar e torça bastante! O número que ficar virado para cima será a sua pontuação da rodada.',
        color: 'var(--color-orange)',
        textColor: 'light',
        audio: 'audio/Dado.m4a',
        targetScreen: 'play-dado'
    },
    'placar': {
        title: 'Placar',
        icon: '📊',
        text: 'um placar completo, para marcar os pontos de partidas entre os times azul e verde',
        color: 'var(--color-grey)',
        textColor: 'dark', 
        audio: 'audio/Placar.m4a',
        targetScreen: 'play-placar'
    }
};

function loadGameDetails(gameKey) {
    const data = gameData[gameKey];
    if (!data) return;

    const card = document.getElementById('details-card');
    const titleHeader = card.querySelector('.desc-header');
    const title = document.getElementById('details-title');
    const icon = document.getElementById('details-icon');
    const text = document.getElementById('details-text');
    const audioElement = document.getElementById('details-audio');
    const audioSource = document.getElementById('details-audio-source');
    const playBtn = document.getElementById('btn-play-game');

    title.textContent = data.title;
    icon.textContent = data.icon;
    text.textContent = data.text;
    card.style.backgroundColor = data.color;
    card.className = 'game-desc-container'; 

    if (data.textColor === 'light') {
        card.classList.add('text-light');
        titleHeader.style.borderBottomColor = 'rgba(255,255,255,0.3)';
    } else {
        card.classList.add('text-dark');
        titleHeader.style.borderBottomColor = 'rgba(0,0,0,0.2)';
    }

    audioSource.src = data.audio;
    audioElement.load(); 

    playBtn.onclick = () => {
        audioElement.pause(); 
        showScreen(data.targetScreen);
        dispararInicializadorDeJogo(gameKey);
    };

    showScreen('game-details');
}

function dispararInicializadorDeJogo(key) {
    if (key === 'cobrinha') startCobrinha();
    if (key === 'velha') startVelha();
    if (key === 'memoria') startMemoria();
    if (key === 'empilhar') startTorre();
}

// ==========================================================================
// ENGINES INTERNAS DOS JOGOS REVISADAS E COM COMPONENTES DE RESET VISUAIS
// ==========================================================================

// 1. COBRINHA CLÁSSICA
function startCobrinha() {
    const container = document.getElementById('tabuleiro-cobrinha');
    const statusTxt = document.getElementById('cobrinha-status');
    const resetBtn = document.getElementById('btn-reset-cobrinha');
    
    container.innerHTML = '';
    statusTxt.textContent = "Use as SETAS do teclado para guiar!";
    statusTxt.style.color = "";
    resetBtn.style.display = "none";
    
    if (loopCobrinha) clearInterval(loopCobrinha);

    let celulas = [];
    for (let i = 0; i < 225; i++) {
        let div = document.createElement('div');
        div.className = 'celula-c';
        container.appendChild(div);
        celulas.push(div);
    }

    let cobra = [112, 111, 110];
    let direcao = 1; 
    let fruta = 40;
    let jogando = true;

    function desenhar() {
        celulas.forEach(c => c.classList.remove('cobra', 'fruta'));
        cobra.forEach(idx => {
            if (celulas[idx]) celulas[idx].classList.add('cobra');
        });
        if (celulas[fruta]) celulas[fruta].classList.add('fruta');
    }

    window.onkeydown = function(e) {
        if (!jogando) return;
        if (e.key === 'ArrowLeft' && direcao !== 1) direcao = -1;
        if (e.key === 'ArrowUp' && direcao !== 15) direcao = -15;
        if (e.key === 'ArrowRight' && direcao !== -1) direcao = 1;
        if (e.key === 'ArrowDown' && direcao !== -15) direcao = 15;
    };

    loopCobrinha = setInterval(() => {
        if (!jogando) return;

        let cabecaAtual = cobra[0];
        let linhaAtual = Math.floor(cabecaAtual / 15);

        let novaCabeca = cabecaAtual + direcao;
        let novaLinha = Math.floor(novaCabeca / 15);

        // Colisão Parede
        if (novaCabeca < 0 || novaCabeca >= 225 || (direcao === 1 && novaLinha !== linhaAtual) || (direcao === -1 && novaLinha !== linhaAtual)) {
            jogando = false;
            clearInterval(loopCobrinha);
            statusTxt.textContent = "💥 Você bateu na parede! Fim de jogo.";
            statusTxt.style.color = "#FF6B6B";
            resetBtn.style.display = "block";
            return;
        }

        // Colisão Corpo
        if (cobra.includes(novaCabeca)) {
            jogando = false;
            clearInterval(loopCobrinha);
            statusTxt.textContent = "💥 A cobrinha se mordeu! Fim de jogo.";
            statusTxt.style.color = "#FF6B6B";
            resetBtn.style.display = "block";
            return;
        }

        cobra.unshift(novaCabeca);

        if (novaCabeca === fruta) {
            do {
                fruta = Math.floor(Math.random() * 225);
            } while (cobra.includes(fruta));
        } else {
            cobra.pop();
        }
        desenhar();
    }, 180);

    desenhar();
}

// 2. JOGO DA VELHA
let vTurno = "X";
let vEstado = ["","","","","","","","",""];
function startVelha() {
    vTurno = "X";
    vEstado = ["","","","","","","","",""];
    document.getElementById('velha-status').textContent = "Vez do jogador X";
    
    const container = document.getElementById('tabuleiro-velha');
    container.innerHTML = '';

    for(let i=0; i<9; i++) {
        let q = document.createElement('div');
        q.className = 'quadrado-v';
        q.onclick = () => {
            if (vEstado[i] !== "") return;
            vEstado[i] = vTurno;
            q.textContent = vTurno;
            q.classList.add(vTurno.toLowerCase());
            
            const comb = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
            for(let c of comb) {
                if(vEstado[c[0]] && vEstado[c[0]] === vEstado[c[1]] && vEstado[c[0]] === vEstado[c[2]]) {
                    document.getElementById('velha-status').textContent = `Vitória do ${vEstado[c[0]]}! 🎉`;
                    vEstado = ["X","X","X","X","X","X","X","X","X"]; 
                    return;
                }
            }
            if (!vEstado.includes("")) {
                document.getElementById('velha-status').textContent = "Empate! 😊";
                return;
            }
            vTurno = vTurno === "X" ? "O" : "X";
            document.getElementById('velha-status').textContent = `Vez do jogador ${vTurno}`;
        };
        container.appendChild(q);
    }
}

// 3. JOGO DA MEMÓRIA ESPACIAL
let memAbertas = [];
let memParesEncontrados = 0;
function startMemoria() {
    const container = document.getElementById('tabuleiro-memoria');
    const statusTxt = document.getElementById('memoria-status');
    const resetBtn = document.getElementById('btn-reset-memoria');
    
    container.innerHTML = '';
    statusTxt.textContent = "Encontre os pares espaciais!";
    statusTxt.style.color = "";
    resetBtn.style.display = "none";
    memAbertas = [];
    memParesEncontrados = 0;

    let itensEspaciais = ["🚀", "🛸", "🪐", "🌙", "☀️", "🌍", "☄️", "⭐",
                         "🚀", "🛸", "🪐", "🌙", "☀️", "🌍", "☄️", "⭐"];
    itensEspaciais.sort(() => Math.random() - 0.5);

    itensEspaciais.forEach((simbolo) => {
        let card = document.createElement('div');
        card.className = 'carta-m oculta';
        card.textContent = "❓"; 
        
        card.onclick = () => {
            if (card.classList.contains('virada') || memAbertas.length >= 2) return;
            
            card.textContent = simbolo;
            card.classList.remove('oculta');
            card.classList.add('virada');
            memAbertas.push({card, simbolo});

            if(memAbertas.length === 2) {
                if(memAbertas[0].simbolo === memAbertas[1].simbolo) {
                    memParesEncontrados++;
                    memAbertas = [];
                    // Condição de Vitória Total
                    if(memParesEncontrados === 8) {
                        statusTxt.textContent = "👑 Parabéns! Você limpou a galáxia!";
                        statusTxt.style.color = "#2E7D32";
                        resetBtn.style.display = "block";
                    }
                } else {
                    setTimeout(() => {
                        memAbertas[0].card.classList.remove('virada');
                        memAbertas[0].card.classList.add('oculta');
                        memAbertas[0].card.textContent = "❓";
                        
                        memAbertas[1].card.classList.remove('virada');
                        memAbertas[1].card.classList.add('oculta');
                        memAbertas[1].card.textContent = "❓";
                        
                        memAbertas = [];
                    }, 1000);
                }
            }
        };
        container.appendChild(card);
    });
}

// 4. TORRE DE EMPILHAR COM ABISMO
let torreNivel = 0;
let torreX = 0;
let torreDir = 4;
let blocoAtual = null;
let basesTorreX = []; 

function startTorre() {
    const container = document.getElementById('container-torre');
    const statusTxt = document.getElementById('torre-status');
    const actionBtn = document.getElementById('btn-soltar-bloco');
    const resetBtn = document.getElementById('btn-reset-torre');
    
    container.innerHTML = '';
    statusTxt.textContent = "Clique abaixo para prender o bloco!";
    statusTxt.style.color = "";
    actionBtn.style.display = "inline-block";
    resetBtn.style.display = "none";
    
    torreNivel = 0;
    torreX = 0;
    torreDir = 5;
    basesTorreX = [];
    if(loopTorre) clearInterval(loopTorre);

    criarNovoBlocoTorre();

    loopTorre = setInterval(() => {
        if(!blocoAtual) return;
        torreX += torreDir;
        if(torreX <= 0 || torreX >= 200) torreDir = -torreDir;
        blocoAtual.style.left = torreX + 'px';
    }, 30);
}

function criarNovoBlocoTorre() {
    const container = document.getElementById('container-torre');
    blocoAtual = document.createElement('div');
    blocoAtual.className = 'bloco-t';
    blocoAtual.style.width = '80px';
    blocoAtual.style.backgroundColor = 'var(--color-blue)';
    blocoAtual.style.bottom = (torreNivel * 24) + 'px';
    blocoAtual.style.left = '0px';
    container.appendChild(blocoAtual);
    torreX = 0;
}

function colocarBlocoTorre() {
    if(!blocoAtual || torreNivel >= 11) return;

    const statusTxt = document.getElementById('torre-status');
    const actionBtn = document.getElementById('btn-soltar-bloco');
    const resetBtn = document.getElementById('btn-reset-torre');

    if (torreNivel === 0) {
        basesTorreX.push(torreX);
        blocoAtual.style.backgroundColor = 'var(--color-pink)';
        torreNivel++;
        criarNovoBlocoTorre();
    } else {
        let baseAlvoX = basesTorreX[torreNivel - 1];
        let diferenca = Math.abs(torreX - baseAlvoX);

        if (diferenca <= 38) {
            basesTorreX.push(torreX);
            blocoAtual.style.backgroundColor = 'var(--color-pink)';
            torreNivel++;
            
            if(torreNivel < 11) {
                criarNovoBlocoTorre();
            } else {
                clearInterval(loopTorre);
                blocoAtual = null;
                statusTxt.textContent = "👑 Sensacional! Torre Perfeita construída!";
                statusTxt.style.color = "#2E7D32";
                actionBtn.style.display = "none";
                resetBtn.style.display = "block";
            }
        } else {
            // Queda no Abismo
            clearInterval(loopTorre);
            let blocoCaindo = blocoAtual;
            blocoAtual = null; 
            blocoCaindo.style.backgroundColor = '#FF6B6B';
            blocoCaindo.classList.add('caindo');
            
            statusTxt.textContent = "🕳️ O bloco caiu no abismo por falta de equilíbrio!";
            statusTxt.style.color = "#FF6B6B";
            actionBtn.style.display = "none";
            
            setTimeout(() => {
                resetBtn.style.display = "block";
            }, 600);
        }
    }
}

// 5. ROLAR DADO
function rodarDadoVirtual() {
    const box = document.getElementById('dado-box');
    box.style.transform = "scale(1.2) rotate(180deg)";
    box.textContent = "🎲";

    setTimeout(() => {
        box.style.transform = "scale(1) rotate(0deg)";
        box.textContent = Math.floor(Math.random() * 6) + 1;
    }, 400);
}

// 6. CONTROLADORES DO PLACAR
let scAzul = 0;
let scVerde = 0;
function alterarPlacarLocal(time, qtd) {
    if(time === 'azul') {
        scAzul = Math.max(0, scAzul + qtd);
        document.getElementById('txt-score-azul').textContent = scAzul;
    } else {
        scVerde = Math.max(0, scVerde + qtd);
        document.getElementById('txt-score-verde').textContent = scVerde;
    }
    document.getElementById('score-global-preview').textContent = `${scAzul} | ${scVerde}`;
}