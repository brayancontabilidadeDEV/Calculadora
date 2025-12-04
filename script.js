// Aguarda o carregamento completo da página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página carregada - iniciando...');
    
    // Verificar se Chart.js foi carregado
    if (typeof Chart === 'undefined') {
        console.error('Chart.js não foi carregado!');
        return;
    }
    
    console.log('Chart.js carregado com sucesso! Versão:', Chart.version);
    
    // Inicializar funcionalidades básicas
    carregarDadosSalvos();
    calcularCustos();
    atualizarDashboard();
    atualizarProgresso();
    
    // Adicionar tooltips
    document.querySelectorAll('.info-bubble').forEach(bubble => {
        bubble.addEventListener('mouseenter', mostrarTooltip);
        bubble.addEventListener('mouseleave', esconderTooltip);
    });
    
    // Inicializar eventos
    inicializarEventos();
});

// Variáveis globais
let dadosNegocio = {
    empresa: {},
    produto: {},
    custos: {},
    precificacao: {},
    mercado: {},
    resultados: {}
};

let passoAtualDados = 1;
let metodoPrecificacaoSelecionado = 'markup';

// ==================== FUNÇÕES DE NAVEGAÇÃO ====================

function openTab(tabName) {
    // Esconder todas as tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remover classe ativa de todos os botões
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.className = btn.className.replace('gradient-primary text-white', 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300');
    });
    
    // Mostrar tab selecionada
    document.getElementById(tabName).classList.add('active');
    
    // Atualizar botão ativo
    const tabId = `tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`;
    const tabElement = document.getElementById(tabId);
    if (tabElement) {
        tabElement.className = 'tab-btn px-4 py-3 rounded-xl font-medium gradient-primary text-white shadow-md hover-lift';
    }
    
    // Atualizar progresso do wizard
    atualizarProgressoWizard(tabName);
    
    // Calcular dados se necessário
    if (tabName === 'dashboard') {
        atualizarDashboard();
    } else if (tabName === 'resultados') {
        calcularResultados();
    } else if (tabName === 'graficos') {
        // Atualizar gráficos com dados atuais
        setTimeout(() => {
            if (window.gerenciadorGraficos) {
                window.gerenciadorGraficos.atualizarTodosGraficosComDados();
            }
        }, 300);
    } else if (tabName === 'projecoes') {
        atualizarProjecoes();
    } else if (tabName === 'recomendacoes') {
        gerarRecomendacoes();
    }
}

function atualizarProgressoWizard(tabAtual) {
    const progresso = {
        'dashboard': 0,
        'dados': 25,
        'custos': 40,
        'precificacao': 55,
        'mercado': 70,
        'resultados': 85,
        'graficos': 90,
        'projecoes': 95,
        'recomendacoes': 100
    };
    
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.width = `${progresso[tabAtual] || 0}%`;
    }
}

// ==================== FUNÇÕES DA TAB DADOS BÁSICOS ====================

function mostrarPassoDados(passo) {
    // Esconder todos os passos
    document.querySelectorAll('.passo-conteudo').forEach(div => {
        div.classList.add('hidden');
    });
    
    // Remover classe ativa de todos os botões
    document.querySelectorAll('[id^="passoDados"]').forEach(btn => {
        btn.className = btn.className.replace('bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300', 
            'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300');
    });
    
    // Mostrar passo selecionado
    const conteudoPasso = document.getElementById(`conteudoPassoDados${passo}`);
    const botaoPasso = document.getElementById(`passoDados${passo}`);
    
    if (conteudoPasso) conteudoPasso.classList.remove('hidden');
    if (botaoPasso) {
        botaoPasso.className = 'px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium whitespace-nowrap';
    }
    
    passoAtualDados = passo;
    
    // Atualizar botão avançar
    const btnAvancar = document.getElementById('btnAvancarDados');
    if (btnAvancar) {
        if (passo === 4) {
            btnAvancar.innerHTML = 'Finalizar <i class="fas fa-check ml-2"></i>';
            btnAvancar.onclick = function() { openTab('custos'); };
        } else {
            btnAvancar.innerHTML = 'Continuar <i class="fas fa-arrow-right ml-2"></i>';
            btnAvancar.onclick = avancarPassoDados;
        }
    }
}

function avancarPassoDados() {
    if (passoAtualDados < 4) {
        mostrarPassoDados(passoAtualDados + 1);
    }
}

function voltarPassoDados() {
    if (passoAtualDados > 1) {
        mostrarPassoDados(passoAtualDados - 1);
    } else {
        openTab('dashboard');
    }
}

// ==================== FUNÇÕES DA TAB CUSTOS ====================

