// Aguarda o carregamento completo da página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página carregada - iniciando...');
    
    // Verificar se Chart.js foi carregado
    if (typeof Chart === 'undefined') {
        console.error('Chart.js não foi carregado!');
        mostrarToast('Erro ao carregar gráficos. Recarregue a página.', 'error');
        return;
    }
    
    console.log('Chart.js carregado com sucesso! Versão:', Chart.version);
    
    // Inicializar funcionalidades básicas
    inicializarAplicacao();
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
let graficosInicializados = false;

// ==================== FUNÇÕES DE INICIALIZAÇÃO ====================

function inicializarAplicacao() {
    try {
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
        
        // Inicializar gráficos se disponível
        if (typeof window.gerenciadorGraficos !== 'undefined') {
            window.gerenciadorGraficos.inicializarTodosGraficos();
            graficosInicializados = true;
        }
        
        // Inicializar primeiro passo
        mostrarPassoDados(1);
        
        console.log('Aplicação inicializada com sucesso!');
    } catch (error) {
        console.error('Erro na inicialização:', error);
        mostrarToast('Erro ao inicializar aplicação. Recarregue a página.', 'error');
    }
}

// ==================== FUNÇÕES DE NAVEGAÇÃO ====================

function openTab(tabName) {
    try {
        // Validar tabName
        const tabsValidas = ['dashboard', 'dados', 'custos', 'precificacao', 'mercado', 'resultados', 'graficos', 'projecoes', 'recomendacoes'];
        if (!tabsValidas.includes(tabName)) {
            console.error('Tab inválida:', tabName);
            return;
        }
        
        // Esconder todas as tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remover classe ativa de todos os botões
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.className = btn.className.replace('gradient-primary text-white', 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300');
        });
        
        // Mostrar tab selecionada
        const tabElement = document.getElementById(tabName);
        if (!tabElement) {
            console.error('Elemento tab não encontrado:', tabName);
            return;
        }
        tabElement.classList.add('active');
        
        // Atualizar botão ativo
        const tabId = `tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`;
        const tabBtnElement = document.getElementById(tabId);
        if (tabBtnElement) {
            tabBtnElement.className = 'tab-btn px-4 py-3 rounded-xl font-medium gradient-primary text-white shadow-md hover-lift';
        }
        
        // Atualizar progresso do wizard
        atualizarProgressoWizard(tabName);
        
        // Calcular dados se necessário
        if (tabName === 'dashboard') {
            atualizarDashboard();
        } else if (tabName === 'resultados') {
            calcularResultados();
        } else if (tabName === 'graficos' && graficosInicializados) {
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
    } catch (error) {
        console.error('Erro ao abrir tab:', error);
        mostrarToast('Erro ao navegar entre abas', 'error');
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
    if (progressBar && progresso[tabAtual] !== undefined) {
        progressBar.style.width = `${progresso[tabAtual]}%`;
    }
}

// ==================== FUNÇÕES DA TAB DADOS BÁSICOS ====================

function mostrarPassoDados(passo) {
    // Validar passo
    if (passo < 1 || passo > 4) {
        console.error('Passo inválido:', passo);
        return;
    }
    
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
            btnAvancar.onclick = function() { 
                openTab('custos');
            };
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
    try {
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
        
        // Validações básicas
        if (qtdMensal <= 0) {
            mostrarToast('Quantidade mensal deve ser maior que zero', 'warning');
            return;
        }
        
        // Cálculos
        const custoVariavelUnitario = materiaPrima + embalagem + frete;
        const custoFixoMensal = aluguel + salarios + contas + marketing + das + manutencao + outrosFixos + 
                               softwareGestao + softwareDesign + softwareMarketing + softwareOutros;
        const custoFixoUnitario = qtdMensal > 0 ? custoFixoMensal / qtdMensal : 0;
        const custoTotalUnitario = custoVariavelUnitario + custoFixoUnitario;
        const custoTotalMensal = custoTotalUnitario * qtdMensal;
        
        // Calcular percentuais sobre preço
        const percentuaisVenda = (comissoesPercent + impostosVenda + taxasPlataforma) / 100;
        
        // Sugerir markup baseado no setor
        let markupSugerido = 100;
        const setor = document.getElementById('setorEmpresa')?.value || '';
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
        atualizarElementoTexto('resumoCustoUnitario', formatarMoeda(custoTotalUnitario));
        atualizarElementoTexto('resumoCustoFixo', formatarMoeda(custoFixoMensal));
        atualizarElementoTexto('resumoCustoTotal', formatarMoeda(custoTotalMensal));
        atualizarElementoTexto('resumoMarkupSugerido', `${markupSugerido}%`);
        
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
            const preco = parseFloat(document.getElementById('precoVendaFinal')?.value) || 0;
            window.gerenciadorGraficos.atualizarGraficoDistribuicaoPreco(dadosNegocio.custos, preco);
        }
        
    } catch (error) {
        console.error('Erro ao calcular custos:', error);
        mostrarToast('Erro ao calcular custos. Verifique os valores.', 'error');
    }
}

