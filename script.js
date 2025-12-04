// ==================== CALCULADORA MEI PREMIUM - BRAYAN CONTABILIDADE ====================
// Versão 2.1 - Corrigida e com Cenários

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
let dicasAtivas = [];

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Calculadora MEI Premium - Brayan Contabilidade');
    
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
        inicializarTooltips();
        
        // Inicializar gráficos
        if (typeof window.gerenciadorGraficos !== 'undefined') {
            setTimeout(() => {
                window.gerenciadorGraficos.inicializarTodosGraficos();
                graficosInicializados = true;
            }, 500);
        }
        
        // Calcular valores iniciais
        calcularCustos();
        atualizarDashboard();
        atualizarProgresso();
        
        console.log('✅ Aplicação inicializada com sucesso!');
        mostrarToast('Calculadora MEI Premium pronta!', 'success');
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        mostrarToast('Erro ao iniciar. Contate suporte.', 'error');
    }
}

// ==================== NAVEGAÇÃO ====================
function openTab(tabName) {
    try {
        const tabsValidas = ['dashboard', 'dados', 'custos', 'precificacao', 'mercado', 'resultados', 'graficos', 'projecoes', 'recomendacoes'];
        if (!tabsValidas.includes(tabName)) {
            console.error('Tab inválida:', tabName);
            return;
        }
        
        // Ocultar todas as tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
            tab.hidden = true;
        });
        
        // Remover destaque dos botões
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.className = btn.className.replace('gradient-primary text-white', 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300');
        });
        
        // Ativar tab selecionada
        const tabElement = document.getElementById(tabName);
        if (tabElement) {
            tabElement.classList.add('active');
            tabElement.hidden = false;
        }
        
        // Ativar botão correspondente
        const tabBtnId = `tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`;
        const tabBtn = document.getElementById(tabBtnId);
        if (tabBtn) {
            tabBtn.className = 'tab-btn px-4 py-3 rounded-xl font-medium gradient-primary text-white shadow-md hover-lift';
        }
        
        // Executar ações específicas da tab
        executarAcoesTab(tabName);
        
    } catch (error) {
        console.error('Erro ao abrir tab:', error);
        mostrarToast('Erro de navegação', 'error');
    }
}

function executarAcoesTab(tabName) {
    const acoes = {
        'dashboard': () => atualizarDashboard(),
        'custos': () => calcularCustos(),
        'precificacao': () => atualizarPrecificacao(),
        'mercado': () => analisarConcorrencia(),
        'resultados': () => calcularResultados(),
        'graficos': () => {
            if (graficosInicializados && window.gerenciadorGraficos) {
                setTimeout(() => window.gerenciadorGraficos.atualizarTodosGraficosComDados(), 300);
            }
        },
        'projecoes': () => atualizarProjecoes(),
        'recomendacoes': () => gerarRecomendacoes()
    };
    
    if (acoes[tabName]) acoes[tabName]();
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
    // Atualizar o preço final manualmente
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
        const lucroLiquido = receitaBruta - custoProdutos - (receitaBruta * 0.15); // 15% impostos estimados
        const margemLiquida = (lucroLiquido / receitaBruta) * 100;
        const lucroUnitario = preco - custoUnitario;
        const pontoEquilibrio = lucroUnitario > 0 ? Math.ceil(custoFixoMensal / lucroUnitario) : 0;
        
        // Armazenar resultados
        dadosNegocio.resultados = {
            receitaBruta,
            lucroLiquido,
            margemLiquida,
            pontoEquilibrioUnidades: pontoEquilibrio
        };
        
        // Atualizar interface
        atualizarElementoTexto('kpiFaturamento', formatarMoeda(receitaBruta));
        atualizarElementoTexto('kpiLucro', formatarMoeda(lucroLiquido));
        atualizarElementoTexto('kpiMargem', `${margemLiquida.toFixed(1)}%`);
        atualizarElementoTexto('kpiPontoEquilibrio', pontoEquilibrio);
        
        // Atualizar gráficos
        if (window.gerenciadorGraficos) {
            window.gerenciadorGraficos.atualizarGraficoComposicao(preco, dadosNegocio.custos.variavelUnitario, dadosNegocio.custos.fixoUnitario, 100);
            window.gerenciadorGraficos.atualizarGraficoDistribuicaoPreco(dadosNegocio.custos, preco);
        }
        
        console.log('✅ Resultados calculados!');
        
    } catch (error) {
        console.error('Erro ao calcular resultados:', error);
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

// ==================== PROJEÇÕES E CENÁRIOS ====================
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
        
        const receitaBase = dadosNegocio.resultados?.receitaBruta || 0;
        const lucroBase = dadosNegocio.resultados?.lucroLiquido || 0;
        
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
        
        // Atualizar gráficos de projeção
        if (window.gerenciadorGraficos) {
            window.gerenciadorGraficos.atualizarProjecoes(meses, receitas, lucros);
        }
        
        // Atualizar metas trimestrais
        if (horizonte >= 3) {
            atualizarElementoTexto('metaTrimestre1', formatarMoeda(receitas[2]));
        }
        if (horizonte >= 6) {
            atualizarElementoTexto('metaTrimestre2', formatarMoeda(receitas[5]));
        }
        
        mostrarToast(`Projeções atualizadas (cenário ${cenario})!`, 'success');
        
    } catch (error) {
        console.error('Erro ao atualizar projeções:', error);
    }
}

