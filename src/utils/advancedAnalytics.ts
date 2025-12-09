// Módulo de análises avançadas - cashflow, sensibilidade, breakeven, etc.

import { 
  DadosEmpresa, 
  ResultadoComparativo, 
  FluxoCaixa, 
  AnaliseSensibilidade,
  BreakevenAnalise,
  ComparacaoRegimes,
  ImpactoProduto,
  AlertaTransicao,
  ROIInvestimento,
  CenarioIVA
} from '@/types/tax.types';
import { compararSistemas } from './taxCalculations';

// 1. SIMULADOR DE CASHFLOW (12 meses)
export function simularFluxoCaixa(
  dados: DadosEmpresa,
  resultado: ResultadoComparativo,
  crescimentoMensal: number = 0 // percentual de crescimento mensal
): FluxoCaixa[] {
  const fluxo: FluxoCaixa[] = [];
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  for (let i = 0; i < 12; i++) {
    const fatorCrescimento = Math.pow(1 + crescimentoMensal / 100, i);
    const receitaBruta = dados.faturamentoMensal * fatorCrescimento;
    const tributosAtual = resultado.sistemaAtual.total * fatorCrescimento;
    const tributosReforma = resultado.posReforma.tributoLiquido * fatorCrescimento;
    const liquidoAtual = receitaBruta - tributosAtual;
    const liquidoReforma = receitaBruta - tributosReforma;
    const diferenca = liquidoReforma - liquidoAtual;

    fluxo.push({
      mes: meses[i],
      receitaBruta,
      tributosAtual,
      tributosReforma,
      liquidoAtual,
      liquidoReforma,
      diferenca
    });
  }

  return fluxo;
}

// 2. ANÁLISE DE SENSIBILIDADE
export function analisarSensibilidade(
  dados: DadosEmpresa,
  cenario: CenarioIVA = 'base'
): AnaliseSensibilidade[] {
  const analises: AnaliseSensibilidade[] = [];
  const variacoes = [-30, -20, -10, 0, 10, 20, 30];

  // Sensibilidade de Faturamento
  variacoes.forEach(variacao => {
    const dadosVariados = { ...dados, faturamentoMensal: dados.faturamentoMensal * (1 + variacao / 100) };
    const resultadoVariado = compararSistemas(dadosVariados, cenario);
    
    analises.push({
      parametro: 'faturamento',
      variacao,
      impactoAtual: resultadoVariado.sistemaAtual.total,
      impactoReforma: resultadoVariado.posReforma.tributoLiquido,
      diferencaImpacto: resultadoVariado.economia
    });
  });

  // Sensibilidade de Custos com Insumos
  variacoes.forEach(variacao => {
    const dadosVariados = { 
      ...dados, 
      custosInsumos: Math.max(0, Math.min(100, dados.custosInsumos * (1 + variacao / 100)))
    };
    const resultadoVariado = compararSistemas(dadosVariados, cenario);
    
    analises.push({
      parametro: 'custos',
      variacao,
      impactoAtual: resultadoVariado.sistemaAtual.total,
      impactoReforma: resultadoVariado.posReforma.tributoLiquido,
      diferencaImpacto: resultadoVariado.economia
    });
  });

  // Sensibilidade de Folha de Pagamento
  variacoes.forEach(variacao => {
    const dadosVariados = { ...dados, folhaPagamento: dados.folhaPagamento * (1 + variacao / 100) };
    const resultadoVariado = compararSistemas(dadosVariados, cenario);
    
    analises.push({
      parametro: 'folha',
      variacao,
      impactoAtual: resultadoVariado.sistemaAtual.total,
      impactoReforma: resultadoVariado.posReforma.tributoLiquido,
      diferencaImpacto: resultadoVariado.economia
    });
  });

  // Sensibilidade de Investimento em Ativo
  variacoes.forEach(variacao => {
    const dadosVariados = { 
      ...dados, 
      investimentoAtivo: Math.max(0, Math.min(100, dados.investimentoAtivo * (1 + variacao / 100)))
    };
    const resultadoVariado = compararSistemas(dadosVariados, cenario);
    
    analises.push({
      parametro: 'investimento',
      variacao,
      impactoAtual: resultadoVariado.sistemaAtual.total,
      impactoReforma: resultadoVariado.posReforma.tributoLiquido,
      diferencaImpacto: resultadoVariado.economia
    });
  });

  return analises;
}

