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
  var now = new Date().addHours(-6),
    now2 = new Date().addHours(-30),
    now3 = new Date().addHours(-54),
    now4 = new Date().addHours(-78),
    now5 = new Date().addHours(-102),
    now6 = new Date().addHours(-126),
    now7 = new Date().addHours(-150),
    now8 = new Date().addHours(-174),
    now9 = new Date().addHours(-198),
    nowString = now.getDate() + '/' + (now.getMonth() + 1) + '/' + now.getUTCFullYear(),
    nowString2 = now2.getDate() + '/' + (now2.getMonth() + 1) + '/' + now2.getUTCFullYear(),
    nowString3 = now3.getDate() + '/' + (now3.getMonth() + 1) + '/' + now3.getUTCFullYear(),
    nowString4 = now4.getDate() + '/' + (now4.getMonth() + 1) + '/' + now4.getUTCFullYear(),
    nowString5 = now5.getDate() + '/' + (now5.getMonth() + 1) + '/' + now5.getUTCFullYear(),
    nowString6 = now6.getDate() + '/' + (now6.getMonth() + 1) + '/' + now6.getUTCFullYear(),
    nowString7 = now7.getDate() + '/' + (now7.getMonth() + 1) + '/' + now7.getUTCFullYear(),
    nowString8 = now8.getDate() + '/' + (now8.getMonth() + 1) + '/' + now8.getUTCFullYear(),
    nowString9 = now9.getDate() + '/' + (now9.getMonth() + 1) + '/' + now9.getUTCFullYear();
  db.collection('Zeus').find({$or: [{date:nowString},{date:nowString2},{date:nowString3},{date:nowString4},{date:nowString5},{date:nowString6},{date:nowString7},{date:nowString8},{date:nowString9}]}).toArray(function(err, doc) {
      if(err) {throw err;res.send(400, err);}
      else{
        res.send(200, doc);
      }
  });
}

exports.insertToday = function(req, res) {
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