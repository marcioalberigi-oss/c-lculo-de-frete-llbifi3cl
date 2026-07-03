import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Trash2, Search, Package, MapPin, Truck, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { getHistory, deleteCalculation } from '@/services/shipping'
import useRealtime from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsMobile } from '@/hooks/use-mobile'

export default function History() {
  const [calculations, setCalculations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const loadData = async () => {
    try {
      const data = await getHistory()
      setCalculations(data)
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro ao carregar histórico' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('shipping_calculations', () => {
    loadData()
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente apagar este registro?')) return
    try {
      await deleteCalculation(id)
      toast({ title: 'Registro apagado.' })
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro ao apagar' })
    }
  }

  const handleRepeat = (calc: any) => {
    // Basic approach to auto-fill would require context, but simple redirect is okay.
    // For a real app, passing via state/context to Index.
    toast({ description: 'Recurso de preenchimento será adicionado.' })
    navigate('/')
  }

  const filtered = calculations.filter(
    (c) => c.origin_zip.includes(searchTerm) || c.destination_zip.includes(searchTerm),
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Histórico de Envios</h1>
          <p className="text-muted-foreground mt-1">Veja e gerencie suas cotações passadas.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por CEP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
          <History className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-600">Nenhum registro encontrado</h3>
          <p className="text-slate-500 mt-1">
            Faça sua primeira cotação para ver o histórico aqui.
          </p>
          <Button className="mt-4" onClick={() => navigate('/')}>
            Ir para Calculadora
          </Button>
        </div>
      ) : isMobile ? (
        <div className="space-y-4">
          {filtered.map((calc) => {
            const bestPrice = calc.results?.sort((a: any, b: any) => a.price - b.price)[0]
            return (
              <Card key={calc.id} className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start border-b pb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {format(new Date(calc.created), "dd 'de' MMM, yyyy HH:mm", { locale: ptBR })}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(calc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <MapPin className="h-4 w-4 text-primary" />
                    {calc.origin_zip} &rarr; {calc.destination_zip}
                  </div>
                  <div className="flex justify-between items-end pt-2">
                    <div className="text-sm text-muted-foreground">
                      <Package className="h-4 w-4 inline mr-1" />
                      {calc.weight}kg
                    </div>
                    {bestPrice && (
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Melhor Preço</div>
                        <div className="font-bold text-primary">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(bestPrice.price)}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Trajeto (CEP)</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead>Melhor Opção</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((calc) => {
                const bestPrice = calc.results?.sort((a: any, b: any) => a.price - b.price)[0]
                return (
                  <TableRow key={calc.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium">
                      {format(new Date(calc.created), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-mono">{calc.origin_zip}</span>
                        <ArrowRightIcon className="h-3 w-3 text-muted-foreground mx-1" />
                        <span className="font-mono">{calc.destination_zip}</span>
                      </div>
                    </TableCell>
                    <TableCell>{calc.weight} kg</TableCell>
                    <TableCell>
                      {bestPrice ? (
                        <div>
                          <div className="font-bold text-primary">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(bestPrice.price)}
                          </div>
                          <div className="text-xs text-muted-foreground">{bestPrice.name}</div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Repetir Cálculo"
                        onClick={() => handleRepeat(calc)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(calc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

function ArrowRightIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
