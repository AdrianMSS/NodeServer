var HOST = 'https://imaginexyz-genuinoday.herokuapp.com';
//var HOST = 'http://localhost:3000';
var gjPolygons;
//Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiZGF2aWR0aGVjbGFyayIsImEiOiJjaW93emVwanowMW5ldGhtNGI2N293eDY3In0.-hV-UWrYPEZWbILtCFFbOg';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: [-84.0765528406493, 9.933541429759131],
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

$('.mapboxgl-ctrl-group')
    .append('<button id="saveGeofences" onclick= "saveGeofences()" class="mapbox-gl-draw_ctrl-draw-btn" title="Save Geofences">' +
    '<span class="glyphicon glyphicon-floppy-disk"></span></button>');

function saveGeofences() {
    console.log(draw.getAll().features.length)

    if (draw.getAll().features.length == 0) {
        alert("Debe dibujar el poligono primero");
    } else {

        socket.emit('saveGeofences', draw.getAll());
        alert("Success");
    }

};

socket.emit('getGeofences');
socket.on('sendGeofences', function (data) {

    gjPolygons = data;
    //Cargar el mapa con las geofences 
    map.addSource('scPolygons', { type: 'geojson', data: gjPolygons });
    map.addLayer({
        'id': 'maine',
        'type': 'fill',
        'source': 'scPolygons',
        'layout': {},
        'paint': {
            'fill-color': '#088',
            'fill-opacity': 0.8
        }
    });

    //Cargar la tabla con las geofences
    gjPolygons.features.forEach(function (e) {

        $('#table-geofences tbody').append(
            '<tr id="tr'+e.properties._id+'"><td><a href="#" onclick="findGeofence(this)" id="' + e.properties._id + '">' +
            'Geofence</a></td><td><a onclick="deleteGeofence(this)" id="' + e.properties._id + '"><span class="glyphicon glyphicon-trash"></span></a></td></tr>'
        )
    });
});

//UPDATE_GEOFENCING
socket.on('updateGeofences', function (data) {


        data.features.forEach(function (feature, index) {
    
            gjPolygons.features.push(feature);
            map.getSource('scPolygons').setData(gjPolygons);

            console.log('dem')
            console.log(feature)
            //cargar las geofences en la tabla
            $('#table-geofences tbody').append(
                '<tr id="tr'+feature.properties._id+'"><td><a href="#" onclick="findGeofence(this)" id="' + feature.properties._id + '">' +
                'Geofence</a></td><td><a onclick="deleteGeofence(this)" id="' + feature.properties._id + '"><span class="glyphicon glyphicon-trash"></span></a></td></tr>'
            )
        });
    });



function findGeofence(geofence) {

    console.log(geofence)

    var id = $(geofence).attr('id');

    gjPolygons.features.forEach(function (e) {

        if (id == e.properties._id) {
            console.log(e.geometry.coordinates[0][0])

            map.flyTo({

                center: e.geometry.coordinates[0][0],
                zoom: 10,
                bearing: 0,
                speed: 2.5,
                curve: 1,

                easing: function (t) {
                    return t;
                }
            });
            return false;
        }
    });
}

function deleteGeofence(geofence) {

    var id = $(geofence).attr('id');

    var remove = confirm("Deseas eliminar la Geofence?");
    if (remove == true) {

        $.ajax({
            url: HOST + '/geofence',
            type: 'DELETE',
            data: { id },
            success: function (result) {

                gjPolygons.features.forEach(function (e, index) {

                    if (id == e.properties._id) {
                        gjPolygons.features.splice(index, 1);
                        map.getSource('scPolygons').setData(gjPolygons);
                        $('#tr'+id).remove()
                        return false;
                    }
                });
            }
        });

    }
}