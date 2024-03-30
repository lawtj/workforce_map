from streamlit_extras.row import row 
import streamlit as st

def insert_nav():
    row1 = row([1,2,2,3])
    row1.page_link('pages/1_gaws.py',label='Anesthesia Workforce')
    row1.page_link('pages/2_CANESCA.py',label='Anesthesiologists in East, Central and Southern Africa')
    row1.page_link('pages/3_OHNS.py',label='OHNS Workforce')