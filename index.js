'use strict';
/*
* The local part is mostly copy/pasted from https://github.com/naturalatlas/node-gdal/blob/master/examples/gdalinfo.js
*
*/

var gdal = require('gdal');
var child_process = require('child_process');
var extend = require('extend');
var geo = require('mt-geo');

module.exports.local = function(filename, callback) {

  var err;

  if (!filename) {
    err = new Error('Filename must be provided');
    callback(err);
    return;
  }

  var ds;

  try {
    ds = gdal.open(filename);
  }
  catch (err) {
    callback(err);
    return;
  }

  var driver = ds.driver;
  var driver_metadata = driver.getMetadata();
  if (driver_metadata.DCAP_RASTER !== 'YES') {
      err = new Error('Source file is not a raster');
      callback(err);
      return;
  }

  var geotransform = ds.geoTransform;
  var size = ds.rasterSize;
  var description = (ds.driver || {}).description;
  var numBands = (ds.bands && typeof ds.bands.count === 'function') ?
    ds.bands.count() : null;
  var srs = (ds.srs && typeof ds.srs.toWKT === 'function') ?
    ds.srs.toWKT() : null;

  var metadata = {
    filename: filename,
    driver: description,
    width: size.x,
    height: size.y,
    numBands: numBands,
    srs: srs,
    geotransform: ds.geoTransform,
    origin: [geotransform[0], geotransform[3]],
    pixel_size: [geotransform[1], geotransform[5]],
    corners: {},
    corners_lon_lat: {}
  };
  // corners
  var corners = {
      'upper_left' : {x: 0, y: 0},
      'upper_right' : {x: size.x, y: 0},
      'lower_right' : {x: size.x, y: size.y},
      'lower_left' : {x: 0, y: size.y},
      'center' : {x: size.x/2, y: size.y/2}
  };

  var wgs84 = gdal.SpatialReference.fromEPSG(4326);
  var coord_transform = new gdal.CoordinateTransformation(ds.srs || wgs84, wgs84);

  var corner_names = Object.keys(corners);
  corner_names.forEach(function(corner_name) {
      // convert pixel x,y to the coordinate system of the raster
      // then transform it to WGS84
      var corner      = corners[corner_name];
      var pt_orig     = {
          x: geotransform[0] + corner.x * geotransform[1] + corner.y * geotransform[2],
          y: geotransform[3] + corner.x * geotransform[4] + corner.y * geotransform[5]
      };
      var pt_wgs84    = coord_transform.transformPoint(pt_orig);

      metadata.corners[corner_name] = [Math.floor(pt_orig.x * 100) / 100, Math.floor(pt_orig.y * 100) / 100];
      metadata.corners_lon_lat[corner_name] = [pt_wgs84.x, pt_wgs84.y];
  });

  callback(err, metadata);
};

module.exports.remote = function(url, callback) {
  child_process.exec('gdalinfo /vsicurl/' + url, function (err, stdout){
    if (err) {
      callback(err);
      return;
    }
    stdout = stdout.replace(/(\s)/g, '');
    var metadata = {};

    metadata.url = url;
    metadata.driver = getValue(stdout, 'Driver:(.*)Files:');
    extend(metadata, getSize(stdout));
    metadata.origin = getList(stdout, 'Origin=\\((.*)\\)PixelSize=').map(parseFloat);
    metadata.pixel_size = getList(stdout, 'PixelSize=\\((.*)\\)Metadata:').map(parseFloat);
    metadata.srs = getValue(stdout, 'CoordinateSystemis:(.*)Origin=');
    metadata.corners = {
      upper_left: getList(getValue(stdout, 'UpperLeft\\((.*)\\)LowerLeft'), '^(.*)\\)\\(').map(parseFloat),
      lower_left: getList(getValue(stdout, 'LowerLeft\\((.*)\\)UpperRight'), '^(.*)\\)\\(').map(parseFloat),
      upper_right: getList(getValue(stdout, 'UpperRight\\((.*)\\)LowerRight'), '^(.*)\\)\\(').map(parseFloat),
      lower_right: getList(getValue(stdout, 'LowerRight\\((.*)\\)Center'), '^(.*)\\)\\(').map(parseFloat),
      center: getList(getValue(stdout, 'Center\\((.*)\\)Band'), '^(.*)\\)\\(').map(parseFloat),
    };

    metadata.corners_lon_lat = {
      upper_left: dms(getList(getValue(stdout, 'UpperLeft\\((.*)\\)LowerLeft'), '\\)\\((.*)')),
      lower_left: dms(getList(getValue(stdout, 'LowerLeft\\((.*)\\)UpperRight'), '\\)\\((.*)')),
      upper_right: dms(getList(getValue(stdout, 'UpperRight\\((.*)\\)LowerRight'), '\\)\\((.*)')),
      lower_right: dms(getList(getValue(stdout, 'LowerRight\\((.*)\\)Center'), '\\)\\((.*)')),
      center: dms(getList(getValue(stdout, 'Center\\((.*)\\)Band'), '\\)\\((.*)')),
    };

    var bands = stdout.match(/Band(.)/g);
    metadata.numBands = (bands ? bands.length : 0);

    callback(err, metadata);
  });
};

var dms = function(value) {
  for (var i = 0; i < value.length; i++) {
    value[i] = geo.parseDMS(value[i]);
  }
  return value;
};

var getValue = function (value, re) {
  var result;
  if (value) {
    result = value.match(re);
  }

  if (result) {
    return result[1];
  }
  else {
    return null;
  }
};

var getList = function (value, re) {
  var list = getValue(value, re);

  if (list) {
    return list.split(',');
  }
};

var getSize = function(value) {
  var size = getValue(value, 'Sizeis(.*)CoordinateSystemis:');

  if (size) {
    size = size.split(',');
    return {width: parseFloat(size[0]), height: parseFloat(size[1])};
  }
};
