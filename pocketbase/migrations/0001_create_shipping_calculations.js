migrate(
  (app) => {
    const collection = new Collection({
      name: 'shipping_calculations',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'origin_zip', type: 'text', required: true },
        { name: 'destination_zip', type: 'text', required: true },
        { name: 'weight', type: 'number', required: true },
        { name: 'dimensions', type: 'json', required: true },
        { name: 'results', type: 'json', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_shipping_calc_user ON shipping_calculations (user, created DESC)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('shipping_calculations')
    app.delete(collection)
  },
)
