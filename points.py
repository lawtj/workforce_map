import geopandas as gpd
import pandas as pd
from shapely.geometry import Point


df = gpd.read_file('data/canesca.csv')

print(df.head())

def get_points(row):
    if pd.notnull(row['Latitude']) and pd.notnull(row['Longitude']):
        lat = row['Latitude']
        lon = row['Longitude']
        prim = row['PRIMARY_ORGANISATION']
        try:
            Point(lon, lat)
        except:
            print(f"Error with {prim}")
            print(f"Latitude: {lat}")
            print(f"Longitude: {lon}")

df['geometry'] = df.apply(get_points, axis=1)