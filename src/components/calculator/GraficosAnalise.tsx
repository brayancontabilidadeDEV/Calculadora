import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResultadoComparativo, DadosEmpresa, CenarioIVA } from '@/types/tax.types';
import { formatarMoeda, ALIQUOTAS_IVA } from '@/utils/taxCalculations';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface Props {
  resultado: ResultadoComparativo;
  dados: DadosEmpresa;
  cenario: CenarioIVA;
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function GraficosAnalise({ resultado, dados, cenario }: Props) {
  // Dados para comparativo de carga
  const dadosComparativo = [
    {
      periodo: 'Sistema Atual',
      tributos: resultado.sistemaAtual.total,
      carga: resultado.sistemaAtual.cargaEfetiva,
      liquido: dados.faturamentoMensal - resultado.sistemaAtual.total
    },
    {
      periodo: 'Pós-Reforma',
      tributos: resultado.posReforma.tributoLiquido,
      carga: resultado.posReforma.cargaEfetiva,
      liquido: dados.faturamentoMensal - resultado.posReforma.tributoLiquido
    }
  ];

  // Composição do IVA
  const composicaoIVA = [
    { nome: 'CBS (Federal)', valor: resultado.posReforma.cbs },
    { nome: 'IBS (Est/Mun)', valor: resultado.posReforma.ibs },
    { nome: 'Crédito Insumos', valor: -resultado.posReforma.creditoInsumos },
    { nome: 'Crédito Ativo', valor: -resultado.posReforma.creditoAtivo },
  ].filter(item => Math.abs(item.valor) > 0);

  // Timeline de transição
  const timeline = [
    { ano: 2025, cargaAtual: resultado.sistemaAtual.cargaEfetiva, cargaReforma: 0 },
    { ano: 2026, cargaAtual: resultado.sistemaAtual.cargaEfetiva, cargaReforma: 0.2 },
    { ano: 2027, cargaAtual: resultado.sistemaAtual.cargaEfetiva * 0.7, cargaReforma: resultado.posReforma.cargaEfetiva * 0.3 },
    { ano: 2028, cargaAtual: resultado.sistemaAtual.cargaEfetiva * 0.5, cargaReforma: resultado.posReforma.cargaEfetiva * 0.5 },
    { ano: 2029, cargaAtual: resultado.sistemaAtual.cargaEfetiva * 0.3, cargaReforma: resultado.posReforma.cargaEfetiva * 0.7 },
    { ano: 2030, cargaAtual: resultado.sistemaAtual.cargaEfetiva * 0.2, cargaReforma: resultado.posReforma.cargaEfetiva * 0.8 },
    { ano: 2031, cargaAtual: resultado.sistemaAtual.cargaEfetiva * 0.1, cargaReforma: resultado.posReforma.cargaEfetiva * 0.9 },
    { ano: 2032, cargaAtual: resultado.sistemaAtual.cargaEfetiva * 0.05, cargaReforma: resultado.posReforma.cargaEfetiva * 0.95 },
    { ano: 2033, cargaAtual: 0, cargaReforma: resultado.posReforma.cargaEfetiva }
  ];

  // Comparação por cenário
  const cenarios = [
    { nome: 'Otimista\n25%', atual: resultado.sistemaAtual.total, reforma: dados.faturamentoMensal * ALIQUOTAS_IVA.otimista * 0.6 },
    { nome: 'Base\n26,5%', atual: resultado.sistemaAtual.total, reforma: dados.faturamentoMensal * ALIQUOTAS_IVA.base * 0.6 },
    { nome: 'Pessimista\n28%', atual: resultado.sistemaAtual.total, reforma: dados.faturamentoMensal * ALIQUOTAS_IVA.pessimista * 0.6 }
  ];

  // Distribuição de tributos atual
  const distribuicaoAtual = [
    { nome: 'PIS', valor: resultado.sistemaAtual.pis },
    { nome: 'COFINS', valor: resultado.sistemaAtual.cofins },
    { nome: 'ICMS', valor: resultado.sistemaAtual.icms },
    { nome: 'ISS', valor: resultado.sistemaAtual.iss },
    { nome: 'IRPJ', valor: resultado.sistemaAtual.irpj },
    { nome: 'CSLL', valor: resultado.sistemaAtual.csll },
    { nome: 'CPP', valor: resultado.sistemaAtual.cpp }
  ].filter(item => item.valor > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="font-semibold">{payload[0].payload.periodo || payload[0].payload.ano}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.name.includes('carga') ? `${entry.value.toFixed(2)}%` : formatarMoeda(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-6">
      {/* Comparativo Geral */}
      <Card>
        <CardHeader>
          <CardTitle>Comparativo de Carga Tributária</CardTitle>
          <CardDescription>Valores mensais em reais e carga efetiva percentual</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={dadosComparativo}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="periodo" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="tributos" fill="#8b5cf6" name="Tributos (R$)" />
              <Bar yAxisId="left" dataKey="liquido" fill="#10b981" name="Líquido (R$)" />
              <Line yAxisId="right" type="monotone" dataKey="carga" stroke="#f59e0b" strokeWidth={2} name="Carga (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Composição IVA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Composição do IVA</CardTitle>
            <CardDescription>Detalhamento do cálculo do IVA líquido</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={composicaoIVA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="nome" type="category" width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="valor" fill="#3b82f6">
                  {composicaoIVA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.valor < 0 ? '#10b981' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição Atual de Tributos</CardTitle>
            <CardDescription>Composição da carga tributária vigente</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distribuicaoAtual}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.nome} ${((entry.valor / resultado.sistemaAtual.total) * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {distribuicaoAtual.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Timeline de Transição */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução da Carga Tributária (2025-2033)</CardTitle>
          <CardDescription>Transição gradual do sistema atual para o IVA Dual</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ano" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="cargaAtual" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Sistema Atual (%)" />
              <Area type="monotone" dataKey="cargaReforma" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Pós-Reforma (%)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-secondary/50 rounded">
              <div className="font-semibold">2026</div>
              <div className="text-xs text-muted-foreground">Fase Teste (0,1%)</div>
            </div>
            <div className="p-3 bg-secondary/50 rounded">
              <div className="font-semibold">2027-2028</div>
              <div className="text-xs text-muted-foreground">CBS substitui PIS/COFINS</div>
            </div>
            <div className="p-3 bg-secondary/50 rounded">
              <div className="font-semibold">2029</div>
              <div className="text-xs text-muted-foreground">IBS inicia (10%)</div>
            </div>
            <div className="p-3 bg-secondary/50 rounded">
              <div className="font-semibold">2033</div>
              <div className="text-xs text-muted-foreground">Sistema Completo (100%)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparação por Cenário */}
      <Card>
        <CardHeader>
          <CardTitle>Análise de Sensibilidade por Cenário</CardTitle>
          <CardDescription>Impacto de diferentes alíquotas IVA na carga tributária</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cenarios}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="atual" fill="#64748b" name="Sistema Atual" />
              <Bar dataKey="reforma" fill="#8b5cf6" name="Pós-Reforma" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
