
let searchInput = document.querySelector('.weather__search');
let city = document.querySelector('.weather__city');
let day = document.querySelector('.weather__day');
let humidity = document.querySelector('.weather__indicator--humidity>.value');
let wind = document.querySelector('.weather__indicator--wind>.value');
let pressure = document.querySelector('.weather__indicator--pressure>.value');
let image = document.querySelector('.weather__image');
let temperature = document.querySelector('.weather__temperature>.value');
let forcastBlock = document.querySelector('.weather__forcast');
let suggestions = document.querySelector('#suggestions')

// get url 
let cityBaseEndPoint = 'https://api.teleport.org/api/cities/?search=';

let weatherAPIKey = '4bb576042517d6fddc73d129acb3c6bf';
// get the url
let weatherBaseEndpoint = 'https://api.openweathermap.org/data/2.5/weather?units=metric&appid=' + weatherAPIKey;
let forcastBaseEndpoint= 'https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=' + weatherAPIKey;

let weatherImages = [
    {
        url:'images/clear-sky.png',
        ids: [800]
    },
    {
        url:'images/broken-clouds.png',
        ids: [803, 804]
    },
    {
        url:'images/few-clouds.png',
        ids: [801]
    },
    {
        url:'images/mist.png',
        ids: [701, 711, 721, 731, 741, 751, 761, 762, 771, 781]
    },
    {
        url:'images/rain.png',
        ids: [500, 501, 502, 503, 504]
    },
    {
        url:'images/scattered-clouds.png',
        ids: [802]
    },
    {
        url:'images/shower-rain.png',
        ids: [520, 521, 522, 531, 300, 301, 302, 310, 311, 313, 314, 321]
    },
    {
        url:'images/snow.png',
        ids: [511, 600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622]
    },
    {
        url:'images/thunderstorm.png',
        ids: [200, 201, 202, 210, 211, 212, 221,230, 231, 232]
    },
]

let getWeatherByCityName = async (cityString) => {
    let city;
    if (cityString.includes(',')){
        city=  cityString.substring(0, cityString.indexOf(',')) + cityString.substring(cityString.lastIndexOf(','))
    } else{
        city = cityString;
    }
    let endpoint = weatherBaseEndpoint + '&q=' + city;
    let response = await fetch(endpoint);
    // console.log(response);
    if (response.status !== 200 ){
        alert('City not found !');
        return;
    }
    let weather = await response.json();

    // console.log(weather);
   return weather;
}

// getWeatherByCityName("New York")

let getForcastByCityId = async (id) => {
    let endpoint = forcastBaseEndpoint + '&id=' + id;
    let result = await fetch(endpoint);
    let forcast = await result.json();
    console.log(forcast);
    let forcastList = forcast.list;
    let daily = [];

    forcastList.forEach(day => {
        let date = new Date(day.dt_txt.replace(' ', 'T'));
        let hours = date.getHours();
        // console.log(hours);
        if (hours === 12) {
            daily.push(day);
        }
    })
    // console.log(daily);
    return daily;
}

let weatherForCity = async(city) =>{
    let weather = await getWeatherByCityName(city);
        if (!weather){
            return;
        }
        // console.log(weather);
        let cityID = weather.id;
        updateCurrentWeather(weather);
        let forcast = await getForcastByCityId(cityID);
        updateForcast(forcast)
}

let init = () =>{
    weatherForCity('Lagos').then(() => document.body.style.filter = 'blur(0)');
}

init();

// take note of 'searchInput'

searchInput.addEventListener('keydown', async (e) => {
    // console.log(e);
    if (e.keyCode === 13) {
        let weather = await getWeatherByCityName(searchInput.value);
        if (!weather){
            return;
        }
        console.log(weather);
        let cityID = weather.id;
        updateCurrentWeather(weather);
        let forcast = await getForcastByCityId(cityID);
        updateForcast(forcast)
    weatherForCity(searchInput.value);

    }

});


searchInput.addEventListener('input', async()=>{
    let endpoint = cityBaseEndPoint + searchInput.value;
    let result = await(await fetch(endpoint)).json();
    console.log(result);
    suggestions.innerHTML =' ';
    let cities = result._embedded['city:search-results'];
    let length = cities.length > 5 ? 5 : cities.length;
    for ( let i = 0; i < length; i++){
        let option = document.createElement('option');
        option.value = cities[i].matching_full_name;
        suggestions.appendChild(option);
    }
})

let updateCurrentWeather = (data) => {
    // console.log(data);
    city.textContent = data.name + ',' + data.sys.country;
    day.textContent = dayOfWeek();
    humidity.textContent = data.main.humidity;
    pressure.textContent = data.main.pressure;
    let windDirection;
    let deg = data.wind.deg;
    if (deg > 45 && deg <= 135) {
        windDirection = 'East';
    } else if (deg > 135 && deg <= 225) {
        windDirection = 'South'
    } else if (deg > 225 && deg <= 315) {
        windDirection = 'West'
    } else {
        windDirection = 'North';
    }
    wind.textContent = windDirection + ',' + data.wind.speed;
    temperature.textContent = data.main.temp > 0 ? '+' + Math.round(data.main.temp) : Math.round(data.main.temp);
    let imgID = data.weather[0].id;
    weatherImages.forEach(obj =>{
        if (obj.ids.includes(imgID)){
            image.src = obj.url;
        }
    })
}

let updateForcast = (forcast) => {
    forcastBlock.innerHTML = '';
    forcast.forEach(day => {
        // get the url
        let iconUrl = 'http://openweathermap.org/img/wn/' + day.weather[0].icon + '@2x.png';
        let dayName = dayOfWeek(day.dt * 1000);
        let temperature = day.main.temp > 0 ? '+' + Math.round(day.main.temp) : Math.round(day.main.temp);
        let forcastItem = `
        <article class="weather__forcast__item">
                <img src="${iconUrl}" alt="${day.weather[0].description}" class="weather__forcast__icon">
                <h3 class="weather__forcast__day">${dayName}</h3>
                <p class="weather__forcast__temperature"><span class="value">${temperature}</span>&deg;C</p>
            </article>
        `;

        forcastBlock.insertAdjacentHTML('beforeend', forcastItem);

    })
}

let dayOfWeek = (dt = new Date().getTime()) => {
    return new Date(dt).toLocaleDateString('en-EN', { 'weekday': 'long' });
}