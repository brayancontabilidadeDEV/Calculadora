// graficos.js - Versão Corrigida e Sincronizada
class GerenciadorGraficos {
    constructor() {
        this.graficos = {};
        this.dados = window.dadosNegocio || {};
    }

    inicializarGraficos() {
        console.log('Inicializando gráficos...');
        
        // Inicializar apenas gráficos essenciais
        this.inicializarGraficoDespesas();
        this.inicializarGraficoComparacaoConcorrencia();
        
        // Inicializar gráficos opcionais se os elementos existirem
        if (document.getElementById('graficoDistribuicaoCustos')) {
            this.inicializarGraficoDistribuicaoCustos();
        }
        
        if (document.getElementById('graficoEvolucaoLucro')) {
            this.inicializarGraficoEvolucaoLucro();
        }
        
        if (document.getElementById('graficoComposicaoPreco')) {
            this.inicializarGraficoComposicaoPreco();
        }
    }

    inicializarGraficoDespesas() {
        const ctx = document.getElementById('graficoDespesas');
        if (!ctx) {
            console.log('Elemento graficoDespesas não encontrado');
            return;
        }
        
        // Destruir gráfico anterior se existir
        if (this.graficos.despesas) {
            this.graficos.despesas.destroy();
        }
        
        this.graficos.despesas = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Custos Variáveis', 'Custos Fixos', 'Impostos/Taxas', 'Lucro'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribuição do Preço'
                    }
                }
            }
        });
    }

    atualizarGraficoDespesas(custos, preco) {
        if (!this.graficos.despesas || !custos) return;
        
        const custoVariavel = custos.variavelUnitario || 0;
        const custoFixo = custos.fixoUnitario || 0;
        const impostos = (custoVariavel + custoFixo) * 0.07;
        const lucro = (preco || 0) - (custoVariavel + custoFixo + impostos);
        
        this.graficos.despesas.data.datasets[0].data = [
            custoVariavel,
            custoFixo,
            impostos,
            Math.max(lucro, 0)
        ];
        this.graficos.despesas.update();
    }

    inicializarGraficoComparacaoConcorrencia() {
        const ctx = document.getElementById('graficoConcorrencia');
        if (!ctx) {
            console.log('Elemento graficoConcorrencia não encontrado');
            return;
        }
        
        // Destruir gráfico anterior se existir
        if (this.graficos.concorrencia) {
            this.graficos.concorrencia.destroy();
        }
        
        this.graficos.concorrencia = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Mais Barato', 'Média Mercado', 'Seu Preço', 'Mais Caro'],
                datasets: [{
                    label: 'Preços (R$)',
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Comparação com Concorrência'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Preço (R$)'
                        }
                    }
                }
            }
        });
    }

    atualizarGraficoComparacaoConcorrencia() {
        if (!this.graficos.concorrencia) return;
        
        const precoMin = parseFloat(document.getElementById('precoMinConcorrencia')?.value) || 0;
        const precoMedio = parseFloat(document.getElementById('precoMedioConcorrencia')?.value) || 0;
        const precoMax = parseFloat(document.getElementById('precoMaxConcorrencia')?.value) || 0;
        const meuPreco = parseFloat(document.getElementById('precoVendaFinal')?.value) || 0;
        
        this.graficos.concorrencia.data.datasets[0].data = [
            precoMin,
            precoMedio,
            meuPreco,
            precoMax
        ];
        this.graficos.concorrencia.update();
    }

    inicializarGraficoDistribuicaoCustos() {
        const ctx = document.getElementById('graficoDistribuicaoCustos');
        if (!ctx) return;
        
        this.graficos.distribuicaoCustos = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Matéria-Prima', 'Mão de Obra', 'Frete', 'Marketing', 'Outros'],
                datasets: [{
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    inicializarGraficoEvolucaoLucro() {
        const ctx = document.getElementById('graficoEvolucaoLucro');
        if (!ctx) return;
        
        this.graficos.evolucaoLucro = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [{
                    label: 'Lucro (R$)',
                    data: [0, 0, 0, 0, 0, 0],
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
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

    inicializarGraficoComposicaoPreco() {
        const ctx = document.getElementById('graficoComposicaoPreco');
        if (!ctx) return;
        
        this.graficos.composicaoPreco = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Custos Variáveis', 'Custos Fixos', 'Impostos', 'Lucro'],
                datasets: [{
                    label: 'Valor (R$)',
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        stacked: true
                    },
                    y: {
                        stacked: true
                    }
                }
            }
        });
    }

    atualizarGraficosComDados(dadosUsuario) {
        if (!dadosUsuario) return;
        
        // Atualizar dados
        this.dados = dadosUsuario;
        
        // Atualizar gráficos específicos
        if (this.graficos.despesas && dadosUsuario.custos) {
            const preco = parseFloat(document.getElementById('precoVendaFinal')?.value) || 0;
            this.atualizarGraficoDespesas(dadosUsuario.custos, preco);
        }
        
        if (this.graficos.concorrencia) {
            this.atualizarGraficoComparacaoConcorrencia();
        }
    }

    atualizarTodosGraficosComDados() {
        if (!window.dadosNegocio) return;
        this.atualizarGraficosComDados(window.dadosNegocio);
    }

    exportarGraficoParaImagem(idGrafico, nomeArquivo) {
        const canvas = document.getElementById(idGrafico);
        if (!canvas) {
            console.log(`Canvas ${idGrafico} não encontrado`);
            return;
        }
        
        try {
            const link = document.createElement('a');
            link.download = nomeArquivo || `${idGrafico}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Erro ao exportar gráfico:', error);
        }
    }

    exportarTodosGraficos() {
        const ids = ['graficoDespesas', 'graficoConcorrencia', 'graficoDistribuicaoCustos', 'graficoEvolucaoLucro'];
        ids.forEach(id => {
            this.exportarGraficoParaImagem(id, `${id}.png`);
        });
    }
}

// Inicializar e exportar o gerenciador
window.gerenciadorGraficos = new GerenciadorGraficos();
