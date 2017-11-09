var HOST = 'https://imaginexyz-genuinoday.herokuapp.com';
//var HOST = 'http://localhost:3000';
var gjPolygons, file, flag;
//Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiZGF2aWR0aGVjbGFyayIsImEiOiJjaW93emVwanowMW5ldGhtNGI2N293eDY3In0.-hV-UWrYPEZWbILtCFFbOg';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: [-84.0765528406493, 9.933541429759131],
    zoom: 7
});

var popup = new mapboxgl.Popup();

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

//Estilos para el drawControl de mapbox personificado
$('.mapboxgl-ctrl-group')
    .append('<button id="saveGeofences" onclick= "saveGeofences()" class="mapbox-gl-draw_ctrl-draw-btn" title="Save Geofences">' +
    '<span class="glyphicon glyphicon-floppy-disk"></span></button>');
$('.mapboxgl-ctrl-top-right').hide();
$('.mapboxgl-ctrl-top-right').prepend('<div class="content-draw-manual  mapboxgl-ctrl"> <button type="button" class="close">&times;</button> </div>')
$('.mapboxgl-ctrl-top-right').css({
    "background-color": "rgba(255, 255, 255, 0.2)",
    "top": "95px",
    "right": "10px",
    "border-radius":"5px"
});
$('.mapboxgl-ctrl-top-right .mapboxgl-ctrl').css('margin' , '0px 20px 15px');
$('.mapboxgl-ctrl-top-right .content-draw-manual').css('margin' , '5px 5px');

// Abrir/Cerrar el drawControl
$('#drawManual').click(function () {
    var drawOpt = $('.mapboxgl-ctrl-top-right');
    drawOpt.css('display') == 'none' ?  drawOpt.show('fast') : hideDrawManual();
})
$('.content-draw-manual .close').click(hideDrawManual)

function hideDrawManual(){
    $('.mapboxgl-ctrl-top-right').hide('fast')
    draw.deleteAll().getAll();
}

//Envia las nuevas geofences al servidos para ser almacenadas    
function saveGeofences() {

    if (draw.getAll().features.length == 0) {
        alert("Debe dibujar el poligono primero");
    } else {

        socket.emit('saveGeofences', draw.getAll());
        alert("Success");
        draw.deleteAll().getAll();
        popup.remove();
    }
};

socket.on('sendGeofences', function (data) {

    gjPolygons = data;
    //Cargar el mapa con las geofences 
    map.addSource('scGeofence', { type: 'geojson', data: gjPolygons });
    map.addLayer({
        'id': 'layrGeofence',
        'type': 'fill',
        'source': 'scGeofence',
        'layout': {},
        'paint': {
            'fill-color': '#088',
            'fill-opacity': 0.8
        }
    });


    map.on('click', 'layrGeofence', function (e) {

        console.log(e.features[0].properties.description)
        popup
            .setLngLat(e.lngLat)
            .setHTML('<br><p>' + e.features[0].properties.description + '</p>' +
            '<a style="margin: 0% 40%" onclick="deleteGeofence(this)" id="' + e.features[0].properties._id + '"><span class="glyphicon glyphicon-trash"></span></a>')
            .addTo(map);
    });

    // Change the cursor to a pointer when the mouse is over the layrGeofence.
    map.on('mouseenter', 'layrGeofence', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'layrGeofence', function () {
        map.getCanvas().style.cursor = '';
    });
    //Cargar la tabla con las geofences
    gjPolygons.features.forEach(function (e) {

        $('#table-geofences tbody').append(
            '<tr id="tr' + e.properties._id + '"><td><a href="#" onclick="findGeofence(this)" id="' + e.properties._id + '">' +
            'Geofence</a></td><td><a onclick="deleteGeofence(this)" id="' + e.properties._id + '"><span class="glyphicon glyphicon-trash"></span></a></td></tr>'
        )
    });
});

//UPDATE_GEOFENCING
socket.on('updateGeofences', function (data) {


    data.features.forEach(function (feature, index) {

        gjPolygons.features.push(feature);
        map.getSource('scGeofence').setData(gjPolygons);

        //cargar las geofences en la tabla
        $('#table-geofences tbody').append(
            '<tr id="tr' + feature.properties._id + '"><td><a href="#" onclick="findGeofence(this)" id="' + feature.properties._id + '">' +
            'Geofence</a></td><td><a onclick="deleteGeofence(this)" id="' + feature.properties._id + '"><span class="glyphicon glyphicon-trash"></span></a></td></tr>'
        )
    });
});



function findGeofence(geofence) {

    var id = $(geofence).attr('id');

    gjPolygons.features.forEach(function (e) {

        if (id == e.properties._id) {

            map.flyTo({

                center: e.geometry.coordinates[0][0],
                zoom: 13,
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
                        map.getSource('scGeofence').setData(gjPolygons);
                        $('#tr' + id).remove()
                        return false;
                    }
                });
            }
        });

    }
}

// Open/Close nav
$('#openNav').click(function () {
    $('#navGeofences').css('width', '30%');
    $(this).hide();

});

$('#closeNav').click(function () {
    $('#navGeofences').css('width', '0%');
    $('#openNav').show();
});

//Open Modal to import SPH ZIP
$('#btnModalImportSHP').click(function () {

    //Cerrar las opciones de DrawManual en caso de estar abiertas
    if($('.mapboxgl-ctrl-top-right').css('display') != 'none') hideDrawManual();
    //Abrir el modal para importar SHP
    $('#modalImportSHP').modal('show');
});

$("#SHPFile").change(function (evt) {
    file = evt.target.files[0];
    if (file.size > 0) {
        $('#importSHP').show();
    }
});

$('#importSHP').click(function () {
    flag = true;
    loadShpZip();
});

function loadShpZip() {

    if (file.name.split('.')[1] == 'zip') {

        //Parse SHP to Geojson
        loadshp({
            url: file,
            encoding: 'big5',
            EPSG: 3826
        }, function (geojson) {

            //Save geojson to the server
            if (flag)
                socket.emit('saveGeofences', geojson);
            flag = false
        });

        //Reset Modal
        $('#importSHP').hide();
        $('#SHPFile').val("");
        $('#modalImportSHP').modal('hide');

    } else {
        alert('Se debe importar un archivo .zip');
    }
}