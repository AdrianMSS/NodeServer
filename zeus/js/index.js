var HOST = 'https://imaginexyz-genuinoday.herokuapp.com';
//var HOST = 'http://localhost:3000';

//Map 
mapboxgl.accessToken = 'pk.eyJ1IjoiamdyYW5hZG9zIiwiYSI6ImNqNWNzMjVnMjAxc2MzMm51Yjk2ZG9oY3YifQ.6XIiaaLKqPoSxluayRcsdg';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    center: [-84.07836513337293, 9.933419690622571],
    zoom: 7
});

//
var jsonDataCharts = { arrSpeed: [], arrFuel: [], arrAlt: [], arrRAM: [], arrRSSI: [], arrAll: [] };
var gjPoints, gjLines, gjPolygons;


//SocketIO
var socket = io.connect(HOST);

//ALL_FEATURES
socket.on('displayAllFeatures', function (data) {

    drawMap(data)
    generateDataCharts(data)
});

//UPDATE_SHIP
socket.on('updateShip', function (data) {

    console.log(data)

    var shipFeature = data.gjNewPoint; //Nuevo punto a insertar
    var alertGeofence = data.alert; //Alerta de violacion de una geofence 

    //Verificar si viene una alerta de violacion de una geofence
    if (alertGeofence) {
        $('#infoAlert').html('El dispositivo con el id: ' + shipFeature.properties.ID +
            ' se encuentra adentro de la geofence: ' + alertGeofence[0].description);

        $('#flyToAlert').attr({ 'lng': shipFeature.geometry.coordinates[0], 'lat': shipFeature.geometry.coordinates[1] });

        $('#modalAlert').modal('show');
    }

    //Actualizar los puntos
    gjPoints.features.push(shipFeature); //insertar el nuevo punto en el geojson de puntos
    map.getSource('scPoints').setData(gjPoints); //insertar el geojson de puntos actuializado al mapa

    //Actualizar las lineas
    var match = _.find(gjLines.features, function (geojson) { return geojson.properties._id == shipFeature.properties.ID });
    if (match) {
        var index = _.indexOf(gjLines.features, match);
        gjLines.features[index].geometry.coordinates.push(shipFeature.geometry.coordinates);
    }
    map.getSource('scLines').setData(gjLines); //insertar el geojson de puntos actuializado al mapa

    //Actualizar los graficos
    chart.series[0].addPoint([new Date(shipFeature.properties.dateRemora).getTime(), parseInt(shipFeature.properties.vel)], true, false); //Speed
    chart.series[1].addPoint([new Date(shipFeature.properties.dateRemora).getTime(), parseInt(shipFeature.properties.RAM)], true, false); //RAM    
    chart.series[2].addPoint([new Date(shipFeature.properties.dateRemora).getTime(), parseInt(shipFeature.properties.RSSI)], true, false); //RSSI
    chart.series[3].addPoint([new Date(shipFeature.properties.dateRemora).getTime(), parseInt(shipFeature.properties.alt)], true, false); //Height
    chart.series[4].addPoint([new Date(shipFeature.properties.dateRemora).getTime(), parseInt(shipFeature.properties.fuel)], true, false); //Fuel
});

//UPDATE_GEOFENCING
socket.on('updateGeofences', function (data) {

    data.features.forEach(function (feature, index) {

        gjPolygons.features.push(feature);
        map.getSource('scPolygons').setData(gjPolygons);
    });
});

//DELETE_GEOFENCING
socket.on('deletedGeofence', function (data) {

    console.log(data.id)
    var id = data.id;
    gjPolygons.features.forEach(function (e, index) {

        if (id == e.properties._id) {
            gjPolygons.features.splice(index, 1);
            map.getSource('scPolygons').setData(gjPolygons);
            return false;
        }
    });
});

//Filter Data
$('#btnFilter').click(function () {

    var dateInit = $("#dateInit").val(),
        dateEnd = $("#dateEnd").val();

    //Validation
    $("#fgDateInit").removeClass('has-error');
    $("#errDateInit").html('');

    if (!dateInit) {
        $("#fgDateInit").addClass('has-error');
        $("#errDateInit").html('Indique una fecha de inicio.');
    }
    else {
        $.getJSON(HOST + "/zeus/filter", { dateInit, dateEnd })
            .done(function (data) {

                console.log(data);

                gjLines = data.gjLines;
                gjPoints = data.gjPoints;

                //Actualizar los puntos del mapa 
                map.getSource('scPoints').setData(gjPoints);

                //Actualizar las lines del mapa 
                map.getSource('scLines').setData(gjLines);

                //Actualizar los graficos
                jsonDataCharts.arrSpeed = [];
                jsonDataCharts.arrFuel = [];
                jsonDataCharts.arrAlt = [];
                jsonDataCharts.arrRAM = [];
                jsonDataCharts.arrRSSI = [];
                generateDataCharts(data)

            })
            .fail(function (jqxhr, textStatus, error) {
                var err = textStatus + ", " + error;
                console.log("Request Failed: " + err);
            });
    }
});

