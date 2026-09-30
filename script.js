// ============================================
// MOBILIDADE SEGURA
// FASE FINAL
// ============================================


// ============================================
// ESTADO
// ============================================

let jogoComecou = false;
let jogoPausado = false;

let vidas = 3;
let pontos = 0;
let estrelasColetadas = 0;

let motoX = 250;
let motoY = 0;

let tempoInicio = 0;


// ============================================
// CONFIGURAÇÕES DO JOGO
// ============================================

// TAMANHO TOTAL DO MAPA

const TAMANHO_MUNDO = 30000;


// POSIÇÃO DA ESCOLA

const ESCOLA_X = 29500;


// ============================================
// ⭐ VELOCIDADE DA MOTO
// ============================================

const VELOCIDADE_MOTO = 7;
const VELOCIDADE_MAXIMA = VELOCIDADE_MOTO * 2;
let velocidadeAtual = VELOCIDADE_MOTO;


// VELOCIDADE PARA CIMA / BAIXO

const VELOCIDADE_VERTICAL = 6;


// ============================================
// TAMANHO DA MOTO
// ============================================

const MOTO_LARGURA = 110;
const MOTO_ALTURA = 70;
const POSICOES_FAIXAS = [2200, 4900, 7600, 10300, 13000, 15700, 18400, 21100, 23800, 26500];
const POSICOES_ESTRELAS = [4000, 14500, 25000];
let indiceFaixaAtual = 0;
let inicioParada = null;
const travessiasPedestre = new Map();


// ============================================
// LIMITES VERTICAIS
// ============================================

// espaço entre a moto
// e as bordas da pista

const LIMITE_CIMA = 20;

const LIMITE_BAIXO = 20;


// ============================================
// ELEMENTOS
// ============================================

const cenario =
    document.getElementById("cenario");

const mundo =
    document.getElementById("mundo");

const rua =
    document.getElementById("rua");

const moto =
    document.getElementById("moto");

const obstaculos =
    document.getElementById("obstaculos");

const escola =
    document.getElementById("escola");

const vidasTexto =
    document.getElementById("vidas");

const pontosTexto =
    document.getElementById("pontos");

const estrelasTexto =
    document.getElementById("estrelas");

const tempoTexto =
    document.getElementById("tempo");

const progresso =
    document.getElementById("progresso");

const mensagem =
    document.getElementById("mensagem");

const telaPausa =
    document.getElementById("telaPausa");

const telaFinal =
    document.getElementById("telaFinal");

const telaStart =
    document.getElementById("telaStart");

const botaoStart =
    document.getElementById("botaoStart");

const botaoIniciar =
    document.getElementById("botaoIniciar");

const mapaFases =
    document.getElementById("mapaFases");

const botoesFase =
    document.querySelectorAll(".fase-mapa");

const faseExterna = document.getElementById("faseExterna");
const quadroFase = document.getElementById("quadroFase");
const voltarMapa = document.getElementById("voltarMapa");
const mensagemConclusao = document.getElementById("mensagemConclusao");
const tituloConclusao = document.getElementById("tituloConclusao");
const detalhesConclusao = document.getElementById("detalhesConclusao");
const botaoVoltarMapaConclusao = document.getElementById("botaoVoltarMapaConclusao");
const CHAVE_FASES_DESBLOQUEADAS = "mobilidadeFasesDesbloqueadasV3";
const CHAVE_PONTOS_FASES = "mobilidadePontosPorFaseV1";

const avisoPare = document.getElementById("avisoPare");
const contadorPare = document.getElementById("contadorPare");


// ============================================
// SELEÇÃO DE FASES
// ============================================

function lerFaseMaisAltaDesbloqueada() {
    try {
        return Math.max(1, Math.min(3, Math.floor(Number(localStorage.getItem(CHAVE_FASES_DESBLOQUEADAS)) || 1)));
    }
    catch (erro) {
        return 1;
    }
}

function atualizarMapaFases(faseMaisAlta) {
    botoesFase.forEach(function(botao) {
        const desbloqueada = Number(botao.dataset.fase) <= faseMaisAlta;
        botao.disabled = !desbloqueada;
        botao.classList.toggle("desbloqueada", desbloqueada);
        botao.classList.toggle("bloqueada", !desbloqueada);
        botao.setAttribute("aria-disabled", String(!desbloqueada));
        botao.setAttribute("aria-label", desbloqueada
            ? "Iniciar fase " + botao.dataset.fase + ": " + botao.querySelector("small").textContent
            : "Fase " + botao.dataset.fase + " bloqueada: " + botao.querySelector("small").textContent);
    });
}

function desbloquearAte(fase) {
    const progresso = Number(fase);
    if (!Number.isInteger(progresso) || progresso < 1 || progresso > 3) {
        return;
    }
    const faseMaisAlta = Math.max(lerFaseMaisAltaDesbloqueada(), progresso);
    try {
        localStorage.setItem(CHAVE_FASES_DESBLOQUEADAS, String(faseMaisAlta));
    }
    catch (erro) {
        // O mapa continua funcional durante esta sessão se o armazenamento estiver indisponível.
    }
    atualizarMapaFases(faseMaisAlta);
}

