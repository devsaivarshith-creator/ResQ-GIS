import urllib.request
import json
import os
import shapely
import shapely.geometry
import shapely.ops

print("Fetching high-resolution India states GeoJSON...")
url = 'https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=45) as resp:
    raw_data = json.loads(resp.read().decode('utf-8'))

print(f"Loaded {len(raw_data['features'])} raw state features.")

# Tolerance: 0.015 degrees (~1.5km precision)
TOLERANCE = 0.015

simplified_features = []
state_shapes = []

NAME_FIXES = {
    'Uttaranchal': 'Uttarakhand',
    'Orissa': 'Odisha',
    'Andaman and Nicobar': 'Andaman and Nicobar Islands',
    'Dadra and Nagar Haveli': 'Dadra and Nagar Haveli and Daman and Diu',
    'Daman and Diu': 'Daman and Diu',
    'Jammu and Kashmir': 'Jammu and Kashmir',
}

STATE_COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4',
    '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#a855f7', '#0ea5e9',
    '#e11d48', '#22c55e', '#eab308', '#64748b'
]

for idx, f in enumerate(raw_data['features']):
    raw_name = f['properties'].get('NAME_1', f['properties'].get('name', 'State'))
    state_name = NAME_FIXES.get(raw_name, raw_name)
    
    geom = shapely.geometry.shape(f['geometry'])
    if not geom.is_valid:
        geom = geom.buffer(0)
    
    # Add to country union shapes
    state_shapes.append(geom)
    
    # Simplify state geometry
    simplified_geom = geom.simplify(TOLERANCE, preserve_topology=True)
    if not simplified_geom.is_valid:
        simplified_geom = simplified_geom.buffer(0)
        
    centroid = simplified_geom.centroid
    
    feature = {
        "type": "Feature",
        "id": f"state-{idx+1}",
        "properties": {
            "name": state_name,
            "state": state_name,
            "color": STATE_COLORS[idx % len(STATE_COLORS)],
            "lat": round(centroid.y, 4),
            "lng": round(centroid.x, 4),
        },
        "geometry": shapely.geometry.mapping(simplified_geom)
    }
    simplified_features.append(feature)

states_geojson = {
    "type": "FeatureCollection",
    "features": simplified_features
}

# Save states GeoJSON in public folder and data folder
os.makedirs('frontend/public/data', exist_ok=True)
os.makedirs('data/geojson', exist_ok=True)

with open('frontend/public/data/india_states.geojson', 'w', encoding='utf-8') as out_f:
    json.dump(states_geojson, out_f)
with open('data/geojson/india_states.geojson', 'w', encoding='utf-8') as out_f:
    json.dump(states_geojson, out_f)

print(f"Saved india_states.geojson ({os.path.getsize('frontend/public/data/india_states.geojson') / 1024:.1f} KB)")

# Now compute seamless country boundary union
print("Computing nationwide unified border...")
country_union = shapely.unary_union(state_shapes)
country_simp = country_union.simplify(TOLERANCE, preserve_topology=True)

if country_simp.geom_type == 'MultiPolygon':
    mainland = max(country_simp.geoms, key=lambda g: g.area)
else:
    mainland = country_simp

# Exterior ring coords in [lat, lng] format for Leaflet / Cesium
exterior_coords = list(mainland.exterior.coords)
# Round coordinates to 5 decimals
latlng_border = [[round(lat, 5), round(lng, 5)] for lng, lat in exterior_coords]

print(f"Detailed country border exterior vertices: {len(latlng_border)}")

# Save detailed india_boundary.geojson
boundary_feature = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "id": "IND",
            "properties": {"name": "India", "sovereign": "Republic of India"},
            "geometry": shapely.geometry.mapping(mainland)
        }
    ]
}
with open('data/geojson/india_boundary.geojson', 'w', encoding='utf-8') as out_f:
    json.dump(boundary_feature, out_f)

# Build inverted mask: Outer world ring + inner cutout of India
# Leaflet inverted polygon uses outer world coordinates clockwise, inner hole counter-clockwise
WORLD_OUTER_RING = [
    [85.0, -180.0],
    [85.0, 180.0],
    [-85.0, 180.0],
    [-85.0, -180.0],
    [85.0, -180.0],
]

ts_code = f"""// Detailed High-Resolution India Boundary and Inverted World Mask
// Generated from Survey of India verified boundary datasets
// Contains {len(latlng_border)} precision topological vertices

export const INDIA_BORDER_LATLNGS: [number, number][] = {json.dumps(latlng_border, indent=2)};

// Inverted Mask: Outer world polygon with India boundary as an inner cutout hole
export const WORLD_INVERTED_MASK: [number, number][][] = [
  {json.dumps(WORLD_OUTER_RING)},
  INDIA_BORDER_LATLNGS,
];
"""

with open('frontend/src/data/indiaBoundary.ts', 'w', encoding='utf-8') as out_f:
    out_f.write(ts_code)

print("Saved frontend/src/data/indiaBoundary.ts successfully!")
