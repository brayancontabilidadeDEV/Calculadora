// Sistema de recomendações personalizadas baseado em IA tributária

import { DadosEmpresa, ResultadoComparativo, Recomendacao, ComparativoEstado, ComparativoPais } from '@/types/tax.types';
import { ICMS_ESTADOS } from './taxCalculations';

export function gerarRecomendacoes(
  dados: DadosEmpresa,
  resultado: ResultadoComparativo
): Recomendacao[] {
  const recomendacoes: Recomendacao[] = [];
  
  // Análise de economia/aumento
  if (resultado.economia > 0) {
    recomendacoes.push({
      tipo: 'otimizacao',
      prioridade: 'alta',
      titulo: 'Preparação para Transição Favorável',
      descricao: `A reforma trará economia estimada de ${formatMoney(resultado.economiaAnual)} ao ano. Prepare-se antecipadamente para maximizar benefícios.`,
      impactoEstimado: resultado.economiaAnual,
      prazo: 'Imediato - 6 meses',
      acoes: [
        'Revisar contratos de fornecimento para garantir créditos fiscais',
        'Implementar sistema ERP compatível com IVA',
        'Treinar equipe contábil nos novos procedimentos',
        'Documentar processos atuais para comparação futura'
      ]
    });
  } else if (resultado.economia < 0) {
    recomendacoes.push({
      tipo: 'planejamento',
      prioridade: 'alta',
      titulo: 'Mitigação de Aumento de Carga Tributária',
      descricao: `A reforma pode aumentar custos em ${formatMoney(Math.abs(resultado.economiaAnual))} ao ano. Ações urgentes são necessárias.`,
      impactoEstimado: resultado.economiaAnual,
      prazo: 'Urgente - 3 meses',
      acoes: [
        'Avaliar reprecificação de produtos/serviços',
        'Considerar mudança de estado ou estrutura operacional',
        'Revisar cadeia de fornecedores para maximizar créditos',
        'Analisar possibilidade de exportação (alíquota zero)',
        'Consultar especialista para planejamento tributário'
      ]
    });
  }

  // Análise de créditos fiscais
  if (dados.custosInsumos < 40) {
    recomendacoes.push({
      tipo: 'otimizacao',
      prioridade: 'media',
      titulo: 'Oportunidade: Aumentar Créditos Fiscais',
      descricao: 'Sua empresa tem baixo aproveitamento de créditos. Considere aumentar compras de insumos tributados.',
      impactoEstimado: dados.faturamentoMensal * 0.05 * 12,
      prazo: '6-12 meses',
      acoes: [
        'Mapear toda cadeia de fornecedores',
        'Priorizar fornecedores com nota fiscal completa',
        'Verticalizar processos quando viável',
        'Revisar política de make or buy'
      ]
    });
  }

  // Análise de investimento em ativo
  if (dados.investimentoAtivo < 5 && resultado.economia < 0) {
    recomendacoes.push({
      tipo: 'estruturacao',
      prioridade: 'media',
      titulo: 'Investimento em Ativo Imobilizado',
      descricao: 'Investir em máquinas e equipamentos gera créditos fiscais parcelados em 48 meses.',
      impactoEstimado: dados.faturamentoMensal * 0.10 * 0.265 * 12,
      prazo: '12-24 meses',
      acoes: [
        'Planejar investimentos em modernização',
        'Aproveitar créditos de ativo imobilizado',
        'Considerar leasing para flexibilidade',
        'Alinhar investimentos com cronograma da reforma'
      ]
    });
  }

  // Análise de regime tributário
  if (dados.regime === 'simples' && dados.faturamentoMensal * 12 > 3600000) {
    recomendacoes.push({
      tipo: 'mudanca',
      prioridade: 'alta',
      titulo: 'Avaliar Mudança de Regime Tributário',
      descricao: 'Próximo ao limite do Simples Nacional. Lucro Presumido ou Real podem ser mais vantajosos com IVA.',
      impactoEstimado: dados.faturamentoMensal * 0.03 * 12,
      prazo: 'Até 31/Janeiro',
      acoes: [
        'Simular carga no Lucro Presumido',
        'Calcular lucro real médio dos últimos 12 meses',
        'Considerar novo regime simplificado pós-reforma',
        'Tomar decisão até janeiro para mudança no ano seguinte'
      ]
    });
  }

  // Análise de categoria IVA
  if (dados.categoriaIVA === 'padrao') {
    recomendacoes.push({
      tipo: 'otimizacao',
      prioridade: 'media',
      titulo: 'Verificar Elegibilidade para Alíquotas Reduzidas',
      descricao: 'Produtos de saúde, educação e alimentos selecionados têm alíquotas reduzidas. Verifique sua lista de produtos.',
      impactoEstimado: dados.faturamentoMensal * 0.06 * 12,
      prazo: '3-6 meses',
      acoes: [
        'Revisar classificação fiscal (NCM) de todos produtos',
        'Segregar produtos com direito a alíquota reduzida',
        'Obter parecer técnico sobre enquadramento',
        'Ajustar sistema para aplicação diferenciada'
      ]
    });
  }

  // Análise comparativa de estados
  const estadosMelhores = compararEstados(dados).slice(0, 3);
  if (estadosMelhores[0].estado !== dados.estado && estadosMelhores[0].variacao < -10) {
    recomendacoes.push({
      tipo: 'mudanca',
      prioridade: 'baixa',
      titulo: 'Avaliar Mudança de Estado',
      descricao: `${estadosMelhores[0].nomeEstado} oferece economia potencial de ${estadosMelhores[0].variacao.toFixed(1)}% em relação ao seu estado.`,
      impactoEstimado: Math.abs(resultado.economiaAnual * 0.15),
      prazo: '12-24 meses',
      acoes: [
        'Analisar custos de mudança (logística, mão de obra)',
        'Verificar incentivos fiscais estaduais',
        'Considerar filial ao invés de mudança total',
        'Consultar viabilidade operacional e mercado'
      ]
    });
  }

  // Recomendação de consultoria
  if (Math.abs(resultado.economiaAnual) > 100000) {
    recomendacoes.push({
      tipo: 'planejamento',
      prioridade: 'alta',
      titulo: 'Consultoria Tributária Especializada Recomendada',
      descricao: 'O impacto financeiro justifica investimento em consultoria especializada para planejamento detalhado.',
      impactoEstimado: 50000, // Custo estimado consultoria
      prazo: 'Imediato',
      acoes: [
        'Contratar consultoria especializada em reforma tributária',
        'Realizar due diligence tributária completa',
        'Desenvolver plano de transição personalizado',
        'Estabelecer governança tributária'
      ]
    });
  }

  return recomendacoes.sort((a, b) => {
    const prioridadeScore = { alta: 3, media: 2, baixa: 1 };
    return prioridadeScore[b.prioridade] - prioridadeScore[a.prioridade];
  });
}