function lerPontuacoesFases() {
    try {
        const pontuacoes = JSON.parse(localStorage.getItem(CHAVE_PONTOS_FASES) || "{}");
        return pontuacoes && typeof pontuacoes === "object" ? pontuacoes : {};
    }
    catch (erro) {
        return {};
    }
}

function atualizarPontuacoesNoMapa() {
    const pontuacoes = lerPontuacoesFases();
    document.querySelectorAll("[data-fase-pontos]").forEach(function(elemento) {
        const fase = elemento.dataset.fasePontos;
        const pontosFase = Number(pontuacoes[fase]);
        if (!Number.isFinite(pontosFase)) {
            elemento.classList.add("oculto");
            return;
        }
        elemento.textContent = pontosFase + " pts";
        elemento.classList.remove("oculto");
        elemento.setAttribute("aria-label", pontosFase + " pontos na fase " + fase);
    });
}

function salvarPontuacaoFase(fase, pontosFase) {
    const faseConcluida = Number(fase);
    const pontuacao = Number(pontosFase);
    if (!Number.isInteger(faseConcluida) || faseConcluida < 1 || faseConcluida > 3 ||
        !Number.isFinite(pontuacao)) {
        return;
    }
    const pontuacoes = lerPontuacoesFases();
    pontuacoes[faseConcluida] = Math.max(0, Math.floor(pontuacao));
    try {
        localStorage.setItem(CHAVE_PONTOS_FASES, JSON.stringify(pontuacoes));
    }
    catch (erro) {
        // A pontuação ainda aparece no mapa durante esta sessão.
    }
    atualizarPontuacoesNoMapa();
}

function concluirFase(fase, pontosFase) {
    salvarPontuacaoFase(fase, pontosFase);
    if (Number(fase) === 3) {
        const totalPontos = Object.values(lerPontuacoesFases()).reduce(function(total, pontos) {
            const pontuacao = Number(pontos);
            return total + (Number.isFinite(pontuacao) ? pontuacao : 0);
        }, 0);
        tituloConclusao.textContent = "Parabéns! Você concluiu o trajeto com sucesso!";
        detalhesConclusao.textContent = "Pontuação total no jogo: " + totalPontos + " pontos.";
    }
    else {
        tituloConclusao.textContent = "Fase " + fase + " concluída!";
        detalhesConclusao.textContent = "Você fez " + Math.floor(Number(pontosFase)) + " pontos nesta fase.";
    }
    faseExterna.classList.add("oculto");
    quadroFase.src = "about:blank";
    document.getElementById("jogo").classList.add("oculto");
    mapaFases.classList.remove("oculto");
    mensagemConclusao.classList.remove("oculto");
}

atualizarMapaFases(lerFaseMaisAltaDesbloqueada());
atualizarPontuacoesNoMapa();

const faseSolicitada = new URLSearchParams(window.location.search).get("fase");
if (faseSolicitada === "3" && lerFaseMaisAltaDesbloqueada() >= 3) {
    telaStart.classList.add("oculto");
    mapaFases.classList.add("oculto");
    document.getElementById("jogo").classList.remove("oculto");
}
else if (faseSolicitada === "3") {
    history.replaceState(null, "", window.location.pathname);
}

botaoStart.addEventListener("click", function() {
    telaStart.classList.add("oculto");
});

botoesFase.forEach(function(botao) {
    botao.addEventListener("click", function() {
        const fase = botao.dataset.fase;

        if (botao.disabled || botao.classList.contains("bloqueada")) {
            return;
        }

        if (fase === "3") {
            window.location.href = window.location.pathname + "?fase=3";
            return;
        }

        document.getElementById("jogo").classList.add("oculto");
        faseExterna.classList.remove("oculto");
        quadroFase.src = "Rota%20Segura%20Jogo/Rota_Segura.html?fase=" + fase;
        mapaFases.classList.add("oculto");
    });
});

voltarMapa.addEventListener("click", function() {
    faseExterna.classList.add("oculto");
    quadroFase.src = "about:blank";
    mapaFases.classList.remove("oculto");
});

window.addEventListener("message", function(event) {
    if (event.source !== quadroFase.contentWindow ||
        !event.data || event.data.tipo !== "mobilidade-fase-concluida") {
        return;
    }
    const faseConcluida = Number(event.data.faseConcluida);
    if (faseConcluida !== 1 && faseConcluida !== 2) {
        return;
    }
    desbloquearAte(event.data.faseDesbloqueada);
    concluirFase(faseConcluida, event.data.pontos);
});

botaoVoltarMapaConclusao.addEventListener("click", function() {
    mensagemConclusao.classList.add("oculto");
    mapaFases.classList.remove("oculto");
});


