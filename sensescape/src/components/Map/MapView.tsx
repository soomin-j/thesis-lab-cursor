'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAppStore } from '@/lib/store';
import { MOCK_LOCATIONS } from '@/data/mock-locations';
import { getRecommendedLocations } from '@/lib/mood-matching';

// Fix for default marker icon
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

export default function MapView() {
    useEffect(() => {
        // Client-side only fix
        (async () => {
             // @ts-ignore
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl,
                iconUrl,
                shadowUrl,
            });
        })();
    }, []);

    const { currentMood } = useAppStore();
    const [filteredLocations, setFilteredLocations] = useState(MOCK_LOCATIONS);

    useEffect(() => {
        setFilteredLocations(getRecommendedLocations(currentMood, MOCK_LOCATIONS));
    }, [currentMood]);

    // Custom map controller to fit bounds
    function MapController() {
        const map = useMap();
        useEffect(() => {
             if (filteredLocations.length > 0) {
                // Create bounds from points
                const bounds = L.latLngBounds(filteredLocations.map(l => l.position));
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
            }
        }, [filteredLocations, map]);
        return null;
    }

    return (
        <MapContainer 
            center={[40.7580, -73.9855]} 
            zoom={13} 
            className="w-full h-full rounded-3xl shadow-inner z-0"
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {filteredLocations.map(loc => (
                <Marker key={loc.id} position={loc.position}>
                    <Popup>
                        <div className="p-2 min-w-[200px]">
                            <h3 className="font-bold text-lg mb-1">{loc.name}</h3>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded-full border border-slate-200 uppercase tracking-wide">{loc.category}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3 leading-relaxed">{loc.description}</p>
                            <div className="flex gap-1 flex-wrap">
                                {loc.sensory.vibe.map(v => (
                                    <span key={v} className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">#{v}</span>
                                ))}
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
            <MapController />
        </MapContainer>
    );
}

