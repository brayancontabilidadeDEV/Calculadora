// ==================== CALCULADORA MEI PREMIUM - BRAYAN CONTABILIDADE ====================
// Versão 3.0 - Sistema de Abas Corrigido

// ==================== VARIÁVEIS GLOBAIS ====================
let dadosNegocio = {
    empresa: {},
    produto: {},
    custos: {},
    precificacao: {},
    mercado: {},
    resultados: {},
    meta: {},
    timestamp: new Date().toISOString()
};

let passoAtualDados = 1;
let metodoPrecificacaoSelecionado = 'markup';
let graficosInicializados = false;

// ==================== SISTEMA DE ABAS ====================
function openTab(tabName) {
    console.log(`Tentando abrir tab: ${tabName}`);
    
    try {
        // Lista de tabs válidas
        const tabsValidas = ['dashboard', 'dados', 'custos', 'precificacao', 'mercado', 'resultados', 'graficos', 'projecoes', 'recomendacoes'];
        
        if (!tabsValidas.includes(tabName)) {
            console.error(`Tab inválida: ${tabName}`);
            return;
        }
        
        // Ocultar todas as tabs
        const tabContents = document.querySelectorAll('.tab-content');
        console.log(`Encontradas ${tabContents.length} tabs`);
        
        tabContents.forEach(tab => {
            tab.classList.remove('active');
            tab.setAttribute('hidden', 'true');
        });
        
        // Remover destaque dos botões
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.classList.remove('gradient-primary', 'text-white');
            btn.classList.add('bg-gray-100', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-gray-300');
        });
        
        // Mostrar tab selecionada
        const tabElement = document.getElementById(tabName);
        if (tabElement) {
            tabElement.classList.add('active');
            tabElement.removeAttribute('hidden');
            console.log(`Tab ${tabName} mostrada com sucesso`);
        } else {
            console.error(`Elemento da tab ${tabName} não encontrado`);
        }
        
        // Destacar botão correspondente
        const tabBtnId = `tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`;
        const tabBtn = document.getElementById(tabBtnId);
        if (tabBtn) {
            tabBtn.classList.remove('bg-gray-100', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-gray-300');
            tabBtn.classList.add('gradient-primary', 'text-white');
            console.log(`Botão ${tabBtnId} destacado`);
        }
        
        // Executar ações específicas da tab
        executarAcoesTab(tabName);
        
        // Salvar tab atual
        localStorage.setItem('ultimaTab', tabName);
        
    } catch (error) {
        console.error('Erro ao abrir tab:', error);
        mostrarToast('Erro de navegação', 'error');
    }
}

function executarAcoesTab(tabName) {
    console.log(`Executando ações da tab: ${tabName}`);
    
    const acoes = {
        'dashboard': () => {
            atualizarDashboard();
        },
        'custos': () => {
            calcularCustos();
        },
        'precificacao': () => {
            atualizarPrecificacao();
        },
        'mercado': () => {
            analisarConcorrencia();
        },
        'resultados': () => {
            calcularResultados();
        },
        'graficos': () => {
            if (window.gerenciadorGraficos && window.gerenciadorGraficos.inicializado) {
                setTimeout(() => {
                    window.gerenciadorGraficos.atualizarTodosGraficosComDados();
                }, 300);
            } else {
                console.log('Gráficos não inicializados ainda');
            }
        },
        'projecoes': () => {
            atualizarProjecoes();
        },
        'recomendacoes': () => {
            gerarRecomendacoes();
        }
    };
    
    if (acoes[tabName]) {
        acoes[tabName]();
    }
}

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Calculadora MEI Premium - Brayan Contabilidade v3.0');
    
    // Verificar dependências
    if (typeof Chart === 'undefined') {
        console.error('Chart.js não carregado!');
        mostrarToast('Erro técnico: Recarregue a página.', 'error');
        return;
    }
    
    console.log('✅ Chart.js carregado - Versão:', Chart.version);
    
    // Inicializar aplicação
    inicializarAplicacao();
});