// ============================================
// TAMANHO DO MUNDO
// ============================================

mundo.style.width =
    TAMANHO_MUNDO + "px";

rua.style.width =
    TAMANHO_MUNDO + "px";

escola.style.left =
    ESCOLA_X + "px";


// ============================================
// TECLAS
// ============================================

const teclas = {};


document.addEventListener(
    "keydown",
    function(event) {

        teclas[event.key] = true;


        if (
            event.key.startsWith("Arrow")
        ) {

            event.preventDefault();

        }


        if (
            event.key === "p" ||
            event.key === "P"
        ) {

            alternarPausa();

        }

    }
);


document.addEventListener(
    "keyup",
    function(event) {

        teclas[event.key] = false;

    }
);


// ============================================
// POSIÇÃO INICIAL
// ============================================

function posicionarMoto() {

    // A rua tem 50% da altura da tela.
    // Colocamos a moto no meio da pista.

    motoY =
        (
            rua.clientHeight -
            MOTO_ALTURA
        ) / 2;


    desenharMoto();

}


// ============================================
// DESENHAR MOTO
// ============================================

function desenharMoto() {

    moto.style.left =
        motoX + "px";

    moto.style.top =
        motoY + "px";

}


// ============================================
// MOVIMENTO VERTICAL
// ============================================

function moverMotoVerticalmente() {

    // Com a moto parada, não há equilíbrio/impulso para trocar de faixa.
    if (velocidadeAtual <= 0.01) {
        return;
    }


    // ========================================
    // SUBIR
    // ========================================

    if (
        teclas["ArrowUp"] ||
        teclas["w"] ||
        teclas["W"]
    ) {

        motoY -=
            VELOCIDADE_VERTICAL;

    }


    // ========================================
    // DESCER
    // ========================================

    if (
        teclas["ArrowDown"] ||
        teclas["s"] ||
        teclas["S"]
    ) {

        motoY +=
            VELOCIDADE_VERTICAL;

    }


    // ========================================
    // LIMITES
    // ========================================

    const limiteSuperior =
        LIMITE_CIMA;


    const limiteInferior =
        rua.clientHeight -
        MOTO_ALTURA -
        LIMITE_BAIXO;


    // NÃO DEIXAR SUBIR DEMAIS

    if (
        motoY <
        limiteSuperior
    ) {

        motoY =
            limiteSuperior;

    }


    // NÃO DEIXAR DESCER DEMAIS

    if (
        motoY >
        limiteInferior
    ) {

        motoY =
            limiteInferior;

    }

}


// ============================================
// MOVIMENTO PARA FRENTE
// ============================================

function moverMotoParaFrente() {

    if (teclas["ArrowRight"]) {
        velocidadeAtual = Math.min(VELOCIDADE_MAXIMA, velocidadeAtual + 0.12);
    }

    if (teclas["ArrowLeft"]) {
        velocidadeAtual = Math.max(0, velocidadeAtual - 0.45);
    }

    motoX += velocidadeAtual;


    if (
        motoX >
        ESCOLA_X
    ) {

        motoX =
            ESCOLA_X;

    }

}


// ============================================
// CÂMERA
// ============================================

function atualizarCamera() {

    let cameraX =
        motoX -
        window.innerWidth * 0.30;


    if (
        cameraX < 0
    ) {

        cameraX = 0;

    }


    const limiteCamera =
        TAMANHO_MUNDO -
        window.innerWidth;


    if (
        cameraX >
        limiteCamera
    ) {

        cameraX =
            limiteCamera;

    }


    mundo.style.left =
        -cameraX + "px";

}


// ============================================
// LISTA DE OBSTÁCULOS
// ============================================

const listaObstaculos = [];
const carrosTransito = [];
const listaEstrelas = [];
let proximoCarroX = 5600;


// ============================================
// ÁREA DOS OBSTÁCULOS
// ============================================

const INICIO_OBSTACULOS =
    700;

const FIM_OBSTACULOS =
    28700;


// ============================================
// CRIAR OBSTÁCULO
// ============================================

