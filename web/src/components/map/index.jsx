import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import './style.css';

export const iconMark = L.icon({
  iconSize: [25, 41],
  iconAnchor: [13.5, 35],
  popupAnchor: [0, -35],
  iconUrl: 'https://unpkg.com/leaflet@1.6/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.6/dist/images/marker-shadow.png',
});

export default function Map(props) {
  const mapStyle = {
    width: props.width ?? '100%',
    height: props.height ?? '100%',
    position: props.position ?? 'absolute',
    top: props.top ?? '0',
    bottom: props.bottom ?? '0',
    left: props.left ?? '0',
    right: props.right ?? '0',
  };

  return (
    <MapContainer
      center={{ lat: props.centerLat ?? props.lat ?? 21.030653, lng: props.centerLng ?? props.lng ?? 105.84713 }}
      zoom={props.zoom ?? 15}
      scrollWheelZoom={props.scrollWheelZoom ?? false}
      style={mapStyle}
      className="rounded-1"
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        url="https://api.mapbox.com/styles/v1/einestimono2/cl49q1ljv000m14mivjy4e517/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZWluZXN0aW1vbm8yIiwiYSI6ImNsM21rcWFycTA1cXkzamwybDl6emFoZ2YifQ.Bjm6A8tfXJU1mC9XFbXLTA"
      />

      {props.lat && props.lng && (
        <Marker position={[props.lat, props.lng]} icon={iconMark}>
          <Popup>
            <div className="w-50">{props.theater.name}</div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
