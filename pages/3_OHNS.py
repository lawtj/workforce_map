import streamlit as st
import pandas as pd
import numpy as np
import folium
import geopandas as gpd
from streamlit_folium import st_folium
from streamlit_extras.row import row 
import branca.colormap as cm
from nav import insert_nav


st.set_page_config(page_title='OHNS', page_icon=':ear:', layout='wide', initial_sidebar_state='collapsed')

@st.cache_data
def read_country():
    country = gpd.read_file('data/ohns_country.geojson')
    return country

country = read_country()
attr = 'Tiles Courtesy of Jawg Maps'
tiles = 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png'
def ohnsmap(country):
    min_value = pd.to_numeric(country['Oral, Head & Neck Surgeons per Capita'],errors='coerce').min()
    # max_value = pd.to_numeric(country['Oral, Head & Neck Surgeons per Capita'], errors='coerce').max()
    max_value = 11.24
    country['Oral, Head & Neck Surgeons per Capita'] = country['Oral, Head & Neck Surgeons per Capita'].fillna('No data')
    country['Oral, Head, & Neck Surgeons'] = country['Oral, Head, & Neck Surgeons'].fillna('No data')
    linear = cm.linear.GnBu_07.scale(min_value, max_value)
    linear.caption = 'OHNS density per 100,000 population'

    def style_function(x):
        if isinstance(x['properties']['Oral, Head & Neck Surgeons per Capita'], float) or isinstance(x['properties']['Oral, Head & Neck Surgeons per Capita'], int):
            return {'fillColor': linear(x['properties']['Oral, Head & Neck Surgeons per Capita']), 'color': 'black', 'weight': 1, 'fillOpacity': 1}
        else:
            return {'color': 'black', 'weight': 1, 'fillOpacity': 0.1}
    m = folium.Map(location=[45, -20], zoom_start=2, tiles=tiles, attr=attr)
    ohns = folium.GeoJson(country, name='ohns',
                                style_function=style_function,
                                    highlight_function=lambda x: {'weight': 3,},
                                    tooltip=folium.features.GeoJsonTooltip(fields=['NAME_LONG', 'Oral, Head, & Neck Surgeons', 'Oral, Head & Neck Surgeons per Capita'], aliases=['Country: ', 'Number of OHNS Providers: ', 'Density of OHNS per 100,000: '])
                                ).add_to(m)
    
    linear.add_to(m)
    st.session_state['entmap'] = m

    return m

############################################################################################################
insert_nav()
left,center, right = st.columns([1, 3,1])
with left:
    st.write('')

with center:
    st.title('Global ENT/OHNS Workforce')

    st.markdown('''
                The Global OHNS initiative performed a recent study quantifying the number of otolaryngology-head and neck surgery (OHNS) care clinicians per capita worldwide. This was done by disseminating a cross-sectional electronic survey to professional society leaders, medical licensing boards, public health officials, and practicing OHNS clinicians. 
                
                Respondents from 114 countries comprising 84% of the world population estimate a workforce density of 2.19 OHNS clinicians per 100 000 population. Variations were noted by World Health Organization regions and World Bank income groups. 
                
                This cross-sectional survey study provides a comprehensive assessment of the global OHNS workforce. These results can guide focused investment in training and policy development to address disparities in the availability of OHNS clinicians. 
                
                Below are interactive maps to display the results from this study. 
                    ''')
    
    st.caption('Petrucci, Beatriz, Samuel Okerosi, Rolvix H. Patterson, Sara B. Hobday, Valerie Salano, Christopher J. Waterworth, Robert M. Brody, et al. 2023. [“The Global Otolaryngology-Head and Neck Surgery Workforce.”](https://jamanetwork.com/journals/jamaotolaryngology/fullarticle/2808978) JAMA Otolaryngology-- Head & Neck Surgery, August. https://doi.org/10.1001/jamaoto.2023.2339.')

    ohnsmap = ohnsmap(country)

    st_folium(ohnsmap, use_container_width=True, returned_objects=[])

with right:
    st.write('')