function sugerirCustosPorSetor() {
    const setor = document.getElementById('setorEmpresa')?.value;
    
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
    } else {
        mostrarToast('Setor não encontrado na base de templates', 'warning');
    }
}

// ==================== FUNÇÕES DA TAB PRECIFICAÇÃO ====================

function selecionarMetodo(metodo) {
    const metodosValidos = ['markup', 'valor-percebido', 'concorrencia', 'custo-meta', 'dinamica'];
    if (!metodosValidos.includes(metodo)) {
        console.error('Método inválido:', metodo);
        return;
    }
    
    metodoPrecificacaoSelecionado = metodo;
    const metodoSelecionadoElement = document.getElementById('metodoSelecionado');
    if (metodoSelecionadoElement) {
        metodoSelecionadoElement.textContent = metodo.charAt(0).toUpperCase() + metodo.slice(1).replace('-', ' ') + ' (Recomendado)';
    }
    
    // Mostrar configuração específica do método
    document.querySelectorAll('.metodo-config').forEach(div => {
        div.style.display = 'none';
    });
    
    if (metodo === 'markup') {
        const configMarkup = document.getElementById('configMetodoMarkup');
        if (configMarkup) configMarkup.style.display = 'block';
        atualizarMarkup(document.getElementById('markupInput')?.value || 100);
    }
    
    // Recalcular
    atualizarPrecificacao();
}

function atualizarMarkup(valor) {
    const markupValor = parseFloat(valor) || 100;
    
    // Validar valor do markup
    if (markupValor < 0) {
        mostrarToast('Markup não pode ser negativo', 'warning');
        return;
    }
    
    const markupSlider = document.getElementById('markupSlider');
    const markupInput = document.getElementById('markupInput');
    
    if (markupSlider) markupSlider.value = markupValor;
    if (markupInput) markupInput.value = markupValor;
    
    // Atualizar preços sugeridos
    const custoUnitario = dadosNegocio.custos.totalUnitario || 0;
    
    // Preços com diferentes markups
    const precoMin = custoUnitario * 1.6;
    const precoMedio = custoUnitario * 2.0;
    const precoMax = custoUnitario * 2.5;
    const precoAtual = custoUnitario * (1 + markupValor/100);
    
    atualizarElementoTexto('precoMarkupMin', formatarMoeda(precoMin));
    atualizarElementoTexto('precoMarkupMedio', formatarMoeda(precoMedio));
    atualizarElementoTexto('precoMarkupMax', formatarMoeda(precoMax));
    atualizarElementoTexto('precoMarkupAtual', formatarMoeda(precoAtual));
    
    // Atualizar preço final sugerido
    const precoFinalSugerido = document.getElementById('precoFinalSugerido');
    const precoVendaFinal = document.getElementById('precoVendaFinal');
    
    if (precoFinalSugerido) precoFinalSugerido.textContent = formatarMoeda(precoAtual);
    if (precoVendaFinal) {
        precoVendaFinal.value = precoAtual.toFixed(2);
        atualizarPrecoFinal(precoAtual);
    }
    
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
    
    atualizarElementoTexto('compCustoVarUnit', formatarMoeda(custoVarUnit));
    atualizarElementoTexto('compCustoFixoUnit', formatarMoeda(custoFixoUnit));
    atualizarElementoTexto('compCustoTotalUnit', formatarMoeda(custoTotalUnit));
    atualizarElementoTexto('compMarkupAplicado', `${markup.toFixed(1)}%`);
    atualizarElementoTexto('compPrecoFinal', formatarMoeda(preco));
    atualizarElementoTexto('lucroPorUnidade', formatarMoeda(lucroUnitario));
    atualizarElementoTexto('margemLucroUnidade', `${margemLucro.toFixed(1)}%`);
    
    // Atualizar gráfico de composição
    atualizarGraficoComposicao(preco, custoVarUnit, custoFixoUnit, markup);
}

function atualizarGraficoComposicao(preco, custoVarUnit, custoFixoUnit, markup) {
    if (window.gerenciadorGraficos && window.gerenciadorGraficos.atualizarGraficoComposicao) {
        window.gerenciadorGraficos.atualizarGraficoComposicao(preco, custoVarUnit, custoFixoUnit, markup);
    }
}