function criarObstaculo(
    tipo,
    x,
    posicaoVertical
) {

    const elemento =
        document.createElement("div");


    elemento.classList.add(
        "obstaculo",
        tipo
    );

    // Todo bueiro em manutenção ganha poças ao redor. Elas são apenas
    // decoração: o buraco continua sendo a única área de colisão.
    if (tipo === "buraco") {
        elemento.innerHTML = `
            <span class="poca poca-esquerda"></span>
            <span class="poca poca-direita"></span>
        `;
    }

    // Varia os carros para a estrada não ficar repetitiva.
    if (tipo === "carro") {
        const cores = ["#ef5350", "#3b82f6", "#f59e0b", "#8b5cf6"];
        elemento.style.setProperty(
            "--cor-carro",
            cores[Math.floor(Math.random() * cores.length)]
        );
    }


    // posição horizontal

    elemento.style.left =
        x + "px";


    // ========================================
    // TAMANHO
    // ========================================

    let largura;
    let altura;


    if (
        tipo === "buraco"
    ) {

        largura = 90;
        altura = 48;

    }


    if (
        tipo === "cone"
    ) {

        largura = 45;
        altura = 65;

    }


    if (
        tipo === "barreira"
    ) {

        largura = 110;
        altura = 48;

    }


    if (
        tipo === "carro"
    ) {

        largura = 155;
        altura = 72;

    }


    // ========================================
    // POSIÇÃO VERTICAL
    // ========================================

    let y;


    const margemPista = 32;
    const espacoDisponivel =
        rua.clientHeight -
        altura -
        margemPista * 2;

    y = margemPista +
        espacoDisponivel * posicaoVertical;


    elemento.style.top =
        y + "px";


    obstaculos.appendChild(
        elemento
    );


    // ========================================
    // GUARDAR
    // ========================================

    listaObstaculos.push({

        elemento: elemento,

        x: x,

        y: y,

        largura: largura,

        altura: altura,

        atingido: false

    });

}


// ============================================
// GERAR OBSTÁCULOS
// ============================================

function gerarObstaculos() {

    obstaculos.innerHTML = "";

    listaObstaculos.length = 0;


    // Grupos espaçados em posições que deixam uma faixa livre para desviar.
    // As posições representam o alto, o meio e a parte baixa da pista.
    const faixas = [0.18, 0.50, 0.82];
    const tipos = ["buraco", "cone", "barreira"];
    let grupo = 0;

    for (let x = INICIO_OBSTACULOS; x < FIM_OBSTACULOS; grupo++) {
        x += 330 + Math.random() * 130;
        if (x >= FIM_OBSTACULOS) break;

        // Mantém uma área livre antes e depois das faixas para o trânsito voltar à sua faixa.
        const pertoDaFaixa = POSICOES_FAIXAS.some(function(faixaX) {
            return x < faixaX + 420 && x + 255 > faixaX - 420;
        });
        const pertoDaEstrela = POSICOES_ESTRELAS.some(function(estrelaX) {
            return x < estrelaX + 310 && x + 255 > estrelaX - 310;
        });
        if (pertoDaFaixa || pertoDaEstrela) continue;

        const primeira = (grupo * 2 + Math.floor(Math.random() * 3)) % 3;
        const tipo1 = tipos[Math.floor(Math.random() * tipos.length)];
        criarObstaculo(tipo1, x, faixas[primeira]);

        // Quase todos os grupos ocupam duas faixas; a terceira permanece aberta.
        if (grupo % 7 !== 6) {
            const segunda = (primeira + 1) % 3;
            const tipo2 = tipos[Math.floor(Math.random() * tipos.length)];
            criarObstaculo(tipo2, x + 145, faixas[segunda]);
        }
    }

}


// ============================================
// COLISÃO
// ============================================

function verificarColisoes() {

    // tamanho da hitbox da moto

    const margemMotoX =
        22;

    const margemMotoY =
        14;


    const motoEsquerda =
        motoX +
        margemMotoX;


    const motoDireita =
        motoX +
        MOTO_LARGURA -
        margemMotoX;


    const motoCima =
        motoY +
        margemMotoY;


    const motoBaixo =
        motoY +
        MOTO_ALTURA -
        margemMotoY;


    listaObstaculos.forEach(
        function(obs) {


            if (
                obs.atingido
            ) {

                return;

            }


            // hitbox menor do obstáculo

            const margemObsX =
                10;

            const margemObsY =
                8;


            const esquerda =
                obs.x +
                margemObsX;


            const direita =
                obs.x +
                obs.largura -
                margemObsX;


            const cima =
                obs.y +
                margemObsY;


            const baixo =
                obs.y +
                obs.altura -
                margemObsY;


            // =================================
            // VERIFICAR COLISÃO
            // =================================

            const colidiu =

                motoDireita >
                esquerda &&

                motoEsquerda <
                direita &&

                motoBaixo >
                cima &&

                motoCima <
                baixo;


            if (
                colidiu
            ) {

                baterNoObstaculo(
                    obs
                );

            }

        }
    );

    verificarColisaoComCarros(motoEsquerda, motoDireita, motoCima, motoBaixo);
    verificarColisaoComPedestres(motoEsquerda, motoDireita, motoCima, motoBaixo);

}

// ============================================
// ESTRELAS COLETÁVEIS DA FASE
// ============================================

function criarEstrelas() {
    const alturas = [0.22, 0.72, 0.48];

    POSICOES_ESTRELAS.forEach(function(x, indice) {
        const elemento = document.createElement("div");
        const y = 32 + (rua.clientHeight - 112) * alturas[indice];

        elemento.className = "estrela-coletavel";
        elemento.setAttribute("aria-label", "Estrela coletável");
        elemento.textContent = "★";
        elemento.style.left = x + "px";
        elemento.style.top = y + "px";
        obstaculos.appendChild(elemento);

        listaEstrelas.push({ elemento: elemento, x: x, y: y, coletada: false });
    });
}

