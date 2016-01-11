"use strict";

const stream = require('readable-stream'),
      assert = require('assert');



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

    assert(compareObjects, '"compareObjects" must be provided');
    assert(identifier, '"identifier" must be provided');
    assert(compareFunction, '"compareFunction" must be provided');

    let hashOld = arrayOfObjectsToHash(compareObjects, identifier);

    return new stream.Transform({
        objectMode : true,

        transform: function (obj, encoding, next) {
            if (!hashOld[obj[identifier]]) {
                this.push({
                    appended : obj,
                    match : null
                });
            
            } else if (!compareFunction(hashOld[obj[identifier]], obj)) {
                this.push({
                    changed : obj,
                    match : hashOld[obj[identifier]]
                });
                delete hashOld[obj[identifier]];

            } else {
                delete hashOld[obj[identifier]];

            }

            next();
        },

        flush: function (done) {
            if (Object.keys(hashOld).length !== 0) {
                Object.keys(hashOld).forEach((key) => {
                    this.push({
                        deleted : hashOld[key],
                        match : hashOld[key]
                    });
                });
            }
            done();
        }

    });

}


module.exports = Compare;
