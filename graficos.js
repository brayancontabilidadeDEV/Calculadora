class GerenciadorGraficos {
    constructor() {
        this.graficos = {};
    }

    inicializarGraficos() {
        // Inicializar todos os gráficos vazios
        this.inicializarGraficoDespesas();
        this.inicializarGraficoReceitasDespesas();
        this.inicializarGraficoMetas();
        this.inicializarGraficoDistribuicaoCustos();
        this.inicializarGraficoComparacaoConcorrencia();
        this.inicializarGraficoEvolucaoLucro();
    }

    atualizarGraficosComDados(dadosUsuario) {
        // Atualizar todos os gráficos com dados do usuário
        this.atualizarGraficoDespesas(dadosUsuario.custos);
        this.atualizarGraficoReceitasDespesas(dadosUsuario.resultados);
        this.atualizarGraficoMetas(dadosUsuario);
        this.atualizarGraficoDistribuicaoCustos(dadosUsuario.custos);
        this.atualizarGraficoComparacaoConcorrencia(dadosUsuario.mercado);
        this.atualizarGraficoEvolucaoLucro(dadosUsuario.projecoes);
    }

    inicializarGraficoDespesas() {
        const ctx = document.getElementById('graficoDespesas');
        if (!ctx) return;
        
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
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribuição do Preço'
                    }
                }
            }
        });
    }

    atualizarGraficoDespesas(custos) {
        if (!this.graficos.despesas || !custos) return;
        
        const custoVariavel = custos.variavelUnitario || 0;
        const custoFixo = custos.fixoUnitario || 0;
        const impostos = (custoVariavel + custoFixo) * 0.07; // 7% estimado
        const lucro = custos.lucroUnitario || 0;
        
        this.graficos.despesas.data.datasets[0].data = [
            custoVariavel,
            custoFixo,
            impostos,
            lucro
        ];
        this.graficos.despesas.update();
    }

    inicializarGraficoComparacaoConcorrencia() {
        const ctx = document.getElementById('graficoConcorrencia');
        if (!ctx) return;
        
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

    atualizarGraficoComparacaoConcorrencia(dadosMercado) {
        if (!this.graficos.concorrencia || !dadosMercado) return;
        
        const precoMin = parseFloat(document.getElementById('precoMinConcorrencia').value) || 0;
        const precoMedio = parseFloat(document.getElementById('precoMedioConcorrencia').value) || 0;
        const precoMax = parseFloat(document.getElementById('precoMaxConcorrencia').value) || 0;
        const meuPreco = parseFloat(document.getElementById('precoVendaFinal').value) || 0;
        
        this.graficos.concorrencia.data.datasets[0].data = [
            precoMin,
            precoMedio,
            meuPreco,
            precoMax
        ];
        this.graficos.concorrencia.update();
    }
}