function verificarColetaEstrelas() {
    listaEstrelas.forEach(function(estrela) {
        if (estrela.coletada) return;

        const pegou =
            motoX + MOTO_LARGURA - 18 > estrela.x &&
            motoX + 18 < estrela.x + 52 &&
            motoY + MOTO_ALTURA - 12 > estrela.y &&
            motoY + 12 < estrela.y + 52;

        if (pegou) {
            estrela.coletada = true;
            estrelasColetadas++;
            estrelasTexto.textContent = estrelasColetadas + "/3";
            estrela.elemento.classList.add("coletada");
        }
    });
}

function verificarColisaoComCarros(motoEsquerda, motoDireita, motoCima, motoBaixo) {
    carrosTransito.forEach(function(carro) {
        if (carro.colidindo) return;
        const atingiu = motoDireita > carro.x + 12 &&
            motoEsquerda < carro.x + carro.largura - 12 &&
            motoBaixo > carro.y - 20 &&
            motoCima < carro.y + carro.altura + 18;
        if (atingiu) baterNoCarro(carro);
    });
}

function baterNoCarro(carro) {
    carro.colidindo = true;
    vidas--;
    vidasTexto.textContent = vidas;
    pontos = Math.max(0, pontos - 50);
    pontosTexto.textContent = pontos;
    motoX = Math.max(250, motoX - 140);
    velocidadeAtual = 0;
    moto.style.filter = "brightness(1.8)";
    setTimeout(function() {
        carro.colidindo = false;
        moto.style.filter = "none";
    }, 900);
    if (vidas <= 0) perder();
}

function verificarColisaoComPedestres(motoEsquerda, motoDireita, motoCima, motoBaixo) {
    travessiasPedestre.forEach(function(travessia) {
        travessia.pedestres.forEach(function(pedestre) {
            if (pedestre.atingido || pedestre.elemento.style.display === "none") return;
            const atingiu = motoDireita > pedestre.x + 3 &&
                motoEsquerda < pedestre.x + 27 &&
                motoBaixo > pedestre.y + 5 &&
                motoCima < pedestre.y + 55;
            if (atingiu) baterNoPedestre(pedestre);
        });
    });
}

function baterNoPedestre(pedestre) {
    pedestre.atingido = true;
    pedestre.elemento.style.display = "none";
    vidas--;
    vidasTexto.textContent = vidas;
    velocidadeAtual = 0;
    motoX = Math.max(250, motoX - 100);
    moto.style.filter = "brightness(1.8)";
    setTimeout(function() { moto.style.filter = "none"; }, 900);
    if (vidas <= 0) perder();
}


// ============================================
// BATER NO OBSTÁCULO
// ============================================

function baterNoObstaculo(
    obs
) {

    obs.atingido =
        true;


    obs.elemento.style.display =
        "none";


    vidas--;


    vidasTexto.textContent =
        vidas;


    if (
        pontos >= 25
    ) {

        pontos -= 25;

    }
    else {

        pontos = 0;

    }


    pontosTexto.textContent =
        pontos;


    // voltar um pouco

    motoX -= 150;


    if (
        motoX < 250
    ) {

        motoX = 250;

    }


    // efeito

    moto.style.filter =
        "brightness(1.8)";


    setTimeout(
        function() {

            moto.style.filter =
                "none";

        },
        180
    );


    if (
        vidas <= 0
    ) {

        perder();

    }

}


// ============================================
// PONTOS
// ============================================

function verificarObstaculosPassados() {

    listaObstaculos.forEach(
        function(obs) {


            if (
                obs.atingido
            ) {

                return;

            }


            if (
                motoX >
                obs.x +
                obs.largura
            ) {

                obs.atingido =
                    true;


                obs.elemento.style.opacity =
                    "0.15";


                pontos +=
                    10;


                pontosTexto.textContent =
                    pontos;

            }

        }
    );

}


// ============================================
// PROGRESSO
// ============================================

function atualizarProgresso() {

    const porcentagem =
        (
            motoX /
            ESCOLA_X
        ) * 100;


    progresso.style.width =
        Math.min(
            porcentagem,
            100
        ) + "%";

}


// ============================================
// TEMPO
// ============================================

function atualizarTempo() {

    if (
        !jogoComecou ||
        jogoPausado
    ) {

        return;

    }


    const tempo =
        Date.now() -
        tempoInicio;


    const segundos =
        Math.floor(
            tempo / 1000
        );


    const minutos =
        Math.floor(
            segundos / 60
        );


    const segundosRestantes =
        segundos % 60;


    tempoTexto.textContent =

        minutos +
        ":" +
        segundosRestantes
            .toString()
            .padStart(2, "0");

}


// ============================================
// PAUSA
// ============================================