function calcularCustos() {
    // Custos variáveis por unidade
    const materiaPrima = parseFloat(document.getElementById('materiaPrima').value) || 0;
    const embalagem = parseFloat(document.getElementById('embalagem').value) || 0;
    const frete = parseFloat(document.getElementById('frete').value) || 0;
    
    // Percentuais
    const comissoesPercent = parseFloat(document.getElementById('comissoesPercent').value) || 0;
    const impostosVenda = parseFloat(document.getElementById('impostosVenda').value) || 0;
    const taxasPlataforma = parseFloat(document.getElementById('taxasPlataforma').value) || 0;
    
    // Custos fixos mensais
    const aluguel = parseFloat(document.getElementById('aluguel').value) || 0;
    const salarios = parseFloat(document.getElementById('salarios').value) || 0;
    const contas = parseFloat(document.getElementById('contas').value) || 0;
    const marketing = parseFloat(document.getElementById('marketing').value) || 0;
    const das = parseFloat(document.getElementById('das').value) || 70.90;
    const manutencao = parseFloat(document.getElementById('manutencao').value) || 0;
    const outrosFixos = parseFloat(document.getElementById('outrosFixos').value) || 0;
    
    // Software
    const softwareGestao = parseFloat(document.getElementById('softwareGestao').value) || 0;
    const softwareDesign = parseFloat(document.getElementById('softwareDesign').value) || 0;
    const softwareMarketing = parseFloat(document.getElementById('softwareMarketing').value) || 0;
    const softwareOutros = parseFloat(document.getElementById('softwareOutros').value) || 0;
    
    // Quantidade mensal esperada
    const qtdMensal = parseFloat(document.getElementById('qtdVendaMensal').value) || 100;
    
    // Cálculos
    const custoVariavelUnitario = materiaPrima + embalagem + frete;
    const custoFixoMensal = aluguel + salarios + contas + marketing + das + manutencao + outrosFixos + 
                           softwareGestao + softwareDesign + softwareMarketing + softwareOutros;
    const custoFixoUnitario = custoFixoMensal / qtdMensal;
    const custoTotalUnitario = custoVariavelUnitario + custoFixoUnitario;
    const custoTotalMensal = custoTotalUnitario * qtdMensal;
    
    // Calcular percentuais sobre preço (serão aplicados depois)
    const percentuaisVenda = (comissoesPercent + impostosVenda + taxasPlataforma) / 100;
    
    // Sugerir markup baseado no setor
    let markupSugerido = 100;
    const setor = document.getElementById('setorEmpresa').value;
    const markupsSetor = {
        'alimentacao': 60,
        'moda': 80,
        'artesanato': 120,
        'servicos': 100,
        'tecnologia': 150,
        'beleza': 90,
        'consultoria': 200,
        'educacao': 100,
        'saude': 80,
        'construcao': 70
    };
    
    if (setor && markupsSetor[setor]) {
        markupSugerido = markupsSetor[setor];
    }
    
    // Atualizar resumo
    const resumoCustoUnitario = document.getElementById('resumoCustoUnitario');
    const resumoCustoFixo = document.getElementById('resumoCustoFixo');
    const resumoCustoTotal = document.getElementById('resumoCustoTotal');
    const resumoMarkupSugerido = document.getElementById('resumoMarkupSugerido');
    
    if (resumoCustoUnitario) resumoCustoUnitario.textContent = formatarMoeda(custoTotalUnitario);
    if (resumoCustoFixo) resumoCustoFixo.textContent = formatarMoeda(custoFixoMensal);
    if (resumoCustoTotal) resumoCustoTotal.textContent = formatarMoeda(custoTotalMensal);
    if (resumoMarkupSugerido) resumoMarkupSugerido.textContent = `${markupSugerido}%`;
    
    // Atualizar dados no objeto
    dadosNegocio.custos = {
        variavelUnitario: custoVariavelUnitario,
        fixoMensal: custoFixoMensal,
        fixoUnitario: custoFixoUnitario,
        totalUnitario: custoTotalUnitario,
        totalMensal: custoTotalMensal,
        percentuaisVenda: percentuaisVenda,
        markupSugerido: markupSugerido,
        qtdMensal: qtdMensal
    };
    
    // Atualizar precificação
    atualizarPrecificacao();
    
    // Atualizar gráfico de distribuição se disponível
    if (window.gerenciadorGraficos) {
        const preco = parseFloat(document.getElementById('precoVendaFinal').value) || 0;
        window.gerenciadorGraficos.atualizarGraficoDistribuicaoPreco(dadosNegocio.custos, preco);
    }
}

function sugerirCustosPorSetor() {
    const setor = document.getElementById('setorEmpresa').value;
    
    if (!setor) {
        mostrarToast('Selecione um setor primeiro!', 'warning');
        return;
    }
    
    const templates = {
        'alimentacao': {
            materiaPrima: 8.50,
            embalagem: 1.20,
            frete: 5.00,
            aluguel: 1500.00,
            salarios: 2000.00,
            marketing: 300.00
        },
        'moda': {
            materiaPrima: 25.00,
            embalagem: 2.50,
            frete: 8.00,
            aluguel: 800.00,
            salarios: 1800.00,
            marketing: 400.00
        },
        'artesanato': {
            materiaPrima: 12.00,
            embalagem: 3.00,
            frete: 10.00,
            aluguel: 500.00,
            salarios: 1500.00,
            marketing: 200.00
        },
        'servicos': {
            materiaPrima: 5.00,
            embalagem: 0.50,
            frete: 0.00,
            aluguel: 600.00,
            salarios: 2500.00,
            marketing: 500.00
        }
    };
    
    if (templates[setor]) {
        const template = templates[setor];
        document.getElementById('materiaPrima').value = template.materiaPrima;
        document.getElementById('embalagem').value = template.embalagem;
        document.getElementById('frete').value = template.frete;
        document.getElementById('aluguel').value = template.aluguel;
        document.getElementById('salarios').value = template.salarios;
        document.getElementById('marketing').value = template.marketing;
        
        calcularCustos();
        mostrarToast(`Custos do setor ${setor} aplicados!`, 'success');
    }
}

function aplicarTemplateSetor(setor) {
    // Similar à função acima, mas para os botões rápidos
    const setorSelect = document.getElementById('setorEmpresa');
    if (setorSelect) {
        setorSelect.value = setor;
        sugerirCustosPorSetor();
    }
}

// ==================== FUNÇÕES DA TAB PRECIFICAÇÃO ====================

function selecionarMetodo(metodo) {
    metodoPrecificacaoSelecionado = metodo;
    const metodoSelecionadoElement = document.getElementById('metodoSelecionado');
    if (metodoSelecionadoElement) {
        metodoSelecionadoElement.textContent = metodo.charAt(0).toUpperCase() + metodo.slice(1) + ' (Recomendado)';
    }
    
    // Mostrar configuração específica do método
    document.querySelectorAll('.metodo-config').forEach(div => {
        div.style.display = 'none';
    });
    
    if (metodo === 'markup') {
        const configMarkup = document.getElementById('configMetodoMarkup');
        if (configMarkup) configMarkup.style.display = 'block';
        atualizarMarkup(document.getElementById('markupInput').value);
    }
    
    // Recalcular
    atualizarPrecificacao();
}

function atualizarMarkup(valor) {
    const markupSlider = document.getElementById('markupSlider');
    const markupInput = document.getElementById('markupInput');
    
    if (markupSlider) markupSlider.value = valor;
    if (markupInput) markupInput.value = valor;
    
    // Atualizar preços sugeridos
    const custoUnitario = dadosNegocio.custos.totalUnitario || 0;
    
    // Preços com diferentes markups
    const precoMin = custoUnitario * 1.6;
    const precoMedio = custoUnitario * 2.0;
    const precoMax = custoUnitario * 2.5;
    const precoAtual = custoUnitario * (1 + valor/100);
    
    const precoMarkupMin = document.getElementById('precoMarkupMin');
    const precoMarkupMedio = document.getElementById('precoMarkupMedio');
    const precoMarkupMax = document.getElementById('precoMarkupMax');
    const precoMarkupAtual = document.getElementById('precoMarkupAtual');
    
    if (precoMarkupMin) precoMarkupMin.textContent = formatarMoeda(precoMin);
    if (precoMarkupMedio) precoMarkupMedio.textContent = formatarMoeda(precoMedio);
    if (precoMarkupMax) precoMarkupMax.textContent = formatarMoeda(precoMax);
    if (precoMarkupAtual) precoMarkupAtual.textContent = formatarMoeda(precoAtual);
    
    // Atualizar preço final sugerido
    const precoFinalSugerido = document.getElementById('precoFinalSugerido');
    const precoVendaFinal = document.getElementById('precoVendaFinal');
    
    if (precoFinalSugerido) precoFinalSugerido.textContent = formatarMoeda(precoAtual);
    if (precoVendaFinal) precoVendaFinal.value = precoAtual.toFixed(2);
    
    // Atualizar composição
    atualizarComposicaoPreco(precoAtual);
    
    // Calcular impacto
    calcularImpactoPreco(precoAtual);
}

