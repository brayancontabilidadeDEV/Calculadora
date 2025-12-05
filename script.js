// ==================== VARIÁVEIS GLOBAIS ====================

// Garantir que dadosNegocio esteja acessível globalmente (CORRIGIDO: 'dadosMegocio' estava errado)
if (!window.dadosNegocio) {
    window.dadosNegocio = {
        empresa: {},
        produto: {},
        custos: {},
        precificacao: {},
        mercado: {},
        resultados: {}
    };
}

// Atalho para acesso interno
let dadosNegocio = window.dadosNegocio;

let passoAtualDados = 1;
let metodoPrecificacaoSelecionado = 'markup';

// ==================== INICIALIZAÇÃO ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Página carregada - iniciando...');
    
    // Verificar se Chart.js foi carregado
    if (typeof Chart === 'undefined') {
        console.error('Chart.js não foi carregado!');
        mostrarAlertaErro('Chart.js não foi carregado. Recarregue a página.');
        return;
    }
    
    console.log('Chart.js carregado com sucesso! Versão:', Chart.version);
    
    // Inicializar gerenciador de gráficos
    try {
        if (typeof GerenciadorGraficos === 'undefined') {
            console.error('GerenciadorGraficos não foi carregado!');
            // Vamos definir a classe aqui mesmo
            definirGerenciadorGraficos();
        }
        
        window.gerenciadorGraficos = new GerenciadorGraficos();
        window.gerenciadorGraficos.inicializarGraficos();
        console.log('Gerenciador de gráficos inicializado com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar gerenciador de gráficos:', error);
    }
    
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
    
    console.log('✅ Inicialização completa!');
});

