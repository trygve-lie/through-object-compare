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



tap.test('compare array not provided - result should throw assert error', (t) => {
    t.throws(() => {
        sourceStream(sourceArray).pipe(compare(undefined, 'uuid', compareFunction)).pipe(concat((result) => {

        }));
    }, new Error('"compareObjects" must be provided'));
    t.end();
});



tap.test('identifier not provided - result should throw assert error', (t) => {
    t.throws(() => {
        sourceStream(sourceArray).pipe(compare([], undefined, compareFunction)).pipe(concat((result) => {

        }));
    }, new Error('"identifier" must be provided'));
    t.end();
});



tap.test('compare function not provided - result should throw assert error', (t) => {
    t.throws(() => {
        sourceStream(sourceArray).pipe(compare([], 'uuid', undefined)).pipe(concat((result) => {

        }));
    }, new Error('"compareFunction" must be provided'));
    t.end();
});



tap.test('compare array is empty - result should hold 3 added objects', (t) => {
    sourceStream(sourceArray).pipe(compare([], 'uuid', compareFunction)).pipe(concat((result) => {
        t.similar(result[0], {appended : sourceArray[0]});
        t.similar(result[1], {appended : sourceArray[1]});
        t.similar(result[2], {appended : sourceArray[2]});
        t.end();
    }));
});



tap.test('compare array is empty - result should have null values for "match" on all objects', (t) => {
    sourceStream(sourceArray).pipe(compare([], 'uuid', compareFunction)).pipe(concat((result) => {
        t.equal(result[0].match, null);
        t.equal(result[0].match, null);
        t.equal(result[0].match, null);
        t.end();
    }));
});



tap.test('compare array is empty - result emit 3 "append" events', (t) => {
    let comp = compare([], 'uuid', compareFunction);
    let appended = [];

    comp.on('append', (ev) => {
        appended.push(ev);
        if (appended.length === 3) {
            t.similar(appended[0], sourceArray[0]);
            t.similar(appended[1], sourceArray[1]);
            t.similar(appended[2], sourceArray[2]);
            t.end();
        }
    });

    sourceStream(sourceArray).pipe(comp).pipe(concat((result) => {
        // do nothing, tests are in the emitted event
    }));
});

 

tap.test('compare array is equal to the source stream - result should hold zero objects', (t) => {
    sourceStream(sourceArray).pipe(compare(sourceArray, 'uuid', compareFunction)).pipe(concat((result) => {
        t.equal(result.length, 0);
        t.end();
    }));
});



tap.test('compare array is equal to the source stream - result emit 3 "equal" events', (t) => {
    let comp = compare(sourceArray, 'uuid', compareFunction);
    let equals = [];
    let match = [];

    comp.on('equal', (newObj, oldObj) => {
        equals.push(newObj);
        match.push(oldObj);
        if (equals.length === 3 && match.length === 3) {
            t.similar(equals[0], sourceArray[0]);
            t.similar(equals[1], sourceArray[1]);
            t.similar(equals[2], sourceArray[2]);
            t.similar(match[0], sourceArray[0]);
            t.similar(match[1], sourceArray[1]);
            t.similar(match[2], sourceArray[2]);
            t.end();
        }
    });

    sourceStream(sourceArray).pipe(comp).pipe(concat((result) => {
        // do nothing, tests are in the emitted event
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



tap.test('source stream has objects that differs from the source array - result should have the source object on the "match" attribute', (t) => {
    let changed = {
        uuid : '002',
        created : 2,
        updated : 2
    };

    sourceStream(sourceArray).pipe(compare([sourceArray[0], changed, sourceArray[2]], 'uuid', compareFunction)).pipe(concat((result) => {
        t.equal(result.length, 1);
        t.equal(result[0].match, changed);
        t.end();
    }));
});



tap.test('source stream has objects that differs from the source array - result should emit a "change" event', (t) => {
    let changed = {
        uuid : '002',
        created : 2,
        updated : 2
    };

    let comp = compare([sourceArray[0], changed, sourceArray[2]], 'uuid', compareFunction);
    comp.on('change', (newObj, oldObj) => {
        t.similar(newObj, sourceArray[1]);
        t.end();
    });

    sourceStream(sourceArray).pipe(comp).pipe(concat((result) => {
        // do nothing, tests are in the emitted event
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



tap.test('source stream is missing objects which exist in the source array - result should hold deleted objects on the "match" attribute', (t) => {
    sourceStream([sourceArray[1]]).pipe(compare(sourceArray, 'uuid', compareFunction)).pipe(concat((result) => {
        t.equal(result.length, 2);
        t.similar(result[0], {match : sourceArray[0]});
        t.similar(result[1], {match : sourceArray[2]});
        t.end();
    }));
});



tap.test('source stream is missing objects which exist in the source array - should emit "delete" events', (t) => {
    let comp = compare(sourceArray, 'uuid', compareFunction);
    let deleted = [];

    comp.on('delete', (obj) => {
        deleted.push(obj);
        if (deleted.length === 2) {
            t.similar(deleted[0], sourceArray[0]);
            t.similar(deleted[1], sourceArray[2]);
            t.end();
        }
    });

    sourceStream([sourceArray[1]]).pipe(comp).pipe(concat((result) => {
        // do nothing, tests are in the emitted event
    }));
});