// ==================== RECOMENDAÇÕES ====================
function gerarRecomendacoes() {
    try {
        const margem = dadosNegocio.resultados?.margemLiquida || 0;
        const pontoEquilibrio = dadosNegocio.resultados?.pontoEquilibrioUnidades || 0;
        const qtdMensal = dadosNegocio.custos?.qtdMensal || 0;
        
        const recomendacoes = [];
        
        // Recomendações de precificação
        if (margem < 10) {
            recomendacoes.push({
                texto: '🚨 AUMENTE O PREÇO URGENTEMENTE',
                prioridade: 'alta',
                categoria: 'Precificacao'
            });
        } else if (margem < 20) {
            recomendacoes.push({
                texto: '📈 Considere aumentar preços gradualmente',
                prioridade: 'media',
                categoria: 'Precificacao'
            });
        }
        
        // Recomendações de custos
        if (dadosNegocio.custos?.fixoMensal > 2000) {
            recomendacoes.push({
                texto: '💰 Avalie redução de custos fixos',
                prioridade: 'media',
                categoria: 'Custos'
            });
        }
        
        // Recomendações de mercado
        if (pontoEquilibrio > qtdMensal * 0.8) {
            recomendacoes.push({
                texto: '📊 Ponto de equilíbrio muito alto - reveja estratégia',
                prioridade: 'alta',
                categoria: 'Mercado'
            });
        }
        
        // Atualizar interface
        ['Precificacao', 'Custos', 'Mercado', 'Crescimento'].forEach(categoria => {
            const lista = document.getElementById(`recomendacoes${categoria}`);
            const itensCategoria = recomendacoes.filter(r => r.categoria === categoria);
            
            if (lista) {
                if (itensCategoria.length === 0) {
                    lista.innerHTML = '<li class="flex items-start"><i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i><span>✅ Tudo em ordem</span></li>';
                } else {
                    lista.innerHTML = itensCategoria.map(item => `
                        <li class="flex items-start p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-2">
                            <i class="fas fa-exclamation-triangle text-red-500 mt-1 mr-3"></i>
                            <span>${item.texto}</span>
                        </li>
                    `).join('');
                }
            }
        });
        
        // Contar por prioridade
        const alta = recomendacoes.filter(r => r.prioridade === 'alta').length;
        const media = recomendacoes.filter(r => r.prioridade === 'media').length;
        const baixa = recomendacoes.filter(r => r.prioridade === 'baixa').length;
        
        atualizarElementoTexto('prioridadeAlta', alta);
        atualizarElementoTexto('prioridadeMedia', media);
        atualizarElementoTexto('prioridadeBaixa', baixa);
        atualizarElementoTexto('totalRecomendacoes', recomendacoes.length);
        
    } catch (error) {
        console.error('Erro ao gerar recomendações:', error);
    }
}

