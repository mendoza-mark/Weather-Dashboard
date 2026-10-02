console.log("script.js is connected!");

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const weatherResult = document.getElementById("weatherResult");
const locationBtn = document.getElementById("locationBtn");
const suggestionsBox = document.getElementById("suggestions");

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const sidebarClose = document.getElementById("sidebarClose");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const navItems = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".view");
const pinnedListEl = document.getElementById("pinnedList");

function getWeatherClass(condition) {
    const conditionMap = {
        "Clear": "weather-clear",
        "Clouds": "weather-clouds",
        "Rain": "weather-rain",
        "Drizzle": "weather-rain",
        "Thunderstorm": "weather-thunderstorm",
        "Snow": "weather-snow",
        "Mist": "weather-mist",
        "Fog": "weather-mist",
        "Haze": "weather-mist",
        "Smoke": "weather-mist"
    };

    return conditionMap[condition] || "weather-clouds";
}

function renderWeather(data) {
    if (data.error) {
        weatherResult.innerHTML = `<p class="error-text fade-in">Error: ${data.error}</p>`;
        return;
    }

    const cityKey = `${data.city},${data.country}`;
    localStorage.setItem("lastCity", cityKey);

    document.body.className = getWeatherClass(data.condition);

    const iconUrl = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
    const pinned = isPinned(cityKey);

    weatherResult.innerHTML = `
        <div class="fade-in">
            <img src="${iconUrl}" alt="${data.condition}" class="weather-icon">
            <h2>${data.city}, ${data.country}</h2>
            <button class="pin-btn ${pinned ? "pinned" : ""}" id="pinBtn">
                ${pinned ? "★ Pinned" : "☆ Pin this city"}
            </button>
            <p class="temp">${Math.round(data.temperature)}°C</p>
            <p class="description">${data.description}</p>
            <div class="details">
                <div class="detail-item"><span>Feels like</span><strong>${Math.round(data.feels_like)}°C</strong></div>
                <div class="detail-item"><span>Humidity</span><strong>${data.humidity}%</strong></div>
                <div class="detail-item"><span>Wind</span><strong>${data.wind_speed} m/s</strong></div>
            </div>
        </div>
    `;

    document.getElementById("pinBtn").addEventListener("click", function () {
        togglePin(cityKey);
        renderWeather(data);
    });
}

function searchWeather() {
    const city = cityInput.value;

    weatherResult.innerHTML = `<p class="placeholder-text fade-in">Loading...</p>`;

    fetch("/weather?city=" + city)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log("Data received from Flask:", data);
            renderWeather(data);
        });
}

function searchWeatherByCoords(lat, lon) {
    weatherResult.innerHTML = `<p class="placeholder-text fade-in">Loading...</p>`;

    fetch(`/weather?lat=${lat}&lon=${lon}`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log("Data received from Flask:", data);
            renderWeather(data);
        });
}

function loadCity(cityKey) {
    switchView("home");
    closeSidebar();
    weatherResult.innerHTML = `<p class="placeholder-text fade-in">Loading...</p>`;

    fetch("/weather?city=" + encodeURIComponent(cityKey))
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            renderWeather(data);
        });
}

searchBtn.addEventListener("click", searchWeather);

cityInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        suggestionsBox.innerHTML = "";
        searchWeather();
    }
});

let debounceTimer;

cityInput.addEventListener("input", function () {
    const query = cityInput.value.trim();

    clearTimeout(debounceTimer);

    if (query.length < 2) {
        suggestionsBox.innerHTML = "";
        return;
    }

    debounceTimer = setTimeout(function () {
        fetch("/geocode?q=" + encodeURIComponent(query))
            .then(function (response) {
                return response.json();
            })
            .then(function (places) {
                renderSuggestions(places);
            });
    }, 400);
});

function renderSuggestions(places) {
    if (!places || places.length === 0) {
        suggestionsBox.innerHTML = "";
        return;
    }

    suggestionsBox.innerHTML = places.map(function (place, index) {
        const stateText = place.state ? place.state + ", " : "";
        return `<div class="suggestion-item" data-index="${index}">${place.name}, ${stateText}${place.country}</div>`;
    }).join("");

    const items = suggestionsBox.querySelectorAll(".suggestion-item");
    items.forEach(function (item, index) {
        item.addEventListener("click", function () {
            const place = places[index];
            cityInput.value = `${place.name}, ${place.country}`;
            suggestionsBox.innerHTML = "";
            searchWeatherByCoords(place.lat, place.lon);
        });
    });
}

