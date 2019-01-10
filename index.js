var markers = [];
var map, coords, marker, lastOpenedInfoWindow, newSearchTerm;
var lat, lon, pos;

let MEETUP_FIND_GROUP_URL = 'https://api.meetup.com/find/groups?&sign=true&key=676a4118036165d4474c2477286b27&photo-host=public&page=20&text=';

//Get data from MeetUp
function getDataFromMeetUp(searchTerm, callback) {
  const settings = {
    url: MEETUP_FIND_GROUP_URL + searchTerm + "&lat=" + lat + "&lon=" + lon + "&radius=50",
    dataType: 'jsonp',
    method: 'get',
    success: callback
  };
  newSearchTerm = searchTerm;
  $.ajax(settings);
}

//Callback function
function displayMeetUpSearchData(result, searchTerm) {
  if (newSearchTerm !== searchTerm) {
    clearInfoBlock();
    deleteMarkers();
    displayMarkers(result);
  } else {
    displayMarkers(result);
  }

}
// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setMapOnAll(null);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

//Create array of markers and display markers
function displayMarkers(result) {

  for (var i = 0; i < result.data.length; i++) {

    if (result.data[i].next_event) {
      coords = {
        lat: result.data[i].lat,
        lng: result.data[i].lon
      };

      marker = new google.maps.Marker({
        position: coords,
        map: map
      });
      marker.setIcon('https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png')
      markers.push(marker);

      var content = result.data[i].name;
      var block = result.data[i];
      var infowindow = new google.maps.InfoWindow();
      google.maps.event.addListener(marker, 'click', (function(marker, content, infowindow, block) {
        return function() {
          $('.js-group-info').html('');
          $('.js-next-event-info').html('');
          craeteInfoBlock(block);
          closeLastOpenedInfoWindow();
          infowindow.setContent(content);
          infowindow.open(map, marker);
          lastOpenedInfoWindow = infowindow;
        };
      })(marker, content, infowindow, block));
    }
  }
}
//Close last open window
function closeLastOpenedInfoWindow() {
  if (lastOpenedInfoWindow) {
    lastOpenedInfoWindow.close();
  }
}

//Map and location initialize
function initMap() {
  var infoWindow = new google.maps.InfoWindow;


  //Geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        lat = position.coords.latitude;
        lon = position.coords.longitude;
        pos = {
          lat: lat,
          lng: lon
        };
        infoWindow.setPosition(pos);
        infoWindow.setContent('Your location');
        infoWindow.open(map);
        map.setCenter(pos);
      },
      function() {
        handleLocationError(true, infoWindow, map.getCenter());
      });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: Number(lat),
      lng: Number(lon)
    },
    zoom: 10
  });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
    'Error: The Geolocation service failed.' :
    'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

function clearInfoBlock() {
  $('.js-group-info').html("");
  $('.js-next-event-info').html("");
}

//Create information block
function craeteInfoBlock(block) {
  let currentBlock = block;
  if (currentBlock.name !== block.name) {
    $('.js-group-info').html('');
    $('.js-next-event-info').html('');
  } else {
    var date = new Date(block.next_event.time);
    $('.js-group-info').html(
      `<div class="blockinfo group-info">
        <h3>Information about group</h3>
        <a href="${block.link}" target="_blank">${block.name}</a>
        <p>Location is <span>${block.localized_location}</span></p>
        <p>Organized by <span>${block.organizer.name}</span></p>
      </div>
      `);
    $('.js-next-event-info').html(`
        <div class="blockinfo event-info">
          <h3>Next event</h3>
          <p>Meeting point is <span>${block.next_event.name}</span></p>
          <p>Meeting date is <span>${date.toLocaleDateString('en-US')}</span></p>
          <p>Meeting time is <span>${date.toLocaleTimeString('en-US')}</span></p>
        </div>
      `);
  }
}

function updateMap() {
  $('#findButton').on('click', function(e) {
    e.preventDefault();
    let query = $('#query').val();
    $('#query').val('');
    getDataFromMeetUp(query, displayMeetUpSearchData);
  });

  $('#logIn, #signUp').on('click', function() {
    $(".popup-overlay, .popup-content").addClass("active");
    $(".box-parent").addClass("inactive");
  });

  $(".close, .popup-overlay").on("click", function() {
    $(".popup-overlay, .popup-content").removeClass("active");
    $(".box-parent").removeClass("inactive");
  });
}

$(updateMap);
