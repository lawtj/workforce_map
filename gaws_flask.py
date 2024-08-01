from flask import Flask, render_template, redirect, url_for, flash, request
import akismet
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
akismet_api_key = os.getenv('AKISMET_API_KEY')



app = Flask(__name__)
app.config['SECRET_KEY'] = apprise_key  # Change this to your actual secret key


iframe_routes = ['gaws_iframe', 'canesca_iframe', 'ohns_iframe','wfns_iframe']


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

# Set Content-Security-Policy header
@app.after_request
def add_header(response):
    response.headers['Content-Security-Policy'] = "frame-ancestors 'self' https://wfsahq.org"
    return response


@app.route("/<iframe_name>")
def render_iframe(iframe_name):
    if iframe_name in iframe_routes:
        return render_template(f"iframes/{iframe_name}.html")
    else:
        return "Invalid route", 404

@app.route("/")
def bulma():
    return render_template("pages/home.html")

@app.route("/about")
def about():
    return render_template("pages/about.html")

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

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    form = ContactForm()
    if form.validate_on_submit():
        with akismet.SyncClient() as akismet_client:
            is_spam = akismet_client.comment_check(
                user_ip=request.remote_addr,
                user_agent=request.headers.get('User-Agent'),
                comment_content=form.message.data,
                comment_type='contact-form',
                comment_author=form.name.data,
                comment_author_email=form.email.data
            )
            if is_spam:
                flash('Spam detected!', 'danger')
                return redirect(url_for('contact'))
            else:
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