function atualizarComposicaoPreco(preco) {
    const custos = dadosNegocio.custos;
    
    if (!custos.totalUnitario) return;
    
    const custoVarUnit = custos.variavelUnitario || 0;
    const custoFixoUnit = custos.fixoUnitario || 0;
    const custoTotalUnit = custos.totalUnitario || 0;
    const markup = ((preco - custoTotalUnit) / custoTotalUnit) * 100;
    const lucroUnitario = preco - custoTotalUnit;
    const margemLucro = (lucroUnitario / preco) * 100;
    
    const compCustoVarUnit = document.getElementById('compCustoVarUnit');
    const compCustoFixoUnit = document.getElementById('compCustoFixoUnit');
    const compCustoTotalUnit = document.getElementById('compCustoTotalUnit');
    const compMarkupAplicado = document.getElementById('compMarkupAplicado');
    const compPrecoFinal = document.getElementById('compPrecoFinal');
    const lucroPorUnidade = document.getElementById('lucroPorUnidade');
    const margemLucroUnidade = document.getElementById('margemLucroUnidade');
    
    if (compCustoVarUnit) compCustoVarUnit.textContent = formatarMoeda(custoVarUnit);
    if (compCustoFixoUnit) compCustoFixoUnit.textContent = formatarMoeda(custoFixoUnit);
    if (compCustoTotalUnit) compCustoTotalUnit.textContent = formatarMoeda(custoTotalUnit);
    if (compMarkupAplicado) compMarkupAplicado.textContent = `${markup.toFixed(1)}%`;
    if (compPrecoFinal) compPrecoFinal.textContent = formatarMoeda(preco);
    if (lucroPorUnidade) lucroPorUnidade.textContent = formatarMoeda(lucroUnitario);
    if (margemLucroUnidade) margemLucroUnidade.textContent = `${margemLucro.toFixed(1)}%`;
    
    // Atualizar gráfico de composição
    atualizarGraficoComposicao(preco, custoVarUnit, custoFixoUnit, markup);
}

function atualizarGraficoComposicao(preco, custoVarUnit, custoFixoUnit, markup) {
    // Esta função será implementada no arquivo graficos.js
    // Por enquanto, apenas um placeholder
    console.log('Atualizando gráfico de composição:', { preco, custoVarUnit, custoFixoUnit, markup });
}

function aplicarPrecoPsicologico(tipo) {
    const precoAtual = parseFloat(document.getElementById('precoVendaFinal').value) || 0;
    let novoPreco = precoAtual;
    
    switch(tipo) {
        case '99':
            novoPreco = Math.floor(precoAtual) + 0.99;
            break;
        case '95':
            novoPreco = Math.floor(precoAtual) + 0.95;
            break;
        case '90':
            novoPreco = Math.floor(precoAtual) + 0.90;
            break;
        case 'arredondado':
            novoPreco = Math.round(precoAtual);
            break;
    }
    
    const precoVendaFinal = document.getElementById('precoVendaFinal');
    if (precoVendaFinal) {
        precoVendaFinal.value = novoPreco.toFixed(2);
        atualizarPrecoFinal(novoPreco);
    }
}

function atualizarPrecoFinal(valor) {
    const preco = parseFloat(valor) || 0;
    const descontoPercent = parseFloat(document.getElementById('descontoPromocional').value) || 0;
    
    // Aplicar desconto se necessário
    const precoComDesconto = preco * (1 - descontoPercent/100);
    
    // Atualizar composição
    atualizarComposicaoPreco(precoComDesconto);
    
    // Calcular impacto
    calcularImpactoPreco(precoComDesconto);
    
    // Atualizar preços psicológicos
    const precoPsico99 = document.getElementById('precoPsico99');
    const precoPsico95 = document.getElementById('precoPsico95');
    const precoPsico90 = document.getElementById('precoPsico90');
    const precoPsicoArred = document.getElementById('precoPsicoArred');
    
    if (precoPsico99) precoPsico99.textContent = formatarMoeda(Math.floor(precoComDesconto) + 0.99);
    if (precoPsico95) precoPsico95.textContent = formatarMoeda(Math.floor(precoComDesconto) + 0.95);
    if (precoPsico90) precoPsico90.textContent = formatarMoeda(Math.floor(precoComDesconto) + 0.90);
    if (precoPsicoArred) precoPsicoArred.textContent = formatarMoeda(Math.round(precoComDesconto));
}

function calcularImpactoPreco(preco) {
    const custos = dadosNegocio.custos;
    const qtdMensal = custos.qtdMensal || 100;
    
    if (!custos.totalUnitario) return;
    
    const lucroUnitario = preco - custos.totalUnitario;
    const lucroMensal = lucroUnitario * qtdMensal;
    const margemLucro = (lucroUnitario / preco) * 100;
    const pontoEquilibrio = Math.ceil(custos.fixoMensal / lucroUnitario);
    
    const impactoMargem = document.getElementById('impactoMargem');
    const impactoLucroUnit = document.getElementById('impactoLucroUnit');
    const impactoLucroMensal = document.getElementById('impactoLucroMensal');
    const impactoPontoEquilibrio = document.getElementById('impactoPontoEquilibrio');
    
    if (impactoMargem) impactoMargem.textContent = `${margemLucro.toFixed(1)}%`;
    if (impactoLucroUnit) impactoLucroUnit.textContent = formatarMoeda(lucroUnitario);
    if (impactoLucroMensal) impactoLucroMensal.textContent = formatarMoeda(lucroMensal);
    if (impactoPontoEquilibrio) impactoPontoEquilibrio.textContent = `${pontoEquilibrio} unidades`;
    
    // Recomendação
    let recomendacao = '';
    let cor = '';
    
    if (margemLucro < 10) {
        recomendacao = 'Preço muito baixo - Aumente para ter lucro';
        cor = 'text-red-600 dark:text-red-400';
    } else if (margemLucro < 20) {
        recomendacao = 'Preço adequado - Margem razoável';
        cor = 'text-yellow-600 dark:text-yellow-400';
    } else if (margemLucro < 40) {
        recomendacao = 'Preço ideal - Margem saudável';
        cor = 'text-green-600 dark:text-green-400';
    } else {
        recomendacao = 'Preço excelente - Alta rentabilidade';
        cor = 'text-green-700 dark:text-green-500';
    }
    
    const recomendacaoPreco = document.getElementById('recomendacaoPreco');
    if (recomendacaoPreco) {
        recomendacaoPreco.textContent = recomendacao;
        recomendacaoPreco.className = `font-bold ${cor}`;
    }
}

