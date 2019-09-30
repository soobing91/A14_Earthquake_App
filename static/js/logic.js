// Store API endpoints
var quakeURL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
var faultURL = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';

// Perform a GET request to the query urls
d3.json(quakeURL, (d1) => {
    d3.json(faultURL, (d2) => {
        var quakeData = d1.features;
        var faultData = d2.features;

        // Run the next job
        createFeatures(quakeData, faultData);
    });
})

function createFeatures(quakeData, faultData) {
    // Step 1
    // Create markers
    function bubbleMaker(feature) {
        return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
            color: 'black',
            weight: 1,
            fillColor: colorScale(feature.properties.mag),
            fillOpacity: 1,
            radius: radiusScale(feature.properties.mag)
        });
    }

    // Create tooltips with the pop-up feature
    function onEachFeature(feature, layer) {
        layer.bindPopup('<h3>' + feature.properties.place + 
        '</h3><hr><p>' + new Date(feature.properties.time) + '</h3>');
    }

    // Hold features in one variable named "earthquakes"
    var earthquakes = L.geoJSON(quakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: bubbleMaker
    });

    // Step 2
    // Create lines
    function lineMaker(feature) {
        L.polyline([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
            color: 'darkorange'
        });
    }

    // Hold features in one variable named "faults"
    var faults = L.geoJSON(faultData, {
        onEachFeature: lineMaker
    });

    // Create the map
    createMap(earthquakes, faults);
}

function createMap(earthquakes, faults) {
    // Define map layers
    var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
      });
    
    var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: API_KEY
      });

    var outdoorsmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: API_KEY
      });
    
    // Define basemaps
    var baseMaps = {
        'Grayscale': lightmap,
        'Satellite': satellitemap,
        'Outdoors': outdoorsmap
    };

    // Define overlay maps
    var overlayMaps = {
        Earthquakes: earthquakes,
        Faults: faults
    };

    // Draw the map
    var myMap = L.map('map', {
        center: [32.715736, -117.161087], // San Diego because I like it
        zoom: 5,
        layers: [lightmap, earthquakes, faults]
    });

    // Add controls to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap)

    // Add legend to the map
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function(map) {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 2, 3, 4, 5];
        
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colorScale(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        };

        return div;
    };

    legend.addTo(myMap);

}

// Assign colors to bubbles
function colorScale(mag) {
    var color = '';

    if (mag > 5) {
        color = 'orangered';
    }
    else if (mag > 4) {
        color = 'darkorange';
    }
    else if (mag > 3) {
        color = 'orange';
    }
    else if (mag > 2) {
        color = 'gold';
    }
    else if (mag > 1) {
        color = 'lightgreen';
    }
    else {
        color = 'limegreen';
    }
    
    return color;
}

// Adjust size of bubbles based on the recorded magnitudes
function radiusScale(r) {
    return r * 5;
}