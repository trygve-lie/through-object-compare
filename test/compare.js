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
    sourceStream(sourceArray).pipe(compare([], 'uuid', compareFunction)).pipe(concat((result) => {
        t.similar(result[0], {appended : sourceArray[0]});
        t.similar(result[1], {appended : sourceArray[1]});
        t.similar(result[2], {appended : sourceArray[2]});
        t.end();
    }));
});



tap.test('compare array is equal to the source stream - result should hold zero objects', (t) => {
    sourceStream(sourceArray).pipe(compare(sourceArray, 'uuid', compareFunction)).pipe(concat((result) => {
        t.equal(result.length, 0);
        t.end();
    }));
});



tap.test('source stream has objects which exist in the source array - result should hold added objects', (t) => {
    sourceStream(sourceArray).pipe(compare([sourceArray[0], sourceArray[2]], 'uuid', compareFunction)).pipe(concat((result) => {
        t.equal(result.length, 1);
        t.similar(result[0], {appended : sourceArray[1]});
        t.end();
    }));
});



tap.test('source stream has objects that differs from the source array - result should hold changed objects', (t) => {
    let changed = {
        uuid : '002',
        created : 2,
        updated : 2
    };

    sourceStream(sourceArray).pipe(compare([sourceArray[0], changed, sourceArray[2]], 'uuid', compareFunction)).pipe(concat((result) => {
        t.equal(result.length, 1);
        t.similar(result[0], {changed : sourceArray[1]});
        t.end();
    }));
});



tap.test('source stream is missing objects which exist in the source array - result should hold deleted objects', (t) => {
    sourceStream([sourceArray[1]]).pipe(compare(sourceArray, 'uuid', compareFunction)).pipe(concat((result) => {
        t.equal(result.length, 2);
        t.similar(result[0], {deleted : sourceArray[0]});
        t.similar(result[1], {deleted : sourceArray[2]});
        t.end();
    }));
});
