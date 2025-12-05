// graficos.js - Versão Corrigida e Sincronizada
class GerenciadorGraficos {
    constructor() {
        this.graficos = {};
        this.inicializado = false;
        this.ctxCache = new Map();
    }

    inicializarTodosGraficos() {
        try {
            console.log('🚀 Inicializando todos os gráficos...');
            
            // Verificar se Chart.js está disponível
            if (typeof Chart === 'undefined') {
                console.error('❌ Chart.js não está carregado!');
                this.mostrarToast('Erro: Chart.js não carregado. Recarregue a página.', 'error');
                return;
            }
            
            // Inicializar cada gráfico individualmente
            this.inicializarDashboard();
            this.inicializarComposicaoPreco();
            this.inicializarDistribuicaoPreco();
            this.inicializarComparacaoConcorrencia();
            this.inicializarEvolucaoLucro();
            this.inicializarPontoEquilibrio();
            this.inicializarProjecaoFaturamento();
            this.inicializarProjecaoLucro();
            
            this.inicializado = true;
            console.log('✅ Todos os gráficos inicializados com sucesso!');
            this.mostrarToast('Gráficos prontos para uso!', 'success');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar gráficos:', error);
            this.mostrarToast('Erro ao carregar gráficos', 'error');
        }
    }