function definirGerenciadorGraficos() {
    // ==================== GERENCIADOR DE GRÁFICOS ====================
    class GerenciadorGraficos {
        constructor() {
            this.graficos = {};
            this.cores = {
                primaria: '#4F46E5',
                secundaria: '#10B981',
                terciaria: '#F59E0B',
                perigo: '#EF4444',
                info: '#3B82F6',
                custos: ['#4F46E5', '#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD'],
                receita: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
                mercado: ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A']
            };
        }

        inicializarGraficos() {
            console.log('🔄 Inicializando gráficos...');
            
            try {
                // Inicializar gráficos de dashboard
                this.inicializarGraficosDashboard();
                
                console.log('✅ Gráficos inicializados com sucesso!');
            } catch (error) {
                console.error('❌ Erro ao inicializar gráficos:', error);
            }
        }

        inicializarGraficosDashboard() {
            // 1. Gráfico de Distribuição de Preço
            const ctxDistribuicao = document.getElementById('graficoDistribuicaoPreco');
            if (ctxDistribuicao) {
                this.graficos.distribuicaoPreco = new Chart(ctxDistribuicao, {
                    type: 'doughnut',
                    data: {
                        labels: ['Custo Variável', 'Custo Fixo', 'Lucro'],
                        datasets: [{
                            data: [40, 30, 30],
                            backgroundColor: [
                                this.cores.custos[0],
                                this.cores.custos[1],
                                this.cores.receita[0]
                            ],
                            borderWidth: 1,
                            borderColor: '#1F2937'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    color: '#6B7280',
                                    padding: 20,
                                    font: {
                                        size: 12
                                    }
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        let label = context.label || '';
                                        if (label) {
                                            label += ': ';
                                        }
                                        label += 'R$ ' + context.raw.toFixed(2);
                                        return label;
                                    }
                                }
                            }
                        }
                    }
                });
            }

            // 2. Gráfico de Composição do Preço (Barra)
            const ctxComposicao = document.getElementById('graficoComposicaoPreco');
            if (ctxComposicao) {
                this.graficos.composicaoPreco = new Chart(ctxComposicao, {
                    type: 'bar',
                    data: {
                        labels: ['Custo Variável', 'Custo Fixo', 'Impostos/Taxas', 'Lucro'],
                        datasets: [{
                            label: 'Valor (R$)',
                            data: [25, 15, 10, 50],
                            backgroundColor: [
                                this.cores.custos[0],
                                this.cores.custos[1],
                                this.cores.perigo,
                                this.cores.receita[0]
                            ],
                            borderWidth: 1,
                            borderColor: '#374151'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return `R$ ${context.raw.toFixed(2)}`;
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return 'R$ ' + value;
                                    },
                                    color: '#6B7280'
                                },
                                grid: {
                                    color: '#374151'
                                }
                            },
                            x: {
                                ticks: {
                                    color: '#6B7280',
                                    maxRotation: 45
                                },
                                grid: {
                                    display: false
                                }
                            }
                        }
                    }
                });
            }

            // 3. Gráfico de Resultados Financeiros
            const ctxResultados = document.getElementById('graficoResultadosFinanceiros');
            if (ctxResultados) {
                this.graficos.resultadosFinanceiros = new Chart(ctxResultados, {
                    type: 'bar',
                    data: {
                        labels: ['Receita', 'Custos', 'Lucro'],
                        datasets: [{
                            label: 'Valor Mensal (R$)',
                            data: [5000, 3500, 1500],
                            backgroundColor: [
                                this.cores.receita[0],
                                this.cores.perigo,
                                this.cores.primaria
                            ],
                            borderWidth: 1,
                            borderColor: '#374151'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return `R$ ${context.raw.toLocaleString('pt-BR')}`;
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return 'R$ ' + value.toLocaleString('pt-BR');
                                    },
                                    color: '#6B7280'
                                },
                                grid: {
                                    color: '#374151'
                                }
                            },
                            x: {
                                ticks: {
                                    color: '#6B7280'
                                },
                                grid: {
                                    display: false
                                }
                            }
                        }
                    }
                });
            }
        }

        atualizarGraficoDistribuicaoPreco(dadosCustos, precoVenda) {
            if (!this.graficos.distribuicaoPreco || !dadosCustos || !precoVenda) return;
            
            const custoVariavel = dadosCustos.variavelUnitario || 0;
            const custoFixoUnit = dadosCustos.fixoUnitario || 0;
            const lucro = Math.max(0, precoVenda - (custoVariavel + custoFixoUnit));
            
            this.graficos.distribuicaoPreco.data.datasets[0].data = [
                custoVariavel,
                custoFixoUnit,
                lucro
            ];
            
            this.graficos.distribuicaoPreco.update();
        }

        atualizarGraficoComposicaoPreco(precoTotal, custoVariavel, custoFixo) {
            if (!this.graficos.composicaoPreco || !precoTotal) return;
            
            // Calcular impostos e taxas (estimado em 15%)
            const impostosTaxas = precoTotal * 0.15;
            const lucro = Math.max(0, precoTotal - (custoVariavel + custoFixo + impostosTaxas));
            
            this.graficos.composicaoPreco.data.datasets[0].data = [
                custoVariavel,
                custoFixo,
                impostosTaxas,
                lucro
            ];
            
            this.graficos.composicaoPreco.update();
        }

        atualizarGraficoResultados(dadosResultados) {
            if (!this.graficos.resultadosFinanceiros || !dadosResultados) return;
            
            this.graficos.resultadosFinanceiros.data.datasets[0].data = [
                dadosResultados.receitaMensal || 0,
                dadosResultados.custoTotalMensal || 0,
                dadosResultados.lucroMensal || 0
            ];
            
            this.graficos.resultadosFinanceiros.update();
        }

        atualizarTodosGraficosComDados() {
            console.log('🔄 Atualizando todos os gráficos com dados atuais...');
            
            try {
                // Obter dados atuais
                const dadosNegocio = window.dadosNegocio || {};
                const custos = dadosNegocio.custos || {};
                const resultados = dadosNegocio.resultados || {};
                
                const precoVenda = parseFloat(document.getElementById('precoVendaFinal')?.value) || 0;
                
                // Atualizar gráficos individuais
                if (custos.totalUnitario && precoVenda) {
                    this.atualizarGraficoDistribuicaoPreco(custos, precoVenda);
                    this.atualizarGraficoComposicaoPreco(
                        precoVenda,
                        custos.variavelUnitario || 0,
                        custos.fixoUnitario || 0
                    );
                }
                
                if (resultados.lucroMensal) {
                    this.atualizarGraficoResultados(resultados);
                }
                
                console.log('✅ Gráficos atualizados com dados atuais!');
            } catch (error) {
                console.error('❌ Erro ao atualizar gráficos:', error);
            }
        }
    }

    window.GerenciadorGraficos = GerenciadorGraficos;
}

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
    const tabElement = document.getElementById(tabName);
    if (tabElement) {
        tabElement.classList.add('active');
    }
    
    // Atualizar botão ativo
    const tabId = 'tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1);
    const tabButton = document.getElementById(tabId);
    if (tabButton) {
        tabButton.className = 'tab-btn px-4 py-3 rounded-xl font-medium gradient-primary text-white shadow-md hover-lift';
    }
    
    // Atualizar progresso do wizard
    atualizarProgressoWizard(tabName);
    
    // Calcular dados se necessário
    if (tabName === 'dashboard') {
        atualizarDashboard();
    } else if (tabName === 'resultados') {
        calcularResultados();
    } else if (tabName === 'graficos') {
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
        progressBar.style.width = (progresso[tabAtual] || 0) + '%';
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
    const conteudoPasso = document.getElementById('conteudoPassoDados' + passo);
    const botaoPasso = document.getElementById('passoDados' + passo);
    
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
    console.log('Calculando custos...');
    
    // Custos variáveis por unidade
    const materiaPrima = parseFloat(document.getElementById('materiaPrima')?.value) || 0;
    const embalagem = parseFloat(document.getElementById('embalagem')?.value) || 0;
    const frete = parseFloat(document.getElementById('frete')?.value) || 0;
    
    // Percentuais
    const comissoesPercent = parseFloat(document.getElementById('comissoesPercent')?.value) || 0;
    const impostosVenda = parseFloat(document.getElementById('impostosVenda')?.value) || 0;
    const taxasPlataforma = parseFloat(document.getElementById('taxasPlataforma')?.value) || 0;
    
    // Custos fixos mensais
    const aluguel = parseFloat(document.getElementById('aluguel')?.value) || 0;
    const salarios = parseFloat(document.getElementById('salarios')?.value) || 0;
    const contas = parseFloat(document.getElementById('contas')?.value) || 0;
    const marketing = parseFloat(document.getElementById('marketing')?.value) || 0;
    const das = parseFloat(document.getElementById('das')?.value) || 70.90;
    const manutencao = parseFloat(document.getElementById('manutencao')?.value) || 0;
    const outrosFixos = parseFloat(document.getElementById('outrosFixos')?.value) || 0;
    
    // Software
    const softwareGestao = parseFloat(document.getElementById('softwareGestao')?.value) || 0;
    const softwareDesign = parseFloat(document.getElementById('softwareDesign')?.value) || 0;
    const softwareMarketing = parseFloat(document.getElementById('softwareMarketing')?.value) || 0;
    const softwareOutros = parseFloat(document.getElementById('softwareOutros')?.value) || 0;
    
    // Quantidade mensal esperada
    const qtdMensal = parseFloat(document.getElementById('qtdVendaMensal')?.value) || 100;
    
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
    const setor = document.getElementById('setorEmpresa')?.value;
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
    if (resumoMarkupSugerido) resumoMarkupSugerido.textContent = markupSugerido + '%';
    
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
    
    // Atualizar precificação - CORRIGIDO: atualizarPrecificacao agora está definida
    if (typeof atualizarPrecificacao === 'function') {
        atualizarPrecificacao();
    }
    
    // Atualizar gráfico de distribuição se disponível
    if (window.gerenciadorGraficos) {
        const preco = parseFloat(document.getElementById('precoVendaFinal')?.value) || 
                     custoTotalUnitario * (1 + markupSugerido/100);
        window.gerenciadorGraficos.atualizarGraficoDistribuicaoPreco(dadosNegocio.custos, preco);
    }
    
    return dadosNegocio.custos;
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
            marketing: 300.00,
            qtdVendaMensal: 200
        },
        'moda': {
            materiaPrima: 25.00,
            embalagem: 2.50,
            frete: 8.00,
            aluguel: 800.00,
            salarios: 1800.00,
            marketing: 400.00,
            qtdVendaMensal: 80
        },
        'artesanato': {
            materiaPrima: 12.00,
            embalagem: 3.00,
            frete: 10.00,
            aluguel: 500.00,
            salarios: 1500.00,
            marketing: 200.00,
            qtdVendaMensal: 50
        },
        'servicos': {
            materiaPrima: 5.00,
            embalagem: 0.50,
            frete: 0.00,
            aluguel: 600.00,
            salarios: 2500.00,
            marketing: 500.00,
            qtdVendaMensal: 30
        }
    };
    
    if (templates[setor]) {
        const template = templates[setor];
        const materiaPrimaEl = document.getElementById('materiaPrima');
        const embalagemEl = document.getElementById('embalagem');
        const freteEl = document.getElementById('frete');
        const aluguelEl = document.getElementById('aluguel');
        const salariosEl = document.getElementById('salarios');
        const marketingEl = document.getElementById('marketing');
        const qtdVendaEl = document.getElementById('qtdVendaMensal');
        
        if (materiaPrimaEl) materiaPrimaEl.value = template.materiaPrima;
        if (embalagemEl) embalagemEl.value = template.embalagem;
        if (freteEl) freteEl.value = template.frete;
        if (aluguelEl) aluguelEl.value = template.aluguel;
        if (salariosEl) salariosEl.value = template.salarios;
        if (marketingEl) marketingEl.value = template.marketing;
        if (qtdVendaEl) qtdVendaEl.value = template.qtdVendaMensal;
        
        calcularCustos();
        mostrarToast('Custos do setor ' + setor + ' aplicados!', 'success');
    }
}