// ==================== FUNÇÕES DA TAB MERCADO ====================

function analisarConcorrencia() {
    const precoMin = parseFloat(document.getElementById('precoMinConcorrencia').value) || 0;
    const precoMedio = parseFloat(document.getElementById('precoMedioConcorrencia').value) || 0;
    const precoMax = parseFloat(document.getElementById('precoMaxConcorrencia').value) || 0;
    const meuPreco = parseFloat(document.getElementById('precoVendaFinal').value) || 0;
    
    if (!precoMin || !precoMedio || !precoMax) {
        mostrarToast('Preencha todos os preços da concorrência!', 'warning');
        return;
    }
    
    // Calcular posição
    const diferencaMedia = ((meuPreco - precoMedio) / precoMedio) * 100;
    const posicaoRelativa = ((meuPreco - precoMin) / (precoMax - precoMin)) * 100;
    
    // Atualizar indicadores
    const diferencaMediaElement = document.getElementById('diferencaMedia');
    const espacoAumentoElement = document.getElementById('espacoAumento');
    
    if (diferencaMediaElement) diferencaMediaElement.textContent = 
        `${diferencaMedia >= 0 ? '+' : ''}${diferencaMedia.toFixed(1)}%`;
    
    if (espacoAumentoElement) espacoAumentoElement.textContent = 
        `${((precoMax - meuPreco) / meuPreco * 100).toFixed(1)}%`;
    
    // Determinar posição
    let posicaoTexto = '';
    let posicaoCor = '';
    let marcadorPos = 0;
    
    if (meuPreco < precoMin * 1.1) {
        posicaoTexto = 'Muito abaixo da média';
        posicaoCor = 'text-red-600 dark:text-red-400';
        marcadorPos = 10;
    } else if (meuPreco < precoMedio * 0.9) {
        posicaoTexto = 'Abaixo da média';
        posicaoCor = 'text-orange-600 dark:text-orange-400';
        marcadorPos = 30;
    } else if (meuPreco <= precoMedio * 1.1) {
        posicaoTexto = 'No preço médio';
        posicaoCor = 'text-green-600 dark:text-green-400';
        marcadorPos = 50;
    } else if (meuPreco < precoMax * 0.9) {
        posicaoTexto = 'Acima da média';
        posicaoCor = 'text-blue-600 dark:text-blue-400';
        marcadorPos = 70;
    } else {
        posicaoTexto = 'Muito acima da média';
        posicaoCor = 'text-purple-600 dark:text-purple-400';
        marcadorPos = 90;
    }
    
    const posicaoMercadoElement = document.getElementById('posicaoMercado');
    const marcadorPosicaoElement = document.getElementById('marcadorPosicao');
    
    if (posicaoMercadoElement) {
        posicaoMercadoElement.textContent = posicaoTexto;
        posicaoMercadoElement.className = `font-bold ${posicaoCor}`;
    }
    
    if (marcadorPosicaoElement) marcadorPosicaoElement.style.left = `${marcadorPos}%`;
    
    // Vantagem competitiva
    const vantagem = diferencaMedia > 0 ? 'Posicionamento premium' : 
                   diferencaMedia > -10 ? 'Competitivo' : 'Preço agressivo';
    const vantagemCompetitivaElement = document.getElementById('vantagemCompetitiva');
    if (vantagemCompetitivaElement) vantagemCompetitivaElement.textContent = vantagem;
    
    // Atualizar gráfico de comparação
    if (window.gerenciadorGraficos) {
        window.gerenciadorGraficos.atualizarGraficoComparacaoConcorrencia();
    }
    
    // Análise
    let analise = '';
    if (diferencaMedia > 15) {
        analise = 'premium. Considere adicionar mais valor para justificar o preço.';
    } else if (diferencaMedia > 0) {
        analise = 'bem posicionado. Você não é o mais barato, mas oferece valor justo.';
    } else if (diferencaMedia > -10) {
        analise = 'competitivo. Boa relação preço/valor.';
    } else {
        analise = 'agressivo. Cuidado com a margem de lucro.';
    }
    
    const analisePosicaoElement = document.getElementById('analisePosicao');
    if (analisePosicaoElement) analisePosicaoElement.textContent = analise;
    
    // Valor percebido
    atualizarValorPercebido();
}

function atualizarValorPercebido() {
    const qualidade = parseInt(document.getElementById('valorQualidade').value) || 8;
    const atendimento = parseInt(document.getElementById('valorAtendimento').value) || 7;
    const marca = parseInt(document.getElementById('valorMarca').value) || 6;
    
    const valorTotal = (qualidade + atendimento + marca) / 3;
    
    const valorPercebidoScore = document.getElementById('valorPercebidoScore');
    if (valorPercebidoScore) valorPercebidoScore.textContent = valorTotal.toFixed(1);
    
    // Atualizar círculo de progresso
    const circle = document.querySelector('.progress-ring__circle');
    if (circle) {
        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (valorTotal / 10) * circumference;
        
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = offset;
    }
    
    // Nível de valor percebido
    let nivel = '';
    if (valorTotal >= 8) {
        nivel = 'Valor Muito Alto';
    } else if (valorTotal >= 6) {
        nivel = 'Valor Alto';
    } else if (valorTotal >= 4) {
        nivel = 'Valor Médio';
    } else {
        nivel = 'Valor Baixo';
    }
    
    const nivelValorPercebido = document.getElementById('nivelValorPercebido');
    if (nivelValorPercebido) nivelValorPercebido.textContent = nivel;
    
    // Comparação e premium permitido
    const premium = Math.max(0, (valorTotal - 5) * 5);
    const comparacaoValorPercebido = document.getElementById('comparacaoValorPercebido');
    const premiumPermitido = document.getElementById('premiumPermitido');
    
    if (comparacaoValorPercebido) {
        comparacaoValorPercebido.textContent = 
            valorTotal >= 6 ? 'alto' : valorTotal >= 4 ? 'médio' : 'baixo';
    }
    
    if (premiumPermitido) {
        premiumPermitido.textContent = `${premium.toFixed(0)}-${(premium + 5).toFixed(0)}%`;
    }
}

