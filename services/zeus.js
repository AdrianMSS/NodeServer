'use strict'
var mongo = require('mongodb'); //Biblioteca para comunicarse con la base de datos MongoDB
var GeoJSON = require('geojson'); //Modulo para parsear de un json a un geoJson
var turf = require('turf'); //Modulo para medir distancias a partir de coordenadas

//Puerto de conexión con la base de datos (no es el mismo de escucha del servidor)
var uristring =
    process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://localhost/Remora';
//'mongodb://heroku_v37rd9bf:lsd8ccnsrsn5skoiv1rpncad77@ds011890.mlab.com:11890/heroku_v37rd9bf';


//Conexión con la base de datos
mongo.MongoClient.connect(uristring, function (err, database) {
    if (!err) {
        db = database; //Instancia de la base de datos
        console.log('Connected to the "Zeus" database');
    }
    else {
        console.log(404, 'Error Connecting to the "Zeus" database');
    }
});

//Función para el manejo de la zona horaria
Date.prototype.addHours = function (h) {
    this.setHours(this.getHours() + h);
    return this;
}


exports.getAllPoints = function () {

    return new Promise(function (resolve, reject) {
        db.collection('Zeus').find({ geo: { $exists: true } }).sort({ dateRemora: 1 }).toArray(function (err, doc) {

            if (err) reject(err);
            else {

                var previousPoint, distance;
                doc.forEach(function (element, index) {



                    if (index == 0) previousPoint = element

                    //Tiempo trancurrido entre punto y punto
                    let dateInit = new Date(previousPoint.dateRemora).getTime();
                    let dateEnd = new Date(element.dateRemora).getTime();
                    let diffMin = (dateEnd - dateInit) / (1000 * 60);

                    //Distancia entre punto y punto 
                    let from = turf.point(previousPoint.geo.coordinates);
                    let to = turf.point(element.geo.coordinates);
                    distance = turf.distance(from, to);

                    element['deltaDistance'] = distance;
                    element['deltaTime'] = diffMin;
                    element['Head'] = parseInt(element['Head']) + 180
                    previousPoint = element

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

exports.getAllPolygons = function () {

    return new Promise((resolve, reject) => {

        db.collection('geofence').find({ geo: { $exists: true } }).toArray(function (err, doc) {

            err ? reject(err) : resolve(doc)
        });
    });
}

exports.getFilter = function (req, res) {

    var dInit = req.query.dateInit,
        dEnd = (req.query.dateEnd) ? req.query.dateEnd : new Date();

    Promise.all([filterPoints(dInit, dEnd), filterLines(dInit, dEnd)]).then(function (data) {

        let gjPoints = GeoJSON.parse(data[0], { GeoJSON: 'geo' });
        var gjLines = GeoJSON.parse(data[1], { 'LineString': 'line' });

        res.send(200, { gjPoints, gjLines });
    });


}

var filterPoints = (dInit, dEnd) => {

    return new Promise(function (resolve, reject) {

        db.collection('Zeus').find({
            "$and": [
                { "dateRemora": { "$gte": new Date(dInit) } },
                { "dateRemora": { "$lte": new Date(dEnd) } }]
        }).sort({ dateRemora: 1 }).toArray(function (err, doc) {

            if (err) { throw err; res.send(400, err); }
            else {

                var previousPoint, distance;
                doc.forEach(function (element, index) {

                    if (index == 0) previousPoint = element

                    //Tiempo trancurrido entre punto y punto
                    let dateInit = new Date(previousPoint.dateRemora).getTime();
                    let dateEnd = new Date(element.dateRemora).getTime();
                    let diffMin = (dateEnd - dateInit) / (1000 * 60);

                    //Distancia entre punto y punto 
                    let from = turf.point(previousPoint.geo.coordinates);
                    let to = turf.point(element.geo.coordinates);
                    distance = turf.distance(from, to);

                    element['deltaDistance'] = distance;
                    element['deltaTime'] = diffMin;
                    element['Head'] = parseInt(element['Head']) + 180
                    previousPoint = element

                })
                resolve(doc)
            }
        });


    });
}

var filterLines = (dInit, dEnd) => {

    return new Promise(function (resolve, reject) {

        db.collection('Zeus').aggregate([
            {
                $match: {
                    "$and": [
                        { "dateRemora": { "$gte": new Date(dInit) } },
                        { "dateRemora": { "$lte": new Date(dEnd) } }]
                }
            },
            {
                $group: {
                    _id: "$ID",
                    line: {
                        $push: "$geo.coordinates"
                    }
                }
            }
        ],
            function (err, doc) {

                if (err) { throw err; res.send(400, err); }
                else {
                    resolve(doc)
                }
            });
    });
}

exports.insertNewPolygon = (data) => {

    return new Promise((resolve, reject) => {

        var boolErr;
        //Recorrer todas las features para almacenar los poligonos uno por uno
        data.features.forEach(function (feature) {

            //llenar la entidad para agregar el nuevo poligono a la db
            var geofence = {
                description: 'zona protegida',
                geo: feature.geometry
            }

            //Guardar el nuevo poligono
            db.collection('geofence').insert(geofence, function (err, doc) {
                if (err) { throw err; boolErr = true }
                else console.log('success');

            });
        })

        boolErr == true ? reject(Error("Err to save")) : resolve("Success")
    }
    );


}

exports.insertNewPoint = function (req, res) {

    var pos = req.body;
    db.collection('Zeus').insert(pos, function (err, doc) {
        if (err) { throw err; res.send(400, err); }
        else {
            res.send(200, doc);
        }
    });
}

exports.deleteGeofence = function (req, res) {
    
        console.log(req.body.id)
        var id = req.body.id;
        db.collection('geofence').findAndRemove({_id: new mongo.ObjectID(id)},function(err, result) {
            if(err) {
                throw err;
                res.send(400, err);
            }
            else{
                res.send(200, result);
            }  
        }); 
    }