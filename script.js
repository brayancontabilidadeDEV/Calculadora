// Aguarda o carregamento completo da página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página carregada - iniciando gráficos...');
    
    // Verificar se Chart.js foi carregado
    if (typeof Chart === 'undefined') {
        console.error('Chart.js não foi carregado!');
        return;
    }
    
    console.log('Chart.js carregado com sucesso! Versão:', Chart.version);
    
    // GRÁFICO 1: Despesas por Categoria
    try {
        const ctx1 = document.getElementById('graficoDespesas');
        if (ctx1) {
            new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: ['Aluguel', 'Alimentação', 'Transporte', 'Lazer', 'Saúde'],
                    datasets: [{
                        label: 'Valor (R$)',
                        data: [1200, 800, 400, 300, 200],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(153, 102, 255, 0.7)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Despesas por Categoria'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return 'R$ ' + value;
                                }
                            }
                        }
                    }
                }
            });
            console.log('Gráfico 1 criado com sucesso!');
        }
    } catch (error) {
        console.error('Erro ao criar gráfico 1:', error);
    }
    
    // GRÁFICO 2: Receitas vs Despesas
    try {
        const ctx2 = document.getElementById('graficoReceitasDespesas');
        if (ctx2) {
            new Chart(ctx2, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                    datasets: [
                        {
                            label: 'Receitas',
                            data: [5000, 6000, 5500, 7000, 8000, 7500],
                            borderColor: 'rgba(75, 192, 192, 1)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderWidth: 3,
                            tension: 0.1
                        },
                        {
                            label: 'Despesas',
                            data: [4500, 4800, 5200, 5800, 6200, 6000],
                            borderColor: 'rgba(255, 99, 132, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderWidth: 3,
                            tension: 0.1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Receitas vs Despesas Mensais'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return 'R$ ' + value;
                                }
                            }
                        }
                    }
                }
            });
            console.log('Gráfico 2 criado com sucesso!');
        }
    } catch (error) {
        console.error('Erro ao criar gráfico 2:', error);
    }
    
    // GRÁFICO 3: Metas Financeiras
    try {
        const ctx3 = document.getElementById('graficoMetas');
        if (ctx3) {
            new Chart(ctx3, {
                type: 'doughnut',
                data: {
                    labels: ['Concluído', 'Em andamento', 'Pendente'],
                    datasets: [{
                        data: [40, 35, 25],
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(255, 206, 86, 0.8)',
                            'rgba(255, 99, 132, 0.8)'
                        ],
                        borderColor: [
                            'rgba(75, 192, 192, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(255, 99, 132, 1)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Progresso das Metas Financeiras'
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
            console.log('Gráfico 3 criado com sucesso!');
        }
    } catch (error) {
        console.error('Erro ao criar gráfico 3:', error);
    }
});
