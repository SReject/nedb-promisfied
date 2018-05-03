# NeDB-Promisfied
Promisfies most calls to [NeDB](https://github.com/louischatriot/nedb)

## Deviations  
Due to promisfication, some of the routines have changed documented below

### Loading  
When loading from file, autoload is not supported. Instead, use `.load()` after creation which returns a promise that is resolved after the database is loaded

### `.find()`, `.findOne()`, `.count()`  
Return a `Cursor` instance against which you can call NeDB's native `.skip`, `.limit`, and `.sort` method on.  
To retrieve documents you **MUST** call `.exec()` on the cursor instance; this will return a promise that is resolved once NeDB has returned the documents.

### `.insert()`, `.update()`, `.remove()`, `.ensureIndex`, `.removeIndex`
Now return a promise which resolves after completion of the task

## Example  
```js
let NeDB = require('nedb-promisfied');

let db = new NeDB('example.db');

db
    .load() // load from file
    .then(db => { // same instance as above
        return db.insert({hello: 'world'}); // insert doc

    }).then(insDoc => {
        console.log(insDoc);
        return db.find({hello: 'world'}).exec(); // find doc

    }).then(foundDoc => {
        console.log(foundDoc);
    });
```
