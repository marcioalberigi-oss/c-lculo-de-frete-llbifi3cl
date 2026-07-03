import pb from '@/lib/pocketbase/client'

export interface Dimensions {
  height: number
  width: number
  length: number
}

export interface CalculationInput {
  origin_zip: string
  destination_zip: string
  weight: number
  dimensions: Dimensions
}

export interface ShippingResult {
  id: string
  name: string
  price: number
  days: number
  logo: string
}

export const calculateFreight = async (data: CalculationInput): Promise<ShippingResult[]> => {
  const res = await pb.send('/backend/v1/calculate-freight', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
  return res.results
}

export const saveCalculation = async (data: CalculationInput, results: ShippingResult[]) => {
  return pb.collection('shipping_calculations').create({
    user: pb.authStore.record?.id,
    origin_zip: data.origin_zip,
    destination_zip: data.destination_zip,
    weight: data.weight,
    dimensions: data.dimensions,
    results,
  })
}

export const getHistory = async () => {
  return pb.collection('shipping_calculations').getFullList({ sort: '-created' })
}

export const deleteCalculation = async (id: string) => {
  return pb.collection('shipping_calculations').delete(id)
}
