//$.ajaxSetup( { "async": false , "timeout" : 80000000} );

var map;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat:29,lng:-110},
        zoom: 8
    });
}
function toRad(x) {
    return x * Math.PI / 180;
}
function H_distance(i, n){
    return haversineDistance([i.geometry.coordinates[0], i.geometry.coordinates[1]],[n.geometry.coordinates[0], n.geometry.coordinates[1]]);
}

function haversineDistance(coords1, coords2, isMiles) {
    function toRad(x) {
        return x * Math.PI / 180;
    }

    var lon1 = coords1[0];
    var lat1 = coords1[1];

    var lon2 = coords2[0];
    var lat2 = coords2[1];

    var R = 6371; // km

    var x1 = lat2 - lat1;
    var dLat = toRad(x1);
    var x2 = lon2 - lon1;
    var dLon = toRad(x2);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;

    if(isMiles) d /= 1.60934;

    return d;
}

function get_url( country,state, distance ) {
    return 'http://overpass-api.de/api/interpreter?data=[out:json];(area[name="'+country+'"];)->.a;(node["place"="city"]["name"="'+state+'"])->.center;node(around.center:'+distance+')["place"~"city|town"](area.a);out;';
}


function get_index_by_name(state,array){

    for (let i = 0; i < array.length; i++ ) {
        if (state === array[i].properties.name){
            return i;
        }
    }
    return -1;
}

function get_close(state, distance, array,id){

    let idx = get_index_by_name(state,array);
    let low = idx;
    let high = idx;
    while ( low > 0 &&  Math.abs(array[low].geometry.coordinates[id] - array[idx].geometry.coordinates[id]) < distance) low--;
    while (high < array.length && Math.abs(array[high].geometry.coordinates[id] - array[idx].geometry.coordinates[id]) < distance) high++;

    let a = [];
    for (let i = low; i < high; i++) {
        a.push(array[i]);
    }
    return a;

}

function is_in(key, array){
    for(let i = 0; i < array.length; i++){
        if (array[i].properties.name === key){
            return true;
        }
    }
    return false;
}

function get_closest_nodes(state, lat_d, lon_d, lat_array, lon_array){

    let lat = get_close(state,lat_d,lat_array,1);
    let lon = get_close(state,lon_d,lon_array,0);
    let a = [];

    for(let i = 0; i < lat.length; i++){
        if (is_in(lat[i].properties.name,lon))a.push(lat[i]);
    }
    return a;
}

function procesa() {

    let sorted_lat = datajson.slice();
    let sorted_lon = datajson.slice();

    sorted_lat = sorted_lat.sort(function(a,b) {
        return b.geometry.coordinates[1]-a.geometry.coordinates[1];
    });

    sorted_lon = sorted_lon.sort(function(a,b){
        return b.geometry.coordinates[0]-a.geometry.coordinates[0];
    });

    let lat_distance = document.getElementById('lat').value;
    let lon_distance = document.getElementById('lon').value;

    let starting_state = document.getElementById('starting_state').value;

    let final_state = document.getElementById('final_state').value;


    let results = document.getElementById('results');

    let text = "Así que quieres viajar eh " + '<br>';
    text += " Entonces irás de " + starting_state + ' a ' + final_state + ' <br>';
    text += "<br> Primero ve a ";
    results.innerHTML = text;

    let usados = [];

    usados.push(starting_state);
    
    /* ******************* PARTE CHILA     */
    let final_node = sorted_lat[get_index_by_name(final_state,sorted_lat)];

    let current_node = sorted_lat[get_index_by_name(starting_state,sorted_lat)];

    var marker = new google.maps.Marker({
        position: {lat:current_node.geometry.coordinates[1],lng:current_node.geometry.coordinates[0]},
        map: map,
        title: current_node.properties.name
    });
    console.log(current_node.properties.name);
    _next(usados,current_node,final_node,sorted_lat,sorted_lon,lat_distance,lon_distance);

}

function _next(usados, start,end,lat_a,lon_a, lat, lon) {

    console.log('Usados: ' , usados);
    let results = document.getElementById('results');
    if (start.properties.name == end.properties.name){
        results.innerHTML += "<br> Y eso es todo, llegamos a " + end.properties.name;
        return;
    }

    let origin = new google.maps.LatLng(start.geometry.coordinates[1], start.geometry.coordinates[0]);
    let array = get_closest_nodes(start.properties.name,lat,lon,lat_a,lon_a);
    console.log('antes');

    for(let i = 0; i < array.length; i++){
        console.log(array[i]);
    }

    for (let i = 0; i < usados.length; i++){
        for(let j = 0; j < array.length; j++){
            console.log(usados[i] + ' == ' + array[j].properties.name + ' : ');
            console.log(usados[i] == array[j].properties.name);
            if (usados[i] == array[j].properties.name){
                array.splice(j,1);
            }
        }
    }
    console.log(array);
    let k = get_index_by_name(start.properties.name,array);
    if (k != -1) array.splice(k,1);
    console.log(array);
    let destinations =[];

    for(let i = 0; i < array.length; i++) {
        destinations.push(new google.maps.LatLng(array[i].geometry.coordinates[1],array[i].geometry.coordinates[0]));
    }


    console.log(destinations.length);

    if (destinations.length > 25) {
        array.length = 25;
        destinations.length = 25;
    }
    console.log('De ' + start.properties.name + ' me puedo ir a ');

    console.log(array);
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
        origins: [origin],
        destinations: destinations,
        travelMode: 'DRIVING',
        avoidHighways: false,
        avoidTolls: true
    }, function(response, status){

        if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {

            console.log('me ando pasando de lanza');

            setTimeout(function(){
                _next(usados,start,end,lat_a,lon_a,lat,lon);
            }, 5000);

        }else{

            console.log(status);
            console.log(response);

            let best = array[0];
            let best_distance = response.rows[0].elements[0].distance.value + H_distance(best,end)*1000;

            for (let i = 0; i < array.length; i++){
                console.log(i);
                if (response.rows[0].elements[i].status != 'OK') continue;
                if (best_distance > response.rows[0].elements[i].distance.value + H_distance(array[i],end)*1000){
                    best_distance = response.rows[0].elements[i].distance.value + H_distance(array[i],end)*1000;
                    best = array[i];
                }
            }
            results.innerHTML += '<br> --> ' + best.properties.name;
            var marker = new google.maps.Marker({
                position: {lat:best.geometry.coordinates[1],lng:best.geometry.coordinates[0]},
                map: map,
                title: best.properties.name
            });
            console.log(" --> " + best.properties.name);
            usados.push(best.properties.name);
            _next(usados,best,end,lat_a,lon_a,lat,lon);
        }
    });
}


initMap();