function inicializarAplicacao() {
    try {
        console.log('📄 Iniciando aplicação...');
        
        // Carregar dados salvos
        carregarDadosSalvos();
        
        // Inicializar eventos
        inicializarEventos();
        
        // Inicializar gráficos com delay
        setTimeout(() => {
            if (typeof window.gerenciadorGraficos !== 'undefined') {
                window.gerenciadorGraficos.inicializarTodosGraficos();
                graficosInicializados = true;
                console.log('✅ Gráficos inicializados');
            }
        }, 1000);
        
        // Calcular valores iniciais
        calcularCustos();
        atualizarDashboard();
        atualizarProgresso();
        
        // Restaurar última tab
        const ultimaTab = localStorage.getItem('ultimaTab') || 'dashboard';
        setTimeout(() => {
            openTab(ultimaTab);
        }, 500);
        
        console.log('✅ Aplicação inicializada com sucesso!');
        mostrarToast('Calculadora MEI Premium pronta!', 'success');
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        mostrarToast('Erro ao iniciar. Contate suporte.', 'error');
    }
}

// ==================== CÁLCULO DE CUSTOS ====================
function calcularCustos() {
    try {
        console.log('🧮 Calculando custos...');
        
        // Coletar custos variáveis
        const materiaPrima = parseFloat(document.getElementById('materiaPrima')?.value) || 0;
        const embalagem = parseFloat(document.getElementById('embalagem')?.value) || 0;
        const frete = parseFloat(document.getElementById('frete')?.value) || 0;
        
        // Coletar custos fixos
        const aluguel = parseFloat(document.getElementById('aluguel')?.value) || 0;
        const salarios = parseFloat(document.getElementById('salarios')?.value) || 0;
        const das = parseFloat(document.getElementById('das')?.value) || 70.90;
        
        // Quantidade mensal
        const qtdMensal = parseFloat(document.getElementById('qtdVendaMensal')?.value) || 100;
        
        // Calcular totais
        const custoVariavelUnitario = materiaPrima + embalagem + frete;
        const custoFixoMensal = aluguel + salarios + das;
        const custoFixoUnitario = qtdMensal > 0 ? custoFixoMensal / qtdMensal : 0;
        const custoTotalUnitario = custoVariavelUnitario + custoFixoUnitario;
        
        // Armazenar dados
        dadosNegocio.custos = {
            variavelUnitario: custoVariavelUnitario,
            fixoMensal: custoFixoMensal,
            fixoUnitario: custoFixoUnitario,
            totalUnitario: custoTotalUnitario,
            totalMensal: custoTotalUnitario * qtdMensal,
            qtdMensal: qtdMensal
        };
        
        // Atualizar interface
        atualizarElementoTexto('resumoCustoUnitario', formatarMoeda(custoTotalUnitario));
        atualizarElementoTexto('resumoCustoFixo', formatarMoeda(custoFixoMensal));
        atualizarElementoTexto('resumoCustoTotal', formatarMoeda(custoTotalUnitario * qtdMensal));
        
        // Atualizar campos para outros cálculos
        if (document.getElementById('custoVariavelUnitario')) {
            document.getElementById('custoVariavelUnitario').value = custoVariavelUnitario.toFixed(2);
        }
        
        console.log('✅ Custos calculados!');
        
    } catch (error) {
        console.error('❌ Erro ao calcular custos:', error);
        mostrarToast('Erro ao calcular custos', 'error');
    }
}

// ==================== PRECIFICAÇÃO ====================
function atualizarMarkup(valor) {
    try {
        const markupValor = parseFloat(valor) || 100;
        
        // Atualizar display
        const markupValueElement = document.getElementById('markupValue');
        if (markupValueElement) {
            markupValueElement.textContent = `${markupValor}%`;
        }
        
        // Atualizar slider position
        const markupSlider = document.getElementById('markupSlider');
        if (markupSlider) {
            markupSlider.value = markupValor;
        }
        
        // Calcular preço
        const custoUnitario = dadosNegocio.custos?.totalUnitario || 0;
        
        if (custoUnitario > 0) {
            const precoCalculado = custoUnitario * (1 + markupValor / 100);
            
            // Atualizar campos
            atualizarElementoTexto('precoFinalSugerido', formatarMoeda(precoCalculado));
            
            const precoFinalInput = document.getElementById('precoVendaFinal');
            if (precoFinalInput) {
                precoFinalInput.value = precoCalculado.toFixed(2);
            }
            
            // Calcular faixas
            const precoMin = custoUnitario * 1.6;
            const precoMedio = custoUnitario * 2.0;
            const precoMax = custoUnitario * 2.5;
            
            atualizarElementoTexto('precoMarkupMin', formatarMoeda(precoMin));
            atualizarElementoTexto('precoMarkupMedio', formatarMoeda(precoMedio));
            atualizarElementoTexto('precoMarkupMax', formatarMoeda(precoMax));
        }
        
    } catch (error) {
        console.error('Erro ao atualizar markup:', error);
    }
}