function aplicarTemplateSetor(setor) {
    const setorSelect = document.getElementById('setorEmpresa');
    if (setorSelect) {
        setorSelect.value = setor;
        sugerirCustosPorSetor();
    }
}

// ==================== FUNÇÕES DA TAB PRECIFICAÇÃO ====================

function atualizarPrecificacao() {
    console.log('Atualizando precificação...');
    
    // Recalcular custos para ter dados atualizados
    const custos = calcularCustos();
    
    if (!custos.totalUnitario || custos.totalUnitario === 0) {
        mostrarToast('Complete os custos primeiro!', 'warning');
        return;
    }
    
    // Aplicar método selecionado
    switch(metodoPrecificacaoSelecionado) {
        case 'markup':
            const markupValue = document.getElementById('markupInput')?.value || 
                              custos.markupSugerido || 100;
            atualizarMarkup(markupValue);
            break;
            
        case 'margem':
            calcularPrecoPorMargem();
            break;
            
        case 'mercado':
            sugerirPrecoPorMercado();
            break;
            
        default:
            // Para outros métodos, usar markup padrão
            atualizarMarkup(custos.markupSugerido || 100);
    }
}

function selecionarMetodo(metodo) {
    metodoPrecificacaoSelecionado = metodo;
    
    // Atualizar texto do método selecionado
    const metodoSelecionadoElement = document.getElementById('metodoSelecionado');
    if (metodoSelecionadoElement) {
        const nomes = {
            'markup': 'Markup',
            'margem': 'Margem de Lucro',
            'mercado': 'Preço de Mercado',
            'valor': 'Valor Percebido',
            'psicologico': 'Preço Psicológico',
            'recomendacao': 'Recomendação IA'
        };
        metodoSelecionadoElement.textContent = nomes[metodo] + ' (Selecionado)';
    }
    
    // Esconder TODAS as configurações de métodos primeiro
    document.querySelectorAll('.metodo-config').forEach(div => {
        div.style.display = 'none';
    });
    
    // Mostrar configuração do método selecionado
    const configElement = document.getElementById('configMetodo' + metodo.charAt(0).toUpperCase() + metodo.slice(1));
    if (configElement) {
        configElement.style.display = 'block';
    }
    
    // Para o método markup, atualizar valores
    if (metodo === 'markup') {
        const custos = dadosNegocio.custos || {};
        const markupValue = document.getElementById('markupInput')?.value || custos.markupSugerido || 100;
        atualizarMarkup(markupValue);
    }
    
    // Para o método margem, calcular
    if (metodo === 'margem') {
        calcularPrecoPorMargem();
    }
    
    // Para o método mercado, sugerir preço
    if (metodo === 'mercado') {
        sugerirPrecoPorMercado();
    }
    
    mostrarToast('Método ' + metodo + ' selecionado!', 'success');
}

function atualizarMarkup(valor) {
    const markupSlider = document.getElementById('markupSlider');
    const markupInput = document.getElementById('markupInput');
    
    if (markupSlider) markupSlider.value = valor;
    if (markupInput) markupInput.value = valor;
    
    // Atualizar preços sugeridos
    const custoUnitario = dadosNegocio.custos?.totalUnitario || 0;
    
    if (custoUnitario === 0) {
        mostrarToast('Complete os custos primeiro!', 'warning');
        return;
    }
    
    // Preços com diferentes markups
    const precoMin = custoUnitario * 1.6;
    const precoMedio = custoUnitario * 2.0;
    const precoMax = custoUnitario * 2.5;
    const precoAtual = custoUnitario * (1 + parseFloat(valor)/100);
    
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
    if (precoVendaFinal) {
        precoVendaFinal.value = precoAtual.toFixed(2);
        atualizarPrecoFinal(precoAtual);
    }
    
    // Salvar markup no dadosNegocio
    dadosNegocio.custos.markupAplicado = parseFloat(valor);
}

function calcularPrecoPorMargem() {
    const margemDesejada = parseFloat(document.getElementById('margemDesejada')?.value) || 30;
    const custoUnitario = dadosNegocio.custos?.totalUnitario || 0;
    
    if (custoUnitario === 0) {
        mostrarToast('Complete os custos primeiro!', 'warning');
        return;
    }
    
    // Fórmula: Preço = Custo / (1 - Margem)
    const preco = custoUnitario / (1 - (margemDesejada/100));
    
    const precoMargemSugerido = document.getElementById('precoMargemSugerido');
    if (precoMargemSugerido) {
        precoMargemSugerido.textContent = formatarMoeda(preco);
    }
    
    // Atualizar preço final se este método estiver selecionado
    if (metodoPrecificacaoSelecionado === 'margem') {
        const precoVendaFinal = document.getElementById('precoVendaFinal');
        if (precoVendaFinal) {
            precoVendaFinal.value = preco.toFixed(2);
            atualizarPrecoFinal(preco);
        }
    }
}

function sugerirPrecoPorMercado() {
    const precoMin = parseFloat(document.getElementById('precoMinConcorrencia')?.value) || 0;
    const precoMedio = parseFloat(document.getElementById('precoMedioConcorrencia')?.value) || 0;
    const precoMax = parseFloat(document.getElementById('precoMaxConcorrencia')?.value) || 0;
    
    if (precoMedio === 0) {
        mostrarToast('Insira os preços da concorrência!', 'warning');
        return;
    }
    
    const custoUnitario = dadosNegocio.custos?.totalUnitario || 0;
    let precoSugerido = precoMedio;
    
    // Ajustar baseado no custo
    if (custoUnitario > 0) {
        const margemMinima = 20; // 20% de margem mínima
        const precoMinimo = custoUnitario * (1 + margemMinima/100);
        
        if (precoSugerido < precoMinimo) {
            precoSugerido = precoMinimo;
        }
    }
    
    const precoMercadoSugerido = document.getElementById('precoMercadoSugerido');
    if (precoMercadoSugerido) {
        precoMercadoSugerido.textContent = formatarMoeda(precoSugerido);
    }
    
    // Atualizar preço final se este método estiver selecionado
    if (metodoPrecificacaoSelecionado === 'mercado') {
        const precoVendaFinal = document.getElementById('precoVendaFinal');
        if (precoVendaFinal) {
            precoVendaFinal.value = precoSugerido.toFixed(2);
            atualizarPrecoFinal(precoSugerido);
        }
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
    }
    
    const precoVendaFinal = document.getElementById('precoVendaFinal');
    if (precoVendaFinal) {
        precoVendaFinal.value = novoPreco.toFixed(2);
        atualizarPrecoFinal(novoPreco);
    }
}