export function compararEstados(dados: DadosEmpresa): ComparativoEstado[] {
  const estados = [
    { codigo: 'SP' as const, nome: 'São Paulo' },
    { codigo: 'RJ' as const, nome: 'Rio de Janeiro' },
    { codigo: 'MG' as const, nome: 'Minas Gerais' },
    { codigo: 'RS' as const, nome: 'Rio Grande do Sul' },
    { codigo: 'PR' as const, nome: 'Paraná' },
    { codigo: 'SC' as const, nome: 'Santa Catarina' },
    { codigo: 'BA' as const, nome: 'Bahia' },
    { codigo: 'DF' as const, nome: 'Distrito Federal' },
    { codigo: 'ES' as const, nome: 'Espírito Santo' },
    { codigo: 'GO' as const, nome: 'Goiás' }
  ];

  const comparativos: ComparativoEstado[] = estados.map(estado => {
    const icmsAtual = ICMS_ESTADOS[estado.codigo];
    const cargaAtual = dados.faturamentoMensal * icmsAtual;
    
    // Pós-reforma, IBS será unificado nacionalmente
    const cargaPosReforma = dados.faturamentoMensal * 0.106; // 40% de 26,5%
    
    const variacao = ((cargaPosReforma - cargaAtual) / cargaAtual) * 100;

    return {
      estado: estado.codigo,
      nomeEstado: estado.nome,
      cargaAtual: (icmsAtual * 100),
      cargaPosReforma: 10.6,
      variacao,
      vantagens: getVantagensEstado(estado.codigo),
      desvantagens: getDesvantagensEstado(estado.codigo)
    };
  });

  return comparativos.sort((a, b) => a.variacao - b.variacao);
}