function alternarPausa() {

    if (
        !jogoComecou
    ) {

        return;

    }


    jogoPausado =
        !jogoPausado;


    if (
        jogoPausado
    ) {

        telaPausa.classList.remove(
            "oculto"
        );

    }
    else {

        telaPausa.classList.add(
            "oculto"
        );

        atualizar();

    }

}


// ============================================
// CHEGADA
// ============================================

function verificarChegada() {

    if (
        motoX >=
        ESCOLA_X
    ) {

        vencer();

    }

}


// ============================================
// VITÓRIA
// ============================================

function vencer() {

    jogoComecou =
        false;


    pontos +=
        vidas * 100;


    pontosTexto.textContent =
        pontos;


    document.getElementById(
        "pontuacaoFinal"
    ).textContent =
        pontos;


    document.getElementById(
        "tempoFinal"
    ).textContent =
        tempoTexto.textContent;


    document.getElementById(
        "resultado"
    ).textContent =
        "🏫 VOCÊ CHEGOU À ESCOLA!";

    const mensagemEstrelas = document.getElementById("mensagemEstrelas");
    if (estrelasColetadas === POSICOES_ESTRELAS.length) {
        mensagemEstrelas.textContent = "⭐ Parabéns! Você pegou as 3 estrelas da fase!";
        mensagemEstrelas.classList.remove("oculto");
    }
    else {
        mensagemEstrelas.classList.add("oculto");
    }

    concluirFase(3, pontos);

}


// ============================================
// DERROTA
// ============================================

function perder() {

    jogoComecou =
        false;


    document.getElementById(
        "pontuacaoFinal"
    ).textContent =
        pontos;


    document.getElementById(
        "tempoFinal"
    ).textContent =
        tempoTexto.textContent;


    document.getElementById(
        "resultado"
    ).textContent =
        "💥 VOCÊ NÃO CONSEGUIU CHEGAR!";


    document.getElementById(
        "iconeFinal"
    ).textContent =
        "🚧";


    telaFinal.classList.remove(
        "oculto"
    );

}


// ============================================
// LOOP DO JOGO
// ============================================

function atualizar() {

    if (
        !jogoComecou ||
        jogoPausado
    ) {

        return;

    }


    moverMotoVerticalmente();

    moverMotoParaFrente();

    verificarParadaNaFaixa();

    atualizarTransito();

    atualizarPedestres();

    atualizarCamera();

    desenharMoto();

    verificarColisoes();

    verificarObstaculosPassados();

    verificarColetaEstrelas();

    atualizarProgresso();

    verificarChegada();


    requestAnimationFrame(
        atualizar
    );

}


// ============================================
// INICIAR
// ============================================

botaoIniciar.addEventListener(
    "click",
    function() {

        jogoComecou =
            true;

        jogoPausado =
            false;

        mensagem.classList.add(
            "oculto"
        );


        tempoInicio =
            Date.now();


        atualizar();

    }
);


// ============================================
// CRIAR CIDADE
// ============================================

function criarCidade() {
    const cidadeSuperior = document.getElementById("cidadeSuperior");
    const cidadeInferior = document.getElementById("cidadeInferior");
    const paleta = [
        ["#f3d093", "#c77b55", "#9c5147"],
        ["#e9b9a0", "#bd6d61", "#81454a"],
        ["#e8d990", "#b49a58", "#77623d"],
        ["#c5d8b1", "#789b69", "#53714e"],
        ["#c4d7df", "#7199a8", "#526c7b"]
    ];
    const posicoes = [450, 1550, 2750, 3950, 5250, 6550, 7850, 9150, 10450, 11750, 13050, 14350, 15650, 16900, 18200, 19500, 20800, 22100, 23400, 24700, 26000, 27300, 28600];

    function adicionarPredio(container, x, indice, lado) {
        const predio = document.createElement("div");
        const cores = paleta[(indice + lado) % paleta.length];
        predio.classList.add("predio", lado === 0 ? "cima" : "baixo");
        predio.style.left = x + "px";
        predio.style.setProperty("--fachada-clara", cores[0]);
        predio.style.setProperty("--fachada", cores[1]);
        predio.style.setProperty("--telhado", cores[2]);
        predio.innerHTML = `
            <div class="janela janela1"></div>
            <div class="janela janela2"></div>
            <div class="janela janela3"></div>
            <div class="janela janela4"></div>
        `;
        container.appendChild(predio);
    }

    function adicionarArvore(container, x, indice, lado) {
        const arvore = document.createElement("div");
        arvore.classList.add("arvore");
        arvore.style.left = x + "px";
        if (lado === 0) arvore.style.bottom = "17px";
        else arvore.style.top = "17px";
        arvore.style.transform = `scale(${indice % 2 ? 0.88 : 1})`;
        container.appendChild(arvore);
    }

    posicoes.forEach((x, indice) => {
        adicionarPredio(cidadeSuperior, x, indice, 0);
        adicionarPredio(cidadeInferior, x + 380, indice, 1);
        if (indice % 2 === 0) {
            adicionarArvore(cidadeSuperior, x + 165, indice, 0);
            adicionarArvore(cidadeInferior, x + 170, indice + 1, 1);
        }
    });
}

