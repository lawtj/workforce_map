from flask import Flask, render_template, redirect, url_for, flash
from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SelectField, SubmitField
from wtforms.validators import DataRequired, Email
# from redcap import Project, RedcapError
import os
import apprise
from flask import Flask
from flask_talisman import Talisman 

apobj = apprise.Apprise()

# import dot env and load
from dotenv import load_dotenv
load_dotenv()
apprise_key = os.getenv('apprise_key')



app = Flask(__name__)
app.config['SECRET_KEY'] = 'its-an-workforce-appppp'  # Change this to your actual secret key

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


class ContactForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    inquiry_type = SelectField('Inquiry Type', choices=[
        ('', "What's this about?"),
        ('maps', 'Global Anesthesia Workforce Map'),
        ('data_contribution', 'COSECSA Anesthesiologist Map'),
        ('correction', 'OHNS/ENT Workforce Map'),
        ('contribute', 'I want to contribute data'),
        ('other', 'Something else!')
    ], validators=[DataRequired()])
    message = TextAreaField('Message', validators=[DataRequired()])
    submit = SubmitField('Send Message')




@app.route("/<iframe_name>")
def render_iframe(iframe_name):
    if iframe_name in iframe_routes:
        return render_template(f"iframes/{iframe_name}.html")
    else:
        return "Invalid route", 404

@app.route("/")
def bulma():
    return render_template("pages/home.html")

@app.route("/gaws")
def gaws():
    return render_template("pages/gaws.html")

@app.route("/canesca")
def CANESCA():
    return render_template("pages/canesca.html")

@app.route("/ohns")
def OHNS():
    return render_template("pages/ohns.html")

@app.route('/wfns')
def WFNS():
    return render_template('pages/wfns.html')

@app.route("/ohns_colors")
def folium():
    return render_template("pages/ohnsv2.html", sequential_color_schemes=sequential_color_schemes)

@app.route("/jsontest")
def jsontest():
    return render_template("index.html")

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    form = ContactForm()
    if form.validate_on_submit():
        apobj.add('slack://'+apprise_key+'?footer=no')
        apobj.notify(title='Workforce Map Contact Submission', body='Name: '+form.name.data+'\nEmail: '+form.email.data+'\nInquiry Type: '+form.inquiry_type.data+'\nMessage: '+form.message.data)
        flash('Thank you for your message. We will get back to you soon!', 'success')

        return redirect(url_for('contact'))
    return render_template('pages/contact.html', form=form)

if os.getenv('local_testing'):
    pass
else:
    print('talisman activated')
    Talisman(app, content_security_policy=None)

if __name__ == "__main__":
    app.run(debug=True)