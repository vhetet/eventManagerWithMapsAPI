var map;
var markers = [];

function CenterControl(controlDiv, map) {

  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #6E6E6E';
  controlUI.style.borderRadius = '3px';
  controlUI.style.marginBottom = '22px';
  controlUI.style.marginTop = '12px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to recenter the map';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '16px';
  controlText.style.lineHeight = '38px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.innerHTML = 'Delete new markers';
  controlUI.appendChild(controlText);

  // Setup the click event listeners: simply set the map to Chicago.
  controlUI.addEventListener('click', function() {
    deleteMarkers();
    namespace.renderList();
  });

}

function initMap() {
	var myLatLng = new google.maps.LatLng(41.8781, -87.6298);
	map = new google.maps.Map(document.getElementById('map'), {
		center: myLatLng, 
		zoom: 14
	});

	google.maps.event.addListener(map, "rightclick", function(event) {
		var lat = event.latLng.lat();
		var lng = event.latLng.lng();
		var markerLatLng = new google.maps.LatLng(lat, lng);
		var marker = placeMarker(map, markerLatLng, 'new event?', 'green');
		marker.addListener('click', function() {
			namespace.clearForm();
			$('#coordinates').val(markerLatLng.toString());
			namespace.showModal();
		});
		markers.push(marker);
	});

	// Create the DIV to hold the control and call the CenterControl() constructor
	// passing in this DIV.
	var centerControlDiv = document.createElement('div');
	var centerControl = new CenterControl(centerControlDiv, map);

	centerControlDiv.index = 1;
	map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);
}

function placeMarker(map, location, title, color) {
	var markerColor = "./img/red-dot.png"; // red is the default color
	if (color == "blue")
		markerColor = "./img/blue-dot.png";
	if (color == "green")
		markerColor = "./img/green-dot.png";

	var marker = new google.maps.Marker({
	    position: location,
	    map: map,
	    title: title,
	    icon: markerColor
	});
	return marker;
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers() {
  setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}