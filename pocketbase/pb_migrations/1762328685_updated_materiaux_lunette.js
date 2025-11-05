/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_392944303")

  // remove field
  collection.fields.removeById("file3500615469")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_392944303")

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "file3500615469",
    "maxSelect": 1,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "texture_materiaux",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
})
