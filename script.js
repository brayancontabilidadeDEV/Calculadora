// ==================== CONFIGURAÇÃO INICIAL ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Calculadora MEI Premium - Brayan Contabilidade 🚀');
    
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
function inicializarAplicacao() {
    try {
        console.log('🔄 Iniciando aplicação...');
        
        // Carregar dados salvos e configurações
        carregarDadosSalvos();
        
        // Inicializar funcionalidades
        inicializarEventos();
        inicializarTooltips();
        
        // Inicializar cálculos
        calcularCustos();
        atualizarDashboard();
        atualizarProgresso();
        
        // Inicializar gráficos se disponível
        if (typeof window.gerenciadorGraficos !== 'undefined') {
            window.gerenciadorGraficos.inicializarTodosGraficos();
            graficosInicializados = true;
        }
        
        // Mostrar primeiro passo
        mostrarPassoDados(1);
        
        // Mostrar dica de boas-vindas
        setTimeout(() => {
            mostrarDicaContextual('welcome');
        }, 1000);
        
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
        
        // Atualizar UI das tabs
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.className = btn.className.replace('gradient-primary text-white', 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300');
        });
        
        // Ativar tab selecionada
        const tabElement = document.getElementById(tabName);
        if (!tabElement) return;
        tabElement.classList.add('active');
        
        // Ativar botão correspondente
        const tabBtnId = `tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`;
        const tabBtn = document.getElementById(tabBtnId);
        if (tabBtn) {
            tabBtn.className = 'tab-btn px-4 py-3 rounded-xl font-medium gradient-primary text-white shadow-md hover-lift';
        }
        
        // Atualizar progresso do wizard
        atualizarProgressoWizard(tabName);
        
        // Executar ações específicas da tab
        executarAcoesTab(tabName);
        
    } catch (error) {
        console.error('Erro ao abrir tab:', error);
        mostrarToast('Erro de navegação', 'error');
    }
}

function executarAcoesTab(tabName) {
    const acoes = {
        'dashboard': () => {
            atualizarDashboard();
            mostrarDicaContextual('dashboard');
        },
        'dados': () => {
            mostrarDicaContextual('dados_basicos');
        },
        'custos': () => {
            calcularCustos();
            mostrarDicaContextual('custos');
        },
        'precificacao': () => {
            atualizarPrecificacao();
            mostrarDicaContextual('precificacao');
        },
        'mercado': () => {
            analisarConcorrencia();
            mostrarDicaContextual('mercado');
        },
        'resultados': () => {
            calcularResultados();
            mostrarDicaContextual('resultados');
        },
        'graficos': () => {
            if (graficosInicializados && window.gerenciadorGraficos) {
                setTimeout(() => window.gerenciadorGraficos.atualizarTodosGraficosComDados(), 300);
            }
        },
        'projecoes': () => {
            atualizarProjecoes();
            mostrarDicaContextual('projecoes');
        },
        'recomendacoes': () => {
            gerarRecomendacoes();
            mostrarDicaContextual('recomendacoes');
        }
    };
    
    if (acoes[tabName]) acoes[tabName]();
}

function atualizarProgressoWizard(tabAtual) {
    const progresso = {
        'dashboard': 0, 'dados': 15, 'custos': 30, 'precificacao': 45,
        'mercado': 60, 'resultados': 75, 'graficos': 85, 'projecoes': 92, 'recomendacoes': 100
    };
    
    const progressBar = document.getElementById('progressBar');
    if (progressBar && progresso[tabAtual] !== undefined) {
        progressBar.style.width = `${progresso[tabAtual]}%`;
        progressBar.setAttribute('aria-valuenow', progresso[tabAtual]);
    }
}

// ==================== DADOS BÁSICOS ====================
function mostrarPassoDados(passo) {
    if (passo < 1 || passo > 4) return;
    
    // Atualizar UI dos passos
    document.querySelectorAll('.passo-conteudo').forEach(div => div.classList.add('hidden'));
    document.querySelectorAll('[id^="passoDados"]').forEach(btn => {
        btn.className = btn.className.replace('bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300', 
            'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300');
    });
    
    // Mostrar passo atual
    const conteudoPasso = document.getElementById(`conteudoPassoDados${passo}`);
    const botaoPasso = document.getElementById(`passoDados${passo}`);
    
    if (conteudoPasso) conteudoPasso.classList.remove('hidden');
    if (botaoPasso) {
        botaoPasso.className = 'px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium whitespace-nowrap';
    }
    
    passoAtualDados = passo;
    
    // Atualizar botão avançar
    const btnAvancar = document.getElementById('btnAvancarDados');
    if (!btnAvancar) return;
    
    if (passo === 4) {
        btnAvancar.innerHTML = 'Finalizar <i class="fas fa-check ml-2"></i>';
        btnAvancar.onclick = () => {
            if (validarDadosBasicos()) {
                openTab('custos');
                mostrarDicaContextual('transicao_custos');
            }
        };
    } else {
        btnAvancar.innerHTML = 'Continuar <i class="fas fa-arrow-right ml-2"></i>';
        btnAvancar.onclick = avancarPassoDados;
    }
    
    // Mostrar dica específica do passo
    const dicasPasso = {
        1: 'empresa',
        2: 'produto',
        3: 'publico',
        4: 'expectativas'
    };
    if (dicasPasso[passo]) {
        mostrarDicaContextual(dicasPasso[passo]);
    }
}

function validarDadosBasicos() {
    const camposObrigatorios = ['empresaNome', 'setorEmpresa', 'nomeProduto', 'publicoAlvo', 'qtdVendaMensal'];
    let validos = true;
    
    camposObrigatorios.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento && (!elemento.value || elemento.value.trim() === '')) {
            elemento.classList.add('border-red-500');
            validos = false;
            
            // Mostrar toast de erro
            if (!elemento._errorShown) {
                mostrarToast(`Preencha o campo: ${elemento.previousElementSibling?.textContent || id}`, 'warning');
                elemento._errorShown = true;
                
                // Remover a marcação após 3 segundos
                setTimeout(() => {
                    elemento.classList.remove('border-red-500');
                    elemento._errorShown = false;
                }, 3000);
            }
        }
    });
    
    if (!validos) {
        mostrarToast('Complete os campos obrigatórios (*) para continuar', 'warning');
        return false;
    }
    
    return true;
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

// ==================== FUNÇÕES DE DICAS CONTEXTUAIS ====================
function mostrarDicaContextual(contexto) {
    // Evitar mostrar muitas dicas seguidas
    if (dicasAtivas.includes(contexto)) return;
    dicasAtivas.push(contexto);
    if (dicasAtivas.length > 5) dicasAtivas.shift();
    
    const dicas = {
        'welcome': {
            titulo: '👋 Bem-vindo à Calculadora MEI Premium!',
            mensagem: 'Complete todos os passos para uma análise completa do seu negócio. Dica: Salve seu progresso a cada etapa.',
            tipo: 'info',
            duracao: 5000
        },
        'dashboard': {
            titulo: '📊 Dashboard Completo',
            mensagem: 'Aqui você vê o resumo do seu negócio. Complete as abas ao lado para atualizar os gráficos.',
            tipo: 'info',
            duracao: 4000
        },
        'dados_basicos': {
            titulo: '📝 Dados do Negócio',
            mensagem: 'Preencha com cuidado - esses dados afetam todos os cálculos futuros. Dica: Seja realista nas expectativas.',
            tipo: 'info',
            duracao: 4500
        },
        'empresa': {
            titulo: '🏢 Sobre sua Empresa',
            mensagem: 'O setor escolhido afeta as sugestões de markup e custos. Escolha o que mais se aproxima da sua realidade.',
            tipo: 'info',
            duracao: 4000
        },
        'produto': {
            titulo: '📦 Sobre seu Produto/Serviço',
            mensagem: 'Descreva bem os diferenciais - isso ajuda na precificação por valor percebido.',
            tipo: 'info',
            duracao: 4000
        },
        'publico': {
            titulo: '👥 Público-Alvo',
            mensagem: 'Conhecer seu cliente é essencial para definir preços. Considere o poder de compra real.',
            tipo: 'info',
            duracao: 4000
        },
        'expectativas': {
            titulo: '🎯 Expectativas Realistas',
            mensagem: 'Baseie suas projeções em dados reais. Se for iniciante, comece conservador.',
            tipo: 'warning',
            duracao: 5000
        },
        'transicao_custos': {
            titulo: '💰 Próximo: Custos',
            mensagem: 'Agora vamos mapear todos os seus gastos. Não esqueça nenhum custo, mesmo os pequenos!',
            tipo: 'info',
            duracao: 4500
        }
    };
    
    const dica = dicas[contexto];
    if (!dica) return;
    
    // Criar ou atualizar elemento de dica
    let dicaElement = document.getElementById('dicaContextual');
    if (!dicaElement) {
        dicaElement = document.createElement('div');
        dicaElement.id = 'dicaContextual';
        dicaElement.className = 'fixed bottom-4 right-4 max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-l-4 z-50 hidden';
        document.body.appendChild(dicaElement);
    }
    
    dicaElement.className = `fixed bottom-4 right-4 max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-l-4 z-50 transform transition-transform duration-300 ${
        dica.tipo === 'warning' ? 'border-yellow-500' : 
        dica.tipo === 'error' ? 'border-red-500' : 'border-blue-500'
    }`;
    
    dicaElement.innerHTML = `
        <div class="p-4">
            <div class="flex justify-between items-start mb-2">
                <h4 class="font-bold text-gray-900 dark:text-white">${dica.titulo}</h4>
                <button onclick="fecharDica()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <p class="text-sm text-gray-700 dark:text-gray-300">${dica.mensagem}</p>
            <div class="mt-3 flex justify-between items-center">
                <span class="text-xs text-gray-500">Dica da Brayan Contabilidade</span>
                <button onclick="naoMostrarNovamente('${contexto}')" class="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    Não mostrar novamente
                </button>
            </div>
        </div>
    `;
    
    // Mostrar com animação
    dicaElement.classList.remove('hidden');
    dicaElement.style.transform = 'translateX(100%)';
    setTimeout(() => {
        dicaElement.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto-fechar
    if (dica.duracao > 0) {
        setTimeout(() => {
            fecharDica();
        }, dica.duracao);
    }
}

function fecharDica() {
    const dicaElement = document.getElementById('dicaContextual');
    if (dicaElement) {
        dicaElement.style.transform = 'translateX(100%)';
        setTimeout(() => {
            dicaElement.classList.add('hidden');
        }, 300);
    }
}

function naoMostrarNovamente(contexto) {
    const dicasIgnoradas = JSON.parse(localStorage.getItem('dicasIgnoradas') || '[]');
    if (!dicasIgnoradas.includes(contexto)) {
        dicasIgnoradas.push(contexto);
        localStorage.setItem('dicasIgnoradas', JSON.stringify(dicasIgnoradas));
    }
    fecharDica();
    mostrarToast('Dica ocultada. Você pode reativar nas configurações.', 'info');
}

// ==================== INICIALIZAÇÃO DE EVENTOS ====================
function inicializarEventos() {
    try {
        console.log('🔄 Configurando eventos...');
        
        // Auto-save ao mudar dados
        document.querySelectorAll('#dados input, #dados select').forEach(el => {
            el.addEventListener('change', saveProgress);
        });
        
        // Atualizar progresso em tempo real
        document.querySelectorAll('#dados input').forEach(el => {
            el.addEventListener('input', atualizarProgresso);
        });
        
        // Configurar tecla ESC para fechar modais
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                fecharModal();
                fecharDica();
            }
        });
        
        // Dark mode automático baseado no sistema
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode');
            const icon = document.getElementById('darkModeIcon');
            if (icon) icon.className = 'fas fa-sun';
        }
        
        // Detectar mudança de dark mode no sistema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem('darkMode')) { // Só muda se não tiver preferência salva
                document.body.classList.toggle('dark-mode', e.matches);
                const icon = document.getElementById('darkModeIcon');
                if (icon) icon.className = e.matches ? 'fas fa-sun' : 'fas fa-moon';
            }
        });
        
        // Inicializar tooltips dinâmicos
        inicializarTooltipsDinamicos();
        
        console.log('✅ Eventos configurados!');
        
    } catch (error) {
        console.error('❌ Erro ao configurar eventos:', error);
    }
}

function inicializarTooltips() {
    // Tooltips estáticos já configurados no HTML
    document.querySelectorAll('[data-tooltip]').forEach(el => {
        el.addEventListener('mouseenter', mostrarTooltip);
        el.addEventListener('mouseleave', esconderTooltip);
        el.addEventListener('focus', mostrarTooltip);
        el.addEventListener('blur', esconderTooltip);
    });
}

function inicializarTooltipsDinamicos() {
    // Tooltips para campos específicos baseados no ID
    const tooltipsDinamicos = {
        'empresaCnpj': 'CNPJ do MEI ou CPF se ainda não formalizou',
        'qtdVendaMensal': 'Estimativa realista baseada em pesquisas ou histórico',
        'taxaCrescimento': 'Crescimento mensal esperado - seja conservador no início',
        'metaFaturamento': 'Meta SMART: Específica, Mensurável, Atingível, Relevante, Temporal'
    };
    
    Object.entries(tooltipsDinamicos).forEach(([id, texto]) => {
        const elemento = document.getElementById(id);
        if (elemento && !elemento.hasAttribute('data-tooltip')) {
            elemento.setAttribute('data-tooltip', texto);
            elemento.addEventListener('mouseenter', mostrarTooltip);
            elemento.addEventListener('mouseleave', esconderTooltip);
            elemento.addEventListener('focus', mostrarTooltip);
            elemento.addEventListener('blur', esconderTooltip);
        }
    });
}

// ==================== FUNÇÕES DE UTILIDADE (INICIAIS) ====================
function atualizarProgresso() {
    const progresso = calcularProgresso();
    atualizarElementoTexto('progressoDados', `${progresso}%`);
    
    const progressoBar = document.getElementById('progressoBar');
    const progressoDadosBar = document.getElementById('progressoDadosBar');
    
    if (progressoBar) {
        progressoBar.style.width = `${progresso}%`;
        progressoBar.setAttribute('aria-valuenow', progresso);
    }
    if (progressoDadosBar) {
        progressoDadosBar.style.width = `${progresso}%`;
    }
}

function calcularProgresso() {
    let progresso = 0;
    
    // Dados básicos (máximo 50 pontos)
    if (document.getElementById('empresaNome')?.value) progresso += 10;
    if (document.getElementById('setorEmpresa')?.value) progresso += 10;
    if (document.getElementById('nomeProduto')?.value) progresso += 10;
    if (document.getElementById('publicoAlvo')?.value) progresso += 10;
    if (parseFloat(document.getElementById('qtdVendaMensal')?.value) > 0) progresso += 10;
    
    return Math.min(progresso, 100);
}

function atualizarElementoTexto(id, texto) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = texto;
        // Adicionar animação sutil
        elemento.classList.add('text-update');
        setTimeout(() => elemento.classList.remove('text-update'), 300);
    }
}

function mostrarToast(mensagem, tipo) {
    const toast = document.getElementById('toast');
    if (!toast) {
        const toastDiv = document.createElement('div');
        toastDiv.id = 'toast';
        document.body.appendChild(toastDiv);
        return mostrarToast(mensagem, tipo);
    }
    
    // Configurar cores baseadas no tipo
    const cores = {
        'success': 'bg-green-600',
        'error': 'bg-red-600',
        'warning': 'bg-yellow-600',
        'info': 'bg-blue-600'
    };
    
    toast.textContent = mensagem;
    toast.className = `toast ${cores[tipo] || 'bg-blue-600'} fixed top-4 right-4 px-4 py-3 rounded-lg text-white shadow-lg z-50`;
    toast.style.display = 'block';
    
    // Animar entrada
    toast.style.animation = 'slideIn 0.3s ease-out';
    
    // Auto-fechar
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 300);
    }, tipo === 'error' ? 5000 : 3000);
}

function toggleDarkMode() {
    const estaDark = document.body.classList.toggle('dark-mode');
    const icon = document.getElementById('darkModeIcon');
    if (icon) icon.className = estaDark ? 'fas fa-sun' : 'fas fa-moon';
    
    // Salvar preferência
    localStorage.setItem('darkMode', estaDark ? 'enabled' : 'disabled');
    
    // Disparar evento para gráficos
    document.dispatchEvent(new CustomEvent('darkModeChanged'));
    
    mostrarToast(`Modo ${estaDark ? 'escuro' : 'claro'} ativado`, 'info');
}

// ==================== CARREGAMENTO DE DADOS ====================
function carregarDadosSalvos() {
    try {
        console.log('📂 Carregando dados salvos...');
        
        // Carregar modo dark
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            const icon = document.getElementById('darkModeIcon');
            if (icon) icon.className = 'fas fa-sun';
        }
        
        // Carregar dados do negócio
        const dados = localStorage.getItem('dadosNegocio');
        if (dados) {
            dadosNegocio = JSON.parse(dados);
            preencherCamposComDados();
            console.log('✅ Dados carregados do localStorage');
        } else {
            console.log('ℹ️ Nenhum dado salvo encontrado');
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        // Limpar dados corrompidos
        localStorage.removeItem('dadosNegocio');
        mostrarToast('Dados anteriores corrompidos. Iniciando novo cálculo.', 'warning');
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
    if (dadosNegocio.empresa.cnpj) {
        document.getElementById('empresaCnpj').value = dadosNegocio.empresa.cnpj;
    }
    if (dadosNegocio.empresa.tempoMercado) {
        document.getElementById('tempoMercado').value = dadosNegocio.empresa.tempoMercado;
    }
    
    // Produto
    if (dadosNegocio.produto.nome) {
        document.getElementById('nomeProduto').value = dadosNegocio.produto.nome;
    }
    if (dadosNegocio.produto.categoria) {
        document.getElementById('categoriaProduto').value = dadosNegocio.produto.categoria;
    }
    if (dadosNegocio.produto.descricao) {
        document.getElementById('descricaoProduto').value = dadosNegocio.produto.descricao;
    }
    if (dadosNegocio.produto.unidade) {
        document.getElementById('unidadeMedida').value = dadosNegocio.produto.unidade;
    }
    
    // Público-alvo
    if (dadosNegocio.produto.publicoAlvo) {
        document.getElementById('publicoAlvo').value = dadosNegocio.produto.publicoAlvo;
    }
    
    // Expectativas
    if (dadosNegocio.meta.qtdMensal) {
        document.getElementById('qtdVendaMensal').value = dadosNegocio.meta.qtdMensal;
    }
    
    console.log('✅ Campos preenchidos com dados salvos');
}

function saveProgress() {
    try {
        console.log('💾 Salvando progresso...');
        
        // Empresa
        dadosNegocio.empresa = {
            nome: document.getElementById('empresaNome')?.value || '',
            cnpj: document.getElementById('empresaCnpj')?.value || '',
            setor: document.getElementById('setorEmpresa')?.value || '',
            tempoMercado: document.getElementById('tempoMercado')?.value || ''
        };
        
        // Produto
        dadosNegocio.produto = {
            nome: document.getElementById('nomeProduto')?.value || '',
            categoria: document.getElementById('categoriaProduto')?.value || '',
            descricao: document.getElementById('descricaoProduto')?.value || '',
            unidade: document.getElementById('unidadeMedida')?.value || '',
            publicoAlvo: document.getElementById('publicoAlvo')?.value || ''
        };
        
        // Meta
        dadosNegocio.meta = {
            qtdMensal: parseFloat(document.getElementById('qtdVendaMensal')?.value) || 0,
            taxaCrescimento: parseFloat(document.getElementById('taxaCrescimento')?.value) || 0,
            faturamento: parseFloat(document.getElementById('metaFaturamento')?.value) || 0
        };
        
        // Atualizar timestamp
        dadosNegocio.timestamp = new Date().toISOString();
        
        // Salvar no localStorage
        localStorage.setItem('dadosNegocio', JSON.stringify(dadosNegocio));
        
        // Atualizar UI de salvamento
        const saveBtn = document.querySelector('button[onclick="saveProgress()"]');
        if (saveBtn) {
            const originalHTML = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Salvo!';
            saveBtn.classList.add('bg-green-600');
            
            setTimeout(() => {
                saveBtn.innerHTML = originalHTML;
                saveBtn.classList.remove('bg-green-600');
            }, 1500);
        }
        
        console.log('✅ Progresso salvo com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao salvar progresso:', error);
        mostrarToast('Erro ao salvar. Tente novamente.', 'error');
    }
}

function salvarRascunho() {
    saveProgress();
    mostrarToast('Rascunho salvo com sucesso!', 'success');
}

// ==================== TOOLTIPS DINÂMICOS ====================
function mostrarTooltip(event) {
    const tooltipText = event.target.getAttribute('data-tooltip');
    if (!tooltipText) return;
    
    // Remover tooltip anterior
    const tooltipAnterior = document.querySelector('.tooltip-ativo');
    if (tooltipAnterior) tooltipAnterior.remove();
    
    // Criar tooltip
    const tooltipEl = document.createElement('div');
    tooltipEl.className = 'tooltip-ativo fixed bg-gray-900 text-white px-3 py-2 rounded-lg text-sm max-w-xs z-50 shadow-lg';
    tooltipEl.textContent = tooltipText;
    
    // Posicionar
    const rect = event.target.getBoundingClientRect();
    tooltipEl.style.left = `${rect.left + rect.width / 2}px`;
    tooltipEl.style.top = `${rect.top - 40}px`;
    tooltipEl.style.transform = 'translateX(-50%)';
    
    document.body.appendChild(tooltipEl);
    event.target._tooltip = tooltipEl;
}

function esconderTooltip(event) {
    const tooltip = event.target._tooltip;
    if (tooltip && tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
        event.target._tooltip = null;
    }
}

// ==================== MODAIS ====================
function abrirModalGrafico(tipo) {
    const modal = document.getElementById('modalGrafico');
    const modalTitulo = document.getElementById('modalTitulo');
    
    if (!modal || !modalTitulo) return;
    
    modal.style.display = 'flex';
    modalTitulo.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1).replace('-', ' ');
    
    // Configurar foco para acessibilidade
    setTimeout(() => {
        modal.querySelector('button')?.focus();
    }, 100);
}

function fecharModal() {
    const modal = document.getElementById('modalGrafico');
    if (modal) modal.style.display = 'none';
    
    // Destruir gráfico do modal se existir
    if (window.modalChart) {
        window.modalChart.destroy();
        window.modalChart = null;
    }
}