export function compararPaises(): ComparativoPais[] {
  return [
    {
      pais: 'Portugal',
      cargaTributaria: 24.6,
      ivaRate: 23,
      facilidadeNegocios: 39,
      custoOperacional: 'Médio',
      vantagens: [
        'Idioma português facilita operação',
        'Porta de entrada para União Europeia',
        'Regime fiscal favorável para startups',
        'Acordo de dupla tributação com Brasil'
      ],
      desvantagens: [
        'Mercado interno pequeno',
        'Custos trabalhistas elevados',
        'Burocracia ainda presente'
      ]
    },
    {
      pais: 'Uruguai',
      cargaTributaria: 18.5,
      ivaRate: 22,
      facilidadeNegocios: 101,
      custoOperacional: 'Médio-Baixo',
      vantagens: [
        'Proximidade geográfica',
        'Zona franca com isenções',
        'Estabilidade política e jurídica',
        'Mercosul facilita comércio'
      ],
      desvantagens: [
        'Mercado interno muito pequeno',
        'Custos de importação elevados',
        'Infraestrutura limitada'
      ]
    },
    {
      pais: 'Emirados Árabes',
      cargaTributaria: 5.5,
      ivaRate: 5,
      facilidadeNegocios: 16,
      custoOperacional: 'Alto',
      vantagens: [
        'Carga tributária mínima',
        'Zona franca 100% isenta',
        'Hub logístico global',
        'Infraestrutura de primeira'
      ],
      desvantagens: [
        'Custos operacionais muito altos',
        'Distância do Brasil',
        'Diferenças culturais significativas',
        'Custos de vida elevados'
      ]
    },
    {
      pais: 'Paraguai',
      cargaTributaria: 15.2,
      ivaRate: 10,
      facilidadeNegocios: 125,
      custoOperacional: 'Baixo',
      vantagens: [
        'Carga tributária muito baixa',
        'IVA de apenas 10%',
        'Custos operacionais reduzidos',
        'Mercosul'
      ],
      desvantagens: [
        'Infraestrutura precária',
        'Instabilidade política',
        'Mercado interno limitado',
        'Percepção internacional negativa'
      ]
    },
    {
      pais: 'Estados Unidos',
      cargaTributaria: 26.5,
      ivaRate: 0, // Não tem IVA federal
      facilidadeNegocios: 6,
      custoOperacional: 'Alto',
      vantagens: [
        'Maior mercado consumidor do mundo',
        'Ambiente favorável para inovação',
        'Acesso a investimentos',
        'Sem IVA federal (apenas sales tax estaduais)'
      ],
      desvantagens: [
        'Complexidade regulatória',
        'Custos operacionais elevados',
        'Visto e imigração complexos',
        'Competição intensa'
      ]
    }
  ];
}

function getVantagensEstado(estado: string): string[] {
  const vantagens: Record<string, string[]> = {
    SP: ['Maior mercado consumidor', 'Infraestrutura desenvolvida', 'Ecossistema de negócios'],
    SC: ['Menor ICMS', 'Qualidade de vida', 'Incentivos fiscais'],
    PR: ['Logística favorável', 'Custos operacionais moderados', 'Incentivos industriais'],
    ES: ['Portos eficientes', 'Menor burocracia', 'Incentivos setoriais'],
    GO: ['Posição central', 'Incentivos fiscais generosos', 'Custos reduzidos']
  };
  return vantagens[estado] || ['Analisar localmente'];
}

function getDesvantagensEstado(estado: string): string[] {
  const desvantagens: Record<string, string[]> = {
    RJ: ['ICMS elevado', 'Situação fiscal crítica', 'Segurança'],
    BA: ['Infraestrutura limitada', 'ICMS alto', 'Distância dos principais mercados'],
    MA: ['Infraestrutura precária', 'Mercado limitado', 'Logística difícil']
  };
  return desvantagens[estado] || ['Avaliar caso a caso'];
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}