// ==================== FUNÇÕES DA TAB RESULTADOS ====================

function calcularResultados() {
    const custos = dadosNegocio.custos;
    const meuPreco = parseFloat(document.getElementById('precoVendaFinal').value) || 0;
    const qtdMensal = custos.qtdMensal || 100;
    
    if (!meuPreco || !custos.totalUnitario) return;
    
    // Cálculos básicos
    const receitaBruta = meuPreco * qtdMensal;
    const custoTotal = custos.totalMensal;
    const lucroBruto = receitaBruta - custoTotal;
    const margemLucro = (lucroBruto / receitaBruta) * 100;
    
    // Impostos e taxas (estimados)
    const impostos = receitaBruta * 0.07; // 7% estimado
    const lucroLiquido = lucroBruto - impostos;
    const margemLiquida = (lucroLiquido / receitaBruta) * 100;
    
    // Ponto de equilíbrio
    const lucroUnitario = meuPreco - custos.totalUnitario;
    const pontoEquilibrio = Math.ceil(custos.fixoMensal / lucroUnitario);
    
    // ROI e Payback (estimados)
    const investimentoInicial = custos.fixoMensal * 3; // Estimativa
    const roi = (lucroLiquido * 12 / investimentoInicial) * 100;
    const payback = investimentoInicial / lucroLiquido;
    
    // Atualizar KPIs
    const kpiFaturamento = document.getElementById('kpiFaturamento');
    const kpiLucro = document.getElementById('kpiLucro');
    const kpiMargem = document.getElementById('kpiMargem');
    const kpiPontoEquilibrio = document.getElementById('kpiPontoEquilibrio');
    
    if (kpiFaturamento) kpiFaturamento.textContent = formatarMoeda(receitaBruta);
    if (kpiLucro) kpiLucro.textContent = formatarMoeda(lucroLiquido);
    if (kpiMargem) kpiMargem.textContent = `${margemLiquida.toFixed(1)}%`;
    if (kpiPontoEquilibrio) kpiPontoEquilibrio.textContent = pontoEquilibrio;
    
    // Atualizar demonstração de resultados
    const dresReceitaBruta = document.getElementById('dresReceitaBruta');
    const dresCustoMercadorias = document.getElementById('dresCustoMercadorias');
    const dresImpostos = document.getElementById('dresImpostos');
    const dresLucroLiquido = document.getElementById('dresLucroLiquido');
    const dresMargemLucro = document.getElementById('dresMargemLucro');
    const dresLucroUnitario = document.getElementById('dresLucroUnitario');
    
    if (dresReceitaBruta) dresReceitaBruta.textContent = formatarMoeda(receitaBruta);
    if (dresCustoMercadorias) dresCustoMercadorias.textContent = formatarMoeda(custoTotal);
    if (dresImpostos) dresImpostos.textContent = formatarMoeda(impostos);
    if (dresLucroLiquido) dresLucroLiquido.textContent = formatarMoeda(lucroLiquido);
    if (dresMargemLucro) dresMargemLucro.textContent = `${margemLiquida.toFixed(1)}%`;
    if (dresLucroUnitario) dresLucroUnitario.textContent = formatarMoeda(lucroUnitario);
    
    // Rentabilidade
    const rentabilidadeROI = document.getElementById('rentabilidadeROI');
    const rentabilidadePayback = document.getElementById('rentabilidadePayback');
    const rentabilidadeLucroAnual = document.getElementById('rentabilidadeLucroAnual');
    const rentabilidadeTicketMedio = document.getElementById('rentabilidadeTicketMedio');
    
    if (rentabilidadeROI) rentabilidadeROI.textContent = `${roi.toFixed(1)}%`;
    if (rentabilidadePayback) rentabilidadePayback.textContent = payback.toFixed(1);
    if (rentabilidadeLucroAnual) rentabilidadeLucroAnual.textContent = formatarMoeda(lucroLiquido * 12);
    if (rentabilidadeTicketMedio) rentabilidadeTicketMedio.textContent = formatarMoeda(meuPreco);
    
    // Análise ponto de equilíbrio
    const percentualCapacidade = (pontoEquilibrio / qtdMensal) * 100;
    const analisePontoEquilibrioUn = document.getElementById('analisePontoEquilibrioUn');
    const analisePontoEquilibrioPercent = document.getElementById('analisePontoEquilibrioPercent');
    
    if (analisePontoEquilibrioUn) analisePontoEquilibrioUn.textContent = pontoEquilibrio;
    if (analisePontoEquilibrioPercent) analisePontoEquilibrioPercent.textContent = `${percentualCapacidade.toFixed(1)}%`;
    
    // Atualizar gráficos
    if (window.gerenciadorGraficos) {
        window.gerenciadorGraficos.atualizarTodosGraficosComDados();
    }
    
    // Salvar nos dados
    dadosNegocio.resultados = {
        receitaBruta,
        custoTotal,
        lucroLiquido,
        margemLucro: margemLiquida,
        pontoEquilibrio,
        roi,
        payback
    };
}

// ==================== FUNÇÕES DA TAB PROJEÇÕES ====================

