"use strict";

const stream = require('readable-stream');



/** 
  * Convert an Array of Objects into a Hash where
  * the properties in the Hash is based on the value 
  * of a given property in the Objects.
  *
  * @param {Array} arr Array of Objects
  * @param {String} prop The property in the Object to use as properties in the Hash
  * @returns {Object} Hash with Objects
  */

const arrayOfObjectsToHash = (arr, prop) => {
    let hash = {};
    arr.forEach((item) => {
        hash[item[prop]] = item;
    });
    return hash;
};



const Compare = (compareObjects, identifier, compareFunction) => {

    let hashOld = arrayOfObjectsToHash(compareObjects, identifier);

    return new stream.Transform({
        objectMode : true,

        transform: function (obj, encoding, next) {
            var self = this;

            if (!hashOld[obj[identifier]]) {
                self.push({
                    appended : obj
                });
            
            } else if (!compareFunction(hashOld[obj[identifier]], obj)) {
                self.push({
                    changed : obj
                });
                delete hashOld[obj[identifier]];

            } else {
                delete hashOld[obj[identifier]];
            }

            next();
        },

        flush: function (done) {
            var self = this;

            if (Object.keys(hashOld).length !== 0) {
                Object.keys(hashOld).forEach(function (key) {
                    self.push({
                        deleted : hashOld[key]
                    });
                });
            }
            done();
        }

    });

}


module.exports = Compare;
