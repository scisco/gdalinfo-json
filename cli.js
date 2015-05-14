#!/usr/bin/env node
'use strict';

var gdalinfo = require('./');

if (process.argv.length < 3) {
  console.log('Usage: ', process.argv[0], process.argv[1], ' FILENAME|URL');
  process.exit();
}

gdalinfo.local(process.argv[2], function(err, metadata) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(JSON.stringify(metadata));
    process.exit();
});
