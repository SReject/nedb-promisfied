const nedb = require('nedb');

/**@desc Replacment for NeDB's Cursor.exec function
 * @returns {Promise<Object>}
*/
function cursorExec() {
    let self = this;
    return new Promise((res, rej) => {
        self.db.executor.push({
            this: self,
            fn: self._exec,
            arguments: (err, docs) => {
                if (err) {
                    return rej(err);
                }
                return res(docs);
            }
        });
    });
}

/**@desc Replaces a NeDB's cursor instances .exec() function with cursorExec()
 * @param {Cursor} cursor
 * @returns {Cursor}
*/
function promisfyCursor(cursor) {
    cursor.exec = cursorExec;
    return cursor;
}



class NeDBPromisified extends nedb {

    /**@desc Creates a new NeDB-promisfied instance
     * @constructor
     * @public
     * @param {Boolean} [options.filename]
     * @param {Boolean} [options.inMemoryOnly=false]
     * @param {Boolean} [options.timestampData=false]
     * @param {Number} [options.curruptAlertThreshold=10]
     * @param {Function} [options.afterSerialization]
     * @param {Function} [options.beforeDeserialization]
     * @param {Function} [options.compareStrings]
     */
    constructor(options = {}) {
        if (options.autoload || options.onload) {
            throw new Error('autoload not supported; use .load()');
        }
        super(options);
    }

    /**@desc Loads a nedb from file
     * @returns {Promise<Object>}
     */
    load() {

        // check if the database is memory-only or has already finished loading
        if (this.inMemoryOnly || this.loaded) {
            return Promise.resolve(this);
        }

        // check if the database is currently loading
        if (this.loadingDatabase) {
            return this.loadingDatabase;
        }

        // Call nedb's .loadDatabase() method
        let self = this;
        return this.loadingDatabase = new Promise((res, rej) => {
            super.loadDatabase(err => {
                if (err) {
                    return rej(err);
                }

                self.loaded = true;
                delete self.loadingDatabase;
                res(self);
            });
        });
    }

    /**@desc inserts a new document or a set of documents
     * @param {Object} document - a document or list of documents to insert
     * @returns {Promise<Object>}
     */
    insert(doc) {
        return new Promise((res, rej) => {
            super.insert(doc, (err, docs) => {
                if (err) {
                    return rej(err);
                }
                res(docs);
            });
        });
    }

    /**@desc Updates matching document(s) in the database
     * @param {Object} query
     * @param {Object} update
     * @param {Boolean} [options.multi=false]
     * @param {Boolean} [options.upsert=false]
     * @param {Boolean} [options.returnUpdatedDocs=false]
     * @returns {Promise<Number,Object,Boolean>}
     */
    update(query, update, options) {
        return new Promise((res, rej) => {
            super.update(query, update, options, (err, count, affected, upsert) => {
                if (err) {
                    return rej(err);
                }
                res(count, affected, upsert);
            });
        });
    }

    /**@desc Removes matching document(s) from the database
     * @param {Object} query
     * @param {Boolean} [options.multi=false]
     * @returns {Promise<Number>}
     */
    remove(query, options) {
        return new Promise((res, rej) => {
            super.remove(query, options, (err, count) => {
                if (err) {
                    return rej(err);
                }
                res(count);
            });
        });
    }

    /**@desc Prepares to find all matching documents in the database
     * @param {Object} query
     * @param {Object} [projection]
     * @returns {Cursor}
     */
    find(query, projection) {
        return promisfyCursor(super.find(query, projection));
    }

    /**@desc Prepares to find the first matching documents in the database
     * @param {Object} query
     * @param {Object} [projection]
     * @returns {Cursor}
     */
    findOne(query, projection) {
        return promisfyCursor(super.findOne(query, projection));
    }

    /**@desc counts matching documents
     * @param {Object} [query={}]
     * @returns {Promise<Number>}
     */
    count(query) {
        return promisfyCursor(super.count(query));
    }

    /**@desc Ensures a field(or sub field) to meet a specified constraint
     * @param {Object} query
     * @returns {Promise<>}
     */
    ensureIndex(query) {
        return new Promise((res, rej) => {
            super.ensureIndex(query, (err) => {
                if (err) {
                    return rej(err);
                }
                res();
            });
        });
    }

    /**@desc Removes an ensured constraint from field(s)
     * @param {Object} query
     * @returns {Promise<>}
     */
    removeIndex(fieldname) {
        return new Promise((res, rej) => {
            super.ensureIndex(fieldname, (err) => {
                if (err) {
                    return rej(err);
                }
                res();
            });
        });
    }
}

module.exports = NeDBPromisified;
