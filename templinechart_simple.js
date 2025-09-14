var aoi = ee.FeatureCollection('WM/geoLab/geoBoundaries/600/ADM1')
  .filter(ee.Filter.eq('shapeGroup', 'DEU'))
  .filter(ee.Filter.inList('shapeName', ['Bayern','Bavaria']));

//var start = '2014-01-01', end='2015-12-31'; //bis 2024 und selbst 2016 gibt es schon memory limit exceeded probleme
var start = '2002-01-01', end='2002-12-31';
var mod = ee.ImageCollection('MODIS/061/MOD11A1')
  .filterDate(start, end)
  .select('LST_Day_1km'); // scale 0.02 K

var modC = mod.map(function(img){
  return img.multiply(0.02).subtract(273.15)
            .rename('LST_C')
            .copyProperties(img, ['system:time_start']);
});

var daily = modC.map(function(img){
  var mean = img.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: aoi,
    scale: 1000,
    bestEffort: true
  }).get('LST_C');
  return ee.Feature(null, {millis: img.date().millis(), mean_C: mean});
});

print(ui.Chart.feature.byFeature({
  features: daily.sort('millis'),
  xProperty: 'millis',
  yProperties: ['mean_C']
}).setOptions({title:'MODIS Daily LST (°C) — Bavaria'}));