function atualizarPrecoFinal(valor) {
    const preco = parseFloat(valor) || 0;
    
    // Atualizar composição
    atualizarComposicaoPreco(preco);
    
    // Calcular impacto
    calcularImpactoPreco(preco);
    
    // Atualizar preços psicológicos
    const precoPsico99 = document.getElementById('precoPsico99');
    const precoPsico95 = document.getElementById('precoPsico95');
    const precoPsico90 = document.getElementById('precoPsico90');
    const precoPsicoArred = document.getElementById('precoPsicoArred');
    
    if (precoPsico99) precoPsico99.textContent = formatarMoeda(Math.floor(preco) + 0.99);
    if (precoPsico95) precoPsico95.textContent = formatarMoeda(Math.floor(preco) + 0.95);
    if (precoPsico90) precoPsico90.textContent = formatarMoeda(Math.floor(preco) + 0.90);
    if (precoPsicoArred) precoPsicoArred.textContent = formatarMoeda(Math.round(preco));
    
    // Atualizar gráficos
    if (window.gerenciadorGraficos) {
        window.gerenciadorGraficos.atualizarTodosGraficosComDados();
    }
}

function atualizarComposicaoPreco(preco) {
    const custos = dadosNegocio.custos;
    
    if (!custos || !custos.totalUnitario) return;
    
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
    if (compMarkupAplicado) compMarkupAplicado.textContent = markup.toFixed(1) + '%';
    if (compPrecoFinal) compPrecoFinal.textContent = formatarMoeda(preco);
    if (lucroPorUnidade) lucroPorUnidade.textContent = formatarMoeda(lucroUnitario);
    if (margemLucroUnidade) margemLucroUnidade.textContent = margemLucro.toFixed(1) + '%';
    
    // Atualizar gráfico de composição
    if (window.gerenciadorGraficos) {
        window.gerenciadorGraficos.atualizarGraficoComposicaoPreco(preco, custoVarUnit, custoFixoUnit);
    }
}

function calcularImpactoPreco(preco) {
    const custos = dadosNegocio.custos;
    const qtdMensal = custos?.qtdMensal || 100;
    
    if (!custos || !custos.totalUnitario) return;
    
    const lucroUnitario = preco - custos.totalUnitario;
    const lucroMensal = lucroUnitario * qtdMensal;
    const margemLucro = (lucroUnitario / preco) * 100;
    const pontoEquilibrio = Math.ceil(custos.fixoMensal / Math.max(0.01, lucroUnitario));
    
    const impactoMargem = document.getElementById('impactoMargem');
    const impactoLucroUnit = document.getElementById('impactoLucroUnit');
    const impactoLucroMensal = document.getElementById('impactoLucroMensal');
    const impactoPontoEquilibrio = document.getElementById('impactoPontoEquilibrio');
    
    if (impactoMargem) impactoMargem.textContent = margemLucro.toFixed(1) + '%';
    if (impactoLucroUnit) impactoLucroUnit.textContent = formatarMoeda(lucroUnitario);
    if (impactoLucroMensal) impactoLucroMensal.textContent = formatarMoeda(lucroMensal);
    if (impactoPontoEquilibrio) impactoPontoEquilibrio.textContent = pontoEquilibrio + ' unidades';
    
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
        recomendacaoPreco.className = 'font-bold ' + cor;
    }
}

// ==================== FUNÇÕES DA TAB MERCADO ====================

function analisarConcorrencia() {
    const precoMin = parseFloat(document.getElementById('precoMinConcorrencia')?.value) || 0;
    const precoMedio = parseFloat(document.getElementById('precoMedioConcorrencia')?.value) || 0;
    const precoMax = parseFloat(document.getElementById('precoMaxConcorrencia')?.value) || 0;
    const meuPreco = parseFloat(document.getElementById('precoVendaFinal')?.value) || 0;
    
    if (!precoMin || !precoMedio || !precoMax) {
        mostrarToast('Preencha todos os preços da concorrência!', 'warning');
        return;
    }
    
    // Calcular posição
    const diferencaMedia = ((meuPreco - precoMedio) / precoMedio) * 100;
    
    // Atualizar indicadores
    const diferencaMediaElement = document.getElementById('diferencaMedia');
    const espacoAumentoElement = document.getElementById('espacoAumento');
    
    if (diferencaMediaElement) {
        diferencaMediaElement.textContent = (diferencaMedia >= 0 ? '+' : '') + diferencaMedia.toFixed(1) + '%';
    }
    
    if (espacoAumentoElement) {
        espacoAumentoElement.textContent = (((precoMax - meuPreco) / meuPreco) * 100).toFixed(1) + '%';
    }
    
    // Determinar posição
    let posicaoTexto = '';
    let posicaoCor = '';
    
    if (meuPreco < precoMin * 1.1) {
        posicaoTexto = 'Muito abaixo da média';
        posicaoCor = 'text-red-600 dark:text-red-400';
    } else if (meuPreco < precoMedio * 0.9) {
        posicaoTexto = 'Abaixo da média';
        posicaoCor = 'text-orange-600 dark:text-orange-400';
    } else if (meuPreco <= precoMedio * 1.1) {
        posicaoTexto = 'No preço médio';
        posicaoCor = 'text-green-600 dark:text-green-400';
    } else if (meuPreco <= precoMax * 0.9) {
        posicaoTexto = 'Acima da média';
        posicaoCor = 'text-blue-600 dark:text-blue-400';
    } else {
        posicaoTexto = 'Muito acima da média';
        posicaoCor = 'text-purple-600 dark:text-purple-400';
    }
    
    const posicaoMercadoElement = document.getElementById('posicaoMercado');
    if (posicaoMercadoElement) {
        posicaoMercadoElement.textContent = posicaoTexto;
        posicaoMercadoElement.className = 'font-bold ' + posicaoCor;
    }
    
    // Recomendação baseada na posição
    let recomendacao = '';
    if (meuPreco < precoMin) {
        recomendacao = 'Seu preço está muito baixo! Aumente para não desvalorizar seu produto.';
    } else if (meuPreco < precoMedio) {
        recomendacao = 'Preço competitivo. Você pode considerar um pequeno aumento se seu produto tem diferenciais.';
    } else if (meuPreco <= precoMedio * 1.15) {
        recomendacao = 'Preço adequado ao mercado. Mantenha se sua proposta de valor for justificável.';
    } else if (meuPreco <= precoMax) {
        recomendacao = 'Preço premium. Certifique-se de que seus diferenciais justificam o valor.';
    } else {
        recomendacao = 'Preço acima do mercado. Avalie se há espaço para redução ou se seu produto realmente justifica esse valor.';
    }
    
    const recomendacaoConcorrencia = document.getElementById('recomendacaoConcorrencia');
    if (recomendacaoConcorrencia) {
        recomendacaoConcorrencia.textContent = recomendacao;
    }
    
    // Salvar dados de mercado
    dadosNegocio.mercado = {
        precoMin: precoMin,
        precoMedio: precoMedio,
        precoMax: precoMax,
        meuPreco: meuPreco,
        posicao: posicaoTexto,
        recomendacao: recomendacao
    };
}

