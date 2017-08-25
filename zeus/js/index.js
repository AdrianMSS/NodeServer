//Map 
mapboxgl.accessToken = 'pk.eyJ1IjoiamdyYW5hZG9zIiwiYSI6ImNqNWNzMjVnMjAxc2MzMm51Yjk2ZG9oY3YifQ.6XIiaaLKqPoSxluayRcsdg';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    center: [-84.07836513337293, 9.933419690622571],
    zoom: 12
});

//Google Charts

var chart;
var jsonDataCharts = { arrSpeed: [], arrFuel: [], arrAlt: [], arrRAM: [], arrRSSI: [], arrAll: [] };
var gjPoints;


//SocketIO
var socket = io.connect('https://imaginexyz-genuinoday.herokuapp.com');

//ALL_FEATURES
socket.on('displayAllFeatures', function (data) {

    drawMap(data)
    generateDataCharts(data)
});

//UPDATE_SHIP
socket.on('updateShip', function (data) {

    console.log(data)
    gjPoints.features.push(data); //insertar el nuevo punto en el geojson de puntos
    map.getSource('scPoints').setData(gjPoints); //insertar el geojson de puntos actuializado al mapa

         var x = (new Date()).getTime(), // current time
            y = Math.round(Math.random() * 100);
            chart.series[0].addPoint([new Date(data.properties.dateServer).getTime(), parseInt(data.properties.vel)], true, false); //Speed
            chart.series[1].addPoint([new Date(data.properties.dateServer).getTime(), parseInt(data.properties.RAM)], true, false); //RAM    
            chart.series[2].addPoint([new Date(data.properties.dateServer).getTime(), parseInt(data.properties.RSSI)], true, false); //RSSI
            chart.series[3].addPoint([new Date(data.properties.dateServer).getTime(), parseInt(data.properties.alt)], true, false); //Height
            chart.series[4].addPoint([new Date(data.properties.dateServer).getTime(), parseInt(data.properties.fuel)], true, false); //Fuel
            console.log(data)
            console.log(chart.series[0].points) 

    });

//Filter Data
$('#btnFilter').click(function () {

     /* var dateInit = $("#dateInit").val(),
        dateEnd = $("#dateEnd").val();

    $.getJSON("https://imaginexyz-genuinoday.herokuapp.com/gps/filter", { dateInit, dateEnd })
        .done(function (data) {
            console.log("json");
            console.log(data);
            //drawMap(data)
            map.getSource('scPoints').setData(data.gjPoints);

        })
        .fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log("Request Failed: " + err);
        }); */
});

function drawMap(data) {


    map.on('load', function () {

        /************POINTS*************/
        console.log(data.gjPoints)
        gjPoints = data.gjPoints;
        map.addSource('scPoints', { type: 'geojson', data: gjPoints });

        map.addLayer({
            "id": "points",
            "type": "symbol",
            "source": "scPoints",
            "layout": {
                "icon-image": "marker-15",
                "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                "text-offset": [0, 0.6],
                "text-anchor": "top"
            }
        });

        // Create a popup, but don't add it to the map yet.
        var popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false
        });

        map.on('mouseenter', 'points', function (e) {
            // Change the cursor style as a UI indicator.
            map.getCanvas().style.cursor = 'pointer';

            // Populate the popup and set its coordinates
            // based on the feature found.
            popup.setLngLat(e.features[0].geometry.coordinates)
                .setHTML(
                "<strong>Date Remora: </strong>" + e.features[0].properties.dateRemora +
                "<br><strong>Date Server: </strong>" + e.features[0].properties.dateServer +
                "<br><strong>GPS View: </strong>" + e.features[0].properties.GPSView +
                    "<br><strong>GPS Used: </strong>" + e.features[0].properties.GNSS_used +
                    "<br><strong>Motor: </strong>" + e.features[0].properties.Motor +
                    "<br><strong>Qt: </strong>" + e.features[0].properties.QuadTree +
                    "<br><strong>Δ Time: </strong> coming soon :v" + 
                    "<br><strong>Δ Distance: </strong> coming soon :v"

                )
                .addTo(map);
        });

        map.on('mouseleave', 'points', function () {
            map.getCanvas().style.cursor = '';
            popup.remove();
        });

        //Open charts
        map.on('click', 'points', function (e) {
            $('#navStats').css('height', '100%');
            var point = new Date(e.features[0].properties.dateRemora).getTime();
            drawCharts(point);

            //selectPointChart([{ row: "20,170,615,000,000" }]);
        });


        /************LINESTRINGS*************/
        /************POLYGONS*************/

    });
}

function generateDataCharts(data) {

    _.map(data.gjPoints.features, function (e) {

        jsonDataCharts.arrSpeed.push([new Date(e.properties.dateServer).getTime(), parseInt(e.properties.vel)]);
        jsonDataCharts.arrFuel.push([new Date(e.properties.dateServer).getTime(), parseInt(e.properties.fuel)]);
        jsonDataCharts.arrAlt.push([new Date(e.properties.dateServer).getTime(), parseInt(e.properties.alt)]);
        jsonDataCharts.arrRAM.push([new Date(e.properties.dateServer).getTime(), parseInt(e.properties.RAM)]);
        jsonDataCharts.arrRSSI.push([new Date(e.properties.dateServer).getTime(), parseInt(e.properties.RSSI)]);
    });

    drawCharts()
}

function drawCharts(point) {

    chart = new Highcharts.StockChart({
        chart: {

            renderTo: 'chart_content',
            zoomType: 'xy',
            events: {
                load: function () {
    

                    
                }
            }

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
            selected: 3,
            inputEnabled: false
        },

        title: {
            text: 'Remora'
        },
        plotOptions: {
            series: {
                allowPointSelect: true,
                cursor: 'pointer',
                point: {
                    events: {
                        click: function () {
                            alert('Category: ' + this.category + ', value: ' + this.y);
                        }
                    }
                }
            }
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

//Overlay Navs
$('#openNav').click(function () {
    $('#navStats').css('height', '100%');
    drawCharts()

});
$('#closeNav').click(function () {
    $('#navStats').css('height', '0%');
});

$('#openMultiChart').click(function () {
    $('#navMultiChart').css('height', '100%');
});
$('#closeMultiChart').click(function () {
    $('#navMultiChart').css('height', '0%');
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


