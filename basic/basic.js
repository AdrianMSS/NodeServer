google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(iniciar);

function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
  var earthRadiusKm = 6371;

  var dLat = degreesToRadians(lat2-lat1);
  var dLon = degreesToRadians(lon2-lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return earthRadiusKm * c;
}

function iniciar() {
	var arrayVel = [['ID', 'Velocidad', 'Gasolina']],
		arrayDist = [['ID', 'Distancia', 'Gasolina']];

	$('#thetable tr').not(':first').not(':last').remove();
	//for(var i = 0; i < data.d.length; i++)
	//            html += '<tr><td>' + data.d[i].FirstName + '</td><td>' + data.d[i].Age + '</td></tr>';
	$.get("today", function(data, status){
		$('#thetable tr').not(':first').not(':last').remove();
		var html = '',
			numPos = 1,
			startDistance = 0,
			oldLat = 0,
			oldLon = 0;
		
		data.forEach(function(i, key){
			var distanceBetween = 0;
			if(numPos>1){
				distanceBetween = Math.floor(distanceInKmBetweenEarthCoordinates(oldLat, oldLon, i.lat, i.lon) * 1000)/1000;
				startDistance += distanceBetween;
			}
			oldLat = i.lat;
			oldLon = i.lon;
			if(i.fuel === undefined) i.fuel = 0;
			if(i.ID === undefined) i.ID = numPos;
			var newArray = [numPos, i.vel, i.fuel];
			var newArray2 = [numPos, startDistance, i.fuel];
			arrayVel.push(newArray);
			arrayDist.push(newArray2);
			numPos++;
			html += '<tr><td>' + i.ID + '</td>';
			html += '<td>' + i.newDate + '</td>';
			html += '<td>' + i.lat + '</td>';
			html += '<td>' + i.lon + '</td>';
			html += '<td>' + distanceBetween + ' Km</td>';
			html += '<td>' + Math.floor(startDistance * 1000)/1000 + ' Km</td>';
			html += '<td>' + i.vel + '</td>';
			html += '<td>' + i.alt + '</td>';
			html += '<td>' + i.Head + '</td>';
			html += '<td>' + i.RunStatus + '</td>';
			html += '<td>' + i.Fix + '</td>';
			html += '<td>' + i.FixMode + '</td>';
			html += '<td>' + i.HDOP + '</td>';
			html += '<td>' + i.VDOP + '</td>';
			html += '<td>' + i.PDOP + '</td>';
			html += '<td>' + i.GPSView + '</td>';
			html += '<td>' + i.GNSS_used + '</td>';
			html += '<td>' + i.HPA + '</td>';
			html += '<td>' + i.VPA + '</td>';
			html += '<td>' + i.fuel + '</td>';
			html += '<td>' + i.Motor + '</td>';
			html += '<td>' + i.QuadTree + '</td>';
			html += '<td>' + i.RSSI + '</td>';
			html += '<td>' + i.RAM + '</td></tr>';
		})
		$('#thetable tr').first().after(html);
		drawChart(arrayVel, arrayDist);
        //alert("Data: " + data + "\nStatus: " + status);
    });

}

function drawChart(arrayVel, arrayDist) {
    var data = google.visualization.arrayToDataTable(arrayVel);
    var data2 = google.visualization.arrayToDataTable(arrayDist);

    /*var options = {
      title: 'Company Performance',
      curveType: 'function',
      legend: { position: 'bottom' }
    };

    var chart = new google.visualization.LineChart(document.getElementById('chart1'));

    chart.draw(data, options);*/

    new google.visualization.LineChart(document.getElementById('chart1')).
    draw(data, {curveType: 'function', vAxes:[
      {title: 'Galones', titleTextStyle: {color: '#FF0000'}, maxValue: 2000}, // Left axis
      {title: 'Km/h', titleTextStyle: {color: '#FF0000'}, maxValue: 100} // Right axis
    ],series:[
                {targetAxisIndex:1},
                {targetAxisIndex:0}
    ],} );

    new google.visualization.LineChart(document.getElementById('chart2')).
    draw(data2, {curveType: 'function', vAxes:[
      {title: 'Galones', titleTextStyle: {color: '#FF0000'}, maxValue: 2000}, // Left axis
      {title: 'Km', titleTextStyle: {color: '#FF0000'}, maxValue: 200} // Right axis
    ],series:[
                {targetAxisIndex:1},
                {targetAxisIndex:0}
    ],} );
}