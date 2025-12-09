// Componente principal da calculadora de reforma tributária

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, FileText, TrendingUp, Globe, History, Download } from 'lucide-react';
import { toast } from 'sonner';

import FormularioDados from './calculator/FormularioDados';
import ResultadosComparativos from './calculator/ResultadosComparativos';
import GraficosAnalise from './calculator/GraficosAnalise';
import RecomendacoesPersonalizadas from './calculator/RecomendacoesPersonalizadas';
import ComparativoCenarios from './calculator/ComparativoCenarios';
import HistoricoSimulacoes from './calculator/HistoricoSimulacoes';
import ExportacaoRelatorios from './calculator/ExportacaoRelatorios';
import AnalisesAvancadas from './calculator/AnalisesAvancadas';
import ComparadorMultiplo from './calculator/ComparadorMultiplo';

import { DadosEmpresa, ResultadoComparativo, CenarioIVA, SimulacaoSalva } from '@/types/tax.types';
import { compararSistemas } from '@/utils/taxCalculations';
import { gerarRecomendacoes } from '@/utils/recommendations';

const dadosIniciais: DadosEmpresa = {
  faturamentoMensal: 100000,
  regime: 'simples',
  setor: 'comercio',
  estado: 'SP',
  folhaPagamento: 30000,
  regimeApuracao: 'caixa',
  custosInsumos: 40,
  investimentoAtivo: 5,
  categoriaIVA: 'padrao',
  anoSimulacao: 2033
};

