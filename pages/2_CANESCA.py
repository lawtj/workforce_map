import streamlit as st
import pandas as pd
import numpy as np
import folium
import geopandas as gpd
from streamlit_folium import st_folium
from folium.plugins import MarkerCluster
from streamlit_extras.row import row 

st.set_page_config(page_title='CANESCA', page_icon=':earth_americas:', layout='wide', initial_sidebar_state='collapsed')

@st.cache_data
def read_gdf():
    gdf = gpd.read_file('data/geodf.geojson')
    return gdf

@st.cache_data
def read_csv():
    can = pd.read_csv('data/canesca.csv')
    return can

def canescamap():
    m = folium.Map(location=[-10, 30], zoom_start=4.5)

    attr = 'Tiles Courtesy of Stadia'
    tiles = 'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png'

    tile_layer = folium.TileLayer(
    tiles=tiles,
    attr=attr,
    name='Jawg Light',
    overlay=False,
    control=False,

    ).add_to(m)


    marker_cluster = MarkerCluster().add_to(m)

    can = read_csv()



    # folium.GeoJson(can).add_to(m)

    for i in can['Longitude'].unique():
        if pd.notnull(i):
            folium.Marker(location=[can[can['Longitude'] == i]['Latitude'].values[0], i], 
                          tooltip=folium.Tooltip(can[can['Longitude']==i]['PRIMARY_ORGANISATION'].values[0])
                          ).add_to(marker_cluster)
    return m


#######################################################################################
row1 = row([.1,.1,.8])

row1.page_link('gaws.py',label='Anesthesia Workforce')
row1.page_link('pages/2_CANESCA.py',label='Anesthesiologists in East, Central and Southern Africa')



st.title('Anesthesiologists in East, Central and Southern Africa')


st_folium(canescamap(),use_container_width=True)

# st.dataframe(pd.DataFrame(read_gdf()))
st.write(read_csv())