// ==================== FUNÇÕES DA TAB RESULTADOS ====================

function calcularResultados() {
    const preco = parseFloat(document.getElementById('precoVendaFinal')?.value) || 0;
    const custos = dadosNegocio.custos;
    
    if (!custos?.totalUnitario || preco === 0) {
        mostrarToast('Complete a precificação primeiro!', 'warning');
        return;
    }
    
    // Dados básicos
    const qtdMensal = custos.qtdMensal || 100;
    const custoUnitario = custos.totalUnitario;
    
    // Cálculos
    const receitaMensal = preco * qtdMensal;
    const custoTotalMensal = custoUnitario * qtdMensal;
    const lucroMensal = receitaMensal - custoTotalMensal;
    const margemLucro = receitaMensal > 0 ? (lucroMensal / receitaMensal) * 100 : 0;
    
    const lucroUnitario = preco - custoUnitario;
    const margemLucroUnitario = preco > 0 ? (lucroUnitario / preco) * 100 : 0;
    
    // Ponto de equilíbrio
    const pontoEquilibrioUnidades = Math.ceil(custos.fixoMensal / Math.max(0.01, lucroUnitario));
    const pontoEquilibrioValor = pontoEquilibrioUnidades * preco;
    
    // ROI e Retorno
    const investimentoInicial = parseFloat(document.getElementById('investimentoInicial')?.value) || 1000;
    const roiMensal = investimentoInicial > 0 ? (lucroMensal / investimentoInicial) * 100 : 0;
    const mesesRetorno = Math.ceil(investimentoInicial / Math.max(0.01, lucroMensal));
    
    // Atualizar indicadores de resultado
    const indicadores = [
        { id: 'resultReceitaMensal', value: receitaMensal, prefix: 'R$' },
        { id: 'resultCustosMensais', value: custoTotalMensal, prefix: 'R$' },
        { id: 'resultLucroMensal', value: lucroMensal, prefix: 'R$' },
        { id: 'resultMargemLucro', value: margemLucro, prefix: '', suffix: '%' },
        { id: 'resultLucroUnitario', value: lucroUnitario, prefix: 'R$' },
        { id: 'resultMargemUnitario', value: margemLucroUnitario, prefix: '', suffix: '%' },
        { id: 'resultPontoEquilibrioUnid', value: pontoEquilibrioUnidades, prefix: '', suffix: ' unid.' },
        { id: 'resultPontoEquilibrioValor', value: pontoEquilibrioValor, prefix: 'R$' },
        { id: 'resultROI', value: roiMensal, prefix: '', suffix: '%' },
        { id: 'resultMesesRetorno', value: mesesRetorno, prefix: '', suffix: ' meses' }
    ];
    
    indicadores.forEach(ind => {
        const element = document.getElementById(ind.id);
        if (element) {
            let valorFormatado = '';
            if (ind.prefix.includes('R$')) {
                valorFormatado = formatarMoeda(ind.value);
            } else if (ind.suffix.includes('%')) {
                valorFormatado = ind.value.toFixed(1) + ind.suffix;
            } else {
                valorFormatado = ind.value.toLocaleString('pt-BR') + (ind.suffix || '');
            }
            element.textContent = (ind.prefix.includes('R$') ? '' : ind.prefix) + valorFormatado;
        }
    });
    
    // Avaliação de rentabilidade
    let avaliacao = '';
    let avaliacaoCor = '';
    
    if (margemLucro < 5) {
        avaliacao = 'Crítica - Risco de prejuízo';
        avaliacaoCor = 'text-red-600 dark:text-red-400';
    } else if (margemLucro < 15) {
        avaliacao = 'Baixa - Apenas sobrevivência';
        avaliacaoCor = 'text-orange-600 dark:text-orange-400';
    } else if (margemLucro < 25) {
        avaliacao = 'Adequada - Negócio sustentável';
        avaliacaoCor = 'text-yellow-600 dark:text-yellow-400';
    } else if (margemLucro < 40) {
        avaliacao = 'Boa - Rentabilidade saudável';
        avaliacaoCor = 'text-green-600 dark:text-green-400';
    } else {
        avaliacao = 'Excelente - Alta lucratividade';
        avaliacaoCor = 'text-green-700 dark:text-green-500';
    }
    
    const avaliacaoRentabilidade = document.getElementById('avaliacaoRentabilidade');
    if (avaliacaoRentabilidade) {
        avaliacaoRentabilidade.textContent = avaliacao;
        avaliacaoRentabilidade.className = 'font-bold ' + avaliacaoCor;
    }
    
    // Salvar resultados
    dadosNegocio.resultados = {
        receitaMensal: receitaMensal,
        custoTotalMensal: custoTotalMensal,
        lucroMensal: lucroMensal,
        margemLucro: margemLucro,
        lucroUnitario: lucroUnitario,
        margemLucroUnitario: margemLucroUnitario,
        pontoEquilibrioUnidades: pontoEquilibrioUnidades,
        pontoEquilibrioValor: pontoEquilibrioValor,
        roiMensal: roiMensal,
        mesesRetorno: mesesRetorno,
        avaliacao: avaliacao
    };
    
    // Atualizar gráficos se disponíveis
    if (window.gerenciadorGraficos) {
        window.gerenciadorGraficos.atualizarGraficoResultados(dadosNegocio.resultados);
    }
}

// ==================== FUNÇÕES DA TAB PROJEÇÕES ====================

function atualizarProjecoes() {
    const resultados = dadosNegocio.resultados;
    
    if (!resultados?.receitaMensal) {
        mostrarToast('Calcule os resultados primeiro!', 'warning');
        return;
    }
    
    const meses = 12;
    const crescimentoMensal = parseFloat(document.getElementById('crescimentoMensal')?.value) || 5;
    const sazonalidade = document.getElementById('sazonalidade')?.value || 'nenhuma';
    
    let receitaMensal = resultados.receitaMensal;
    let lucroMensal = resultados.lucroMensal;
    
    // Fatores de sazonalidade por mês (0-12, sendo 0=jan)
    const fatoresSazonalidade = {
        'nenhuma': Array(12).fill(1.0),
        'natal': [1.0, 0.8, 0.9, 0.9, 1.0, 1.1, 1.2, 1.2, 1.3, 1.5, 2.0, 1.8],
        'ferias': [0.7, 0.8, 1.0, 1.1, 1.2, 1.3, 0.9, 0.8, 1.0, 1.0, 1.0, 1.0],
        'moda': [1.2, 1.0, 0.9, 0.8, 0.8, 0.9, 1.0, 1.2, 1.5, 1.3, 1.1, 1.2],
        'alimentos': [1.1, 1.0, 0.9, 0.9, 1.0, 1.0, 1.1, 1.1, 1.2, 1.2, 1.3, 1.4]
    };
    
    const fatorSazonal = fatoresSazonalidade[sazonalidade] || fatoresSazonalidade['nenhuma'];
    
    // Calcular projeções
    const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const projReceita = [];
    const projLucro = [];
    const projAcumulado = [];
    
    let acumulado = 0;
    
    for (let i = 0; i < meses; i++) {
        const fatorCrescimento = Math.pow(1 + crescimentoMensal/100, i);
        const fatorSazonalMes = fatorSazonal[i];
        
        const receitaProj = receitaMensal * fatorCrescimento * fatorSazonalMes;
        const lucroProj = lucroMensal * fatorCrescimento * fatorSazonalMes;
        
        projReceita.push(receitaProj);
        projLucro.push(lucroProj);
        
        acumulado += lucroProj;
        projAcumulado.push(acumulado);
    }
    
    // Atualizar totais anuais
    const receitaAnual = projReceita.reduce((a, b) => a + b, 0);
    const lucroAnual = projLucro.reduce((a, b) => a + b, 0);
    
    const projReceitaAnual = document.getElementById('projReceitaAnual');
    const projLucroAnual = document.getElementById('projLucroAnual');
    const projMediaMensal = document.getElementById('projMediaMensal');
    
    if (projReceitaAnual) projReceitaAnual.textContent = formatarMoeda(receitaAnual);
    if (projLucroAnual) projLucroAnual.textContent = formatarMoeda(lucroAnual);
    if (projMediaMensal) projMediaMensal.textContent = formatarMoeda(lucroAnual / 12);
    
    // Calcular meta de faturamento
    calcularMetaFaturamento(receitaAnual);
}