// ==================== FUNÇÕES DO PASSO A PASSO (DADOS) ====================
function mostrarPassoDados(passo) {
    // Esconder todos os conteúdos
    document.querySelectorAll('.passo-conteudo').forEach(el => {
        el.classList.add('hidden');
    });
    
    // Mostrar o passo selecionado
    const conteudoPasso = document.getElementById(`conteudoPassoDados${passo}`);
    if (conteudoPasso) {
        conteudoPasso.classList.remove('hidden');
    }
    
    // Atualizar botões
    document.querySelectorAll('[id^="passoDados"]').forEach(btn => {
        btn.classList.remove('bg-blue-100', 'dark:bg-blue-900', 'text-blue-800', 'dark:text-blue-300');
        btn.classList.add('bg-gray-100', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-gray-300');
    });
    
    const btnPasso = document.getElementById(`passoDados${passo}`);
    if (btnPasso) {
        btnPasso.classList.remove('bg-gray-100', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-gray-300');
        btnPasso.classList.add('bg-blue-100', 'dark:bg-blue-900', 'text-blue-800', 'dark:text-blue-300');
    }
    
    passoAtualDados = passo;
}

function avancarPassoDados() {
    if (passoAtualDados < 4) {
        mostrarPassoDados(passoAtualDados + 1);
    } else {
        // Se estiver no último passo, ir para a tab de custos
        openTab('custos');
    }
}

function voltarPassoDados() {
    if (passoAtualDados > 1) {
        mostrarPassoDados(passoAtualDados - 1);
    }
}

function salvarRascunho() {
    saveProgress();
    mostrarToast('Rascunho salvo com sucesso!', 'success');
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
    if (!toast) return;
    
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
    if (icon) icon.className = estaDark ? 'fas fa-sun' : 'fas fa-moon';
    
    localStorage.setItem('darkMode', estaDark ? 'enabled' : 'disabled');
    document.dispatchEvent(new CustomEvent('darkModeChanged'));
}

function saveProgress() {
    try {
        // Coletar dados dos inputs
        const dados = {
            empresa: {
                nome: document.getElementById('empresaNome')?.value,
                cnpj: document.getElementById('empresaCnpj')?.value,
                setor: document.getElementById('setorEmpresa')?.value,
                tempoMercado: document.getElementById('tempoMercado')?.value
            },
            produto: {
                nome: document.getElementById('nomeProduto')?.value,
                categoria: document.getElementById('categoriaProduto')?.value,
                descricao: document.getElementById('descricaoProduto')?.value,
                unidadeMedida: document.getElementById('unidadeMedida')?.value,
                codigo: document.getElementById('codigoProduto')?.value
            },
            custos: dadosNegocio.custos,
            resultados: dadosNegocio.resultados,
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
                document.getElementById('empresaCnpj').value = dadosParse.empresa.cnpj || '';
                document.getElementById('setorEmpresa').value = dadosParse.empresa.setor || '';
                document.getElementById('tempoMercado').value = dadosParse.empresa.tempoMercado || '';
            }
            
            if (dadosParse.produto) {
                document.getElementById('nomeProduto').value = dadosParse.produto.nome || '';
                document.getElementById('categoriaProduto').value = dadosParse.produto.categoria || '';
                document.getElementById('descricaoProduto').value = dadosParse.produto.descricao || '';
                document.getElementById('unidadeMedida').value = dadosParse.produto.unidadeMedida || '';
                document.getElementById('codigoProduto').value = dadosParse.produto.codigo || '';
            }
            
            // Restaurar custos e resultados
            if (dadosParse.custos) {
                dadosNegocio.custos = dadosParse.custos;
            }
            
            if (dadosParse.resultados) {
                dadosNegocio.resultados = dadosParse.resultados;
            }
            
            console.log('✅ Dados carregados');
        }
        
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            const icon = document.getElementById('darkModeIcon');
            if (icon) icon.className = 'fas fa-sun';
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

function inicializarEventos() {
    // Auto-save
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('change', saveProgress);
    });
}

function inicializarTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(el => {
        el.addEventListener('mouseenter', mostrarTooltip);
        el.addEventListener('mouseleave', esconderTooltip);
    });
}