function atualizarPrecificacao() {
    if (!dadosNegocio.custos || !dadosNegocio.custos.totalUnitario) {
        mostrarToast('Calcule os custos primeiro!', 'warning');
        return;
    }
    
    const markupSugerido = 100;
    atualizarMarkup(markupSugerido);
}

function atualizarPrecoFinal(valor) {
    const preco = parseFloat(valor) || 0;
    atualizarElementoTexto('precoFinalSugerido', formatarMoeda(preco));
}

// ==================== ANÁLISE DE MERCADO ====================
function analisarConcorrencia() {
    try {
        const precoMin = parseFloat(document.getElementById('precoMinConcorrencia')?.value) || 0;
        const precoMedio = parseFloat(document.getElementById('precoMedioConcorrencia')?.value) || 0;
        const precoMax = parseFloat(document.getElementById('precoMaxConcorrencia')?.value) || 0;
        const meuPreco = parseFloat(document.getElementById('precoVendaFinal')?.value) || 0;
        
        if (!precoMin || !precoMedio || !precoMax || !meuPreco) {
            mostrarToast('Preencha todos os preços para análise', 'warning');
            return;
        }
        
        // Calcular métricas
        const diferencaMedia = ((meuPreco - precoMedio) / precoMedio * 100);
        const espacoAumento = precoMax > meuPreco ? ((precoMax - meuPreco) / meuPreco * 100) : 0;
        
        // Atualizar interface
        atualizarElementoTexto('diferencaMedia', `${diferencaMedia >= 0 ? '+' : ''}${diferencaMedia.toFixed(1)}%`);
        atualizarElementoTexto('espacoAumento', `${espacoAumento.toFixed(1)}%`);
        
        // Determinar posição
        let posicao = '';
        const posicaoRelativa = ((meuPreco - precoMin) / (precoMax - precoMin) * 100);
        
        if (posicaoRelativa < 30) posicao = 'MUITO ABAIXO DA MÉDIA';
        else if (posicaoRelativa < 45) posicao = 'ABAIXO DA MÉDIA';
        else if (posicaoRelativa <= 55) posicao = 'NA MÉDIA';
        else if (posicaoRelativa < 70) posicao = 'ACIMA DA MÉDIA';
        else posicao = 'MUITO ACIMA DA MÉDIA';
        
        atualizarElementoTexto('posicaoMercado', posicao);
        
        // Atualizar recomendação
        let recomendacao = 'Mantenha posição atual';
        if (diferencaMedia < -20) recomendacao = 'AUMENTE PREÇO URGENTE';
        else if (diferencaMedia < -10) recomendacao = 'Considere aumentar preço';
        else if (diferencaMedia > 20) recomendacao = 'Risco de perder mercado';
        
        atualizarElementoTexto('recomendacaoMercado', recomendacao);
        
        // Atualizar gráfico de comparação
        if (window.gerenciadorGraficos) {
            window.gerenciadorGraficos.atualizarGraficoComparacaoConcorrencia(precoMin, precoMedio, precoMax, meuPreco);
        }
        
        mostrarToast('Análise de concorrência atualizada!', 'success');
        
    } catch (error) {
        console.error('Erro ao analisar concorrência:', error);
    }
}