// 3. ANÁLISE DE BREAKEVEN
export function calcularBreakeven(
  dados: DadosEmpresa,
  custoFixoMensal: number = 0,
  cenario: CenarioIVA = 'base'
): BreakevenAnalise {
  // Breakeven = Custos Fixos / (1 - % Tributos - % Custos Variáveis)
  
  const resultadoBase = compararSistemas(dados, cenario);
  
  const cargaAtual = resultadoBase.sistemaAtual.cargaEfetiva / 100;
  const cargaReforma = resultadoBase.posReforma.cargaEfetiva / 100;
  const custosVariaveis = (dados.custosInsumos + dados.folhaPagamento / dados.faturamentoMensal * 100) / 100;
  
  const faturamentoMinimoAtual = custoFixoMensal / (1 - cargaAtual - custosVariaveis);
  const faturamentoMinimoReforma = custoFixoMensal / (1 - cargaReforma - custosVariaveis);
  
  const diferenca = faturamentoMinimoReforma - faturamentoMinimoAtual;
  const economiaNoBreakeven = Math.abs(diferenca) * (diferenca < 0 ? cargaReforma : cargaAtual);

  return {
    faturamentoMinimoAtual,
    faturamentoMinimoReforma,
    diferenca,
    economiaNoBreakeven
  };
}

// 4. COMPARADOR DE REGIMES TRIBUTÁRIOS
export function compararRegimes(
  dados: DadosEmpresa,
  cenario: CenarioIVA = 'base'
): ComparacaoRegimes[] {
  const regimes: Array<{ regime: any; nome: string }> = [
    { regime: 'simples', nome: 'Simples Nacional' },
    { regime: 'presumido', nome: 'Lucro Presumido' },
    { regime: 'real', nome: 'Lucro Real' }
  ];

  const comparacoes = regimes.map(({ regime, nome }) => {
    const dadosRegime = { ...dados, regime: regime as any };
    const resultado = compararSistemas(dadosRegime, cenario);

    // Análise de vantagens e desvantagens
    const vantagens: string[] = [];
    const desvantagens: string[] = [];

    if (regime === 'simples') {
      vantagens.push('Simplificação administrativa');
      vantagens.push('Menor custo de compliance');
      vantagens.push('Unificação de tributos');
      if (dados.faturamentoMensal * 12 <= 4800000) {
        vantagens.push('Alíquotas progressivas favoráveis');
      }
      desvantagens.push('Sem aproveitamento de créditos');
      desvantagens.push('Limite de faturamento R$ 4,8 mi/ano');
    } else if (regime === 'presumido') {
      vantagens.push('Simplicidade contábil média');
      vantagens.push('Alíquotas fixas previsíveis');
      if (dados.faturamentoMensal * 12 <= 78000000) {
        vantagens.push('Elegível até R$ 78 mi/ano');
      }
      desvantagens.push('Sem aproveitamento total de créditos');
      desvantagens.push('Base presumida pode ser desvantajosa');
    } else {
      vantagens.push('Aproveitamento integral de créditos');
      vantagens.push('Maior precisão tributária');
      vantagens.push('Ideal para margens baixas');
      desvantagens.push('Complexidade contábil alta');
      desvantagens.push('Custos de compliance elevados');
    }

    return {
      regime,
      nomeRegime: nome,
      cargaTributariaAtual: resultado.sistemaAtual.cargaEfetiva,
      cargaTributariaReforma: resultado.posReforma.cargaEfetiva,
      economiaAnual: resultado.economiaAnual,
      vantagens,
      desvantagens,
      recomendado: false // será calculado depois
    };
  });

  // Marcar o mais vantajoso como recomendado
  const maisEconomico = comparacoes.reduce((prev, current) => 
    current.economiaAnual > prev.economiaAnual ? current : prev
  );
  maisEconomico.recomendado = true;

  return comparacoes;
}

// 5. SIMULADOR DE IMPACTO POR PRODUTO
export function simularImpactoProdutos(
  dados: DadosEmpresa,
  produtos: Array<{ nome: string; margemAtual: number; participacao: number }>,
  cenario: CenarioIVA = 'base'
): ImpactoProduto[] {
  const resultado = compararSistemas(dados, cenario);
  const variacaoCarga = resultado.posReforma.cargaEfetiva - resultado.sistemaAtual.cargaEfetiva;

  return produtos.map(produto => {
    const margemPosReforma = produto.margemAtual + variacaoCarga;
    const variacaoMargem = margemPosReforma - produto.margemAtual;

    let recomendacao = '';
    if (variacaoMargem > 2) {
      recomendacao = '✅ Aumentar investimento - margem melhora significativamente';
    } else if (variacaoMargem > 0) {
      recomendacao = '➡️ Manter estratégia - margem melhora levemente';
    } else if (variacaoMargem > -2) {
      recomendacao = '⚠️ Revisar precificação - margem reduz levemente';
    } else {
      recomendacao = '❌ Reavaliar viabilidade - margem deteriora significativamente';
    }

    return {
      produto: produto.nome,
      margemAtual: produto.margemAtual,
      margemPosReforma,
      variacaoMargem,
      recomendacao
    };
  });
}