    getContext(canvasId) {
        // Usar cache para melhor performance
        if (this.ctxCache.has(canvasId)) {
            return this.ctxCache.get(canvasId);
        }
        
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`⚠️ Canvas não encontrado: ${canvasId}`);
            return null;
        }
        
        try {
            const ctx = canvas.getContext('2d');
            this.ctxCache.set(canvasId, ctx);
            return ctx;
        } catch (error) {
            console.error(`❌ Erro ao obter contexto do canvas ${canvasId}:`, error);
            return null;
        }
    }

    destruirGrafico(graficoId) {
        if (this.graficos[graficoId]) {
            try {
                this.graficos[graficoId].destroy();
                delete this.graficos[graficoId];
            } catch (error) {
                console.warn(`⚠️ Erro ao destruir gráfico ${graficoId}:`, error);
            }
        }
    }

    inicializarDashboard() {
        const ctx = this.getContext('dashGraficoResumo');
        if (!ctx) {
            console.warn('Canvas do dashboard não encontrado, tentando novamente...');
            setTimeout(() => this.inicializarDashboard(), 500);
            return;
        }
        
        this.destruirGrafico('dashboard');
        
        try {
            this.graficos.dashboard = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                    datasets: [{
                        label: 'Faturamento Projetado',
                        data: [1500, 2200, 3000, 3500, 4200, 5000],
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
                        pointRadius: 5,
                        pointBackgroundColor: 'rgb(59, 130, 246)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: this.getOpcoesGrafico('Faturamento Mensal (R$)')
            });
        } catch (error) {
            console.error('❌ Erro ao inicializar dashboard:', error);
        }
    }

    inicializarComposicaoPreco() {
        const ctx = this.getContext('graficoComposicaoPreco');
        if (!ctx) {
            setTimeout(() => this.inicializarComposicaoPreco(), 500);
            return;
        }
        
        this.destruirGrafico('composicaoPreco');
        
        try {
            this.graficos.composicaoPreco = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Custo Variável', 'Custo Fixo', 'Impostos', 'Lucro'],
                    datasets: [{
                        data: [30, 20, 15, 35],
                        backgroundColor: [
                            'rgba(239, 68, 68, 0.8)',
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(16, 185, 129, 0.8)'
                        ],
                        borderColor: [
                            'rgb(239, 68, 68)',
                            'rgb(59, 130, 246)',
                            'rgb(245, 158, 11)',
                            'rgb(16, 185, 129)'
                        ],
                        borderWidth: 2,
                        hoverOffset: 15
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: this.getCorTexto(),
                                padding: 20,
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return `${label}: R$ ${value.toFixed(2)} (${percentage}%)`;
                                }
                            }
                        }
                    },
                    cutout: '60%'
                }
            });
        } catch (error) {
            console.error('❌ Erro ao inicializar composição de preço:', error);
        }
    }

    inicializarDistribuicaoPreco() {
        const ctx = this.getContext('graficoDistribuicaoPreco');
        if (!ctx) {
            setTimeout(() => this.inicializarDistribuicaoPreco(), 500);
            return;
        }
        
        this.destruirGrafico('distribuicaoPreco');
        
        try {
            this.graficos.distribuicaoPreco = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Matéria-Prima', 'Mão de Obra', 'Impostos', 'Lucro', 'Marketing', 'Outros'],
                    datasets: [{
                        data: [35, 25, 15, 15, 5, 5],
                        backgroundColor: [
                            'rgba(239, 68, 68, 0.8)',
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(139, 92, 246, 0.8)',
                            'rgba(156, 163, 175, 0.8)'
                        ],
                        borderColor: this.isDarkMode() ? '#1f2937' : '#ffffff',
                        borderWidth: 2,
                        hoverOffset: 15
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                color: this.getCorTexto(),
                                padding: 15,
                                font: {
                                    size: 11
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return `${label}: ${percentage}% (R$ ${value.toFixed(2)})`;
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('❌ Erro ao inicializar distribuição de preço:', error);
        }
    }

    inicializarComparacaoConcorrencia() {
        const ctx = this.getContext('graficoComparacaoConcorrenciaGraficos');
        if (!ctx) {
            setTimeout(() => this.inicializarComparacaoConcorrencia(), 500);
            return;
        }
        
        this.destruirGrafico('comparacaoConcorrencia');
        
        try {
            this.graficos.comparacaoConcorrencia = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Mais Barato', 'Média Mercado', 'Mais Caro', 'Seu Preço'],
                    datasets: [{
                        label: 'Preço de Venda (R$)',
                        data: [45.90, 52.50, 59.90, 54.80],
                        backgroundColor: [
                            'rgba(239, 68, 68, 0.7)',
                            'rgba(59, 130, 246, 0.7)',
                            'rgba(245, 158, 11, 0.7)',
                            'rgba(16, 185, 129, 0.7)'
                        ],
                        borderColor: [
                            'rgb(239, 68, 68)',
                            'rgb(59, 130, 246)',
                            'rgb(245, 158, 11)',
                            'rgb(16, 185, 129)'
                        ],
                        borderWidth: 2,
                        borderRadius: 6
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
                                    return `Preço: R$ ${context.parsed.y.toFixed(2)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Preço (R$)',
                                color: this.getCorTexto(),
                                font: {
                                    size: 12,
                                    weight: 'bold'
                                }
                            },
                            grid: {
                                color: this.getCorGrid()
                            },
                            ticks: {
                                color: this.getCorTexto(),
                                callback: function(value) {
                                    return 'R$ ' + value.toFixed(2);
                                }
                            }
                        },
                        x: {
                            grid: {
                                color: this.getCorGrid()
                            },
                            ticks: {
                                color: this.getCorTexto(),
                                font: {
                                    size: 11
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('❌ Erro ao inicializar comparação de concorrência:', error);
        }
    }

    inicializarEvolucaoLucro() {
        const ctx = this.getContext('graficoEvolucaoLucro');
        if (!ctx) {
            setTimeout(() => this.inicializarEvolucaoLucro(), 500);
            return;
        }
        
        this.destruirGrafico('evolucaoLucro');
        
        try {
            this.graficos.evolucaoLucro = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                    datasets: [
                        {
                            label: 'Lucro Mensal',
                            data: [1200, 1900, 1500, 2500, 2200, 3000],
                            borderColor: 'rgb(16, 185, 129)',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderWidth: 3,
                            tension: 0.3,
                            fill: true,
                            pointRadius: 5,
                            pointBackgroundColor: 'rgb(16, 185, 129)'
                        },
                        {
                            label: 'Faturamento',
                            data: [5000, 7000, 6500, 8000, 7500, 9000],
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderWidth: 3,
                            tension: 0.3,
                            fill: true,
                            pointRadius: 5,
                            pointBackgroundColor: 'rgb(59, 130, 246)'
                        }
                    ]
                },
                options: this.getOpcoesGraficoMultiplo('Valor (R$)')
            });
        } catch (error) {
            console.error('❌ Erro ao inicializar evolução do lucro:', error);
        }
    }

    inicializarPontoEquilibrio() {
        const ctx = this.getContext('graficoPontoEquilibrio');
        if (!ctx) {
            setTimeout(() => this.inicializarPontoEquilibrio(), 500);
            return;
        }
        
        this.destruirGrafico('pontoEquilibrio');
        
        try {
            this.graficos.pontoEquilibrio = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['0', '20', '40', '60', '80', '100'],
                    datasets: [
                        {
                            label: 'Custos Totais',
                            data: [800, 1100, 1400, 1700, 2000, 2300],
                            borderColor: 'rgb(239, 68, 68)',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderWidth: 3,
                            tension: 0.3,
                            pointRadius: 4
                        },
                        {
                            label: 'Receita Total',
                            data: [0, 1000, 2000, 3000, 4000, 5000],
                            borderColor: 'rgb(16, 185, 129)',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderWidth: 3,
                            tension: 0.3,
                            pointRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                color: this.getCorTexto(),
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    label += 'R$ ' + context.parsed.y.toLocaleString('pt-BR');
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Valor (R$)',
                                color: this.getCorTexto(),
                                font: {
                                    size: 12,
                                    weight: 'bold'
                                }
                            },
                            grid: {
                                color: this.getCorGrid()
                            },
                            ticks: {
                                color: this.getCorTexto()
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Quantidade Vendida',
                                color: this.getCorTexto(),
                                font: {
                                    size: 12,
                                    weight: 'bold'
                                }
                            },
                            grid: {
                                color: this.getCorGrid()
                            },
                            ticks: {
                                color: this.getCorTexto()
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('❌ Erro ao inicializar ponto de equilíbrio:', error);
        }
    }

    inicializarProjecaoFaturamento() {
        const ctx = this.getContext('graficoProjecaoFaturamento');
        if (!ctx) {
            setTimeout(() => this.inicializarProjecaoFaturamento(), 500);
            return;
        }
        
        this.destruirGrafico('projecaoFaturamento');
        
        try {
            this.graficos.projecaoFaturamento = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Mês 1', 'Mês 2', 'Mês 3', 'Mês 4', 'Mês 5', 'Mês 6'],
                    datasets: [{
                        label: 'Faturamento Projetado',
                        data: [5000, 5500, 6000, 6500, 7000, 7500],
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointBackgroundColor: 'rgb(59, 130, 246)'
                    }]
                },
                options: this.getOpcoesGrafico('Faturamento (R$)')
            });
        } catch (error) {
            console.error('❌ Erro ao inicializar projeção de faturamento:', error);
        }
    }

    inicializarProjecaoLucro() {
        const ctx = this.getContext('graficoProjecaoLucro');
        if (!ctx) {
            setTimeout(() => this.inicializarProjecaoLucro(), 500);
            return;
        }
        
        this.destruirGrafico('projecaoLucro');
        
        try {
            this.graficos.projecaoLucro = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Mês 1', 'Mês 2', 'Mês 3', 'Mês 4', 'Mês 5', 'Mês 6'],
                    datasets: [{
                        label: 'Lucro Projetado',
                        data: [1000, 1200, 1400, 1600, 1800, 2000],
                        backgroundColor: 'rgba(16, 185, 129, 0.7)',
                        borderColor: 'rgb(16, 185, 129)',
                        borderWidth: 2,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                color: this.getCorTexto(),
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `Lucro: R$ ${context.parsed.y.toLocaleString('pt-BR')}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: this.getCorGrid()
                            },
                            ticks: {
                                color: this.getCorTexto(),
                                callback: function(value) {
                                    if (value >= 1000) {
                                        return 'R$ ' + (value / 1000).toFixed(1) + 'k';
                                    }
                                    return 'R$ ' + value;
                                }
                            }
                        },
                        x: {
                            grid: {
                                color: this.getCorGrid()
                            },
                            ticks: {
                                color: this.getCorTexto()
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('❌ Erro ao inicializar projeção de lucro:', error);
        }
    }

    // ==================== MÉTODOS DE ATUALIZAÇÃO ====================
    atualizarGraficoComposicao(preco, custoVarUnit, custoFixoUnit, markup) {
        if (!this.graficos.composicaoPreco) return;
        
        try {
            const impostos = preco * 0.15;
            const lucro = preco - custoVarUnit - custoFixoUnit - impostos;
            
            // Garantir valores não negativos
            const dados = [
                Math.max(custoVarUnit, 0),
                Math.max(custoFixoUnit, 0),
                Math.max(impostos, 0),
                Math.max(lucro, 0)
            ];
            
            this.graficos.composicaoPreco.data.datasets[0].data = dados;
            this.graficos.composicaoPreco.update('none');
            
        } catch (error) {
            console.error('❌ Erro ao atualizar gráfico de composição:', error);
        }
    }

    atualizarGraficoDistribuicaoPreco(custos, preco) {
        if (!this.graficos.distribuicaoPreco || !custos || !preco) return;
        
        try {
            const valores = [
                custos.variavelUnitario || 0,
                custos.fixoUnitario || 0,
                preco * 0.15,
                preco * 0.20,
                preco * 0.08,
                preco * 0.05
            ];
            
            this.graficos.distribuicaoPreco.data.datasets[0].data = valores;
            this.graficos.distribuicaoPreco.update('none');
            
        } catch (error) {
            console.error('❌ Erro ao atualizar gráfico de distribuição:', error);
        }
    }

    atualizarGraficoComparacaoConcorrencia(precoMin, precoMedio, precoMax, meuPreco) {
        if (!this.graficos.comparacaoConcorrencia) return;
        
        try {
            this.graficos.comparacaoConcorrencia.data.datasets[0].data = [
                precoMin || 0,
                precoMedio || 0,
                precoMax || 0,
                meuPreco || 0
            ];
            
            this.graficos.comparacaoConcorrencia.update('none');
            
        } catch (error) {
            console.error('❌ Erro ao atualizar gráfico de comparação:', error);
        }
    }

    atualizarProjecoes(meses, receitas, lucros) {
        try {
            if (this.graficos.projecaoFaturamento && receitas) {
                this.graficos.projecaoFaturamento.data.labels = meses.slice(0, 6);
                this.graficos.projecaoFaturamento.data.datasets[0].data = receitas.slice(0, 6);
                this.graficos.projecaoFaturamento.update('none');
            }
            
            if (this.graficos.projecaoLucro && lucros) {
                this.graficos.projecaoLucro.data.labels = meses.slice(0, 6);
                this.graficos.projecaoLucro.data.datasets[0].data = lucros.slice(0, 6);
                this.graficos.projecaoLucro.update('none');
            }
            
        } catch (error) {
            console.error('❌ Erro ao atualizar projeções:', error);
        }
    }

    atualizarTodosGraficosComDados() {
        if (!this.inicializado) {
            console.warn('⚠️ Gráficos não inicializados');
            return;
        }
        
        try {
            console.log('🔄 Atualizando todos os gráficos com dados...');
            
            // Obter dados da interface
            const precoElement = document.getElementById('precoVendaFinal');
            const preco = precoElement ? parseFloat(precoElement.value) || 0 : 0;
            
            const qtdElement = document.getElementById('qtdVendaMensal');
            const qtdMensal = qtdElement ? parseInt(qtdElement.value) || 100 : 100;
            
            // Atualizar composição de preço
            if (this.graficos.composicaoPreco && preco > 0) {
                const custoVarUnit = parseFloat(document.getElementById('materiaPrima')?.value) || 0;
                const custoFixoMensal = parseFloat(document.getElementById('aluguel')?.value) || 0;
                const custoFixoUnit = qtdMensal > 0 ? custoFixoMensal / qtdMensal : 0;
                
                this.atualizarGraficoComposicao(preco, custoVarUnit, custoFixoUnit, 100);
            }
            
            // Atualizar dashboard
            if (this.graficos.dashboard) {
                const faturamentoBase = parseFloat(document.getElementById('kpiFaturamento')?.textContent?.replace(/[^\d,]/g, '').replace(',', '.') || 0);
                if (faturamentoBase > 0) {
                    const projecao = Array.from({length: 6}, (_, i) => 
                        faturamentoBase * (1 + (i * 0.1))
                    );
                    this.graficos.dashboard.data.datasets[0].data = projecao;
                    this.graficos.dashboard.update('none');
                }
            }
            
            // Atualizar ponto de equilíbrio
            if (this.graficos.pontoEquilibrio) {
                const pontoEquilibrio = parseInt(document.getElementById('kpiPontoEquilibrio')?.textContent || 32);
                if (pontoEquilibrio > 0) {
                    const labels = ['0', '20', '40', '60', '80', '100'];
                    const custoFixo = parseFloat(document.getElementById('aluguel')?.value) || 800;
                    const custoVarUnit = parseFloat(document.getElementById('materiaPrima')?.value) || 10;
                    const precoVenda = preco || 50;
                    
                    const custosTotais = labels.map(qtd => custoFixo + (custoVarUnit * parseInt(qtd)));
                    const receitasTotais = labels.map(qtd => parseInt(qtd) * precoVenda);
                    
                    this.graficos.pontoEquilibrio.data.labels = labels;
                    this.graficos.pontoEquilibrio.data.datasets[0].data = custosTotais;
                    this.graficos.pontoEquilibrio.data.datasets[1].data = receitasTotais;
                    this.graficos.pontoEquilibrio.update('none');
                }
            }
            
            console.log('✅ Gráficos atualizados!');
            
        } catch (error) {
            console.error('❌ Erro ao atualizar gráficos com dados:', error);
        }
    }

    // ==================== UTILITÁRIOS ====================
    getOpcoesGrafico(tituloY) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: this.getCorTexto(),
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += 'R$ ' + context.parsed.y.toLocaleString('pt-BR');
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: this.getCorGrid()
                    },
                    ticks: {
                        color: this.getCorTexto(),
                        callback: function(value) {
                            if (value >= 1000) {
                                return 'R$ ' + (value / 1000).toFixed(1) + 'k';
                            }
                            return 'R$ ' + value;
                        }
                    }
                },
                x: {
                    grid: {
                        color: this.getCorGrid()
                    },
                    ticks: {
                        color: this.getCorTexto()
                    }
                }
            }
        };
    }

    getOpcoesGraficoMultiplo(tituloY) {
        const opcoes = this.getOpcoesGrafico(tituloY);
        opcoes.interaction = {
            mode: 'index',
            intersect: false
        };
        return opcoes;
    }

    isDarkMode() {
        return document.body.classList.contains('dark-mode');
    }

    getCorTexto() {
        return this.isDarkMode() ? '#f3f4f6' : '#111827';
    }

    getCorGrid() {
        return this.isDarkMode() ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    }

    atualizarCoresDarkMode() {
        try {
            Object.values(this.graficos).forEach(grafico => {
                if (grafico && grafico.options) {
                    grafico.update('none');
                }
            });
            
            console.log('🎨 Cores do dark mode atualizadas');
        } catch (error) {
            console.error('❌ Erro ao atualizar cores do dark mode:', error);
        }
    }

    // ==================== EXPORTAÇÃO ====================
    exportarGraficoParaImagem(idGrafico, nomeArquivo) {
        const canvas = document.getElementById(idGrafico);
        if (!canvas) {
            console.error(`❌ Canvas com ID ${idGrafico} não encontrado.`);
            return false;
        }

        try {
            const link = document.createElement('a');
            link.download = nomeArquivo || `grafico-${idGrafico}-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            return true;
        } catch (error) {
            console.error('❌ Erro ao exportar gráfico:', error);
            return false;
        }
    }

    exportarTodosGraficos() {
        const graficosIds = [
            'dashGraficoResumo',
            'graficoComposicaoPreco',
            'graficoDistribuicaoPreco',
            'graficoComparacaoConcorrenciaGraficos',
            'graficoEvolucaoLucro',
            'graficoPontoEquilibrio',
            'graficoProjecaoFaturamento',
            'graficoProjecaoLucro'
        ];
        
        let exportados = 0;
        const dataHoje = new Date().toISOString().split('T')[0];
        
        // Exportar um por um com delay
        graficosIds.forEach((id, index) => {
            setTimeout(() => {
                if (this.exportarGraficoParaImagem(id, `grafico-${dataHoje}-${index + 1}.png`)) {
                    exportados++;
                }
            }, index * 500);
        });
        
        // Mostrar resultado
        setTimeout(() => {
            if (exportados > 0) {
                this.mostrarToast(`${exportados} gráficos exportados com sucesso!`, 'success');
            } else {
                this.mostrarToast('Nenhum gráfico exportado', 'warning');
            }
        }, graficosIds.length * 500 + 1000);
    }

    mostrarToast(mensagem, tipo = 'info') {
        // Usar a função global se existir
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast(mensagem, tipo);
        } else {
            // Fallback local
            console.log(`${tipo.toUpperCase()}: ${mensagem}`);
        }
    }
}

// ==================== INICIALIZAÇÃO GLOBAL ====================
window.gerenciadorGraficos = new GerenciadorGraficos();

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado - Inicializando gráficos...');
    
    // Verificar se Chart.js está disponível
    if (typeof Chart === 'undefined') {
        console.error('❌ Chart.js não carregado!');
        return;
    }
    
    console.log('✅ Chart.js versão:', Chart.version);
    
    // Inicializar gráficos após um pequeno delay
    setTimeout(() => {
        if (window.gerenciadorGraficos && !window.gerenciadorGraficos.inicializado) {
            window.gerenciadorGraficos.inicializarTodosGraficos();
        }
    }, 1000);
    
    // Adicionar listener para dark mode
    document.addEventListener('darkModeChanged', function() {
        if (window.gerenciadorGraficos) {
            setTimeout(() => {
                window.gerenciadorGraficos.atualizarCoresDarkMode();
            }, 100);
        }
    });
});

// Exportar função global para botão
window.exportarTodosGraficos = function() {
    if (window.gerenciadorGraficos) {
        window.gerenciadorGraficos.exportarTodosGraficos();
    } else {
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast('Gerenciador de gráficos não inicializado', 'error');
        }
    }
};