function atualizarProjecoes() {
    const horizonte = parseInt(document.getElementById('horizonteProjecao').value) || 12;
    const cenario = document.getElementById('cenarioBase').value;
    const taxaCrescimento = parseFloat(document.getElementById('taxaCrescimentoProjecao').value) || 5;
    
    const resultados = dadosNegocio.resultados;
    if (!resultados.receitaBruta) {
        mostrarToast('Calcule os resultados primeiro!', 'warning');
        return;
    }
    
    // Fatores do cenário
    const fatores = {
        'otimista': 1.2,
        'realista': 1.0,
        'pessimista': 0.8
    };
    
    const fator = fatores[cenario] || 1.0;
    
    // Gerar dados de projeção
    const meses = Array.from({length: horizonte}, (_, i) => `Mês ${i + 1}`);
    const receitas = [];
    const lucros = [];
    
    let receitaAtual = resultados.receitaBruta * fator;
    let margemAtual = resultados.margemLucro;
    
    for (let i = 0; i < horizonte; i++) {
        receitas.push(receitaAtual);
        lucros.push(receitaAtual * (margemAtual / 100));
        
        // Crescimento composto
        receitaAtual *= (1 + taxaCrescimento/100);
        
        // Melhoria gradual da margem (0.1% por mês em cenário otimista)
        if (cenario === 'otimista') {
            margemAtual += 0.1;
        }
    }
    
    // Atualizar gráficos (implementar em graficos.js)
    console.log('Atualizando projeções:', { meses, receitas, lucros });
    
    // Atualizar metas
    const metaTrimestre1 = document.getElementById('metaTrimestre1');
    const metaTrimestre2 = document.getElementById('metaTrimestre2');
    
    if (metaTrimestre1) metaTrimestre1.textContent = formatarMoeda(receitas[2]);
    if (metaTrimestre2) metaTrimestre2.textContent = formatarMoeda(receitas[5]);
    
    // Atualizar resumo
    const projecaoInicio = document.getElementById('projecaoInicio');
    const projecaoMeio = document.getElementById('projecaoMeio');
    const projecaoFim = document.getElementById('projecaoFim');
    const lucroProjecaoInicio = document.getElementById('lucroProjecaoInicio');
    const lucroProjecaoMeio = document.getElementById('lucroProjecaoMeio');
    const lucroProjecaoFim = document.getElementById('lucroProjecaoFim');
    
    if (projecaoInicio) projecaoInicio.textContent = formatarMoeda(receitas[0]);
    if (projecaoMeio) projecaoMeio.textContent = formatarMoeda(receitas[5]);
    if (projecaoFim) projecaoFim.textContent = formatarMoeda(receitas[receitas.length - 1]);
    if (lucroProjecaoInicio) lucroProjecaoInicio.textContent = formatarMoeda(lucros[0]);
    if (lucroProjecaoMeio) lucroProjecaoMeio.textContent = formatarMoeda(lucros[5]);
    if (lucroProjecaoFim) lucroProjecaoFim.textContent = formatarMoeda(lucros[lucros.length - 1]);
}

// ==================== FUNÇÕES DA TAB RECOMENDAÇÕES ====================

function gerarRecomendacoes() {
    const resultados = dadosNegocio.resultados;
    const custos = dadosNegocio.custos;
    
    if (!resultados.margemLucro) {
        mostrarToast('Calcule os resultados primeiro!', 'warning');
        return;
    }
    
    // Gerar recomendações baseadas nos resultados
    const recomendacoes = {
        precificacao: [],
        custos: [],
        mercado: [],
        crescimento: []
    };
    
    // Análise de margem
    if (resultados.margemLucro < 15) {
        recomendacoes.precificacao.push(
            "Aumente o preço em 10-15% para atingir uma margem saudável",
            "Considere criar versões premium com preço maior"
        );
    } else if (resultados.margemLucro > 40) {
        recomendacoes.precificacao.push(
            "Sua margem está excelente - mantenha o preço atual",
            "Considere investir parte do lucro em marketing"
        );
    }
    
    // Análise de custos
    const custoFixoPercent = (custos.fixoMensal / custos.totalMensal) * 100;
    if (custoFixoPercent > 50) {
        recomendacoes.custos.push(
            "Custos fixos muito altos - renegocie aluguel/contratos",
            "Considere home office para reduzir custos com espaço"
        );
    }
    
    // Quantidade de recomendações por prioridade
    const prioridadeAlta = document.getElementById('prioridadeAlta');
    const prioridadeMedia = document.getElementById('prioridadeMedia');
    const prioridadeBaixa = document.getElementById('prioridadeBaixa');
    
    if (prioridadeAlta) prioridadeAlta.textContent = 
        recomendacoes.precificacao.length + recomendacoes.custos.length;
    if (prioridadeMedia) prioridadeMedia.textContent = 
        recomendacoes.mercado.length;
    if (prioridadeBaixa) prioridadeBaixa.textContent = 
        recomendacoes.crescimento.length;
    
    // Atualizar listas
    atualizarListaRecomendacoes('precificacao', recomendacoes.precificacao);
    atualizarListaRecomendacoes('custos', recomendacoes.custos);
    atualizarListaRecomendacoes('mercado', recomendacoes.mercado);
    atualizarListaRecomendacoes('crescimento', recomendacoes.crescimento);
}

