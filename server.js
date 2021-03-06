/**
* @descripción Módulos, archivos y servicios REST usados por el servidor
* @autor Adrián Sánchez <contact@imaginexyz.com>
*/

//Módulos Necesitados
var express = require('express'), //Biblioteca para permitir servicios REST
cookieParser = require('cookie-parser'),
bodyParser = require('body-parser'), //Biblioteca para manejar los datos de las solicitudes
http = require('http');

//REST APIS
var database = require('./services/database'),
remora = require('./services/remora'),
zeus = require('./services/zeus'); //Archivo donde vamos a comunicarnos con la base de datos

//Instancia del servidor
//Habilitar puerto de escucha para el servidor
var app = express(),
port = Number(process.env.PORT || 3000)
server = http.Server(app).listen(port);

//Socket.io
var socketio = require('socket.io'),
socketEvents = require('./services/socketEvents'),
io = socketio(server);
socketEvents(io);

//Configuraciones generales de express
app.use(express.logger('dev')); //Método de ver los mensajes en consola
app.use(bodyParser());

app.use(express.static(__dirname + '/webpage')); //Página por defecto al ingresar al servidor
app.use('/imaginexyz', express.static(__dirname + '/graphs')); //Página para vizualizar los datos ingresados
app.use('/google', express.static(__dirname + '/google')); //Página para vizualizar los ejemplos de Google
app.use('/gps', express.static(__dirname + '/gps')); //Página para vizualizar los datos del GPS
app.use('/basic', express.static(__dirname + '/basic')); //Página para vizualizar los datos del GPS
app.use('/zeus',express.static(__dirname + '/zeus')); //Página para vizualizar remora

//Servicios REST permitidos
app.get('/imaginexyz/genuinoday', database.getData);  //GET
app.post('/imaginexyz/genuinodayb', database.newDataBody); //POST Body
app.post('/imaginexyz/genuinodayq', database.newDataQuery); //POST Query
app.put('/imaginexyz/genuinoday', database.editData); //PUT
app.delete('/imaginexyz/genuinoday', database.removeData); //DELETE

app.get('/imaginexyz/graphs', database.getInfo); //Query para obtener cantidades de los datos enviados y leidos
app.get('/imaginexyz/posts', database.getPosts); //Query para obtener los datos enviados y leidos por minuto

app.post('/gps/headers', remora.getHeaders); //Query para obtener los datos enviados y leidos por minuto
app.post('/gps/sabana', remora.getSabana); //Query para obtener los datos enviados y leidos por minuto
app.get('/gps/today', remora.getToday); //Query para obtener los datos enviados y leidos por minuto
//app.post('/gps/today', remora.insertToday); //Query para obtener los datos enviados y leidos por minuto
app.get('/imaginexyz/posts', database.getPosts); //Query para obtener los datos enviados y leidos por minuto
app.get('/imaginexyz/posts', database.getPosts); //Query para obtener los datos enviados y leidos por minuto

//Demo Jonathan
app.get('/zeus/filter', zeus.getFilter); //Query para obtener los datos filtrados por fecha
app.delete('/geofence', socketEvents.deleteGeofence, zeus.deleteGeofence); //Eliminar una geofence especifica

//Insertar un nuevo punto
app.post('/gps/today',
//Middleware para redirigir el punto al cliente
  socketEvents.updatePoint,
//Insercion del punto en BD
zeus.insertNewPoint);




/*var client = mqtt.createClient(mqtt_url.port, mqtt_url.hostname, { //Cliente MQTT
username: auth[0],
password: auth[1]
});
client.on('connect', function() {
//Subscribirse a un tema
client.subscribe('imaginexyz/listen', function() {
  
  //Cuando llega un mensaje
  client.on('message', function(topic, message, packet) {
    var fullMessage = '' + message + '';
    client.publish('imaginexyz/connected', fullMessage);
    lastOne['message'] = fullMessage;
      console.log(message + "' recibido en el tema: '" + topic + "'");
  });
});
// publish a message to a topic
client.publish('imaginexyz/connected', 'conectado', function() {
  console.log("Mensaje publicado");
});
});
*/


//Redirección por defecto
app.get('*', function (req, res) {
res.redirect('../#home', 404);
});


console.log('Listening on port ' + port + '...');