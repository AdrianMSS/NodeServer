var GeoJSON = require('geojson'); //Modulo para generar geojson
var _ = require('lodash');
var zeus = require('./zeus');
var sock;

module.exports = function (io) {

  sock = io.on('connection', (socket) => {
    console.log('a user connected');
    getAllFeatures();

    //Recibe un nuevo poligino para almacenarlo
    socket.on('saveGeofences', function (data) {
      
      zeus.insertNewPolygon(data)
        .then(function (result) {
          
          var gjPolygons = GeoJSON.parse(result.ops, { GeoJSON: 'geo' });
          socket.emit('updateGeofences', gjPolygons);
          socket.broadcast.emit('updateGeofences', gjPolygons);
        }, function (err) {
          console.log(err);
        });
    });

    //Envia las geofences existentes 
    socket.on('getGeofences', function (data) {

      zeus.getAllPolygons()
        .then(function (geofences) {

          var gjPolygons = GeoJSON.parse(geofences, { GeoJSON: 'geo' });
          socket.emit('sendGeofences', gjPolygons);
        }, function (err) {
          console.log(err);
        });
    });
  });

  //Funcion que envia todos los puntos y las lineas cuando un cliente ingresa por primera vez
  function getAllFeatures() {

    Promise.all([zeus.getAllPoints(), zeus.getAllLines(), zeus.getAllPolygons()]).then(function (data) {

      //Generar los geojson 
      var gjPoints = GeoJSON.parse(data[0], { GeoJSON: 'geo' });
      var gjLines = GeoJSON.parse(data[1], { 'LineString': 'line' });
      var gjPolygons = GeoJSON.parse(data[2], { GeoJSON: 'geo' });

      sock.emit('displayAllFeatures', { gjPoints, gjLines, gjPolygons });
    });
  }

  /*Funcion que se ejecuta cada vez que remora envia un nuevo punto al server.
  Redirige el nuevo punto al cliente para visualizarlo en tiempo real*/
  module.exports.updatePoint = function (req, res, next) {

    var point = req.body;
    //Fecha actual del servidor
    point['dateServer'] = new Date().addHours(-6);

    //Dar formato a la fecha de remora
    var fecha = "" + point.fecha;
    var dateRemora = new Date(fecha.slice(0, 4), parseInt(fecha.slice(4, 6)) - 1, fecha.slice(6, 8), fecha.slice(8, 10), fecha.slice(10, 12)).addHours(-6);
    point["dateRemora"] = dateRemora;

    //Dar formato al geoJson
    point['geo'] = {
      type: "Point",
      "coordinates": [point.lon, point.lat]
    };

    delete point['fecha'];
    delete point['lat'];
    delete point['lon'];

    var gjNewPoint = GeoJSON.parse(point, { GeoJSON: 'geo' });
    sock.emit('updateShip', gjNewPoint);

    next();
  }

  module.exports.deleteGeofence = function (req, res, next) {

        sock.emit('deletedGeofence', {id: req.body.id});
        next();
      }

};