function adicionarCarroTransito(x, lado, cor) {
    const fracao = lado === 0 ? 0.25 : 0.70;
    const elemento = document.createElement("div");

    elemento.className = "obstaculo carro carro-trafego";
    elemento.style.setProperty("--cor-carro", cor);
    obstaculos.appendChild(elemento);

    carrosTransito.push({
        elemento: elemento,
        x: x,
        y: rua.clientHeight * fracao,
        largura: 155,
        altura: 72,
        velocidade: VELOCIDADE_MOTO * (0.64 + Math.random() * 0.16),
        lado: lado,
        colidindo: false,
        paradaAtual: null,
        paradoAte: 0,
        faixasAtendidas: new Set()
    });
}

function criarTransito() {
    const cores = ["#7c3aed", "#1d8c74", "#d97706", "#2563eb"];
    [0, 1, 2, 3].forEach(function(indice) {
        const lado = indice % 2;
        adicionarCarroTransito(
            motoX + 820 + indice * 1150,
            lado,
            cores[indice]
        );
    });
}

function reporTransito() {
    const cores = ["#e94f54", "#307ee8", "#16a673", "#ef9b25", "#8a5ce6"];

    // Mantém sempre carros à frente, inclusive na segunda metade da fase.
    while (motoX + 1900 >= proximoCarroX && proximoCarroX < ESCOLA_X - 450) {
        const lado = Math.random() < 0.5 ? 0 : 1;
        const cor = cores[Math.floor(Math.random() * cores.length)];
        adicionarCarroTransito(proximoCarroX, lado, cor);
        proximoCarroX += 820 + Math.random() * 420;
    }
}

function atualizarTransito() {
    reporTransito();

    const alturaPista = rua.clientHeight;
    carrosTransito.slice().sort(function(a, b) { return b.x - a.x; }).forEach(function(carro) {
        const alturaVisual = carro.altura + 18;
        const yMin = 34;
        const yMax = Math.max(yMin, alturaPista - alturaVisual - 12);
        const yCasa = Math.max(yMin, Math.min(yMax, alturaPista * (carro.lado === 0 ? 0.25 : 0.70)));
        const candidatos = [];
        const ameaças = listaObstaculos.filter(function(obs) {
            return !obs.atingido &&
                obs.x + obs.largura >= carro.x - 35 &&
                obs.x <= carro.x + carro.largura + 390;
        }).sort(function(a, b) { return a.x - b.x; });
        const limiteGrupo = ameaças.length ? ameaças[0].x + 240 : -1;
        const obstaculosProximos = ameaças.filter(function(obs) {
            return obs.x <= limiteGrupo;
        });

        for (let y = yMin; y <= yMax; y += 16) {
            const colisaoFutura = obstaculosProximos.some(function(obs) {
                return y - 30 < obs.y + obs.altura + 8 &&
                    y + alturaVisual > obs.y - 8;
            });
            if (!colisaoFutura) {
                candidatos.push({ y: y, custo: Math.abs(y - carro.y) + Math.abs(y - yCasa) * 0.18 });
            }
        }

        if (candidatos.length) {
            candidatos.sort(function(a, b) { return a.custo - b.custo; });
            const alvoY = candidatos[0].y;
            carro.y += Math.max(-4.5, Math.min(4.5, alvoY - carro.y));
        }

        if (carro.paradaAtual !== null) {
            if (Date.now() < carro.paradoAte) {
                carro.elemento.style.left = carro.x + "px";
                carro.elemento.style.top = carro.y + "px";
                return;
            }
            carro.faixasAtendidas.add(carro.paradaAtual);
            carro.paradaAtual = null;
        }

        let xProposto = carro.x + carro.velocidade;
        const proximaFaixa = POSICOES_FAIXAS.findIndex(function(faixaX, indice) {
            return !carro.faixasAtendidas.has(indice) && faixaX > carro.x + carro.largura;
        });
        if (proximaFaixa !== -1) {
            const linhaDeParada = POSICOES_FAIXAS[proximaFaixa] - carro.largura - 32;
            xProposto = Math.min(xProposto, linhaDeParada);
        }

        const carroDaFrente = carrosTransito
            .filter(function(outro) { return outro !== carro && outro.x > carro.x; })
            .sort(function(a, b) { return a.x - b.x; })[0];
        if (carroDaFrente) {
            const distanciaSegura = carro.largura + 150;
            xProposto = Math.min(xProposto, carroDaFrente.x - distanciaSegura);
        }
        xProposto = Math.max(carro.x, xProposto);

        if (proximaFaixa !== -1) {
            const linhaDeParada = POSICOES_FAIXAS[proximaFaixa] - carro.largura - 32;
            if (xProposto >= linhaDeParada) {
                xProposto = linhaDeParada;
                carro.paradaAtual = proximaFaixa;
                carro.paradoAte = Date.now() + 5000;
                iniciarTravessia(proximaFaixa);
            }
        }
        carro.x = xProposto;
        carro.elemento.style.left = carro.x + "px";
        carro.elemento.style.top = carro.y + "px";
    });

    // Carros muito atrás da câmera não precisam continuar sendo atualizados.
    for (let indice = carrosTransito.length - 1; indice >= 0; indice--) {
        const carro = carrosTransito[indice];
        if (carro.x < motoX - 1800) {
            carro.elemento.remove();
            carrosTransito.splice(indice, 1);
        }
    }
}