function drawMap(data) {

    /************POINTS*************/
    console.log(data)
    gjPoints = data.gjPoints;
    map.addSource('scPoints', { type: 'geojson', data: gjPoints });

    map.addLayer({
        "id": "layrPoints",
        "type": "symbol",
        "source": "scPoints",
        "layout": {
            "icon-image": "marker-15",
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0.6],
            "text-anchor": "top",
            "icon-rotate": ({ "type": "identity", "property": "Head" })
        }
    });

    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    map.on('mouseenter', 'layrPoints', function (e) {

        var dRemora = e.features[0].properties.dateRemora,
            dServer = e.features[0].properties.dateServer;

        map.getCanvas().style.cursor = 'pointer';
        popup.setLngLat(e.features[0].geometry.coordinates)
            .setHTML(
            "<strong>Date Remora: </strong>" + dRemora.slice(8, 10) + "/" + dRemora.slice(5, 7) +
            "/" + dRemora.slice(0, 4) + " - " + dRemora.slice(11, 16) +
            "<br><strong>Date Server: </strong>" + dServer.slice(8, 10) + "/" + dServer.slice(5, 7) +
            "/" + dServer.slice(0, 4) + " - " + dServer.slice(11, 16) +
            "<br><strong>GPS View: </strong>" + e.features[0].properties.GPSView +
            "<br><strong>GPS Used: </strong>" + e.features[0].properties.GNSS_used +
            "<br><strong>Motor: </strong>" + e.features[0].properties.Motor +
            "<br><strong>Qt: </strong>" + e.features[0].properties.QuadTree +
            "<br><strong>Lat: </strong>" + e.features[0].geometry.coordinates[1].toFixed(6) +
            "<br><strong>Lon: </strong>" + e.features[0].geometry.coordinates[0].toFixed(6) +
            "<br><strong>Δ Time: </strong>" + e.features[0].properties.deltaTime + " min" +
            "<br><strong>Δ Distance: </strong>" + e.features[0].properties.deltaDistance.toFixed(3) + " km"

            )
            .addTo(map);
    });

    map.on('mouseleave', 'layrPoints', function () {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });

    //Open charts
    map.on('click', 'layrPoints', function (e) {
        $('#navStats').css('height', '100%');
        var point = new Date(e.features[0].properties.dateRemora).getTime();
        drawCharts(point);
    });


    /************LINESTRINGS*************/

    gjLines = data.gjLines;
    map.addSource('scLines', { type: 'geojson', data: gjLines });

    map.addLayer({
        "id": "layrLines",
        "type": "line",
        "source": "scLines",
        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": "#888",
            "line-width": 2
        }
    });

    map.setLayoutProperty('layrLines', 'visibility', 'none');

    /************POLYGONS*************/

    gjPolygons = data.gjPolygons;
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

    /*  var p = []
     gjPolygons.features[3].geometry.coordinates.forEach(function(e, i){
         p.push(e); 
     });
     console.log(JSON.stringify(p)); */
}

function generateDataCharts(data) {

    _.map(data.gjPoints.features, function (e) {
        jsonDataCharts.arrSpeed.push({ x: new Date(e.properties.dateRemora).getTime(), y: parseInt(e.properties.vel), id: e.properties._id });
        jsonDataCharts.arrFuel.push({ x: new Date(e.properties.dateRemora).getTime(), y: parseInt(e.properties.fuel), id: e.properties._id });
        jsonDataCharts.arrAlt.push({ x: new Date(e.properties.dateRemora).getTime(), y: parseInt(e.properties.alt), id: e.properties._id });
        jsonDataCharts.arrRAM.push({ x: new Date(e.properties.dateRemora).getTime(), y: parseInt(e.properties.RAM), id: e.properties._id });
        jsonDataCharts.arrRSSI.push({ x: new Date(e.properties.dateRemora).getTime(), y: parseInt(e.properties.RSSI), id: e.properties._id });

    });

    drawCharts()
}

