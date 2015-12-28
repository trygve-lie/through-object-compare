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
    var hash = {};
    arr.forEach(function (item) {
        hash[item[prop]] = item;
    });
    return hash;
};



const Compare = function (arr, fn) {

    var hashOld = arrayOfObjectsToHash(arr, 'uuid');

    return new stream.Transform({
        objectMode : true,

        transform: function (obj, encoding, next) {
            var self = this;

            if (!hashOld[obj.uuid]) {
                self.push({
                    type : 'added',
                    data : obj
                });
            
            } else if (!fn(hashOld[obj.uuid], obj)) {
                self.push({
                    type : 'changed',
                    data : obj
                });
                delete hashOld[obj.uuid];

            } else {
                delete hashOld[obj.uuid];
            }

    //        this.push(obj);
            next();
        },

        flush: function (done) {
            if (Object.keys(hashOld).length !== 0) {
                this.push({
                    type : 'deleted',
                    data : hashOld
                });
            }
            done();
        }

    });



}


module.exports = Compare;


/*
module.exports = new stream.Transform({
    objectMode : true,

    transform: function (obj, encoding, next) {
        var self = this;

        if (!hashOld[obj.uuid]) {
console.log('a');
            self.push({
                type : 'added',
                data : obj
            });
        
        } else if (!compareFn(hashOld[obj.uuid], obj)) {
console.log('b');
            self.push({
                type : 'changed',
                data : obj
            });
            delete hashOld[obj.uuid];

        } else {
            delete hashOld[obj.uuid];
        }

//        this.push(obj);
        next();
    },

    flush: function (done) {
console.log('c');
        this.push({
            type : 'deleted',
            data : hashOld
        });
        done();
    }

});
*/