// ==================== RESULTADOS ====================
function calcularResultados() {
    try {
        if (!dadosNegocio.custos || !dadosNegocio.custos.totalUnitario) {
            mostrarToast('Calcule os custos primeiro!', 'warning');
            return;
        }
        
        const preco = parseFloat(document.getElementById('precoVendaFinal')?.value) || 0;
        const qtdMensal = dadosNegocio.custos.qtdMensal || 100;
        const custoUnitario = dadosNegocio.custos.totalUnitario;
        const custoFixoMensal = dadosNegocio.custos.fixoMensal;
        
        // Cálculos
        const receitaBruta = preco * qtdMensal;
        const custoProdutos = custoUnitario * qtdMensal;
        const impostos = receitaBruta * 0.15; // 15% impostos estimados
        const lucroLiquido = receitaBruta - custoProdutos - impostos;
        const margemLiquida = receitaBruta > 0 ? (lucroLiquido / receitaBruta) * 100 : 0;
        const lucroUnitario = preco - custoUnitario;
        const pontoEquilibrio = lucroUnitario > 0 ? Math.ceil(custoFixoMensal / lucroUnitario) : 0;
        
        // Armazenar resultados
        dadosNegocio.resultados = {
            receitaBruta,
            lucroLiquido,
            margemLiquida,
            pontoEquilibrioUnidades: pontoEquilibrio,
            custoUnitario,
            precoVenda: preco,
            qtdMensal
        };
        
        // Atualizar interface - KPIs principais
        atualizarElementoTexto('kpiFaturamento', formatarMoeda(receitaBruta));
        atualizarElementoTexto('kpiLucro', formatarMoeda(lucroLiquido));
        atualizarElementoTexto('kpiMargem', `${margemLiquida.toFixed(1)}%`);
        atualizarElementoTexto('kpiPontoEquilibrio', pontoEquilibrio);
        
        // Atualizar detalhamento
        atualizarElementoTexto('detalheReceita', formatarMoeda(receitaBruta));
        atualizarElementoTexto('detalheCustosVar', formatarMoeda(dadosNegocio.custos.variavelUnitario * qtdMensal));
        atualizarElementoTexto('detalheCustosFixos', formatarMoeda(custoFixoMensal));
        atualizarElementoTexto('detalheImpostos', formatarMoeda(impostos));
        
        // Atualizar indicadores
        atualizarElementoTexto('indicadorLucroUnitario', formatarMoeda(lucroUnitario));
        atualizarElementoTexto('indicadorMargemBruta', `${((preco - custoUnitario) / preco * 100).toFixed(1)}%`);
        atualizarElementoTexto('indicadorROI', `${(lucroLiquido / (custoFixoMensal + custoProdutos) * 100).toFixed(1)}%`);
        atualizarElementoTexto('indicadorBreakEven', Math.ceil(pontoEquilibrio / (qtdMensal / 30)));
        
        // Atualizar dashboard também
        atualizarDashboard();
        
        // Atualizar gráficos
        if (window.gerenciadorGraficos) {
            window.gerenciadorGraficos.atualizarGraficoComposicao(preco, dadosNegocio.custos.variavelUnitario, dadosNegocio.custos.fixoUnitario, 100);
            window.gerenciadorGraficos.atualizarGraficoDistribuicaoPreco(dadosNegocio.custos, preco);
            setTimeout(() => {
                window.gerenciadorGraficos.atualizarTodosGraficosComDados();
            }, 300);
        }
        
        console.log('✅ Resultados calculados!');
        
    } catch (error) {
        console.error('Erro ao calcular resultados:', error);
        mostrarToast('Erro ao calcular resultados', 'error');
    }
}

// ==================== DASHBOARD ====================
function atualizarDashboard() {
    try {
        const resultados = dadosNegocio.resultados || {};
        
        atualizarElementoTexto('dashFaturamento', formatarMoeda(resultados.receitaBruta || 0));
        atualizarElementoTexto('dashLucro', formatarMoeda(resultados.lucroLiquido || 0));
        atualizarElementoTexto('dashMargem', `${(resultados.margemLiquida || 0).toFixed(1)}%`);
        atualizarElementoTexto('dashPontoEquilibrio', resultados.pontoEquilibrioUnidades || 0);
        
    } catch (error) {
        console.error('Erro ao atualizar dashboard:', error);
    }
}

