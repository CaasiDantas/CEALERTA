"use client"
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';
import { ExternalLink, Trash2, Clock, FileText } from 'lucide-react';

import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import 'leaflet.heat';

const getIcon = (type: string) => {
  let color = '#EAB308'; 
  if (type.includes('Roubo') || type.includes('Ameaça')) color = '#EF4444';
  if (type.includes('Furto') || type.includes('Dano')) color = '#F97316';
  if (type.includes('Preconceito') || type.includes('Injúria')) color = '#A855F7';
  if (type.includes('Desaparecimento')) color = '#3B82F6';

  return L.divIcon({
    className: 'custom-waze-pin',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        <div style="transform: rotate(45deg); color: white; font-weight: bold; font-size: 16px;">!</div>
      </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

function MapEvents({ onMapClick }: { onMapClick: (latlng: any) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

function SearchField() {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const provider = new OpenStreetMapProvider();
    // @ts-ignore
    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar', 
      position: 'topright',
      showMarker: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
      searchLabel: 'Para onde vamos?', 
    });
    map.addControl(searchControl);
    return () => { map.removeControl(searchControl); };
  }, [map]);
  return null;
}

function HeatmapLayer({ points }: { points: any[] }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !points || points.length === 0) return;
    const heatData = points.map(p => [p.latitude, p.longitude, p.risk_score || 1]);
    // @ts-ignore
    const heatLayer = L.heatLayer(heatData, {
      radius: 25, blur: 15, maxZoom: 17,
      gradient: { 0.4: 'blue', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red' }
    }).addTo(map);
    return () => { if (map && heatLayer) map.removeLayer(heatLayer); };
  }, [map, points]);
  return null;
}

export default function Map({ incidents, onMapClick, user, onDelete }: any) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return <div style={{ height: '100%', background: '#f3f4f6' }} />;

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer 
        center={[-3.7319, -38.5267]} 
        zoom={16} 
        zoomControl={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer 
          url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          attribution='© Google Maps'
        />

        <SearchField />
        <MapEvents onMapClick={onMapClick} />

        {incidents.map((inc: any) => (
          <Marker key={inc.id} position={[inc.latitude, inc.longitude]} icon={getIcon(inc.type)}>
            <Tooltip direction="top" offset={[0, -40]} opacity={0.9}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>{inc.type}</span><br/>
                <span style={{ fontSize: '10px' }}>{formatDateTime(inc.created_at)}</span>
              </div>
            </Tooltip>
            <Popup>
              <div style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif', minWidth: '180px', padding: '5px' }}>
                <b style={{ fontSize: '16px', color: '#111827', display: 'block', marginBottom: '2px' }}>{inc.type}</b>
                
                <div style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', 
                  fontSize: '11px', color: '#6b7280', marginBottom: '12px' 
                }}>
                  <Clock size={12} /> {formatDateTime(inc.created_at)}
                </div>
                
                <a 
                  href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${inc.latitude},${inc.longitude}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    backgroundColor: '#4285F4', color: 'white', textDecoration: 'none',
                    borderRadius: '8px', padding: '10px', marginBottom: '8px',
                    fontWeight: '700', fontSize: '12px', transition: '0.2s'
                  }}
                >
                  <ExternalLink size={14} /> VISÃO 360°
                </a>

                <a 
                  href="https://www.delegaciaeletronica.ce.gov.br/beo/del_vir_new.jsp"
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    backgroundColor: '#10b981', color: 'white', textDecoration: 'none',
                    borderRadius: '8px', padding: '10px', marginBottom: '8px',
                    fontWeight: '700', fontSize: '12px', transition: '0.2s'
                  }}
                >
                  <FileText size={14} /> REGISTRAR B.O. ONLINE
                </a>

                {user && user.id === inc.user_id && (
                  <button 
                    onClick={() => onDelete(inc.id)}
                    style={{ 
                      backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', 
                      borderRadius: '8px', padding: '8px', cursor: 'pointer', 
                      fontWeight: '700', fontSize: '11px', width: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                    }}
                  >
                    <Trash2 size={12} /> REMOVER
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}