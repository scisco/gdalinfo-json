### gdalinfo-json

[![npm version](https://badge.fury.io/js/gdalinfo-json.svg)](http://badge.fury.io/js/gdalinfo-json)
[![Build Status](https://travis-ci.org/scisco/gdalinfo-json.svg?branch=master)](https://travis-ci.org/scisco/gdalinfo-json)

Returns standard gdalinfo output in json format.

    npm install gdalinfo-json

### Usage

To get gdalinfo from local files

```javascript
var gdalinfo = require('gdalinfo-json');

gdalinfo.local('somefile.TIF', function(err, metadata) {
    if (err) {
        console.log(err);
    }
    console.log(JSON.stringify(metadata));
});

```

To get gdalinfo for remote file, you must have gdalinfo installed locally. Example:

```javascript
var gdalinfo = require('gdalinfo-json');

gdalinfo.remote('http://example.com/somefile.TIF', function(err, metadata) {
    if (err) {
        console.log(err);
    }
    console.log(JSON.stringify(metadata));
});

```

#### From Command Line

```bash
npm install -g gdalinfo-json
gdalinfo-json somefile.TIF
```

### Example output

```json
{
    "filename": "/Users/ajdevseed/landsat/processed/LC80130312014276LGN00/LC80130312014276LGN00_bands_432.TIF",
    "driver": "GTiff",
    "width": 7651,
    "height": 7791,
    "numBands": 3,
    "srs": "PROJCS[\"WGS 84 / Pseudo-Mercator\",GEOGCS[\"WGS 84\",DATUM[\"WGS_1984\",SPHEROID[\"WGS 84\",6378137,298.257223563,AUTHORITY[\"EPSG\",\"7030\"]],AUTHORITY[\"EPSG\",\"6326\"]],PRIMEM[\"Greenwich\",0],UNIT[\"degree\",0.0174532925199433],AUTHORITY[\"EPSG\",\"4326\"]],PROJECTION[\"Mercator_1SP\"],PARAMETER[\"central_meridian\",0],PARAMETER[\"scale_factor\",1],PARAMETER[\"false_easting\",0],PARAMETER[\"false_northing\",0],UNIT[\"metre\",1,AUTHORITY[\"EPSG\",\"9001\"]],EXTENSION[\"PROJ4\",\"+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs\"],AUTHORITY[\"EPSG\",\"3857\"]]",
    "geotransform": [-8266208.87034837, 41.167996197204424, 0, 5285164.151389386, 0, -41.265410042893365],
    "origin": [-8266208.87034837, 5285164.151389386],
    "pixel_size": [41.167996197204424, -41.265410042893365],
    "corners": {
        "upper_left": [-8266208.88, 5285164.15],
        "upper_right": [-7951232.54, 5285164.15],
        "lower_right": [-7951232.54, 4963665.34],
        "lower_left": [-8266208.88, 4963665.34],
        "center": [-8108720.71, 5124414.74]
    },
    "corners_lon_lat": {
        "upper_left": [-74.25661769958302, 42.82362474807587],
        "upper_right": [-71.427137105841, 42.82362474807587],
        "lower_right": [-71.427137105841, 40.66916482314966],
        "lower_left": [-74.25661769958302, 40.66916482314966],
        "center": [-72.84187740271202, 41.755433956306184]
    }
}

```

### Tests

    $ npm test

### Credit

- [gdalinfo.js](https://github.com/naturalatlas/node-gdal/blob/master/examples/gdalinfo.js)
- [geo-pixel-stream](https://github.com/mapbox/geo-pixel-stream)