function iniciarTravessia(indiceFaixa) {
    const agora = Date.now();
    const ativa = travessiasPedestre.get(indiceFaixa);
    if (ativa && agora - ativa.inicio < 5000) return;
    if (ativa) ativa.pedestres.forEach(function(p) { p.elemento.remove(); });

    const pedestres = [];
    [42, 92].forEach(function(offset, indice) {
        const elemento = document.createElement("div");
        elemento.className = `pedestre pedestre-${indice === 0 ? "azul" : "amarelo"}`;
        elemento.innerHTML = "<i></i><i></i>";
        elemento.style.left = (POSICOES_FAIXAS[indiceFaixa] + offset) + "px";
        elemento.style.top = "-62px";
        rua.appendChild(elemento);
        pedestres.push({
            elemento: elemento,
            x: POSICOES_FAIXAS[indiceFaixa] + offset,
            y: -62,
            atingido: false
        });
    });
    travessiasPedestre.set(indiceFaixa, { inicio: agora, pedestres: pedestres });
}

function atualizarPedestres() {
    const agora = Date.now();
    travessiasPedestre.forEach(function(travessia, indice) {
        const progresso = (agora - travessia.inicio) / 5000;
        if (progresso >= 1) {
            travessia.pedestres.forEach(function(p) { p.elemento.remove(); });
            travessiasPedestre.delete(indice);
            return;
        }
        const y = -62 + progresso * (rua.clientHeight + 124);
        travessia.pedestres.forEach(function(p) {
            p.y = y;
            p.elemento.style.top = y + "px";
        });
    });
}

function verificarParadaNaFaixa() {
    const faixaX = POSICOES_FAIXAS[indiceFaixaAtual];
    if (faixaX === undefined) {
        avisoPare.classList.add("oculto");
        return;
    }

    const distancia = faixaX - motoX;
    if (distancia <= 600 && distancia > 0) {
        avisoPare.classList.remove("oculto");
        if (velocidadeAtual <= 0.01 && distancia >= 110 && distancia <= 560) {
            if (inicioParada === null) {
                inicioParada = Date.now();
                iniciarTravessia(indiceFaixaAtual);
            }
            const restante = Math.max(0, 5 - (Date.now() - inicioParada) / 1000);
            contadorPare.textContent = ` • ${restante.toFixed(1)} s`;
            if (restante <= 0) {
                pontos += 100;
                pontosTexto.textContent = pontos;
                indiceFaixaAtual++;
                inicioParada = null;
                contadorPare.textContent = " • +100 pontos!";
                return;
            }
        } else {
            inicioParada = null;
            contadorPare.textContent = velocidadeAtual <= 0.01 ? " • pare antes da faixa" : " • freie a moto";
        }
    } else {
        inicioParada = null;
        contadorPare.textContent = "";
        avisoPare.classList.add("oculto");
    }

    // Atravessar sem parar encerra a oportunidade de ganhar os pontos.
    if (distancia <= 0) {
        indiceFaixaAtual++;
        inicioParada = null;
        avisoPare.classList.add("oculto");
    }
}

// Faixas pintadas transversalmente em pontos espaçados do percurso.
function criarFaixasDePedestre() {
    const calcadaSuperior = document.createElement("div");
    calcadaSuperior.className = "calcada calcada-superior";
    const calcadaInferior = document.createElement("div");
    calcadaInferior.className = "calcada calcada-inferior";
    mundo.append(calcadaSuperior, calcadaInferior);

    POSICOES_FAIXAS.forEach(function(x, indice) {
        const faixa = document.createElement("div");
        faixa.className = "faixaPedestre";
        faixa.style.left = x + "px";
        rua.appendChild(faixa);

        const placa = document.createElement("div");
        placa.className = `placaPare ${indice % 2 === 0 ? "placa-superior" : "placa-inferior"}`;
        placa.style.left = (x - 86) + "px";
        placa.innerHTML = "<span>PARE</span><i></i>";
        mundo.appendChild(placa);
    });
}


// ============================================
// PREPARAÇÃO
// ============================================

posicionarMoto();

gerarObstaculos();

criarEstrelas();

criarTransito();

criarCidade();

criarFaixasDePedestre();


// relógio

setInterval(
    atualizarTempo,
    250
);
