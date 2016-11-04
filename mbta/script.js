var myLat = 0;
var myLng = 0;
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
var trainInfo;
var curr_stop;

function init()
{
  map = new google.maps.Map(document.getElementById("map"), myOptions);
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      myLat = position.coords.latitude;
      myLng = position.coords.longitude;
      render_map();
    });
  }
  else {
    alert("Sorry! Geolocation is not supported by your browser.");
  }
}

function render_map()
{
  me = new google.maps.LatLng(myLat, myLng);
  // Update map and go there...
  map.panTo(me);
  rail_icon = {
    url: 'https://maps.google.com/mapfiles/kml/shapes/rail.png',
    scaledSize: new google.maps.Size(25, 25)
  };

  // add all station markers
  for (var i = 0, feature; feature = features[i]; i++) {
    add_marker(feature);
  }

  var path_b = new google.maps.Polyline({
  path: line_b,
  geodesic: true,
  strokeColor: '#FF0000',
  strokeOpacity: 1.0,
  strokeWeight: 2
  });
  path_b.setMap(map);

  var path_a = new google.maps.Polyline({
  path: line_a,
  geodesic: true,
  strokeColor: '#FF0000',
  strokeOpacity: 1.0,
  strokeWeight: 2
  });
  path_a.setMap(map);

  closest(me, features);
}

// Open info window on click of marker
function info_window(marker) {
  google.maps.event.addListener(marker, 'click', function() {
    curr_stop = marker.title;
    infowindow.setContent("<p>" + "<b>" + curr_stop + "</b>" + "<br />" + "Train info not loaded, click again" + "</p>");
    infowindow.open(map, marker);
    loadJSON();
  });
}

// add a single marker to the map
function add_marker(feature) {
  var marker = new google.maps.Marker({
    position: feature.position,
    icon: rail_icon,
    map: map,
    title: feature.title
  });
  marker.setMap(map);
  info_window(marker);
}

function closest(me, features){
  var close;
  var dist = calc_dist(me, features[0]);
  for (var i = 1, feature; feature = features[i]; i++) {
    d = calc_dist(me, feature);
    if (d < dist) {
      dist = d;
      close = feature;
    }
  }

  var line = [
    {lat: me.lat(), lng: me.lng()}, 
    {lat: close.position.lat(), lng: close.position.lng()}
  ];
  var path = new google.maps.Polyline({
  path: line,
  geodesic: true,
  strokeColor: '#0000FF',
  strokeOpacity: 1.0,
  strokeWeight: 2
  });
  path.setMap(map);

  // Create a marker
  var marker = new google.maps.Marker({
    position: me,
    animation: google.maps.Animation.DROP
  });
  marker.setMap(map);
  dist = Math.round(dist * 100)/100;
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent("<p>" + "<b>" + "This is YOU!" + "</b>" + "<br />" + 
      "Closet station: " + close.title + "<br />" + "Distance to you: " + dist + " miles." + "</p>");
    infowindow.open(map, marker);
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
    }
  });
}

