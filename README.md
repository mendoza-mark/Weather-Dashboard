# Weather Dashboard
A responsive web application that delivers live weather conditions for any city in the world, built with Python (Flask) and the OpenWeatherMap API. It features city search with autocomplete, one-click location detection, pinned favorite cities, and a background that adapts to the current weather.

---
 
## Author
 
**Mark Droeid Mendoza**
Bachelor of Science in Information Technology
Batangas State University, JPLPC Malvar Campus
 
- Email: [markdroeidmendoza@gmail.com](mailto:markdroeidmendoza@gmail.com)
- GitHub: [@mendoza-mark](https://github.com/mendoza-mark)
---
 
## Table of Contents
 
1. [About This Project](#about-this-project)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [API Endpoints](#api-endpoints)
7. [How It Works](#how-it-works)
8. [Notes and Limitations](#notes-and-limitations)
9. [License](#license)
---
 
## About This Project
 
Weather Dashboard started as a free-time side project to practice real-world web development. It connects a Python backend to a browser-based interface and shows how the two communicate: the Flask server receives requests from the page, calls the OpenWeatherMap API, cleans up the response, and returns it to the browser as JSON.
 
The API key has been intentionally removed from the source code, so anyone is welcome to download the project, add their own free key, and use or build on it however they like.
 
This project is a useful starting point for understanding:
 
- How a Flask backend serves pages and exposes JSON endpoints
- How a frontend uses `fetch` to talk to a backend without reloading the page
- How to work with a third-party REST API
- How to store user preferences in the browser using `localStorage`
- How modern CSS can create animated, glass-style interfaces
---
 
## Features
 
**City Search**
 
- Search for any city by name using the search button or the Enter key.
- Shows a loading message while data is being fetched and a clear error message if a city cannot be found.
**Autocomplete Suggestions**
 
- Suggestions appear as you type, starting from two characters.
- Requests are debounced (sent 400 ms after typing stops) to avoid unnecessary API calls.
- Up to five matching places are listed, including the state or region and country, which helps separate cities that share the same name.
- Selecting a suggestion retrieves the weather using the exact coordinates of that place, so the result is always the one you picked.
- The suggestion list closes automatically when you click elsewhere or press Enter.
**Current Location Detection**
 
- A single button retrieves the weather for where you are.
- The app first uses the browser's built-in geolocation (GPS or network based).
- If permission is denied or the lookup fails, it automatically falls back to an IP-based location through ipapi.co.
- If both methods fail, a message asks the user to search manually.
**Live Weather Details**
 
- Weather icon for the current condition.
- City and country.
- Temperature in degrees Celsius.
- Weather description (for example, "light rain").
- Feels-like temperature.
- Humidity percentage.
- Wind speed in meters per second.
**Weather-Reactive Backgrounds**
 
- The page background is an animated, slowly shifting gradient.
- The color theme changes automatically to match the current condition, with a smooth transition between themes.
- Conditions without a dedicated theme fall back to the cloudy theme.
| Condition | Theme |
| --- | --- |
| Default (before a search) | Sky blue gradient |
| Clear | Warm yellow and orange fading into blue |
| Clouds | Muted gray |
| Rain, Drizzle | Dark slate with blue accents |
| Thunderstorm | Charcoal with purple |
| Snow | Icy light blue and white |
| Mist, Fog, Haze, Smoke | Soft silver-gray |
 
**Pinned Cities**
 
- Pin any city with one click and unpin it again at any time.
- Pinned cities are listed in the sidebar and open instantly when selected.
- Each pinned city can be removed directly from the list.
- Pins are saved in the browser, so they are still there the next time the app is opened.
**Last Search Memory**
 
- The most recently viewed city is saved and automatically reloaded when the page is opened again.
**Sidebar Navigation**
 
- A slide-out sidebar opens from a menu button and closes through the close button, by clicking the dimmed overlay, or after choosing an item.
- Navigation between the Home and About views happens instantly without reloading the page.
**About Page**
 
- A built-in developer profile card with name, role, short bio, and a link to the developer's GitHub.
**Modern Interface**
 
- Frosted-glass (glassmorphism) cards with background blur.
- Hover effects including a lift animation and a light-sweep highlight.
- Fade-in animation when results appear.
- Fluid typography and flexible card widths that scale with the screen size.
**Backend Capabilities**
 
- Weather lookup by city name or by latitude and longitude.
- Place lookup (geocoding) for the autocomplete feature.
- Clean, minimal JSON responses that expose only the fields the interface needs.
- API errors are passed through to the user with their original message and status code.
---
 
## Technology Stack
 
| Layer | Technology |
| --- | --- |
| Backend | Python, Flask |
| HTTP client | requests |
| Frontend | HTML5 (Jinja2 templates), CSS3, vanilla JavaScript |
| Weather and geocoding data | OpenWeatherMap Current Weather and Geocoding APIs |
| Fallback location lookup | ipapi.co |
| Client-side storage | Browser `localStorage` |
 
---
 
## Project Structure
 
```text
weather-dashboard/
├── app.py                 # Flask application and API routes
├── requirements.txt       # Python dependencies
├── .gitignore             # Files excluded from version control
├── README.md              # Project documentation
├── templates/
│   └── index.html         # Page layout (Home and About views, sidebar)
└── static/
    ├── css/
    │   └── style.css      # Styling, animations, and weather themes
    └── js/
        └── script.js      # Search, autocomplete, location, pins, navigation
```
 
---
 
## Getting Started
 
### Requirements
 
- Python 3.9 or later
- A free OpenWeatherMap API key
- An internet connection
### 1. Get an API Key
 
1. Create a free account at [openweathermap.org](https://openweathermap.org/api).
2. Open the **API keys** section of your account and copy your key.
3. New keys can take a short while to activate, so if requests fail at first, wait a bit and try again.
### 2. Clone the Repository
 
```bash
git clone https://github.com/mendoza-mark/weather-dashboard.git
cd weather-dashboard
```
 
### 3. Create a Virtual Environment and Install Dependencies
 
Windows:
 
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```
 
macOS and Linux:
 
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
 
### 4. Add Your API Key
 
Open `app.py` and replace the placeholder with your key:
 
```python
API_KEY = "YOUR_API_KEY_HERE"
```
 
Keep your key private. Do not commit a real key to a public repository.
 
### 5. Run the Application
 
```bash
python app.py
```
 
Then open [http://127.0.0.1:5000](http://127.0.0.1:5000) in your browser.
 
---
 
## API Endpoints
 
| Route | Method | Parameters | Description |
| --- | --- | --- | --- |
| `/` | GET | None | Serves the dashboard page |
| `/weather` | GET | `city`, or `lat` and `lon` | Returns current weather for a city name or a pair of coordinates |
| `/geocode` | GET | `q` | Returns up to five places that match the search text |
 
Example `/weather` response (values are illustrative):
 
```json
{
  "city": "Manila",
  "country": "PH",
  "temperature": 31.2,
  "feels_like": 36.5,
  "humidity": 74,
  "wind_speed": 3.6,
  "condition": "Clouds",
  "description": "scattered clouds",
  "icon": "03d"
}
```
 
Example `/geocode` response (values are illustrative):
 
```json
[
  { "name": "Manila", "state": "Metro Manila", "country": "PH", "lat": 14.6, "lon": 120.98 }
]
```
 
If a location cannot be found, `/weather` returns a JSON object with an `error` message and the matching HTTP status code.
 
---
 
## How It Works
 
1. The user searches for a city, picks a suggestion, or taps the location button.
2. The browser sends a request to the Flask server (`/weather` or `/geocode`).
3. Flask forwards the request to the OpenWeatherMap API together with the API key.
4. Flask keeps only the needed fields and returns them as JSON.
5. The browser draws the weather card and switches the background theme to match the condition.
6. If the user pins the city, it is saved in `localStorage` and appears in the sidebar.
---
 
## Notes and Limitations
 
- This is a free-time and learning project and is not intended for production use.
- The application runs on Flask's built-in development server with debug mode turned on. Use a production server and turn debug mode off before deploying publicly.
- The API key is stored directly in `app.py`. For anything beyond personal use, load it from an environment variable instead.
- Only current conditions are shown. There is no forecast.
- Temperatures are in Celsius and wind speed is in meters per second. There is no unit toggle.
- Pinned cities and the last search are stored in the browser, so they are not shared between devices or browsers.
- IP-based location is approximate and is only used when browser geolocation is unavailable.
- Usage is subject to the limits of the OpenWeatherMap free plan.
---
 
## License
 
This project is licensed under the MIT License. See below for details.
 
```text
MIT License
 
Copyright (c) 2026 Mark Droeid Mendoza
 
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
 
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
 
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
 
