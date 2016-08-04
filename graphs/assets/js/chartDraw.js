//Función para obtener la información de la base de datos
function getData(){  
  var setHeader = function (req) {
    req.setRequestHeader('content-type', 'application/json'); 
    req.setRequestHeader('accept', 'application/json'); 
  }; 
  $.ajax({
    type: "GET",
    url: "http://imaginexyz-genuinoday.herokuapp.com/imaginexyz/graphs",
    beforeSend: setHeader,
    success: function(res){
      console.log(res);
      drawChart(res);//Invoca la función que dibuja el gráfico
      getData2();//Función para obtener más datos del servidor
    }
  });
};

//Segunda llamada al servidor
function getData2(){  
  var setHeader = function (req) {
    req.setRequestHeader('content-type', 'application/json'); 
    req.setRequestHeader('accept', 'application/json'); 
  }; 
  $.ajax({
    type: "GET",
    url: "http://imaginexyz-genuinoday.herokuapp.com/imaginexyz/posts",
    beforeSend: setHeader,
    success: function(res){
      console.log(res);
      drawChart2(res);
    }
  });
};

//Módulo de google que hay q cargar
google.load("visualization", "1", {packages:["corechart"]});

//Función que arma los datos en el gráfico y lo despliega, el parametro es lo q me retornó el servidor
function drawChart(dataJson) {
  var data = new google.visualization.DataTable(); //El gráfico que se va llenando
  data.addColumn('string', 'Tipo');//Añadir columna de tipo
  data.addColumn('number', 'Cantidad');//Añadir columna de Cantidad

  //Llenado de la tabla
  data.addRow(["GET", dataJson.gets]);
  data.addRow(["POST", dataJson.posts]);

  //Opciones del gráfico
  var options = {
    title: 'Cantidad de Solicitudes por Tipo'
  };

  //Dibujar el gráfico en el HTML
  var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
  chart.draw(data, options);
}

//Segunda función para dibujar el gráfico
function drawChart2(dataJson) {
  console.log(dataJson);
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Hora');
  data.addColumn('number', 'Cantidad');

  //Ciclo llenar la tabla
  dataJson.forEach(function(obj){
    data.addRow([obj._id.hour+':'+obj._id.minute,obj.totalSend]);
  });

  var options = {
    title: 'POST por minuto'
  };

  var chart = new google.visualization.AreaChart(document.getElementById('chart_div2'));
  chart.draw(data, options);
}