// ==================== PROJEÇÕES ====================
function atualizarProjecoes() {
    try {
        const horizonte = parseInt(document.getElementById('horizonteProjecao')?.value) || 12;
        const cenario = document.getElementById('cenarioBase')?.value || 'realista';
        const taxaCrescimentoBase = parseFloat(document.getElementById('taxaCrescimentoProjecao')?.value) || 5;
        
        // Ajustar taxa de crescimento baseada no cenário
        let taxaCrescimento;
        switch(cenario) {
            case 'otimista':
                taxaCrescimento = taxaCrescimentoBase * 1.5;
                break;
            case 'pessimista':
                taxaCrescimento = taxaCrescimentoBase * 0.5;
                break;
            default: // realista
                taxaCrescimento = taxaCrescimentoBase;
        }
        
        const receitaBase = dadosNegocio.resultados?.receitaBruta || 1000;
        const lucroBase = dadosNegocio.resultados?.lucroLiquido || 300;
        
        // Gerar projeções
        const meses = [];
        const receitas = [];
        const lucros = [];
        
        for (let i = 1; i <= horizonte; i++) {
            meses.push(`Mês ${i}`);
            const fator = Math.pow(1 + taxaCrescimento/100, i-1);
            receitas.push(receitaBase * fator);
            lucros.push(lucroBase * fator);
        }
        
        // Atualizar metas
        if (horizonte >= 3) {
            atualizarElementoTexto('metaTrimestre1', formatarMoeda(receitas[2]));
        }
        if (horizonte >= 6) {
            atualizarElementoTexto('metaTrimestre2', formatarMoeda(receitas[5]));
        }
        atualizarElementoTexto('metaAnual', formatarMoeda(receitas[horizonte-1]));
        
        // Atualizar gráficos de projeção
        if (window.gerenciadorGraficos) {
            window.gerenciadorGraficos.atualizarProjecoes(meses, receitas, lucros);
        }
        
        mostrarToast(`Projeções atualizadas (cenário ${cenario})!`, 'success');
        
    } catch (error) {
        console.error('Erro ao atualizar projeções:', error);
        mostrarToast('Erro ao atualizar projeções', 'error');
    }
}

// ==================== RECOMENDAÇÕES ====================
function gerarRecomendacoes() {
    try {
        const margem = dadosNegocio.resultados?.margemLiquida || 0;
        const pontoEquilibrio = dadosNegocio.resultados?.pontoEquilibrioUnidades || 0;
        const qtdMensal = dadosNegocio.custos?.qtdMensal || 0;
        const preco = dadosNegocio.resultados?.precoVenda || 0;
        const custoUnitario = dadosNegocio.custos?.totalUnitario || 0;
        
        const recomendacoes = [];
        
        // Recomendações de precificação
        if (margem < 10) {
            recomendacoes.push({
                texto: '🚨 AUMENTE O PREÇO URGENTEMENTE - Margem abaixo de 10%',
                prioridade: 'alta',
                categoria: 'Precificacao'
            });
        } else if (margem < 20) {
            recomendacoes.push({
                texto: '📈 Considere aumentar preços gradualmente para melhorar margem',
                prioridade: 'media',
                categoria: 'Precificacao'
            });
        } else if (margem > 40) {
            recomendacoes.push({
                texto: '💰 Margem excelente! Pode investir mais em marketing',
                prioridade: 'baixa',
                categoria: 'Precificacao'
            });
        }
        
        // Recomendações de custos
        if (dadosNegocio.custos?.fixoMensal > 2000) {
            recomendacoes.push({
                texto: '📉 Avalie redução de custos fixos para melhorar rentabilidade',
                prioridade: 'media',
                categoria: 'Custos'
            });
        }
        
        // Recomendações de mercado
        if (pontoEquilibrio > qtdMensal * 0.8) {
            recomendacoes.push({
                texto: '⚠️ Ponto de equilíbrio muito alto - reveja estratégia de vendas',
                prioridade: 'alta',
                categoria: 'Mercado'
            });
        }
        
        // Recomendações de crescimento
        if (margem > 25 && qtdMensal < 200) {
            recomendacoes.push({
                texto: '🚀 Boa margem! Pode investir em expansão',
                prioridade: 'media',
                categoria: 'Crescimento'
            });
        }
        
        // Atualizar contadores
        const alta = recomendacoes.filter(r => r.prioridade === 'alta').length;
        const media = recomendacoes.filter(r => r.prioridade === 'media').length;
        const baixa = recomendacoes.filter(r => r.prioridade === 'baixa').length;
        
        atualizarElementoTexto('prioridadeAlta', alta);
        atualizarElementoTexto('prioridadeMedia', media);
        atualizarElementoTexto('prioridadeBaixa', baixa);
        atualizarElementoTexto('totalRecomendacoes', recomendacoes.length);
        
        // Atualizar listas
        ['Precificacao', 'Custos', 'Mercado', 'Crescimento'].forEach(categoria => {
            const lista = document.getElementById(`recomendacoes${categoria}`);
            const itensCategoria = recomendacoes.filter(r => r.categoria === categoria);
            
            if (lista) {
                if (itensCategoria.length === 0) {
                    lista.innerHTML = `
                        <li class="flex items-start p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                            <span class="text-sm text-gray-800 dark:text-gray-300">✅ Tudo em ordem nesta categoria</span>
                        </li>`;
                } else {
                    lista.innerHTML = itensCategoria.map(item => {
                        const cores = {
                            'alta': 'red',
                            'media': 'yellow',
                            'baixa': 'green'
                        };
                        const cor = cores[item.prioridade] || 'blue';
                        
                        return `
                            <li class="flex items-start p-3 bg-${cor}-50 dark:bg-${cor}-900/20 rounded-lg mb-2">
                                <i class="fas fa-exclamation-triangle text-${cor}-500 mt-1 mr-3"></i>
                                <span class="text-sm text-gray-800 dark:text-gray-300">${item.texto}</span>
                            </li>`;
                    }).join('');
                }
            }
        });
        
        mostrarToast('Recomendações geradas com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao gerar recomendações:', error);
        mostrarToast('Erro ao gerar recomendações', 'error');
    }
}