// 6. ALERTAS E LEMBRETES DE TRANSIÇÃO
export function gerarAlertasTransicao(anoAtual: number = new Date().getFullYear()): AlertaTransicao[] {
  const alertas: AlertaTransicao[] = [
    {
      data: '2026-01-01',
      tipo: 'mudanca',
      titulo: 'Início do Período de Teste',
      descricao: 'CBS e IBS começam em 0,1% para teste dos sistemas',
      prioridade: 'media'
    },
    {
      data: '2027-01-01',
      tipo: 'mudanca',
      titulo: 'CBS Entra em Vigor (27%)',
      descricao: 'Contribuição sobre Bens e Serviços substitui PIS/COFINS parcialmente',
      prioridade: 'alta'
    },
    {
      data: '2027-06-30',
      tipo: 'prazo',
      titulo: 'Prazo: Adequação de Sistemas',
      descricao: 'Sistemas contábeis devem estar aptos para CBS',
      prioridade: 'alta'
    },
    {
      data: '2028-01-01',
      tipo: 'mudanca',
      titulo: 'CBS Completo - Fim PIS/COFINS',
      descricao: 'CBS substitui totalmente PIS e COFINS',
      prioridade: 'alta'
    },
    {
      data: '2029-01-01',
      tipo: 'mudanca',
      titulo: 'IBS Começa (10%)',
      descricao: 'Imposto sobre Bens e Serviços inicia substituição gradual de ICMS/ISS',
      prioridade: 'alta'
    },
    {
      data: '2029-12-31',
      tipo: 'prazo',
      titulo: 'Prazo: Recadastramento Estadual',
      descricao: 'Empresas devem se recadastrar para o IBS',
      prioridade: 'media'
    },
    {
      data: '2030-01-01',
      tipo: 'mudanca',
      titulo: 'IBS 30% - Transição Acelerada',
      descricao: 'IBS aumenta para 30% da alíquota final',
      prioridade: 'media'
    },
    {
      data: '2031-01-01',
      tipo: 'mudanca',
      titulo: 'IBS 50% - Meio da Transição',
      descricao: 'IBS atinge metade da implementação',
      prioridade: 'media'
    },
    {
      data: '2032-01-01',
      tipo: 'mudanca',
      titulo: 'IBS 90% - Quase Completo',
      descricao: 'Penúltimo ano de transição',
      prioridade: 'baixa'
    },
    {
      data: '2032-12-31',
      tipo: 'prazo',
      titulo: 'Prazo: Fim do ICMS/ISS',
      descricao: 'Último ano de cobrança de ICMS e ISS',
      prioridade: 'alta'
    },
    {
      data: '2033-01-01',
      tipo: 'mudanca',
      titulo: '✅ Reforma Completa',
      descricao: 'IVA Dual (CBS + IBS) totalmente implementado',
      prioridade: 'alta'
    }
  ];

  // Calcular dias restantes
  const hoje = new Date();
  return alertas.map(alerta => {
    const dataAlerta = new Date(alerta.data);
    const diffTime = dataAlerta.getTime() - hoje.getTime();
    const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      ...alerta,
      diasRestantes: diasRestantes > 0 ? diasRestantes : undefined
    };
  }).filter(alerta => {
    // Mostrar apenas alertas futuros ou recentes (últimos 90 dias)
    return !alerta.diasRestantes || alerta.diasRestantes > -90;
  });
}

// 7. CALCULADORA DE ROI DE INVESTIMENTOS
export function calcularROIInvestimentos(
  economiaAnual: number
): ROIInvestimento[] {
  const investimentos: ROIInvestimento[] = [
    {
      tipo: 'software',
      investimento: 15000,
      economiaAnual: economiaAnual * 0.15, // Software economiza 15% por eficiência
      payback: 0,
      roiPercentual: 0,
      recomendado: false
    },
    {
      tipo: 'consultoria',
      investimento: 50000,
      economiaAnual: economiaAnual * 0.25, // Consultoria pode economizar 25%
      payback: 0,
      roiPercentual: 0,
      recomendado: false
    },
    {
      tipo: 'treinamento',
      investimento: 8000,
      economiaAnual: economiaAnual * 0.08, // Treinamento economiza 8%
      payback: 0,
      roiPercentual: 0,
      recomendado: false
    },
    {
      tipo: 'reestruturacao',
      investimento: 120000,
      economiaAnual: economiaAnual * 0.40, // Reestruturação completa 40%
      payback: 0,
      roiPercentual: 0,
      recomendado: false
    }
  ];

  return investimentos.map(inv => {
    const payback = inv.economiaAnual > 0 ? (inv.investimento / inv.economiaAnual) * 12 : 999;
    const roiPercentual = inv.investimento > 0 ? ((inv.economiaAnual - inv.investimento) / inv.investimento) * 100 : 0;
    const recomendado = payback <= 18 && roiPercentual > 30; // ROI em 18 meses e >30%

    return {
      ...inv,
      payback: Math.round(payback),
      roiPercentual: Math.round(roiPercentual),
      recomendado
    };
  });
}