export default function TaxCalculator() {
  const [dadosEmpresa, setDadosEmpresa] = useState<DadosEmpresa>(dadosIniciais);
  const [cenarioSelecionado, setCenarioSelecionado] = useState<CenarioIVA>('base');
  const [resultado, setResultado] = useState<ResultadoComparativo | null>(null);
  const [historico, setHistorico] = useState<SimulacaoSalva[]>([]);
  const [modoEscuro, setModoEscuro] = useState(false);

  // Carregar histórico do localStorage
  useEffect(() => {
    const historicoSalvo = localStorage.getItem('historico-simulacoes');
    if (historicoSalvo) {
      setHistorico(JSON.parse(historicoSalvo));
    }
  }, []);

  // Calcular automaticamente quando dados mudarem
  useEffect(() => {
    calcularComparativo();
  }, [dadosEmpresa, cenarioSelecionado]);

  const calcularComparativo = () => {
    try {
      const resultadoCalculo = compararSistemas(dadosEmpresa, cenarioSelecionado);
      setResultado(resultadoCalculo);
    } catch (error) {
      toast.error('Erro ao calcular tributação');
      console.error(error);
    }
  };

  const salvarSimulacao = (nome: string) => {
    if (!resultado) return;

    const novaSimulacao: SimulacaoSalva = {
      id: Date.now().toString(),
      data: new Date().toISOString(),
      nomeSimulacao: nome,
      dadosEmpresa: { ...dadosEmpresa },
      resultado: { ...resultado }
    };

    const novoHistorico = [novaSimulacao, ...historico].slice(0, 20);
    setHistorico(novoHistorico);
    localStorage.setItem('historico-simulacoes', JSON.stringify(novoHistorico));
    
    toast.success('Simulação salva com sucesso!');
  };

  const carregarSimulacao = (simulacao: SimulacaoSalva) => {
    setDadosEmpresa(simulacao.dadosEmpresa);
    toast.info('Simulação carregada');
  };

  const excluirSimulacao = (id: string) => {
    const novoHistorico = historico.filter(s => s.id !== id);
    setHistorico(novoHistorico);
    localStorage.setItem('historico-simulacoes', JSON.stringify(novoHistorico));
    toast.success('Simulação excluída');
  };

  const toggleModoEscuro = () => {
    setModoEscuro(!modoEscuro);
    document.documentElement.classList.toggle('dark');
  };

  const recomendacoes = resultado ? gerarRecomendacoes(dadosEmpresa, resultado) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-xl">
                B
              </div>
              <div>
                <h1 className="text-2xl font-bold">Calculadora Reforma Tributária</h1>
                <p className="text-sm text-muted-foreground">Análise Completa EC 132/2023 | Brayan Araujo Contador</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={toggleModoEscuro}>
                {modoEscuro ? '☀️' : '🌙'} Modo {modoEscuro ? 'Claro' : 'Escuro'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Aviso Legal */}
      <div className="bg-amber-50 dark:bg-amber-950 border-y border-amber-200 dark:border-amber-800 py-3">
        <div className="container mx-auto px-4">
          <p className="text-sm text-amber-900 dark:text-amber-100 text-center">
            ⚠️ <strong>AVISO:</strong> Simulação ilustrativa baseada em estimativas. Valores podem mudar conforme regulamentação. 
            Não substitui consultoria profissional. | Última atualização: Dezembro/2024
          </p>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="calculadora" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-2">
            <TabsTrigger value="calculadora" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Calculadora</span>
            </TabsTrigger>
            <TabsTrigger value="resultados" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Resultados</span>
            </TabsTrigger>
            <TabsTrigger value="graficos" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Gráficos</span>
            </TabsTrigger>
            <TabsTrigger value="recomendacoes" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Recomendações</span>
            </TabsTrigger>
            <TabsTrigger value="comparativos" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Cenários</span>
            </TabsTrigger>
            <TabsTrigger value="avancadas" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Avançadas</span>
            </TabsTrigger>
            <TabsTrigger value="comparador" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Comparador</span>
            </TabsTrigger>
            <TabsTrigger value="historico" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculadora" className="space-y-6">
            <FormularioDados
              dados={dadosEmpresa}
              onDadosChange={setDadosEmpresa}
              cenario={cenarioSelecionado}
              onCenarioChange={setCenarioSelecionado}
              onSalvar={salvarSimulacao}
            />
          </TabsContent>

          <TabsContent value="resultados" className="space-y-6">
            {resultado && (
              <ResultadosComparativos
                resultado={resultado}
                dados={dadosEmpresa}
                cenario={cenarioSelecionado}
              />
            )}
          </TabsContent>

          <TabsContent value="graficos" className="space-y-6">
            {resultado && (
              <GraficosAnalise
                resultado={resultado}
                dados={dadosEmpresa}
                cenario={cenarioSelecionado}
              />
            )}
          </TabsContent>

          <TabsContent value="recomendacoes" className="space-y-6">
            {resultado && (
              <RecomendacoesPersonalizadas
                recomendacoes={recomendacoes}
                resultado={resultado}
                dados={dadosEmpresa}
              />
            )}
          </TabsContent>

          <TabsContent value="comparativos" className="space-y-6">
            <ComparativoCenarios dados={dadosEmpresa} resultado={resultado} />
          </TabsContent>

          <TabsContent value="avancadas" className="space-y-6">
            {resultado && (
              <AnalisesAvancadas
                dados={dadosEmpresa}
                resultado={resultado}
                cenario={cenarioSelecionado}
              />
            )}
          </TabsContent>

          <TabsContent value="comparador" className="space-y-6">
            <ComparadorMultiplo
              historico={historico}
              onExcluir={excluirSimulacao}
            />
          </TabsContent>

          <TabsContent value="historico" className="space-y-6">
            <HistoricoSimulacoes
              historico={historico}
              onCarregar={carregarSimulacao}
              onExcluir={excluirSimulacao}
            />
          </TabsContent>
        </Tabs>

        {/* Exportação */}
        {resultado && (
          <div className="mt-8">
            <ExportacaoRelatorios
              dados={dadosEmpresa}
              resultado={resultado}
              recomendacoes={recomendacoes}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-3">
              B
            </div>
            <h3 className="font-bold text-lg">Brayan Araujo Contador</h3>
            <p className="text-sm text-muted-foreground">Especialista em Reforma Tributária | CRC 1SPXXXXXX</p>
          </div>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground mb-4">
            <a href="mailto:brayancontabilidade@gmail.com" className="hover:text-primary">brayancontabilidade@gmail.com</a>
            <a href="tel:+5521991577383" className="hover:text-primary">(21) 99157-7383</a>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2024 Brayan Araujo Contador. Versão 4.0 Professional - Sistema Completo de Análise Tributária
          </p>
        </div>
      </footer>
    </div>
  );
}