// ==================== UTILITÁRIOS ====================
function atualizarElementoTexto(id, texto) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = texto;
    }
}

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
        console.error('Elemento toast não encontrado');
        return;
    }
    
    const cores = {
        'success': 'bg-green-600',
        'error': 'bg-red-600',
        'warning': 'bg-yellow-600',
        'info': 'bg-blue-600'
    };
    
    toast.className = `toast ${cores[tipo] || 'bg-blue-600'}`;
    toast.textContent = mensagem;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function toggleDarkMode() {
    const estaDark = document.body.classList.toggle('dark-mode');
    const icon = document.getElementById('darkModeIcon');
    if (icon) {
        icon.className = estaDark ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    localStorage.setItem('darkMode', estaDark ? 'enabled' : 'disabled');
    
    // Disparar evento para gráficos
    document.dispatchEvent(new CustomEvent('darkModeChanged'));
    
    // Atualizar cores dos gráficos
    if (window.gerenciadorGraficos) {
        setTimeout(() => {
            window.gerenciadorGraficos.atualizarCoresDarkMode();
        }, 100);
    }
}

function saveProgress() {
    try {
        // Coletar dados dos inputs
        const dados = {
            empresa: {
                nome: document.getElementById('empresaNome')?.value,
                setor: document.getElementById('setorEmpresa')?.value,
                tempoMercado: document.getElementById('tempoMercado')?.value
            },
            produto: {
                nome: document.getElementById('nomeProduto')?.value,
                categoria: document.getElementById('categoriaProduto')?.value,
                qtdMensal: document.getElementById('qtdVendaMensal')?.value
            },
            custos: dadosNegocio.custos,
            resultados: dadosNegocio.resultados,
            precoVenda: document.getElementById('precoVendaFinal')?.value,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('dadosNegocio', JSON.stringify(dados));
        console.log('💾 Progresso salvo!');
    } catch (error) {
        console.error('Erro ao salvar:', error);
    }
}

function carregarDadosSalvos() {
    try {
        const dados = localStorage.getItem('dadosNegocio');
        if (dados) {
            const dadosParse = JSON.parse(dados);
            
            // Restaurar dados básicos
            if (dadosParse.empresa) {
                document.getElementById('empresaNome').value = dadosParse.empresa.nome || '';
                document.getElementById('setorEmpresa').value = dadosParse.empresa.setor || '';
                document.getElementById('tempoMercado').value = dadosParse.empresa.tempoMercado || '';
            }
            
            if (dadosParse.produto) {
                document.getElementById('nomeProduto').value = dadosParse.produto.nome || '';
                document.getElementById('categoriaProduto').value = dadosParse.produto.categoria || '';
                document.getElementById('qtdVendaMensal').value = dadosParse.produto.qtdMensal || 100;
            }
            
            // Restaurar custos e resultados
            if (dadosParse.custos) {
                dadosNegocio.custos = dadosParse.custos;
            }
            
            if (dadosParse.resultados) {
                dadosNegocio.resultados = dadosParse.resultados;
            }
            
            // Restaurar preço
            if (dadosParse.precoVenda) {
                document.getElementById('precoVendaFinal').value = dadosParse.precoVenda;
            }
            
            console.log('✅ Dados carregados');
        }
        
        // Restaurar modo escuro
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            const icon = document.getElementById('darkModeIcon');
            if (icon) {
                icon.className = 'fas fa-sun';
            }
        }
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

function inicializarEventos() {
    // Auto-save em mudanças
    document.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('change', saveProgress);
    });
    
    // Eventos de custos
    document.getElementById('materiaPrima')?.addEventListener('input', calcularCustos);
    document.getElementById('embalagem')?.addEventListener('input', calcularCustos);
    document.getElementById('frete')?.addEventListener('input', calcularCustos);
    document.getElementById('aluguel')?.addEventListener('input', calcularCustos);
    document.getElementById('salarios')?.addEventListener('input', calcularCustos);
    document.getElementById('das')?.addEventListener('input', calcularCustos);
    document.getElementById('qtdVendaMensal')?.addEventListener('input', calcularCustos);
    
    // Evento do slider de markup
    document.getElementById('markupSlider')?.addEventListener('input', function(e) {
        atualizarMarkup(e.target.value);
    });
    
    // Evento de preço final
    document.getElementById('precoVendaFinal')?.addEventListener('input', function(e) {
        atualizarPrecoFinal(e.target.value);
    });
}

function atualizarProgresso() {
    const campos = ['empresaNome', 'setorEmpresa', 'nomeProduto', 'qtdVendaMensal'];
    const preenchidos = campos.filter(id => {
        const el = document.getElementById(id);
        return el && el.value && el.value.trim() !== '';
    }).length;
    
    const progresso = Math.round((preenchidos / campos.length) * 100);
    
    atualizarElementoTexto('progressoDados', `${progresso}%`);
    
    const bar = document.getElementById('progressoBar');
    if (bar) {
        bar.style.width = `${progresso}%`;
    }
}

// ==================== FUNÇÕES DE APOIO ====================
function calcularTudo() {
    calcularCustos();
    setTimeout(() => calcularResultados(), 500);
    setTimeout(() => atualizarDashboard(), 1000);
    setTimeout(() => {
        if (window.gerenciadorGraficos) {
            window.gerenciadorGraficos.atualizarTodosGraficosComDados();
        }
    }, 1500);
    setTimeout(() => gerarRecomendacoes(), 2000);
    setTimeout(() => {
        mostrarToast('✅ Análise completa realizada!', 'success');
        openTab('resultados');
    }, 2500);
}

// ==================== EXPORTAR FUNÇÕES GLOBAIS ====================
window.openTab = openTab;
window.toggleDarkMode = toggleDarkMode;
window.saveProgress = saveProgress;
window.calcularCustos = calcularCustos;
window.calcularResultados = calcularResultados;
window.analisarConcorrencia = analisarConcorrencia;
window.gerarRecomendacoes = gerarRecomendacoes;
window.atualizarDashboard = atualizarDashboard;
window.calcularTudo = calcularTudo;
window.atualizarMarkup = atualizarMarkup;
window.atualizarPrecoFinal = atualizarPrecoFinal;
window.atualizarProjecoes = atualizarProjecoes;
window.exportarTodosGraficos = function() {
    if (window.gerenciadorGraficos) {
        window.gerenciadorGraficos.exportarTodosGraficos();
    } else {
        mostrarToast('Gráficos não inicializados', 'error');
    }
};

console.log('✅ Script principal carregado - Calculadora MEI Premium v3.0');