function calcularMetaFaturamento(receitaAnualProjetada) {
    const metaInput = document.getElementById('metaFaturamento');
    if (!metaInput || !metaInput.value) return;
    
    const metaAnual = parseFloat(metaInput.value);
    const percentualAtingimento = (receitaAnualProjetada / metaAnual) * 100;
    
    const metaAlcancada = document.getElementById('metaAlcancada');
    const metaDiferenca = document.getElementById('metaDiferenca');
    const metaBarra = document.getElementById('metaBarraProgresso');
    
    if (metaAlcancada) {
        metaAlcancada.textContent = percentualAtingimento.toFixed(1) + '%';
    }
    
    if (metaDiferenca) {
        const diferenca = receitaAnualProjetada - metaAnual;
        metaDiferenca.textContent = formatarMoeda(diferenca);
        metaDiferenca.className = 'font-bold ' + (diferenca >= 0 ? 'text-green-600' : 'text-red-600');
    }
    
    if (metaBarra) {
        metaBarra.style.width = Math.min(100, Math.max(0, percentualAtingimento)) + '%';
    }
}

// ==================== FUNÇÕES DA TAB RECOMENDAÇÕES ====================

function gerarRecomendacoes() {
    const resultados = dadosNegocio.resultados;
    const mercado = dadosNegocio.mercado;
    const custos = dadosNegocio.custos;
    
    if (!resultados?.lucroMensal) {
        mostrarToast('Complete todas as etapas primeiro!', 'warning');
        return;
    }
    
    let recomendacoes = [];
    
    // Recomendação baseada na margem
    if (resultados.margemLucro < 10) {
        recomendacoes.push({
            titulo: '⚠️ Margem de Lucro Baixa',
            descricao: 'Sua margem de lucro está abaixo de 10%. Considere aumentar o preço ou reduzir custos para garantir sustentabilidade.',
            acao: 'Aumente o preço em pelo menos 15% ou revise seus custos variáveis.',
            prioridade: 'alta',
            icone: 'fas fa-exclamation-triangle'
        });
    } else if (resultados.margemLucro < 20) {
        recomendacoes.push({
            titulo: '📊 Margem Aperitada',
            descricao: 'Sua margem está em nível de sobrevivência. Há espaço para melhorias.',
            acao: 'Busque eficiências operacionais para aumentar a rentabilidade.',
            prioridade: 'media',
            icone: 'fas fa-chart-line'
        });
    }
    
    // Recomendação baseada no ponto de equilíbrio
    if (resultados.pontoEquilibrioUnidades > dadosNegocio.custos.qtdMensal * 0.8) {
        recomendacoes.push({
            titulo: '⚖️ Ponto de Equilíbrio Alto',
            descricao: 'Você precisa vender muito para cobrir custos fixos.',
            acao: 'Reduza custos fixos ou aumente a margem de contribuição.',
            prioridade: 'alta',
            icone: 'fas fa-balance-scale'
        });
    }
    
    // Recomendação baseada no mercado
    if (mercado && mercado.posicao) {
        if (mercado.posicao.includes('Muito abaixo')) {
            recomendacoes.push({
                titulo: '💰 Preço Subvalorizado',
                descricao: 'Seu preço está muito abaixo da concorrência.',
                acao: 'Aumente gradualmente o preço para se alinhar ao mercado.',
                prioridade: 'alta',
                icone: 'fas fa-money-bill-wave'
            });
        } else if (mercado.posicao.includes('Muito acima')) {
            recomendacoes.push({
                titulo: '🏷️ Preço Premium',
                descricao: 'Seu preço está acima do mercado. Isso pode limitar vendas.',
                acao: 'Destaque seus diferenciais ou considere uma leve redução.',
                prioridade: 'media',
                icone: 'fas fa-tag'
            });
        }
    }
    
    // Recomendação de eficiência
    if (custos) {
        const proporcaoCustosFixos = (custos.fixoMensal / (resultados.receitaMensal || 1)) * 100;
        if (proporcaoCustosFixos > 40) {
            recomendacoes.push({
                titulo: '🏢 Custos Fixos Elevados',
                descricao: 'Seus custos fixos representam mais de 40% da receita.',
                acao: 'Avalie terceirizações ou reduções de estrutura.',
                prioridade: 'media',
                icone: 'fas fa-building'
            });
        }
    }
    
    // Se não houver recomendações críticas
    if (recomendacoes.length === 0) {
        recomendacoes.push({
            titulo: '✅ Situação Satisfatória',
            descricao: 'Seu negócio apresenta indicadores saudáveis. Continue monitorando!',
            acao: 'Mantenha o bom trabalho e busque melhorias contínuas.',
            prioridade: 'baixa',
            icone: 'fas fa-check-circle'
        });
    }
    
    // Ordenar por prioridade
    const ordemPrioridade = { alta: 1, media: 2, baixa: 3 };
    recomendacoes.sort((a, b) => ordemPrioridade[a.prioridade] - ordemPrioridade[b.prioridade]);
    
    // Atualizar lista de recomendações
    const listaRecomendacoes = document.getElementById('listaRecomendacoes');
    if (listaRecomendacoes) {
        listaRecomendacoes.innerHTML = '';
        
        recomendacoes.forEach((rec, index) => {
            const corPrioridade = {
                alta: 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20',
                media: 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
                baixa: 'border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20'
            };
            
            const item = document.createElement('div');
            item.className = `p-4 rounded-lg ${corPrioridade[rec.prioridade]} mb-4`;
            item.innerHTML = `
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <i class="${rec.icone} text-lg mt-1 ${rec.prioridade === 'alta' ? 'text-red-600' : rec.prioridade === 'media' ? 'text-yellow-600' : 'text-green-600'}"></i>
                    </div>
                    <div class="ml-3 flex-1">
                        <h4 class="font-bold text-gray-900 dark:text-white">${rec.titulo}</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">${rec.descricao}</p>
                        <div class="mt-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Ação recomendada:</p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">${rec.acao}</p>
                        </div>
                    </div>
                </div>
            `;
            listaRecomendacoes.appendChild(item);
        });
    }
    
    // Atualizar contador
    const contadorRecomendacoes = document.getElementById('contadorRecomendacoes');
    if (contadorRecomendacoes) {
        contadorRecomendacoes.textContent = `${recomendacoes.length} ${recomendacoes.length === 1 ? 'recomendação' : 'recomendações'}`;
    }
}

