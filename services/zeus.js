'use strict'
var mongo = require('mongodb'); //Biblioteca para comunicarse con la base de datos MongoDB
var GeoJSON = require('geojson'); //Modulo para parsear de un json a un geoJson
var turf = require('turf'); //Modulo para medir distancias a partir de coordenadas

//Puerto de conexión con la base de datos (no es el mismo de escucha del servidor)
var uristring =
    process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://localhost/Remora',
    //'mongodb://heroku_v37rd9bf:lsd8ccnsrsn5skoiv1rpncad77@ds011890.mlab.com:11890/heroku_v37rd9bf',
    db;


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

//Retorna todos los puntos
exports.getAllPoints = function () {

    return new Promise(function (resolve, reject) {

        //Indexes geospatial
        /* db.collection('Zeus').createIndex({ geo: "2dsphere" })
        db.collection('geofence').createIndex({ geo: "2dsphere" }) */

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

//Retorna todas las lineas
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

//Retorna todos las geofences
exports.getAllPolygons = function () {

    return new Promise((resolve, reject) => {

        db.collection('geofence').find({ geo: { $exists: true } },{simplify:0}).toArray(function (err, doc) {

            err ? reject(err) : resolve(doc)
        });
    });
}

//Retorna todas las geofences simplificadas
exports.getAllSimplifyPolygons = function () {
    
        return new Promise((resolve, reject) => {
    
            db.collection('geofence').find({ simplify: { $exists: true } },{geo:0}).toArray(function (err, doc) {
                console.log('doc')
                console.log(doc)

                err ? reject(err) : resolve(doc)
            });
        });
    }

//Retorna los datos filtrados por fechas
exports.getFilter = function (req, res) {

    var dInit = req.query.dateInit,
        dEnd = (req.query.dateEnd) ? req.query.dateEnd : new Date();

    Promise.all([filterPoints(dInit, dEnd), filterLines(dInit, dEnd)]).then(function (data) {

        let gjPoints = GeoJSON.parse(data[0], { GeoJSON: 'geo' });
        var gjLines = GeoJSON.parse(data[1], { 'LineString': 'line' });

        res.send(200, { gjPoints, gjLines });
    });


}

//Filtracion de los puntos
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

//Filtracion de las lineas
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

//Inserta una nueva geofence
exports.insertNewPolygon = (data) => {

    return new Promise((resolve, reject) => {

        var arrGeofences = [];
        //Recorrer todas las features para almacenar los poligonos uno por uno
        data.features.forEach(function (feature) {

            arrGeofences.push({
                description: 'zona protegida',
                geo: feature.geometry
            })
        })

        //Guardar las geofences
        db.collection('geofence').insert(arrGeofences, function (err, doc) {
            if (err) {
                throw err;
                reject(Error("Err to save"))
            }
            else resolve(doc)
        });
    }
    );
}

//Inserta la geofence simplificada
exports.insertSimplifyPolygon = (data) => {

    return new Promise((resolve, reject) => {

        let _id = new mongo.ObjectID(data.properties._id),
            simplify = data.geometry

        db.collection('geofence').findAndModify(
            { _id: _id },
            [],
            { $set: { simplify } },
            { new: true },
            function (err, doc) {
                if (err) {
                    throw err;
                    reject(Error("Err to save"))
                }
                else resolve(doc)
            });
    }
    );
}

//Inserta un nuevo punto 
exports.insertNewPoint = function (req, res) {

    var pos = req.body;
    db.collection('Zeus').insert(pos, function (err, doc) {
        if (err) { throw err; res.send(400, err); }
        else {
            res.send(200, doc);
        }
    });
}

//Elimina una geofence
exports.deleteGeofence = function (req, res) {

    console.log(req.body.id)
    var id = req.body.id;
    db.collection('geofence').findAndRemove({ _id: new mongo.ObjectID(id) }, function (err, result) {
        if (err) {
            throw err;
            res.send(400, err);
        }
        else {
            res.send(200, result);
        }
    });
}

//Comprueba si el nuevo punto a insertar se encuentro dentro de una geofence
exports.checkGeofence = (geo) => {

    return new Promise((resolve, reject) => {

        db.collection('geofence').find({
            geo:
            {
                $nearSphere:
                {
                    $geometry: geo,
                    $maxDistance: 0
                }
            }
        }).toArray(function (err, doc) {

            err ? reject(err) : resolve(doc)
        });

    })
}