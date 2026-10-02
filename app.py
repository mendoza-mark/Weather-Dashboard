from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

API_KEY = "API_KEY HERE"  # Replace with your actual OpenWeatherMap API key

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/weather")
def get_weather():
    city = request.args.get("city")
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    url = "https://api.openweathermap.org/data/2.5/weather"

    if lat and lon:
        params = {
            "lat": lat,
            "lon": lon,
            "appid": API_KEY,
            "units": "metric"
        }
    else:
        params = {
            "q": city,
            "appid": API_KEY,
            "units": "metric"
        }

    response = requests.get(url, params=params)
    data = response.json()

    if response.status_code != 200:
        return jsonify({"error": data.get("message", "City not found")}), response.status_code

    weather_info = {
        "city": data["name"],
        "country": data["sys"]["country"],
        "temperature": data["main"]["temp"],
        "feels_like": data["main"]["feels_like"],
        "humidity": data["main"]["humidity"],
        "wind_speed": data["wind"]["speed"],
        "condition": data["weather"][0]["main"],
        "description": data["weather"][0]["description"],
        "icon": data["weather"][0]["icon"]
    }

    return jsonify(weather_info)

@app.route("/geocode")
def geocode():
    query = request.args.get("q")

    if not query:
        return jsonify([])

    url = "https://api.openweathermap.org/geo/1.0/direct"
    params = {
        "q": query,
        "limit": 5,
        "appid": API_KEY
    }

    response = requests.get(url, params=params)
    data = response.json()

    if not isinstance(data, list):
        return jsonify([])

    results = []
    for place in data:
        results.append({
            "name": place.get("name"),
            "state": place.get("state", ""),
            "country": place.get("country"),
            "lat": place.get("lat"),
            "lon": place.get("lon")
        })

    return jsonify(results)

if __name__ == "__main__":
    app.run(debug=True)