function mostrarTooltip(event) {
    const texto = event.target.getAttribute('data-tooltip');
    if (!texto) return;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip-ativo';
    tooltip.textContent = texto;
    
    const rect = event.target.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.top - 40}px`;
    tooltip.style.transform = 'translateX(-50%)';
    
    document.body.appendChild(tooltip);
    event.target._tooltip = tooltip;
}

function esconderTooltip(event) {
    const tooltip = event.target._tooltip;
    if (tooltip && tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
        event.target._tooltip = null;
    }
}

function atualizarProgresso() {
    const campos = ['empresaNome', 'setorEmpresa', 'nomeProduto', 'publicoAlvo', 'qtdVendaMensal'];
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
// ==================== FUNÇÕES PARA GRÁFICOS ====================
function inicializarGraficos() {
    if (window.gerenciadorGraficos && !window.gerenciadorGraficos.inicializado) {
        window.gerenciadorGraficos.inicializarTodosGraficos();
    }
}

function atualizarGraficosComDados() {
    if (window.gerenciadorGraficos) {
        window.gerenciadorGraficos.atualizarTodosGraficosComDados();
    }
}

// Adicione ao objeto window
window.inicializarGraficos = inicializarGraficos;
window.atualizarGraficosComDados = atualizarGraficosComDados;

// Modifique a função calcularResultados para atualizar gráficos
function calcularResultados() {
    try {
        // ... código existente ...
        
        // ATUALIZAR GRÁFICOS APÓS CÁLCULO
        setTimeout(() => {
            if (window.gerenciadorGraficos) {
                window.gerenciadorGraficos.atualizarGraficoComposicao(
                    preco, 
                    dadosNegocio.custos.variavelUnitario, 
                    dadosNegocio.custos.fixoUnitario, 
                    100
                );
                
                window.gerenciadorGraficos.atualizarGraficoDistribuicaoPreco(
                    dadosNegocio.custos, 
                    preco
                );
                
                window.gerenciadorGraficos.atualizarTodosGraficosComDados();
            }
        }, 300);
        
    } catch (error) {
        console.error('Erro ao calcular resultados:', error);
    }
}

function calcularTudo() {
    calcularCustos();
    setTimeout(() => calcularResultados(), 500);
    setTimeout(() => atualizarDashboard(), 1000);
    setTimeout(() => gerarRecomendacoes(), 1500);
    setTimeout(() => {
        mostrarToast('✅ Análise completa realizada!', 'success');
    }, 2000);
}

function exportarTodosGraficos() {
    if (window.gerenciadorGraficos) {
        window.gerenciadorGraficos.exportarTodosGraficos();
    } else {
        mostrarToast('Gráficos não inicializados', 'error');
    }
}

function fecharModal() {
    const modal = document.getElementById('modalGrafico');
    if (modal) {
        modal.hidden = true;
    }
}

// ==================== EXPORTAR FUNÇÕES GLOBAIS ====================
window.openTab = openTab;
window.toggleDarkMode = toggleDarkMode;
window.saveProgress = saveProgress;
window.atualizarMarkup = atualizarMarkup;
window.calcularCustos = calcularCustos;
window.calcularResultados = calcularResultados;
window.analisarConcorrencia = analisarConcorrencia;
window.gerarRecomendacoes = gerarRecomendacoes;
window.atualizarDashboard = atualizarDashboard;
window.calcularTudo = calcularTudo;
window.mostrarPassoDados = mostrarPassoDados;
window.avancarPassoDados = avancarPassoDados;
window.voltarPassoDados = voltarPassoDados;
window.salvarRascunho = salvarRascunho;
window.atualizarPrecoFinal = atualizarPrecoFinal;
window.atualizarProjecoes = atualizarProjecoes;
window.exportarTodosGraficos = exportarTodosGraficos;
window.fecharModal = fecharModal;

console.log('✅ Script principal carregado - Calculadora MEI Premium v2.1');
