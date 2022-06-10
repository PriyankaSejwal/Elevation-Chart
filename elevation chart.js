var map;
var latlongarr = [];
var markerArr = [];
var elevator;
var path = [];

google.load("visualization", "1", { packages: ["columnchart"] });
function latlongcreate() {
  array = document.getElementsByClassName("latlng");
  Array.from(array).forEach((e) => {
    latlongarr.push(e.value.split(","));
  });
  console.log(latlongarr);
}

// function to display map
function initMap() {
  options = {
    center: { lat: 28.4453, lng: 77.2345 },
    zoom: 8,
  };
  map = new google.maps.Map(document.getElementById("map"), options);
  // Create an ElevationService.
  elevator = new google.maps.ElevationService();
  map.addListener("click", (e) => {
    drawMarker(e.latLng);
    displayPathElevation();
  });
}
function drawMarker(latLng) {
  marker = new google.maps.Marker({
    map: map,
    position: latLng,
    draggable: true,
  });
  markerArr.push(marker);
  console.log(markerArr);
  markerArr.forEach(function (e) {
    path.push(e.getPosition());
  });
}

// function to draw polyline for the path where elevation is to be find out
function displayPathElevation() {
  // obtain latlng of all markers on map
  if (markerArr.length == 2) {
    // Display a polyline of the elevation path.
    new google.maps.Polyline({
      path: path,
      strokeColor: "#0000CC",
      strokeOpacity: 0.4,
      map: map,
    });
    console.log(path);
    // Create a PathElevationRequest object using this array.
    // Ask for 256 samples along that path.
    // Initiate the path request.
    elevator
      .getElevationAlongPath({
        path: path,
        samples: 100,
      })
      .then(plotElevation)
      .catch((e) => {
        const chartDiv = document.getElementById("elevation_chart");
        // Show the error code inside the chartDiv.
        chartDiv.innerHTML =
          "Cannot show elevation: request failed because " + e;
      });
  }
}

function plotElevation({ results }) {
  const chartDiv = document.getElementById("elevation_chart");
  // Create a new chart in the elevation_chart DIV.
  const chart = new google.visualization.LineChart(chartDiv);
  // Extract the data from which to populate the chart.
  // Because the samples are equidistant, the 'Sample'
  // column here does double duty as distance along the
  // X axis.
  const data = new google.visualization.DataTable();

  data.addColumn("string", "Sample");
  data.addColumn("number", "Elevation");
  const y = [];
  for (let i = 0; i < results.length; i++) {
    data.addRow(["", results[i].elevation]);

    y.push(results[i].elevation);
  }
  console.log(y);

  // Draw the chart using the data within its DIV.
  chart.draw(data, {
    width: 600,
    height: 200,
    legend: { position: "bottom" },
    // @ts-ignore TODO update to newest visualization library
    titleY: "Elevation (m)",
    tooltip: { isHtml: true },
  });
}
