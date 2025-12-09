import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimulacaoSalva } from '@/types/tax.types';
import { formatarMoeda } from '@/utils/taxCalculations';
import { Trash2, Upload, Calendar, TrendingDown, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  historico: SimulacaoSalva[];
  onCarregar: (simulacao: SimulacaoSalva) => void;
  onExcluir: (id: string) => void;
}

export default function HistoricoSimulacoes({ historico, onCarregar, onExcluir }: Props) {
  if (historico.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">Nenhuma Simulação Salva</h3>
          <p className="text-muted-foreground">
            Suas simulações salvas aparecerão aqui. Use o botão "Salvar Simulação" na aba Calculadora.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Simulações</CardTitle>
          <CardDescription>
            {historico.length} simulação(ões) salva(s) - Máximo de 20 registros
          </CardDescription>
        </CardHeader>
      </Card>

      {historico.map((sim) => {
        const economia = sim.resultado.economia;
        const dataFormatada = format(new Date(sim.data), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });

        return (
          <Card key={sim.id} className="hover:border-primary/50 transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{sim.nomeSimulacao}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="w-3 h-3" />
                    {dataFormatada}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCarregar(sim)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Carregar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onExcluir(sim.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-secondary/30 rounded">
                  <div className="text-xs text-muted-foreground mb-1">Faturamento</div>
                  <div className="font-semibold">{formatarMoeda(sim.dadosEmpresa.faturamentoMensal)}/mês</div>
                </div>
                <div className="p-3 bg-secondary/30 rounded">
                  <div className="text-xs text-muted-foreground mb-1">Regime</div>
                  <div className="font-semibold capitalize">{sim.dadosEmpresa.regime}</div>
                </div>
                <div className="p-3 bg-secondary/30 rounded">
                  <div className="text-xs text-muted-foreground mb-1">Estado</div>
                  <div className="font-semibold">{sim.dadosEmpresa.estado}</div>
                </div>
                <div className="p-3 bg-secondary/30 rounded">
                  <div className="text-xs text-muted-foreground mb-1">Ano</div>
                  <div className="font-semibold">{sim.dadosEmpresa.anoSimulacao}</div>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-lg flex items-center justify-between bg-gradient-to-r from-primary/10 to-primary/5">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Impacto Anual</div>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {economia > 0 ? (
                      <>
                        <TrendingDown className="w-6 h-6 text-green-600" />
                        <span className="text-green-600">{formatarMoeda(Math.abs(sim.resultado.economiaAnual))}</span>
                      </>
                    ) : economia < 0 ? (
                      <>
                        <TrendingUp className="w-6 h-6 text-red-600" />
                        <span className="text-red-600">{formatarMoeda(Math.abs(sim.resultado.economiaAnual))}</span>
                      </>
                    ) : (
                      <span className="text-gray-600">Neutro</span>
                    )}
                  </div>
                </div>
                <Badge className={economia > 0 ? 'bg-green-600' : economia < 0 ? 'bg-red-600' : 'bg-gray-600'}>
                  {economia > 0 ? 'ECONOMIA' : economia < 0 ? 'AUMENTO' : 'NEUTRO'}
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Carga Atual:</span>
                  <span className="font-semibold">{sim.resultado.sistemaAtual.cargaEfetiva.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pós-Reforma:</span>
                  <span className="font-semibold">{sim.resultado.posReforma.cargaEfetiva.toFixed(2)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
