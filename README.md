# through-object-compare

[![Dependencies](https://img.shields.io/david/trygve-lie/through-object-compare.svg?style=flat-square)](https://david-dm.org/trygve-lie/through-object-compare)[![Build Status](http://img.shields.io/travis/trygve-lie/through-object-compare/master.svg?style=flat-square)](https://travis-ci.org/trygve-lie/through-object-compare)


Transform stream that compare each object in the stream with objects in an array 
of objects to find differences. The intention is to find differences and flag
objects we compare as "added", "changed" or "deleted".



## Installation

```bash
$ npm install through-object-compare
```



## Example

Compare an object stream based on a created and updated timestamp in each 
object.

```js

const throughObjectCompare = require('through-object-compare'),
	  JSONStream = require('JSONStream')
      fs = require('fs');


// Compare function which compare timestamp fields in each object

const compareFunction = (objOld, objNew) => {
    return objOld.updated === objNew.updated && objOld.created === objNew.created;
};


// The array of objects we compare the stream against

const arrayOfObjects = [{
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


fs.createReadStream('objects.json')
  .pipe(JSONStream.parse('*'))
  .pipe(throughObjectCompare(arrayOfObjects, compareFunction))
  .pipe(JSONStream.stringify())
  .pipe(fs.createWriteStream('comparedObjects.json'));
```



## Description

The intention of this module is to compare two sets of objects and find what is
different between them. This is done by holding an array of objects and then 
check each object in a stream against this array.

The output of the stream will then emit objects which each are flagged as 
"added", "changed" or "deleted".

The only requirement is that each object we compare has an unique identifier 
key.



## API

This module have the following API:

### throughObjectCompare(compareArray, compareFunction)

Creates an instance for comparing.

```js
const const throughObjectCompare = require('through-object-compare');
let compare = throughObjectCompare(compareArray, compareFunction);
```


### compareArray (required)

An array of objects to compare the objects in the stream against.


### compareFunction

A compare function used to compare two matching objects based on a unique 
identifier key in the objects. Must return true or false.

The first argument parameter on the function is an object from the compareArray. 
The second argument parameter to the function is the current object in the 
stream.

```js
let compare = throughObjectCompare(compareArray, (objOld, objNew) => {
    return objOld.updated === objNew.updated && objOld.created === objNew.created;
});
```



## node.js compabillity

This module use some native ES6 functions only found in node.js 4.x and newer. 
This module will not function with older than 4.x versions of node.js.



## License 

The MIT License (MIT)

Copyright (c) 2015 - Trygve Lie - post@trygve-lie.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.