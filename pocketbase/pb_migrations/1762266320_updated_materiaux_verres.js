/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3753427395")

  // remove field
  collection.fields.removeById("file366351629")

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "json366351629",
    "maxSize": 0,
    "name": "texture_verres",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3753427395")

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "file366351629",
    "maxSelect": 1,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "texture_verres",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  // remove field
  collection.fields.removeById("json366351629")

  return app.save(collection)
})
