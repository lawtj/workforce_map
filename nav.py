from streamlit_extras.row import row 
import streamlit as st

def insert_nav():
    row1 = row([.2,.2,.3,.3,])
    row1.page_link('app.py',label='🏠 Home')
    row1.page_link('pages/1_gaws.py',label='🌍 Global Anesthesia Workforce')
    row1.page_link('pages/2_CANESCA.py',label='😷 Anesthesiologists in East, Central and Southern Africa')
    row1.page_link('pages/3_OHNS.py',label='👂 Global ENT/OHNS Workforce')