function aplicarPrecoPsicologico(tipo) {
    const precoAtual = parseFloat(document.getElementById('precoVendaFinal')?.value) || 0;
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
        default:
            console.error('Tipo de preço psicológico inválido:', tipo);
            return;
    }
    
    const precoVendaFinal = document.getElementById('precoVendaFinal');
    if (precoVendaFinal) {
        precoVendaFinal.value = novoPreco.toFixed(2);
        atualizarPrecoFinal(novoPreco);
    }
}

function atualizarPrecoFinal(valor) {
    const preco = parseFloat(valor) || 0;
    const descontoPercent = parseFloat(document.getElementById('descontoPromocional')?.value) || 0;
    
    // Validar desconto
    if (descontoPercent < 0 || descontoPercent > 100) {
        mostrarToast('Desconto deve estar entre 0% e 100%', 'warning');
        return;
    }
    
    // Aplicar desconto se necessário
    const precoComDesconto = preco * (1 - descontoPercent/100);
    
    // Atualizar composição
    atualizarComposicaoPreco(precoComDesconto);
    
    // Calcular impacto
    calcularImpactoPreco(precoComDesconto);
    
    // Atualizar preços psicológicos
    atualizarElementoTexto('precoPsico99', formatarMoeda(Math.floor(precoComDesconto) + 0.99));
    atualizarElementoTexto('precoPsico95', formatarMoeda(Math.floor(precoComDesconto) + 0.95));
    atualizarElementoTexto('precoPsico90', formatarMoeda(Math.floor(precoComDesconto) + 0.90));
    atualizarElementoTexto('precoPsicoArred', formatarMoeda(Math.round(precoComDesconto)));
}

