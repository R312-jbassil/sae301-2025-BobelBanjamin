/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3753427395")

  // remove field
  collection.fields.removeById("text366351629")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3753427395")

  // add field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text366351629",
    "max": 0,
    "min": 0,
    "name": "texture_verres",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
})
