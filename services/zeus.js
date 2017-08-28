
var mongo = require('mongodb'); //Biblioteca para comunicarse con la base de datos MongoDB
var GeoJSON = require('geojson'); //Modulo para parsear de un json a un geoJson
//var turf = require('@turf/turf'); //Modulo para medir distancias a partir de coordenadas

//Puerto de conexión con la base de datos (no es el mismo de escucha del servidor)
var uristring =
    process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://localhost/Remora';


//Conexión con la base de datos
mongo.MongoClient.connect(uristring, function (err, database) {
    if (!err) {
        db = database; //Instancia de la base de datos
        console.log('Connected to the "Remora" database');
    }
    else {
        console.log(404, 'Error Connecting to the "Remora" database');
    }
});

//Función para el manejo de la zona horaria
Date.prototype.addHours = function (h) {
    this.setHours(this.getHours() + h);
    return this;
}


exports.getAllPoints = function () {

    return new Promise(function (resolve, reject) {
        db.collection('Zeus').find({ geo: { $exists: true } }).sort({ dateServer: 1 }).toArray(function (err, doc) {

            if (err) reject(err);
            else {
                //(Temporal) direccion head
                doc.forEach(function (element, index) {
                    element['Head'] =  parseInt(element['Head']) +180
/* 
                    var dc = {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                          type: 'LineString',
                          coordinates: [
                            [-77.031669, 38.878605],
                            [-77.029609, 38.881946],
                            [-77.020339, 38.884084],
                            [-77.025661, 38.885821],
                            [-77.021884, 38.889563],
                            [-77.019824, 38.892368]
                          ]
                        }
                      };
                      
                      var length = turf.lineDistance(dc, 'miles');
                
                      console.log('demo44')
                      console.log(length) */

                })
                resolve(doc)
            };
        });
    });
}

exports.getAllLines = function () {

    return new Promise(function (resolve, reject) {
        db.collection('Zeus').aggregate([{
            $group: {
              _id: "$ID",
              line: {
                $push: "$geo.coordinates"
              }
            }
          }], function (err, doc) {

            if (err) { throw err; res.send(400, err); }
            else {
                resolve(doc)
            }
          });
    });
}

exports.getFilter = function (req, res) {
    console.log("demo filter")
    console.log(req.query);
    var dInit = req.query.dateInit,
        dEnd = req.query.dateEnd;

    db.collection('Zeus').find({
        "$and": [
            { "dateServer": { "$gte": new Date(dInit) } },
            { "dateServer": { "$lte": new Date(dEnd) } }]
    }).sort({ fecha: 1 }).toArray(function (err, doc) {

        if (err) { throw err; res.send(400, err); }
        else {

            //(Temporal) direccion head
            doc.forEach(function (element, index) {
                element['Head'] =  parseInt(element['Head']) +180
            })
            
            gjPoints = GeoJSON.parse(doc, { GeoJSON: 'geo' });
            res.send(200, {gjPoints});
        }
    });
}


exports.insertNewPoint = function (req, res) {

    var pos = req.body;
    //console.log(pos)
    //Insertar en DB
    db.collection('Zeus').insert(pos, function (err, doc) {
        if (err) { throw err; res.send(400, err); }
        else {
            res.send(200, doc);
        }
    });
}