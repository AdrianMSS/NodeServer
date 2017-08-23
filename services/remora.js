/**
* @descripción Funciones relacionadas con la base de datos
* @autor Adrián Sánchez <contact@imaginexyz.com>
*/

var mongo = require('mongodb'); //Biblioteca para comunicarse con la base de datos MongoDB

//Puerto de conexión con la base de datos (no es el mismo de escucha del servidor)
var uristring = 
  process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://localhost/Remora';


//Conexión con la base de datos
mongo.MongoClient.connect(uristring, function(err, database) {
    if(!err) {
        db = database; //Instancia de la base de datos
        console.log('Connected to the "Remora" database');
    }
    else{
        console.log(404, 'Error Connecting to the "Remora" database');
    }
});

//Función para el manejo de la zona horaria
Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}

/******************* RÉMORA ********************/


exports.getHeaders = function(req,res) {
    var latIn = Math.floor(parseFloat(req.body.lat) * 100) / 100,
        lonIn = Math.ceil(parseFloat(req.body.lon) * 100) / 100,
        posArray = [];
    posArray.push({id:1,lat:latIn-0.005,lon:lonIn+0.005},{id:2,lat:latIn-0.005,lon:lonIn-0.005},{id:3,lat:latIn-0.005,lon:lonIn-0.015},
                    {id:4,lat:latIn+0.005,lon:lonIn+0.005},{id:5,lat:latIn+0.005,lon:lonIn-0.005},{id:6,lat:latIn+0.005,lon:lonIn-0.015},
                    {id:7,lat:latIn+0.015,lon:lonIn+0.005},{id:8,lat:latIn+0.015,lon:lonIn-0.005},{id:9,lat:latIn+0.015,lon:lonIn-0.015});
    posArray.map(function(pos){
        pos.lat=parseFloat(pos.lat.toFixed(3));
        pos.lon=parseFloat(pos.lon.toFixed(3));
    });
    res.send(200, posArray);
    /*db.collection('Ids').findAndModify({_id:1},{},{$inc:{headers:1}},function(err, doc_ids) {
        if(err) {
            throw err;
            res.send(400, err);
        }
        else{
            db.collection('ImagineXYZ').find({}).toArray(function(error, doc){
                if(error) {
                    throw error;
                    res.send(400, error);
                }
                else{
                    res.send(200, doc);
                }
            })
        }
    });*/
}

exports.getSabana = function(req,res) {
    console.log(req.body.array);
    var latIn = 9.93,
        lonIn = -84.11,
        posArray = [];
    posArray.push({id:1,lat:latIn-0.005,lon:lonIn+0.005},{id:2,lat:latIn-0.005,lon:lonIn-0.005},{id:3,lat:latIn-0.005,lon:lonIn-0.015},
                    {id:4,lat:latIn+0.005,lon:lonIn+0.005},{id:5,lat:latIn+0.005,lon:lonIn-0.005},{id:6,lat:latIn+0.005,lon:lonIn-0.015},
                    {id:7,lat:latIn+0.015,lon:lonIn+0.005},{id:8,lat:latIn+0.015,lon:lonIn-0.005},{id:9,lat:latIn+0.015,lon:lonIn-0.015});
    posArray.map(function(pos){
        pos.lat=parseFloat(pos.lat.toFixed(3));
        pos.lon=parseFloat(pos.lon.toFixed(3));
    });
    res.send(200, posArray);
}

exports.getToday = function(req, res) {
  db.collection('Zeus').find({"_id":{"$gte":mongo.ObjectId('5926f692d1210500049de744')}}).toArray(function(err, doc) {
      if(err) {throw err;res.send(400, err);}
      else{
        doc.forEach(function(element, index){
          var fecha = ""+element.fecha;
          //fecha = fecha.slice(6,8) + "-" + fecha.slice(4,6) + "-" + fecha.slice(0,4) + "  " + fecha.slice(8,10) + ":" + fecha.slice(10,12) + "." + fecha.slice(12,14);
          var newDate = new Date(fecha.slice(0,4), parseInt(fecha.slice(4,6))-1, fecha.slice(6,8), fecha.slice(8,10), fecha.slice(10,12));
          element.fecha = newDate;
          if(element.hour === undefined)element.hour=0;
          if(element.minute === undefined)element.minute=0;
          element['newDate'] = newDate.getDate() + '/' + (newDate.getMonth() + 1) + '/' + newDate.getUTCFullYear() + ' ' + newDate.getHours() + ':' + newDate.getMinutes();
        })
        res.send(200, doc);
      }
  });
}

exports.insertToday = function(req, res) {
  console.log(req)
  console.log(req.body)
  var pos = req.body,
    now = new Date().addHours(-6),
    nowString = now.getDate() + '/' + (now.getMonth() + 1) + '/' + now.getUTCFullYear();
  pos['date'] = nowString;
  pos['hour'] = new Date().addHours(-6).getHours();
  pos['minute'] = new Date().addHours(-6).getMinutes();
  db.collection('Zeus').insert(pos ,function(err, doc) {
      if(err) {throw err;res.send(400, err);}
      else{
        res.send(200, pos);
      }
  });
}

/*****Demo JonathanAGG*******/

exports.insertNewPoint = function (req, res) {
    
        var pos = req.body;
    
        //Fecha actual del servidor
        pos['dateServer'] = new Date().addHours(-6);
    
        //Dar formato a la fecha de remora
        var fecha = "" + pos.fecha;
        var dateRemora = new Date(fecha.slice(0, 4), parseInt(fecha.slice(4, 6)) - 1, fecha.slice(6, 8), fecha.slice(8, 10), fecha.slice(10, 12));
        pos["dateRemora"] = dateRemora;
    
        //Dar formato al geoJson
        pos['geo'] = {
            type: "Point",
            "coordinates": [pos.lon,pos.lat]
        };
    
        delete pos['fecha'];
        delete pos['lat'];
        delete pos['lon'];
        
        //Insertar en DB
        db.collection('Zeus').insert(pos, function (err, doc) {
            if (err) { throw err; res.send(400, err); }
            else {
                res.send(200, doc);
            }
        });
    }