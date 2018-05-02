function exec() {
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

// updates cursor.exec with promisified exec method
module.exports = function promisfy(cursor) {
    cursor.exec = exec;
    return cursor;
};
