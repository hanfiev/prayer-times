//notification permission
Notification.requestPermission(function (status) {
    console.log('Notification permission status:', status);
});

//notification
function displayNotification(prayerName, time) {
    if (Notification.permission == 'granted') {
        navigator.serviceWorker.getRegistration().then(function (reg) {
            reg.showNotification('(' + time + ')' + ' it is ' + prayerName + ' time');
        });
    }
}

//declare var
var weekday = new Array(7);
weekday[0] = "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";

var monthName = new Array(12);
monthName[0] = "January";
monthName[1] = "February";
monthName[2] = "March";
monthName[3] = "April";
monthName[4] = "May";
monthName[5] = "June";
monthName[6] = "July";
monthName[7] = "August";
monthName[8] = "September";
monthName[9] = "October";
monthName[10] = "November";
monthName[11] = "December";


var d = new Date();
var time = d.getHours() + ':' + ('0' + d.getMinutes()).slice(-2);
var today = weekday[d.getDay()] + ', ';
var date = d.getDate() + ' ' + monthName[d.getMonth()] + ' ' + d.getFullYear();

var hour = d.getHours();
var minute = ('0' + d.getMinutes()).slice(-2);
var timeID = hour + minute;

document.getElementById("date").innerHTML = today + date

//location
var lat = '';
var lng = '';

var prayerObj = [];
var fil = '';
var activeList = '';
var timeRemaining = '';

//prayerTime
var fajrTime = '';
var dhuhrTime = '';
var asrTime = '';
var maghribTime = '';
var ishaTime = '';

//prayerTime ID
var fajrID = '';
var dhuhrID = '';
var asrID = '';
var maghribID = '';
var ishaID = '';

//prayer data load
var city = 'bandung';

//checking the latest time and update it every 500ms
window.onload = timeUpdate()
window.onload = checkStorage()


function timeUpdate() {
    d = new Date();
    time = d.getHours() + ':' + ('0' + d.getMinutes()).slice(-2);
    today = weekday[d.getDay()] + ',';
    date = d.getDate() + ' ' + monthName[d.getMonth()] + ' ' + d.getFullYear();
    document.getElementById('clock').innerHTML = time;

    hour = d.getHours();
    minute = ('0' + d.getMinutes()).slice(-2);

    timeID = hour + minute;
    setTimeout(timeUpdate, 500);

    if (localStorage.getItem('city') != null) {
        // kalo udah ada setingan sebelumnya 
        setTimeout(nextPrayerFilter, 2000);
    }
}

function nextPrayerFilter() {
    //bikin set of array buat waktu solat yang belum kelewat
    fil = function (val) {
        return val.id > timeID;
    };

    activeList = prayerObj.filter(fil);

    if (activeList.length == 0) {

        document.getElementById('nextPrayerName').innerHTML = 'Fajr';
        document.getElementById('nextPrayerTime').innerHTML = fajrTime;
        timeRemaining = moment(fajrTime, "HH:mm").fromNow()
        document.getElementById('timeRemaining').innerHTML = timeRemaining;

    } else {

        document.getElementById('nextPrayerName').innerHTML = activeList[0].name;
        document.getElementById('nextPrayerTime').innerHTML = activeList[0].time;
        //udah dapet, waktu ibadah yang paling deket ama waktu sekarang, push.
        timeRemaining = moment(activeList[0].time, "HH:mm").fromNow()
        document.getElementById('timeRemaining').innerHTML = timeRemaining;

        if (activeList[0].time == time) {
            displayNotification(activeList[0].name, activeList[0].time)
        }
    }


}

//card function
function flip() {
    document.getElementById('front').style.transform = "rotateY(180deg)";
    $(".lainnya").fadeOut();
}

function flipdua() {
    document.getElementById('front').style.transform = "rotateY(0deg)";
    $(".lainnya").fadeIn();

}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    lat = position.coords.latitude;
    lng = position.coords.longitude
    reverseGeocoding()
}

function reverseGeocoding() {

    let reverseQuery = 'https://us1.locationiq.com/v1/reverse.php?key=f6f3942ca42598&lat=' + lat + '&lon=' + lng + '&format=json'

    $.ajax({
            method: 'GET',
            mode: 'no-cors',
            url: reverseQuery
        })

        .done(function (data) {
            document.getElementById("location").innerHTML = data.address.city + ' <i class="fas fa-cog"></i>';
            city = data.display_name;
            lng = data.lon;
            lat = data.lat;
            setTimeout(getPrayerTimes, 4000);
            document.getElementById('city').placeholder = city
            document.getElementById('city').value = city
        })

}


function saveLocation() {
    localStorage.setItem('city', city);
    localStorage.setItem('lat', lat);
    localStorage.setItem('lng', lng);
    getPrayerTimes();
    document.getElementById('location').innerHTML = city + ' <i class="fas fa-cog"></i>'
    document.getElementById('city').placeholder = city
}

function checkStorage() {
    if (localStorage.getItem('city') != null) {
        // kalo udah ada setingan sebelumnya 
        lat = localStorage.getItem('lat');
        lng = localStorage.getItem('lng');
        city = localStorage.getItem('city')
        document.getElementById('city').placeholder = city
        document.getElementById('location').innerHTML = city + ' <i class="fas fa-cog"></i>'
        setTimeout(getPrayerTimes, 1000)

    } else {
        //kalo ga ada setingan sebelumnya
        flip();
    }
}


function getPrayerTimes() {

    var query = 'https://api.pray.zone/v2/times/today.json?longitude=' + lng + '&latitude=' + lat + '&elevation=';
    $.ajax({
            method: 'GET',
            mode: 'no-cors',
            url: query
        })

        .done(function (data) {
            //Fajr
            fajrTime = data.results.datetime[0].times.Fajr;
            fajrID = fajrTime.replace(":", "")
            fajrID = Number(fajrID);

            //Dhuhr
            dhuhrTime = data.results.datetime[0].times.Dhuhr;
            dhuhrID = dhuhrTime.replace(":", "")
            dhuhrID = Number(dhuhrID);

            //Asr
            asrTime = data.results.datetime[0].times.Asr;
            asrID = asrTime.replace(":", "")
            asrID = Number(asrID);

            //Maghrib
            maghribTime = data.results.datetime[0].times.Maghrib;
            maghribID = maghribTime.replace(":", "")
            maghribID = Number(maghribID);

            //Ishaa
            ishaTime = data.results.datetime[0].times.Isha;
            ishaID = ishaTime.replace(":", "")
            ishaID = Number(ishaID);

            //push prayertime and id into objects of array

            prayerObj = [{
                id: fajrID,
                time: fajrTime,
                name: "Fajr"
            }, {
                id: dhuhrID,
                time: dhuhrTime,
                name: "Dhuhr"
            }, {
                id: asrID,
                time: asrTime,
                name: "Asr"
            }, {
                id: maghribID,
                time: maghribTime,
                name: "Maghrib"
            }, {
                id: ishaID,
                time: ishaTime,
                name: "Isha"
            }]

            //masukin waktu solat ke tabel
            document.getElementById('fajr').innerHTML = fajrTime
            document.getElementById('dhuhr').innerHTML = dhuhrTime
            document.getElementById('asr').innerHTML = asrTime
            document.getElementById('maghrib').innerHTML = maghribTime
            document.getElementById('isha').innerHTML = ishaTime

            setTimeout(nextPrayerFilter, 1000);
        })
}