function calc_dist(me, feature){
  var R = 3959; // Earth’s mean radius in miles
  var d_lat = rad(feature.position.lat() - me.lat());
  var d_long = rad(feature.position.lng() - me.lng());
  var a = Math.sin(d_lat / 2) * Math.sin(d_lat / 2) +
    Math.cos(rad(me.lat())) * Math.cos(rad(feature.position.lat())) *
    Math.sin(d_long / 2) * Math.sin(d_long / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d; // returns the distance in miles
}

function loadJSON() {
  // Step 1: create an instance of XMLHttpRequest
  request = new XMLHttpRequest();
  // Step 2: Make request to remote resource
  request.open("get", "https://fast-forest-77151.herokuapp.com/redline.json", true);
  // Step 3: Create handler function to do something with data in response
  request.onreadystatechange = parseJSON;
  // Step 4: Send the request
  request.send();
}

function parseJSON() {
  console.log("readyState: ", request.readyState, "status: ", request.status);
  if (request.readyState == 4 && request.status == 200) {
    data = request.responseText;
    trainInfo = JSON.parse(data);
    var arr_ale = [];
    var arr_ash = [];
    var arr_bra = [];
    var dest;
    for (var i = 0, trip; trip = trainInfo["TripList"]["Trips"][i]; i++) {
      var dest = trip['Destination'];
      for (var j = 0, predict; predict = trip["Predictions"][j]; j++) {
        if (predict["Stop"] == curr_stop) {
          if (dest == "Alewife") {
            arr_ale.push(predict["Seconds"]);
          }
          if (dest == "Ashmont") {
            arr_ash.push(predict["Seconds"]);
          }
          if (dest == "Braintree") {
            arr_bra.push(predict["Seconds"]);
          }
        }
      }
    }

    arr_ale.sort(compareNumbers);
    arr_ash.sort(compareNumbers);
    arr_bra.sort(compareNumbers);
    sec_to_min(arr_ale);
    sec_to_min(arr_ash);
    sec_to_min(arr_bra);
    var train_ale = arr_ale.join('<br />');
    train_ale = if_null(train_ale);
    var train_ash = arr_ash.join('<br />');
    train_ash = if_null(train_ash);
    var train_bra = arr_bra.join('<br />');
    train_bra = if_null(train_bra);
    infowindow.setContent("<p>" + "<b>" + curr_stop + "</b>" + "<br />" + 
      "<b>" + "Next trains to Alewife: " + "</b>" + "<br />" + train_ale + "<br />" +
      "<b>" + "Next trains to Ashmont: " + "</b>" + "<br />" + train_ash + "<br />" +
      "<b>" + "Next trains to Braintree: " + "</b>" + "<br />" + train_bra + "</p>");
  }
}

function sec_to_min(arr) {
  for (var i = 0; i < arr.length; i++) {
    var sec = arr[i];
    var min = Math.floor(sec / 60);
    sec = sec - min * 60;
    if (min == 0) {
      var string = sec + " seconds"
    } else if (min == 1) {
      var string = min + " minute " + sec + " seconds "
    } else {
      var string = min + " minutes " + sec + " seconds "
    }
    arr[i] = string;
  }
}

function if_null(train) {
  if (train == '') {
    train = 'None. <br />';
    return train;
  }
  else {
    return train + '<br />';
  }
}

function compareNumbers(a, b) {
  return a - b;
}

var rad = function(x) {
  return x * Math.PI / 180;
};

var line_b = [
  {lat: 42.395428, lng: -71.142483},
  {lat: 42.39674, lng: -71.121815},
  {lat: 42.3884, lng: -71.11914899999999},
  {lat: 42.373362, lng: -71.118956},
  {lat: 42.365486, lng: -71.103802},
  {lat: 42.36249079, lng: -71.08617653},
  {lat: 42.361166, lng: -71.070628},
  {lat: 42.35639457, lng: -71.0624242},
  {lat: 42.355518, lng: -71.060225},
  {lat: 42.352271, lng: -71.05524200000001},
  {lat: 42.342622, lng: -71.056967},
  {lat: 42.330154, lng: -71.057655},
  {lat: 42.320685, lng: -71.052391}, // JFK
  {lat: 42.275275, lng: -71.029583},
  {lat: 42.2665139, lng: -71.0203369},
  {lat: 42.251809, lng: -71.005409},
  {lat: 42.233391, lng: -71.007153},
  {lat: 42.2078543, lng: -71.0011385}
];

var line_a = [
  {lat: 42.320685, lng: -71.052391},
  {lat: 42.31129, lng: -71.053331},
  {lat: 42.300093, lng: -71.061667},
  {lat: 42.29312583, lng: -71.06573796000001},
  {lat: 42.284652, lng: -71.06448899999999}
]

// list of locations and names of red line stations
var features = [
  {
    position: new google.maps.LatLng(line_b[9]),
    title: "South Station"
  }, {
    position: new google.maps.LatLng(line_b[11]),
    title: "Andrew"
  }, {
    position: new google.maps.LatLng(line_b[2]),
    title: "Porter Square"
  }, {
    position: new google.maps.LatLng(line_b[3]),
    title: "Harvard Square"       
  }, {
    position: new google.maps.LatLng(line_a[12]),
    title: "JFK/UMass"     
  }, {
    position: new google.maps.LatLng(line_a[1]),
    title: "Savin Hill"  
  }, {
    position: new google.maps.LatLng(line_b[7]),
    title: "Park Street"
  }, {
    position: new google.maps.LatLng(line_b[10]),
    title: "Broadway"
  }, {
    position: new google.maps.LatLng(line_b[13]),
    title: "North Quincy"
  }, {
    position: new google.maps.LatLng(line_a[3]),
    title: "Shawmut"
  }, {
    position: new google.maps.LatLng(line_b[1]),
    title: "Davis"
  }, {
    position: new google.maps.LatLng(line_b[0]),
    title: "Alewife"
  }, {
    position: new google.maps.LatLng(line_b[5]),
    title: "Kendall/MIT"
  }, {
    position: new google.maps.LatLng(line_b[6]),
    title: "Charles/MGH"
  }, {
    position: new google.maps.LatLng(line_b[8]),
    title: "Downtown Crossing"
  }, {
    position: new google.maps.LatLng(line_b[15]),
    title: "Quincy Center"
  }, {
    position: new google.maps.LatLng(line_b[16]),
    title: "Quincy Adams"
  }, {
    position: new google.maps.LatLng(line_a[4]),
    title: "Ashmont"
  }, {
    position: new google.maps.LatLng(line_b[14]),
    title: "Wollaston"
  }, {
    position: new google.maps.LatLng(line_a[2]),
    title: "Fields Corner"
  }, {
    position: new google.maps.LatLng(line_b[4]),
    title: "Central Square"
  }, {
    position: new google.maps.LatLng(line_b[17]),
    title: "Braintree"
  }
];