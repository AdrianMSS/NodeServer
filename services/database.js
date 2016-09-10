/**
* @descripción Funciones relacionadas con la base de datos
* @autor Adrián Sánchez <contact@imaginexyz.com>
*/

var mongo = require('mongodb'); //Biblioteca para comunicarse con la base de datos MongoDB

//Puerto de conexión con la base de datos (no es el mismo de escucha del servidor)
var uristring = 
  process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://localhost/Genuino';


//Conexión con la base de datos
mongo.MongoClient.connect(uristring, function(err, database) {
    if(!err) {
        db = database; //Instancia de la base de datos
        console.log('Connected to the "Genuino" database');
    }
    else{
        console.log(404, 'Error Connecting to the "Genuino" database');
    }
});

//Función para el manejo de la zona horaria
Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}


/* Funciones CRUD Básicas */

//GET - READ
exports.getData = function(req,res) {
    db.collection('Ids').findAndModify({_id:1},{},{$inc:{gets:1}},function(err, doc_ids) {
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
    });
}


//POST- CREATE
exports.newDataBody = function(req, res) {
    var resource = req.body;
    console.log(resource);
    resource['date'] = new Date().addHours(-6);
    resource['hour'] = new Date().addHours(-6).getHours();
    resource['minute'] = new Date().addHours(-6).getMinutes();
    db.collection('Ids').findAndModify({_id:1},{},{$inc:{posts:1}},function(err, doc_ids) {
        if(err) {
            throw err;
            res.send(400, err);
        }
        else{
            resource["_id"] = doc_ids.value.posts;
            db.collection('ImagineXYZ').insert(resource, function(error, doc_project){
                if(error) {
                    throw error;
                    res.send(400, error);
                }
                else{
                    res.send(200, resource);
                }
            })
        }
    });
}

//POST- CREATE
exports.newDataQuery = function(req, res) {
    var resource = req.query;
    resource['date'] = new Date().addHours(-6);
    resource['hour'] = new Date().addHours(-6).getHours();
    resource['minute'] = new Date().addHours(-6).getMinutes();
    db.collection('Ids').findAndModify({_id:1},{},{$inc:{posts:1}},function(err, doc_ids) {
        if(err) {
            throw err;
            res.send(400, err);
        }
        else{
            resource["_id"] = doc_ids.value.posts;
            db.collection('ImagineXYZ').insert(resource, function(error, doc_project){
                if(error) {
                    throw error;
                    res.send(400, error);
                }
                else{
                    res.send(200, resource);
                }
            })
        }
    });
}

//PUT - UPDATE
exports.editData = function(req, res) {
    var resource = req.body,
        posts = parseInt(req.body._id);
    db.collection('ImagineXYZ').update({_id:posts}, resource, {upsert: true, new: true},function(err, doc) {
        if(err) {
            throw err;
            res.send(400, err);
        }
        else{
            res.send(200, resource);
        }
    });
}

//DELETE - DELETE
exports.removeData = function(req, res) {
    var posts = parseInt(req.body._id);
    db.collection('ImagineXYZ').findAndRemove({_id:posts},function(err, result) {
        if(err) {
            throw err;
            res.send(400, err);
        }
        else{
            res.send(200, result);
        }  
    });
}

/* Funcion de Info */
exports.getInfo = function(req,res) {
    db.collection('Ids').findOne({_id:1},function(err, doc) {
        if(err) {
            throw err;
            res.send(400, err);
        }
        else{
            res.send(200, doc);
        }
    });
}

exports.getPosts = function(req,res) {
    db.collection('ImagineXYZ').aggregate([
    {$match:{}},
    {$group:{'_id':{'hour':'$hour', 'minute':'$minute'}, 'totalSend':{$sum:1}}},
    { "$sort": { "_id.hour": 1, "_id.minute": 1 } }], function(err, doc_res) {

        if(err) throw err;

        if (!doc_res) {
            console.log("No document found");
            
        }           
        else {
            res.send(200, doc_res);
        }
    });
}
