migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let userRecord

    try {
      userRecord = app.findAuthRecordByEmail('_pb_users_auth_', 'marcio.alberigi@gmail.com')
    } catch (_) {
      userRecord = new Record(users)
      userRecord.setEmail('marcio.alberigi@gmail.com')
      userRecord.setPassword('Skip@Pass')
      userRecord.setVerified(true)
      userRecord.set('name', 'Márcio Alberigi')
      app.save(userRecord)
    }

    const calcs = app.findCollectionByNameOrId('shipping_calculations')

    try {
      app.findFirstRecordByData('shipping_calculations', 'origin_zip', '01001-000')
    } catch (_) {
      const calc1 = new Record(calcs)
      calc1.set('user', userRecord.id)
      calc1.set('origin_zip', '01001-000')
      calc1.set('destination_zip', '20000-000')
      calc1.set('weight', 2.5)
      calc1.set('dimensions', { height: 10, width: 20, length: 30 })
      calc1.set('results', [
        {
          id: 'correios-pac',
          name: 'Correios PAC',
          price: 21.5,
          days: 6,
          logo: 'https://img.usecurling.com/i?q=mail&shape=fill&color=yellow',
        },
        {
          id: 'correios-sedex',
          name: 'Correios SEDEX',
          price: 45.0,
          days: 2,
          logo: 'https://img.usecurling.com/i?q=mail&shape=fill&color=yellow',
        },
      ])
      app.save(calc1)

      const calc2 = new Record(calcs)
      calc2.set('user', userRecord.id)
      calc2.set('origin_zip', '04538-132')
      calc2.set('destination_zip', '80020-010')
      calc2.set('weight', 5.0)
      calc2.set('dimensions', { height: 30, width: 30, length: 30 })
      calc2.set('results', [
        {
          id: 'jadlog-package',
          name: 'Jadlog Package',
          price: 35.8,
          days: 4,
          logo: 'https://img.usecurling.com/i?q=truck&shape=fill&color=red',
        },
        {
          id: 'azul-cargo',
          name: 'Azul Cargo',
          price: 89.9,
          days: 1,
          logo: 'https://img.usecurling.com/i?q=plane&shape=fill&color=blue',
        },
      ])
      app.save(calc2)
    }
  },
  (app) => {
    try {
      const userRecord = app.findAuthRecordByEmail('_pb_users_auth_', 'marcio.alberigi@gmail.com')
      // Cascade delete handles calculations
      app.delete(userRecord)
    } catch (_) {}
  },
)