// ==================== FUNÇÕES DO DASHBOARD ====================

function atualizarDashboard() {
    // Atualizar resumo
    atualizarResumoDashboard();
    
    // Atualizar próximos passos
    atualizarProximosPassos();
    
    // Atualizar alertas
    verificarAlertas();
}

function atualizarResumoDashboard() {
    const custos = dadosNegocio.custos;
    const resultados = dadosNegocio.resultados;
    
    // Preço sugerido
    const precoSugerido = document.getElementById('dashboardPrecoSugerido');
    if (precoSugerido && custos?.totalUnitario) {
        const precoComMarkup = custos.totalUnitario * (1 + (custos.markupSugerido || 100)/100);
        precoSugerido.textContent = formatarMoeda(precoComMarkup);
    }
    
    // Custo unitário
    const custoUnitario = document.getElementById('dashboardCustoUnitario');
    if (custoUnitario && custos?.totalUnitario) {
        custoUnitario.textContent = formatarMoeda(custos.totalUnitario);
    }
    
    // Margem estimada
    const margemEstimada = document.getElementById('dashboardMargemEstimada');
    if (margemEstimada && custos?.totalUnitario && precoSugerido) {
        const preco = parseFloat(precoSugerido.textContent.replace('R$', '').replace('.', '').replace(',', '.'));
        const margem = ((preco - custos.totalUnitario) / preco) * 100;
        margemEstimada.textContent = margem.toFixed(1) + '%';
    }
    
    // Lucro mensal estimado
    const lucroMensalEstimado = document.getElementById('dashboardLucroMensalEstimado');
    if (lucroMensalEstimado && custos?.totalUnitario && custos.qtdMensal && precoSugerido) {
        const preco = parseFloat(precoSugerido.textContent.replace('R$', '').replace('.', '').replace(',', '.'));
        const lucroUnitario = preco - custos.totalUnitario;
        const lucroMensal = lucroUnitario * custos.qtdMensal;
        lucroMensalEstimado.textContent = formatarMoeda(lucroMensal);
    }
}

function atualizarProximosPassos() {
    const passos = [];
    
    // Verificar se cada etapa está completa
    if (!dadosNegocio.empresa.nome) {
        passos.push({
            icone: 'fas fa-building',
            texto: 'Complete os dados da empresa',
            tab: 'dados',
            concluido: false
        });
    }
    
    if (!dadosNegocio.custos.totalUnitario) {
        passos.push({
            icone: 'fas fa-calculator',
            texto: 'Configure os custos do produto',
            tab: 'custos',
            concluido: false
        });
    } else {
        passos.push({
            icone: 'fas fa-calculator',
            texto: 'Custos configurados ✓',
            tab: 'custos',
            concluido: true
        });
    }
    
    if (!document.getElementById('precoVendaFinal')?.value) {
        passos.push({
            icone: 'fas fa-tag',
            texto: 'Defina o preço de venda',
            tab: 'precificacao',
            concluido: false
        });
    }
    
    if (!dadosNegocio.mercado.precoMedio) {
        passos.push({
            icone: 'fas fa-chart-bar',
            texto: 'Analise a concorrência',
            tab: 'mercado',
            concluido: false
        });
    }
    
    // Atualizar lista
    const listaPassos = document.getElementById('proximosPassosLista');
    if (listaPassos) {
        listaPassos.innerHTML = '';
        
        passos.forEach((passo, index) => {
            const item = document.createElement('li');
            item.className = 'flex items-center mb-3';
            item.innerHTML = `
                <i class="${passo.icone} ${passo.concluido ? 'text-green-500' : 'text-blue-500'} mr-3"></i>
                <span class="flex-1 ${passo.concluido ? 'text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'}">
                    ${passo.texto}
                </span>
                ${!passo.concluido ? 
                    `<button onclick="openTab('${passo.tab}')" class="text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800">
                        Ir
                    </button>` : 
                    `<i class="fas fa-check text-green-500"></i>`
                }
            `;
            listaPassos.appendChild(item);
        });
    }
}