function calcularImpactoPreco(preco) {
    const custos = dadosNegocio.custos;
    const qtdMensal = custos.qtdMensal || 100;
    
    if (!custos.totalUnitario || preco <= 0) return;
    
    const lucroUnitario = preco - custos.totalUnitario;
    const lucroMensal = lucroUnitario * qtdMensal;
    const margemLucro = (lucroUnitario / preco) * 100;
    const pontoEquilibrio = lucroUnitario > 0 ? Math.ceil(custos.fixoMensal / lucroUnitario) : Infinity;
    
    atualizarElementoTexto('impactoMargem', `${margemLucro.toFixed(1)}%`);
    atualizarElementoTexto('impactoLucroUnit', formatarMoeda(lucroUnitario));
    atualizarElementoTexto('impactoLucroMensal', formatarMoeda(lucroMensal));
    atualizarElementoTexto('impactoPontoEquilibrio', `${pontoEquilibrio} unidades`);
    
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
    try {
        const precoMin = parseFloat(document.getElementById('precoMinConcorrencia')?.value) || 0;
        const precoMedio = parseFloat(document.getElementById('precoMedioConcorrencia')?.value) || 0;
        const precoMax = parseFloat(document.getElementById('precoMaxConcorrencia')?.value) || 0;
        const meuPreco = parseFloat(document.getElementById('precoVendaFinal')?.value) || 0;
        
        if (!precoMin || !precoMedio || !precoMax) {
            mostrarToast('Preencha todos os preços da concorrência!', 'warning');
            return;
        }
        
        // Validações
        if (precoMin > precoMedio || precoMedio > precoMax) {
            mostrarToast('Preços inválidos: Mínimo < Médio < Máximo', 'warning');
            return;
        }
        
        // Calcular posição
        const diferencaMedia = ((meuPreco - precoMedio) / precoMedio) * 100;
        const posicaoRelativa = ((meuPreco - precoMin) / (precoMax - precoMin)) * 100;
        
        // Atualizar indicadores
        atualizarElementoTexto('diferencaMedia', `${diferencaMedia >= 0 ? '+' : ''}${diferencaMedia.toFixed(1)}%`);
        
        const espacoAumento = precoMax > meuPreco ? ((precoMax - meuPreco) / meuPreco * 100) : 0;
        atualizarElementoTexto('espacoAumento', `${espacoAumento.toFixed(1)}%`);
        
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
        atualizarElementoTexto('vantagemCompetitiva', vantagem);
        
        // Atualizar gráfico de comparação
        if (window.gerenciadorGraficos) {
            window.gerenciadorGraficos.atualizarGraficoComparacaoConcorrencia(precoMin, precoMedio, precoMax, meuPreco);
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
        
        atualizarElementoTexto('analisePosicao', analise);
        
        // Valor percebido
        atualizarValorPercebido();
        
    } catch (error) {
        console.error('Erro na análise de concorrência:', error);
        mostrarToast('Erro ao analisar concorrência', 'error');
    }
}

function atualizarValorPercebido() {
    try {
        const qualidade = parseInt(document.getElementById('valorQualidade')?.value) || 8;
        const atendimento = parseInt(document.getElementById('valorAtendimento')?.value) || 7;
        const marca = parseInt(document.getElementById('valorMarca')?.value) || 6;
        
        // Validar valores (1-10)
        const valores = [qualidade, atendimento, marca];
        const valoresValidos = valores.every(v => v >= 1 && v <= 10);
        
        if (!valoresValidos) {
            mostrarToast('Valores devem estar entre 1 e 10', 'warning');
            return;
        }
        
        const valorTotal = (qualidade + atendimento + marca) / 3;
        
        atualizarElementoTexto('valorPercebidoScore', valorTotal.toFixed(1));
        
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
        
        atualizarElementoTexto('nivelValorPercebido', nivel);
        
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
        
    } catch (error) {
        console.error('Erro ao atualizar valor percebido:', error);
    }
}

// ==================== FUNÇÕES DA TAB RESULTADOS ====================

function calcularResultados() {
    try {
        const custos = dadosNegocio.custos;
        const meuPreco = parseFloat(document.getElementById('precoVendaFinal')?.value) || 0;
        const qtdMensal = custos.qtdMensal || 100;
        
        if (!meuPreco || !custos.totalUnitario) {
            mostrarToast('Calcule custos e defina um preço primeiro!', 'warning');
            return;
        }
        
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
        const pontoEquilibrio = lucroUnitario > 0 ? Math.ceil(custos.fixoMensal / lucroUnitario) : Infinity;
        
        // ROI e Payback (estimados)
        const investimentoInicial = custos.fixoMensal * 3; // Estimativa
        const roi = investimentoInicial > 0 ? (lucroLiquido * 12 / investimentoInicial) * 100 : 0;
        const payback = lucroLiquido > 0 ? investimentoInicial / lucroLiquido : Infinity;
        
        // Atualizar KPIs
        atualizarElementoTexto('kpiFaturamento', formatarMoeda(receitaBruta));
        atualizarElementoTexto('kpiLucro', formatarMoeda(lucroLiquido));
        atualizarElementoTexto('kpiMargem', `${margemLiquida.toFixed(1)}%`);
        atualizarElementoTexto('kpiPontoEquilibrio', pontoEquilibrio);
        
        // Atualizar demonstração de resultados
        atualizarElementoTexto('dresReceitaBruta', formatarMoeda(receitaBruta));
        atualizarElementoTexto('dresCustoMercadorias', formatarMoeda(custoTotal));
        atualizarElementoTexto('dresImpostos', formatarMoeda(impostos));
        atualizarElementoTexto('dresLucroLiquido', formatarMoeda(lucroLiquido));
        atualizarElementoTexto('dresMargemLucro', `${margemLiquida.toFixed(1)}%`);
        atualizarElementoTexto('dresLucroUnitario', formatarMoeda(lucroUnitario));
        
        // Rentabilidade
        atualizarElementoTexto('rentabilidadeROI', `${roi.toFixed(1)}%`);
        atualizarElementoTexto('rentabilidadePayback', payback.toFixed(1));
        atualizarElementoTexto('rentabilidadeLucroAnual', formatarMoeda(lucroLiquido * 12));
        atualizarElementoTexto('rentabilidadeTicketMedio', formatarMoeda(meuPreco));
        
        // Análise ponto de equilíbrio
        const percentualCapacidade = qtdMensal > 0 ? (pontoEquilibrio / qtdMensal) * 100 : 100;
        atualizarElementoTexto('analisePontoEquilibrioUn', pontoEquilibrio);
        atualizarElementoTexto('analisePontoEquilibrioPercent', `${percentualCapacidade.toFixed(1)}%`);
        
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
        
    } catch (error) {
        console.error('Erro ao calcular resultados:', error);
        mostrarToast('Erro ao calcular resultados financeiros', 'error');
    }
}

// ==================== FUNÇÕES DA TAB PROJEÇÕES ====================

function atualizarProjecoes() {
    try {
        const horizonte = parseInt(document.getElementById('horizonteProjecao')?.value) || 12;
        const cenario = document.getElementById('cenarioBase')?.value || 'realista';
        const taxaCrescimento = parseFloat(document.getElementById('taxaCrescimentoProjecao')?.value) || 5;
        
        const resultados = dadosNegocio.resultados;
        if (!resultados.receitaBruta) {
            mostrarToast('Calcule os resultados primeiro!', 'warning');
            return;
        }
        
        // Validar horizonte
        if (horizonte < 1 || horizonte > 60) {
            mostrarToast('Horizonte deve estar entre 1 e 60 meses', 'warning');
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
        
        // Atualizar gráficos
        if (window.gerenciadorGraficos && window.gerenciadorGraficos.atualizarProjecoes) {
            window.gerenciadorGraficos.atualizarProjecoes(meses, receitas, lucros);
        }
        
        // Atualizar metas
        if (horizonte >= 3) {
            atualizarElementoTexto('metaTrimestre1', formatarMoeda(receitas[2]));
        }
        if (horizonte >= 6) {
            atualizarElementoTexto('metaTrimestre2', formatarMoeda(receitas[5]));
        }
        
        // Atualizar resumo
        if (horizonte >= 1) {
            atualizarElementoTexto('projecaoInicio', formatarMoeda(receitas[0]));
            atualizarElementoTexto('lucroProjecaoInicio', formatarMoeda(lucros[0]));
        }
        
        if (horizonte >= 6) {
            atualizarElementoTexto('projecaoMeio', formatarMoeda(receitas[5]));
            atualizarElementoTexto('lucroProjecaoMeio', formatarMoeda(lucros[5]));
        }
        
        if (horizonte >= 1) {
            atualizarElementoTexto('projecaoFim', formatarMoeda(receitas[receitas.length - 1]));
            atualizarElementoTexto('lucroProjecaoFim', formatarMoeda(lucros[lucros.length - 1]));
        }
        
    } catch (error) {
        console.error('Erro ao atualizar projeções:', error);
        mostrarToast('Erro ao calcular projeções', 'error');
    }
}

// ==================== FUNÇÕES DA TAB RECOMENDAÇÕES ====================

function gerarRecomendacoes() {
    try {
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
        const custoFixoPercent = custos.totalMensal > 0 ? (custos.fixoMensal / custos.totalMensal) * 100 : 0;
        if (custoFixoPercent > 50) {
            recomendacoes.custos.push(
                "Custos fixos muito altos - renegocie aluguel/contratos",
                "Considere home office para reduzir custos com espaço"
            );
        }
        
        // Análise de mercado
        const preco = parseFloat(document.getElementById('precoVendaFinal')?.value) || 0;
        const precoMedio = parseFloat(document.getElementById('precoMedioConcorrencia')?.value) || 0;
        
        if (preco > 0 && precoMedio > 0) {
            const diferenca = ((preco - precoMedio) / precoMedio) * 100;
            if (diferenca > 20) {
                recomendacoes.mercado.push(
                    "Preço muito acima da concorrência - avalie diferenciais",
                    "Comunique melhor o valor agregado do seu produto"
                );
            } else if (diferenca < -10) {
                recomendacoes.mercado.push(
                    "Preço muito baixo - você pode estar deixando lucro na mesa",
                    "Pesquise se há espaço para aumentar o preço"
                );
            }
        }
        
        // Quantidade de recomendações por prioridade
        atualizarElementoTexto('prioridadeAlta', 
            recomendacoes.precificacao.length + recomendacoes.custos.length);
        atualizarElementoTexto('prioridadeMedia', 
            recomendacoes.mercado.length);
        atualizarElementoTexto('prioridadeBaixa', 
            recomendacoes.crescimento.length);
        
        // Atualizar listas
        atualizarListaRecomendacoes('precificacao', recomendacoes.precificacao);
        atualizarListaRecomendacoes('custos', recomendacoes.custos);
        atualizarListaRecomendacoes('mercado', recomendacoes.mercado);
        atualizarListaRecomendacoes('crescimento', recomendacoes.crescimento);
        
    } catch (error) {
        console.error('Erro ao gerar recomendações:', error);
        mostrarToast('Erro ao gerar recomendações', 'error');
    }
}

function atualizarListaRecomendacoes(tipo, itens) {
    const lista = document.getElementById(`recomendacoes${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
    if (!lista) return;
    
    lista.innerHTML = '';
    
    if (itens.length === 0) {
        const li = document.createElement('li');
        li.className = 'flex items-start';
        li.innerHTML = `
            <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
            <span class="text-gray-500 dark:text-gray-400">Nenhuma ação necessária nesta área</span>
        `;
        lista.appendChild(li);
        return;
    }
    
    itens.forEach(item => {
        const li = document.createElement('li');
        li.className = 'flex items-start mb-2';
        li.innerHTML = `
            <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
            <span>${item}</span>
        `;
        lista.appendChild(li);
    });
}

// ==================== FUNÇÕES GERAIS ====================

function calcularTudo() {
    try {
        calcularCustos();
        calcularResultados();
        atualizarDashboard();
        mostrarToast('Todos os cálculos foram atualizados!', 'success');
    } catch (error) {
        console.error('Erro ao calcular tudo:', error);
        mostrarToast('Erro ao calcular todos os dados', 'error');
    }
}

function atualizarDashboard() {
    try {
        const resultados = dadosNegocio.resultados;
        const custos = dadosNegocio.custos;
        
        if (resultados.receitaBruta) {
            atualizarElementoTexto('dashFaturamento', formatarMoeda(resultados.receitaBruta));
            atualizarElementoTexto('dashLucro', formatarMoeda(resultados.lucroLiquido));
            atualizarElementoTexto('dashMargem', `${resultados.margemLucro.toFixed(1)}%`);
            atualizarElementoTexto('dashPontoEquilibrio', resultados.pontoEquilibrio);
            
            // Atualizar gráfico do dashboard
            atualizarGraficoDashboard();
        }
        
        // Atualizar progresso
        const progresso = calcularProgresso();
        atualizarElementoTexto('progressoDados', `${progresso}%`);
        
        const progressoBar = document.getElementById('progressoBar');
        const progressoDadosBar = document.getElementById('progressoDadosBar');
        
        if (progressoBar) progressoBar.style.width = `${progresso}%`;
        if (progressoDadosBar) progressoDadosBar.style.width = `${progresso}%`;
        
    } catch (error) {
        console.error('Erro ao atualizar dashboard:', error);
    }
}

function calcularProgresso() {
    let progresso = 0;
    
    // Verificar dados básicos
    if (document.getElementById('empresaNome')?.value) progresso += 10;
    if (document.getElementById('setorEmpresa')?.value) progresso += 10;
    if (document.getElementById('nomeProduto')?.value) progresso += 10;
    if (document.getElementById('publicoAlvo')?.value) progresso += 10;
    if (parseFloat(document.getElementById('qtdVendaMensal')?.value) > 0) progresso += 10;
    
    // Verificar custos
    if (parseFloat(document.getElementById('materiaPrima')?.value) > 0) progresso += 10;
    if (parseFloat(document.getElementById('salarios')?.value) > 0) progresso += 10;
    
    // Verificar preço
    if (parseFloat(document.getElementById('precoVendaFinal')?.value) > 0) progresso += 20;
    
    // Verificar mercado
    if (parseFloat(document.getElementById('precoMedioConcorrencia')?.value) > 0) progresso += 10;
    
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
    const ctx = document.getElementById('dashGraficoResumo');
    if (!ctx) return;
    
    // Destruir gráfico anterior se existir
    if (window.dashboardChart) {
        window.dashboardChart.destroy();
    }
    
    const resultados = dadosNegocio.resultados;
    if (!resultados.receitaBruta) return;
    
    try {
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
                plugins: {
                    legend: {
                        display: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Erro ao criar gráfico do dashboard:', error);
    }
}

// ==================== FUNÇÕES DE UTILIDADE ====================

function formatarMoeda(valor) {
    if (isNaN(valor) || valor === null || valor === undefined) {
        return 'R$ 0,00';
    }
    
    return 'R$ ' + parseFloat(valor).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function mostrarToast(mensagem, tipo) {
    const toast = document.getElementById('toast');
    if (!toast) {
        // Criar toast se não existir
        const toastDiv = document.createElement('div');
        toastDiv.id = 'toast';
        toastDiv.className = 'toast';
        document.body.appendChild(toastDiv);
        return mostrarToast(mensagem, tipo);
    }
    
    toast.textContent = mensagem;
    
    // Cor baseada no tipo
    const cores = {
        'success': 'bg-green-600',
        'error': 'bg-red-600',
        'warning': 'bg-yellow-600',
        'info': 'bg-blue-600'
    };
    
    toast.className = `toast ${cores[tipo] || 'bg-blue-600'} fixed top-4 right-4 px-4 py-3 rounded-lg text-white shadow-lg z-50`;
    toast.style.display = 'block';
    
    // Animar entrada
    toast.style.animation = 'slideIn 0.3s ease-out';
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 300);
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
    try {
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
            preencherCamposComDados();
        }
    } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
        localStorage.removeItem('dadosNegocio');
        localStorage.removeItem('darkMode');
    }
}

function preencherCamposComDados() {
    // Empresa
    if (dadosNegocio.empresa.nome) {
        document.getElementById('empresaNome').value = dadosNegocio.empresa.nome;
    }
    if (dadosNegocio.empresa.setor) {
        document.getElementById('setorEmpresa').value = dadosNegocio.empresa.setor;
    }
    // Adicione outros campos conforme necessário
}

function saveProgress() {
    try {
        // Salvar dados nos objetos
        dadosNegocio.empresa = {
            nome: document.getElementById('empresaNome')?.value || '',
            cnpj: document.getElementById('empresaCnpj')?.value || '',
            setor: document.getElementById('setorEmpresa')?.value || '',
            tempoMercado: document.getElementById('tempoMercado')?.value || ''
        };
        
        dadosNegocio.produto = {
            nome: document.getElementById('nomeProduto')?.value || '',
            categoria: document.getElementById('categoriaProduto')?.value || '',
            descricao: document.getElementById('descricaoProduto')?.value || '',
            unidade: document.getElementById('unidadeMedida')?.value || ''
        };
        
        // Salvar no localStorage
        localStorage.setItem('dadosNegocio', JSON.stringify(dadosNegocio));
        
        mostrarToast('Progresso salvo com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao salvar progresso:', error);
        mostrarToast('Erro ao salvar progresso', 'error');
    }
}

function salvarRascunho() {
    saveProgress();
}

function exportToExcel() {
    try {
        // Criar dados para exportação
        const dadosExportacao = {
            empresa: dadosNegocio.empresa,
            produto: dadosNegocio.produto,
            custos: dadosNegocio.custos,
            resultados: dadosNegocio.resultados,
            timestamp: new Date().toISOString()
        };
        
        // Converter para JSON e baixar
        const json = JSON.stringify(dadosExportacao, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `calculadora-mei-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        mostrarToast('Dados exportados com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        mostrarToast('Erro ao exportar dados', 'error');
    }
}

function gerarRelatorioCompleto() {
    try {
        // Criar conteúdo do relatório
        let relatorio = `
RELATÓRIO DE PRECIFICAÇÃO - BRAYAN CONTABILIDADE
===============================================
Data: ${new Date().toLocaleDateString('pt-BR')}
Hora: ${new Date().toLocaleTimeString('pt-BR')}

DADOS DA EMPRESA
----------------
Nome: ${dadosNegocio.empresa.nome || 'Não informado'}
Setor: ${dadosNegocio.empresa.setor || 'Não informado'}

PRODUTO/SERVIÇO
---------------
Nome: ${dadosNegocio.produto.nome || 'Não informado'}
Categoria: ${dadosNegocio.produto.categoria || 'Não informado'}

RESULTADOS FINANCEIROS
----------------------
Faturamento Mensal: ${formatarMoeda(dadosNegocio.resultados.receitaBruta || 0)}
Lucro Líquido Mensal: ${formatarMoeda(dadosNegocio.resultados.lucroLiquido || 0)}
Margem de Lucro: ${dadosNegocio.resultados.margemLucro ? dadosNegocio.resultados.margemLucro.toFixed(1) + '%' : '0%'}
Ponto de Equilíbrio: ${dadosNegocio.resultados.pontoEquilibrio || 0} unidades

CUSTOS
------
Custo Unitário Total: ${formatarMoeda(dadosNegocio.custos.totalUnitario || 0)}
Custo Fixo Mensal: ${formatarMoeda(dadosNegocio.custos.fixoMensal || 0)}

RECOMENDAÇÕES
-------------
`;

        // Baixar como arquivo de texto
        const blob = new Blob([relatorio], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-precificacao-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        mostrarToast('Relatório gerado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        mostrarToast('Erro ao gerar relatório', 'error');
    }
}

function resetarCalculadora() {
    if (confirm('Tem certeza que deseja reiniciar a calculadora? Todos os dados não salvos serão perdidos.')) {
        localStorage.removeItem('dadosNegocio');
        location.reload();
    }
}

function mostrarTooltip(event) {
    const tooltip = event.target.getAttribute('data-tooltip');
    if (tooltip) {
        // Remover tooltip anterior se existir
        const tooltipAnterior = document.querySelector('.tooltip-ativo');
        if (tooltipAnterior) {
            tooltipAnterior.remove();
        }
        
        // Criar tooltip
        const tooltipEl = document.createElement('div');
        tooltipEl.className = 'tooltip-ativo fixed bg-gray-900 text-white px-3 py-2 rounded-lg text-sm max-w-xs z-50 shadow-lg';
        tooltipEl.textContent = tooltip;
        
        // Posicionar tooltip
        const x = event.clientX + 10;
        const y = event.clientY + 10;
        tooltipEl.style.left = `${x}px`;
        tooltipEl.style.top = `${y}px`;
        
        document.body.appendChild(tooltipEl);
        
        // Armazenar referência para remover depois
        event.target._tooltip = tooltipEl;
    }
}

function esconderTooltip(event) {
    const tooltip = event.target._tooltip;
    if (tooltip && tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
        event.target._tooltip = null;
    }
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
    
    try {
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
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Erro ao criar gráfico modal:', error);
    }
}

function fecharModal() {
    const modal = document.getElementById('modalGrafico');
    if (modal) modal.style.display = 'none';
    
    if (window.modalChart) {
        window.modalChart.destroy();
        window.modalChart = null;
    }
}

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

// ==================== FUNÇÕES AUXILIARES ====================

function atualizarElementoTexto(id, texto) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = texto;
    }
}

function inicializarEventos() {
    try {
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
        
        // Calcular resultados ao mudar preço
        const precoVendaFinal = document.getElementById('precoVendaFinal');
        if (precoVendaFinal) {
            precoVendaFinal.addEventListener('input', calcularResultados);
        }
        
        // Aplicar dark mode se configurado
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode');
            const darkModeIcon = document.getElementById('darkModeIcon');
            if (darkModeIcon) darkModeIcon.className = 'fas fa-sun';
        }
        
        // Inicializar event listeners para modais
        const modal = document.getElementById('modalGrafico');
        if (modal) {
            modal.addEventListener('click', function(event) {
                if (event.target === modal) {
                    fecharModal();
                }
            });
        }
        
        // Adicionar estilo CSS para animações
        if (!document.getElementById('estilos-animacao')) {
            const style = document.createElement('style');
            style.id = 'estilos-animacao';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                
                .tooltip-ativo {
                    animation: fadeIn 0.2s ease-out;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }
        
        console.log('Eventos inicializados com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar eventos:', error);
    }
}

// Atualizar progresso quando campos são alterados
function atualizarProgresso() {
    const progresso = calcularProgresso();
    atualizarElementoTexto('progressoDados', `${progresso}%`);
    
    const progressoBar = document.getElementById('progressoBar');
    const progressoDadosBar = document.getElementById('progressoDadosBar');
    
    if (progressoBar) progressoBar.style.width = `${progresso}%`;
    if (progressoDadosBar) progressoDadosBar.style.width = `${progresso}%`;
}

// ==================== SINCRONIZAÇÃO DE GRÁFICOS ====================

function sincronizarGraficosComDados() {
    if (!window.gerenciadorGraficos) {
        console.warn('Gerenciador de gráficos não inicializado');
        return;
    }

    try {
        // Obter dados atuais
        const custos = dadosNegocio.custos;
        const resultados = dadosNegocio.resultados;
        const preco = parseFloat(document.getElementById('precoVendaFinal')?.value) || 0;
        
        // Atualizar gráfico de composição
        if (window.gerenciadorGraficos.graficos.composicaoPreco && custos && preco > 0) {
            const custoVarUnit = custos.variavelUnitario || 0;
            const custoFixoUnit = custos.fixoUnitario || 0;
            const impostos = preco * 0.07; // 7% estimado
            const lucro = preco - custoVarUnit - custoFixoUnit - impostos;
            
            if (window.gerenciadorGraficos.graficos.composicaoPreco.data) {
                window.gerenciadorGraficos.graficos.composicaoPreco.data.datasets[0].data = [
                    Math.max(custoVarUnit, 0),
                    Math.max(custoFixoUnit, 0),
                    Math.max(impostos, 0),
                    Math.max(lucro, 0)
                ];
                window.gerenciadorGraficos.graficos.composicaoPreco.update();
            }
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
            
            if (window.gerenciadorGraficos.graficos.distribuicaoPreco.data) {
                window.gerenciadorGraficos.graficos.distribuicaoPreco.data.datasets[0].data = valores;
                window.gerenciadorGraficos.graficos.distribuicaoPreco.update();
            }
        }
        
        // Atualizar gráfico de comparação
        if (window.gerenciadorGraficos.graficos.comparacaoConcorrencia && preco > 0) {
            const precoMin = parseFloat(document.getElementById('precoMinConcorrencia')?.value) || 45;
            const precoMedio = parseFloat(document.getElementById('precoMedioConcorrencia')?.value) || 60;
            const precoMax = parseFloat(document.getElementById('precoMaxConcorrencia')?.value) || 80;
            
            if (window.gerenciadorGraficos.graficos.comparacaoConcorrencia.data) {
                window.gerenciadorGraficos.graficos.comparacaoConcorrencia.data.datasets[0].data = [
                    precoMin,
                    precoMedio,
                    precoMax * 0.9,
                    preco
                ];
                window.gerenciadorGraficos.graficos.comparacaoConcorrencia.update();
            }
        }
        
    } catch (error) {
        console.error('Erro ao sincronizar gráficos:', error);
    }
}

function calcularTudoCompleto() {
    calcularCustos();
    calcularResultados();
    sincronizarGraficosComDados();
    mostrarToast('Cálculos e gráficos atualizados!', 'success');
}

// Expor funções para uso global
window.calcularCustos = calcularCustos;
window.calcularResultados = calcularResultados;
window.calcularTudo = calcularTudo;
window.calcularTudoCompleto = calcularTudoCompleto;
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
window.sincronizarGraficosComDados = sincronizarGraficosComDados;
