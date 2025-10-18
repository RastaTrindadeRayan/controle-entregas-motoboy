import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Plus, Calendar, DollarSign, Share2, Trash2, Edit, BarChart3, Download, History, MapPin, Clock } from 'lucide-react'
import './App.css'

function App() {
  // Estados principais
  const [entregas, setEntregas] = useState([])
  const [diarias, setDiarias] = useState([])
  const [dialogEntregaAberto, setDialogEntregaAberto] = useState(false)
  const [dialogDiariaAberto, setDialogDiariaAberto] = useState(false)
  const [dialogEdicaoSemanaAberto, setDialogEdicaoSemanaAberto] = useState(false)
  const [entregaEditando, setEntregaEditando] = useState(null)
  const [diariaEditando, setDiariaEditando] = useState(null)
  const [abaSelecionada, setAbaSelecionada] = useState('hoje')
  const [dataSelecionada, setDataSelecionada] = useState('')
  const [diaEdicaoSemana, setDiaEdicaoSemana] = useState(null)
  
  // Estados do formulário de entrega
  const [clienteEndereco, setClienteEndereco] = useState('')
  const [valorTaxa, setValorTaxa] = useState('')

  // Estados do formulário de diária
  const [localTrabalho, setLocalTrabalho] = useState('')
  const [valorDiaria, setValorDiaria] = useState('')
  const [horarioTrabalho, setHorarioTrabalho] = useState('')

  // Estados para edição do resumo semanal
  const [valorEdicaoSemana, setValorEdicaoSemana] = useState('')

  // Carregar dados do localStorage ao inicializar
  useEffect(() => {
    const entregasSalvas = localStorage.getItem('entregas-motoboy')
    const diariasSalvas = localStorage.getItem('diarias-motoboy')
    
    if (entregasSalvas) {
      setEntregas(JSON.parse(entregasSalvas))
    }
    if (diariasSalvas) {
      setDiarias(JSON.parse(diariasSalvas))
    }
  }, [])

  // Salvar dados no localStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem('entregas-motoboy', JSON.stringify(entregas))
  }, [entregas])

  useEffect(() => {
    localStorage.setItem('diarias-motoboy', JSON.stringify(diarias))
  }, [diarias])

  // Obter data atual formatada
  const obterDataAtual = () => {
    const hoje = new Date()
    return hoje.toISOString().split('T')[0]
  }

  // Filtrar entregas por data
  const obterEntregasPorData = (data) => {
    return entregas.filter(entrega => entrega.data === data)
  }

  // Filtrar diárias por data
  const obterDiariasPorData = (data) => {
    return diarias.filter(diaria => diaria.data === data)
  }

  // Entregas e diárias do dia atual
  const entregasHoje = obterEntregasPorData(obterDataAtual())
  const diariasHoje = obterDiariasPorData(obterDataAtual())

  // Entregas e diárias da data selecionada (para histórico)
  const entregasDataSelecionada = dataSelecionada ? obterEntregasPorData(dataSelecionada) : []
  const diariasDataSelecionada = dataSelecionada ? obterDiariasPorData(dataSelecionada) : []

  // Calcular total de entregas por data
  const calcularTotalEntregasPorData = (data) => {
    return obterEntregasPorData(data).reduce((total, entrega) => total + entrega.valorTaxa, 0)
  }

  // Calcular total de diárias por data
  const calcularTotalDiariasPorData = (data) => {
    return obterDiariasPorData(data).reduce((total, diaria) => total + diaria.valorDiaria, 0)
  }

  // Calcular total geral por data (entregas + diárias)
  const calcularTotalGeralPorData = (data) => {
    return calcularTotalEntregasPorData(data) + calcularTotalDiariasPorData(data)
  }

  // Obter estatísticas da semana
  const obterEstatisticasSemana = () => {
    const hoje = new Date()
    const inicioSemana = new Date(hoje)
    inicioSemana.setDate(hoje.getDate() - hoje.getDay())
    
    const diasSemana = []
    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicioSemana)
      dia.setDate(inicioSemana.getDate() + i)
      const dataStr = dia.toISOString().split('T')[0]
      const entregasDia = obterEntregasPorData(dataStr)
      const diariasDia = obterDiariasPorData(dataStr)
      const totalEntregas = entregasDia.reduce((sum, e) => sum + e.valorTaxa, 0)
      const totalDiarias = diariasDia.reduce((sum, d) => sum + d.valorDiaria, 0)
      
      diasSemana.push({
        data: dataStr,
        diaSemana: dia.toLocaleDateString('pt-BR', { weekday: 'short' }),
        entregas: entregasDia.length,
        diarias: diariasDia.length,
        totalEntregas,
        totalDiarias,
        totalGeral: totalEntregas + totalDiarias
      })
    }
    return diasSemana
  }

  // Obter estatísticas do mês
  const obterEstatisticasMes = () => {
    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
    
    const entregasMes = entregas.filter(entrega => {
      const dataEntrega = new Date(entrega.data)
      return dataEntrega >= inicioMes && dataEntrega <= fimMes
    })

    const diariasMes = diarias.filter(diaria => {
      const dataDiaria = new Date(diaria.data)
      return dataDiaria >= inicioMes && dataDiaria <= fimMes
    })
    
    const totalEntregas = entregasMes.reduce((sum, e) => sum + e.valorTaxa, 0)
    const totalDiarias = diariasMes.reduce((sum, d) => sum + d.valorDiaria, 0)
    const totalGeral = totalEntregas + totalDiarias
    
    return {
      totalEntregas: entregasMes.length,
      totalDiarias: diariasMes.length,
      valorEntregas: totalEntregas,
      valorDiarias: totalDiarias,
      valorTotal: totalGeral,
      mediaDiaria: totalGeral > 0 ? totalGeral / hoje.getDate() : 0,
      diasTrabalhados: new Set([...entregasMes.map(e => e.data), ...diariasMes.map(d => d.data)]).size
    }
  }

  // Obter datas disponíveis para histórico
  const obterDatasDisponiveis = () => {
    const datasEntregas = entregas.map(e => e.data)
    const datasDiarias = diarias.map(d => d.data)
    const todasDatas = [...new Set([...datasEntregas, ...datasDiarias])]
    return todasDatas.sort().reverse()
  }

  // Adicionar nova entrega
  const adicionarEntrega = () => {
    if (!clienteEndereco.trim() || !valorTaxa) return

    const novaEntrega = {
      id: Date.now(),
      data: obterDataAtual(),
      clienteEndereco: clienteEndereco.trim(),
      valorTaxa: parseFloat(valorTaxa),
      timestamp: new Date().toISOString()
    }

    if (entregaEditando) {
      setEntregas(prev => prev.map(e => e.id === entregaEditando.id ? { ...novaEntrega, id: entregaEditando.id } : e))
      setEntregaEditando(null)
    } else {
      setEntregas(prev => [...prev, novaEntrega])
    }

    // Limpar formulário
    setClienteEndereco('')
    setValorTaxa('')
    setDialogEntregaAberto(false)
  }

  // Adicionar nova diária
  const adicionarDiaria = () => {
    if (!localTrabalho.trim() || !valorDiaria) return

    const novaDiaria = {
      id: Date.now(),
      data: obterDataAtual(),
      localTrabalho: localTrabalho.trim(),
      valorDiaria: parseFloat(valorDiaria),
      horarioTrabalho: horarioTrabalho.trim(),
      timestamp: new Date().toISOString()
    }

    if (diariaEditando) {
      setDiarias(prev => prev.map(d => d.id === diariaEditando.id ? { ...novaDiaria, id: diariaEditando.id } : d))
      setDiariaEditando(null)
    } else {
      setDiarias(prev => [...prev, novaDiaria])
    }

    // Limpar formulário
    setLocalTrabalho('')
    setValorDiaria('')
    setHorarioTrabalho('')
    setDialogDiariaAberto(false)
  }

  // Editar entrega
  const editarEntrega = (entrega) => {
    setEntregaEditando(entrega)
    setClienteEndereco(entrega.clienteEndereco)
    setValorTaxa(entrega.valorTaxa.toString())
    setDialogEntregaAberto(true)
  }

  // Editar diária
  const editarDiaria = (diaria) => {
    setDiariaEditando(diaria)
    setLocalTrabalho(diaria.localTrabalho)
    setValorDiaria(diaria.valorDiaria.toString())
    setHorarioTrabalho(diaria.horarioTrabalho || '')
    setDialogDiariaAberto(true)
  }

  // Excluir entrega
  const excluirEntrega = (id) => {
    setEntregas(prev => prev.filter(e => e.id !== id))
  }

  // Excluir diária
  const excluirDiaria = (id) => {
    setDiarias(prev => prev.filter(d => d.id !== id))
  }

  // Abrir edição do resumo semanal
  const abrirEdicaoSemana = (dia) => {
    setDiaEdicaoSemana(dia)
    setValorEdicaoSemana(dia.totalGeral.toFixed(2))
    setDialogEdicaoSemanaAberto(true)
  }

  // Salvar edição do resumo semanal
  const salvarEdicaoSemana = () => {
    if (!diaEdicaoSemana || !valorEdicaoSemana) return

    const novoValor = parseFloat(valorEdicaoSemana)
    const valorAtual = diaEdicaoSemana.totalGeral
    const diferenca = novoValor - valorAtual

    if (diferenca !== 0) {
      // Criar um ajuste manual como uma "entrega especial"
      const ajuste = {
        id: Date.now(),
        data: diaEdicaoSemana.data,
        clienteEndereco: `Ajuste Manual - ${diferenca > 0 ? '+' : ''}${diferenca.toFixed(2)}`,
        valorTaxa: diferenca,
        timestamp: new Date().toISOString(),
        isAjuste: true
      }
      setEntregas(prev => [...prev, ajuste])
    }

    setDialogEdicaoSemanaAberto(false)
    setDiaEdicaoSemana(null)
    setValorEdicaoSemana('')
  }

  // Gerar relatório
  const gerarRelatorio = (data = obterDataAtual()) => {
    const entregasDia = obterEntregasPorData(data)
    const diariasDia = obterDiariasPorData(data)
    const totalEntregas = calcularTotalEntregasPorData(data)
    const totalDiarias = calcularTotalDiariasPorData(data)
    const totalGeral = totalEntregas + totalDiarias

    // Corrigir problema de fuso horário na formatação da data
    const [ano, mes, dia] = data.split('-')
    const dataCorreta = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia))
    const dataFormatada = dataCorreta.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    let relatorio = `📋 RELATÓRIO DE ENTREGAS\n`
    relatorio += `📅 ${dataFormatada}\n\n`

    if (diariasDia.length > 0) {
      relatorio += `💼 DIÁRIAS:\n`
      diariasDia.forEach((diaria, index) => {
        relatorio += `${index + 1}. ${diaria.localTrabalho}`
        if (diaria.horarioTrabalho) {
          relatorio += ` (${diaria.horarioTrabalho})`
        }
        relatorio += ` - R$ ${diaria.valorDiaria.toFixed(2)}\n`
      })
      relatorio += `💰 Total Diárias: R$ ${totalDiarias.toFixed(2)}\n\n`
    }

    if (entregasDia.length > 0) {
      relatorio += `🏍️ ENTREGAS:\n`
      let totalAcumulado = 0
      entregasDia.forEach((entrega, index) => {
        totalAcumulado += entrega.valorTaxa
        relatorio += `${index + 1}. ${entrega.clienteEndereco} - R$ ${entrega.valorTaxa.toFixed(2)} • Total: R$ ${totalAcumulado.toFixed(2)}\n`
      })
      relatorio += `💰 Total Entregas: R$ ${totalEntregas.toFixed(2)}\n\n`
    }

    relatorio += `💵 TOTAL GERAL: R$ ${totalGeral.toFixed(2)}\n`
    relatorio += `📊 ${entregasDia.length} entregas realizadas`
    if (diariasDia.length > 0) {
      relatorio += ` + ${diariasDia.length} diária(s)`
    }

    // Tentar usar a API de compartilhamento nativa
    if (navigator.share) {
      navigator.share({
        title: 'Relatório de Entregas',
        text: relatorio
      })
    } else {
      // Fallback: copiar para área de transferência
      navigator.clipboard.writeText(relatorio).then(() => {
        alert('Relatório copiado para a área de transferência!')
      })
    }
  }

  // Exportar dados
  const exportarDados = () => {
    const dados = {
      entregas,
      diarias,
      exportadoEm: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `entregas-backup-${obterDataAtual()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Cabeçalho */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Controle de Entregas</h1>
          <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Navegação por abas */}
        <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hoje">Hoje</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
          </TabsList>

          {/* Aba Hoje */}
          <TabsContent value="hoje" className="space-y-4">
            {/* Resumo do Dia */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Resumo do Dia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {diariasHoje.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Total Diárias:</span>
                      <span className="font-medium">R$ {calcularTotalDiariasPorData(obterDataAtual()).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Total Entregas:</span>
                    <span className="font-medium">R$ {calcularTotalEntregasPorData(obterDataAtual()).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total Geral:</span>
                    <span>R$ {calcularTotalGeralPorData(obterDataAtual()).toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {entregasHoje.length} entregas realizadas
                    {diariasHoje.length > 0 && ` + ${diariasHoje.length} diária(s)`}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Diárias */}
            {diariasHoje.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Diárias do Dia
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {diariasHoje.map((diaria) => (
                    <div key={diaria.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{diaria.localTrabalho}</p>
                        {diaria.horarioTrabalho && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {diaria.horarioTrabalho}
                          </p>
                        )}
                        <p className="text-sm font-medium text-blue-600">R$ {diaria.valorDiaria.toFixed(2)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editarDiaria(diaria)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => excluirDiaria(diaria.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Lista de Entregas */}
            {entregasHoje.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Entregas do Dia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {entregasHoje.map((entrega, index) => {
                    const totalAcumulado = entregasHoje
                      .slice(0, index + 1)
                      .reduce((sum, e) => sum + e.valorTaxa, 0)
                    
                    return (
                      <div key={entrega.id} className={`flex items-center justify-between p-3 rounded-lg ${entrega.isAjuste ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                        <div className="flex-1">
                          <p className="font-medium">{entrega.clienteEndereco}</p>
                          <p className="text-sm text-gray-600">
                            Taxa: R$ {entrega.valorTaxa.toFixed(2)} • Total: R$ {totalAcumulado.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editarEntrega(entrega)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => excluirEntrega(entrega.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}

            {/* Botões de Ação */}
            <div className="space-y-3">
              {(entregasHoje.length > 0 || diariasHoje.length > 0) && (
                <Button 
                  onClick={() => gerarRelatorio()} 
                  className="w-full"
                  variant="outline"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Relatório
                </Button>
              )}
              
              <div className="flex gap-2">
                <Dialog open={dialogDiariaAberto} onOpenChange={setDialogDiariaAberto}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <MapPin className="w-4 h-4 mr-2" />
                      Nova Diária
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{diariaEditando ? 'Editar Diária' : 'Nova Diária'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="local">Local de Trabalho</Label>
                        <Input
                          id="local"
                          value={localTrabalho}
                          onChange={(e) => setLocalTrabalho(e.target.value)}
                          placeholder="Ex: Restaurante X, Casa de Bolos Y"
                        />
                      </div>
                      <div>
                        <Label htmlFor="valorDiaria">Valor da Diária (R$)</Label>
                        <Input
                          id="valorDiaria"
                          type="number"
                          step="0.01"
                          value={valorDiaria}
                          onChange={(e) => setValorDiaria(e.target.value)}
                          placeholder="0,00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="horario">Horário (opcional)</Label>
                        <Input
                          id="horario"
                          value={horarioTrabalho}
                          onChange={(e) => setHorarioTrabalho(e.target.value)}
                          placeholder="Ex: 11h às 13h"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setDialogDiariaAberto(false)
                            setDiariaEditando(null)
                            setLocalTrabalho('')
                            setValorDiaria('')
                            setHorarioTrabalho('')
                          }}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                        <Button onClick={adicionarDiaria} className="flex-1">
                          {diariaEditando ? 'Salvar' : 'Adicionar'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={dialogEntregaAberto} onOpenChange={setDialogEntregaAberto}>
                  <DialogTrigger asChild>
                    <Button className="flex-1">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Entrega
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{entregaEditando ? 'Editar Entrega' : 'Nova Entrega'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cliente">Cliente/Endereço</Label>
                        <Textarea
                          id="cliente"
                          value={clienteEndereco}
                          onChange={(e) => setClienteEndereco(e.target.value)}
                          placeholder="Nome do cliente e endereço"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="valor">Valor da Taxa (R$)</Label>
                        <Input
                          id="valor"
                          type="number"
                          step="0.01"
                          value={valorTaxa}
                          onChange={(e) => setValorTaxa(e.target.value)}
                          placeholder="0,00"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setDialogEntregaAberto(false)
                            setEntregaEditando(null)
                            setClienteEndereco('')
                            setValorTaxa('')
                          }}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                        <Button onClick={adicionarEntrega} className="flex-1">
                          {entregaEditando ? 'Salvar' : 'Adicionar'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </TabsContent>

          {/* Aba Histórico */}
          <TabsContent value="historico" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Histórico de Entregas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="data">Escolha uma data</Label>
                    <Select value={dataSelecionada} onValueChange={setDataSelecionada}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha uma data..." />
                      </SelectTrigger>
                      <SelectContent>
                        {obterDatasDisponiveis().map(data => {
                          // Corrigir problema de fuso horário na formatação da data
                          const [ano, mes, dia] = data.split('-')
                          const dataCorreta = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia))
                          return (
                            <SelectItem key={data} value={data}>
                              {dataCorreta.toLocaleDateString('pt-BR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {dataSelecionada && (
                    <div className="space-y-4">
                      {/* Resumo da data selecionada */}
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="space-y-2">
                          {diariasDataSelecionada.length > 0 && (
                            <div className="flex justify-between text-sm">
                              <span>Total Diárias:</span>
                              <span className="font-medium">R$ {calcularTotalDiariasPorData(dataSelecionada).toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span>Total Entregas:</span>
                            <span className="font-medium">R$ {calcularTotalEntregasPorData(dataSelecionada).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold border-t pt-2">
                            <span>Total Geral:</span>
                            <span>R$ {calcularTotalGeralPorData(dataSelecionada).toFixed(2)}</span>
                          </div>
                        </div>
                        <Button 
                          onClick={() => gerarRelatorio(dataSelecionada)} 
                          className="w-full mt-3"
                          size="sm"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Gerar Relatório
                        </Button>
                      </div>

                      {/* Diárias da data selecionada */}
                      {diariasDataSelecionada.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Diárias</h4>
                          <div className="space-y-2">
                            {diariasDataSelecionada.map((diaria) => (
                              <div key={diaria.id} className="p-3 bg-blue-50 rounded-lg">
                                <p className="font-medium">{diaria.localTrabalho}</p>
                                {diaria.horarioTrabalho && (
                                  <p className="text-sm text-gray-600">{diaria.horarioTrabalho}</p>
                                )}
                                <p className="text-sm font-medium text-blue-600">R$ {diaria.valorDiaria.toFixed(2)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Entregas da data selecionada */}
                      {entregasDataSelecionada.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Entregas</h4>
                          <div className="space-y-2">
                            {entregasDataSelecionada.map((entrega, index) => {
                              const totalAcumulado = entregasDataSelecionada
                                .slice(0, index + 1)
                                .reduce((sum, e) => sum + e.valorTaxa, 0)
                              
                              return (
                                <div key={entrega.id} className={`p-3 rounded-lg ${entrega.isAjuste ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                                  <p className="font-medium">{entrega.clienteEndereco}</p>
                                  <p className="text-sm text-gray-600">
                                    Taxa: R$ {entrega.valorTaxa.toFixed(2)} • Total: R$ {totalAcumulado.toFixed(2)}
                                  </p>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Estatísticas */}
          <TabsContent value="estatisticas" className="space-y-4">
            {/* Estatísticas do Mês */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Estatísticas do Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{obterEstatisticasMes().totalEntregas + obterEstatisticasMes().totalDiarias}</p>
                    <p className="text-sm text-gray-600">Total de Atividades</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">R$ {obterEstatisticasMes().valorTotal.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Faturamento Total</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">R$ {obterEstatisticasMes().mediaDiaria.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Média Diária</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{obterEstatisticasMes().diasTrabalhados}</p>
                    <p className="text-sm text-gray-600">Dias Trabalhados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resumo da Semana */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo da Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {obterEstatisticasSemana().map((dia) => (
                    <div key={dia.data} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{dia.diaSemana}. {(() => {
                          // Corrigir problema de fuso horário na formatação da data
                          const [ano, mes, diaNum] = dia.data.split('-')
                          const dataCorreta = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(diaNum))
                          return `${dataCorreta.getDate()} de ${dataCorreta.toLocaleDateString('pt-BR', { month: 'short' })}`
                        })()}</p>
                        <p className="text-sm text-gray-600">
                          {dia.entregas} entregas
                          {dia.diarias > 0 && ` + ${dia.diarias} diária(s)`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">R$ {dia.totalGeral.toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => abrirEdicaoSemana(dia)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Botão de Exportar */}
            <Button onClick={exportarDados} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Exportar Dados
            </Button>
          </TabsContent>
        </Tabs>

        {/* Dialog para Edição do Resumo Semanal */}
        <Dialog open={dialogEdicaoSemanaAberto} onOpenChange={setDialogEdicaoSemanaAberto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Resumo do Dia</DialogTitle>
            </DialogHeader>
            {diaEdicaoSemana && (
              <div className="space-y-4">
                <div>
                  <Label>Data</Label>
                  <p className="text-sm text-gray-600">
                    {(() => {
                      // Corrigir problema de fuso horário na formatação da data
                      const [ano, mes, dia] = diaEdicaoSemana.data.split('-')
                      const dataCorreta = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia))
                      return dataCorreta.toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    })()}
                  </p>
                </div>
                <div>
                  <Label htmlFor="valorEdicao">Valor Total (R$)</Label>
                  <Input
                    id="valorEdicao"
                    type="number"
                    step="0.01"
                    value={valorEdicaoSemana}
                    onChange={(e) => setValorEdicaoSemana(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Valor atual: R$ {diaEdicaoSemana.totalGeral.toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setDialogEdicaoSemanaAberto(false)
                      setDiaEdicaoSemana(null)
                      setValorEdicaoSemana('')
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button onClick={salvarEdicaoSemana} className="flex-1">
                    Salvar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default App