function atualizarListaRecomendacoes(tipo, itens) {
    const lista = document.getElementById(`recomendacoes${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
    if (!lista) return;
    
    lista.innerHTML = '';
    
    itens.forEach(item => {
        const li = document.createElement('li');
        li.className = 'flex items-start';
        li.innerHTML = `
            <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
            <span>${item}</span>
        `;
        lista.appendChild(li);
    });
    
    if (itens.length === 0) {
        const li = document.createElement('li');
        li.className = 'flex items-start';
        li.innerHTML = `
            <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
            <span class="text-gray-500">Nenhuma ação necessária nesta área</span>
        `;
        lista.appendChild(li);
    }
}

// ==================== FUNÇÕES GERAIS ====================

function calcularTudo() {
    calcularCustos();
    calcularResultados();
    atualizarDashboard();
    mostrarToast('Todos os cálculos foram atualizados!', 'success');
}

function atualizarDashboard() {
    const resultados = dadosNegocio.resultados;
    const custos = dadosNegocio.custos;
    
    const dashFaturamento = document.getElementById('dashFaturamento');
    const dashLucro = document.getElementById('dashLucro');
    const dashMargem = document.getElementById('dashMargem');
    const dashPontoEquilibrio = document.getElementById('dashPontoEquilibrio');
    
    if (resultados.receitaBruta) {
        if (dashFaturamento) dashFaturamento.textContent = formatarMoeda(resultados.receitaBruta);
        if (dashLucro) dashLucro.textContent = formatarMoeda(resultados.lucroLiquido);
        if (dashMargem) dashMargem.textContent = `${resultados.margemLucro.toFixed(1)}%`;
        if (dashPontoEquilibrio) dashPontoEquilibrio.textContent = resultados.pontoEquilibrio;
        
        // Atualizar gráfico do dashboard
        atualizarGraficoDashboard();
    }
    
    // Atualizar progresso
    const progresso = calcularProgresso();
    const progressoDados = document.getElementById('progressoDados');
    const progressoBar = document.getElementById('progressoBar');
    const progressoDadosBar = document.getElementById('progressoDadosBar');
    
    if (progressoDados) progressoDados.textContent = `${progresso}%`;
    if (progressoBar) progressoBar.style.width = `${progresso}%`;
    if (progressoDadosBar) progressoDadosBar.style.width = `${progresso}%`;
}

function calcularProgresso() {
    let progresso = 0;
    
    // Verificar dados básicos
    if (document.getElementById('empresaNome').value) progresso += 10;
    if (document.getElementById('setorEmpresa').value) progresso += 10;
    if (document.getElementById('nomeProduto').value) progresso += 10;
    if (document.getElementById('publicoAlvo').value) progresso += 10;
    if (parseFloat(document.getElementById('qtdVendaMensal').value) > 0) progresso += 10;
    
    // Verificar custos
    if (parseFloat(document.getElementById('materiaPrima').value) > 0) progresso += 10;
    if (parseFloat(document.getElementById('salarios').value) > 0) progresso += 10;
    
    // Verificar preço
    if (parseFloat(document.getElementById('precoVendaFinal').value) > 0) progresso += 20;
    
    // Verificar mercado
    if (parseFloat(document.getElementById('precoMedioConcorrencia').value) > 0) progresso += 10;
    
    return Math.min(progresso, 100);
}

function atualizarPrecificacao() {
    // Atualizar precificação baseada nos custos
    const markupSugerido = dadosNegocio.custos.markupSugerido || 100;
    const markupSlider = document.getElementById('markupSlider');
    const markupInput = document.getElementById('markupInput');
    
    if (markupSlider) markupSlider.value = markupSugerido;
    if (markupInput) markupInput.value = markupSugerido;
    
    atualizarMarkup(markupSugerido);
}

function atualizarGraficoDashboard() {
    // Implementar gráfico do dashboard
    const ctx = document.getElementById('dashGraficoResumo');
    if (!ctx) return;
    
    // Destruir gráfico anterior se existir
    if (window.dashboardChart) {
        window.dashboardChart.destroy();
    }
    
    const resultados = dadosNegocio.resultados;
    if (!resultados.receitaBruta) return;
    
    window.dashboardChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
            datasets: [{
                label: 'Faturamento',
                data: [
                    resultados.receitaBruta * 0.8,
                    resultados.receitaBruta * 0.9,
                    resultados.receitaBruta,
                    resultados.receitaBruta * 1.1,
                    resultados.receitaBruta * 1.05,
                    resultados.receitaBruta * 1.15
                ],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// ==================== FUNÇÕES DE UTILIDADE ====================

function formatarMoeda(valor) {
    return 'R$ ' + parseFloat(valor || 0).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function mostrarToast(mensagem, tipo) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = mensagem;
    
    // Cor baseada no tipo
    const cores = {
        'success': 'bg-green-600',
        'error': 'bg-red-600',
        'warning': 'bg-yellow-600',
        'info': 'bg-blue-600'
    };
    
    toast.className = `toast ${cores[tipo] || 'bg-blue-600'}`;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const icon = document.getElementById('darkModeIcon');
    if (!icon) return;
    
    if (document.body.classList.contains('dark-mode')) {
        icon.className = 'fas fa-sun';
        localStorage.setItem('darkMode', 'enabled');
    } else {
        icon.className = 'fas fa-moon';
        localStorage.setItem('darkMode', 'disabled');
    }
}

function carregarDadosSalvos() {
    // Carregar modo dark
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        const darkModeIcon = document.getElementById('darkModeIcon');
        if (darkModeIcon) darkModeIcon.className = 'fas fa-sun';
    }
    
    // Carregar dados salvos
    const dados = localStorage.getItem('dadosNegocio');
    if (dados) {
        dadosNegocio = JSON.parse(dados);
        // Preencher campos do formulário com dados salvos
        // Implementar conforme necessário
    }
}

function saveProgress() {
    // Salvar dados nos objetos
    dadosNegocio.empresa = {
        nome: document.getElementById('empresaNome').value,
        cnpj: document.getElementById('empresaCnpj').value,
        setor: document.getElementById('setorEmpresa').value,
        tempoMercado: document.getElementById('tempoMercado').value
    };
    
    dadosNegocio.produto = {
        nome: document.getElementById('nomeProduto').value,
        categoria: document.getElementById('categoriaProduto').value,
        descricao: document.getElementById('descricaoProduto').value,
        unidade: document.getElementById('unidadeMedida').value
    };
    
    // Salvar no localStorage
    localStorage.setItem('dadosNegocio', JSON.stringify(dadosNegocio));
    
    mostrarToast('Progresso salvo com sucesso!', 'success');
}

function salvarRascunho() {
    saveProgress();
}

function exportToExcel() {
    // Implementar exportação para Excel
    mostrarToast('Exportação para Excel em desenvolvimento!', 'info');
}

function gerarRelatorioCompleto() {
    // Implementar geração de relatório PDF
    mostrarToast('Geração de relatório PDF em desenvolvimento!', 'info');
}

function resetarCalculadora() {
    if (confirm('Tem certeza que deseja reiniciar a calculadora? Todos os dados serão perdidos.')) {
        localStorage.removeItem('dadosNegocio');
        location.reload();
    }
}

function mostrarTooltip(event) {
    const tooltip = event.target.getAttribute('data-tooltip');
    if (tooltip) {
        // Criar tooltip
        const tooltipEl = document.createElement('div');
        tooltipEl.className = 'tooltip-content';
        tooltipEl.textContent = tooltip;
        tooltipEl.style.position = 'absolute';
        tooltipEl.style.left = `${event.clientX}px`;
        tooltipEl.style.top = `${event.clientY}px`;
        document.body.appendChild(tooltipEl);
        
        // Remover depois de 3 segundos
        setTimeout(() => {
            if (tooltipEl.parentNode) {
                tooltipEl.parentNode.removeChild(tooltipEl);
            }
        }, 3000);
    }
}

function esconderTooltip() {
    const tooltips = document.querySelectorAll('.tooltip-content');
    tooltips.forEach(tooltip => {
        if (tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
        }
    });
}

function abrirModalGrafico(tipo) {
    const modal = document.getElementById('modalGrafico');
    const modalTitulo = document.getElementById('modalTitulo');
    
    if (!modal || !modalTitulo) return;
    
    modal.style.display = 'flex';
    modalTitulo.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1).replace('-', ' ');
    
    // Aqui você criaria o gráfico no modal baseado no tipo
    // Por enquanto, vamos apenas mostrar um exemplo
    const ctx = document.getElementById('modalCanvas');
    if (!ctx) return;
    
    // Destruir gráfico anterior se existir
    if (window.modalChart) {
        window.modalChart.destroy();
    }
    
    // Criar novo gráfico (exemplo)
    window.modalChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
            datasets: [{
                label: 'Faturamento',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function fecharModal() {
    const modal = document.getElementById('modalGrafico');
    if (modal) modal.style.display = 'none';
    
    if (window.modalChart) {
        window.modalChart.destroy();
        window.modalChart = null;
    }
}

// ==================== FUNÇÕES DE GRÁFICOS (PARA O ARQUIVO GRAFICOS.JS) ====================

function atualizarTodosGraficosComDados() {
    if (window.gerenciadorGraficos) {
        window.gerenciadorGraficos.atualizarTodosGraficosComDados();
    }
}

function exportarTodosGraficos() {
    if (window.gerenciadorGraficos) {
        window.gerenciadorGraficos.exportarTodosGraficos();
    }
}

function exportarGraficoParaImagem(idGrafico, nomeArquivo) {
    if (window.gerenciadorGraficos && window.gerenciadorGraficos.exportarGraficoParaImagem) {
        window.gerenciadorGraficos.exportarGraficoParaImagem(idGrafico, nomeArquivo);
    }
}

// ==================== INICIALIZAÇÃO DE EVENTOS ====================

function inicializarEventos() {
    // Atualizar valor percebido quando sliders mudam
    const valorQualidade = document.getElementById('valorQualidade');
    const valorAtendimento = document.getElementById('valorAtendimento');
    const valorMarca = document.getElementById('valorMarca');
    
    if (valorQualidade) valorQualidade.addEventListener('input', atualizarValorPercebido);
    if (valorAtendimento) valorAtendimento.addEventListener('input', atualizarValorPercebido);
    if (valorMarca) valorMarca.addEventListener('input', atualizarValorPercebido);
    
    // Auto-save ao mudar dados
    document.querySelectorAll('#dados input, #dados select').forEach(element => {
        element.addEventListener('change', saveProgress);
    });
    
    // Calcular custos ao mudar valores
    document.querySelectorAll('#custos input').forEach(element => {
        element.addEventListener('input', calcularCustos);
    });
    
    // Aplicar dark mode se configurado
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
        const darkModeIcon = document.getElementById('darkModeIcon');
        if (darkModeIcon) darkModeIcon.className = 'fas fa-sun';
    }
    
    // Inicializar primeiro passo
    mostrarPassoDados(1);
}

// Atualizar progresso quando campos são alterados
function atualizarProgresso() {
    const progresso = calcularProgresso();
    const progressoDados = document.getElementById('progressoDados');
    const progressoBar = document.getElementById('progressoBar');
    const progressoDadosBar = document.getElementById('progressoDadosBar');
    
    if (progressoDados) progressoDados.textContent = `${progresso}%`;
    if (progressoBar) progressoBar.style.width = `${progresso}%`;
    if (progressoDadosBar) progressoDadosBar.style.width = `${progresso}%`;
    // ==================== FUNÇÕES DE SINCRONIZAÇÃO DE GRÁFICOS ====================

function sincronizarGraficosComDados() {
    if (!window.gerenciadorGraficos) {
        console.warn('Gerenciador de gráficos não inicializado');
        return;
    }

    // Obter dados atuais
    const custos = dadosNegocio.custos;
    const resultados = dadosNegocio.resultados;
    const preco = parseFloat(document.getElementById('precoVendaFinal').value) || 0;
    
    // Atualizar gráfico de composição
    if (window.gerenciadorGraficos.graficos.composicaoPreco && custos && preco > 0) {
        const custoVarUnit = custos.variavelUnitario || 0;
        const custoFixoUnit = custos.fixoUnitario || 0;
        const impostos = preco * 0.07; // 7% estimado
        const lucro = preco - custoVarUnit - custoFixoUnit - impostos;
        
        window.gerenciadorGraficos.graficos.composicaoPreco.data.datasets[0].data = [
            Math.max(custoVarUnit, 0),
            Math.max(custoFixoUnit, 0),
            Math.max(impostos, 0),
            Math.max(lucro, 0)
        ];
        window.gerenciadorGraficos.graficos.composicaoPreco.update();
    }
    
    // Atualizar gráfico de distribuição
    if (window.gerenciadorGraficos.graficos.distribuicaoPreco && custos && preco > 0) {
        const valores = [
            custos.variavelUnitario || 15,
            custos.fixoUnitario || 10,
            preco * 0.07,
            preco * 0.20, // Lucro estimado
            preco * 0.05, // Marketing
            preco * 0.03  // Outros
        ];
        
        window.gerenciadorGraficos.graficos.distribuicaoPreco.data.datasets[0].data = valores;
        window.gerenciadorGraficos.graficos.distribuicaoPreco.update();
    }
    
    // Atualizar gráfico de comparação
    if (window.gerenciadorGraficos.graficos.comparacaoConcorrencia && preco > 0) {
        const precoMin = parseFloat(document.getElementById('precoMinConcorrencia').value) || 45;
        const precoMedio = parseFloat(document.getElementById('precoMedioConcorrencia').value) || 60;
        const precoMax = parseFloat(document.getElementById('precoMaxConcorrencia').value) || 80;
        
        window.gerenciadorGraficos.graficos.comparacaoConcorrencia.data.datasets[0].data = [
            precoMin,
            precoMedio,
            precoMax * 0.9,
            preco
        ];
        window.gerenciadorGraficos.graficos.comparacaoConcorrencia.update();
    }
}

// Chamar sincronização após cálculos
function calcularTudoCompleto() {
    calcularCustos();
    calcularResultados();
    sincronizarGraficosComDados();
    mostrarToast('Cálculos e gráficos atualizados!', 'success');
}

// Expor função globalmente
window.sincronizarGraficosComDados = sincronizarGraficosComDados;
window.calcularTudoCompleto = calcularTudoCompleto;
}

// Expor funções para uso global
window.calcularCustos = calcularCustos;
window.calcularResultados = calcularResultados;
window.calcularTudo = calcularTudo;
window.openTab = openTab;
window.toggleDarkMode = toggleDarkMode;
window.saveProgress = saveProgress;
window.analisarConcorrencia = analisarConcorrencia;
window.atualizarValorPercebido = atualizarValorPercebido;
window.exportarTodosGraficos = exportarTodosGraficos;
window.atualizarTodosGraficosComDados = atualizarTodosGraficosComDados;
window.exportarGraficoParaImagem = exportarGraficoParaImagem;
window.abrirModalGrafico = abrirModalGrafico;
window.fecharModal = fecharModal;
