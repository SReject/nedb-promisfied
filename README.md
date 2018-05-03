# NeDB-Promisfied
Promisfies most calls to [NeDB](https://github.com/louischatriot/nedb)

## Deviations  
Due to promisfication, some of the routines have changed documented below

### Loading  
When loading from file, autoload is not supported. Instead, use `.load()` after creation which returns a promise that is resolved after the database is loaded

### `.find()`, `.findOne()`, `.count()`  
Now return a `Cursor` instance against which you call NeDB's native `.skip`, `.limit`, and `.sort` method on. Once you are ready to retrieve documents call `.exec()` on the cursor instance. This will return a promise that is resolved once NeDB has returned the documents

### `.insert()`, `.update()`, `.remove()`, `.ensureIndex`, `.removeIndex`
Both now return a promise which resolves after completion of the task

## Example  
```js
let NeDB = require('nedb-promisfied');

let db = new NeDB('example.db');

db
    .load() // load from file
    .then((db) => {
        return db.insert({hello: 'world'}); // insert doc

    }).then(doc => {
        console.log(doc);
        return db.find({hello: 'world'}).exec(); // find doc

    }).then(doc => {
        console.log(doc);
    });
```