// ==================== EXPORTAÇÃO INICIAL ====================
function gerarRelatorioCompleto() {
    if (!dadosNegocio.empresa.nome) {
        mostrarToast('Preencha os dados básicos primeiro!', 'warning');
        return;
    }
    
    try {
        const data = new Date().toLocaleDateString('pt-BR');
        const hora = new Date().toLocaleTimeString('pt-BR');
        
        let relatorio = `
RELATÓRIO DE PRECIFICAÇÃO - BRAYAN CONTABILIDADE
===============================================
Data: ${data} | Hora: ${hora}
Versão: 2.0 | Cliente: ${dadosNegocio.empresa.nome}

DADOS DA EMPRESA
----------------
• Nome: ${dadosNegocio.empresa.nome}
• Setor: ${dadosNegocio.empresa.setor}
• Tempo de mercado: ${dadosNegocio.empresa.tempoMercado || 'Não informado'}

PRODUTO/SERVIÇO
---------------
• Nome: ${dadosNegocio.produto.nome}
• Categoria: ${dadosNegocio.produto.categoria}
• Unidade: ${dadosNegocio.produto.unidade}

METAS E EXPECTATIVAS
--------------------
• Quantidade mensal: ${dadosNegocio.meta.qtdMensal}
• Taxa de crescimento: ${dadosNegocio.meta.taxaCrescimento}%
• Faturamento desejado: ${formatarMoeda(dadosNegocio.meta.faturamento)}

OBSERVAÇÕES:
-----------
Este é um relatório preliminar. Consulte um contador da 
Brayan Contabilidade para análise personalizada e detalhada.

CONTATO:
--------
📱 (21) 99157-7383
📧 contato@brayancontabilidade.com
🌐 www.brayancontabilidade.com

© ${new Date().getFullYear()} Brayan Contabilidade - Todos os direitos reservados.
        `;
        
        // Baixar arquivo
        const blob = new Blob([relatorio], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-precificacao-${dadosNegocio.empresa.nome.replace(/\s+/g, '-').toLowerCase()}-${data.replace(/\//g, '-')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        mostrarToast('Relatório gerado com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        mostrarToast('Erro ao gerar relatório', 'error');
    }
}

// ==================== FUNÇÃO AUXILIAR DE FORMATAÇÃO ====================
function formatarMoeda(valor) {
    if (isNaN(valor) || valor === null || valor === undefined) {
        return 'R$ 0,00';
    }
    
    return 'R$ ' + parseFloat(valor).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// ==================== EXPOSIÇÃO DE FUNÇÕES GLOBAIS ====================
window.openTab = openTab;
window.toggleDarkMode = toggleDarkMode;
window.saveProgress = saveProgress;
window.salvarRascunho = salvarRascunho;
window.mostrarPassoDados = mostrarPassoDados;
window.avancarPassoDados = avancarPassoDados;
window.voltarPassoDados = voltarPassoDados;
window.abrirModalGrafico = abrirModalGrafico;
window.fecharModal = fecharModal;
window.gerarRelatorioCompleto = gerarRelatorioCompleto;
window.formatarMoeda = formatarMoeda;

console.log('✅ Parte 1/6 carregada: Inicialização, Navegação e Dados Básicos');
// ==================== FUNÇÕES DA TAB CUSTOS ====================

function calcularCustos() {
    try {
        console.log('🧮 Calculando custos...');
        
        // Coletar valores dos inputs com validação
        const valores = coletarValoresCustos();
        
        // Validar valores básicos
        if (valores.qtdMensal <= 0) {
            mostrarToast('Quantidade mensal deve ser maior que zero!', 'warning');
            return;
        }
        
        // Calcular custos variáveis unitários
        const custoVariavelUnitario = valores.materiaPrima + valores.embalagem + valores.frete;
        
        // Calcular custos fixos mensais
        const custoFixoMensal = calcularCustosFixos(valores);
        
        // Calcular custos fixos unitários
        const custoFixoUnitario = valores.qtdMensal > 0 ? custoFixoMensal / valores.qtdMensal : 0;
        
        // Calcular custos totais
        const custoTotalUnitario = custoVariavelUnitario + custoFixoUnitario;
        const custoTotalMensal = custoTotalUnitario * valores.qtdMensal;
        
        // Calcular percentuais sobre venda
        const percentuaisVenda = (valores.comissoesPercent + valores.impostosVenda + valores.taxasPlataforma) / 100;
        
        // Sugerir markup baseado no setor
        const markupSugerido = calcularMarkupSugerido(valores.setor);
        
        // Armazenar dados nos objetos globais
        dadosNegocio.custos = {
            variavelUnitario: custoVariavelUnitario,
            fixoMensal: custoFixoMensal,
            fixoUnitario: custoFixoUnitario,
            totalUnitario: custoTotalUnitario,
            totalMensal: custoTotalMensal,
            percentuaisVenda: percentuaisVenda,
            markupSugerido: markupSugerido,
            qtdMensal: valores.qtdMensal,
            detalhes: {
                materiaPrima: valores.materiaPrima,
                embalagem: valores.embalagem,
                frete: valores.frete,
                aluguel: valores.aluguel,
                salarios: valores.salarios,
                marketing: valores.marketing,
                software: valores.softwareTotal
            }
        };
        
        // Atualizar interface
        atualizarResumoCustos(custoTotalUnitario, custoFixoMensal, custoTotalMensal, markupSugerido);
        
        // Atualizar precificação automática
        atualizarPrecificacao();
        
        // Atualizar gráficos
        if (window.gerenciadorGraficos) {
            const precoAtual = parseFloat(document.getElementById('precoVendaFinal')?.value) || 0;
            window.gerenciadorGraficos.atualizarGraficoDistribuicaoPreco(dadosNegocio.custos, precoAtual);
        }
        
        // Analisar saúde dos custos
        analisarSaudeCustos(custoFixoMensal, custoTotalMensal, valores.qtdMensal);
        
        console.log('✅ Custos calculados com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao calcular custos:', error);
        mostrarToast('Erro ao calcular custos. Verifique os valores.', 'error');
    }
}

function coletarValoresCustos() {
    // Custos variáveis por unidade
    const materiaPrima = parseFloat(document.getElementById('materiaPrima')?.value) || 0;
    const embalagem = parseFloat(document.getElementById('embalagem')?.value) || 0;
    const frete = parseFloat(document.getElementById('frete')?.value) || 0;
    
    // Percentuais sobre venda
    const comissoesPercent = parseFloat(document.getElementById('comissoesPercent')?.value) || 0;
    const impostosVenda = parseFloat(document.getElementById('impostosVenda')?.value) || 0;
    const taxasPlataforma = parseFloat(document.getElementById('taxasPlataforma')?.value) || 0;
    
    // Custos fixos mensais
    const aluguel = parseFloat(document.getElementById('aluguel')?.value) || 0;
    const salarios = parseFloat(document.getElementById('salarios')?.value) || 0;
    const contas = parseFloat(document.getElementById('contas')?.value) || 0;
    const marketing = parseFloat(document.getElementById('marketing')?.value) || 0;
    const das = parseFloat(document.getElementById('das')?.value) || 70.90; // Valor fixo MEI 2024
    const manutencao = parseFloat(document.getElementById('manutencao')?.value) || 0;
    const outrosFixos = parseFloat(document.getElementById('outrosFixos')?.value) || 0;
    
    // Software e serviços
    const softwareGestao = parseFloat(document.getElementById('softwareGestao')?.value) || 0;
    const softwareDesign = parseFloat(document.getElementById('softwareDesign')?.value) || 0;
    const softwareMarketing = parseFloat(document.getElementById('softwareMarketing')?.value) || 0;
    const softwareOutros = parseFloat(document.getElementById('softwareOutros')?.value) || 0;
    const softwareTotal = softwareGestao + softwareDesign + softwareMarketing + softwareOutros;
    
    // Quantidade mensal
    const qtdMensal = parseFloat(document.getElementById('qtdVendaMensal')?.value) || 100;
    
    // Setor para sugestões
    const setor = document.getElementById('setorEmpresa')?.value || '';
    
    return {
        materiaPrima, embalagem, frete,
        comissoesPercent, impostosVenda, taxasPlataforma,
        aluguel, salarios, contas, marketing, das, manutencao, outrosFixos,
        softwareGestao, softwareDesign, softwareMarketing, softwareOutros, softwareTotal,
        qtdMensal, setor
    };
}

function calcularCustosFixos(valores) {
    return valores.aluguel + valores.salarios + valores.contas + 
           valores.marketing + valores.das + valores.manutencao + 
           valores.outrosFixos + valores.softwareTotal;
}

function calcularMarkupSugerido(setor) {
    const markupsSetor = {
        'alimentacao': { min: 60, ideal: 80, max: 120 },
        'moda': { min: 70, ideal: 100, max: 150 },
        'artesanato': { min: 100, ideal: 150, max: 200 },
        'servicos': { min: 80, ideal: 120, max: 180 },
        'tecnologia': { min: 100, ideal: 200, max: 300 },
        'beleza': { min: 80, ideal: 120, max: 180 },
        'consultoria': { min: 150, ideal: 250, max: 400 },
        'educacao': { min: 80, ideal: 120, max: 180 },
        'saude': { min: 70, ideal: 100, max: 150 },
        'construcao': { min: 60, ideal: 90, max: 130 }
    };
    
    return markupsSetor[setor]?.ideal || 100;
}

function atualizarResumoCustos(custoUnitario, custoFixoMensal, custoTotalMensal, markupSugerido) {
    // Atualizar valores na interface
    atualizarElementoTexto('resumoCustoUnitario', formatarMoeda(custoUnitario));
    atualizarElementoTexto('resumoCustoFixo', formatarMoeda(custoFixoMensal));
    atualizarElementoTexto('resumoCustoTotal', formatarMoeda(custoTotalMensal));
    atualizarElementoTexto('resumoMarkupSugerido', `${markupSugerido}%`);
    
    // Adicionar análise de proporção
    const proporcaoFixos = custoTotalMensal > 0 ? (custoFixoMensal / custoTotalMensal * 100).toFixed(1) : 0;
    const analiseProporcao = document.getElementById('analiseProporcaoCustos');
    if (analiseProporcao) {
        analiseProporcao.textContent = `Custos fixos representam ${proporcaoFixos}% do total`;
        
        // Colorir baseado na proporção
        if (proporcaoFixos > 50) {
            analiseProporcao.className = 'text-red-600 dark:text-red-400 text-sm font-medium';
        } else if (proporcaoFixos > 30) {
            analiseProporcao.className = 'text-yellow-600 dark:text-yellow-400 text-sm font-medium';
        } else {
            analiseProporcao.className = 'text-green-600 dark:text-green-400 text-sm font-medium';
        }
    }
}

function analisarSaudeCustos(custoFixoMensal, custoTotalMensal, qtdMensal) {
    // Calcular métricas de saúde
    const proporcaoFixos = custoTotalMensal > 0 ? (custoFixoMensal / custoTotalMensal * 100) : 0;
    const custoUnitario = qtdMensal > 0 ? custoTotalMensal / qtdMensal : 0;
    
    let alertas = [];
    let dicas = [];
    
    // Análise de proporção de custos fixos
    if (proporcaoFixos > 60) {
        alertas.push('⚠️ CUSTOS FIXOS MUITO ALTOS');
        dicas.push('Considere renegociar aluguel, reduzir salários ou aumentar produção.');
    } else if (proporcaoFixos > 40) {
        alertas.push('📊 CUSTOS FIXOS ELEVADOS');
        dicas.push('Busque eficiência operacional para reduzir custos fixos.');
    }
    
    // Análise de DAS proporcional
    const das = parseFloat(document.getElementById('das')?.value) || 70.90;
    const proporcaoDas = custoTotalMensal > 0 ? (das / custoTotalMensal * 100) : 0;
    
    if (proporcaoDas < 5) {
        dicas.push('✅ DAS proporcional está saudável.');
    } else {
        dicas.push('📝 DAS representa uma parcela significativa. Mantenha em dia!');
    }
    
    // Análise de custo unitário
    const precoMedioSetor = obterPrecoMedioSetor(dadosNegocio.empresa.setor);
    if (precoMedioSetor > 0 && custoUnitario > precoMedioSetor * 0.7) {
        alertas.push('💰 CUSTO UNITÁRIO ALTO');
        dicas.push('Seu custo por unidade está elevado. Busque fornecedores alternativos.');
    }
    
    // Exibir alertas se houver
    const containerAlertas = document.getElementById('alertasCustos');
    if (containerAlertas) {
        if (alertas.length > 0) {
            containerAlertas.innerHTML = alertas.map(alerta => 
                `<div class="p-3 mb-2 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded">
                    <div class="font-medium">${alerta}</div>
                    <div class="text-sm mt-1">${dicas.join(' ')}</div>
                </div>`
            ).join('');
            containerAlertas.classList.remove('hidden');
        } else {
            containerAlertas.innerHTML = `
                <div class="p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded">
                    <div class="font-medium">✅ CUSTOS SAUDÁVEIS</div>
                    <div class="text-sm mt-1">Sua estrutura de custos está bem equilibrada. ${dicas.join(' ')}</div>
                </div>
            `;
            containerAlertas.classList.remove('hidden');
        }
    }
    
    // Mostrar dica contextual se houver alertas
    if (alertas.length > 0) {
        mostrarDicaContextual('custos_alerta');
    }
}

function obterPrecoMedioSetor(setor) {
    const precosMedios = {
        'alimentacao': 25.00,
        'moda': 89.90,
        'artesanato': 65.00,
        'servicos': 150.00,
        'tecnologia': 299.90,
        'beleza': 85.00,
        'consultoria': 500.00,
        'educacao': 120.00,
        'saude': 180.00,
        'construcao': 350.00
    };
    
    return precosMedios[setor] || 0;
}

function sugerirCustosPorSetor() {
    const setor = document.getElementById('setorEmpresa')?.value;
    
    if (!setor) {
        mostrarToast('Selecione um setor primeiro!', 'warning');
        return;
    }
    
    const templates = {
        'alimentacao': {
            materiaPrima: 8.50, embalagem: 1.20, frete: 5.00,
            aluguel: 1500.00, salarios: 2000.00, marketing: 300.00,
            comissoesPercent: 5, impostosVenda: 7, taxasPlataforma: 10,
            contas: 400, softwareGestao: 49, qtdVendaMensal: 300
        },
        'moda': {
            materiaPrima: 25.00, embalagem: 2.50, frete: 8.00,
            aluguel: 800.00, salarios: 1800.00, marketing: 400.00,
            comissoesPercent: 8, impostosVenda: 6, taxasPlataforma: 12,
            contas: 250, softwareGestao: 79, qtdVendaMensal: 120
        },
        'artesanato': {
            materiaPrima: 12.00, embalagem: 3.00, frete: 10.00,
            aluguel: 500.00, salarios: 1500.00, marketing: 200.00,
            comissoesPercent: 10, impostosVenda: 5, taxasPlataforma: 15,
            contas: 200, softwareDesign: 29, qtdVendaMensal: 80
        },
        'servicos': {
            materiaPrima: 5.00, embalagem: 0.50, frete: 0.00,
            aluguel: 600.00, salarios: 2500.00, marketing: 500.00,
            comissoesPercent: 0, impostosVenda: 8, taxasPlataforma: 5,
            contas: 350, softwareGestao: 99, qtdVendaMensal: 50
        }
    };
    
    const template = templates[setor];
    if (!template) {
        mostrarToast('Setor não encontrado na base de templates', 'warning');
        return;
    }
    
    // Aplicar template aos campos
    Object.keys(template).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.value = template[key];
        }
    });
    
    // Calcular automaticamente
    calcularCustos();
    
    // Mostrar dicas específicas do setor
    mostrarDicasSetor(setor);
    
    mostrarToast(`Custos do setor ${setor} aplicados!`, 'success');
}

function mostrarDicasSetor(setor) {
    const dicasSetor = {
        'alimentacao': {
            titulo: '🍕 Dicas para Alimentação',
            mensagem: 'Controle rigoroso de perdas, estoque rotativo e atenção à validade. Margem sugerida: 60-120%',
            acoes: [
                'Negocie com fornecedores para compras em quantidade',
                'Use embalagens que preservem a qualidade',
                'Ofereça combos para aumentar ticket médio'
            ]
        },
        'moda': {
            titulo: '👗 Dicas para Moda',
            mensagem: 'Coleções sazonais, planejamento de compras com antecedência. Margem sugerida: 70-150%',
            acoes: [
                'Compre tecidos fora de temporada para economizar',
                'Faça coleções cápsula para reduzir estoque parado',
                'Invista em fotografia profissional para e-commerce'
            ]
        },
        'servicos': {
            titulo: '🔧 Dicas para Serviços',
            mensagem: 'Valorize seu tempo, crie pacotes de serviços. Margem sugerida: 80-180%',
            acoes: [
                'Ofereça manutenção preventiva como serviço recorrente',
                'Crie pacotes anuais com desconto',
                'Documente seus processos para escalar'
            ]
        }
    };
    
    const dica = dicasSetor[setor];
    if (dica) {
        // Criar modal com dicas
        const modalDicas = document.getElementById('modalDicasSetor');
        if (modalDicas) {
            modalDicas.querySelector('#tituloDicasSetor').textContent = dica.titulo;
            modalDicas.querySelector('#mensagemDicasSetor').textContent = dica.mensagem;
            
            const listaAcoes = modalDicas.querySelector('#listaAcoesSetor');
            listaAcoes.innerHTML = dica.acoes.map(acao => 
                `<li class="flex items-start mb-2">
                    <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                    <span>${acao}</span>
                </li>`
            ).join('');
            
            modalDicas.classList.remove('hidden');
        }
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
    
    // Atualizar interface
    const metodoSelecionadoElement = document.getElementById('metodoSelecionado');
    if (metodoSelecionadoElement) {
        const nomesMetodos = {
            'markup': 'Markup',
            'valor-percebido': 'Valor Percebido',
            'concorrencia': 'Concorrência',
            'custo-meta': 'Custo-Meta',
            'dinamica': 'Dinâmica'
        };
        metodoSelecionadoElement.textContent = `${nomesMetodos[metodo]} (Recomendado)`;
    }
    
    // Mostrar configuração específica do método
    document.querySelectorAll('.metodo-config').forEach(div => {
        div.style.display = 'none';
    });
    
    const configMetodo = document.getElementById(`configMetodo${metodo.charAt(0).toUpperCase() + metodo.slice(1)}`);
    if (configMetodo) configMetodo.style.display = 'block';
    
    // Explicar o método selecionado
    explicarMetodoPrecificacao(metodo);
    
    // Atualizar precificação
    atualizarPrecificacao();
}

function explicarMetodoPrecificacao(metodo) {
    const explicacoes = {
        'markup': {
            titulo: '📊 Método Markup',
            descricao: 'Adiciona uma porcentagem fixa sobre o custo total. Simples e direto, ideal para iniciantes.',
            formula: 'Preço = Custo Total × (1 + Markup%)',
            quandoUsar: 'Produtos com custos bem definidos, mercados estáveis',
            vantagens: 'Simplicidade, garantia de margem',
            desvantagens: 'Ignora concorrência e valor percebido'
        },
        'valor-percebido': {
            titulo: '💎 Método Valor Percebido',
            descricao: 'Baseado no valor que o cliente percebe no seu produto/serviço.',
            formula: 'Preço = Custo + Valor Percebido pelo Cliente',
            quandoUsar: 'Produtos diferenciados, serviços especializados',
            vantagens: 'Maximiza lucro, alinha com expectativas',
            desvantagens: 'Subjetivo, requer pesquisa'
        },
        'concorrencia': {
            titulo: '🏆 Método Concorrência',
            descricao: 'Baseia-se nos preços praticados pela concorrência.',
            formula: 'Preço = Média dos preços da concorrência ± Diferencial',
            quandoUsar: 'Mercados competitivos, produtos similares',
            vantagens: 'Competitividade, facilidade de entrada',
            desvantagens: 'Corrida para o fundo, ignora custos'
        }
    };
    
    const explicacao = explicacoes[metodo];
    if (!explicacao) return;
    
    const container = document.getElementById('explicacaoMetodo');
    if (container) {
        container.innerHTML = `
            <div class="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                <h4 class="font-bold text-blue-900 dark:text-blue-300 mb-2">${explicacao.titulo}</h4>
                <p class="text-sm text-blue-800 dark:text-blue-400 mb-3">${explicacao.descricao}</p>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                        <div class="font-medium text-gray-700 dark:text-gray-300">📝 Fórmula</div>
                        <div class="text-xs text-gray-600 dark:text-gray-400">${explicacao.formula}</div>
                    </div>
                    <div>
                        <div class="font-medium text-gray-700 dark:text-gray-300">🎯 Quando usar</div>
                        <div class="text-xs text-gray-600 dark:text-gray-400">${explicacao.quandoUsar}</div>
                    </div>
                    <div>
                        <div class="font-medium text-gray-700 dark:text-gray-300">⚖️ Vantagens</div>
                        <div class="text-xs text-gray-600 dark:text-gray-400">${explicacao.vantagens}</div>
                    </div>
                </div>
            </div>
        `;
        container.classList.remove('hidden');
    }
}

function atualizarMarkup(valor) {
    const markupValor = parseFloat(valor) || 100;
    
    // Validações
    if (markupValor < 0) {
        mostrarToast('Markup não pode ser negativo!', 'warning');
        return;
    }
    
    if (markupValor > 1000) {
        mostrarToast('Markup muito alto! Considere revisar seus custos.', 'warning');
    }
    
    // Atualizar controles de interface
    const markupSlider = document.getElementById('markupSlider');
    const markupInput = document.getElementById('markupInput');
    
    if (markupSlider) markupSlider.value = markupValor;
    if (markupInput) markupInput.value = markupValor;
    
    // Calcular preços sugeridos
    const custoUnitario = dadosNegocio.custos.totalUnitario || 0;
    
    // Preços com diferentes markups (baseados no setor)
    const faixasPreco = calcularFaixasPreco(custoUnitario);
    
    atualizarElementoTexto('precoMarkupMin', formatarMoeda(faixasPreco.min));
    atualizarElementoTexto('precoMarkupMedio', formatarMoeda(faixasPreco.medio));
    atualizarElementoTexto('precoMarkupMax', formatarMoeda(faixasPreco.max));
    
    // Preço atual com markup selecionado
    const precoAtual = custoUnitario * (1 + markupValor/100);
    atualizarElementoTexto('precoMarkupAtual', formatarMoeda(precoAtual));
    
    // Atualizar preço final sugerido
    const precoFinalSugerido = document.getElementById('precoFinalSugerido');
    const precoVendaFinal = document.getElementById('precoVendaFinal');
    
    if (precoFinalSugerido) {
        precoFinalSugerido.textContent = formatarMoeda(precoAtual);
        
        // Mostrar classificação do preço
        const classificacao = classificarPreco(precoAtual, faixasPreco);
        precoFinalSugerido.className = `text-2xl font-bold ${classificacao.cor}`;
        
        // Adicionar tooltip com explicação
        precoFinalSugerido.setAttribute('data-tooltip', classificacao.mensagem);
    }
    
    if (precoVendaFinal) {
        precoVendaFinal.value = precoAtual.toFixed(2);
        atualizarPrecoFinal(precoAtual);
    }
    
    // Atualizar composição detalhada
    atualizarComposicaoPrecoDetalhada(precoAtual);
    
    // Calcular impacto
    calcularImpactoPreco(precoAtual);
}

function calcularFaixasPreco(custoUnitario) {
    const setor = dadosNegocio.empresa.setor;
    
    // Multiplicadores baseados no setor
    const multiplicadoresSetor = {
        'alimentacao': { min: 1.5, medio: 2.0, max: 2.5 },
        'moda': { min: 1.8, medio: 2.2, max: 3.0 },
        'artesanato': { min: 2.0, medio: 2.5, max: 3.5 },
        'servicos': { min: 1.6, medio: 2.1, max: 2.8 },
        'tecnologia': { min: 2.5, medio: 3.0, max: 4.0 },
        'beleza': { min: 1.7, medio: 2.3, max: 3.0 },
        'consultoria': { min: 3.0, medio: 4.0, max: 6.0 },
        'educacao': { min: 1.8, medio: 2.4, max: 3.2 },
        'saude': { min: 1.6, medio: 2.0, max: 2.7 },
        'construcao': { min: 1.4, medio: 1.8, max: 2.3 }
    };
    
    const multiplicadores = multiplicadoresSetor[setor] || { min: 1.6, medio: 2.0, max: 2.5 };
    
    return {
        min: custoUnitario * multiplicadores.min,
        medio: custoUnitario * multiplicadores.medio,
        max: custoUnitario * multiplicadores.max
    };
}

function classificarPreco(preco, faixasPreco) {
    if (preco < faixasPreco.min) {
        return {
            classificacao: 'Muito Baixo',
            cor: 'text-red-600 dark:text-red-400',
            mensagem: 'Preço abaixo do recomendado para o setor. Risco de prejuízo.'
        };
    } else if (preco < faixasPreco.medio) {
        return {
            classificacao: 'Competitivo',
            cor: 'text-yellow-600 dark:text-yellow-400',
            mensagem: 'Preço agressivo. Boa para entrada no mercado.'
        };
    } else if (preco <= faixasPreco.max) {
        return {
            classificacao: 'Ideal',
            cor: 'text-green-600 dark:text-green-400',
            mensagem: 'Preço dentro da faixa ideal. Equilíbrio entre lucro e competitividade.'
        };
    } else {
        return {
            classificacao: 'Premium',
            cor: 'text-purple-600 dark:text-purple-400',
            mensagem: 'Preço premium. Requer diferenciação clara e valor percebido alto.'
        };
    }
}

function atualizarComposicaoPrecoDetalhada(preco) {
    const custos = dadosNegocio.custos;
    
    if (!custos.totalUnitario || preco <= 0) return;
    
    // Cálculos detalhados
    const custoVarUnit = custos.variavelUnitario || 0;
    const custoFixoUnit = custos.fixoUnitario || 0;
    const custoTotalUnit = custos.totalUnitario || 0;
    
    // Impostos e taxas (estimados detalhados)
    const impostos = preco * 0.07; // 7% estimado
    const taxasPlataforma = preco * 0.12; // 12% estimado para marketplaces
    const comissoes = preco * 0.05; // 5% estimado
    
    // Lucro
    const lucroUnitario = preco - custoTotalUnit - impostos - taxasPlataforma - comissoes;
    const markup = ((preco - custoTotalUnit) / custoTotalUnit) * 100;
    const margemLucro = (lucroUnitario / preco) * 100;
    
    // Atualizar elementos
    atualizarElementoTexto('compCustoVarUnit', formatarMoeda(custoVarUnit));
    atualizarElementoTexto('compCustoFixoUnit', formatarMoeda(custoFixoUnit));
    atualizarElementoTexto('compCustoTotalUnit', formatarMoeda(custoTotalUnit));
    atualizarElementoTexto('compImpostos', formatarMoeda(impostos));
    atualizarElementoTexto('compTaxasPlataforma', formatarMoeda(taxasPlataforma));
    atualizarElementoTexto('compComissoes', formatarMoeda(comissoes));
    atualizarElementoTexto('compMarkupAplicado', `${markup.toFixed(1)}%`);
    atualizarElementoTexto('compPrecoFinal', formatarMoeda(preco));
    atualizarElementoTexto('lucroPorUnidade', formatarMoeda(lucroUnitario));
    atualizarElementoTexto('margemLucroUnidade', `${margemLucro.toFixed(1)}%`);
    
    // Atualizar gráfico de composição
    atualizarGraficoComposicao(preco, custoVarUnit, custoFixoUnit, impostos, taxasPlataforma, comissoes, lucroUnitario);
}

function atualizarGraficoComposicao(preco, custoVarUnit, custoFixoUnit, impostos, taxasPlataforma, comissoes, lucro) {
    if (window.gerenciadorGraficos && window.gerenciadorGraficos.atualizarGraficoComposicao) {
        window.gerenciadorGraficos.atualizarGraficoComposicao(
            preco, custoVarUnit, custoFixoUnit, impostos, taxasPlataforma, comissoes, lucro
        );
    }
}

function aplicarPrecoPsicologico(tipo) {
    const precoAtual = parseFloat(document.getElementById('precoVendaFinal')?.value) || 0;
    let novoPreco = precoAtual;
    
    const estrategias = {
        '99': { nome: 'Final .99', descricao: 'Cria percepção de preço mais baixo' },
        '95': { nome: 'Final .95', descricao: 'Similar ao .99, menos comum' },
        '90': { nome: 'Final .90', descricao: 'Percepção de desconto' },
        'arredondado': { nome: 'Arredondado', descricao: 'Transmisse confiança e qualidade' }
    };
    
    const estrategia = estrategias[tipo];
    if (!estrategia) return;
    
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
    
    // Atualizar interface
    const precoVendaFinal = document.getElementById('precoVendaFinal');
    if (precoVendaFinal) {
        precoVendaFinal.value = novoPreco.toFixed(2);
        
        // Mostrar explicação da estratégia
        mostrarToast(`Estratégia "${estrategia.nome}" aplicada: ${estrategia.descricao}`, 'info');
        
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
    
    // Aplicar desconto
    const precoComDesconto = preco * (1 - descontoPercent/100);
    
    // Atualizar composição
    atualizarComposicaoPrecoDetalhada(precoComDesconto);
    
    // Calcular impacto
    calcularImpactoPreco(precoComDesconto);
    
    // Atualizar preços psicológicos
    atualizarPrecosPsicologicos(precoComDesconto);
    
    // Verificar se está abaixo do custo
    verificarPrecoMinimo(precoComDesconto);
}

function atualizarPrecosPsicologicos(preco) {
    atualizarElementoTexto('precoPsico99', formatarMoeda(Math.floor(preco) + 0.99));
    atualizarElementoTexto('precoPsico95', formatarMoeda(Math.floor(preco) + 0.95));
    atualizarElementoTexto('precoPsico90', formatarMoeda(Math.floor(preco) + 0.90));
    atualizarElementoTexto('precoPsicoArred', formatarMoeda(Math.round(preco)));
    
    // Adicionar análise de qual estratégia usar
    const estrategiaRecomendada = recomendarEstrategiaPsicologica(preco);
    const elementoAnalise = document.getElementById('analisePsicologica');
    if (elementoAnalise) {
        elementoAnalise.innerHTML = `
            <div class="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <div class="font-medium">💡 Estratégia recomendada: <span class="text-blue-600">${estrategiaRecomendada.nome}</span></div>
                <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">${estrategiaRecomendada.razao}</div>
            </div>
        `;
    }
}

function recomendarEstrategiaPsicologica(preco) {
    const parteDecimal = preco - Math.floor(preco);
    
    if (preco > 100) {
        return {
            nome: 'Arredondado',
            razao: 'Preços altos transmitem mais confiança quando arredondados'
        };
    } else if (parteDecimal > 0.50) {
        return {
            nome: '.99',
            razao: 'Preços terminando em .99 criam percepção de melhor custo-benefício'
        };
    } else {
        return {
            nome: '.90',
            razao: 'Terminar em .90 sugere desconto ou promoção'
        };
    }
}

function verificarPrecoMinimo(preco) {
    const custoTotal = dadosNegocio.custos.totalUnitario || 0;
    
    if (preco < custoTotal) {
        const alerta = document.getElementById('alertaPrecoMinimo');
        if (alerta) {
            const perdaPorUnidade = custoTotal - preco;
            alerta.innerHTML = `
                <div class="p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded">
                    <div class="font-bold text-red-700 dark:text-red-400">⚠️ ALERTA: PREJUÍZO POR UNIDADE</div>
                    <div class="text-sm mt-1">
                        Você está vendendo abaixo do custo!<br>
                        <strong>Perda por unidade: ${formatarMoeda(perdaPorUnidade)}</strong><br>
                        Aumente o preço ou reduza custos urgentemente.
                    </div>
                </div>
            `;
            alerta.classList.remove('hidden');
        }
    } else {
        const alerta = document.getElementById('alertaPrecoMinimo');
        if (alerta) alerta.classList.add('hidden');
    }
}

function calcularImpactoPreco(preco) {
    const custos = dadosNegocio.custos;
    const qtdMensal = custos.qtdMensal || 100;
    
    if (!custos.totalUnitario || preco <= 0) return;
    
    // Cálculos de impacto
    const lucroUnitario = preco - custos.totalUnitario;
    const lucroMensal = lucroUnitario * qtdMensal;
    const margemLucro = (lucroUnitario / preco) * 100;
    const pontoEquilibrio = lucroUnitario > 0 ? Math.ceil(custos.fixoMensal / lucroUnitario) : Infinity;
    
    // Calcular rentabilidade
    const investimentoInicial = custos.fixoMensal * 3; // Estimativa
    const roi = investimentoInicial > 0 ? (lucroMensal * 12 / investimentoInicial) * 100 : 0;
    const payback = lucroMensal > 0 ? (investimentoInicial / lucroMensal) : Infinity;
    
    // Atualizar interface
    atualizarElementoTexto('impactoMargem', `${margemLucro.toFixed(1)}%`);
    atualizarElementoTexto('impactoLucroUnit', formatarMoeda(lucroUnitario));
    atualizarElementoTexto('impactoLucroMensal', formatarMoeda(lucroMensal));
    atualizarElementoTexto('impactoPontoEquilibrio', `${pontoEquilibrio} unidades`);
    atualizarElementoTexto('impactoROI', `${roi.toFixed(1)}% ao ano`);
    atualizarElementoTexto('impactoPayback', `${payback.toFixed(1)} meses`);
    
    // Gerar recomendação
    gerarRecomendacaoPreco(margemLucro, pontoEquilibrio, qtdMensal);
}

function gerarRecomendacaoPreco(margemLucro, pontoEquilibrio, qtdMensal) {
    const recomendacaoPreco = document.getElementById('recomendacaoPreco');
    if (!recomendacaoPreco) return;
    
    let recomendacao = '';
    let cor = '';
    let acao = '';
    
    const percentualCapacidade = (pontoEquilibrio / qtdMensal) * 100;
    
    if (margemLucro < 10) {
        recomendacao = 'PREÇO MUITO BAIXO - RISCO DE PREJUÍZO';
        cor = 'text-red-600 dark:text-red-400';
        acao = 'Aumente o preço em pelo menos 15-20% imediatamente.';
    } else if (margemLucro < 20) {
        recomendacao = 'PREÇO ADEQUADO - MARGEM RAZOÁVEL';
        cor = 'text-yellow-600 dark:text-yellow-400';
        acao = 'Mantenha, mas busque eficiência para melhorar margem.';
    } else if (margemLucro < 35) {
        recomendacao = 'PREÇO IDEAL - MARGEM SAUDÁVEL';
        cor = 'text-green-600 dark:text-green-400';
        acao = 'Excelente! Continue assim e invista em crescimento.';
    } else {
        recomendacao = 'PREÇO EXCELENTE - ALTA RENTABILIDADE';
        cor = 'text-green-700 dark:text-green-500';
        acao = 'Você tem espaço para investir em marketing ou melhorias.';
    }
    
    // Adicionar análise de ponto de equilíbrio
    if (percentualCapacidade > 80) {
        recomendacao += ' | PONTO DE EQUILÍBRIO ALTO';
        acao += ' Reduza custos fixos ou aumente preço.';
    }
    
    recomendacaoPreco.innerHTML = `
        <div class="font-bold ${cor} mb-2">${recomendacao}</div>
        <div class="text-sm text-gray-700 dark:text-gray-300">
            ${acao}<br>
            <span class="text-xs text-gray-500">Ponto de equilíbrio: ${percentualCapacidade.toFixed(1)}% da capacidade</span>
        </div>
    `;
}

function atualizarPrecificacao() {
    // Verificar se temos dados de custos
    if (!dadosNegocio.custos || !dadosNegocio.custos.totalUnitario) {
        mostrarToast('Calcule os custos primeiro!', 'warning');
        return;
    }
    
    const markupSugerido = dadosNegocio.custos.markupSugerido || 100;
    
    // Atualizar controles
    const markupSlider = document.getElementById('markupSlider');
    const markupInput = document.getElementById('markupInput');
    
    if (markupSlider) markupSlider.value = markupSugerido;
    if (markupInput) markupInput.value = markupSugerido;
    
    // Atualizar markup com valor sugerido
    atualizarMarkup(markupSugerido);
    
    // Mostrar análise do markup sugerido
    const analiseMarkup = document.getElementById('analiseMarkupSugerido');
    if (analiseMarkup) {
        analiseMarkup.innerHTML = `
            <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div class="font-medium text-blue-800 dark:text-blue-300">🎯 Markup sugerido para ${dadosNegocio.empresa.setor || 'seu setor'}</div>
                <div class="text-sm text-blue-700 dark:text-blue-400 mt-1">
                    Baseado na média do setor. Ajuste conforme sua estratégia.
                </div>
            </div>
        `;
    }
}

// ==================== FUNÇÕES DE VALIDAÇÃO ====================

function validarCampoNumero(elemento, min = 0, max = 999999) {
    const valor = parseFloat(elemento.value) || 0;
    
    if (valor < min) {
        elemento.value = min;
        mostrarToast(`Valor mínimo: ${min}`, 'warning');
    } else if (valor > max) {
        elemento.value = max;
        mostrarToast(`Valor máximo: ${max}`, 'warning');
    }
    
    return parseFloat(elemento.value);
}

function validarPercentual(elemento) {
    const valor = parseFloat(elemento.value) || 0;
    
    if (valor < 0) {
        elemento.value = 0;
        mostrarToast('Percentual não pode ser negativo', 'warning');
    } else if (valor > 100) {
        elemento.value = 100;
        mostrarToast('Percentual máximo: 100%', 'warning');
    }
    
    return parseFloat(elemento.value);
}

// ==================== EXPOSIÇÃO DE FUNÇÕES ====================

window.calcularCustos = calcularCustos;
window.sugerirCustosPorSetor = sugerirCustosPorSetor;
window.selecionarMetodo = selecionarMetodo;
window.atualizarMarkup = atualizarMarkup;
window.aplicarPrecoPsicologico = aplicarPrecoPsicologico;
window.atualizarPrecoFinal = atualizarPrecoFinal;
window.atualizarPrecificacao = atualizarPrecificacao;

console.log('✅ Parte 2/6 carregada: Custos e Precificação');
// ==================== FUNÇÕES DA TAB MERCADO ====================

function analisarConcorrencia() {
    try {
        console.log('📊 Analisando concorrência...');
        
        // Coletar dados da concorrência
        const dadosConcorrencia = coletarDadosConcorrencia();
        
        // Validar dados
        if (!validarDadosConcorrencia(dadosConcorrencia)) {
            return;
        }
        
        // Calcular análise
        const analise = calcularAnaliseConcorrencia(dadosConcorrencia);
        
        // Atualizar interface com os resultados
        atualizarInterfaceConcorrencia(analise);
        
        // Atualizar gráfico de comparação
        atualizarGraficoComparacao(analise);
        
        // Gerar recomendações baseadas na análise
        gerarRecomendacoesConcorrencia(analise);
        
        // Salvar dados no objeto global
        dadosNegocio.mercado = {
            concorrencia: dadosConcorrencia,
            analise: analise,
            timestamp: new Date().toISOString()
        };
        
        console.log('✅ Análise de concorrência concluída!');
        
    } catch (error) {
        console.error('❌ Erro na análise de concorrência:', error);
        mostrarToast('Erro ao analisar concorrência', 'error');
    }
}

function coletarDadosConcorrencia() {
    const meuPreco = parseFloat(document.getElementById('precoVendaFinal')?.value) || 0;
    
    return {
        precoMin: parseFloat(document.getElementById('precoMinConcorrencia')?.value) || 0,
        precoMedio: parseFloat(document.getElementById('precoMedioConcorrencia')?.value) || 0,
        precoMax: parseFloat(document.getElementById('precoMaxConcorrencia')?.value) || 0,
        meuPreco: meuPreco,
        quantidadeConcorrentes: parseInt(document.getElementById('quantidadeConcorrentes')?.value) || 5
    };
}

function validarDadosConcorrencia(dados) {
    // Verificar se os preços foram preenchidos
    if (!dados.precoMin || !dados.precoMedio || !dados.precoMax) {
        mostrarToast('Preencha todos os preços da concorrência!', 'warning');
        return false;
    }
    
    // Verificar se os preços estão em ordem crescente
    if (dados.precoMin >= dados.precoMedio || dados.precoMedio >= dados.precoMax) {
        mostrarToast('Preços inválidos! Deve ser: Mínimo < Médio < Máximo', 'warning');
        return false;
    }
    
    // Verificar se o meu preço foi definido
    if (!dados.meuPreco || dados.meuPreco <= 0) {
        mostrarToast('Defina seu preço de venda primeiro!', 'warning');
        return false;
    }
    
    return true;
}

function calcularAnaliseConcorrencia(dados) {
    const { precoMin, precoMedio, precoMax, meuPreco } = dados;
    
    // Calcular diferença percentual em relação à média
    const diferencaMedia = ((meuPreco - precoMedio) / precoMedio) * 100;
    
    // Calcular posição relativa no espectro de preços
    const posicaoRelativa = ((meuPreco - precoMin) / (precoMax - precoMin)) * 100;
    
    // Calcular espaço para aumento (se estiver abaixo do máximo)
    const espacoAumento = precoMax > meuPreco ? ((precoMax - meuPreco) / meuPreco * 100) : 0;
    
    // Calcular vantagem competitiva
    const vantagemCompetitiva = calcularVantagemCompetitiva(diferencaMedia, posicaoRelativa);
    
    // Determinar posição no mercado
    const posicaoMercado = determinarPosicaoMercado(meuPreco, precoMin, precoMedio, precoMax);
    
    return {
        diferencaMedia: diferencaMedia,
        posicaoRelativa: posicaoRelativa,
        espacoAumento: espacoAumento,
        vantagemCompetitiva: vantagemCompetitiva,
        posicaoMercado: posicaoMercado,
        precoMin: precoMin,
        precoMedio: precoMedio,
        precoMax: precoMax,
        meuPreco: meuPreco
    };
}

function calcularVantagemCompetitiva(diferencaMedia, posicaoRelativa) {
    if (diferencaMedia > 20) {
        return {
            tipo: 'PREMIUM',
            descricao: 'Posicionamento de alto valor',
            cor: 'text-purple-600 dark:text-purple-400'
        };
    } else if (diferencaMedia > 0) {
        return {
            tipo: 'SUPERIOR',
            descricao: 'Acima da média com bom valor',
            cor: 'text-blue-600 dark:text-blue-400'
        };
    } else if (diferencaMedia > -10) {
        return {
            tipo: 'COMPETITIVO',
            descricao: 'Preço alinhado ao mercado',
            cor: 'text-green-600 dark:text-green-400'
        };
    } else {
        return {
            tipo: 'AGREESSIVO',
            descricao: 'Preço abaixo do mercado',
            cor: 'text-yellow-600 dark:text-yellow-400'
        };
    }
}

function determinarPosicaoMercado(meuPreco, precoMin, precoMedio, precoMax) {
    const faixaBaixa = precoMin * 1.1;
    const faixaMediaBaixa = precoMedio * 0.9;
    const faixaMediaAlta = precoMedio * 1.1;
    const faixaAlta = precoMax * 0.9;
    
    if (meuPreco < faixaBaixa) {
        return {
            posicao: 'MUITO ABAIXO',
            descricao: 'Preço muito abaixo da concorrência',
            cor: 'text-red-600 dark:text-red-400',
            marcadorPos: 10
        };
    } else if (meuPreco < faixaMediaBaixa) {
        return {
            posicao: 'ABAIXO DA MÉDIA',
            descricao: 'Preço abaixo do mercado',
            cor: 'text-orange-600 dark:text-orange-400',
            marcadorPos: 30
        };
    } else if (meuPreco <= faixaMediaAlta) {
        return {
            posicao: 'NA MÉDIA',
            descricao: 'Preço alinhado com o mercado',
            cor: 'text-green-600 dark:text-green-400',
            marcadorPos: 50
        };
    } else if (meuPreco < faixaAlta) {
        return {
            posicao: 'ACIMA DA MÉDIA',
            descricao: 'Preço acima do mercado',
            cor: 'text-blue-600 dark:text-blue-400',
            marcadorPos: 70
        };
    } else {
        return {
            posicao: 'MUITO ACIMA',
            descricao: 'Preço muito acima da concorrência',
            cor: 'text-purple-600 dark:text-purple-400',
            marcadorPos: 90
        };
    }
}

function atualizarInterfaceConcorrencia(analise) {
    // Atualizar indicadores numéricos
    atualizarElementoTexto('diferencaMedia', `${analise.diferencaMedia >= 0 ? '+' : ''}${analise.diferencaMedia.toFixed(1)}%`);
    atualizarElementoTexto('espacoAumento', `${analise.espacoAumento.toFixed(1)}%`);
    
    // Atualizar posição no mercado
    const posicaoMercadoElement = document.getElementById('posicaoMercado');
    if (posicaoMercadoElement) {
        posicaoMercadoElement.textContent = analise.posicaoMercado.posicao;
        posicaoMercadoElement.className = `font-bold ${analise.posicaoMercado.cor}`;
    }
    
    // Atualizar vantagem competitiva
    atualizarElementoTexto('vantagemCompetitiva', analise.vantagemCompetitiva.tipo);
    
    // Atualizar descrição da análise
    const analisePosicao = document.getElementById('analisePosicao');
    if (analisePosicao) {
        analisePosicao.textContent = analise.posicaoMercado.descricao;
        analisePosicao.className = `text-sm ${analise.posicaoMercado.cor}`;
    }
    
    // Atualizar marcador de posição no gráfico de espectro
    const marcadorPosicao = document.getElementById('marcadorPosicao');
    if (marcadorPosicao) {
        marcadorPosicao.style.left = `${analise.posicaoMercado.marcadorPos}%`;
        marcadorPosicao.title = `Posição: ${analise.posicaoMercado.descricao}`;
    }
    
    // Atualizar análise detalhada
    atualizarAnaliseDetalhadaConcorrencia(analise);
}

function atualizarAnaliseDetalhadaConcorrencia(analise) {
    const container = document.getElementById('analiseDetalhadaConcorrencia');
    if (!container) return;
    
    const recomendacoes = gerarRecomendacoesDetalhadas(analise);
    
    container.innerHTML = `
        <div class="space-y-4">
            <div class="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                <h4 class="font-bold text-blue-900 dark:text-blue-300 mb-2">📈 Análise Detalhada</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                        <div class="font-medium">Diferença da média</div>
                        <div class="${analise.diferencaMedia >= 0 ? 'text-green-600' : 'text-red-600'}">
                            ${analise.diferencaMedia >= 0 ? '+' : ''}${analise.diferencaMedia.toFixed(1)}%
                        </div>
                    </div>
                    <div>
                        <div class="font-medium">Espaço para aumento</div>
                        <div class="${analise.espacoAumento > 0 ? 'text-green-600' : 'text-gray-600'}">
                            ${analise.espacoAumento > 0 ? `+${analise.espacoAumento.toFixed(1)}%` : 'Sem espaço'}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="p-4 bg-gradient-to-r from-${analise.vantagemCompetitiva.cor.replace('text-', '').split(' ')[0]}-50 to-${analise.vantagemCompetitiva.cor.replace('text-', '').split(' ')[0]}-100 dark:from-${analise.vantagemCompetitiva.cor.replace('text-', '').split(' ')[0]}-900/20 dark:to-${analise.vantagemCompetitiva.cor.replace('text-', '').split(' ')[0]}-800/20 rounded-xl">
                <h4 class="font-bold ${analise.vantagemCompetitiva.cor} mb-2">🎯 Vantagem Competitiva</h4>
                <p class="text-sm ${analise.vantagemCompetitiva.cor.replace('text-', 'text-').replace('dark:', 'dark:')}">
                    ${analise.vantagemCompetitiva.descricao}
                </p>
            </div>
            
            ${recomendacoes}
        </div>
    `;
}

function gerarRecomendacoesDetalhadas(analise) {
    let recomendacoes = [];
    
    if (analise.diferencaMedia > 30) {
        recomendacoes.push(
            'Seu preço está muito acima do mercado',
            'Certifique-se de que seu produto justifica esse valor premium',
            'Considere adicionar mais benefícios ou serviços inclusos'
        );
    } else if (analise.diferencaMedia > 10) {
        recomendacoes.push(
            'Você está posicionado como premium',
            'Invista em comunicação de valor agregado',
            'Ofereça garantia estendida ou suporte premium'
        );
    } else if (analise.diferencaMedia > -5) {
        recomendacoes.push(
            'Posicionamento competitivo ideal',
            'Mantenha a qualidade para justificar o preço',
            'Destaque pequenos diferenciais em relação aos concorrentes'
        );
    } else if (analise.diferencaMedia > -15) {
        recomendacoes.push(
            'Preço agressivo - cuidado com a margem',
            'Busque eficiência operacional para manter rentabilidade',
            'Considere aumentar gradualmente o preço'
        );
    } else {
        recomendacoes.push(
            'PREÇO MUITO BAIXO - RISCO DE PREJUÍZO',
            'Aumente o preço imediatamente em pelo menos 20%',
            'Reavalie seus custos e estratégia de mercado'
        );
    }
    
    // Adicionar recomendações baseadas no espaço para aumento
    if (analise.espacoAumento > 20) {
        recomendacoes.push(`Você tem espaço para aumentar o preço em até ${analise.espacoAumento.toFixed(0)}%`);
    }
    
    return `
        <div class="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
            <h4 class="font-bold text-green-900 dark:text-green-300 mb-2">💡 Recomendações</h4>
            <ul class="space-y-2">
                ${recomendacoes.map(rec => `
                    <li class="flex items-start">
                        <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                        <span class="text-sm">${rec}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
}

function atualizarGraficoComparacao(analise) {
    if (window.gerenciadorGraficos && window.gerenciadorGraficos.atualizarGraficoComparacaoConcorrencia) {
        window.gerenciadorGraficos.atualizarGraficoComparacaoConcorrencia(
            analise.precoMin,
            analise.precoMedio,
            analise.precoMax,
            analise.meuPreco
        );
    }
}

function gerarRecomendacoesConcorrencia(analise) {
    const container = document.getElementById('recomendacoesConcorrencia');
    if (!container) return;
    
    let acoes = [];
    
    switch(analise.vantagemCompetitiva.tipo) {
        case 'PREMIUM':
            acoes = [
                'Desenvolva materiais de vendas que destacem o valor premium',
                'Ofereça amostras grátis para prospects qualificados',
                'Crie um programa de fidelidade para reter clientes'
            ];
            break;
        case 'SUPERIOR':
            acoes = [
                'Destaque 3 diferenciais principais em relação aos concorrentes',
                'Ofereça garantia de satisfação ou devolução',
                'Crie casos de sucesso com depoimentos de clientes'
            ];
            break;
        case 'COMPETITIVO':
            acoes = [
                'Mantenha a qualidade consistente',
                'Ofereça entrega rápida como diferencial',
                'Atenda melhor que a concorrência'
            ];
            break;
        case 'AGREESSIVO':
            acoes = [
                'AUMENTE O PREÇO gradualmente',
                'Busque eficiência operacional para manter margem',
                'Foque em volume de vendas'
            ];
            break;
    }
    
    container.innerHTML = `
        <div class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h4 class="font-bold text-gray-900 dark:text-white mb-3">🚀 Plano de Ação para Concorrência</h4>
            <ul class="space-y-2">
                ${acoes.map((acao, index) => `
                    <li class="flex items-start">
                        <span class="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full text-xs flex items-center justify-center mr-3">
                            ${index + 1}
                        </span>
                        <span class="text-sm">${acao}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
}

// ==================== FUNÇÕES DE VALOR PERCEBIDO ====================

function atualizarValorPercebido() {
    try {
        console.log('💎 Atualizando valor percebido...');
        
        // Coletar avaliações
        const avaliacoes = coletarAvaliacoesValor();
        
        // Validar avaliações
        if (!validarAvaliacoesValor(avaliacoes)) {
            return;
        }
        
        // Calcular valor percebido total
        const valorTotal = (avaliacoes.qualidade + avaliacoes.atendimento + avaliacoes.marca) / 3;
        
        // Atualizar interface
        atualizarInterfaceValorPercebido(valorTotal, avaliacoes);
        
        // Calcular premium permitido
        const premium = calcularPremiumPermitido(valorTotal);
        
        // Atualizar recomendações de preço baseadas no valor percebido
        atualizarRecomendacoesValorPercebido(valorTotal, premium);
        
        // Salvar dados
        dadosNegocio.mercado.valorPercebido = {
            avaliacoes: avaliacoes,
            valorTotal: valorTotal,
            premiumPermitido: premium,
            timestamp: new Date().toISOString()
        };
        
        console.log('✅ Valor percebido atualizado!');
        
    } catch (error) {
        console.error('❌ Erro ao atualizar valor percebido:', error);
    }
}

function coletarAvaliacoesValor() {
    return {
        qualidade: parseInt(document.getElementById('valorQualidade')?.value) || 8,
        atendimento: parseInt(document.getElementById('valorAtendimento')?.value) || 7,
        marca: parseInt(document.getElementById('valorMarca')?.value) || 6,
        diferencial: parseInt(document.getElementById('valorDiferencial')?.value) || 7,
        experiencia: parseInt(document.getElementById('valorExperiencia')?.value) || 8
    };
}

function validarAvaliacoesValor(avaliacoes) {
    const valores = Object.values(avaliacoes);
    const valoresValidos = valores.every(v => v >= 1 && v <= 10);
    
    if (!valoresValidos) {
        mostrarToast('Avaliações devem estar entre 1 e 10', 'warning');
        return false;
    }
    
    return true;
}

function atualizarInterfaceValorPercebido(valorTotal, avaliacoes) {
    // Atualizar score total
    atualizarElementoTexto('valorPercebidoScore', valorTotal.toFixed(1));
    
    // Atualizar círculo de progresso
    const circle = document.querySelector('.progress-ring__circle');
    if (circle) {
        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (valorTotal / 10) * circumference;
        
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = offset;
        
        // Atualizar cor baseada no valor
        if (valorTotal >= 8) {
            circle.style.stroke = '#10b981'; // Verde
        } else if (valorTotal >= 6) {
            circle.style.stroke = '#f59e0b'; // Amarelo
        } else {
            circle.style.stroke = '#ef4444'; // Vermelho
        }
    }
    
    // Atualizar nível de valor percebido
    let nivel = '';
    let nivelCor = '';
    
    if (valorTotal >= 8.5) {
        nivel = 'EXCELENTE';
        nivelCor = 'text-green-700 dark:text-green-500';
    } else if (valorTotal >= 7) {
        nivel = 'ALTO';
        nivelCor = 'text-green-600 dark:text-green-400';
    } else if (valorTotal >= 5) {
        nivel = 'MÉDIO';
        nivelCor = 'text-yellow-600 dark:text-yellow-400';
    } else {
        nivel = 'BAIXO';
        nivelCor = 'text-red-600 dark:text-red-400';
    }
    
    atualizarElementoTexto('nivelValorPercebido', nivel);
    const nivelElement = document.getElementById('nivelValorPercebido');
    if (nivelElement) nivelElement.className = `font-bold ${nivelCor}`;
    
    // Atualizar gráfico de radar (se existir)
    atualizarGraficoRadarValor(avaliacoes);
    
    // Atualizar análise comparativa
    atualizarComparacaoValorPercebido(valorTotal);
}

function atualizarGraficoRadarValor(avaliacoes) {
    // Esta função seria implementada se houver um gráfico de radar
    // Por enquanto, vamos atualizar as barras de progresso
    Object.keys(avaliacoes).forEach(key => {
        const bar = document.getElementById(`barra${key.charAt(0).toUpperCase() + key.slice(1)}`);
        if (bar) {
            const percentual = (avaliacoes[key] / 10) * 100;
            bar.style.width = `${percentual}%`;
            
            // Atualizar cor baseada no valor
            if (avaliacoes[key] >= 8) {
                bar.className = bar.className.replace(/bg-\[\#?[a-zA-Z0-9]+\]/g, 'bg-green-500');
            } else if (avaliacoes[key] >= 6) {
                bar.className = bar.className.replace(/bg-\[\#?[a-zA-Z0-9]+\]/g, 'bg-yellow-500');
            } else {
                bar.className = bar.className.replace(/bg-\[\#?[a-zA-Z0-9]+\]/g, 'bg-red-500');
            }
        }
    });
}

function calcularPremiumPermitido(valorTotal) {
    // Baseado no valor percebido, calcular quanto de premium o mercado tolera
    if (valorTotal >= 9) {
        return { min: 30, max: 50 }; // 30-50% acima da média
    } else if (valorTotal >= 8) {
        return { min: 20, max: 35 }; // 20-35% acima da média
    } else if (valorTotal >= 7) {
        return { min: 10, max: 25 }; // 10-25% acima da média
    } else if (valorTotal >= 6) {
        return { min: 0, max: 15 }; // 0-15% acima da média
    } else {
        return { min: -10, max: 5 }; // Até 10% abaixo da média
    }
}

function atualizarComparacaoValorPercebido(valorTotal) {
    const comparacaoElement = document.getElementById('comparacaoValorPercebido');
    if (!comparacaoElement) return;
    
    let comparacao = '';
    
    if (valorTotal >= 8) {
        comparacao = 'Seu valor percebido é excelente! Você pode cobrar preços premium.';
    } else if (valorTotal >= 6.5) {
        comparacao = 'Valor percebido acima da média. Bom potencial para diferenciação.';
    } else if (valorTotal >= 5) {
        comparacao = 'Valor percebido na média. Invista em qualidade e atendimento.';
    } else {
        comparacao = 'Valor percebido abaixo da média. Melhore antes de aumentar preços.';
    }
    
    comparacaoElement.textContent = comparacao;
}

function atualizarRecomendacoesValorPercebido(valorTotal, premium) {
    const premiumElement = document.getElementById('premiumPermitido');
    if (premiumElement) {
        if (premium.min > 0) {
            premiumElement.textContent = `+${premium.min}-${premium.max}%`;
            premiumElement.className = 'font-bold text-green-600 dark:text-green-400';
        } else if (premium.max > 0) {
            premiumElement.textContent = `${premium.min}-+${premium.max}%`;
            premiumElement.className = 'font-bold text-yellow-600 dark:text-yellow-400';
        } else {
            premiumElement.textContent = `${premium.min}-${premium.max}%`;
            premiumElement.className = 'font-bold text-red-600 dark:text-red-400';
        }
    }
    
    // Atualizar recomendações específicas
    const recomendacoesElement = document.getElementById('recomendacoesValorPercebido');
    if (!recomendacoesElement) return;
    
    let recomendacoes = [];
    
    if (valorTotal >= 8) {
        recomendacoes = [
            'Continue investindo na qualidade premium',
            'Comunique claramente seus diferenciais',
            'Crie uma experiência de compra memorável'
        ];
    } else if (valorTotal >= 6) {
        recomendacoes = [
            'Melhore o atendimento ao cliente',
            'Invista em branding consistente',
            'Colete e utilize depoimentos de clientes'
        ];
    } else {
        recomendacoes = [
            'PRIORIDADE: Melhore a qualidade do produto/serviço',
            'Treine sua equipe de atendimento',
            'Revise sua proposta de valor'
        ];
    }
    
    recomendacoesElement.innerHTML = recomendacoes.map(rec => `
        <li class="flex items-start mb-2">
            <i class="fas fa-lightbulb text-yellow-500 mt-1 mr-3"></i>
            <span class="text-sm">${rec}</span>
        </li>
    `).join('');
}

// ==================== FUNÇÕES DA TAB RESULTADOS ====================

function calcularResultados() {
    try {
        console.log('📈 Calculando resultados financeiros...');
        
        // Verificar se temos dados necessários
        if (!dadosNegocio.custos || !dadosNegocio.custos.totalUnitario) {
            mostrarToast('Calcule os custos primeiro!', 'warning');
            return;
        }
        
        const meuPreco = parseFloat(document.getElementById('precoVendaFinal')?.value) || 0;
        if (!meuPreco || meuPreco <= 0) {
            mostrarToast('Defina um preço de venda primeiro!', 'warning');
            return;
        }
        
        // Calcular resultados detalhados
        const resultados = calcularResultadosDetalhados(meuPreco);
        
        // Atualizar interface
        atualizarInterfaceResultados(resultados);
        
        // Atualizar gráficos
        atualizarGraficosResultados(resultados);
        
        // Gerar análise financeira
        gerarAnaliseFinanceira(resultados);
        
        // Salvar dados
        dadosNegocio.resultados = {
            ...resultados,
            timestamp: new Date().toISOString()
        };
        
        console.log('✅ Resultados calculados com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao calcular resultados:', error);
        mostrarToast('Erro ao calcular resultados financeiros', 'error');
    }
}

function calcularResultadosDetalhados(preco) {
    const custos = dadosNegocio.custos;
    const qtdMensal = custos.qtdMensal || 100;
    
    // Cálculos básicos
    const receitaBruta = preco * qtdMensal;
    const custoTotal = custos.totalMensal;
    const lucroBruto = receitaBruta - custoTotal;
    const margemBruta = (lucroBruto / receitaBruta) * 100;
    
    // Impostos e taxas (estimados detalhados)
    const impostos = receitaBruta * 0.07; // 7% estimado
    const taxasPlataforma = receitaBruta * 0.12; // 12% estimado
    const comissoes = receitaBruta * 0.05; // 5% estimado
    const despesasOperacionais = receitaBruta * 0.03; // 3% estimado
    
    // Lucro líquido
    const lucroLiquido = lucroBruto - impostos - taxasPlataforma - comissoes - despesasOperacionais;
    const margemLiquida = (lucroLiquido / receitaBruta) * 100;
    
    // Ponto de equilíbrio
    const lucroUnitario = preco - custos.totalUnitario;
    const pontoEquilibrio = lucroUnitario > 0 ? Math.ceil(custos.fixoMensal / lucroUnitario) : Infinity;
    
    // Rentabilidade
    const investimentoInicial = custos.fixoMensal * 3; // Estimativa
    const roi = investimentoInicial > 0 ? (lucroLiquido * 12 / investimentoInicial) * 100 : 0;
    const payback = lucroLiquido > 0 ? investimentoInicial / lucroLiquido : Infinity;
    
    // Ticket médio e projeções
    const ticketMedio = preco;
    const lucroAnual = lucroLiquido * 12;
    
    return {
        receitaBruta: receitaBruta,
        custoTotal: custoTotal,
        lucroBruto: lucroBruto,
        margemBruta: margemBruta,
        impostos: impostos,
        taxasPlataforma: taxasPlataforma,
        comissoes: comissoes,
        despesasOperacionais: despesasOperacionais,
        lucroLiquido: lucroLiquido,
        margemLiquida: margemLiquida,
        lucroUnitario: lucroUnitario,
        pontoEquilibrio: pontoEquilibrio,
        investimentoInicial: investimentoInicial,
        roi: roi,
        payback: payback,
        ticketMedio: ticketMedio,
        lucroAnual: lucroAnual,
        qtdMensal: qtdMensal
    };
}

function atualizarInterfaceResultados(resultados) {
    // Atualizar KPIs principais
    atualizarElementoTexto('kpiFaturamento', formatarMoeda(resultados.receitaBruta));
    atualizarElementoTexto('kpiLucro', formatarMoeda(resultados.lucroLiquido));
    atualizarElementoTexto('kpiMargem', `${resultados.margemLiquida.toFixed(1)}%`);
    atualizarElementoTexto('kpiPontoEquilibrio', resultados.pontoEquilibrio);
    
    // Atualizar demonstração de resultados detalhada
    atualizarDemonstracaoResultados(resultados);
    
    // Atualizar rentabilidade
    atualizarRentabilidade(resultados);
    
    // Atualizar análise de ponto de equilíbrio
    atualizarAnalisePontoEquilibrio(resultados);
}

function atualizarDemonstracaoResultados(resultados) {
    const elementos = {
        'dresReceitaBruta': resultados.receitaBruta,
        'dresCustoMercadorias': resultados.custoTotal,
        'dresLucroBruto': resultados.lucroBruto,
        'dresMargemBruta': `${resultados.margemBruta.toFixed(1)}%`,
        'dresImpostos': resultados.impostos,
        'dresTaxasPlataforma': resultados.taxasPlataforma,
        'dresComissoes': resultados.comissoes,
        'dresDespesasOperacionais': resultados.despesasOperacionais,
        'dresLucroLiquido': resultados.lucroLiquido,
        'dresMargemLucro': `${resultados.margemLiquida.toFixed(1)}%`,
        'dresLucroUnitario': resultados.lucroUnitario
    };
    
    Object.keys(elementos).forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            if (typeof elementos[id] === 'number') {
                elemento.textContent = formatarMoeda(elementos[id]);
            } else {
                elemento.textContent = elementos[id];
            }
        }
    });
}

function atualizarRentabilidade(resultados) {
    const elementos = {
        'rentabilidadeROI': `${resultados.roi.toFixed(1)}%`,
        'rentabilidadePayback': `${resultados.payback.toFixed(1)} meses`,
        'rentabilidadeLucroAnual': formatarMoeda(resultados.lucroAnual),
        'rentabilidadeTicketMedio': formatarMoeda(resultados.ticketMedio),
        'rentabilidadeInvestimento': formatarMoeda(resultados.investimentoInicial)
    };
    
    Object.keys(elementos).forEach(id => {
        atualizarElementoTexto(id, elementos[id]);
    });
    
    // Colorir ROI baseado no retorno
    const roiElement = document.getElementById('rentabilidadeROI');
    if (roiElement) {
        if (resultados.roi >= 30) {
            roiElement.className = 'text-xl font-bold text-green-600 dark:text-green-400';
        } else if (resultados.roi >= 15) {
            roiElement.className = 'text-xl font-bold text-yellow-600 dark:text-yellow-400';
        } else {
            roiElement.className = 'text-xl font-bold text-red-600 dark:text-red-400';
        }
    }
}

function atualizarAnalisePontoEquilibrio(resultados) {
    const qtdMensal = resultados.qtdMensal;
    const pontoEquilibrio = resultados.pontoEquilibrio;
    const percentualCapacidade = qtdMensal > 0 ? (pontoEquilibrio / qtdMensal) * 100 : 100;
    
    atualizarElementoTexto('analisePontoEquilibrioUn', pontoEquilibrio);
    atualizarElementoTexto('analisePontoEquilibrioPercent', `${percentualCapacidade.toFixed(1)}%`);
    
    // Análise de risco
    const analiseRisco = document.getElementById('analiseRiscoPontoEquilibrio');
    if (analiseRisco) {
        let risco = '';
        let cor = '';
        
        if (percentualCapacidade > 80) {
            risco = 'ALTO RISCO';
            cor = 'text-red-600 dark:text-red-400';
        } else if (percentualCapacidade > 60) {
            risco = 'RISCO MODERADO';
            cor = 'text-yellow-600 dark:text-yellow-400';
        } else if (percentualCapacidade > 40) {
            risco = 'BAIXO RISCO';
            cor = 'text-blue-600 dark:text-blue-400';
        } else {
            risco = 'RISCO MÍNIMO';
            cor = 'text-green-600 dark:text-green-400';
        }
        
        analiseRisco.innerHTML = `
            <div class="p-3 bg-gradient-to-r from-${cor.replace('text-', '').split(' ')[0]}-50 to-${cor.replace('text-', '').split(' ')[0]}-100 dark:from-${cor.replace('text-', '').split(' ')[0]}-900/20 dark:to-${cor.replace('text-', '').split(' ')[0]}-800/20 rounded-xl">
                <div class="font-bold ${cor} mb-1">${risco}</div>
                <div class="text-sm">Ponto de equilíbrio em ${percentualCapacidade.toFixed(1)}% da capacidade mensal</div>
            </div>
        `;
    }
}

function atualizarGraficosResultados(resultados) {
    if (window.gerenciadorGraficos) {
        // Atualizar gráfico de evolução do lucro
        if (window.gerenciadorGraficos.graficos.evolucaoLucro) {
            // Simular projeção de 6 meses baseada nos resultados atuais
            const projecaoLucros = Array.from({length: 6}, (_, i) => 
                resultados.lucroLiquido * (1 + (i * 0.15))
            );
            
            window.gerenciadorGraficos.graficos.evolucaoLucro.data.datasets[0].data = projecaoLucros;
            window.gerenciadorGraficos.graficos.evolucaoLucro.update();
        }
        
        // Atualizar gráfico de ponto de equilíbrio
        if (window.gerenciadorGraficos.graficos.pontoEquilibrio) {
            // Ajustar gráfico baseado no ponto de equilíbrio real
            const maxQtd = Math.max(resultados.pontoEquilibrio * 1.5, resultados.qtdMensal * 1.2);
            const labels = Array.from({length: 6}, (_, i) => 
                Math.round((maxQtd / 5) * i)
            );
            
            // Recalcular dados do gráfico
            const dadosCustos = labels.map(qtd => 
                resultados.custoTotal + (dadosNegocio.custos.variavelUnitario || 0) * qtd
            );
            
            const dadosReceitas = labels.map(qtd => 
                (dadosNegocio.resultados?.preco || resultados.ticketMedio) * qtd
            );
            
            window.gerenciadorGraficos.graficos.pontoEquilibrio.data.labels = labels;
            window.gerenciadorGraficos.graficos.pontoEquilibrio.data.datasets[0].data = dadosCustos;
            window.gerenciadorGraficos.graficos.pontoEquilibrio.data.datasets[1].data = dadosReceitas;
            window.gerenciadorGraficos.graficos.pontoEquilibrio.update();
        }
    }
}

function gerarAnaliseFinanceira(resultados) {
    const container = document.getElementById('analiseFinanceiraDetalhada');
    if (!container) return;
    
    let pontosFortes = [];
    let pontosFracos = [];
    let recomendacoes = [];
    
    // Análise de margem
    if (resultados.margemLiquida >= 25) {
        pontosFortes.push('Margem líquida excelente');
        recomendacoes.push('Continue investindo em crescimento');
    } else if (resultados.margemLiquida >= 15) {
        pontosFortes.push('Margem líquida saudável');
    } else if (resultados.margemLiquida >= 5) {
        pontosFracos.push('Margem líquida baixa');
        recomendacoes.push('Busque eficiência operacional');
    } else {
        pontosFracos.push('Margem líquida crítica');
        recomendacoes.push('REVISÃO URGENTE DE CUSTOS E PREÇOS');
    }
    
    // Análise de ponto de equilíbrio
    const percentualCapacidade = (resultados.pontoEquilibrio / resultados.qtdMensal) * 100;
    if (percentualCapacidade <= 40) {
        pontosFortes.push('Ponto de equilíbrio alcançável');
    } else if (percentualCapacidade <= 70) {
        pontosFracos.push('Ponto de equilíbrio elevado');
        recomendacoes.push('Reduza custos fixos ou aumente preço');
    } else {
        pontosFracos.push('Ponto de equilíbrio muito alto');
        recomendacoes.push('REAVALIE TODO O MODELO DE NEGÓCIO');
    }
    
    // Análise de ROI
    if (resultados.roi >= 30) {
        pontosFortes.push('ROI excelente');
    } else if (resultados.roi >= 15) {
        pontosFortes.push('ROI aceitável');
    } else {
        pontosFracos.push('ROI baixo');
        recomendacoes.push('Melhore a rentabilidade do investimento');
    }
    
    // Montar análise
    container.innerHTML = `
        <div class="space-y-4">
            ${pontosFortes.length > 0 ? `
                <div class="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                    <h4 class="font-bold text-green-900 dark:text-green-300 mb-2">✅ Pontos Fortes</h4>
                    <ul class="space-y-1">
                        ${pontosFortes.map(ponto => `<li class="flex items-center"><i class="fas fa-check-circle text-green-500 mr-2"></i> ${ponto}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${pontosFracos.length > 0 ? `
                <div class="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl">
                    <h4 class="font-bold text-red-900 dark:text-red-300 mb-2">⚠️ Pontos de Atenção</h4>
                    <ul class="space-y-1">
                        ${pontosFracos.map(ponto => `<li class="flex items-center"><i class="fas fa-exclamation-triangle text-red-500 mr-2"></i> ${ponto}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${recomendacoes.length > 0 ? `
                <div class="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                    <h4 class="font-bold text-blue-900 dark:text-blue-300 mb-2">🎯 Recomendações</h4>
                    <ul class="space-y-2">
                        ${recomendacoes.map((rec, index) => `
                            <li class="flex items-start">
                                <span class="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full text-xs flex items-center justify-center mr-3">
                                    ${index + 1}
                                </span>
                                <span class="text-sm">${rec}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
    `;
}

// ==================== FUNÇÕES AUXILIARES ====================

function calcularTudo() {
    try {
        console.log('🔄 Calculando todos os dados...');
        
        // Executar cálculos em sequência
        calcularCustos();
        
        // Aguardar um pouco para os cálculos de custos completarem
        setTimeout(() => {
            if (dadosNegocio.custos && dadosNegocio.custos.totalUnitario) {
                calcularResultados();
                analisarConcorrencia();
                atualizarValorPercebido();
                atualizarDashboard();
                
                mostrarToast('Todos os cálculos foram atualizados!', 'success');
                
                // Mostrar resumo
                mostrarResumoCalculos();
            } else {
                mostrarToast('Complete os dados de custos primeiro!', 'warning');
            }
        }, 500);
        
    } catch (error) {
        console.error('❌ Erro ao calcular tudo:', error);
        mostrarToast('Erro ao calcular todos os dados', 'error');
    }
}

function mostrarResumoCalculos() {
    const resumo = document.getElementById('resumoCalculosRapido');
    if (!resumo) return;
    
    if (!dadosNegocio.resultados || !dadosNegocio.custos) {
        resumo.classList.add('hidden');
        return;
    }
    
    const margem = dadosNegocio.resultados.margemLiquida || 0;
    const pontoEquilibrio = dadosNegocio.resultados.pontoEquilibrio || 0;
    const qtdMensal = dadosNegocio.custos.qtdMensal || 0;
    
    let status = '';
    let cor = '';
    
    if (margem >= 20) {
        status = 'SAUDÁVEL';
        cor = 'green';
    } else if (margem >= 10) {
        status = 'ESTÁVEL';
        cor = 'yellow';
    } else {
        status = 'CRÍTICO';
        cor = 'red';
    }
    
    resumo.innerHTML = `
        <div class="p-4 bg-gradient-to-r from-${cor}-50 to-${cor}-100 dark:from-${cor}-900/20 dark:to-${cor}-800/20 rounded-xl">
            <div class="font-bold text-${cor}-900 dark:text-${cor}-300 mb-2">📊 Resumo Rápido</div>
            <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <div class="font-medium">Status Financeiro</div>
                    <div class="text-${cor}-700 dark:text-${cor}-400">${status}</div>
                </div>
                <div>
                    <div class="font-medium">Margem Líquida</div>
                    <div>${margem.toFixed(1)}%</div>
                </div>
                <div>
                    <div class="font-medium">Ponto de Equilíbrio</div>
                    <div>${pontoEquilibrio} unidades</div>
                </div>
                <div>
                    <div class="font-medium">Capacidade Mensal</div>
                    <div>${qtdMensal} unidades</div>
                </div>
            </div>
        </div>
    `;
    
    resumo.classList.remove('hidden');
}

// ==================== EXPOSIÇÃO DE FUNÇÕES ====================

window.analisarConcorrencia = analisarConcorrencia;
window.atualizarValorPercebido = atualizarValorPercebido;
window.calcularResultados = calcularResultados;
window.calcularTudo = calcularTudo;

// ==================== FUNÇÕES DA TAB MERCADO ====================

function analisarConcorrencia() {
    try {
        console.log('📈 Analisando concorrência...');
        
        // Coletar dados da concorrência
        const dadosConcorrencia = coletarDadosConcorrencia();
        
        // Validar dados
        if (!validarDadosConcorrencia(dadosConcorrencia)) {
            return;
        }
        
        // Coletar preço atual do usuário
        const meuPreco = parseFloat(document.getElementById('precoVendaFinal')?.value) || 0;
        
        if (meuPreco <= 0) {
            mostrarToast('Defina um preço de venda primeiro!', 'warning');
            return;
        }
        
        // Calcular métricas de posicionamento
        const metricas = calcularMetricasConcorrencia(dadosConcorrencia, meuPreco);
        
        // Atualizar interface com os resultados
        atualizarInterfaceConcorrencia(metricas, dadosConcorrencia, meuPreco);
        
        // Atualizar gráfico de comparação
        if (window.gerenciadorGraficos) {
            window.gerenciadorGraficos.atualizarGraficoComparacaoConcorrencia(
                dadosConcorrencia.precoMin,
                dadosConcorrencia.precoMedio,
                dadosConcorrencia.precoMax,
                meuPreco
            );
        }
        
        // Gerar análise estratégica
        gerarAnaliseEstrategica(metricas, dadosConcorrencia, meuPreco);
        
        // Atualizar valor percebido
        atualizarValorPercebido();
        
        console.log('✅ Análise de concorrência concluída!');
        
    } catch (error) {
        console.error('❌ Erro na análise de concorrência:', error);
        mostrarToast('Erro ao analisar concorrência', 'error');
    }
}

function coletarDadosConcorrencia() {
    return {
        precoMin: parseFloat(document.getElementById('precoMinConcorrencia')?.value) || 0,
        precoMedio: parseFloat(document.getElementById('precoMedioConcorrencia')?.value) || 0,
        precoMax: parseFloat(document.getElementById('precoMaxConcorrencia')?.value) || 0,
        qualidadeConcorrentes: document.getElementById('qualidadeConcorrentes')?.value || 'medio',
        diferencialConcorrentes: document.getElementById('diferencialConcorrentes')?.value || ''
    };
}

function validarDadosConcorrencia(dados) {
    // Verificar se os preços foram preenchidos
    if (!dados.precoMin || !dados.precoMedio || !dados.precoMax) {
        mostrarToast('Preencha todos os preços da concorrência!', 'warning');
        return false;
    }
    
    // Validar lógica dos preços
    if (dados.precoMin >= dados.precoMedio || dados.precoMedio >= dados.precoMax) {
        mostrarToast('Preços inválidos: Mínimo < Médio < Máximo', 'warning');
        return false;
    }
    
    // Validar se o preço mínimo é positivo
    if (dados.precoMin <= 0) {
        mostrarToast('Preço mínimo deve ser maior que zero', 'warning');
        return false;
    }
    
    return true;
}

function calcularMetricasConcorrencia(dados, meuPreco) {
    // Diferença percentual em relação à média
    const diferencaMedia = ((meuPreco - dados.precoMedio) / dados.precoMedio) * 100;
    
    // Posição relativa na faixa de preços
    const posicaoRelativa = ((meuPreco - dados.precoMin) / (dados.precoMax - dados.precoMin)) * 100;
    
    // Espaço para aumento (quanto pode aumentar até o máximo)
    const espacoAumento = dados.precoMax > meuPreco ? ((dados.precoMax - meuPreco) / meuPreco * 100) : 0;
    
    // Margem de segurança (quanto está acima do mínimo)
    const margemSeguranca = ((meuPreco - dados.precoMin) / dados.precoMin * 100);
    
    // Índice de competitividade (0-100)
    const indiceCompetitividade = calcularIndiceCompetitividade(dados, meuPreco);
    
    return {
        diferencaMedia,
        posicaoRelativa,
        espacoAumento,
        margemSeguranca,
        indiceCompetitividade
    };
}

function calcularIndiceCompetitividade(dados, meuPreco) {
    let indice = 50; // Base
    
    // Fator 1: Proximidade do preço médio
    const diferencaMedia = Math.abs((meuPreco - dados.precoMedio) / dados.precoMedio * 100);
    if (diferencaMedia < 10) indice += 20;
    else if (diferencaMedia < 20) indice += 10;
    else if (diferencaMedia > 40) indice -= 20;
    
    // Fator 2: Posição na faixa
    const posicaoRelativa = ((meuPreco - dados.precoMin) / (dados.precoMax - dados.precoMin)) * 100;
    if (posicaoRelativa >= 40 && posicaoRelativa <= 60) indice += 15;
    else if (posicaoRelativa >= 30 && posicaoRelativa <= 70) indice += 5;
    else indice -= 10;
    
    // Fator 3: Qualidade dos concorrentes
    const qualidade = dados.qualidadeConcorrentes;
    if (qualidade === 'baixo') indice += 15;
    else if (qualidade === 'medio') indice += 5;
    else if (qualidade === 'alto') indice -= 10;
    
    return Math.max(0, Math.min(100, indice));
}

function atualizarInterfaceConcorrencia(metricas, dados, meuPreco) {
    // Atualizar métricas básicas
    atualizarElementoTexto('diferencaMedia', `${metricas.diferencaMedia >= 0 ? '+' : ''}${metricas.diferencaMedia.toFixed(1)}%`);
    atualizarElementoTexto('espacoAumento', `${metricas.espacoAumento.toFixed(1)}%`);
    atualizarElementoTexto('margemSeguranca', `${metricas.margemSeguranca.toFixed(1)}%`);
    
    // Atualizar posição de mercado
    atualizarPosicaoMercado(metricas.posicaoRelativa, meuPreco, dados);
    
    // Atualizar índice de competitividade
    atualizarIndiceCompetitividade(metricas.indiceCompetitividade);
    
    // Atualizar vantagem competitiva
    atualizarVantagemCompetitiva(metricas, dados);
}

function atualizarPosicaoMercado(posicaoRelativa, meuPreco, dados) {
    const posicaoMercadoElement = document.getElementById('posicaoMercado');
    const marcadorPosicaoElement = document.getElementById('marcadorPosicao');
    
    if (!posicaoMercadoElement || !marcadorPosicaoElement) return;
    
    let posicaoTexto = '';
    let posicaoCor = '';
    let marcadorPos = posicaoRelativa;
    
    // Definir posição baseada na faixa relativa
    if (posicaoRelativa < 20) {
        posicaoTexto = 'MUITO ABAIXO DA MÉDIA';
        posicaoCor = 'text-red-600 dark:text-red-400';
    } else if (posicaoRelativa < 40) {
        posicaoTexto = 'ABAIXO DA MÉDIA';
        posicaoCor = 'text-orange-600 dark:text-orange-400';
    } else if (posicaoRelativa <= 60) {
        posicaoTexto = 'NA MÉDIA DO MERCADO';
        posicaoCor = 'text-green-600 dark:text-green-400';
    } else if (posicaoRelativa < 80) {
        posicaoTexto = 'ACIMA DA MÉDIA';
        posicaoCor = 'text-blue-600 dark:text-blue-400';
    } else {
        posicaoTexto = 'MUITO ACIMA DA MÉDIA';
        posicaoCor = 'text-purple-600 dark:text-purple-400';
    }
    
    // Adicionar análise contextual
    const diferencaMin = ((meuPreco - dados.precoMin) / dados.precoMin * 100).toFixed(1);
    const diferencaMax = ((dados.precoMax - meuPreco) / meuPreco * 100).toFixed(1);
    
    posicaoMercadoElement.innerHTML = `
        <div class="font-bold ${posicaoCor}">${posicaoTexto}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            ${diferencaMin}% acima do mínimo • ${diferencaMax}% abaixo do máximo
        </div>
    `;
    
    // Atualizar marcador visual
    marcadorPosicaoElement.style.left = `${Math.min(100, Math.max(0, marcadorPos))}%`;
}

function atualizarIndiceCompetitividade(indice) {
    const elemento = document.getElementById('indiceCompetitividade');
    if (!elemento) return;
    
    // Atualizar valor
    elemento.textContent = `${indice.toFixed(0)}/100`;
    
    // Atualizar barra de progresso
    const barra = elemento.parentElement?.querySelector('.progress-bar');
    if (barra) {
        barra.style.width = `${indice}%`;
        
        // Cor baseada no índice
        if (indice >= 70) barra.className = 'progress-bar h-2 rounded bg-gradient-to-r from-green-500 to-green-600';
        else if (indice >= 50) barra.className = 'progress-bar h-2 rounded bg-gradient-to-r from-yellow-500 to-yellow-600';
        else barra.className = 'progress-bar h-2 rounded bg-gradient-to-r from-red-500 to-red-600';
    }
    
    // Adicionar classificação
    const classificacao = document.getElementById('classificacaoCompetitividade');
    if (classificacao) {
        if (indice >= 70) {
            classificacao.textContent = 'ALTA COMPETITIVIDADE';
            classificacao.className = 'font-bold text-green-600 dark:text-green-400';
        } else if (indice >= 50) {
            classificacao.textContent = 'COMPETITIVIDADE MÉDIA';
            classificacao.className = 'font-bold text-yellow-600 dark:text-yellow-400';
        } else {
            classificacao.textContent = 'BAIXA COMPETITIVIDADE';
            classificacao.className = 'font-bold text-red-600 dark:text-red-400';
        }
    }
}

function atualizarVantagemCompetitiva(metricas, dados) {
    const elemento = document.getElementById('vantagemCompetitiva');
    if (!elemento) return;
    
    let vantagem = '';
    let explicacao = '';
    
    // Determinar vantagem baseada na diferença média
    if (metricas.diferencaMedia > 20) {
        vantagem = 'POSICIONAMENTO PREMIUM';
        explicacao = 'Seu preço está significativamente acima da média. Garanta que seu produto justifique essa diferença com clara superioridade.';
    } else if (metricas.diferencaMedia > 5) {
        vantagem = 'DIFERENCIAÇÃO POR VALOR';
        explicacao = 'Preço acima da média com margem para diferenciação. Destaque seus pontos fortes.';
    } else if (metricas.diferencaMedia > -5) {
        vantagem = 'COMPETITIVO EQUILIBRADO';
        explicacao = 'Preço alinhado com o mercado. Foque em eficiência e experiência do cliente.';
    } else if (metricas.diferencaMedia > -15) {
        vantagem = 'PREÇO AGRESSIVO';
        explicacao = 'Preço abaixo da média. Estratégia para ganhar market share. Cuidado com a margem.';
    } else {
        vantagem = 'LIDERANÇA EM PREÇO';
        explicacao = 'Preço muito abaixo do mercado. Pode ser insustentável a longo prazo.';
    }
    
    elemento.innerHTML = `
        <div class="font-bold text-lg">${vantagem}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">${explicacao}</div>
    `;
}

function gerarAnaliseEstrategica(metricas, dados, meuPreco) {
    const container = document.getElementById('analiseEstrategica');
    if (!container) return;
    
    let estrategia = '';
    let acoes = [];
    
    // Definir estratégia baseada no posicionamento
    if (metricas.posicaoRelativa < 30) {
        estrategia = 'ESTRATÉGIA DE ENTRADA NO MERCADO';
        acoes = [
            'Mantenha o preço baixo para atrair primeiros clientes',
            'Ofereça amostras grátis ou trials',
            'Colete feedback para melhorias rápidas',
            'Prepare-se para aumentar preços gradualmente'
        ];
    } else if (metricas.posicaoRelativa < 50) {
        estrategia = 'ESTRATÉGIA DE CRESCIMENTO';
        acoes = [
            'Aumente gradualmente o preço conforme a base de clientes cresce',
            'Invista em marketing para aumentar a percepção de valor',
            'Desenvolva novos recursos ou variações do produto',
            'Busque parcerias estratégicas'
        ];
    } else if (metricas.posicaoRelativa < 70) {
        estrategia = 'ESTRATÉGIA DE CONSOLIDAÇÃO';
        acoes = [
            'Mantenha preços estáveis e foque em fidelização',
            'Ofereça pacotes ou assinaturas para aumentar ticket médio',
            'Aprimore a experiência do cliente',
            'Expanda para novos canais de venda'
        ];
    } else {
        estrategia = 'ESTRATÉGIA PREMIUM';
        acoes = [
            'Comunique claramente o valor superior do seu produto',
            'Ofereça atendimento personalizado e exclusivo',
            'Crie uma comunidade de clientes premium',
            'Expanda para mercados nicho de alto valor'
        ];
    }
    
    // Adicionar recomendações baseadas no índice de competitividade
    if (metricas.indiceCompetitividade < 50) {
        acoes.push('Considere ajustar preço ou melhorar diferenciação');
    }
    
    if (metricas.espacoAumento > 20 && metricas.diferencaMedia < 10) {
        acoes.push('Há espaço para aumento de preço sem perder competitividade');
    }
    
    // Renderizar análise
    container.innerHTML = `
        <div class="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
            <h4 class="font-bold text-purple-900 dark:text-purple-300 mb-3">🎯 ${estrategia}</h4>
            
            <div class="mb-4">
                <div class="font-medium text-gray-700 dark:text-gray-300 mb-2">📊 Análise do Posicionamento:</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                    • Diferença da média: ${metricas.diferencaMedia >= 0 ? '+' : ''}${metricas.diferencaMedia.toFixed(1)}%<br>
                    • Posição na faixa: ${metricas.posicaoRelativa.toFixed(1)}%<br>
                    • Competitividade: ${metricas.indiceCompetitividade.toFixed(0)}/100
                </div>
            </div>
            
            <div>
                <div class="font-medium text-gray-700 dark:text-gray-300 mb-2">🚀 Ações Recomendadas:</div>
                <ul class="space-y-1">
                    ${acoes.map(acao => `<li class="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                        <i class="fas fa-check-circle text-green-500 mt-1 mr-2 text-xs"></i>
                        <span>${acao}</span>
                    </li>`).join('')}
                </ul>
            </div>
        </div>
    `;
    
    container.classList.remove('hidden');
}

// ==================== ANÁLISE DE VALOR PERCEBIDO ====================

function atualizarValorPercebido() {
    try {
        // Coletar avaliações do usuário
        const avaliacoes = coletarAvaliacoesValorPercebido();
        
        // Validar avaliações
        if (!validarAvaliacoesValorPercebido(avaliacoes)) {
            return;
        }
        
        // Calcular score de valor percebido
        const score = calcularScoreValorPercebido(avaliacoes);
        
        // Atualizar interface
        atualizarInterfaceValorPercebido(score, avaliacoes);
        
        // Gerar recomendações baseadas no score
        gerarRecomendacoesValorPercebido(score, avaliacoes);
        
        // Atualizar premium permitido
        atualizarPremiumPermitido(score);
        
    } catch (error) {
        console.error('❌ Erro ao atualizar valor percebido:', error);
    }
}

function coletarAvaliacoesValorPercebido() {
    return {
        qualidade: parseInt(document.getElementById('valorQualidade')?.value) || 8,
        atendimento: parseInt(document.getElementById('valorAtendimento')?.value) || 7,
        marca: parseInt(document.getElementById('valorMarca')?.value) || 6,
        exclusividade: parseInt(document.getElementById('valorExclusividade')?.value) || 5,
        conveniencia: parseInt(document.getElementById('valorConveniencia')?.value) || 6
    };
}

function validarAvaliacoesValorPercebido(avaliacoes) {
    const valores = Object.values(avaliacoes);
    const todosValidos = valores.every(v => v >= 1 && v <= 10);
    
    if (!todosValidos) {
        mostrarToast('Avaliações devem estar entre 1 e 10', 'warning');
        return false;
    }
    
    return true;
}

function calcularScoreValorPercebido(avaliacoes) {
    const pesos = {
        qualidade: 0.30,
        atendimento: 0.25,
        marca: 0.20,
        exclusividade: 0.15,
        conveniencia: 0.10
    };
    
    let score = 0;
    for (const [chave, valor] of Object.entries(avaliacoes)) {
        score += valor * pesos[chave];
    }
    
    return score;
}

function atualizarInterfaceValorPercebido(score, avaliacoes) {
    // Atualizar score
    atualizarElementoTexto('valorPercebidoScore', score.toFixed(1));
    
    // Atualizar círculo de progresso
    const circle = document.querySelector('.progress-ring__circle');
    if (circle) {
        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (score / 10) * circumference;
        
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = offset;
    }
    
    // Atualizar nível de valor percebido
    let nivel = '';
    let nivelCor = '';
    
    if (score >= 8) {
        nivel = 'VALOR MUITO ALTO';
        nivelCor = 'text-green-600 dark:text-green-400';
    } else if (score >= 6) {
        nivel = 'VALOR ALTO';
        nivelCor = 'text-blue-600 dark:text-blue-400';
    } else if (score >= 4) {
        nivel = 'VALOR MÉDIO';
        nivelCor = 'text-yellow-600 dark:text-yellow-400';
    } else {
        nivel = 'VALOR BAIXO';
        nivelCor = 'text-red-600 dark:text-red-400';
    }
    
    atualizarElementoTexto('nivelValorPercebido', nivel);
    const elementoNivel = document.getElementById('nivelValorPercebido');
    if (elementoNivel) elementoNivel.className = `font-bold ${nivelCor}`;
    
    // Atualizar radar de competências
    atualizarRadarCompetencias(avaliacoes);
}

function atualizarRadarCompetencias(avaliacoes) {
    const ctx = document.getElementById('radarValorPercebido');
    if (!ctx) return;
    
    // Destruir gráfico anterior se existir
    if (window.radarChart) {
        window.radarChart.destroy();
    }
    
    try {
        window.radarChart = new Chart(ctx.getContext('2d'), {
            type: 'radar',
            data: {
                labels: ['Qualidade', 'Atendimento', 'Marca', 'Exclusividade', 'Conveniência'],
                datasets: [{
                    label: 'Seu Negócio',
                    data: Object.values(avaliacoes),
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: 'rgb(59, 130, 246)',
                    pointBackgroundColor: 'rgb(59, 130, 246)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(59, 130, 246)'
                }, {
                    label: 'Média do Mercado',
                    data: [7, 6, 5, 4, 6],
                    backgroundColor: 'rgba(156, 163, 175, 0.2)',
                    borderColor: 'rgb(156, 163, 175)',
                    pointBackgroundColor: 'rgb(156, 163, 175)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(156, 163, 175)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: {
                            color: document.body.classList.contains('dark-mode') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                        },
                        grid: {
                            color: document.body.classList.contains('dark-mode') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                        },
                        pointLabels: {
                            color: document.body.classList.contains('dark-mode') ? '#9ca3af' : '#6b7280'
                        },
                        ticks: {
                            backdropColor: 'transparent',
                            color: document.body.classList.contains('dark-mode') ? '#9ca3af' : '#6b7280'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: document.body.classList.contains('dark-mode') ? '#f3f4f6' : '#111827'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Erro ao criar gráfico radar:', error);
    }
}

function gerarRecomendacoesValorPercebido(score, avaliacoes) {
    const container = document.getElementById('recomendacoesValorPercebido');
    if (!container) return;
    
    let recomendacoes = [];
    
    // Recomendações baseadas no score geral
    if (score < 5) {
        recomendacoes.push('INVISTA EM DIFERENCIAÇÃO - Seu valor percebido está baixo.');
        recomendacoes.push('Pesquise o que seus clientes realmente valorizam.');
        recomendacoes.push('Melhore a comunicação dos seus benefícios.');
    } else if (score < 7) {
        recomendacoes.push('FORTALEÇA SEUS PONTOS FORTES - Valor percebido está na média.');
        recomendacoes.push('Destaque seus diferenciais no marketing.');
        recomendacoes.push('Considere aumentar gradualmente os preços.');
    } else {
        recomendacoes.push('CAPITALIZE O VALOR - Seu valor percebido está alto!');
        recomendacoes.push('Você tem espaço para aumentar preços.');
        recomendacoes.push('Crie versões premium do seu produto/serviço.');
    }
    
    // Recomendações específicas por dimensão
    const dimensoes = [
        { chave: 'qualidade', nome: 'Qualidade', valor: avaliacoes.qualidade },
        { chave: 'atendimento', nome: 'Atendimento', valor: avaliacoes.atendimento },
        { chave: 'marca', nome: 'Marca', valor: avaliacoes.marca },
        { chave: 'exclusividade', nome: 'Exclusividade', valor: avaliacoes.exclusividade },
        { chave: 'conveniencia', nome: 'Conveniência', valor: avaliacoes.conveniencia }
    ];
    
    // Identificar pontos fracos (avaliação < 6)
    const pontosFracos = dimensoes.filter(d => d.valor < 6);
    if (pontosFracos.length > 0) {
        recomendacoes.push('PONTOS PARA MELHORIA:');
        pontosFracos.forEach(ponto => {
            recomendacoes.push(`• ${ponto.nome}: Desenvolva estratégias para melhorar.`);
        });
    }
    
    // Renderizar recomendações
    container.innerHTML = `
        <div class="space-y-2">
            ${recomendacoes.map(rec => `
                <div class="flex items-start">
                    <i class="fas fa-bullseye text-blue-500 mt-1 mr-3"></i>
                    <span class="text-sm">${rec}</span>
                </div>
            `).join('')}
        </div>
    `;
    
    container.classList.remove('hidden');
}

function atualizarPremiumPermitido(score) {
    const elemento = document.getElementById('premiumPermitido');
    if (!elemento) return;
    
    // Calcular premium baseado no score
    const premiumMin = Math.max(0, (score - 5) * 3);
    const premiumMax = premiumMin + 10;
    
    elemento.textContent = `${premiumMin.toFixed(0)}-${premiumMax.toFixed(0)}%`;
    
    // Explicação do premium
    const explicacao = document.getElementById('explicacaoPremium');
    if (explicacao) {
        if (premiumMin > 20) {
            explicacao.textContent = 'Você pode cobrar significativamente mais que a concorrência!';
            explicacao.className = 'text-green-600 dark:text-green-400 text-sm font-medium';
        } else if (premiumMin > 10) {
            explicacao.textContent = 'Bom espaço para premium. Destaque seus diferenciais.';
            explicacao.className = 'text-blue-600 dark:text-blue-400 text-sm font-medium';
        } else if (premiumMin > 0) {
            explicacao.textContent = 'Pequeno espaço para premium. Trabalhe na percepção de valor.';
            explicacao.className = 'text-yellow-600 dark:text-yellow-400 text-sm font-medium';
        } else {
            explicacao.textContent = 'Foque em igualar os preços da concorrência primeiro.';
            explicacao.className = 'text-red-600 dark:text-red-400 text-sm font-medium';
        }
    }
}

// ==================== ANÁLISE DE SAZONALIDADE ====================

function analisarSazonalidade() {
    const sazonalidade = document.getElementById('sazonalidade')?.value;
    const container = document.getElementById('analiseSazonalidade');
    
    if (!container || !sazonalidade) return;
    
    const analises = {
        'constante': {
            titulo: 'DEMANDA CONSTANTE',
            descricao: 'Vendas estáveis ao longo do ano. Ideal para planejamento financeiro.',
            estrategias: [
                'Mantenha estoques regulados',
                'Foque em fidelização de clientes',
                'Invista em marketing contínuo'
            ]
        },
        'alta_natal': {
            titulo: 'ALTA NO NATAL/FIM DE ANO',
            descricao: 'Pico de vendas no último trimestre. Planeje com antecedência.',
            estrategias: [
                'Aumente estoques a partir de setembro',
                'Contrate temporários para pico',
                'Crie promoções especiais para a temporada'
            ]
        },
        'alta_ferias': {
            titulo: 'ALTA NAS FÉRIAS',
            descricao: 'Pico de vendas em períodos de férias escolares.',
            estrategias: [
                'Prepare campanhas específicas para férias',
                'Ofereça pacotes familiares',
                'Ajuste preços para alta temporada'
            ]
        },
        'especifica': {
            titulo: 'DATAS ESPECÍFICAS',
            descricao: 'Picos em datas comemorativas específicas.',
            estrategias: [
                'Identifique todas as datas relevantes',
                'Crie produtos/promoções temáticas',
                'Planeje produção com antecedência'
            ]
        },
        'variavel': {
            titulo: 'DEMANDA VARIÁVEL',
            descricao: 'Vendas imprevisíveis. Requer flexibilidade.',
            estrategias: [
                'Mantenha estoque mínimo',
                'Tenha fornecedores ágeis',
                'Diversifique produtos/serviços'
            ]
        }
    };
    
    const analise = analises[sazonalidade];
    if (!analise) return;
    
    container.innerHTML = `
        <div class="p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl">
            <h4 class="font-bold text-orange-900 dark:text-orange-300 mb-3">📅 ${analise.titulo}</h4>
            <p class="text-sm text-orange-800 dark:text-orange-400 mb-4">${analise.descricao}</p>
            
            <div class="font-medium text-gray-700 dark:text-gray-300 mb-2">🎯 Estratégias Recomendadas:</div>
            <ul class="space-y-1">
                ${analise.estrategias.map(estrategia => `
                    <li class="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                        <i class="fas fa-calendar-check text-orange-500 mt-1 mr-2 text-xs"></i>
                        <span>${estrategia}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
    
    container.classList.remove('hidden');
}

// ==================== EXPOSIÇÃO DE FUNÇÕES ====================

window.analisarConcorrencia = analisarConcorrencia;
window.atualizarValorPercebido = atualizarValorPercebido;
window.analisarSazonalidade = analisarSazonalidade;
// ==================== FUNÇÕES DA TAB RESULTADOS ====================

function calcularResultados() {
    try {
        console.log('💰 Calculando resultados financeiros...');
        
        // Validar se temos dados necessários
        if (!validarDadosParaResultados()) {
            mostrarToast('Complete custos e preço primeiro!', 'warning');
            return;
        }
        
        // Coletar dados
        const dados = coletarDadosParaResultados();
        
        // Calcular métricas financeiras
        const metricas = calcularMetricasFinanceiras(dados);
        
        // Atualizar interface
        atualizarInterfaceResultados(metricas, dados);
        
        // Atualizar gráficos
        atualizarGraficosResultados(metricas, dados);
        
        // Gerar análise financeira
        gerarAnaliseFinanceira(metricas, dados);
        
        // Salvar nos dados globais
        dadosNegocio.resultados = {
            ...metricas,
            dadosCalculo: dados,
            timestamp: new Date().toISOString()
        };
        
        console.log('✅ Resultados calculados com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao calcular resultados:', error);
        mostrarToast('Erro ao calcular resultados financeiros', 'error');
    }
}

function validarDadosParaResultados() {
    const custos = dadosNegocio.custos;
    const preco = parseFloat(document.getElementById('precoVendaFinal')?.value);
    
    if (!custos || !custos.totalUnitario || custos.totalUnitario <= 0) {
        return false;
    }
    
    if (!preco || preco <= 0) {
        return false;
    }
    
    return true;
}

function coletarDadosParaResultados() {
    const custos = dadosNegocio.custos;
    const preco = parseFloat(document.getElementById('precoVendaFinal')?.value) || 0;
    const qtdMensal = custos.qtdMensal || 100;
    const desconto = parseFloat(document.getElementById('descontoPromocional')?.value) || 0;
    
    return {
        preco,
        precoComDesconto: preco * (1 - desconto/100),
        qtdMensal,
        custoUnitario: custos.totalUnitario,
        custoFixoMensal: custos.fixoMensal,
        custoVariavelUnitario: custos.variavelUnitario,
        percentuaisVenda: custos.percentuaisVenda || 0
    };
}

function calcularMetricasFinanceiras(dados) {
    // Receita
    const receitaBruta = dados.precoComDesconto * dados.qtdMensal;
    
    // Custos
    const custoProdutosVendidos = dados.custoUnitario * dados.qtdMensal;
    
    // Impostos e taxas (estimados detalhados)
    const impostos = receitaBruta * 0.07; // 7% estimado
    const taxas = receitaBruta * (dados.percentuaisVenda || 0.15);
    
    // Lucros
    const lucroBruto = receitaBruta - custoProdutosVendidos;
    const lucroOperacional = lucroBruto - dados.custoFixoMensal;
    const lucroLiquido = lucroOperacional - impostos - taxas;
    
    // Margens
    const margemBruta = (lucroBruto / receitaBruta) * 100;
    const margemOperacional = (lucroOperacional / receitaBruta) * 100;
    const margemLiquida = (lucroLiquido / receitaBruta) * 100;
    
    // Ponto de equilíbrio
    const lucroUnitario = dados.precoComDesconto - dados.custoUnitario;
    const pontoEquilibrioUnidades = lucroUnitario > 0 ? 
        Math.ceil(dados.custoFixoMensal / lucroUnitario) : Infinity;
    const pontoEquilibrioFinanceiro = pontoEquilibrioUnidades * dados.precoComDesconto;
    
    // Rentabilidade
    const investimentoInicial = dados.custoFixoMensal * 3; // Estimativa
    const roiAnual = investimentoInicial > 0 ? (lucroLiquido * 12 / investimentoInicial) * 100 : 0;
    const paybackMeses = lucroLiquido > 0 ? (investimentoInicial / lucroLiquido) : Infinity;
    
    // Break-even em dias
    const diasBreakEven = pontoEquilibrioUnidades / dados.qtdMensal * 30;
    
    return {
        receitaBruta,
        custoProdutosVendidos,
        impostos,
        taxas,
        lucroBruto,
        lucroOperacional,
        lucroLiquido,
        margemBruta,
        margemOperacional,
        margemLiquida,
        pontoEquilibrioUnidades,
        pontoEquilibrioFinanceiro,
        lucroUnitario,
        investimentoInicial,
        roiAnual,
        paybackMeses,
        diasBreakEven
    };
}

function atualizarInterfaceResultados(metricas, dados) {
    // KPIs principais
    atualizarElementoTexto('kpiFaturamento', formatarMoeda(metricas.receitaBruta));
    atualizarElementoTexto('kpiLucro', formatarMoeda(metricas.lucroLiquido));
    atualizarElementoTexto('kpiMargem', `${metricas.margemLiquida.toFixed(1)}%`);
    atualizarElementoTexto('kpiPontoEquilibrio', metricas.pontoEquilibrioUnidades);
    
    // KPIs secundários
    atualizarElementoTexto('kpiROI', `${metricas.roiAnual.toFixed(1)}%`);
    atualizarElementoTexto('kpiPayback', `${metricas.paybackMeses.toFixed(1)} meses`);
    atualizarElementoTexto('kpiLucroUnitario', formatarMoeda(metricas.lucroUnitario));
    atualizarElementoTexto('kpiBreakEvenDias', `${metricas.diasBreakEven.toFixed(1)} dias`);
    
    // Demonstração de resultados detalhada
    atualizarDemonstracaoResultados(metricas, dados);
    
    // Análise de ponto de equilíbrio
    atualizarAnalisePontoEquilibrio(metricas, dados);
}

function atualizarDemonstracaoResultados(metricas, dados) {
    const elementos = {
        'dresReceitaBruta': metricas.receitaBruta,
        'dresCustoMercadorias': metricas.custoProdutosVendidos,
        'dresLucroBruto': metricas.lucroBruto,
        'dresDespesasFixas': dados.custoFixoMensal,
        'dresLucroOperacional': metricas.lucroOperacional,
        'dresImpostos': metricas.impostos,
        'dresTaxas': metricas.taxas,
        'dresLucroLiquido': metricas.lucroLiquido,
        'dresMargemLucro': metricas.margemLiquida
    };
    
    Object.entries(elementos).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            if (id === 'dresMargemLucro') {
                elemento.textContent = `${valor.toFixed(1)}%`;
                
                // Colorir baseado na margem
                if (valor < 10) elemento.className = 'font-bold text-red-600 dark:text-red-400';
                else if (valor < 20) elemento.className = 'font-bold text-yellow-600 dark:text-yellow-400';
                else elemento.className = 'font-bold text-green-600 dark:text-green-400';
            } else {
                elemento.textContent = formatarMoeda(valor);
            }
        }
    });
}

function atualizarAnalisePontoEquilibrio(metricas, dados) {
    const elementos = {
        'analisePontoEquilibrioUn': metricas.pontoEquilibrioUnidades,
        'analisePontoEquilibrioFinanceiro': metricas.pontoEquilibrioFinanceiro,
        'analiseDiasBreakEven': metricas.diasBreakEven.toFixed(1)
    };
    
    Object.entries(elementos).forEach(([id, valor]) => {
        atualizarElementoTexto(id, id.includes('Financeiro') ? formatarMoeda(valor) : valor);
    });
    
    // Calcular percentual da capacidade
    const percentualCapacidade = dados.qtdMensal > 0 ? 
        (metricas.pontoEquilibrioUnidades / dados.qtdMensal) * 100 : 100;
    
    const elementoPercentual = document.getElementById('analisePontoEquilibrioPercent');
    if (elementoPercentual) {
        elementoPercentual.textContent = `${percentualCapacidade.toFixed(1)}% da capacidade`;
        
        // Colorir baseado no percentual
        if (percentualCapacidade > 80) {
            elementoPercentual.className = 'font-bold text-red-600 dark:text-red-400';
        } else if (percentualCapacidade > 60) {
            elementoPercentual.className = 'font-bold text-yellow-600 dark:text-yellow-400';
        } else {
            elementoPercentual.className = 'font-bold text-green-600 dark:text-green-400';
        }
    }
}

function atualizarGraficosResultados(metricas, dados) {
    // Atualizar gráficos se disponíveis
    if (window.gerenciadorGraficos) {
        window.gerenciadorGraficos.atualizarTodosGraficosComDados();
    }
    
    // Criar gráfico de composição da receita
    criarGraficoComposicaoReceita(metricas, dados);
}

function criarGraficoComposicaoReceita(metricas, dados) {
    const ctx = document.getElementById('graficoComposicaoReceita');
    if (!ctx) return;
    
    // Destruir gráfico anterior
    if (window.composicaoReceitaChart) {
        window.composicaoReceitaChart.destroy();
    }
    
    try {
        window.composicaoReceitaChart = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: [
                    'Custo dos Produtos',
                    'Custos Fixos', 
                    'Impostos e Taxas',
                    'Lucro Líquido'
                ],
                datasets: [{
                    data: [
                        metricas.custoProdutosVendidos,
                        dados.custoFixoMensal,
                        metricas.impostos + metricas.taxas,
                        metricas.lucroLiquido
                    ],
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
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: document.body.classList.contains('dark-mode') ? '#f3f4f6' : '#111827',
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
                                return `${label}: ${formatarMoeda(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Erro ao criar gráfico de composição:', error);
    }
}

function gerarAnaliseFinanceira(metricas, dados) {
    const container = document.getElementById('analiseFinanceiraDetalhada');
    if (!container) return;
    
    let pontosFortes = [];
    let pontosMelhoria = [];
    let alertas = [];
    
    // Análise de margem líquida
    if (metricas.margemLiquida > 25) {
        pontosFortes.push(`Margem líquida excelente (${metricas.margemLiquida.toFixed(1)}%)`);
    } else if (metricas.margemLiquida > 15) {
        pontosFortes.push(`Margem líquida saudável (${metricas.margemLiquida.toFixed(1)}%)`);
    } else if (metricas.margemLiquida > 5) {
        pontosMelhoria.push(`Margem líquida baixa (${metricas.margemLiquida.toFixed(1)}%). Considere aumentar preços ou reduzir custos.`);
    } else {
        alertas.push(`Margem líquida crítica (${metricas.margemLiquida.toFixed(1)}%). Risco de prejuízo!`);
    }
    
    // Análise de ponto de equilíbrio
    const percentualCapacidade = (metricas.pontoEquilibrioUnidades / dados.qtdMensal) * 100;
    if (percentualCapacidade < 50) {
        pontosFortes.push(`Ponto de equilíbrio baixo (${percentualCapacidade.toFixed(1)}% da capacidade)`);
    } else if (percentualCapacidade < 80) {
        pontosMelhoria.push(`Ponto de equilíbrio moderado (${percentualCapacidade.toFixed(1)}% da capacidade)`);
    } else {
        alertas.push(`Ponto de equilíbrio muito alto (${percentualCapacidade.toFixed(1)}% da capacidade). Risco operacional!`);
    }
    
    // Análise de ROI
    if (metricas.roiAnual > 100) {
        pontosFortes.push(`ROI excelente (${metricas.roiAnual.toFixed(1)}% ao ano)`);
    } else if (metricas.roiAnual > 50) {
        pontosFortes.push(`ROI bom (${metricas.roiAnual.toFixed(1)}% ao ano)`);
    } else if (metricas.roiAnual > 20) {
        pontosMelhoria.push(`ROI moderado (${metricas.roiAnual.toFixed(1)}% ao ano). Busque eficiência.`);
    } else {
        alertas.push(`ROI baixo (${metricas.roiAnual.toFixed(1)}% ao ano). Reavalie o negócio.`);
    }
    
    // Análise de payback
    if (metricas.paybackMeses < 12) {
        pontosFortes.push(`Payback rápido (${metricas.paybackMeses.toFixed(1)} meses)`);
    } else if (metricas.paybackMeses < 24) {
        pontosMelhoria.push(`Payback moderado (${metricas.paybackMeses.toFixed(1)} meses)`);
    } else {
        alertas.push(`Payback longo (${metricas.paybackMeses.toFixed(1)} meses). Alto risco.`);
    }
    
    // Renderizar análise
    let html = '<div class="space-y-4">';
    
    if (alertas.length > 0) {
        html += `
            <div class="p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded">
                <div class="font-bold text-red-700 dark:text-red-400 mb-2">⚠️ ALERTAS CRÍTICOS</div>
                <ul class="space-y-1">
                    ${alertas.map(alerta => `<li class="text-sm">• ${alerta}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    if (pontosFortes.length > 0) {
        html += `
            <div class="p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded">
                <div class="font-bold text-green-700 dark:text-green-400 mb-2">✅ PONTOS FORTES</div>
                <ul class="space-y-1">
                    ${pontosFortes.map(ponto => `<li class="text-sm">• ${ponto}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    if (pontosMelhoria.length > 0) {
        html += `
            <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
                <div class="font-bold text-yellow-700 dark:text-yellow-400 mb-2">📈 OPORTUNIDADES DE MELHORIA</div>
                <ul class="space-y-1">
                    ${pontosMelhoria.map(ponto => `<li class="text-sm">• ${ponto}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
    container.classList.remove('hidden');
}

// ==================== FUNÇÕES DA TAB PROJEÇÕES ====================

function atualizarProjecoes() {
    try {
        console.log('🔮 Atualizando projeções...');
        
        // Validar dados necessários
        if (!dadosNegocio.resultados) {
            mostrarToast('Calcule os resultados primeiro!', 'warning');
            return;
        }
        
        // Coletar parâmetros de projeção
        const parametros = coletarParametrosProjecao();
        
        // Validar parâmetros
        if (!validarParametrosProjecao(parametros)) {
            return;
        }
        
        // Gerar projeções
        const projecoes = gerarProjecoes(parametros);
        
        // Atualizar interface
        atualizarInterfaceProjecoes(projecoes, parametros);
        
        // Atualizar gráficos
        if (window.gerenciadorGraficos) {
            window.gerenciadorGraficos.atualizarProjecoes(
                projecoes.meses,
                projecoes.receitas,
                projecoes.lucros
            );
        }
        
        // Gerar análise das projeções
        gerarAnaliseProjecoes(projecoes, parametros);
        
        console.log('✅ Projeções atualizadas!');
        
    } catch (error) {
        console.error('❌ Erro ao atualizar projeções:', error);
        mostrarToast('Erro ao calcular projeções', 'error');
    }
}

function coletarParametrosProjecao() {
    const resultados = dadosNegocio.resultados;
    
    return {
        horizonte: parseInt(document.getElementById('horizonteProjecao')?.value) || 12,
        cenario: document.getElementById('cenarioBase')?.value || 'realista',
        taxaCrescimento: parseFloat(document.getElementById('taxaCrescimentoProjecao')?.value) || 5,
        investimentoAdicional: parseFloat(document.getElementById('investimentoAdicional')?.value) || 0,
        melhoriaEficiencia: parseFloat(document.getElementById('melhoriaEficiencia')?.value) || 0,
        
        // Dados base
        receitaBase: resultados.receitaBruta || 0,
        margemBase: resultados.margemLiquida || 0,
        custoFixoBase: dadosNegocio.custos.fixoMensal || 0
    };
}

function validarParametrosProjecao(parametros) {
    if (parametros.horizonte < 1 || parametros.horizonte > 60) {
        mostrarToast('Horizonte deve estar entre 1 e 60 meses', 'warning');
        return false;
    }
    
    if (parametros.taxaCrescimento < 0 || parametros.taxaCrescimento > 100) {
        mostrarToast('Taxa de crescimento deve estar entre 0% e 100%', 'warning');
        return false;
    }
    
    if (parametros.receitaBase <= 0) {
        mostrarToast('Calcule os resultados primeiro para ter uma base', 'warning');
        return false;
    }
    
    return true;
}

function gerarProjecoes(parametros) {
    const meses = [];
    const receitas = [];
    const custosFixos = [];
    const lucros = [];
    const margens = [];
    
    let receitaAtual = parametros.receitaBase;
    let margemAtual = parametros.margemBase;
    let custoFixoAtual = parametros.custoFixoBase;
    
    // Aplicar fator do cenário
    const fatoresCenario = {
        'otimista': 1.2,
        'realista': 1.0,
        'pessimista': 0.8
    };
    
    const fatorCenario = fatoresCenario[parametros.cenario] || 1.0;
    receitaAtual *= fatorCenario;
    
    // Aplicar melhoria de eficiência à margem
    margemAtual += parametros.melhoriaEficiencia;
    
    // Gerar dados para cada mês
    for (let i = 0; i < parametros.horizonte; i++) {
        meses.push(`Mês ${i + 1}`);
        
        // Receita do mês
        receitas.push(receitaAtual);
        
        // Custo fixo (com possíveis aumentos a cada 12 meses)
        if (i > 0 && i % 12 === 0) {
            custoFixoAtual *= 1.05; // Aumento de 5% ao ano
        }
        custosFixos.push(custoFixoAtual);
        
        // Lucro do mês (considerando custo variável proporcional)
        const custoVariavel = receitaAtual * (1 - margemAtual/100) - custoFixoAtual;
        const lucro = receitaAtual - custoVariavel - custoFixoAtual;
        lucros.push(Math.max(0, lucro));
        
        // Margem do mês
        margens.push(margemAtual);
        
        // Crescimento para próximo mês
        receitaAtual *= (1 + parametros.taxaCrescimento/100);
        
        // Melhoria gradual da margem em cenário otimista
        if (parametros.cenario === 'otimista') {
            margemAtual += 0.1;
        } else if (parametros.cenario === 'pessimista') {
            margemAtual -= 0.05;
        }
    }
    
    return {
        meses,
        receitas,
        custosFixos,
        lucros,
        margens,
        totalReceita: receitas.reduce((a, b) => a + b, 0),
        totalLucro: lucros.reduce((a, b) => a + b, 0),
        mediaMargem: margens.reduce((a, b) => a + b, 0) / margens.length
    };
}

function atualizarInterfaceProjecoes(projecoes, parametros) {
    // Atualizar métricas principais
    atualizarElementoTexto('projecaoTotalReceita', formatarMoeda(projecoes.totalReceita));
    atualizarElementoTexto('projecaoTotalLucro', formatarMoeda(projecoes.totalLucro));
    atualizarElementoTexto('projecaoMediaMargem', `${projecoes.mediaMargem.toFixed(1)}%`);
    
    // Atualizar pontos específicos
    if (parametros.horizonte >= 3) {
        atualizarElementoTexto('metaTrimestre1', formatarMoeda(projecoes.receitas[2]));
        atualizarElementoTexto('lucroTrimestre1', formatarMoeda(projecoes.lucros[2]));
    }
    
    if (parametros.horizonte >= 6) {
        atualizarElementoTexto('metaTrimestre2', formatarMoeda(projecoes.receitas[5]));
        atualizarElementoTexto('lucroTrimestre2', formatarMoeda(projecoes.lucros[5]));
    }
    
    if (parametros.horizonte >= 12) {
        atualizarElementoTexto('metaAnual', formatarMoeda(projecoes.receitas[11]));
        atualizarElementoTexto('lucroAnual', formatarMoeda(projecoes.lucros[11]));
    }
    
    // Atualizar resumo da projeção
    const resumo = document.getElementById('resumoProjecao');
    if (resumo) {
        resumo.innerHTML = `
            <div class="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                <h4 class="font-bold text-blue-900 dark:text-blue-300 mb-3">📊 Resumo da Projeção</h4>
                
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">Cenário</div>
                        <div class="font-medium">${parametros.cenario.toUpperCase()}</div>
                    </div>
                    
                    <div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">Horizonte</div>
                        <div class="font-medium">${parametros.horizonte} meses</div>
                    </div>
                    
                    <div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">Crescimento Mensal</div>
                        <div class="font-medium">${parametros.taxaCrescimento}%</div>
                    </div>
                    
                    <div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">Margem Média</div>
                        <div class="font-medium">${projecoes.mediaMargem.toFixed(1)}%</div>
                    </div>
                </div>
            </div>
        `;
    }
}

function gerarAnaliseProjecoes(projecoes, parametros) {
    const container = document.getElementById('analiseProjecoes');
    if (!container) return;
    
    let pontosAnalise = [];
    let recomendacoes = [];
    
    // Análise de crescimento
    const crescimentoTotal = ((projecoes.receitas[projecoes.receitas.length - 1] - projecoes.receitas[0]) / projecoes.receitas[0]) * 100;
    
    if (crescimentoTotal > 100) {
        pontosAnalise.push(`Crescimento forte: ${crescimentoTotal.toFixed(1)}% no período`);
    } else if (crescimentoTotal > 50) {
        pontosAnalise.push(`Crescimento moderado: ${crescimentoTotal.toFixed(1)}% no período`);
    } else {
        pontosAnalise.push(`Crescimento conservador: ${crescimentoTotal.toFixed(1)}% no período`);
    }
    
    // Análise de lucratividade
    const lucroPorReceita = (projecoes.totalLucro / projecoes.totalReceita) * 100;
    
    if (lucroPorReceita > 20) {
        pontosAnalise.push(`Lucratividade excelente: ${lucroPorReceita.toFixed(1)}% da receita`);
    } else if (lucroPorReceita > 10) {
        pontosAnalise.push(`Lucratividade boa: ${lucroPorReceita.toFixed(1)}% da receita`);
    } else {
        pontosAnalise.push(`Lucratividade baixa: ${lucroPorReceita.toFixed(1)}% da receita`);
    }
    
    // Análise de consistência
    const variacaoLucros = calcularVariacao(projecoes.lucros);
    
    if (variacaoLucros < 15) {
        pontosAnalise.push(`Lucros consistentes (variação de ${variacaoLucros.toFixed(1)}%)`);
    } else if (variacaoLucros < 30) {
        pontosAnalise.push(`Lucros variáveis (variação de ${variacaoLucros.toFixed(1)}%)`);
    } else {
        pontosAnalise.push(`Lucros muito voláteis (variação de ${variacaoLucros.toFixed(1)}%)`);
        recomendacoes.push('Diversifique receitas para reduzir volatilidade');
    }
    
    // Recomendações baseadas no cenário
    if (parametros.cenario === 'otimista') {
        recomendacoes.push('Cenário otimista - Mantenha plano de contingência');
    } else if (parametros.cenario === 'pessimista') {
        recomendacoes.push('Cenário pessimista - Construa reserva financeira');
    }
    
    // Recomendações baseadas no crescimento
    if (parametros.taxaCrescimento > 10) {
        recomendacoes.push('Crescimento acelerado - Planeje capacidade operacional');
    } else if (parametros.taxaCrescimento < 3) {
        recomendacoes.push('Crescimento lento - Busque novas oportunidades de mercado');
    }
    
    // Renderizar análise
    container.innerHTML = `
        <div class="space-y-4">
            <div class="p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
                <div class="font-bold text-blue-700 dark:text-blue-400 mb-2">📈 ANÁLISE DAS PROJEÇÕES</div>
                <ul class="space-y-1">
                    ${pontosAnalise.map(ponto => `<li class="text-sm">• ${ponto}</li>`).join('')}
                </ul>
            </div>
            
            ${recomendacoes.length > 0 ? `
                <div class="p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded">
                    <div class="font-bold text-green-700 dark:text-green-400 mb-2">🎯 RECOMENDAÇÕES</div>
                    <ul class="space-y-1">
                        ${recomendacoes.map(rec => `<li class="text-sm">• ${rec}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
    `;
    
    container.classList.remove('hidden');
}

function calcularVariacao(array) {
    if (array.length < 2) return 0;
    
    const max = Math.max(...array);
    const min = Math.min(...array);
    const media = array.reduce((a, b) => a + b, 0) / array.length;
    
    return ((max - min) / media) * 100;
}

// ==================== SIMULAÇÃO DE CENÁRIOS ====================

function simularCenario(cenario) {
    // Salvar configuração atual
    const configAtual = {
        horizonte: document.getElementById('horizonteProjecao')?.value,
        taxaCrescimento: document.getElementById('taxaCrescimentoProjecao')?.value,
        cenarioBase: document.getElementById('cenarioBase')?.value
    };
    
    // Aplicar configurações do cenário
    const cenarios = {
        'crescimento_rapido': {
            horizonte: 24,
            taxaCrescimento: 15,
            cenarioBase: 'otimista'
        },
        'estabilidade': {
            horizonte: 12,
            taxaCrescimento: 5,
            cenarioBase: 'realista'
        },
        'crise': {
            horizonte: 12,
            taxaCrescimento: -5,
            cenarioBase: 'pessimista'
        }
    };
    
    const configCenario = cenarios[cenario];
    if (!configCenario) return;
    
    // Aplicar configurações
    document.getElementById('horizonteProjecao').value = configCenario.horizonte;
    document.getElementById('taxaCrescimentoProjecao').value = configCenario.taxaCrescimento;
    document.getElementById('cenarioBase').value = configCenario.cenarioBase;
    
    // Atualizar projeções
    atualizarProjecoes();
    
    // Mostrar explicação do cenário
    const explicacoes = {
        'crescimento_rapido': 'Cenário de crescimento acelerado - Ideal para negócios com alta demanda',
        'estabilidade': 'Cenário de estabilidade - Crescimento moderado e sustentável',
        'crise': 'Cenário de crise - Preparação para períodos difíceis'
    };
    
    mostrarToast(`Cenário aplicado: ${explicacoes[cenario]}`, 'info');
    
    // Restaurar configurações após 10 segundos
    setTimeout(() => {
        if (document.getElementById('horizonteProjecao')) {
            document.getElementById('horizonteProjecao').value = configAtual.horizonte;
            document.getElementById('taxaCrescimentoProjecao').value = configAtual.taxaCrescimento;
            document.getElementById('cenarioBase').value = configAtual.cenarioBase;
        }
    }, 10000);
}

// ==================== EXPOSIÇÃO DE FUNÇÕES ====================

window.calcularResultados = calcularResultados;
window.atualizarProjecoes = atualizarProjecoes;
window.simularCenario = simularCenario;
// ==================== SISTEMA DE RECOMENDAÇÕES INTELIGENTES ====================

function gerarRecomendacoes() {
    try {
        console.log('🤖 Gerando recomendações inteligentes...');
        
        // Validar se temos dados suficientes
        if (!validarDadosParaRecomendacoes()) {
            mostrarToast('Complete a análise para ver recomendações personalizadas', 'warning');
            return;
        }
        
        // Coletar dados para análise
        const dadosAnalise = coletarDadosParaRecomendacoes();
        
        // Gerar recomendações por categoria
        const recomendacoes = {
            precificacao: gerarRecomendacoesPrecificacao(dadosAnalise),
            custos: gerarRecomendacoesCustos(dadosAnalise),
            mercado: gerarRecomendacoesMercado(dadosAnalise),
            crescimento: gerarRecomendacoesCrescimento(dadosAnalise),
            gestao: gerarRecomendacoesGestao(dadosAnalise)
        };
        
        // Classificar por prioridade
        const recomendacoesClassificadas = classificarRecomendacoesPorPrioridade(recomendacoes);
        
        // Atualizar interface
        atualizarInterfaceRecomendacoes(recomendacoesClassificadas, dadosAnalise);
        
        // Gerar plano de ação 30 dias
        gerarPlanoAcao30Dias(dadosAnalise);
        
        // Calcular pontuação de maturidade
        calcularPontuacaoMaturidade(dadosAnalise);
        
        console.log('✅ Recomendações geradas com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao gerar recomendações:', error);
        mostrarToast('Erro ao gerar recomendações', 'error');
    }
}

function validarDadosParaRecomendacoes() {
    const dadosMinimos = [
        dadosNegocio.empresa.setor,
        dadosNegocio.custos?.totalUnitario,
        dadosNegocio.resultados?.margemLiquida
    ];
    
    return dadosMinimos.every(dado => dado !== undefined && dado !== null && dado !== '');
}

function coletarDadosParaRecomendacoes() {
    const resultados = dadosNegocio.resultados || {};
    const custos = dadosNegocio.custos || {};
    const empresa = dadosNegocio.empresa || {};
    const meta = dadosNegocio.meta || {};
    
    // Coletar preço de concorrência se disponível
    const precoMinConcorrencia = parseFloat(document.getElementById('precoMinConcorrencia')?.value) || 0;
    const precoMedioConcorrencia = parseFloat(document.getElementById('precoMedioConcorrencia')?.value) || 0;
    
    return {
        // Dados básicos
        setor: empresa.setor,
        tempoMercado: empresa.tempoMercado,
        
        // Métricas financeiras
        margemLiquida: resultados.margemLiquida || 0,
        pontoEquilibrio: resultados.pontoEquilibrioUnidades || 0,
        roi: resultados.roiAnual || 0,
        payback: resultados.paybackMeses || 0,
        
        // Custos
        proporcaoFixos: custos.fixoMensal > 0 ? (custos.fixoMensal / custos.totalMensal * 100) : 0,
        custoUnitario: custos.totalUnitario || 0,
        custoFixoMensal: custos.fixoMensal || 0,
        
        // Preços
        precoAtual: parseFloat(document.getElementById('precoVendaFinal')?.value) || 0,
        precoMedioConcorrencia,
        diferencaConcorrencia: precoMedioConcorrencia > 0 ? 
            ((parseFloat(document.getElementById('precoVendaFinal')?.value) || 0) - precoMedioConcorrencia) / precoMedioConcorrencia * 100 : 0,
        
        // Capacidade
        qtdMensal: meta.qtdMensal || 100,
        capacidadeUtilizacao: resultados.pontoEquilibrioUnidades > 0 ? 
            (meta.qtdMensal / resultados.pontoEquilibrioUnidades * 100) : 0,
        
        // Valor percebido
        valorPercebido: parseFloat(document.getElementById('valorPercebidoScore')?.textContent) || 5,
        
        // Sazonalidade
        sazonalidade: document.getElementById('sazonalidade')?.value || 'constante'
    };
}

function gerarRecomendacoesPrecificacao(dados) {
    const recomendacoes = [];
    const margem = dados.margemLiquida;
    const diferencaConcorrencia = dados.diferencaConcorrencia;
    const valorPercebido = dados.valorPercebido;
    
    // Análise de margem
    if (margem < 10) {
        recomendacoes.push({
            texto: '🚨 AUMENTE O PREÇO URGENTEMENTE - Margem crítica (<10%)',
            detalhe: `Sua margem líquida atual é ${margem.toFixed(1)}%. Aumente o preço em 15-20% para atingir pelo menos 20% de margem.`,
            prioridade: 'alta',
            acao: 'aumentar_preco_20',
            impacto: 'alto'
        });
    } else if (margem < 20) {
        recomendacoes.push({
            texto: '📈 CONSIDERE AUMENTO DE PREÇO - Margem baixa',
            detalhe: `Margem de ${margem.toFixed(1)}% está abaixo do ideal para o setor ${dados.setor}. Teste um aumento de 10%.`,
            prioridade: 'media',
            acao: 'aumentar_preco_10',
            impacto: 'medio'
        });
    }
    
    // Análise vs concorrência
    if (diferencaConcorrencia > 30 && margem > 40) {
        recomendacoes.push({
            texto: '💎 VOCÊ TEM ESPAÇO PARA SER PREMIUM',
            detalhe: 'Seu preço está significativamente acima da concorrência com boa margem. Consolide posicionamento premium.',
            prioridade: 'baixa',
            acao: 'posicionamento_premium',
            impacto: 'medio'
        });
    } else if (diferencaConcorrencia < -20) {
        recomendacoes.push({
            texto: '💰 PREÇO MUITO BAIXO - Deixando lucro na mesa',
            detalhe: `Você está ${Math.abs(diferencaConcorrencia).toFixed(1)}% abaixo da concorrência. Aumente preço gradualmente.`,
            prioridade: 'alta',
            acao: 'aumentar_preco_gradual',
            impacto: 'alto'
        });
    }
    
    // Análise de valor percebido
    if (valorPercebido >= 8 && diferencaConcorrencia < 10) {
        recomendacoes.push({
            texto: '🎯 AUMENTE PREÇO BASEADO NO VALOR PERCEBIDO',
            detalhe: 'Clientes percebem alto valor no seu produto. Você pode aumentar preços sem perder competitividade.',
            prioridade: 'media',
            acao: 'aumentar_comunicacao_valor',
            impacto: 'alto'
        });
    }
    
    // Recomendação de estratégia psicológica
    const precoAtual = dados.precoAtual;
    const parteDecimal = precoAtual - Math.floor(precoAtual);
    
    if (parteDecimal < 0.9 && precoAtual < 100) {
        recomendacoes.push({
            texto: '🧠 APLIQUE PREÇO PSICOLÓGICO .99',
            detalhe: `Mude R$ ${precoAtual.toFixed(2)} para R$ ${Math.floor(precoAtual) + 0.99}. Aumenta percepção de valor.`,
            prioridade: 'baixa',
            acao: 'aplicar_preco_99',
            impacto: 'baixo'
        });
    }
    
    return recomendacoes;
}

function gerarRecomendacoesCustos(dados) {
    const recomendacoes = [];
    const proporcaoFixos = dados.proporcaoFixos;
    const custoUnitario = dados.custoUnitario;
    
    // Análise de custos fixos
    if (proporcaoFixos > 60) {
        recomendacoes.push({
            texto: '⚡ REDUZA CUSTOS FIXOS URGENTE',
            detalhe: `${proporcaoFixos.toFixed(1)}% dos custos são fixos. Renegocie aluguel, reduza softwares, considere home office.`,
            prioridade: 'alta',
            acao: 'renegociar_custos_fixos',
            impacto: 'alto'
        });
    } else if (proporcaoFixos > 40) {
        recomendacoes.push({
            texto: '📊 OTIMIZE CUSTOS FIXOS',
            detalhe: `Custos fixos representam ${proporcaoFixos.toFixed(1)}% do total. Busque eficiência operacional.`,
            prioridade: 'media',
            acao: 'otimizar_processos',
            impacto: 'medio'
        });
    }
    
    // Análise de DAS proporcional
    const das = 70.90;
    const proporcaoDas = dados.custoFixoMensal > 0 ? (das / dados.custoFixoMensal * 100) : 0;
    
    if (proporcaoDas > 15) {
        recomendacoes.push({
            texto: '🏢 AUMENTE FATURAMENTO PARA DILUIR DAS',
            detalhe: `DAS representa ${proporcaoDas.toFixed(1)}% dos custos fixos. Aumente produção/vendas para diluir este custo.`,
            prioridade: 'media',
            acao: 'aumentar_faturamento',
            impacto: 'medio'
        });
    }
    
    // Análise por setor específico
    if (dados.setor === 'alimentacao' && custoUnitario > 15) {
        recomendacoes.push({
            texto: '🍕 CONTROLE CUSTOS DE MATÉRIA-PRIMA',
            detalhe: 'Custo unitário elevado para alimentação. Negocie com fornecedores, otimize porções.',
            prioridade: 'alta',
            acao: 'negociar_fornecedores',
            impacto: 'alto'
        });
    }
    
    if (dados.setor === 'servicos' && dados.custoFixoMensal > 3000) {
        recomendacoes.push({
            texto: '🔧 REDUZA CUSTOS OPERACIONAIS',
            detalhe: 'Custos fixos altos para serviços. Automatize processos, use ferramentas gratuitas.',
            prioridade: 'media',
            acao: 'automatizar_processos',
            impacto: 'medio'
        });
    }
    
    return recomendacoes;
}

function gerarRecomendacoesMercado(dados) {
    const recomendacoes = [];
    const diferencaConcorrencia = dados.diferencaConcorrencia;
    const valorPercebido = dados.valorPercebido;
    const setor = dados.setor;
    
    // Posicionamento competitivo
    if (diferencaConcorrencia > 20 && valorPercebido < 6) {
        recomendacoes.push({
            texto: '⚠️ PREÇO ALTO SEM JUSTIFICATIVA',
            detalhe: 'Você cobra mais que concorrência mas não comunica valor suficiente. Melhore marketing.',
            prioridade: 'alta',
            acao: 'melhorar_comunicacao',
            impacto: 'alto'
        });
    } else if (diferencaConcorrencia < -10 && valorPercebido > 7) {
        recomendacoes.push({
            texto: '💡 COMUNIQUE MELHOR SEU VALOR',
            detalhe: 'Cliente percebe alto valor, mas preço está abaixo. Comunique diferenciais para aumentar preço.',
            prioridade: 'media',
            acao: 'destaque_diferenciais',
            impacto: 'medio'
        });
    }
    
    // Recomendações por setor
    const recomendacoesSetor = {
        'alimentacao': {
            texto: '🍽️ OFEREÇA COMBOS E PACOTES',
            detalhe: 'Aumente ticket médio com combos familiares ou pacotes semanais.',
            prioridade: 'media',
            acao: 'criar_combos',
            impacto: 'medio'
        },
        'moda': {
            texto: '👗 TRABALHE COM EDIÇÕES LIMITADAS',
            detalhe: 'Crie coleções exclusivas para justificar preços premium.',
            prioridade: 'baixa',
            acao: 'edicoes_limitadas',
            impacto: 'medio'
        },
        'servicos': {
            texto: '🛠️ CRIE PACOTES DE MANUTENÇÃO',
            detalhe: 'Ofereça pacotes mensais ou anuais para receita recorrente.',
            prioridade: 'alta',
            acao: 'pacotes_recorrentes',
            impacto: 'alto'
        },
        'consultoria': {
            texto: '📊 OFEREÇA ASSINATURAS',
            detalhe: 'Transfira modelo de projeto único para assinatura mensal.',
            prioridade: 'alta',
            acao: 'modelo_assinatura',
            impacto: 'alto'
        }
    };
    
    if (recomendacoesSetor[setor]) {
        recomendacoes.push(recomendacoesSetor[setor]);
    }
    
    // Sazonalidade
    if (dados.sazonalidade !== 'constante') {
        recomendacoes.push({
            texto: '📅 PLANEJE PARA SAZONALIDADE',
            detalhe: `Seu negócio é sazonal (${dados.sazonalidade}). Crie reserva financeira para baixa temporada.`,
            prioridade: 'media',
            acao: 'planejamento_sazonal',
            impacto: 'medio'
        });
    }
    
    return recomendacoes;
}

function gerarRecomendacoesCrescimento(dados) {
    const recomendacoes = [];
    const roi = dados.roi;
    const payback = dados.payback;
    const capacidadeUtilizacao = dados.capacidadeUtilizacao;
    
    // Análise de ROI
    if (roi > 100) {
        recomendacoes.push({
            texto: '🚀 REINVISTA PARTE DO LUCRO',
            detalhe: `ROI excelente de ${roi.toFixed(1)}%. Reinvesta 30% do lucro para acelerar crescimento.`,
            prioridade: 'media',
            acao: 'reinvestir_lucro',
            impacto: 'alto'
        });
    } else if (roi < 20) {
        recomendacoes.push({
            texto: '📉 OTIMIZE INVESTIMENTOS',
            detalhe: `ROI baixo de ${roi.toFixed(1)}%. Foque em eficiência antes de novos investimentos.`,
            prioridade: 'alta',
            acao: 'otimizar_investimentos',
            impacto: 'alto'
        });
    }
    
    // Análise de payback
    if (payback > 36) {
        recomendacoes.push({
            texto: '⏳ PAYBACK MUITO LONGO',
            detalhe: `Levará ${payback.toFixed(0)} meses para recuperar investimento. Reavalie custos e preços.`,
            prioridade: 'alta',
            acao: 'revisar_viabilidade',
            impacto: 'alto'
        });
    }
    
    // Análise de capacidade
    if (capacidadeUtilizacao < 60) {
        recomendacoes.push({
            texto: '🏭 AUMENTE CAPACIDADE DE PRODUÇÃO',
            detalhe: `Você utiliza apenas ${capacidadeUtilizacao.toFixed(1)}% da capacidade. Busque mais clientes.`,
            prioridade: 'media',
            acao: 'buscar_novos_clientes',
            impacto: 'medio'
        });
    } else if (capacidadeUtilizacao > 90) {
        recomendacoes.push({
            texto: '⚡ EXPANDA CAPACIDADE',
            detalhe: `Capacidade quase esgotada (${capacidadeUtilizacao.toFixed(1)}%). Planeje expansão.`,
            prioridade: 'alta',
            acao: 'planejar_expansao',
            impacto: 'alto'
        });
    }
    
    // Recomendações para tempo de mercado
    if (dados.tempoMercado === 'iniciante') {
        recomendacoes.push({
            texto: '🎯 FOCALIZE EM SOBREVIVÊNCIA',
            detalhe: 'Como iniciante, foque em fluxo de caixa e cliente mínimo viável.',
            prioridade: 'alta',
            acao: 'foco_sobrevivencia',
            impacto: 'alto'
        });
    } else if (dados.tempoMercado === 'consolidado' || dados.tempoMercado === 'experiente') {
        recomendacoes.push({
            texto: '🏆 DIVERSIFIQUE RECEITAS',
            detalhe: 'Negócio consolidado. Crie novas fontes de receita e produtos.',
            prioridade: 'media',
            acao: 'diversificar_receitas',
            impacto: 'medio'
        });
    }
    
    return recomendacoes;
}

function gerarRecomendacoesGestao(dados) {
    const recomendacoes = [];
    const setor = dados.setor;
    
    // Recomendações gerais de gestão
    recomendacoes.push({
        texto: '📊 MONITORE INDICADORES MENSALMENTE',
        detalhe: 'Acompanhe margens, ponto de equilíbrio e fluxo de caixa todo mês.',
        prioridade: 'alta',
        acao: 'monitorar_indicadores',
        impacto: 'alto'
    });
    
    recomendacoes.push({
        texto: '💾 SEPARE CONTAS PESSOAIS E EMPRESARIAIS',
        detalhe: 'Mantenha contas separadas para melhor controle e declaração de impostos.',
        prioridade: 'alta',
        acao: 'separar_contas',
        impacto: 'alto'
    });
    
    // Recomendações específicas por setor
    const gestaoSetor = {
        'alimentacao': [
            {
                texto: '📝 CONTROLE RIGOROSO DE ESTOQUE',
                detalhe: 'Implemente controle FIFO (First In, First Out) para reduzir perdas.',
                prioridade: 'alta',
                acao: 'controle_estoque',
                impacto: 'alto'
            },
            {
                texto: '🧾 EMITA NOTA FISCAL PARA TODAS AS VENDAS',
                detalhe: 'Fundamental para controle e obrigação legal do MEI.',
                prioridade: 'alta',
                acao: 'emitir_notas',
                impacto: 'alto'
            }
        ],
        'servicos': [
            {
                texto: '⏰ CONTROLE HORAS TRABALHADAS',
                detalhe: 'Registre todas as horas para precificação correta de serviços.',
                prioridade: 'alta',
                acao: 'controle_horas',
                impacto: 'alto'
            },
            {
                texto: '📄 TENHA CONTRATOS PADRÃO',
                detalhe: 'Proteja-se com contratos claros para todos os serviços.',
                prioridade: 'media',
                acao: 'usar_contratos',
                impacto: 'medio'
            }
        ],
        'consultoria': [
            {
                texto: '🎯 DEFINA ESCOPO CLARO DOS PROJETOS',
                detalhe: 'Evite escopo creep com definição precisa de entregáveis.',
                prioridade: 'alta',
                acao: 'definir_escopo',
                impacto: 'alto'
            }
        ]
    };
    
    if (gestaoSetor[setor]) {
        recomendacoes.push(...gestaoSetor[setor]);
    }
    
    return recomendacoes;
}

function classificarRecomendacoesPorPrioridade(recomendacoes) {
    const classificadas = {
        alta: [],
        media: [],
        baixa: []
    };
    
    // Adicionar todas as recomendações às suas categorias
    Object.values(recomendacoes).forEach(categoria => {
        categoria.forEach(rec => {
            classificadas[rec.prioridade].push(rec);
        });
    });
    
    // Limitar a quantidade por prioridade
    classificadas.alta = classificadas.alta.slice(0, 5);
    classificadas.media = classificadas.media.slice(0, 8);
    classificadas.baixa = classificadas.baixa.slice(0, 5);
    
    return classificadas;
}

function atualizarInterfaceRecomendacoes(recomendacoesClassificadas, dados) {
    // Atualizar contadores de prioridade
    atualizarElementoTexto('prioridadeAlta', recomendacoesClassificadas.alta.length);
    atualizarElementoTexto('prioridadeMedia', recomendacoesClassificadas.media.length);
    atualizarElementoTexto('prioridadeBaixa', recomendacoesClassificadas.baixa.length);
    atualizarElementoTexto('totalRecomendacoes', 
        recomendacoesClassificadas.alta.length + 
        recomendacoesClassificadas.media.length + 
        recomendacoesClassificadas.baixa.length
    );
    
    // Atualizar listas de recomendações
    atualizarListaRecomendacoes('Precificacao', recomendacoesClassificadas.alta.filter(r => r.acao.includes('preco')));
    atualizarListaRecomendacoes('Custos', recomendacoesClassificadas.alta.filter(r => r.acao.includes('custo') || r.acao.includes('fixo')));
    atualizarListaRecomendacoes('Mercado', recomendacoesClassificadas.media.filter(r => !r.acao.includes('preco') && !r.acao.includes('custo')));
    atualizarListaRecomendacoes('Crescimento', recomendacoesClassificadas.media.concat(recomendacoesClassificadas.baixa));
    
    // Adicionar resumo executivo
    adicionarResumoExecutivo(recomendacoesClassificadas, dados);
}

function atualizarListaRecomendacoes(categoria, itens) {
    const lista = document.getElementById(`recomendacoes${categoria}`);
    if (!lista) return;
    
    // Limpar lista
    lista.innerHTML = '';
    
    if (itens.length === 0) {
        const li = document.createElement('li');
        li.className = 'flex items-start p-3 bg-gray-50 dark:bg-gray-800 rounded-lg';
        li.innerHTML = `
            <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
            <div>
                <div class="font-medium text-gray-700 dark:text-gray-300">✅ Tudo em ordem!</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Nenhuma ação crítica necessária nesta área</div>
            </div>
        `;
        lista.appendChild(li);
        return;
    }
    
    // Adicionar itens
    itens.forEach((item, index) => {
        if (index >= 5) return; // Limitar a 5 itens por categoria
        
        const li = document.createElement('li');
        li.className = 'mb-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700';
        
        // Cor baseada na prioridade
        const corPrioridade = {
            'alta': 'border-l-4 border-red-500',
            'media': 'border-l-4 border-yellow-500',
            'baixa': 'border-l-4 border-green-500'
        };
        
        li.className += ` ${corPrioridade[item.prioridade] || ''}`;
        
        li.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div class="font-bold text-gray-900 dark:text-white">${item.texto}</div>
                <span class="px-2 py-1 text-xs rounded-full ${
                    item.prioridade === 'alta' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                    item.prioridade === 'media' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                }">
                    ${item.prioridade === 'alta' ? 'ALTA PRIORIDADE' : 
                      item.prioridade === 'media' ? 'MÉDIA PRIORIDADE' : 'BAIXA PRIORIDADE'}
                </span>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-3">${item.detalhe}</div>
            <div class="flex justify-between items-center text-xs">
                <span class="text-gray-500 dark:text-gray-400">Impacto: <span class="font-medium">${item.impacto.toUpperCase()}</span></span>
                <button onclick="executarAcao('${item.acao}')" 
                        class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs transition">
                    Executar ação
                </button>
            </div>
        `;
        
        lista.appendChild(li);
    });
}

function adicionarResumoExecutivo(recomendacoesClassificadas, dados) {
    const container = document.getElementById('resumoExecutivo');
    if (!container) return;
    
    const totalRecomendacoes = recomendacoesClassificadas.alta.length + 
                               recomendacoesClassificadas.media.length + 
                               recomendacoesClassificadas.baixa.length;
    
    let resumo = '';
    
    if (recomendacoesClassificadas.alta.length > 0) {
        resumo += `
            <div class="p-4 mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded">
                <div class="font-bold text-red-700 dark:text-red-400 mb-2">🚨 ATENÇÃO IMEDIATA REQUERIDA</div>
                <div class="text-sm text-red-600 dark:text-red-400">
                    Você tem <strong>${recomendacoesClassificadas.alta.length} ações de alta prioridade</strong> que precisam ser executadas imediatamente.
                    ${recomendacoesClassificadas.alta.length > 3 ? 'Recomendamos focar nas 3 primeiras.' : ''}
                </div>
            </div>
        `;
    }
    
    if (dados.margemLiquida < 15) {
        resumo += `
            <div class="p-4 mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
                <div class="font-bold text-yellow-700 dark:text-yellow-400 mb-2">📊 FOCO EM RENTABILIDADE</div>
                <div class="text-sm text-yellow-600 dark:text-yellow-400">
                    Sua margem líquida atual é <strong>${dados.margemLiquida.toFixed(1)}%</strong>. 
                    O ideal para o setor ${dados.setor} é acima de 20%. Execute as recomendações de precificação primeiro.
                </div>
            </div>
        `;
    }
    
    if (dados.roi < 30 && dados.tempoMercado !== 'iniciante') {
        resumo += `
            <div class="p-4 mb-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
                <div class="font-bold text-blue-700 dark:text-blue-400 mb-2">💡 OPORTUNIDADE DE CRESCIMENTO</div>
                <div class="text-sm text-blue-600 dark:text-blue-400">
                    ROI de ${dados.roi.toFixed(1)}% ao ano. Há espaço para melhorias na eficiência operacional.
                </div>
            </div>
        `;
    }
    
    resumo += `
        <div class="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
            <div class="font-bold text-green-900 dark:text-green-300 mb-2">🎯 PRÓXIMOS PASSOS RECOMENDADOS</div>
            <ol class="list-decimal pl-5 space-y-2 text-sm text-green-800 dark:text-green-400">
                <li>Execute todas as ações de <strong>ALTA prioridade</strong> (${recomendacoesClassificadas.alta.length})</li>
                <li>Monitore resultados por 30 dias</li>
                <li>Revise preços e custos mensalmente</li>
                <li>Agende consultoria com Brayan Contabilidade para ajustes finos</li>
            </ol>
        </div>
    `;
    
    container.innerHTML = resumo;
    container.classList.remove('hidden');
}

function executarAcao(acao) {
    const acoes = {
        'aumentar_preco_20': () => {
            const precoAtual = parseFloat(document.getElementById('precoVendaFinal')?.value) || 0;
            const novoPreco = precoAtual * 1.20;
            document.getElementById('precoVendaFinal').value = novoPreco.toFixed(2);
            atualizarPrecoFinal(novoPreco);
            mostrarToast('Preço aumentado em 20%', 'success');
        },
        'aumentar_preco_10': () => {
            const precoAtual = parseFloat(document.getElementById('precoVendaFinal')?.value) || 0;
            const novoPreco = precoAtual * 1.10;
            document.getElementById('precoVendaFinal').value = novoPreco.toFixed(2);
            atualizarPrecoFinal(novoPreco);
            mostrarToast('Preço aumentado em 10%', 'success');
        },
        'aplicar_preco_99': () => {
            aplicarPrecoPsicologico('99');
            mostrarToast('Preço psicológico .99 aplicado', 'success');
        },
        'posicionamento_premium': () => {
            openTab('precificacao');
            selecionarMetodo('valor-percebido');
            mostrarToast('Configure posicionamento premium na aba Precificação', 'info');
        },
        'renegociar_custos_fixos': () => {
            openTab('custos');
            mostrarDicaContextual('reducao_custos_fixos');
        },
        'negociar_fornecedores': () => {
            const custoAtual = parseFloat(document.getElementById('materiaPrima')?.value) || 0;
            document.getElementById('materiaPrima').value = (custoAtual * 0.9).toFixed(2);
            calcularCustos();
            mostrarToast('Custo de matéria-prima reduzido em 10% (simulação)', 'success');
        }
    };
    
    if (acoes[acao]) {
        acoes[acao]();
        
        // Recalcular tudo após ação
        setTimeout(() => {
            calcularCustos();
            calcularResultados();
            gerarRecomendacoes();
        }, 500);
    } else {
        mostrarToast('Ação não implementada', 'info');
    }
}

function gerarPlanoAcao30Dias(dados) {
    const container = document.getElementById('planoAcao30Dias');
    if (!container) return;
    
    const plano = `
        <div class="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
            <h4 class="font-bold text-purple-900 dark:text-purple-300 mb-4">📅 PLANO DE AÇÃO - PRÓXIMOS 30 DIAS</h4>
            
            <div class="space-y-4">
                <div>
                    <div class="font-medium text-gray-700 dark:text-gray-300 mb-2">SEMANA 1 - ANÁLISE E AJUSTES</div>
                    <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-green-500 mt-1 mr-2 text-xs"></i>
                            <span>Execute todas as ações de ALTA prioridade</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-green-500 mt-1 mr-2 text-xs"></i>
                            <span>Revisão completa de preços e custos</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-green-500 mt-1 mr-2 text-xs"></i>
                            <span>Contato com fornecedores para renegociação</span>
                        </li>
                    </ul>
                </div>
                
                <div>
                    <div class="font-medium text-gray-700 dark:text-gray-300 mb-2">SEMANA 2-3 - IMPLEMENTAÇÃO</div>
                    <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-blue-500 mt-1 mr-2 text-xs"></i>
                            <span>Aplicar novos preços gradativamente</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-blue-500 mt-1 mr-2 text-xs"></i>
                            <span>Otimizar processos operacionais</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-blue-500 mt-1 mr-2 text-xs"></i>
                            <span>Melhorar comunicação de valor ao cliente</span>
                        </li>
                    </ul>
                </div>
                
                <div>
                    <div class="font-medium text-gray-700 dark:text-gray-300 mb-2">SEMANA 4 - AVALIAÇÃO</div>
                    <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li class="flex items-start">
                            <i class="fas fa-chart-line text-purple-500 mt-1 mr-2 text-xs"></i>
                            <span>Analisar resultados das mudanças</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-chart-line text-purple-500 mt-1 mr-2 text-xs"></i>
                            <span>Revisar fluxo de caixa e margens</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-chart-line text-purple-500 mt-1 mr-2 text-xs"></i>
                            <span>Planejar próximo ciclo de 30 dias</span>
                        </li>
                    </ul>
                </div>
            </div>
            
            <div class="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
                <div class="text-xs text-purple-600 dark:text-purple-400">
                    💡 <strong>Dica Brayan:</strong> Execute esse plano e agende uma consulta de acompanhamento em 30 dias.
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = plano;
    container.classList.remove('hidden');
}

function calcularPontuacaoMaturidade(dados) {
    const container = document.getElementById('pontuacaoMaturidade');
    if (!container) return;
    
    let pontuacao = 50; // Base
    
    // Fatores de pontuação
    if (dados.margemLiquida >= 20) pontuacao += 15;
    else if (dados.margemLiquida >= 10) pontuacao += 5;
    else pontuacao -= 10;
    
    if (dados.proporcaoFixos <= 40) pontuacao += 10;
    else if (dados.proporcaoFixos <= 60) pontuacao += 5;
    else pontuacao -= 10;
    
    if (dados.roi >= 50) pontuacao += 10;
    else if (dados.roi >= 20) pontuacao += 5;
    
    if (dados.valorPercebido >= 7) pontuacao += 10;
    else if (dados.valorPercebido >= 5) pontuacao += 5;
    
    if (dados.tempoMercado === 'experiente') pontuacao += 10;
    else if (dados.tempoMercado === 'consolidado') pontuacao += 5;
    
    // Limitar entre 0-100
    pontuacao = Math.max(0, Math.min(100, pontuacao));
    
    // Determinar nível
    let nivel = '';
    let cor = '';
    
    if (pontuacao >= 75) {
        nivel = 'AVANÇADO';
        cor = 'text-green-600 dark:text-green-400';
    } else if (pontuacao >= 50) {
        nivel = 'INTERMEDIÁRIO';
        cor = 'text-blue-600 dark:text-blue-400';
    } else {
        nivel = 'INICIANTE';
        cor = 'text-yellow-600 dark:text-yellow-400';
    }
    
    container.innerHTML = `
        <div class="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-xl text-center">
            <div class="text-3xl font-bold ${cor} mb-2">${pontuacao}/100</div>
            <div class="font-medium text-gray-700 dark:text-gray-300 mb-1">NÍVEL DE MATURIDADE</div>
            <div class="font-bold ${cor} mb-4">${nivel}</div>
            
            <div class="h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                <div class="h-full rounded-full gradient-primary" style="width: ${pontuacao}%"></div>
            </div>
            
            <div class="text-xs text-gray-500 dark:text-gray-400">
                ${pontuacao >= 75 ? 'Excelente gestão! Continue otimizando.' : 
                 pontuacao >= 50 ? 'Bom progresso. Foque nas recomendações.' : 
                 'Há muito espaço para melhorias. Siga o plano de ação.'}
            </div>
        </div>
    `;
    
    container.classList.remove('hidden');
}

// ==================== GRÁFICOS AVANÇADOS E EXPORTAÇÃO ====================

function exportarTodosGraficos() {
    try {
        if (!window.gerenciadorGraficos) {
            mostrarToast('Gráficos não inicializados', 'warning');
            return;
        }
        
        // Mostrar loading
        const btnExportar = document.querySelector('[onclick="exportarTodosGraficos()"]');
        const textoOriginal = btnExportar.innerHTML;
        btnExportar.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Exportando...';
        btnExportar.disabled = true;
        
        // Exportar gráficos com delay para evitar sobrecarga
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
        const nomeEmpresa = dadosNegocio.empresa.nome || 'negocio';
        
        // Criar zip se tiver muitos gráficos
        if (graficosIds.length > 3) {
            mostrarToast('Preparando pacote de gráficos...', 'info');
        }
        
        graficosIds.forEach((id, index) => {
            setTimeout(() => {
                const sucesso = window.gerenciadorGraficos.exportarGraficoParaImagem(
                    id, 
                    `grafico-${nomeEmpresa.replace(/\s+/g, '-')}-${dataHoje}-${index + 1}.png`
                );
                
                if (sucesso) exportados++;
                
                // Último gráfico
                if (index === graficosIds.length - 1) {
                    setTimeout(() => {
                        btnExportar.innerHTML = textoOriginal;
                        btnExportar.disabled = false;
                        
                        if (exportados > 0) {
                            mostrarToast(`${exportados} gráficos exportados com sucesso!`, 'success');
                            
                            // Oferecer pacote completo
                            if (exportados >= 3) {
                                criarPacoteCompletoExportacao();
                            }
                        } else {
                            mostrarToast('Nenhum gráfico exportado', 'warning');
                        }
                    }, 1000);
                }
            }, index * 800); // Delay para evitar sobrecarga
        });
        
    } catch (error) {
        console.error('❌ Erro ao exportar gráficos:', error);
        mostrarToast('Erro ao exportar gráficos', 'error');
    }
}

function criarPacoteCompletoExportacao() {
    const modal = document.getElementById('modalPacoteExportacao');
    if (!modal) return;
    
    const dataHoje = new Date().toLocaleDateString('pt-BR');
    const nomeEmpresa = dadosNegocio.empresa.nome || 'Seu Negócio';
    
    modal.querySelector('#tituloPacote').textContent = `📦 Pacote Completo - ${nomeEmpresa}`;
    modal.querySelector('#dataPacote').textContent = dataHoje;
    
    // Listar conteúdos do pacote
    const conteudos = [
        '📊 Gráficos de análise financeira (8 gráficos)',
        '📈 Projeções e cenários futuros',
        '🎯 Plano de ação personalizado',
        '💰 Análise de custos detalhada',
        '🏆 Posicionamento de mercado'
    ];
    
    const lista = modal.querySelector('#listaConteudosPacote');
    lista.innerHTML = conteudos.map(item => `<li class="mb-2">${item}</li>`).join('');
    
    // Mostrar modal
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function exportarPacoteCompleto() {
    try {
        // Coletar todos os dados
        const pacote = {
            metadata: {
                empresa: dadosNegocio.empresa,
                produto: dadosNegocio.produto,
                dataExportacao: new Date().toISOString(),
                versao: '2.0'
            },
            analise: {
                custos: dadosNegocio.custos,
                resultados: dadosNegocio.resultados,
                recomendacoes: document.getElementById('resumoExecutivo')?.innerText || ''
            },
            configuracoes: {
                metodoPrecificacao: metodoPrecificacaoSelecionado,
                precoFinal: document.getElementById('precoVendaFinal')?.value,
                markupAplicado: document.getElementById('markupInput')?.value
            }
        };
        
        // Converter para JSON
        const json = JSON.stringify(pacote, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Criar link de download
        const a = document.createElement('a');
        a.href = url;
        a.download = `pacote-analise-${dadosNegocio.empresa.nome?.replace(/\s+/g, '-') || 'negocio'}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        // Fechar modal
        document.getElementById('modalPacoteExportacao').classList.add('hidden');
        
        mostrarToast('Pacote completo exportado com sucesso!', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao exportar pacote:', error);
        mostrarToast('Erro ao exportar pacote completo', 'error');
    }
}

function atualizarTodosGraficosComDados() {
    if (window.gerenciadorGraficos) {
        window.gerenciadorGraficos.atualizarTodosGraficosComDados();
        mostrarToast('Gráficos atualizados com dados atuais', 'success');
    }
}

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
        
        // Atualizar todos os gráficos
        if (window.gerenciadorGraficos.graficos) {
            // Atualizar gráfico de composição
            if (window.gerenciadorGraficos.graficos.composicaoPreco && custos && preco > 0) {
                const custoVarUnit = custos.variavelUnitario || 0;
                const custoFixoUnit = custos.fixoUnitario || 0;
                const impostos = preco * 0.07;
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
                    preco * 0.20,
                    preco * 0.05,
                    preco * 0.03
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
        }
        
        console.log('✅ Gráficos sincronizados com dados atuais');
        
    } catch (error) {
        console.error('❌ Erro ao sincronizar gráficos:', error);
    }
}

function calcularTudoCompleto() {
    try {
        // Mostrar loading
        const btnCalcular = document.querySelector('[onclick*="calcularTudoCompleto"]');
        if (btnCalcular) {
            const textoOriginal = btnCalcular.innerHTML;
            btnCalcular.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Calculando...';
            btnCalcular.disabled = true;
        }
        
        // Sequência de cálculos
        setTimeout(() => {
            calcularCustos();
        }, 300);
        
        setTimeout(() => {
            calcularResultados();
        }, 600);
        
        setTimeout(() => {
            atualizarDashboard();
        }, 900);
        
        setTimeout(() => {
            sincronizarGraficosComDados();
        }, 1200);
        
        setTimeout(() => {
            gerarRecomendacoes();
            
            // Restaurar botão
            if (btnCalcular) {
                btnCalcular.innerHTML = textoOriginal;
                btnCalcular.disabled = false;
            }
            
            mostrarToast('✅ Análise completa realizada com sucesso!', 'success');
        }, 1500);
        
    } catch (error) {
        console.error('❌ Erro no cálculo completo:', error);
        mostrarToast('Erro ao calcular análise completa', 'error');
    }
}

// ==================== EXPOSIÇÃO DE FUNÇÕES ====================

window.gerarRecomendacoes = gerarRecomendacoes;
window.exportarTodosGraficos = exportarTodosGraficos;
window.atualizarTodosGraficosComDados = atualizarTodosGraficosComDados;
window.exportarGraficoParaImagem = (id, nome) => {
    if (window.gerenciadorGraficos) {
        return window.gerenciadorGraficos.exportarGraficoParaImagem(id, nome);
    }
    return false;
};
window.sincronizarGraficosComDados = sincronizarGraficosComDados;
window.calcularTudoCompleto = calcularTudoCompleto;
window.exportarPacoteCompleto = exportarPacoteCompleto;
// ==================== DASHBOARD E VISUALIZAÇÕES ====================

function atualizarDashboard() {
    try {
        console.log('📊 Atualizando dashboard...');
        
        const resultados = dadosNegocio.resultados;
        const custos = dadosNegocio.custos;
        const empresa = dadosNegocio.empresa;
        
        // Atualizar KPIs principais
        if (resultados && resultados.receitaBruta) {
            atualizarElementoTexto('dashFaturamento', formatarMoeda(resultados.receitaBruta));
            atualizarElementoTexto('dashLucro', formatarMoeda(resultados.lucroLiquido));
            atualizarElementoTexto('dashMargem', `${resultados.margemLiquida.toFixed(1)}%`);
            atualizarElementoTexto('dashPontoEquilibrio', resultados.pontoEquilibrioUnidades);
            
            // Atualizar gráfico do dashboard
            atualizarGraficoDashboard();
            
            // Atualizar análise de saúde financeira
            atualizarAnaliseSaudeDashboard(resultados, custos);
        } else {
            // Dados padrão para dashboard inicial
            atualizarElementoTexto('dashFaturamento', 'R$ 0');
            atualizarElementoTexto('dashLucro', 'R$ 0');
            atualizarElementoTexto('dashMargem', '0%');
            atualizarElementoTexto('dashPontoEquilibrio', '0');
        }
        
        // Atualizar progresso geral
        atualizarProgressoDashboard();
        
        // Atualizar dicas do dashboard
        atualizarDicasDashboard(empresa, resultados);
        
        console.log('✅ Dashboard atualizado!');
        
    } catch (error) {
        console.error('❌ Erro ao atualizar dashboard:', error);
    }
}

function atualizarGraficoDashboard() {
    const ctx = document.getElementById('dashGraficoResumo');
    if (!ctx) return;
    
    // Destruir gráfico anterior se existir
    if (window.dashboardChart) {
        window.dashboardChart.destroy();
    }
    
    const resultados = dadosNegocio.resultados;
    if (!resultados || !resultados.receitaBruta) return;
    
    try {
        // Criar dados de projeção para 6 meses
        const receitaBase = resultados.receitaBruta;
        const dadosProjecao = Array.from({length: 6}, (_, i) => {
            const crescimentoMensal = 0.05; // 5% ao mês
            return receitaBase * Math.pow(1 + crescimentoMensal, i);
        });
        
        window.dashboardChart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Mês 1', 'Mês 2', 'Mês 3', 'Mês 4', 'Mês 5', 'Mês 6'],
                datasets: [{
                    label: 'Faturamento Projetado',
                    data: dadosProjecao,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    pointRadius: 5,
                    pointBackgroundColor: 'rgb(59, 130, 246)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: document.body.classList.contains('dark-mode') ? '#f3f4f6' : '#111827',
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: document.body.classList.contains('dark-mode') ? '#1f2937' : '#ffffff',
                        titleColor: document.body.classList.contains('dark-mode') ? '#f3f4f6' : '#111827',
                        bodyColor: document.body.classList.contains('dark-mode') ? '#f3f4f6' : '#111827',
                        borderColor: document.body.classList.contains('dark-mode') ? '#374151' : '#e5e7eb',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return `Faturamento: ${formatarMoeda(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: document.body.classList.contains('dark-mode') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                            color: document.body.classList.contains('dark-mode') ? '#9ca3af' : '#6b7280',
                            callback: function(value) {
                                if (value >= 1000000) {
                                    return 'R$ ' + (value / 1000000).toFixed(1) + 'M';
                                }
                                if (value >= 1000) {
                                    return 'R$ ' + (value / 1000).toFixed(0) + 'k';
                                }
                                return 'R$ ' + value;
                            }
                        },
                        title: {
                            display: true,
                            text: 'Valor (R$)',
                            color: document.body.classList.contains('dark-mode') ? '#9ca3af' : '#6b7280'
                        }
                    },
                    x: {
                        grid: {
                            color: document.body.classList.contains('dark-mode') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                            color: document.body.classList.contains('dark-mode') ? '#9ca3af' : '#6b7280'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
        
        // Adicionar evento de clique para ampliar
        ctx.onclick = function(evt) {
            const points = window.dashboardChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
            if (points.length) {
                abrirModalGrafico('dashboard');
            }
        };
        
    } catch (error) {
        console.error('❌ Erro ao criar gráfico do dashboard:', error);
    }
}

function atualizarAnaliseSaudeDashboard(resultados, custos) {
    const container = document.getElementById('analiseSaudeDashboard');
    if (!container) return;
    
    const margem = resultados.margemLiquida;
    const pontoEquilibrioPercent = custos?.qtdMensal ? 
        (resultados.pontoEquilibrioUnidades / custos.qtdMensal * 100) : 0;
    
    let status = '';
    let cor = '';
    let detalhes = [];
    
    // Análise de saúde financeira
    if (margem > 25 && pontoEquilibrioPercent < 50) {
        status = 'SAÚDE FINANCEIRA EXCELENTE';
        cor = 'text-green-600 dark:text-green-400';
        detalhes = [
            `Margem líquida: ${margem.toFixed(1)}% (ótima)`,
            `Ponto de equilíbrio: ${pontoEquilibrioPercent.toFixed(1)}% da capacidade`,
            'Negócio muito saudável e rentável'
        ];
    } else if (margem > 15 && pontoEquilibrioPercent < 70) {
        status = 'SAÚDE FINANCEIRA BOA';
        cor = 'text-blue-600 dark:text-blue-400';
        detalhes = [
            `Margem líquida: ${margem.toFixed(1)}% (boa)`,
            `Ponto de equilíbrio: ${pontoEquilibrioPercent.toFixed(1)}% da capacidade`,
            'Negócio saudável com espaço para melhorias'
        ];
    } else if (margem > 5) {
        status = 'SAÚDE FINANCEIRA REGULAR';
        cor = 'text-yellow-600 dark:text-yellow-400';
        detalhes = [
            `Margem líquida: ${margem.toFixed(1)}% (baixa)`,
            `Ponto de equilíbrio: ${pontoEquilibrioPercent.toFixed(1)}% da capacidade`,
            'Atenção: Execute as recomendações de alta prioridade'
        ];
    } else {
        status = 'SAÚDE FINANCEIRA CRÍTICA';
        cor = 'text-red-600 dark:text-red-400';
        detalhes = [
            `Margem líquida: ${margem.toFixed(1)}% (crítica)`,
            `Ponto de equilíbrio: ${pontoEquilibrioPercent.toFixed(1)}% da capacidade`,
            '⚠️ Ação imediata necessária!'
        ];
    }
    
    container.innerHTML = `
        <div class="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-xl">
            <div class="font-bold ${cor} mb-3">${status}</div>
            <div class="space-y-2">
                ${detalhes.map(detalhe => `
                    <div class="flex items-center text-sm">
                        <i class="fas fa-circle text-xs mr-2 ${cor}"></i>
                        <span class="text-gray-700 dark:text-gray-300">${detalhe}</span>
                    </div>
                `).join('')}
            </div>
            <div class="mt-4">
                <button onclick="openTab('recomendacoes')" 
                        class="w-full px-4 py-2 gradient-primary text-white rounded-lg font-medium hover-lift transition">
                    <i class="fas fa-bullseye mr-2"></i>Ver Plano de Ação
                </button>
            </div>
        </div>
    `;
    
    container.classList.remove('hidden');
}

function atualizarProgressoDashboard() {
    const progresso = calcularProgressoCompleto();
    atualizarElementoTexto('progressoDados', `${progresso}%`);
    
    const progressoBar = document.getElementById('progressoBar');
    const progressoDadosBar = document.getElementById('progressoDadosBar');
    
    if (progressoBar) {
        progressoBar.style.width = `${progresso}%`;
        progressoBar.setAttribute('aria-valuenow', progresso);
        
        // Atualizar cor baseada no progresso
        if (progresso >= 75) {
            progressoBar.className = 'h-full gradient-success rounded-full transition-all duration-500';
        } else if (progresso >= 50) {
            progressoBar.className = 'h-full gradient-warning rounded-full transition-all duration-500';
        } else {
            progressoBar.className = 'h-full gradient-primary rounded-full transition-all duration-500';
        }
    }
    
    if (progressoDadosBar) {
        progressoDadosBar.style.width = `${progresso}%`;
    }
}

function calcularProgressoCompleto() {
    let progresso = 0;
    
    // Dados básicos (máximo 30 pontos)
    if (document.getElementById('empresaNome')?.value) progresso += 6;
    if (document.getElementById('setorEmpresa')?.value) progresso += 6;
    if (document.getElementById('nomeProduto')?.value) progresso += 6;
    if (document.getElementById('publicoAlvo')?.value) progresso += 6;
    if (parseFloat(document.getElementById('qtdVendaMensal')?.value) > 0) progresso += 6;
    
    // Custos (máximo 20 pontos)
    if (parseFloat(document.getElementById('materiaPrima')?.value) > 0) progresso += 4;
    if (parseFloat(document.getElementById('salarios')?.value) > 0) progresso += 4;
    if (parseFloat(document.getElementById('aluguel')?.value) > 0) progresso += 4;
    if (parseFloat(document.getElementById('marketing')?.value) > 0) progresso += 4;
    if (dadosNegocio.custos?.totalUnitario > 0) progresso += 4;
    
    // Precificação (máximo 20 pontos)
    if (parseFloat(document.getElementById('precoVendaFinal')?.value) > 0) progresso += 10;
    if (document.getElementById('markupInput')?.value > 0) progresso += 5;
    if (metodoPrecificacaoSelecionado) progresso += 5;
    
    // Mercado (máximo 15 pontos)
    if (parseFloat(document.getElementById('precoMedioConcorrencia')?.value) > 0) progresso += 5;
    if (parseFloat(document.getElementById('valorQualidade')?.value) > 0) progresso += 5;
    if (document.getElementById('sazonalidade')?.value) progresso += 5;
    
    // Resultados (máximo 15 pontos)
    if (dadosNegocio.resultados?.margemLiquida) progresso += 15;
    
    return Math.min(100, progresso);
}

function atualizarDicasDashboard(empresa, resultados) {
    const container = document.getElementById('dicasDashboard');
    if (!container) return;
    
    let dicas = [];
    
    // Dicas baseadas no progresso
    const progresso = calcularProgressoCompleto();
    
    if (progresso < 30) {
        dicas.push({
            titulo: '🚀 Comece sua análise',
            descricao: 'Complete os dados básicos para uma análise precisa.',
            acao: 'openTab(\'dados\')',
            icone: 'fas fa-edit'
        });
    } else if (progresso < 60) {
        dicas.push({
            titulo: '💰 Analise seus custos',
            descricao: 'Mapeie todos os custos para calcular preços corretamente.',
            acao: 'openTab(\'custos\')',
            icone: 'fas fa-money-bill-wave'
        });
    } else if (progresso < 90) {
        dicas.push({
            titulo: '🎯 Defina seu preço',
            descricao: 'Escolha a melhor estratégia de precificação.',
            acao: 'openTab(\'precificacao\')',
            icone: 'fas fa-tags'
        });
    } else {
        dicas.push({
            titulo: '📊 Veja os resultados',
            descricao: 'Confira a análise completa e recomendações.',
            acao: 'openTab(\'resultados\')',
            icone: 'fas fa-chart-line'
        });
    }
    
    // Dicas baseadas nos resultados
    if (resultados?.margemLiquida < 15) {
        dicas.push({
            titulo: '⚠️ Margem baixa detectada',
            descricao: 'Sua margem precisa de atenção. Consulte recomendações.',
            acao: 'openTab(\'recomendacoes\')',
            icone: 'fas fa-exclamation-triangle'
        });
    }
    
    // Dica de setor específico
    if (empresa.setor) {
        const dicasSetor = {
            'alimentacao': {
                titulo: '🍕 Dica para Alimentação',
                descricao: 'Controle rigoroso de estoque e validade.',
                icone: 'fas fa-utensils'
            },
            'servicos': {
                titulo: '🔧 Dica para Serviços',
                descricao: 'Valorize seu tempo. Cobre por hora ou pacote.',
                icone: 'fas fa-tools'
            },
            'moda': {
                titulo: '👗 Dica para Moda',
                descricao: 'Trabalhe com coleções e estoque controlado.',
                icone: 'fas fa-tshirt'
            }
        };
        
        if (dicasSetor[empresa.setor]) {
            dicas.push(dicasSetor[empresa.setor]);
        }
    }
    
    // Renderizar dicas
    container.innerHTML = dicas.map(dica => `
        <button onclick="${dica.acao || ''}" 
                class="w-full text-left p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-xl hover-lift border border-gray-200 dark:border-gray-700 transition">
            <div class="flex items-center gap-3">
                <div class="gradient-primary p-2 rounded-lg">
                    <i class="${dica.icone || 'fas fa-lightbulb'} text-white"></i>
                </div>
                <div class="flex-1">
                    <div class="font-medium text-gray-900 dark:text-white">${dica.titulo}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-300 mt-1">${dica.descricao}</div>
                </div>
            </div>
        </button>
    `).join('');
}

// ==================== CONFIGURAÇÕES E UTILITÁRIOS FINAIS ====================

function resetarCalculadora() {
    if (confirm('⚠️ TEM CERTEZA QUE DESEJA REINICIAR A CALCULADORA?\n\nTodos os dados não salvos serão perdidos.\nDados salvos no navegador também serão removidos.')) {
        try {
            // Limpar localStorage
            localStorage.removeItem('dadosNegocio');
            localStorage.removeItem('darkMode');
            localStorage.removeItem('dicasIgnoradas');
            
            // Recarregar página
            location.reload();
            
        } catch (error) {
            console.error('❌ Erro ao resetar calculadora:', error);
            mostrarToast('Erro ao resetar calculadora', 'error');
        }
    }
}

function exportarParaExcel() {
    try {
        if (!dadosNegocio.empresa.nome) {
            mostrarToast('Preencha os dados básicos primeiro!', 'warning');
            return;
        }
        
        // Criar dados para exportação
        const dadosExportacao = {
            empresa: dadosNegocio.empresa,
            produto: dadosNegocio.produto,
            custos: dadosNegocio.custos,
            resultados: dadosNegocio.resultados,
            meta: dadosNegocio.meta,
            recomendacoes: "Consulte a aba 'Plano de Ação' para recomendações detalhadas",
            timestamp: new Date().toISOString(),
            geradoPor: 'Calculadora MEI Premium - Brayan Contabilidade'
        };
        
        // Converter para JSON formatado
        const json = JSON.stringify(dadosExportacao, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Criar link de download
        const a = document.createElement('a');
        a.href = url;
        a.download = `dados-negocio-${dadosNegocio.empresa.nome.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        mostrarToast('Dados exportados com sucesso!', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao exportar dados:', error);
        mostrarToast('Erro ao exportar dados', 'error');
    }
}

function imprimirRelatorio() {
    try {
        // Salvar estado atual dos tabs
        const tabAtiva = document.querySelector('.tab-content.active')?.id;
        
        // Abrir tab de resultados para impressão
        if (tabAtiva !== 'resultados' && tabAtiva !== 'recomendacoes') {
            openTab('resultados');
            setTimeout(() => {
                window.print();
                // Voltar para tab original após impressão
                setTimeout(() => {
                    if (tabAtiva) openTab(tabAtiva);
                }, 1000);
            }, 500);
        } else {
            window.print();
        }
        
    } catch (error) {
        console.error('❌ Erro ao imprimir:', error);
        mostrarToast('Erro ao imprimir relatório', 'error');
    }
}

// ==================== FUNÇÕES DE ACESSIBILIDADE ====================

function inicializarAcessibilidade() {
    try {
        // Adicionar labels ARIA para elementos interativos
        document.querySelectorAll('button').forEach(btn => {
            if (!btn.getAttribute('aria-label')) {
                const texto = btn.textContent || btn.title || '';
                if (texto.trim()) {
                    btn.setAttribute('aria-label', texto.trim());
                }
            }
        });
        
        // Adicionar descrições para inputs
        document.querySelectorAll('input[type="number"]').forEach(input => {
            if (!input.getAttribute('aria-describedby')) {
                const descricao = input.previousElementSibling?.textContent || '';
                if (descricao) {
                    const id = `desc-${input.id}`;
                    input.setAttribute('aria-describedby', id);
                    
                    // Criar elemento descritivo se não existir
                    if (!document.getElementById(id)) {
                        const span = document.createElement('span');
                        span.id = id;
                        span.className = 'sr-only';
                        span.textContent = descricao;
                        input.parentNode.insertBefore(span, input.nextSibling);
                    }
                }
            }
        });
        
        // Configurar foco para modais
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Tab' && document.querySelector('.modal-overlay:not([hidden])')) {
                const modal = document.querySelector('.modal-overlay:not([hidden])');
                const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                
                if (focusableElements.length > 0) {
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];
                    
                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            lastElement.focus();
                            e.preventDefault();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            firstElement.focus();
                            e.preventDefault();
                        }
                    }
                }
            }
        });
        
        console.log('✅ Acessibilidade configurada');
        
    } catch (error) {
        console.error('❌ Erro na configuração de acessibilidade:', error);
    }
}

// ==================== INICIALIZAÇÃO FINAL ====================

function inicializarAplicacaoCompleta() {
    try {
        // Configurar data e hora
        const dataAtual = new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const elementoData = document.getElementById('dataAtual');
        if (elementoData) {
            elementoData.textContent = dataAtual;
        }
        
        // Configurar tooltips avançados
        const tooltipsAvancados = {
            'markupSlider': 'Ajuste o percentual de lucro sobre os custos. Valores típicos: 50-200% dependendo do setor.',
            'precoVendaFinal': 'Preço final de venda ao cliente. Considere concorrência e valor percebido.',
            'qtdVendaMensal': 'Estimativa realista de vendas mensais. Baseie em dados históricos ou pesquisas de mercado.',
            'valorQualidade': 'Como seus clientes avaliam a qualidade do seu produto/serviço (1-10)',
            'precoMedioConcorrencia': 'Pesquise pelo menos 3 concorrentes diretos para ter uma média realista'
        };
        
        Object.entries(tooltipsAvancados).forEach(([id, texto]) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.setAttribute('data-tooltip', texto);
                elemento.addEventListener('mouseenter', mostrarTooltip);
                elemento.addEventListener('mouseleave', esconderTooltip);
                elemento.addEventListener('focus', mostrarTooltip);
                elemento.addEventListener('blur', esconderTooltip);
            }
        });

        // Inicializar acessibilidade
        inicializarAcessibilidade();

        // Configurar evento para impressão
        const btnImprimir = document.getElementById('btnImprimir');
        if (btnImprimir) {
            btnImprimir.addEventListener('click', imprimirRelatorio);
        }

        // Configurar evento para resetar
        const btnResetar = document.getElementById('btnResetar');
        if (btnResetar) {
            btnResetar.addEventListener('click', resetarCalculadora);
        }

        // Configurar evento para exportar Excel
        const btnExportarExcel = document.getElementById('btnExportarExcel');
        if (btnExportarExcel) {
            btnExportarExcel.addEventListener('click', exportarParaExcel);
        }

        // Atualizar dashboard periodicamente (a cada 30 segundos)
        setInterval(() => {
            if (document.querySelector('.tab-content.active')?.id === 'dashboard') {
                atualizarDashboard();
            }
        }, 30000);

        // Mostrar notificação de atualização automática
        setTimeout(() => {
            if (localStorage.getItem('notificacaoAtualizacao') !== 'vista') {
                mostrarToast('📢 Dica: A calculadora atualiza automaticamente os valores conforme você preenche os campos!', 'info');
                localStorage.setItem('notificacaoAtualizacao', 'vista');
            }
        }, 5000);

        console.log('✅ Inicialização completa finalizada!');

    } catch (error) {
        console.error('❌ Erro na inicialização completa:', error);
    }
}

// ==================== FUNÇÕES DE AJUDA E SUPORTE ====================

function mostrarAjuda(contexto) {
    const ajudas = {
        'dashboard': 'O dashboard mostra um resumo do seu negócio. Complete as outras abas para ver mais dados.',
        'custos': 'Inclua todos os custos, mesmo os pequenos. Eles impactam diretamente no preço final.',
        'precificacao': 'Escolha o método de precificação que melhor se adapta ao seu negócio. Markup é o mais comum para iniciantes.',
        'mercado': 'Pesquise seus concorrentes para entender o preço praticado no mercado.',
        'resultados': 'Aqui você vê se seu negócio é viável financeiramente. Margem líquida acima de 20% é considerada saudável.',
        'projecoes': 'Simule cenários futuros para planejar o crescimento do seu negócio.',
        'recomendacoes': 'Siga o plano de ação para melhorar a saúde financeira do seu negócio.'
    };

    const ajudaTexto = ajudas[contexto] || 'Preencha todos os dados para obter uma análise completa.';
    
    const modalAjuda = document.getElementById('modalAjuda');
    if (modalAjuda) {
        modalAjuda.querySelector('#textoAjuda').textContent = ajudaTexto;
        modalAjuda.querySelector('#tituloAjuda').textContent = `Ajuda: ${contexto.charAt(0).toUpperCase() + contexto.slice(1)}`;
        modalAjuda.classList.remove('hidden');
        modalAjuda.style.display = 'flex';
    }
}

function fecharAjuda() {
    const modalAjuda = document.getElementById('modalAjuda');
    if (modalAjuda) {
        modalAjuda.classList.add('hidden');
        modalAjuda.style.display = 'none';
    }
}

function solicitarSuporte() {
    const nomeEmpresa = dadosNegocio.empresa.nome || 'Não informado';
    const setor = dadosNegocio.empresa.setor || 'Não informado';
    const problema = prompt('Descreva brevemente o problema ou dúvida:');
    
    if (problema) {
        const mensagem = `*Suporte Calculadora MEI Premium*%0A%0A` +
                         `Empresa: ${nomeEmpresa}%0A` +
                         `Setor: ${setor}%0A` +
                         `Problema: ${problema}%0A%0A` +
                         `*Dados Técnicos:*%0A` +
                         `Progresso: ${calcularProgressoCompleto()}%%0A` +
                         `Margem Atual: ${dadosNegocio.resultados?.margemLiquida?.toFixed(1) || 0}%%0A` +
                         `Preço Atual: ${formatarMoeda(parseFloat(document.getElementById('precoVendaFinal')?.value) || 0)}`;
        
        const urlWhatsApp = `https://wa.me/5521991577383?text=${mensagem}`;
        window.open(urlWhatsApp, '_blank');
        
        mostrarToast('Redirecionando para o suporte no WhatsApp...', 'info');
    }
}

// ==================== EXPOSIÇÃO FINAL DE FUNÇÕES ====================

window.resetarCalculadora = resetarCalculadora;
window.exportarParaExcel = exportarParaExcel;
window.imprimirRelatorio = imprimirRelatorio;
window.mostrarAjuda = mostrarAjuda;
window.fecharAjuda = fecharAjuda;
window.solicitarSuporte = solicitarSuporte;
window.calcularTudo = calcularTudoCompleto;

// Chamar inicialização completa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Inicialização básica já foi feita, agora a completa
    setTimeout(inicializarAplicacaoCompleta, 1000);
});

console.log('✅ Parte 6/6 carregada: Dashboard, Configurações e Funções Finais');

// ==================== FUNÇÕES ADICIONAIS PARA O DASHBOARD ====================

function mostrarRelatorioResumido() {
    const modal = document.getElementById('modalRelatorioResumido');
    if (!modal) return;

    // Coletar dados para o relatório
    const dados = {
        empresa: dadosNegocio.empresa.nome || 'Não informado',
        setor: dadosNegocio.empresa.setor || 'Não informado',
        produto: dadosNegocio.produto.nome || 'Não informado',
        preco: parseFloat(document.getElementById('precoVendaFinal')?.value) || 0,
        margem: dadosNegocio.resultados?.margemLiquida || 0,
        pontoEquilibrio: dadosNegocio.resultados?.pontoEquilibrioUnidades || 0,
        recomendacoes: document.querySelectorAll('#recomendacoesPrecificacao li, #recomendacoesCustos li, #recomendacoesMercado li, #recomendacoesCrescimento li').length
    };

    // Atualizar conteúdo do modal
    modal.querySelector('#empresaRelatorio').textContent = dados.empresa;
    modal.querySelector('#setorRelatorio').textContent = dados.setor;
    modal.querySelector('#produtoRelatorio').textContent = dados.produto;
    modal.querySelector('#precoRelatorio').textContent = formatarMoeda(dados.preco);
    modal.querySelector('#margemRelatorio').textContent = `${dados.margem.toFixed(1)}%`;
    modal.querySelector('#pontoEquilibrioRelatorio').textContent = dados.pontoEquilibrio;
    modal.querySelector('#totalRecomendacoesRelatorio').textContent = dados.recomendacoes;

    // Mostrar modal
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function fecharRelatorioResumido() {
    const modal = document.getElementById('modalRelatorioResumido');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}

// ==================== ANIMAÇÕES E FEEDBACK VISUAL ====================

function adicionarAnimacao(elemento, animacao) {
    elemento.classList.add(animacao);
    elemento.addEventListener('animationend', () => {
        elemento.classList.remove(animacao);
    });
}

function destacarElemento(id) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.classList.add('animate-pulse', 'ring-2', 'ring-blue-500');
        setTimeout(() => {
            elemento.classList.remove('animate-pulse', 'ring-2', 'ring-blue-500');
        }, 2000);
    }
}

// ==================== SISTEMA DE NOTIFICAÇÕES ====================

function verificarNotificacoes() {
    // Verificar se há dados incompletos
    const progresso = calcularProgressoCompleto();
    if (progresso < 50 && localStorage.getItem('notificacaoProgresso') !== 'vista') {
        mostrarToast('📝 Complete mais dados para uma análise mais precisa!', 'info');
        localStorage.setItem('notificacaoProgresso', 'vista');
    }

    // Verificar se há margem baixa
    if (dadosNegocio.resultados?.margemLiquida < 10 && localStorage.getItem('notificacaoMargem') !== 'vista') {
        mostrarToast('⚠️ Sua margem está baixa. Consulte a aba de Recomendações!', 'warning');
        localStorage.setItem('notificacaoMargem', 'vista');
    }

    // Verificar se é a primeira visita do dia
    const ultimaVisita = localStorage.getItem('ultimaVisita');
    const hoje = new Date().toDateString();
    if (ultimaVisita !== hoje) {
        mostrarToast('👋 Bem-vindo de volta à Calculadora MEI Premium!', 'info');
        localStorage.setItem('ultimaVisita', hoje);
    }
}

// ==================== CONFIGURAÇÃO DE ATALHOS DE TECLADO ====================

document.addEventListener('keydown', function(e) {
    // Ctrl + S para salvar
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveProgress();
        mostrarToast('Progresso salvo com sucesso! (Ctrl+S)', 'success');
    }

    // Ctrl + P para imprimir
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        imprimirRelatorio();
    }

    // Ctrl + H para ajuda
    if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        const tabAtiva = document.querySelector('.tab-content.active')?.id;
        if (tabAtiva) mostrarAjuda(tabAtiva);
    }

    // Ctrl + 1 a Ctrl + 9 para navegar entre tabs
    if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
        const tabs = ['dashboard', 'dados', 'custos', 'precificacao', 'mercado', 'resultados', 'graficos', 'projecoes', 'recomendacoes'];
        const index = parseInt(e.key) - 1;
        if (index < tabs.length) {
            e.preventDefault();
            openTab(tabs[index]);
        }
    }
});

// ==================== FINALIZAÇÃO ====================

console.log('🎉 Calculadora MEI Premium - Brayan Contabilidade');
console.log('📧 contato@brayancontabilidade.com');
console.log('📱 (21) 99157-7383');
console.log('🌐 www.brayancontabilidade.com');

// Exportar objeto dadosNegocio para depuração (apenas desenvolvimento)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.dadosNegocio = dadosNegocio;
}
unction inicializarAplicacaoCompleta() {
    try {
        // Configurar data e hora
        const dataAtual = new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const elementoData = document.getElementById('dataAtual');
        if (elementoData) {
            elementoData.textContent = dataAtual;
        }
        
        // Configurar tooltips avançados
        const tooltipsAvancados = {
            'markupSlider': 'Ajuste o percentual de lucro sobre os custos. Valores típicos: 50-200% dependendo do setor.',
            'precoVendaFinal': 'Preço final de venda ao cliente. Considere concorrência e valor percebido.',
            'qtdVendaMensal': 'Estimativa realista de vendas mensais. Baseie em dados históricos ou pesquisas de mercado.',
            'valorQualidade': 'Como seus clientes avaliam a qualidade do seu produto/serviço (1-10)',
            'precoMedioConcorrencia': 'Pesquise pelo menos 3 concorrentes diretos para ter uma média realista'
        };
        
        Object.entries(tooltipsAvancados).forEach(([id, texto]) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.setAttribute('data-tooltip', texto);
                elemento.addEventListener('mouseenter', mostrarTooltip);
                elemento.addEventListener('mouseleave', esconderTooltip);
                elemento.addEventListener('focus', mostrarTooltip);
                elemento.addEventListener('blur', esconderTooltip);
            }
        });
        
        // Configurar salvamento automático periódico
        setInterval(() => {
            if (document.hasFocus()) {
                const progresso = calcularProgressoCompleto();
                if (progresso > 10) {
                    saveProgress();
                }
            }
        }, 30000); // Salva a cada 30 segundos
        
        // Configurar notificações de verificação
        configurarNotificacoesVerificacao();
        
        console.log('✅ Aplicação completamente inicializada!');
        
    } catch (error) {
        console.error('❌ Erro na inicialização completa:', error);
    }
}

function configurarNotificacoesVerificacao() {
    // Verificar dados importantes periodicamente
    setInterval(() => {
        verificarDadosCriticos();
    }, 60000); // Verifica a cada minuto
    
    // Configurar verificação na mudança de tab
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            verificarDadosCriticos();
        }
    });
}

function verificarDadosCriticos() {
    const alertas = [];
    
    // Verificar preço vs custo
    const preco = parseFloat(document.getElementById('precoVendaFinal')?.value) || 0;
    const custoUnitario = dadosNegocio.custos?.totalUnitario || 0;
    
    if (preco > 0 && custoUnitario > 0 && preco < custoUnitario) {
        alertas.push({
            tipo: 'critico',
            mensagem: `⚠️ PREJUÍZO POR UNIDADE: Você está vendendo por ${formatarMoeda(preco)} mas custa ${formatarMoeda(custoUnitario)}`,
            acao: 'Aumente o preço urgentemente!'
        });
    }
    
    // Verificar DAS atrasado (simulação)
    const hoje = new Date();
    const dia = hoje.getDate();
    if (dia > 20 && dia < 25) {
        alertas.push({
            tipo: 'alerta',
            mensagem: '📅 DAS DO MEI VENCE DIA 20',
            acao: 'Pague o DAS para evitar multas!'
        });
    }
    
    // Exibir alertas se houver
    if (alertas.length > 0) {
        exibirAlertasCriticos(alertas);
    }
}

function exibirAlertasCriticos(alertas) {
    const container = document.getElementById('alertasCriticos');
    if (!container) return;
    
    const alertasCriticos = alertas.filter(a => a.tipo === 'critico');
    const alertasNormais = alertas.filter(a => a.tipo === 'alerta');
    
    let html = '';
    
    if (alertasCriticos.length > 0) {
        html += `
            <div class="mb-4">
                <div class="font-bold text-red-700 dark:text-red-400 mb-2">🚨 ALERTAS CRÍTICOS</div>
                ${alertasCriticos.map(alerta => `
                    <div class="p-3 mb-2 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded">
                        <div class="font-medium">${alerta.mensagem}</div>
                        <div class="text-sm mt-1">${alerta.acao}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    if (alertasNormais.length > 0) {
        html += `
            <div>
                <div class="font-bold text-yellow-700 dark:text-yellow-400 mb-2">⚠️ LEMBRETES IMPORTANTES</div>
                ${alertasNormais.map(alerta => `
                    <div class="p-3 mb-2 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
                        <div class="font-medium">${alerta.mensagem}</div>
                        <div class="text-sm mt-1">${alerta.acao}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    if (html) {
        container.innerHTML = html;
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }
}

// ==================== FUNÇÕES DE MARKETING E VENDAS ====================

function gerarArgumentosVenda() {
    const preco = parseFloat(document.getElementById('precoVendaFinal')?.value) || 0;
    const custoUnitario = dadosNegocio.custos?.totalUnitario || 0;
    const diferencaConcorrencia = parseFloat(document.getElementById('diferencaMedia')?.textContent) || 0;
    
    const argumentos = [];
    
    if (preco > 0 && custoUnitario > 0) {
        const margem = ((preco - custoUnitario) / preco * 100).toFixed(1);
        
        argumentos.push({
            titulo: '💰 Justificativa de Preço',
            pontos: [
                `Baseado em custos reais de produção`,
                `Margem saudável de ${margem}% para reinvestimento`,
                `Inclui todos os impostos e taxas legais`
            ]
        });
    }
    
    if (diferencaConcorrencia > 0) {
        argumentos.push({
            titulo: '🏆 Diferenciais Competitivos',
            pontos: [
                `Produto/Serviço ${Math.abs(diferencaConcorrencia).toFixed(1)}% superior à concorrência`,
                `Qualidade comprovada pelos clientes`,
                `Atendimento personalizado e suporte`
            ]
        });
    } else if (diferencaConcorrencia < 0) {
        argumentos.push({
            titulo: '💎 Melhor Custo-Benefício',
            pontos: [
                `Preço ${Math.abs(diferencaConcorrencia).toFixed(1)}% abaixo da média`,
                `Mesma qualidade por menos`,
                `Oportunidade única de economia`
            ]
        });
    }
    
    // Adicionar argumentos por setor
    const setor = dadosNegocio.empresa.setor;
    const argumentosSetor = {
        'alimentacao': {
            titulo: '🍽️ Qualidade Alimentar',
            pontos: ['Ingredientes frescos e selecionados', 'Preparo artesanal', 'Embalagens sustentáveis']
        },
        'servicos': {
            titulo: '🔧 Garantia e Qualidade',
            pontos: ['Profissionais qualificados', 'Garantia por escrito', 'Atendimento rápido']
        },
        'moda': {
            titulo: '👗 Exclusividade e Estilo',
            pontos: ['Design exclusivo', 'Tecidos de qualidade', 'Acabamento impecável']
        }
    };
    
    if (argumentosSetor[setor]) {
        argumentos.push(argumentosSetor[setor]);
    }
    
    // Exibir argumentos
    const container = document.getElementById('argumentosVenda');
    if (container) {
        container.innerHTML = argumentos.map(arg => `
            <div class="p-4 mb-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                <div class="font-bold text-blue-900 dark:text-blue-300 mb-3">${arg.titulo}</div>
                <ul class="space-y-2">
                    ${arg.pontos.map(ponto => `
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                            <span class="text-blue-800 dark:text-blue-400">${ponto}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `).join('');
        
        container.classList.remove('hidden');
    }
    
    mostrarToast('Argumentos de venda gerados com sucesso!', 'success');
}

function gerarPitchVenda() {
    const empresa = dadosNegocio.empresa.nome || 'Seu Negócio';
    const produto = dadosNegocio.produto.nome || 'seu produto/serviço';
    const preco = formatarMoeda(parseFloat(document.getElementById('precoVendaFinal')?.value) || 0);
    const diferencaConcorrencia = parseFloat(document.getElementById('diferencaMedia')?.textContent) || 0;
    
    let pitch = '';
    
    if (diferencaConcorrencia > 0) {
        pitch = `A ${empresa} oferece ${produto} com qualidade premium. Por apenas ${preco}, você recebe um produto ${Math.abs(diferencaConcorrencia).toFixed(1)}% superior à concorrência, com atendimento exclusivo e garantia total. Invista no melhor!`;
    } else if (diferencaConcorrencia < 0) {
        pitch = `Economize ${Math.abs(diferencaConcorrencia).toFixed(1)}% com a ${empresa}! Oferecemos ${produto} por apenas ${preco}, com a mesma qualidade da concorrência por muito menos. Oportunidade única de custo-benefício!`;
    } else {
        pitch = `A ${empresa} apresenta ${produto} por ${preco}. Preço justo e competitivo, com qualidade garantida e atendimento personalizado. A escolha inteligente para quem busca equilíbrio entre preço e valor!`;
    }
    
    const container = document.getElementById('pitchVenda');
    if (container) {
        container.innerHTML = `
            <div class="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                <div class="font-bold text-purple-900 dark:text-purple-300 mb-3">🎤 PITCH DE VENDA PRONTO</div>
                <div class="italic text-purple-800 dark:text-purple-400 mb-4">"${pitch}"</div>
                <div class="text-sm text-purple-600 dark:text-purple-400">
                    <strong>Dica:</strong> Use este pitch em redes sociais, site e atendimento.
                </div>
            </div>
        `;
        container.classList.remove('hidden');
    }
    
    // Copiar para área de transferência
    navigator.clipboard.writeText(pitch).then(() => {
        mostrarToast('Pitch copiado para área de transferência!', 'success');
    });
}

// ==================== FUNÇÕES DE COMPARTILHAMENTO ====================

function compartilharResultados() {
    const empresa = dadosNegocio.empresa.nome || 'Meu Negócio MEI';
    const margem = dadosNegocio.resultados?.margemLiquida?.toFixed(1) || '0';
    const preco = formatarMoeda(parseFloat(document.getElementById('precoVendaFinal')?.value) || 0);
    
    const texto = `💼 ${empresa} - Análise de Precificação\n\n` +
                 `✅ Preço ideal: ${preco}\n` +
                 `📊 Margem líquida: ${margem}%\n` +
                 `🎯 Ferramenta: Calculadora MEI Premium - Brayan Contabilidade\n\n` +
                 `Faça sua análise também: [link-da-sua-calculadora]`;
    
    // Copiar para área de transferência
    navigator.clipboard.writeText(texto).then(() => {
        mostrarToast('Resultados copiados para compartilhamento!', 'success');
        
        // Mostrar opções de compartilhamento
        const container = document.getElementById('opcoesCompartilhamento');
        if (container) {
            container.innerHTML = `
                <div class="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                    <div class="font-bold text-green-900 dark:text-green-300 mb-3">📱 Compartilhar Resultados</div>
                    <div class="text-sm text-green-800 dark:text-green-400 mb-4">
                        Resultados copiados! Cole em:
                    </div>
                    <div class="flex gap-3">
                        <button onclick="window.open('https://wa.me/?text=${encodeURIComponent(texto)}', '_blank')" 
                                class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                            <i class="fab fa-whatsapp mr-2"></i>WhatsApp
                        </button>
                        <button onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=[SEU-LINK]&quote=${encodeURIComponent(texto)}', '_blank')"
                                class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                            <i class="fab fa-facebook mr-2"></i>Facebook
                        </button>
                    </div>
                </div>
            `;
            container.classList.remove('hidden');
        }
    });
}

// ==================== FUNÇÕES DE BACKUP E RESTAURAÇÃO ====================

function criarBackupCompleto() {
    try {
        const backup = {
            dadosNegocio: dadosNegocio,
            timestamp: new Date().toISOString(),
            versao: '2.0',
            configuracao: {
                metodoPrecificacao: metodoPrecificacaoSelecionado,
                darkMode: localStorage.getItem('darkMode') || 'disabled'
            }
        };
        
        const json = JSON.stringify(backup, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-calculadora-mei-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        mostrarToast('Backup completo criado com sucesso!', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao criar backup:', error);
        mostrarToast('Erro ao criar backup', 'error');
    }
}

function restaurarBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const backup = JSON.parse(event.target.result);
                
                if (confirm(`Restaurar backup de ${new Date(backup.timestamp).toLocaleDateString('pt-BR')}?`)) {
                    // Restaurar dados
                    dadosNegocio = backup.dadosNegocio || dadosNegocio;
                    metodoPrecificacaoSelecionado = backup.configuracao?.metodoPrecificacao || metodoPrecificacaoSelecionado;
                    
                    // Restaurar configurações
                    if (backup.configuracao?.darkMode === 'enabled') {
                        document.body.classList.add('dark-mode');
                        const icon = document.getElementById('darkModeIcon');
                        if (icon) icon.className = 'fas fa-sun';
                    }
                    
                    // Atualizar interface
                    preencherCamposComDados();
                    calcularCustos();
                    calcularResultados();
                    atualizarDashboard();
                    
                    // Salvar no localStorage
                    localStorage.setItem('dadosNegocio', JSON.stringify(dadosNegocio));
                    localStorage.setItem('darkMode', backup.configuracao?.darkMode || 'disabled');
                    
                    mostrarToast('Backup restaurado com sucesso!', 'success');
                    setTimeout(() => location.reload(), 1500);
                }
            } catch (error) {
                console.error('❌ Erro ao restaurar backup:', error);
                mostrarToast('Arquivo de backup inválido', 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// ==================== FUNÇÕES DE AJUDA E SUPORTE ====================

function mostrarAjuda(contexto) {
    const ajudaPorContexto = {
        'dashboard': {
            titulo: '📊 Dashboard - Ajuda',
            conteudo: `
                <p>O dashboard mostra um resumo completo do seu negócio:</p>
                <ul>
                    <li><strong>KPIs Principais:</strong> Faturamento, Lucro, Margem e Ponto de Equilíbrio</li>
                    <li><strong>Gráfico de Projeção:</strong> Evolução esperada para os próximos 6 meses</li>
                    <li><strong>Ações Rápidas:</strong> Acesso direto às principais funcionalidades</li>
                    <li><strong>Progresso:</strong> Quanto da análise você já completou</li>
                </ul>
                <p><strong>Dica:</strong> Complete todas as abas para ter uma análise completa.</p>
            `
        },
        'custos': {
            titulo: '💰 Custos - Ajuda',
            conteudo: `
                <p>Preencha TODOS os custos do seu negócio:</p>
                <ul>
                    <li><strong>Custos Variáveis:</strong> Mudam conforme você produz/vende</li>
                    <li><strong>Custos Fixos:</strong> São os mesmos todo mês</li>
                    <li><strong>DAS MEI:</strong> Valor fixo de R$ 70,90 (2024)</li>
                    <li><strong>Software:</strong> Inclua todos os sistemas que você usa</li>
                </ul>
                <p><strong>Dica Brayan:</strong> Não esqueça nenhum custo, mesmo os pequenos!</p>
            `
        },
        'precificacao': {
            titulo: '🏷️ Precificação - Ajuda',
            conteudo: `
                <p>Escolha a melhor estratégia para seu negócio:</p>
                <ul>
                    <li><strong>Markup:</strong> Percentual sobre custo (recomendado para iniciantes)</li>
                    <li><strong>Valor Percebido:</strong> Baseado no que o cliente está disposto a pagar</li>
                    <li><strong>Concorrência:</strong> Ajuste seus preços com base nos concorrentes</li>
                </ul>
                <p><strong>Preço Psicológico:</strong> Terminações como .99 criam percepção de melhor preço.</p>
            `
        }
    };
    
    const ajuda = ajudaPorContexto[contexto] || {
        titulo: '❓ Ajuda Geral',
        conteudo: 'Selecione uma aba específica para ver ajuda detalhada.'
    };
    
    const modal = document.getElementById('modalAjuda');
    if (modal) {
        modal.querySelector('#tituloAjuda').textContent = ajuda.titulo;
        modal.querySelector('#conteudoAjuda').innerHTML = ajuda.conteudo;
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
}

function contatarSuporte() {
    const empresa = dadosNegocio.empresa.nome || '';
    const setor = dadosNegocio.empresa.setor || '';
    const margem = dadosNegocio.resultados?.margemLiquida?.toFixed(1) || '0';
    
    const mensagem = `Olá! Gostaria de ajuda com a Calculadora MEI Premium.\n\n` +
                    `Empresa: ${empresa}\n` +
                    `Setor: ${setor}\n` +
                    `Margem atual: ${margem}%\n` +
                    `Dúvida específica: `;
    
    const url = `https://wa.me/5521991577383?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}

// ==================== FUNÇÕES DE RELATÓRIOS AVANÇADOS ====================

function gerarRelatorioExecutivo() {
    if (!dadosNegocio.empresa.nome) {
        mostrarToast('Complete a análise primeiro!', 'warning');
        return;
    }
    
    try {
        const data = new Date().toLocaleDateString('pt-BR');
        
        let relatorio = `
RELATÓRIO EXECUTIVO DE PRECIFICAÇÃO
====================================
BRAYAN CONTABILIDADE - CALCULADORA MEI PREMIUM
Data: ${data}
Cliente: ${dadosNegocio.empresa.nome}

RESUMO EXECUTIVO
----------------
`;

        // Adicionar seções baseadas nos dados disponíveis
        if (dadosNegocio.custos) {
            relatorio += `
ANÁLISE DE CUSTOS
-----------------
• Custo Unitário Total: ${formatarMoeda(dadosNegocio.custos.totalUnitario)}
• Custo Fixo Mensal: ${formatarMoeda(dadosNegocio.custos.fixoMensal)}
• Proporção Custos Fixos: ${(dadosNegocio.custos.fixoMensal / dadosNegocio.custos.totalMensal * 100).toFixed(1)}%
• Markup Sugerido: ${dadosNegocio.custos.markupSugerido}%

`;
        }
        
        if (dadosNegocio.resultados) {
            relatorio += `
RESULTADOS FINANCEIROS
----------------------
• Faturamento Mensal: ${formatarMoeda(dadosNegocio.resultados.receitaBruta)}
• Lucro Líquido Mensal: ${formatarMoeda(dadosNegocio.resultados.lucroLiquido)}
• Margem Líquida: ${dadosNegocio.resultados.margemLiquida.toFixed(1)}%
• Ponto de Equilíbrio: ${dadosNegocio.resultados.pontoEquilibrioUnidades} unidades
• ROI Anual: ${dadosNegocio.resultados.roiAnual?.toFixed(1) || '0'}%
• Payback: ${dadosNegocio.resultados.paybackMeses?.toFixed(1) || '0'} meses

`;
        }
        
        relatorio += `
RECOMENDAÇÕES ESTRATÉGICAS
--------------------------
1. Execute todas as ações de ALTA prioridade primeiro
2. Monitore resultados por 30 dias
3. Revise preços trimestralmente
4. Mantenha reserva de 3 meses de custos fixos

PRÓXIMOS PASSOS
---------------
• Agende consultoria com Brayan Contabilidade
• Implemente plano de ação de 30 dias
• Utilize argumentos de venda gerados
• Compartilhe resultados com sua equipe

CONTATO
-------
📱 (21) 99157-7383
📧 contato@brayancontabilidade.com
🌐 www.brayancontabilidade.com

© ${new Date().getFullYear()} Brayan Contabilidade
Todos os direitos reservados.
        `;
        
        // Baixar relatório
        const blob = new Blob([relatorio], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-executivo-${dadosNegocio.empresa.nome.replace(/\s+/g, '-').toLowerCase()}-${data.replace(/\//g, '-')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        mostrarToast('Relatório executivo gerado!', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao gerar relatório:', error);
        mostrarToast('Erro ao gerar relatório', 'error');
    }
}

// ==================== FUNÇÕES DE OTIMIZAÇÃO ====================

function otimizarAutomaticamente() {
    mostrarToast('Iniciando otimização automática...', 'info');
    
    // Passo 1: Verificar margem crítica
    const margem = dadosNegocio.resultados?.margemLiquida || 0;
    const precoAtual = parseFloat(document.getElementById('precoVendaFinal')?.value) || 0;
    
    if (margem < 10 && precoAtual > 0) {
        // Aumentar preço em 15%
        const novoPreco = precoAtual * 1.15;
        document.getElementById('precoVendaFinal').value = novoPreco.toFixed(2);
        atualizarPrecoFinal(novoPreco);
        mostrarToast('Preço ajustado (+15%) para melhorar margem', 'success');
    }
    
    // Passo 2: Verificar custos fixos altos
    const proporcaoFixos = dadosNegocio.custos?.fixoMensal > 0 ? 
        (dadosNegocio.custos.fixoMensal / dadosNegocio.custos.totalMensal * 100) : 0;
    
    if (proporcaoFixos > 60) {
        // Sugerir redução de custos fixos
        mostrarDicaContextual('otimizacao_custos_fixos');
    }
    
    // Passo 3: Verificar ponto de equilíbrio
    const pontoEquilibrio = dadosNegocio.resultados?.pontoEquilibrioUnidades || 0;
    const qtdMensal = dadosNegocio.custos?.qtdMensal || 100;
    
    if (pontoEquilibrio > qtdMensal * 0.8) {
        // Sugerir aumento de vendas ou redução de custos
        mostrarToast('Ponto de equilíbrio muito alto! Considere aumentar vendas.', 'warning');
    }
    
    // Recalcular tudo
    setTimeout(() => {
        calcularCustos();
        calcularResultados();
        gerarRecomendacoes();
        mostrarToast('Otimização completa!', 'success');
    }, 1000);
}

// ==================== EXPOSIÇÃO FINAL DE FUNÇÕES ====================

window.calcularTudo = calcularTudoCompleto;
window.resetarCalculadora = resetarCalculadora;
window.exportarParaExcel = exportarParaExcel;
window.imprimirRelatorio = imprimirRelatorio;
window.gerarArgumentosVenda = gerarArgumentosVenda;
window.gerarPitchVenda = gerarPitchVenda;
window.compartilharResultados = compartilharResultados;
window.criarBackupCompleto = criarBackupCompleto;
window.restaurarBackup = restaurarBackup;
window.mostrarAjuda = mostrarAjuda;
window.contatarSuporte = contatarSuporte;
window.gerarRelatorioExecutivo = gerarRelatorioExecutivo;
window.otimizarAutomaticamente = otimizarAutomaticamente;

// ==================== INICIALIZAÇÃO FINAL ====================

// Chamar inicialização completa quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarAplicacaoCompleta);
} else {
    inicializarAplicacaoCompleta();
}

// Configurar teclas de atalho
document.addEventListener('keydown', function(e) {
    // Ctrl + S para salvar
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveProgress();
    }
    
    // Ctrl + P para imprimir
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        imprimirRelatorio();
    }
    
    // Ctrl + R para recalcular tudo
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        calcularTudoCompleto();
    }
    
    // F1 para ajuda
    if (e.key === 'F1') {
        e.preventDefault();
        const tabAtiva = document.querySelector('.tab-content.active')?.id;
        mostrarAjuda(tabAtiva || 'dashboard');
    }
});

// Configurar service worker para funcionamento offline (se necessário)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(
            function(registration) {
                console.log('Service Worker registrado com sucesso:', registration.scope);
            },
            function(err) {
                console.log('Falha ao registrar Service Worker:', err);
            }
        );
    });
}

console.log('✅ Parte 6/6 FINALIZADA: Dashboard, Configurações e Funções Finais');
console.log('🚀 CALCULADORA MEI PREMIUM COMPLETAMENTE CARREGADA!');
console.log('📞 Suporte Brayan Contabilidade: (21) 99157-7383');
console.log('📧 Email: contato@brayancontabilidade.com');
});

// ==================== FUNÇÃO GLOBAL PARA CÁLCULO COMPLETO ====================

function calcularTudoCompleto() {
    try {
        // Mostrar loading
        const btnCalcular = document.querySelector('[onclick*="calcularTudoCompleto"], [onclick*="calcularTudo"]');
        if (btnCalcular) {
            const textoOriginal = btnCalcular.innerHTML;
            btnCalcular.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Calculando...';
            btnCalcular.disabled = true;
            
            // Restaurar após 3 segundos
            setTimeout(() => {
                btnCalcular.innerHTML = textoOriginal;
                btnCalcular.disabled = false;
            }, 3000);
        }
        
        // Sequência de cálculos com delays
        setTimeout(() => {
            calcularCustos();
            mostrarToast('Custos calculados', 'info');
        }, 300);
        
        setTimeout(() => {
            calcularResultados();
            mostrarToast('Resultados calculados', 'info');
        }, 800);
        
        setTimeout(() => {
            atualizarDashboard();
            mostrarToast('Dashboard atualizado', 'info');
        }, 1300);
        
        setTimeout(() => {
            if (window.gerenciadorGraficos) {
                sincronizarGraficosComDados();
                mostrarToast('Gráficos atualizados', 'info');
            }
        }, 1800);
        
        setTimeout(() => {
            gerarRecomendacoes();
            mostrarToast('✅ Análise completa realizada com sucesso!', 'success');
            
            // Rolar para o topo
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 2300);
        
    } catch (error) {
        console.error('❌ Erro no cálculo completo:', error);
        mostrarToast('Erro ao calcular análise completa', 'error');
    }
}

// ==================== EXPORTAR FUNÇÕES NECESSÁRIAS ====================

// Nota: As funções window.calcularCustos, window.calcularResultados, etc.
// já foram exportadas nas partes anteriores.

console.log('🎉 TUDO PRONTO! Calculadora MEI Premium Brayan Contabilidade versão 2.0');









