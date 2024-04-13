from flask import Flask, render_template

app = Flask(__name__)


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

@app.route("/alpine")
def folium():
    return render_template("pages/alpinetest.html")

if __name__ == "__main__":
    app.run(debug=True)