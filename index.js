/*
* Mostly copy/pasted from https://github.com/naturalatlas/node-gdal/blob/master/examples/gdalinfo.js
*
*/

var gdal = require('gdal');
var util = require('util');

module.exports = function(filename) {

  if (!filename) {
      console.error('Filename must be provided');
      process.exit(1);
  }

  var ds = gdal.open(filename);

  var driver = ds.driver;
  var driver_metadata = driver.getMetadata();
  if (driver_metadata['DCAP_RASTER'] !== 'YES') {
      console.error('Source file is not a raster');
      process.exit(1);
  }

  var geotransform = ds.geoTransform;
  var size = ds.rasterSize;

  var metadata = {
    driver: ds.driver.description,
    width: size.x,
    height: size.y,
    numBands: ds.bands.count(),
    srs: ds.srs.toWKT(),
    geotransform: ds.geoTransform,
    origin: [geotransform[0], geotransform[3]],
    pixel_size: [geotransform[1], geotransform[5]],
    corners: {}
  };
  // corners
  var corners = {
      'upper_left' : {x: 0, y: 0},
      'upper_right' : {x: size.x, y: 0},
      'bottom_right' : {x: size.x, y: size.y},
      'bottom_left' : {x: 0, y: size.y},
      'center' : {x: size.x/2, y: size.y/2}
  };

  var wgs84 = gdal.SpatialReference.fromEPSG(4326);
  var coord_transform = new gdal.CoordinateTransformation(ds.srs, wgs84);

  var corner_names = Object.keys(corners);
  corner_names.forEach(function(corner_name) {
      // convert pixel x,y to the coordinate system of the raster
      // then transform it to WGS84
      var corner      = corners[corner_name];
      var pt_orig     = {
          x: geotransform[0] + corner.x * geotransform[1] + corner.y * geotransform[2],
          y: geotransform[3] + corner.x * geotransform[4] + corner.y * geotransform[5]
      }
      var pt_wgs84    = coord_transform.transformPoint(pt_orig);
      var description = util.format('%s (%d, %d) (%s, %s)',
          corner_name,
          Math.floor(pt_orig.x * 100) / 100,
          Math.floor(pt_orig.y * 100) / 100,
          gdal.decToDMS(pt_wgs84.x, 'Long'),
          gdal.decToDMS(pt_wgs84.y, 'Lat')
      );

      metadata.corners[corner_name] = [Math.floor(pt_orig.x * 100) / 100, Math.floor(pt_orig.y * 100) / 100]

  });

  return metadata
};

