'use strict';

var expect = require('chai').expect;
var should = require('chai').should();
var gdalinfo = require('../index.js');

describe('Local file json generation', function(){
    it('generate json from local file', function(done){
        gdalinfo.local( __dirname +'/test_B1.tif', function(err, metadata){
            should.not.exist(err);
            should.exist(metadata);
            expect(metadata.corners_lon_lat.lower_left[0]).to.equal(-87.49599876053344);
            expect(metadata.width).to.equal(627);
            done();
        });
    });

    it('fail if file path is incorrect', function(done){
        gdalinfo.local( './test_B1.tif', function(err, metadata){
            should.exist(err);
            should.not.exist(metadata);
            done();
        });
    });
});


describe('Remote file json generation', function(){
    this.timeout(15000);

    it('generate json from a url', function(done){
        var url = 'http://landsat-pds.s3.amazonaws.com/L8/001/003/LC80010032015115LGN00/LC80010032015115LGN00_B1.TIF';
        gdalinfo.remote(url, function(err, metadata){

            should.not.exist(err);
            should.exist(metadata);
            expect(metadata.corners_lon_lat.lower_left[0]).to.equal(-16.330258333333333);
            expect(metadata.width).to.equal(9131);
            done();
        });
    });

    it('fail if the url is incorrect', function(done){
        var url = 'http://landsat-pds.s3.amazonaws.com/L8/001/003/LC80010032015115LGN00/LC80010032015115LGN00_B123.TIF';
        gdalinfo.remote(url, function(err, metadata){
            should.exist(err);
            should.not.exist(metadata);
            done();
        });
    });
});

