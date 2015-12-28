"use strict";

const   stream  = require('stream'),
        tap     = require('tap'),
        concat  = require('concat-stream'),
        compare = require('../');


const sourceStream = (arr) => {
    return new stream.Readable({
        objectMode : true,
        read: function (n) {
            arr.forEach((el) => {
                this.push(el);
            });
            this.push(null);
        }
    });
}

const sourceArray = [{
    uuid : '001',
    created : 1,
    updated : 1
}, {
    uuid : '002',
    created : 2,
    updated : 20
}, {
    uuid : '003',
    created : 3,
    updated : 3
}];



const compareFunction = (objOld, objNew) => {
    return objOld.updated === objNew.updated && objOld.created === objNew.created;
};



tap.test('compare array is empty - result should hold 3 added objects', (t) => {
    sourceStream(sourceArray).pipe(compare([], compareFunction)).pipe(concat((result) => {
        t.equal(result[0].type, 'added');
        t.equal(result[1].type, 'added');
        t.equal(result[2].type, 'added');
        t.end();
    }));
});



tap.test('compare array is equal to the source stream - result should hold zero objects', (t) => {
    sourceStream(sourceArray).pipe(compare(sourceArray, compareFunction)).pipe(concat((result) => {
        t.equal(result.length, 0);
        t.end();
    }));
});



tap.test('source stream has objects which exist in the source array - result should hold added objects', (t) => {
    sourceStream(sourceArray).pipe(compare([sourceArray[0], sourceArray[2]], compareFunction)).pipe(concat((result) => {
        t.equal(result[0].type, 'added');
        t.equal(result[0].data.uuid, '002');
        t.end();
    }));
});
