import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Search, Package, MapPin, Loader2, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import { calculateFreight, saveCalculation, ShippingResult } from '@/services/shipping'

const formatCEP = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .slice(0, 9)
}

const calcSchema = z.object({
  origin_zip: z.string().min(9, 'CEP deve ter 8 dígitos'),
  destination_zip: z.string().min(9, 'CEP deve ter 8 dígitos'),
  weight: z.coerce.number().min(0.1, 'Peso mínimo de 0.1kg'),
  height: z.coerce.number().min(1, 'Altura mínima 1cm'),
  width: z.coerce.number().min(1, 'Largura mínima 1cm'),
  length: z.coerce.number().min(1, 'Comprimento mínimo 1cm'),
})

type CalcForm = z.infer<typeof calcSchema>

export default function Index() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<ShippingResult[] | null>(null)

  const form = useForm<CalcForm>({
    resolver: zodResolver(calcSchema),
    defaultValues: {
      origin_zip: '',
      destination_zip: '',
      weight: 1,
      height: 10,
      width: 15,
      length: 20,
    },
  })

  const onSubmit = async (data: CalcForm) => {
    setIsLoading(true)
    setResults(null)
    try {
      const payload = {
        origin_zip: data.origin_zip,
        destination_zip: data.destination_zip,
        weight: data.weight,
        dimensions: {
          height: data.height,
          width: data.width,
          length: data.length,
        },
      }
      const res = await calculateFreight(payload)
      setResults(res)
      await saveCalculation(payload, res)

      toast({
        title: 'Cálculo concluído',
        description: `${res.length} opções de frete encontradas.`,
      })

      // Scroll to results gently
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro no cálculo',
        description: error?.message || 'Não foi possível calcular o frete neste momento.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Calculadora de Frete</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Simule custos de envio e prazos com as melhores transportadoras.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <Card className="shadow-subtle border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <MapPin className="text-primary h-5 w-5" />
                Dados do Envio
              </CardTitle>
              <CardDescription>Insira CEPs e dimensões da caixa</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground bg-slate-100 p-2 rounded-md">
                      Endereços
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="origin_zip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CEP de Origem</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="00000-000"
                                {...field}
                                onChange={(e) => field.onChange(formatCEP(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="destination_zip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CEP de Destino</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="00000-000"
                                {...field}
                                onChange={(e) => field.onChange(formatCEP(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground bg-slate-100 p-2 rounded-md flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Pacote
                    </h3>
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Peso (kg)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" min="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-3">
                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alt. (cm)</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="width"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Larg. (cm)</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="length"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Comp. (cm)</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base shadow-md"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Calculando...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-5 w-5" />
                        Calcular Frete
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7" id="results-section">
          {isLoading && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-4 animate-fade-in text-muted-foreground">
              <Truck className="h-16 w-16 text-primary animate-bounce" />
              <p className="text-lg font-medium">Buscando as melhores cotações...</p>
            </div>
          )}

          {!isLoading && !results && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-8 text-center text-muted-foreground animate-fade-in">
              <Package className="h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Pronto para cotar!</h3>
              <p className="max-w-md">
                Preencha os dados do envio ao lado e clique em calcular para ver as opções de frete
                disponíveis.
              </p>
            </div>
          )}

          {!isLoading && results && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">Opções Encontradas</h2>
                <span className="text-sm font-medium bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
                  {results.length} resultados
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {results
                  .sort((a, b) => a.price - b.price)
                  .map((result, index) => (
                    <Card
                      key={result.id}
                      className="overflow-hidden hover:shadow-md transition-shadow border-slate-200 animate-slide-up"
                      style={{ animationFillMode: 'both', animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex flex-col sm:flex-row items-center p-5 gap-6">
                        <div className="w-20 h-20 shrink-0 bg-white rounded-lg border flex items-center justify-center p-2 shadow-sm">
                          <img
                            src={result.logo}
                            alt={result.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>

                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="text-lg font-bold text-foreground">{result.name}</h3>
                          <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-1 mt-1">
                            <Truck className="h-4 w-4" />
                            Entrega em até{' '}
                            <span className="font-semibold text-foreground">
                              {result.days} dias úteis
                            </span>
                          </p>
                        </div>

                        <div className="flex flex-col items-center sm:items-end shrink-0 w-full sm:w-auto">
                          <div className="text-3xl font-black text-primary">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(result.price)}
                          </div>
                          <Button
                            variant="outline"
                            className="w-full sm:w-auto mt-3 border-primary/20 hover:bg-primary/5 text-primary group"
                          >
                            Selecionar
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
