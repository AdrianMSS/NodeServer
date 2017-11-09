//var HOST = 'https://imaginexyz-genuinoday.herokuapp.com';
var HOST = 'http://localhost:3000';
var gjPolygons, gjSimplify, file, flag;
//Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiamdyYW5hZG9zIiwiYSI6ImNqNWNzMjVnMjAxc2MzMm51Yjk2ZG9oY3YifQ.6XIiaaLKqPoSxluayRcsdg';
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
    center: [-84.07836513337293, 9.933419690622571],
    zoom: 7
});

//var popup = new mapboxgl.Popup();

//SocketIO
var socket = io.connect(HOST);

//Recibe todas las gefences para mostrarlas en el mapa
socket.on('sendGeofences', function (data) {

    console.log('geofence')
    console.log(data)

    gjPolygons = data;
    //Cargar el mapa con las geofences 
    map.addSource('scGeofence', { type: 'geojson', data: gjPolygons });
    map.addLayer({
        'id': 'layrGeofence',
        'type': 'fill',
        'source': 'scGeofence',
        'layout': {},
        'paint': {
            'fill-color': '#FF7400',
            'fill-opacity': 1
        }
    });


    map.on('click', 'layrGeofence', function (event) {

        //Buscar el poligono seleccionado para cargarlo en la vista de simplificacion
        gjPolygons.features.forEach(function (feature, i) {

            if (event.features[0].properties._id == feature.properties._id) {

                openNav();
                simplifyGeojson.loadGeojson(feature)
                console.log(feature)
            }
        });
    });
});

//Recibe todas las gefences simplificadas para mostrarlas en el mapa
socket.on('sendSimplifyGeofences', function (data) {

    console.log('simplify')
    console.log(data)

    gjSimplify = data;
    //Cargar el mapa con las geofences 
    map.addSource('scSimplify', { type: 'geojson', data: gjSimplify });
    map.addLayer({
        'id': 'layrSimplify',
        'type': 'fill',
        'source': 'scSimplify',
        'layout': {},
        'paint': {
            'fill-color': '#3BDC00',
            'fill-opacity': 0.4
        }
    });
});

//UPDATE_GEOFENCING
socket.on('updateGeofences', function (data) {


    data.features.forEach(function (feature, index) {

        gjPolygons.features.push(feature);
        map.getSource('scGeofence').setData(gjPolygons);

    });
});

//Este funcion se llama cuando se retorna una geofence simplificada
function displaySimplifyGJ(gj) {

    closeNav();
    var newSimplify = gj.features[0];

    gjSimplify.features.forEach(function (feature, index) {
        //Si existe una geofence simplificada la elimina para replazarla por la nueva 
        if (feature.properties._id == newSimplify.properties._id)
            gjSimplify.features.splice(index, 1);
    })

    gjSimplify.features.push(newSimplify);
    map.getSource('scSimplify').setData(gjSimplify);
    //Enviar la nueva geofence simplificada al servidor para almacenarla 
    socket.emit('saveSimplifyGeofence', newSimplify);
}


function openNav() {
    document.getElementById("navSimplify").style.width = "90%";
}

function closeNav() {
    document.getElementById("navSimplify").style.width = "0%";
}

map.on('load', function () {

    //ShowHideGeofences
    $('#hideGeofences').click(showHideLayer('layrGeofence'));
    $('#hideSimplify').click(showHideLayer('layrSimplify'));

})



function showHideLayer(layer) {

    return function () {

        var visibility = map.getLayoutProperty(layer, 'visibility') || 'visible';

        console.log(visibility)

        if (visibility === 'visible') {
            map.setLayoutProperty(layer, 'visibility', 'none');
        } else {
            map.setLayoutProperty(layer, 'visibility', 'visible');
        }
    }
}