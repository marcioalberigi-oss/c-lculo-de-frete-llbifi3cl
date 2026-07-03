routerAdd(
  'POST',
  '/backend/v1/calculate-freight',
  (e) => {
    const body = e.requestInfo().body || {}
    const { origin_zip, destination_zip, weight, dimensions } = body

    if (!origin_zip || !destination_zip || !weight || !dimensions) {
      return e.badRequestError('Missing required fields for calculation')
    }

    // Simulate complex logistics backend math
    const w = Number(weight) || 1
    const vol =
      (Number(dimensions.height || 10) *
        Number(dimensions.width || 10) *
        Number(dimensions.length || 10)) /
      6000
    const calcWeight = Math.max(w, vol)

    // Create deterministic pseudo-random price based on ZIP codes for mock realism
    const str = origin_zip + destination_zip
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i)
      hash |= 0
    }
    const distanceFactor = (Math.abs(hash) % 100) / 50 + 1 // 1 to 3

    const basePrice = 12 + calcWeight * 3.5 * distanceFactor

    const results = [
      {
        id: 'correios-pac',
        name: 'Correios PAC',
        price: Number(basePrice.toFixed(2)),
        days: Math.floor(6 * distanceFactor),
        logo: 'https://img.usecurling.com/i?q=mail&shape=fill&color=yellow',
      },
      {
        id: 'correios-sedex',
        name: 'Correios SEDEX',
        price: Number((basePrice * 1.8).toFixed(2)),
        days: Math.floor(2 * distanceFactor),
        logo: 'https://img.usecurling.com/i?q=mail&shape=fill&color=yellow',
      },
      {
        id: 'jadlog-package',
        name: 'Jadlog Package',
        price: Number((basePrice * 1.1).toFixed(2)),
        days: Math.floor(4 * distanceFactor),
        logo: 'https://img.usecurling.com/i?q=truck&shape=fill&color=red',
      },
      {
        id: 'azul-cargo',
        name: 'Azul Cargo',
        price: Number((basePrice * 2.3).toFixed(2)),
        days: Math.max(1, Math.floor(1 * distanceFactor)),
        logo: 'https://img.usecurling.com/i?q=plane&shape=fill&color=blue',
      },
    ]

    return e.json(200, { results })
  },
  $apis.requireAuth(),
)