function verificarAlertas() {
    const alertas = document.getElementById('alertasDashboard');
    if (!alertas) return;
    
    let alertasHTML = '';
    
    // Verificar custos não preenchidos
    if (!dadosNegocio.custos.totalUnitario) {
        alertasHTML += `
            <div class="p-4 mb-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-r-lg">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <i class="fas fa-exclamation-triangle text-yellow-500"></i>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-yellow-700 dark:text-yellow-300">
                            <strong>Custos não configurados</strong> - Complete a análise de custos para uma precificação precisa.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Verificar margem muito baixa
    const resultados = dadosNegocio.resultados;
    if (resultados && resultados.margemLucro < 10) {
        alertasHTML += `
            <div class="p-4 mb-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-lg">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <i class="fas fa-exclamation-circle text-red-500"></i>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-red-700 dark:text-red-300">
                            <strong>Margem de lucro baixa</strong> - Sua margem está abaixo de 10%. Considere revisar preços ou custos.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
    
    if (alertasHTML === '') {
        alertasHTML = `
            <div class="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-r-lg">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <i class="fas fa-check-circle text-green-500"></i>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-green-700 dark:text-green-300">
                            <strong>Tudo em ordem!</strong> - Não há alertas críticos no momento.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
    
    alertas.innerHTML = alertasHTML;
}

// ==================== FUNÇÕES UTILITÁRIAS ====================

function formatarMoeda(valor) {
    if (isNaN(valor) || valor === null || valor === undefined) return 'R$ 0,00';
    return 'R$ ' + valor.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function mostrarToast(mensagem, tipo = 'info') {
    // Tipos: success, error, warning, info
    const toast = document.createElement('div');
    toast.className = `toast-notification fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full opacity-0`;
    
    const cores = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white'
    };
    
    toast.className += ` ${cores[tipo]}`;
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : tipo === 'warning' ? 'exclamation-triangle' : 'info-circle'} mr-2"></i>
            <span>${mensagem}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Mostrar
    setTimeout(() => {
        toast.classList.remove('translate-x-full', 'opacity-0');
        toast.classList.add('translate-x-0', 'opacity-100');
    }, 10);
    
    // Esconder após 3 segundos
    setTimeout(() => {
        toast.classList.remove('translate-x-0', 'opacity-100');
        toast.classList.add('translate-x-full', 'opacity-0');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function mostrarAlertaErro(mensagem) {
    const alerta = document.createElement('div');
    alerta.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded fixed top-4 left-1/2 transform -translate-x-1/2 z-50';
    alerta.innerHTML = `
        <strong>Erro:</strong> ${mensagem}
        <button class="float-right font-bold" onclick="this.parentElement.remove()">&times;</button>
    `;
    document.body.appendChild(alerta);
}

function inicializarEventos() {
    console.log('Inicializando eventos...');
    
    // Atualizar custos quando inputs mudam
    document.querySelectorAll('#tabCustos input, #tabCustos select').forEach(input => {
        input.addEventListener('input', function() {
            calcularCustos();
            if (typeof atualizarPrecificacao === 'function') {
                atualizarPrecificacao();
            }
        });
    });
    
    // Atualizar precificação quando inputs mudam
    const precoVendaFinal = document.getElementById('precoVendaFinal');
    if (precoVendaFinal) {
        precoVendaFinal.addEventListener('input', function() {
            atualizarPrecoFinal(this.value);
        });
    }
    
    // Markup slider
    const markupSlider = document.getElementById('markupSlider');
    if (markupSlider) {
        markupSlider.addEventListener('input', function() {
            atualizarMarkup(this.value);
        });
    }
    
    // Markup input
    const markupInput = document.getElementById('markupInput');
    if (markupInput) {
        markupInput.addEventListener('input', function() {
            atualizarMarkup(this.value);
        });
    }
    
    // Margem desejada
    const margemDesejada = document.getElementById('margemDesejada');
    if (margemDesejada) {
        margemDesejada.addEventListener('input', calcularPrecoPorMargem);
    }
    
    // Eventos de mercado
    document.querySelectorAll('#tabMercado input').forEach(input => {
        input.addEventListener('input', function() {
            analisarConcorrencia();
            sugerirPrecoPorMercado();
        });
    });
    
    // Botão de salvar
    const btnSalvar = document.getElementById('btnSalvarDados');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', salvarDados);
    }
    
    // Botão de exportar
    const btnExportar = document.getElementById('btnExportarDados');
    if (btnExportar) {
        btnExportar.addEventListener('click', exportarDados);
    }
    
    // Botão de imprimir
    const btnImprimir = document.getElementById('btnImprimirRelatorio');
    if (btnImprimir) {
        btnImprimir.addEventListener('click', imprimirRelatorio);
    }
    
    console.log('Eventos inicializados!');
}

function salvarDados() {
    try {
        // Coletar todos os dados
        const dadosParaSalvar = {
            dadosNegocio: dadosNegocio,
            timestamp: new Date().toISOString(),
            versao: '1.0'
        };
        
        localStorage.setItem('precificaAIDados', JSON.stringify(dadosParaSalvar));
        mostrarToast('Dados salvos com sucesso!', 'success');
        
        return true;
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        mostrarToast('Erro ao salvar dados', 'error');
        return false;
    }
}

function carregarDadosSalvos() {
    try {
        const dadosSalvos = localStorage.getItem('precificaAIDados');
        if (!dadosSalvos) return false;
        
        const dados = JSON.parse(dadosSalvos);
        
        // Atualizar dadosNegocio
        if (dados.dadosNegocio) {
            Object.assign(dadosNegocio, dados.dadosNegocio);
            
            // Recalcular
            calcularCustos();
            atualizarDashboard();
            
            mostrarToast('Dados carregados com sucesso!', 'success');
            return true;
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
    
    return false;
}

function exportarDados() {
    try {
        const dados = {
            dadosNegocio: dadosNegocio,
            exportacao: new Date().toISOString(),
            relatorio: 'Precifica.AI - Relatório de Precificação'
        };
        
        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `precifica-ai-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        mostrarToast('Dados exportados com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        mostrarToast('Erro ao exportar dados', 'error');
    }
}

function imprimirRelatorio() {
    window.print();
}

function atualizarProgresso() {
    // Calcular progresso geral baseado em etapas completas
    const etapas = ['empresa', 'produto', 'custos', 'precificacao', 'mercado', 'resultados'];
    let completas = 0;
    
    if (dadosNegocio.empresa.nome) completas++;
    if (dadosNegocio.produto.nome) completas++;
    if (dadosNegocio.custos.totalUnitario) completas++;
    if (document.getElementById('precoVendaFinal')?.value) completas++;
    if (dadosNegocio.mercado.precoMedio) completas++;
    if (dadosNegocio.resultados.lucroMensal) completas++;
    
    const progresso = Math.round((completas / etapas.length) * 100);
    const progressoElement = document.getElementById('progressoGeral');
    
    if (progressoElement) {
        progressoElement.textContent = `${progresso}% completo`;
        
        const barra = progressoElement.querySelector('.progresso-barra');
        if (barra) {
            barra.style.width = `${progresso}%`;
        }
    }
}

// ==================== FUNÇÕES DE TOOLTIP ====================

function mostrarTooltip(event) {
    const tooltip = event.currentTarget.querySelector('.tooltip');
    if (tooltip) {
        tooltip.classList.remove('hidden');
        tooltip.classList.add('block');
    }
}

function esconderTooltip(event) {
    const tooltip = event.currentTarget.querySelector('.tooltip');
    if (tooltip) {
        tooltip.classList.add('hidden');
        tooltip.classList.remove('block');
    }
}

// ==================== EXPORTAÇÃO DE FUNÇÕES ====================

// Tornar funções essenciais disponíveis globalmente
window.openTab = openTab;
window.mostrarPassoDados = mostrarPassoDados;
window.avancarPassoDados = avancarPassoDados;
window.voltarPassoDados = voltarPassoDados;
window.calcularCustos = calcularCustos;
window.sugerirCustosPorSetor = sugerirCustosPorSetor;
window.aplicarTemplateSetor = aplicarTemplateSetor;
window.selecionarMetodo = selecionarMetodo;
window.atualizarMarkup = atualizarMarkup;
window.atualizarPrecificacao = atualizarPrecificacao;
window.aplicarPrecoPsicologico = aplicarPrecoPsicologico;
window.atualizarPrecoFinal = atualizarPrecoFinal;
window.analisarConcorrencia = analisarConcorrencia;
window.calcularResultados = calcularResultados;
window.atualizarProjecoes = atualizarProjecoes;
window.calcularMetaFaturamento = calcularMetaFaturamento;
window.gerarRecomendacoes = gerarRecomendacoes;
window.formatarMoeda = formatarMoeda;
window.mostrarToast = mostrarToast;
window.salvarDados = salvarDados;

console.log('✅ Script principal carregado e pronto!');
