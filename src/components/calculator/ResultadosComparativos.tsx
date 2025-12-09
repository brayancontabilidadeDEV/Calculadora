import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ResultadoComparativo, DadosEmpresa, CenarioIVA } from '@/types/tax.types';
import { formatarMoeda, formatarPercentual, ALIQUOTAS_IVA } from '@/utils/taxCalculations';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  resultado: ResultadoComparativo;
  dados: DadosEmpresa;
  cenario: CenarioIVA;
}

export default function ResultadosComparativos({ resultado, dados, cenario }: Props) {
  const { sistemaAtual, posReforma, economia, economiaAnual, variacaoPercentual } = resultado;

  const getStatusIcon = () => {
    if (economia > 0) return <TrendingDown className="w-5 h-5 text-green-600" />;
    if (economia < 0) return <TrendingUp className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  const getStatusBadge = () => {
    if (economia > 0) return <Badge className="bg-green-600">ECONOMIA</Badge>;
    if (economia < 0) return <Badge className="bg-red-600">AUMENTO</Badge>;
    return <Badge variant="secondary">NEUTRO</Badge>;
  };

  const getStatusMessage = () => {
    if (economia > 0) return 'Reforma será favorável para sua empresa';
    if (economia < 0) return 'Reforma aumentará carga tributária';
    return 'Impacto neutro esperado';
  };

  return (
    <div className="grid gap-6">
      {/* Resumo Executivo */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Resumo Executivo da Simulação</CardTitle>
              <CardDescription>Análise comparativa: Sistema Atual vs Pós-Reforma</CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-secondary/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Carga Atual</div>
              <div className="text-3xl font-bold text-primary">{formatarPercentual(sistemaAtual.cargaEfetiva)}</div>
              <div className="text-xs text-muted-foreground mt-2">{formatarMoeda(sistemaAtual.total)}/mês</div>
            </div>
            <div className="text-center p-4 bg-secondary/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Pós-Reforma</div>
              <div className="text-3xl font-bold text-primary">{formatarPercentual(posReforma.cargaEfetiva)}</div>
              <div className="text-xs text-muted-foreground mt-2">{formatarMoeda(posReforma.tributoLiquido)}/mês</div>
            </div>
            <div className="text-center p-4 bg-secondary/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Variação</div>
              <div className={`text-3xl font-bold flex items-center justify-center gap-2 ${
                economia > 0 ? 'text-green-600' : economia < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {getStatusIcon()}
                {formatarPercentual(Math.abs(variacaoPercentual))}
              </div>
            </div>
            <div className="text-center p-4 bg-secondary/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Impacto Anual</div>
              <div className={`text-3xl font-bold ${
                economia > 0 ? 'text-green-600' : economia < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {formatarMoeda(Math.abs(economiaAnual))}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {economia > 0 ? 'Economia' : economia < 0 ? 'Aumento' : 'Neutro'}
              </div>
            </div>
          </div>

          <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${
            economia > 0 ? 'bg-green-50 dark:bg-green-950' : 
            economia < 0 ? 'bg-red-50 dark:bg-red-950' : 
            'bg-gray-50 dark:bg-gray-950'
          }`}>
            {economia > 0 ? <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" /> : 
             economia < 0 ? <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" /> :
             <Minus className="w-5 h-5 text-gray-600 mt-0.5" />}
            <div>
              <p className="font-semibold">{getStatusMessage()}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Cenário {cenario} com alíquota IVA de {formatarPercentual(ALIQUOTAS_IVA[cenario] * 100)}. 
                Simulação para o ano de {dados.anoSimulacao}.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sistema Atual Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle>Sistema Atual (2025) - Detalhamento</CardTitle>
          <CardDescription>Tributos no sistema vigente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-secondary/30 rounded">
              <span className="font-medium">Faturamento Bruto</span>
              <span className="font-bold">{formatarMoeda(dados.faturamentoMensal)}</span>
            </div>

            <div className="space-y-2">
              {sistemaAtual.pis > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">PIS</span>
                  <span className="font-mono">{formatarMoeda(sistemaAtual.pis)}</span>
                </div>
              )}
              {sistemaAtual.cofins > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">COFINS</span>
                  <span className="font-mono">{formatarMoeda(sistemaAtual.cofins)}</span>
                </div>
              )}
              {sistemaAtual.icms > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">ICMS</span>
                  <span className="font-mono">{formatarMoeda(sistemaAtual.icms)}</span>
                </div>
              )}
              {sistemaAtual.iss > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">ISS</span>
                  <span className="font-mono">{formatarMoeda(sistemaAtual.iss)}</span>
                </div>
              )}
              {sistemaAtual.irpj > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">IRPJ</span>
                  <span className="font-mono">{formatarMoeda(sistemaAtual.irpj)}</span>
                </div>
              )}
              {sistemaAtual.csll > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">CSLL</span>
                  <span className="font-mono">{formatarMoeda(sistemaAtual.csll)}</span>
                </div>
              )}
              {sistemaAtual.cpp > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">CPP (sobre folha)</span>
                  <span className="font-mono">{formatarMoeda(sistemaAtual.cpp)}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center font-bold">
                <span>Total de Tributos</span>
                <span className="text-lg">{formatarMoeda(sistemaAtual.total)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
                <span>Carga Efetiva</span>
                <span>{formatarPercentual(sistemaAtual.cargaEfetiva)}</span>
              </div>
              <Progress value={sistemaAtual.cargaEfetiva} className="mt-2" />
            </div>

            <div className="flex justify-between items-center p-3 bg-primary/10 rounded font-bold">
              <span>Faturamento Líquido</span>
              <span>{formatarMoeda(dados.faturamentoMensal - sistemaAtual.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pós-Reforma Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle>Após Reforma ({dados.anoSimulacao}) - Detalhamento IVA Dual</CardTitle>
          <CardDescription>Sistema de tributação pós EC 132/2023</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-secondary/30 rounded">
              <span className="font-medium">Faturamento Bruto</span>
              <span className="font-bold">{formatarMoeda(dados.faturamentoMensal)}</span>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-blue-900 dark:text-blue-100">IVA Dual</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">CBS (Federal)</span>
                  <span className="font-mono">{formatarMoeda(posReforma.cbs)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">IBS (Estadual/Municipal)</span>
                  <span className="font-mono">{formatarMoeda(posReforma.ibs)}</span>
                </div>
                {posReforma.is > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">IS (Imposto Seletivo)</span>
                    <span className="font-mono">{formatarMoeda(posReforma.is)}</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Tributos Brutos</span>
                    <span>{formatarMoeda(posReforma.tributoBruto)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-green-900 dark:text-green-100">Créditos IVA (Não-Cumulativo)</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Crédito de Insumos</span>
                  <span className="font-mono text-green-600">- {formatarMoeda(posReforma.creditoInsumos)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Crédito de Ativo Imobilizado (1/48 mês)</span>
                  <span className="font-mono text-green-600">- {formatarMoeda(posReforma.creditoAtivo)}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center font-bold">
                <span>Tributos Líquidos</span>
                <span className="text-lg">{formatarMoeda(posReforma.tributoLiquido)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
                <span>Carga Efetiva</span>
                <span>{formatarPercentual(posReforma.cargaEfetiva)}</span>
              </div>
              <Progress value={posReforma.cargaEfetiva} className="mt-2" />
            </div>

            <div className="flex justify-between items-center p-3 bg-primary/10 rounded font-bold">
              <span>Faturamento Líquido</span>
              <span>{formatarMoeda(dados.faturamentoMensal - posReforma.tributoLiquido)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
