import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Recomendacao, ResultadoComparativo, DadosEmpresa } from '@/types/tax.types';
import { formatarMoeda } from '@/utils/taxCalculations';
import { AlertCircle, TrendingUp, ArrowRight, CheckCircle, Clock, Target } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface Props {
  recomendacoes: Recomendacao[];
  resultado: ResultadoComparativo;
  dados: DadosEmpresa;
}

export default function RecomendacoesPersonalizadas({ recomendacoes, resultado, dados }: Props) {
  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-600';
      case 'media': return 'bg-amber-600';
      case 'baixa': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'otimizacao': return <TrendingUp className="w-5 h-5" />;
      case 'mudanca': return <ArrowRight className="w-5 h-5" />;
      case 'estruturacao': return <Target className="w-5 h-5" />;
      case 'planejamento': return <AlertCircle className="w-5 h-5" />;
      default: return <CheckCircle className="w-5 h-5" />;
    }
  };

  const recomendacoesAlta = recomendacoes.filter(r => r.prioridade === 'alta');
  const recomendacoesMedia = recomendacoes.filter(r => r.prioridade === 'media');
  const recomendacoesBaixa = recomendacoes.filter(r => r.prioridade === 'baixa');

  return (
    <div className="grid gap-6">
      {/* Resumo das Recomendações */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">Análise e Recomendações Personalizadas</CardTitle>
          <CardDescription>Por Brayan Araujo Contador - CRC 1SPXXXXXX</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-900 dark:text-red-100">Prioridade Alta</span>
              </div>
              <div className="text-3xl font-bold text-red-600">{recomendacoesAlta.length}</div>
              <div className="text-sm text-muted-foreground">Ações urgentes</div>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="font-semibold text-amber-900 dark:text-amber-100">Prioridade Média</span>
              </div>
              <div className="text-3xl font-bold text-amber-600">{recomendacoesMedia.length}</div>
              <div className="text-sm text-muted-foreground">Médio prazo</div>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900 dark:text-blue-100">Prioridade Baixa</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">{recomendacoesBaixa.length}</div>
              <div className="text-sm text-muted-foreground">Oportunidades</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm">
              <strong>Contexto da Análise:</strong> Baseado em faturamento de {formatarMoeda(dados.faturamentoMensal)}/mês 
              no regime {dados.regime} ({dados.setor}), com {resultado.economia > 0 ? 'economia' : 'aumento'} previsto 
              de {formatarMoeda(Math.abs(resultado.economiaAnual))}/ano após a reforma.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recomendações Detalhadas */}
      {recomendacoes.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Recomendações Detalhadas</CardTitle>
            <CardDescription>Plano de ação personalizado para sua empresa</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {recomendacoes.map((rec, index) => (
                <AccordionItem value={`rec-${index}`} key={index}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-start gap-3 text-left w-full">
                      <div className={`p-2 rounded-lg ${
                        rec.prioridade === 'alta' ? 'bg-red-100 dark:bg-red-950' :
                        rec.prioridade === 'media' ? 'bg-amber-100 dark:bg-amber-950' :
                        'bg-blue-100 dark:bg-blue-950'
                      }`}>
                        {getTipoIcon(rec.tipo)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{rec.titulo}</h4>
                          <Badge className={getPrioridadeColor(rec.prioridade)}>
                            {rec.prioridade.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.descricao}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-14 space-y-4">
                      {/* Impacto */}
                      <div className="grid grid-cols-2 gap-4 p-3 bg-secondary/50 rounded-lg">
                        <div>
                          <div className="text-xs text-muted-foreground">Impacto Estimado</div>
                          <div className="font-semibold text-lg">
                            {rec.impactoEstimado > 0 
                              ? formatarMoeda(rec.impactoEstimado) 
                              : formatarMoeda(Math.abs(rec.impactoEstimado))}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Prazo de Implementação</div>
                          <div className="font-semibold text-lg">{rec.prazo}</div>
                        </div>
                      </div>

                      {/* Ações */}
                      <div>
                        <h5 className="font-semibold mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Plano de Ação
                        </h5>
                        <ul className="space-y-2">
                          {rec.acoes.map((acao, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                                {i + 1}
                              </div>
                              <span>{acao}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Alerta */}
                      {rec.prioridade === 'alta' && (
                        <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <strong className="text-red-900 dark:text-red-100">Ação Urgente:</strong>
                            <p className="text-muted-foreground mt-1">
                              Esta recomendação requer atenção imediata devido ao alto impacto potencial no seu negócio.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Situação Estável</h3>
            <p className="text-muted-foreground">
              Não foram identificadas recomendações críticas no momento. Continue monitorando as atualizações da reforma.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Consultoria */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>Precisa de Consultoria Especializada?</CardTitle>
          <CardDescription>Fale diretamente com Brayan Araujo Contador</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Para um planejamento tributário personalizado e aprofundado, agende uma consultoria individual. 
            Vamos analisar todas as particularidades do seu negócio e traçar a melhor estratégia para a transição.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="mailto:brayancontabilidade@gmail.com"
              className="p-4 bg-card border rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="font-semibold mb-1">E-mail</div>
              <div className="text-sm text-muted-foreground">brayancontabilidade@gmail.com</div>
            </a>
            <a 
              href="https://wa.me/5521991577383"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-card border rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="font-semibold mb-1">WhatsApp</div>
              <div className="text-sm text-muted-foreground">(21) 99157-7383</div>
            </a>
            <a 
              href="https://linkedin.com/in/brayanaraujo"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-card border rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="font-semibold mb-1">LinkedIn</div>
              <div className="text-sm text-muted-foreground">linkedin.com/in/brayanaraujo</div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
