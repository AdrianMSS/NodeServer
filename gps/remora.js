function startup(Cesium) {
    'use strict';
    //Sandcastle_Begin
    Cesium.BingMapsApi.defaultKey = 'Aj32__WAD8Dt5NajfTKD49UNE1oVxF7ASDDQaFnv7LgY1cad33wqBm3sjy96qC8P';
    var viewer = new Cesium.Viewer('cesiumContainer');

    var geoStarted = null,
        geoHandler = null,
        geoArray = [],
        geoMap = [],
        geoEntities = [],
        geoHere = {},
        geoDate = new Date(),
        minDis = 9999999999,
        points = 0;

    var testDoc = [{"_id":293,"fecha":20170327220157,"lat":9.937657,"lon":-84.061157,"vel":0,"alt":1198.7,"Head":300,"RSSI":18,"date":"2017-03-27T16:02:03.087Z","hour":16,"minute":2},
                    {"_id":293,"fecha":20170327220157,"lat":9.937657,"lon":-84.061157,"vel":0,"alt":1198.7,"Head":300,"RSSI":18,"date":"2017-03-27T16:02:03.087Z","hour":16,"minute":2},
                    {"_id":293,"fecha":20170327220157,"lat":9.937657,"lon":-84.061157,"vel":0,"alt":1198.7,"Head":300,"RSSI":18,"date":"2017-03-27T16:02:03.087Z","hour":16,"minute":2},
                    {"_id":293,"fecha":20170327220157,"lat":9.937657,"lon":-84.061157,"vel":0,"alt":1198.7,"Head":300,"RSSI":18,"date":"2017-03-27T16:02:03.087Z","hour":16,"minute":2},
                    {"_id":293,"fecha":20170327220157,"lat":9.937657,"lon":-84.061157,"vel":0,"alt":1198.7,"Head":300,"RSSI":18,"date":"2017-03-27T16:02:03.087Z","hour":16,"minute":2},
                    {"_id":293,"fecha":20170327220157,"lat":9.937657,"lon":-84.061157,"vel":0,"alt":1198.7,"Head":300,"RSSI":18,"date":"2017-03-27T16:02:03.087Z","hour":16,"minute":2},
                    {"_id":293,"fecha":20170327220157,"lat":9.937657,"lon":-84.061157,"vel":0,"alt":1198.7,"Head":300,"RSSI":18,"date":"2017-03-27T16:02:03.087Z","hour":16,"minute":2},
                    {"_id":293,"fecha":20170327220157,"lat":9.937657,"lon":-84.061157,"vel":0,"alt":1198.7,"Head":300,"RSSI":18,"date":"2017-03-27T16:02:03.087Z","hour":16,"minute":2},
                    {"_id":293,"fecha":20170327220157,"lat":9.937657,"lon":-84.061157,"vel":0,"alt":1198.7,"Head":300,"RSSI":18,"date":"2017-03-27T16:02:03.087Z","hour":16,"minute":2},
                    {"_id":293,"fecha":20170327220157,"lat":9.937657,"lon":-84.061157,"vel":0,"alt":1198.7,"Head":300,"RSSI":18,"date":"2017-03-27T16:02:03.087Z","hour":16,"minute":2},
                    {"_id":293,"fecha":20170327220157,"lat":9.937657,"lon":-84.061157,"vel":0,"alt":1198.7,"Head":300,"RSSI":18,"date":"2017-03-27T16:02:03.087Z","hour":16,"minute":2},
                    {"_id":293,"fecha":20170327220157,"lat":9.937657,"lon":-84.061157,"vel":0,"alt":1198.7,"Head":300,"RSSI":18,"date":"2017-03-27T16:02:03.087Z","hour":16,"minute":2},
                    {"_id":293,"fecha":20170327220157,"lat":9.937657,"lon":-84.061157,"vel":0,"alt":1198.7,"Head":300,"RSSI":18,"date":"2017-03-27T16:02:03.087Z","hour":16,"minute":2}];


    /*var arrayPos = [{"_id":"5750deb65edc1503005ff530","fecha":20160603013435,"lat":9.931947,"lon":-84.048767,"vel":6.39,"alt":1243.4,"date":"2016-06-02T19:34:46.199Z","hour":19,"minute":34},{"_id":"5750df7d5edc1503005ff531","fecha":20160603013754,"lat":9.935857,"lon":-84.05703,"vel":40.74,"alt":1209.5,"date":"2016-06-02T19:38:05.799Z","hour":19,"minute":38},{"_id":"5750e0b35edc1503005ff532","fecha":20160603014304,"lat":9.935855,"lon":-84.063141,"vel":0.35,"alt":1216.1,"date":"2016-06-02T19:43:15.540Z","hour":19,"minute":43},{"_id":"575fb0115eb84a0300cc8b54","fecha":20160614071939,"lat":9.938708,"lon":-84.060707,"vel":1.3,"alt":148.3,"date":"2016-06-14T01:19:45.391Z","hour":1,"minute":19},{"_id":"575fb09f5eb84a0300cc8b56","fecha":20160614072155,"lat":9.938797,"lon":-84.060844,"vel":1.09,"alt":75.2,"date":"2016-06-14T01:22:07.242Z","hour":1,"minute":22},{"_id":"57602d20687fa10300442936","fecha":20160614161313,"lat":9.959388,"lon":-84.060524,"vel":1.52,"alt":148.3,"date":"2016-06-14T10:13:20.498Z","hour":10,"minute":13},{"_id":"57603193687fa10300442937","fecha":20160614163213,"lat":9.937643,"lon":-84.061226,"vel":1.8,"alt":1209.5,"date":"2016-06-14T10:32:19.404Z","hour":10,"minute":32},{"_id":"576032c8687fa10300442938","fecha":20160614163717,"lat":9.937685,"lon":-84.061134,"vel":0.67,"alt":1204.6,"date":"2016-06-14T10:37:28.503Z","hour":10,"minute":37},{"_id":"576033fd687fa10300442939","fecha":20160614164227,"lat":9.937732,"lon":-84.061249,"vel":1.93,"alt":1203.1,"date":"2016-06-14T10:42:37.985Z","hour":10,"minute":42},{"_id":"57603532687fa1030044293a","fecha":20160614164735,"lat":9.937683,"lon":-84.060989,"vel":0.39,"alt":1204.2,"date":"2016-06-14T10:47:46.349Z","hour":10,"minute":47}],
        arrayPosClean = [];

    arrayPos.forEach(function(punto){
        arrayPosClean.push(punto.lon);
        arrayPosClean.push(punto.lat);
        arrayPosClean.push(0);
    });*/

    /*var grayArrow = viewer.entities.add({
        name : 'Gray straight arrow at directions',
        polyline : {
            positions : Cesium.Cartesian3.fromDegreesArrayHeights(arrayPosClean),
            width : 10,
            followSurface : true,
            material : new Cesium.PolylineArrowMaterialProperty(Cesium.Color.GREEN)
        }
    });*/

    var santacruzPolygon = viewer.entities.add({
        name : 'Zona Protegida de Santa Cruz',
        polygon : {
            hierarchy : Cesium.Cartesian3.fromDegreesArrayHeights([-85.950025, 10.9011667, 0,
                                                                   -85.95069444444445, 10.8691944, 0,
                                                                   -85.95069444444445, 10.85125, 0,
                                                                   -85.98883333333333, 10.8390556, 0,
                                                                   -85.9696111111111, 10.80525, 0,
                                                                   -85.87899999999999, 10.80525, 0,
                                                                   -85.81916666666666, 10.7681389, 0,
                                                                   -85.779, 10.7505278, 0,
                                                                   -85.86102777777778, 10.6685278, 0,
                                                                   -85.85791666666667, 10.6685278, 0,
                                                                   -85.8531111111111, 10.6632778, 0,
                                                                   -85.84763888888888, 10.6648056, 0,
                                                                   -85.83772222222221, 10.6568889, 0,
                                                                   -85.82963888888888, 10.6608056, 0,
                                                                   -85.80308333333333, 10.6268889, 0,
                                                                   -85.80002777777777, 10.6163056, 0,
                                                                   -85.80516666666666, 10.6046667, 0,
                                                                   -85.80605555555556, 10.5990556, 0,
                                                                   -85.80461111111111, 10.5931389, 0,
                                                                   -85.66206111111111, 10.7452778, 0,
                                                                   -85.69404602050781, 10.795536743953823, 0,
                                                                   -85.74228286743164, 10.817794192932606, 0,
                                                                   -85.76210975646973, 10.802618838537832, 0]),
            extrudedHeight: 0,
            perPositionHeight : true,
            material : Cesium.Color.ORANGE.withAlpha(0.5),
            outline : true,
            outlineColor : Cesium.Color.BLACK
        }
    });

    /*var manuelantonioPolygon = viewer.entities.add({
        name : 'Zona Protegida de Manuel Antonio',
        polygon : {
            hierarchy : Cesium.Cartesian3.fromDegreesArrayHeights([-84.115449, 9.375164, 0,
                                                                    -84.123270, 9.369215, 0,
                                                                    -84.270070, 9.369215, 0,
                                                                    -84.270070, 9.386762, 0,
                                                                    -84.147882, 9.387585, 0]),
            extrudedHeight: 0,
            perPositionHeight : true,
            material : Cesium.Color.ORANGE.withAlpha(0.5),
            outline : true,
            outlineColor : Cesium.Color.BLACK
        }
    });

    var baulasPolygon = viewer.entities.add({
        name : 'Zona Protegida de Marino las Baulas',
        polygon : {
            hierarchy : Cesium.Cartesian3.fromDegreesArrayHeights([-85.86653333333332, 10.3696611, 0,
                                                                    -85.85153333333332, 10.2722944, 0,
                                                                    -85.9999, 10.2669444, 0,
                                                                    -86.00044444444444, 10.3689889, 0]),
            extrudedHeight: 0,
            perPositionHeight : true,
            material : Cesium.Color.ORANGE.withAlpha(0.5),
            outline : true,
            outlineColor : Cesium.Color.BLACK
        }
    });*/

    /*var cocoPolygon = viewer.entities.add({
        name : 'Zona Protegida de la Isla del Coco',
        polygon : {
            hierarchy : Cesium.Cartesian3.fromDegreesArrayHeights([-87.16666666666667, 5.5, 0,
                                                                    -87.00277777777778, 5.5, 0,
                                                                    -87.00277777777778, 5.5666667, 0,
                                                                    -87.16666666666667, 5.5666667, 0]),
            extrudedHeight: 0,
            perPositionHeight : true,
            material : Cesium.Color.ORANGE.withAlpha(0.5),
            outline : true,
            outlineColor : Cesium.Color.BLACK
        }
    });*/

    /*var ballenaPolygon = viewer.entities.add({
        name : 'Zona Protegida Marino Ballena',
        polygon : {
            hierarchy : Cesium.Cartesian3.fromDegreesArrayHeights([-83.723691, 9.137029, 0,
                                                                    -83.808244, 9.139990, 0,
                                                                    -83.785027, 9.139990, 0,
                                                                    -83.762310, 9.168467, 0]),
            extrudedHeight: 0,
            perPositionHeight : true,
            material : Cesium.Color.ORANGE.withAlpha(0.5),
            outline : true,
            outlineColor : Cesium.Color.BLACK
        }
    });

    var tortugueroPolygon = viewer.entities.add({
        name : 'Zona Protegida de Tortuguero',
        polygon : {
            hierarchy : Cesium.Cartesian3.fromDegreesArrayHeights([-83.389946, 10.355977, 0,
                                                                    -83.522026, 10.586445, 0,
                                                                    -83.364723, 10.636935, 0,
                                                                    -83.193329, 10.481516, 0]),
            extrudedHeight: 0,
            perPositionHeight : true,
            material : Cesium.Color.ORANGE.withAlpha(0.5),
            outline : true,
            outlineColor : Cesium.Color.BLACK
        }
    });

    var cahuitaPolygon = viewer.entities.add({
        name : 'Zona Protegida de Cahuita',
        polygon : {
            hierarchy : Cesium.Cartesian3.fromDegreesArrayHeights([-82.790908, 9.675853, 0,
                                                                    -82.764792, 9.708770, 0,
                                                                    -82.764792, 9.795161, 0,
                                                                    -82.814840, 9.795161, 0,
                                                                    -82.838651, 9.737033, 0]),
            extrudedHeight: 0,
            perPositionHeight : true,
            material : Cesium.Color.ORANGE.withAlpha(0.5),
            outline : true,
            outlineColor : Cesium.Color.BLACK
        }
    });


    var goodArrow = viewer.entities.add({
        name : 'Bote en ruta aceptada',
        polyline : {
            positions : Cesium.Cartesian3.fromDegreesArrayHeights([-85.835489, 10.197559, 5,
                                                                    -85.870536, 10.178300, 5,
                                                                    -85.902943, 10.192476, 5,
                                                                    -85.927120, 10.211715, 5,
                                                                    -85.934836, 10.191970, 5,
                                                                    -85.905001, 10.215258, 5,
                                                                    -85.926092, 10.232470, 5,
                                                                    -85.962614, 10.223358, 5,
                                                                    -85.965701, 10.251706, 5,
                                                                    -85.855104, 10.203614, 5,
                                                                    -85.835489, 10.197559, 5]),
            width : 10,
            followSurface : true,
            material : new Cesium.PolylineArrowMaterialProperty(Cesium.Color.GREEN)
        }
    });


    var badArrow = viewer.entities.add({
        name : 'Bote en ruta prohubida',
        polyline : {
            positions : Cesium.Cartesian3.fromDegreesArrayHeights([-85.835489, 10.197559, 5,
                                                                    -85.860248, 10.206146, 5,
                                                                    -85.893684, 10.252212, 5,
                                                                    -85.899857, 10.278533, 5000,
                                                                    -85.910660, 10.272966, 5000,
                                                                    -85.919404, 10.315986, 5000,
                                                                    -85.933293, 10.321047, 5000,
                                                                    -85.946153, 10.319022, 5000,
                                                                    -85.950269, 10.309913, 5000,
                                                                    -85.896256, 10.261830, 5000,
                                                                    -85.861277, 10.228421, 5,
                                                                    -85.835489, 10.197559, 5]),
            width : 10,
            followSurface : true,
            material : new Cesium.PolylineArrowMaterialProperty(Cesium.Color.RED)
        }
    });*/


    /*var sabanaPolygon = viewer.entities.add({
        name : 'Volkspark Friedrichshain',
        polygon : {
            hierarchy : Cesium.Cartesian3.fromDegreesArrayHeights([ 13.42522679258483, 52.528260549488884, 0,
                                                                    13.437187322350972, 52.529521306072986, 0,
                                                                    13.441173041534245, 52.53206382978437, 0,
                                                                    13.445758811715747, 52.52778671477787, 0,
                                                                    13.441663647454396, 52.5258935995394, 0,
                                                                    13.439733499405289, 52.527352722101604, 0,
                                                                    13.438124181404898, 52.52759551054966, 0,
                                                                    13.435415194858768, 52.52641598518242, 0,
                                                                    13.438795467956064, 52.52415904440567, 0,
                                                                    13.436881933233671, 52.523643466414676, 0,
                                                                    13.434697914193164, 52.523559253469195, 0,
                                                                    13.433988561068375, 52.52345466409533, 0,
                                                                    13.42734597767951, 52.52721927599104, 0,
                                                                    13.425254589826341, 52.52817595355882, 0]),
            extrudedHeight: 0,
            perPositionHeight : true,
            material : Cesium.Color.PALEGREEN.withAlpha(0.3),
            outline : true,
            outlineColor : Cesium.Color.BLACK
        }
    });*/
    //LIGHTGREY

    viewer.zoomTo(viewer.entities);
    Sandcastle.finishedLoading();
    getToday();
    //Sandcastle_End

    function getToday() {
        var XHR = new XMLHttpRequest();

        // We define what will happen if the data are successfully sent
        XHR.addEventListener('load', function(event) {
            var arrayPos = JSON.parse(event.target.response);
            if(arrayPos.length > 0){
                console.log(arrayPos);
                if(points < (arrayPos.length - 1)){
                    var arrayToday = [];
                    points = arrayPos.length -1;
                    console.log(arrayPos);
                    arrayPos.forEach(function(punto, index){
                        if(points >= index){
                            arrayToday.push(punto.lon);
                            arrayToday.push(punto.lat);
                            arrayToday.push(0);
                        }
                    });

                    var greenArrow = viewer.entities.add({
                        name : 'Today Positions',
                        polyline : {
                            positions : Cesium.Cartesian3.fromDegreesArrayHeights(arrayToday),
                            width : 10,
                            followSurface : true,
                            material : new Cesium.PolylineArrowMaterialProperty(Cesium.Color.ORANGE)
                        }
                    });
                }
            }
            viewer.zoomTo(viewer.entities);
            
            var myTableDiv = document.getElementById("tableDiv");
            var table = document.createElement('TABLE');
            var tableBody = document.createElement('TBODY');
            var tr1 = document.createElement('TR');
            var td1 = document.createElement('TH');
            var td2 = document.createElement('TH');
            var td3 = document.createElement('TH');
            var td4 = document.createElement('TH');
            var td5 = document.createElement('TH');
            myTableDiv.removeChild(myTableDiv.childNodes[0]);
            td1.appendChild(document.createTextNode('Fecha'));
            td2.appendChild(document.createTextNode('Hora'));
            td3.appendChild(document.createTextNode('Latitud'));
            td4.appendChild(document.createTextNode('Longitud'));
            td5.appendChild(document.createTextNode('Altura'));
            tr1.appendChild(td1);
            tr1.appendChild(td2);
            tr1.appendChild(td3);
            tr1.appendChild(td4);
            tr1.appendChild(td5);
            tableBody.appendChild(tr1);

            for (var i = 0; i < arrayPos.length; i++) {
                var tr1 = document.createElement('TR');
                var td1 = document.createElement('TD');
                var td2 = document.createElement('TD');
                var td3 = document.createElement('TD');
                var td4 = document.createElement('TD');
                var td5 = document.createElement('TD');
                var min = arrayPos[i].minute;
                if(parseInt(min)<10) min = '0'+parseInt(min);
                td1.appendChild(document.createTextNode(arrayPos[i].date));
                td2.appendChild(document.createTextNode(arrayPos[i].hour +':'+ min));
                td3.appendChild(document.createTextNode(arrayPos[i].lat));
                td4.appendChild(document.createTextNode(arrayPos[i].lon));
                td5.appendChild(document.createTextNode(arrayPos[i].alt));
                tr1.appendChild(td1);
                tr1.appendChild(td2);
                tr1.appendChild(td3);
                tr1.appendChild(td4);
                tr1.appendChild(td5);
                tableBody.appendChild(tr1);
            }

            table.appendChild(tableBody);
            myTableDiv.appendChild(table);
            setTimeout(function(){ getToday() }, 2000);

            //
            //PolylineGlowMaterialProperty
            //viewer.zoomTo(greenArrow);
        });

        // We define what will happen in case of error
        XHR.addEventListener('error', function(event) {
        console.log('ERROR');
        });

        // We setup our request
        XHR.open('GET', 'https://imaginexyz-genuinoday.herokuapp.com/gps/today', true);

        XHR.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');


        // We just send our FormData object, HTTP headers are set automatically
        XHR.send();
        //{"_id":293,"fecha":20170327220157,"lat":9.937657,"lon":-84.061157,"vel":0,"alt":1198.7,"Head":300,"RSSI":18,"date":"2017-03-27T16:02:03.087Z","hour":16,"minute":2}
    }

    function startGeofences(e) {
        if(geoStarted != null){
            viewer.entities.remove(geoStarted);
            geoStarted = null;
            geoHandler.destroy();
            geoArray=[];
            geoMap=[];
            console.log(geoEntities);
            console.log(geoEntities.length);
            viewer.entities.remove(geoEntities[geoEntities.length-1]);
            viewer.entities.remove(geoEntities[geoEntities.length-2]);
            viewer.entities.remove(geoEntities[geoEntities.length-3]);
            document.getElementById("geoStart").firstChild.data = "New Geofence";
        }
        else{
            document.getElementById("geoStart").firstChild.data = "Stop New Geofence";
            var scene = viewer.scene;
            Sandcastle.finishedLoading();
            geoStarted = viewer.entities.add({
                label : {
                    show : false,
                    showBackground : true,
                    font : '14px monospace',
                    horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
                    verticalOrigin : Cesium.VerticalOrigin.TOP,
                    pixelOffset : new Cesium.Cartesian2(15, 0)
                }
            });
            geoHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
            geoHandler.setInputAction(function(movement) {
                var cartesian = viewer.camera.pickEllipsoid(movement.endPosition, scene.globe.ellipsoid);
                if (cartesian && geoStarted) {
                    var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                    var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
                    var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
                    geoHere = {"lat":latitudeString,"lon":longitudeString};
                    longitudeString = longitudeString.toFixed(2);
                    latitudeString = latitudeString.toFixed(2);
                    //console.log(longitudeStrin);
                    //console.log(latitudeStrin);

                    geoStarted.position = cartesian;
                    geoStarted.label.show = true;
                    geoStarted.label.text =
                        'Lon: ' + ('   ' + longitudeString).slice(-7) + '\u00B0' +
                        '\nLat: ' + ('   ' + latitudeString).slice(-7) + '\u00B0';
                } else {
                    geoStarted.label.show = false;
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);    
        }
        
    }

    function paintGeofence(e) {
        if(geoStarted != null){
            if((geoDate - new Date()) > -350){
                var geoFinish = viewer.entities.add({
                    polygon : {
                        hierarchy : Cesium.Cartesian3.fromDegreesArrayHeights(geoMap),
                        extrudedHeight: 0,
                        perPositionHeight : true,
                        material : Cesium.Color.ALICEBLUE.withAlpha(0.5),
                        outline : true,
                        outlineColor : Cesium.Color.BLACK
                    }
                });

                viewer.entities.remove(geoEntities.pop());
                viewer.entities.remove(geoEntities.pop());

                /*var positions = Cesium.Cartesian3.fromDegreesArrayHeights(geoMap);
                var surfacePositions = Cesium.PolylinePipeline.generateArc({positions: positions});
                var scratchCartesian3 = new Cesium.Cartesian3();
                var surfacePositionsLength = surfacePositions.length;
                var totalDistanceInMeters = 1000000000000;
                for (var i = 3; i < surfacePositionsLength; i += 3) {
                    scratchCartesian3.x = surfacePositions[i] - surfacePositions[i - 3];
                    scratchCartesian3.y = surfacePositions[i + 1] - surfacePositions[i - 2];
                    scratchCartesian3.z = surfacePositions[i + 2] - surfacePositions[i - 1];
                    totalDistanceInMeters = Math.min(totalDistanceInMeters,Cesium.Cartesian3.magnitude(scratchCartesian3));
                }*/

                var XHR = new XMLHttpRequest();

                // We define what will happen if the data are successfully sent
                XHR.addEventListener('load', function(event) {
                console.log('Sended');
                });

                // We define what will happen in case of error
                XHR.addEventListener('error', function(event) {
                console.log('ERROR');
                });

                // We setup our request
                XHR.open('POST', 'https://imaginexyz-genuinoday.herokuapp.com/gps/sabana', true);

                XHR.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

                // We just send our FormData object, HTTP headers are set automatically
                XHR.send(JSON.stringify({array:geoArray}));


                viewer.zoomTo(geoFinish);
/*                geoHandler.destroy();
                viewer.entities.remove(geoStarted);
                geoArray=[];
                geoMap=[];
                geoStarted = null;
                geoArray = [],
                geoMap = [],
                geoEntities = [],
                geoHere = {},
                geoDate = new Date(),
                minDis = 9999999999;*/
                document.getElementById("geoStart").firstChild.data = "New Geofence";
            }
            else{
                geoDate = new Date();
                geoArray.push(geoHere);
                geoMap.push(geoHere.lon);
                geoMap.push(geoHere.lat); 
                geoMap.push(0);
                if(geoEntities.length >= 2) viewer.entities.remove(geoEntities.pop());
                var geoProcess = viewer.entities.add({
                    polyline : {
                        positions : Cesium.Cartesian3.fromDegreesArrayHeights(geoMap),
                        width : 4,
                        followSurface : true,
                        material : new Cesium.PolylineGlowMaterialProperty({color:Cesium.Color.ALICEBLUE, glowPower:0.2})
                    }
                });
                geoEntities.push(geoProcess);

            }
        }
    }

    document.getElementById("geoStart").addEventListener("click", startGeofences);
    document.getElementById("cesiumContainer").addEventListener("click", paintGeofence);
    //document.getElementById("geoStart").addEventListener("click", startGeofences);
    
    var parent = document.getElementById("loadingOverlay");
    var child = document.getElementById("loadingText");
    parent.removeChild(child);
}

if (typeof Cesium !== "undefined") {
    startup(Cesium);
} else if (typeof require === "function") {
    require(["Cesium"], startup);
}