function drawCharts(point) {

    chart = new Highcharts.StockChart({
        chart: {

            renderTo: 'chart_content',
            zoomType: 'xy'
        },
        rangeSelector: {
            buttons: [{
                type: 'day',
                count: 1,
                text: '1D'
            }, {
                type: 'day',
                count: 5,
                text: '5D'
            }, {
                type: 'day',
                count: 10,
                text: '10D'
            }, {
                type: 'all',
                count: 1,
                text: 'All'
            }],
            selected: 1,
            inputEnabled: false
        },

        title: {
            text: 'Remora'
        },
        plotOptions: {
            series: {

                turboThreshold: 0,
                allowPointSelect: true,
                cursor: 'pointer',
                point: {
                    events: {
                        click: function () {

                            var id = this.id;

                            console.log('id: ' + id)
                            _.forEach(gjPoints.features, function (e) {

                                if (e.properties._id == id) {

                                    map.flyTo({

                                        center: e.geometry.coordinates,
                                        zoom: 16,
                                        bearing: 0,
                                        speed: 2.5,
                                        curve: 1,

                                        easing: function (t) {
                                            return t;
                                        }
                                    });

                                    $('#navStats').css('height', '0%');
                                    return false;
                                }
                            });

                        }
                    }
                }
            }
        },
        tooltip: {
            valueDecimals: 2
        },
        yAxis: [
            //Speed
            {
                labels: { align: 'right', x: -3 },
                title: { text: 'Vel (km/h)' },
                height: '17%',
                lineWidth: 2
            },
            //RAM
            {
                labels: { align: 'right', x: -3 },
                title: { text: 'RAM' },
                top: '20%',
                height: '17%',
                offset: 0,
                lineWidth: 2
            },
            //RSSI
            {
                labels: { align: 'right', x: -3 },
                title: { text: 'RSSI' },
                top: '40%',
                height: '17%',
                offset: 0,
                lineWidth: 2
            },
            //Height
            {
                labels: { align: 'right', x: -3 },
                title: { text: 'Alt' },
                top: '60%',
                height: '17%',
                offset: 0,
                lineWidth: 2
            },
            //Fuel
            {
                labels: { align: 'right', x: -3 },
                title: { text: 'Fuel' },
                top: '80%',
                height: '17%',
                offset: 0,
                lineWidth: 2
            }],

        series: [{
            id: 'speed',
            name: 'Vel',
            data: jsonDataCharts.arrSpeed
        }, {
            name: 'RAM',
            data: jsonDataCharts.arrRAM,
            yAxis: 1

        }, {
            name: 'RSSI',
            data: jsonDataCharts.arrRSSI,
            yAxis: 2
        }, {
            name: 'Alt',
            data: jsonDataCharts.arrAlt,
            yAxis: 3

        }, {
            name: 'Fuel',
            data: jsonDataCharts.arrFuel,
            yAxis: 4

        }]
    });

    //select point
    if (point) {
        var i = 0;
        _.forEach(chart.series[0].points, function (e) {

            if (e.options.x == point) {

                chart.series[0].points[i].select(true, true);
                chart.series[1].points[i].select(true, true);
                chart.series[2].points[i].select(true, true);
                chart.series[3].points[i].select(true, true);
                chart.series[4].points[i].select(true, true);
                //console.log('ak7')
                return false;
            }
            //console.log('.')
            i++;
        });

    }


}

//Mover la camara del mapa al punto donde se esta violando la geofence
$('#flyToAlert').click(function () {

    $('#modalAlert').modal('hide');
    map.flyTo({
        center: [$(this).attr('lng'), $(this).attr('lat')],
        zoom: 16,
        bearing: 0,
        speed: 2.5,
        curve: 1,

        easing: function (t) {
            return t;
        }
    });
});

//Overlay Navs
$('#openNav').click(function () {
    $('#navStats').css('height', '100%');
    drawCharts()

});
$('#closeNav').click(function () {
    $('#navStats').css('height', '0%');
});

//DataTimePicker
$('#datetimepickerInit').datetimepicker();
$('#datetimepickerEnd').datetimepicker({
    useCurrent: false //Important! See issue #1075
});
$("#datetimepickerInit").on("dp.change", function (e) {
    $('#datetimepickerEnd').data("DateTimePicker").minDate(e.date);
});
$("#datetimepickerEnd").on("dp.change", function (e) {
    $('#datetimepickerInit').data("DateTimePicker").maxDate(e.date);
});

//Reset Zoom
$('#resetZoom').click(function () {

    map.flyTo({

        center: [-84.07836513337293, 9.933419690622571],
        zoom: 8,
        bearing: 0,
        speed: 2.5,
        curve: 1,

        easing: function (t) {
            return t;
        }
    });
});

//HideLines
$('#hideLines').click(function () {

    var visibility = map.getLayoutProperty('layrLines', 'visibility');

    if (visibility === 'visible') {
        map.setLayoutProperty('layrLines', 'visibility', 'none');
    } else {
        map.setLayoutProperty('layrLines', 'visibility', 'visible');
    }
});

