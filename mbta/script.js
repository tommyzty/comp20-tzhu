var myLat = 0;
var myLng = 0;

var davisLat = 42.39674;
var davisLng = -71.121815;

var request = new XMLHttpRequest();
var me = new google.maps.LatLng(myLat, myLng);
var myOptions = {
      zoom: 13,
      center: me,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
var map;
var marker;
var infowindow = new google.maps.InfoWindow();

function init()
{
  map = new google.maps.Map(document.getElementById("map"), myOptions);
  getMyLocation();
}

function getMyLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      myLat = position.coords.latitude;
      myLng = position.coords.longitude;
      renderMap();
    });
  }
  else {
    alert("Sorry! Geolocation is not supported by your browser.");
  }
}

function renderMap()
{
  me = new google.maps.LatLng(myLat, myLng);
  davis = new google.maps.LatLng(davisLat, davisLng);
  // Update map and go there...
  map.panTo(me);
  info_icon = 'https://maps.google.com/mapfiles/kml/shapes/info-i_maps.png'

  // Create a marker
  my_mark = new google.maps.Marker({
    position: me,
    title: "This is me!"
  });
  my_mark.setMap(map);
  info_window(my_mark);

  for (var i = 0, feature; feature = features[i]; i++) {
    addMarker(feature);
  }
}

function info_window(marker) {
  // Open info window on click of marker
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(marker.title);
    infowindow.open(map, marker);
  });
}

function addMarker(feature) {
  var marker = new google.maps.Marker({
    position: feature.position,
    icon: info_icon,
    map: map,
    title: feature.title
  });
  marker.setMap(map);
  info_window(marker);
}

var features = [
  {
    position: new google.maps.LatLng(42.352271, -71.05524200000001),
    title: "South Station"
  }, {
    position: new google.maps.LatLng(42.330154, -71.057655),
    title: "Andrew"
  }, {
    position: new google.maps.LatLng(42.3884, -71.11914899999999),
    title: "Porter Square"
  }, {
    position: new google.maps.LatLng(42.373362, -71.118956),
    title: "Harvard Square"       
  }, {
    position: new google.maps.LatLng(42.320685, -71.052391),
    title: "JFK/UMass"     
  }, {
    position: new google.maps.LatLng(42.31129, -71.053331),
    title: "Savin Hill"  
  }, {
    position: new google.maps.LatLng(42.35639457, -71.0624242),
    title: "Park Street"
  }, {
    position: new google.maps.LatLng(42.342622, -71.056967),
    title: "Broadway"
  }, {
    position: new google.maps.LatLng(42.275275, -71.029583),
    title: "North Quincy"
  }, {
    position: new google.maps.LatLng(42.29312583, -71.06573796000001),
    title: "Shawmut"
  }, {
    position: new google.maps.LatLng(42.39674, -71.121815),
    title: "Davis"
  }, {
    position: new google.maps.LatLng(42.395428, -71.142483),
    title: "Alewife"
  }, {
    position: new google.maps.LatLng(42.36249079, -71.08617653),
    title: "Kendall/MIT"
  }, {
    position: new google.maps.LatLng(42.361166, -71.070628),
    title: "Charles/MGH"
  }, {
    position: new google.maps.LatLng(42.355518, -71.060225),
    title: "Downtown Crossing"
  }, {
    position: new google.maps.LatLng(42.251809, -71.005409),
    title: "Quincy Center"
  }, {
    position: new google.maps.LatLng(42.233391, -71.007153),
    title: "Quincy Adams"
  }, {
    position: new google.maps.LatLng(42.284652, -71.06448899999999),
    title: "Ashmont"
  }, {
    position: new google.maps.LatLng(42.2665139, -71.0203369),
    title: "Wollaston"
  }, {
    position: new google.maps.LatLng(42.300093, -71.061667),
    title: "Fields Corner"
  }, {
    position: new google.maps.LatLng(42.365486, -71.103802),
    title: "Central Square"
  }, {
    position: new google.maps.LatLng(42.2078543, -71.0011385),
    title: "Braintree"
  }
];