document.addEventListener("click", function (e) {
    if (e.target !== cityInput && !suggestionsBox.contains(e.target)) {
        suggestionsBox.innerHTML = "";
    }
});

function getLocationByIP() {
    fetch("https://ipapi.co/json/")
        .then(function (response) {
            return response.json();
        })
        .then(function (locationData) {
            if (!locationData.latitude || !locationData.longitude) {
                weatherResult.innerHTML = `<p class="error-text fade-in">Could not determine your location. Please search manually.</p>`;
                return;
            }

            searchWeatherByCoords(locationData.latitude, locationData.longitude);
        })
        .catch(function (error) {
            weatherResult.innerHTML = `<p class="error-text fade-in">Could not determine your location. Please search manually.</p>`;
        });
}

locationBtn.addEventListener("click", function () {
    weatherResult.innerHTML = `<p class="placeholder-text fade-in">Locating you...</p>`;

    if (!navigator.geolocation) {
        getLocationByIP();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            searchWeatherByCoords(lat, lon);
        },
        function (error) {
            console.log("GPS location failed, falling back to IP-based location. Reason:", error.message);
            getLocationByIP();
        },
        {
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 300000
        }
    );
});

function openSidebar() {
    sidebar.classList.add("open");
    sidebarOverlay.classList.add("visible");
}

function closeSidebar() {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("visible");
}

menuToggle.addEventListener("click", openSidebar);
sidebarClose.addEventListener("click", closeSidebar);
sidebarOverlay.addEventListener("click", closeSidebar);

function switchView(viewName) {
    views.forEach(function (view) {
        view.classList.toggle("active", view.id === viewName + "View");
    });
    navItems.forEach(function (item) {
        item.classList.toggle("active", item.getAttribute("data-view") === viewName);
    });
}

navItems.forEach(function (item) {
    item.addEventListener("click", function () {
        const viewName = item.getAttribute("data-view");
        switchView(viewName);
        closeSidebar();
    });
});

function getPinnedCities() {
    const stored = localStorage.getItem("pinnedCities");
    return stored ? JSON.parse(stored) : [];
}

function savePinnedCities(list) {
    localStorage.setItem("pinnedCities", JSON.stringify(list));
}

function isPinned(cityKey) {
    return getPinnedCities().includes(cityKey);
}

function togglePin(cityKey) {
    let pinned = getPinnedCities();

    if (pinned.includes(cityKey)) {
        pinned = pinned.filter(function (c) {
            return c !== cityKey;
        });
    } else {
        pinned.push(cityKey);
    }

    savePinnedCities(pinned);
    renderPinnedList();
}

function renderPinnedList() {
    const pinned = getPinnedCities();

    if (pinned.length === 0) {
        pinnedListEl.innerHTML = `<p class="pinned-empty">No pinned cities yet.</p>`;
        return;
    }

    pinnedListEl.innerHTML = pinned.map(function (cityKey) {
        const displayName = cityKey.split(",")[0];
        return `
            <div class="pinned-item" data-city="${cityKey}">
                <span class="pinned-item-name">${displayName}</span>
                <button class="unpin-btn" data-city="${cityKey}">✕</button>
            </div>
        `;
    }).join("");

    const rows = pinnedListEl.querySelectorAll(".pinned-item");
    rows.forEach(function (row) {
        row.addEventListener("click", function () {
            const cityKey = row.getAttribute("data-city");
            loadCity(cityKey);
        });
    });

    const unpinButtons = pinnedListEl.querySelectorAll(".unpin-btn");
    unpinButtons.forEach(function (btn) {
        btn.addEventListener("click", function (e) {
            e.stopPropagation();
            const cityKey = btn.getAttribute("data-city");
            togglePin(cityKey);
        });
    });
}

window.addEventListener("DOMContentLoaded", function () {
    renderPinnedList();

    const savedCity = localStorage.getItem("lastCity");

    if (!savedCity) {
        return;
    }

    weatherResult.innerHTML = `<p class="placeholder-text fade-in">Loading your last search...</p>`;

    fetch("/weather?city=" + encodeURIComponent(savedCity))
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log("Restored last search:", data);
            renderWeather(data);
        });
});