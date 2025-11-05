/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_392944303")

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "number699746604",
    "max": null,
    "min": null,
    "name": "prix_materiaux",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_392944303")

  // remove field
  collection.fields.removeById("number699746604")

  return app.save(collection)
})
