from flask import Flask, render_template

app = Flask(__name__)

sequential_color_schemes = [
    "Blues",
    "Greens",
    "Greys",
    "Oranges",
    "Purples",
    "Reds",
    "Blue to Green (BuGn)",
    "Blue to Purple (BuPu)",
    "Green to Blue (GnBu)",
    "Orange to Red (OrRd)",
    "Purple to Blue to Green (PuBuGn)",
    "Purple to Blue (PuBu)",
    "Purple to Red (PuRd)",
    "Red to Purple (RdPu)",
    "Yellow to Green to Blue (YlGnBu)",
    "Yellow to Green (YlGn)",
    "Yellow to Orange to Brown (YlOrBr)",
    "Yellow to Orange to Red (YlOrRd)"
]


iframe_routes = ['gaws_iframe', 'canesca_iframe', 'ohns_iframe']
@app.route("/<iframe_name>")
def render_iframe(iframe_name):
    if iframe_name in iframe_routes:
        return render_template(f"iframes/{iframe_name}.html")
    else:
        return "Invalid route", 404

@app.route("/")
def bulma():
    return render_template("bulma.html")

@app.route("/tailwind")
def tailwind():
    return render_template("home.html")

@app.route("/gaws")
def gaws():
    return render_template("pages/gaws.html")

@app.route("/canesca")
def CANESCA():
    return render_template("pages/canesca.html")

@app.route("/ohns")
def OHNS():
    return render_template("pages/ohns.html")

@app.route("/ohns_colors")
def folium():
    return render_template("pages/ohnsv2.html", sequential_color_schemes=sequential_color_schemes)

if __name__ == "__main__":
    app.run(debug=True)