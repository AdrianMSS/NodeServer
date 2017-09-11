var HOST = 'https://imaginexyz-genuinoday.herokuapp.com';
//var HOST = 'http://localhost:3000';

//Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiZGF2aWR0aGVjbGFyayIsImEiOiJjaW93emVwanowMW5ldGhtNGI2N293eDY3In0.-hV-UWrYPEZWbILtCFFbOg';
var data = [];
var monument = [-84, 10];
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: [-84.0765528406493,9.933541429759131],
    zoom: 7
});

//SocketIO
var socket = io.connect(HOST);

//DRAW POLYGON
var draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        polygon: true,
        trash: true
    }
});

map.addControl(draw);

$('#saveGeofences').click(function () {
    console.log(draw.getAll().features.length)

    if(draw.getAll().features.length == 0){ 
        alert("Debe dibujar el poligono primero");
    }else{

        socket.emit('saveGeofences', draw.getAll());
    }
    
});

