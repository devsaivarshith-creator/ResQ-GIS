import type { Habitation } from '../types';

// Calculated using exact mathematical Risk Score formula:
// R_i = [sum(w_k * H_ik)] * E_i * V_i
// where H_ik in [0, 1], sum(w_k) = 1, E_i in [0, 1], V_i in [0, 1], R_i in [0, 1]
export const DEMO_HABITATIONS: Habitation[] = [
  {
    "id": "hab-joshimath",
    "name": "Joshimath Town",
    "district": "Chamoli",
    "state": "Uttarakhand",
    "region": "Western Himalayas",
    "block": "Joshimath",
    "location": {
      "lat": 30.555,
      "lng": 79.566,
      "elevation": 1890
    },
    "population": 4213,
    "households": 892,
    "riskScore": 0.5906,
    "riskLevel": "CRITICAL",
    "hazardExposure": [
      {
        "type": "landslide",
        "level": "CRITICAL",
        "score": 0.92,
        "contributors": [
          "Active tectonic subsidence",
          "Overburden moraine creep",
          "Steep slope gradient (34\u00b0)"
        ]
      },
      {
        "type": "flood",
        "level": "HIGH",
        "score": 0.72,
        "contributors": [
          "Alaknanda toe erosion",
          "Drainage saturation anomaly"
        ]
      },
      {
        "type": "glof",
        "level": "MODERATE",
        "score": 0.58,
        "contributors": [
          "Upstream Dhauliganga glacial basins"
        ]
      },
      {
        "type": "earthquake",
        "level": "HIGH",
        "score": 0.75,
        "contributors": [
          "Seismic Zone V",
          "Main Central Thrust (MCT) proximity"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.84,
      "level": "CRITICAL",
      "exposure": 0.88,
      "sensitivity": 0.82,
      "adaptiveCapacity": 0.28
    },
    "recommendedAction": "Immediate phased relocation to Pipalkoti Safe Enclave",
    "nearestRelocationSite": "site-pipalkoti"
  },
  {
    "id": "hab-marwari",
    "name": "Marwari / Sunil",
    "district": "Chamoli",
    "state": "Uttarakhand",
    "region": "Western Himalayas",
    "block": "Joshimath",
    "location": {
      "lat": 30.542,
      "lng": 79.558,
      "elevation": 1750
    },
    "population": 1850,
    "households": 410,
    "riskScore": 0.4526,
    "riskLevel": "HIGH",
    "hazardExposure": [
      {
        "type": "landslide",
        "level": "HIGH",
        "score": 0.84,
        "contributors": [
          "Alaknanda riverbed scouring",
          "Percolation crack acceleration"
        ]
      },
      {
        "type": "flood",
        "level": "MODERATE",
        "score": 0.62,
        "contributors": [
          "Flash flood canyon proximity"
        ]
      },
      {
        "type": "earthquake",
        "level": "HIGH",
        "score": 0.75,
        "contributors": [
          "Seismic Zone V"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.76,
      "level": "HIGH",
      "exposure": 0.8,
      "sensitivity": 0.74,
      "adaptiveCapacity": 0.32
    },
    "recommendedAction": "Stage-1 evacuation transit via NH-7 lifeline",
    "nearestRelocationSite": "site-pipalkoti"
  },
  {
    "id": "hab-reni",
    "name": "Reni Village",
    "district": "Chamoli",
    "state": "Uttarakhand",
    "region": "Western Himalayas",
    "block": "Joshimath",
    "location": {
      "lat": 30.49,
      "lng": 79.702,
      "elevation": 2150
    },
    "population": 420,
    "households": 95,
    "riskScore": 0.7492,
    "riskLevel": "CRITICAL",
    "hazardExposure": [
      {
        "type": "glof",
        "level": "CRITICAL",
        "score": 0.95,
        "contributors": [
          "Rishi Ganga catastrophic debris flood track",
          "Glacial lake breach trajectory"
        ]
      },
      {
        "type": "landslide",
        "level": "HIGH",
        "score": 0.88,
        "contributors": [
          "Unconsolidated scree slope",
          "Thermal permafrost degradation"
        ]
      },
      {
        "type": "flood",
        "level": "CRITICAL",
        "score": 0.9,
        "contributors": [
          "Steep gorge hydraulic damming"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.89,
      "level": "CRITICAL",
      "exposure": 0.94,
      "sensitivity": 0.88,
      "adaptiveCapacity": 0.2
    },
    "recommendedAction": "Mandatory zero-hour evacuation to Chamoli Stadium Safe Haven",
    "nearestRelocationSite": "site-chamoli-town"
  },
  {
    "id": "hab-kedarnath-rambara",
    "name": "Rambara / Gaurikund Corridor",
    "district": "Rudraprayag",
    "state": "Uttarakhand",
    "region": "Western Himalayas",
    "block": "Ukhimath",
    "location": {
      "lat": 30.632,
      "lng": 79.062,
      "elevation": 1980
    },
    "population": 1140,
    "households": 230,
    "riskScore": 0.6215,
    "riskLevel": "CRITICAL",
    "hazardExposure": [
      {
        "type": "flood",
        "level": "CRITICAL",
        "score": 0.91,
        "contributors": [
          "Mandakini violent channel surge",
          "Chorabari moraine runoff path"
        ]
      },
      {
        "type": "landslide",
        "level": "HIGH",
        "score": 0.86,
        "contributors": [
          "Steep alluvial fan collapse",
          "Heavy precipitation funnel"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.81,
      "level": "CRITICAL",
      "exposure": 0.87,
      "sensitivity": 0.79,
      "adaptiveCapacity": 0.25
    },
    "recommendedAction": "Rapid descent to Tilwara Elevated Haven",
    "nearestRelocationSite": "site-tilwara"
  },
  {
    "id": "hab-kullu-old-manali",
    "name": "Old Manali & Aleo",
    "district": "Kullu",
    "state": "Himachal Pradesh",
    "region": "Northern Himalayas",
    "block": "Manali",
    "location": {
      "lat": 32.251,
      "lng": 77.182,
      "elevation": 2050
    },
    "population": 3450,
    "households": 780,
    "riskScore": 0.5341,
    "riskLevel": "CRITICAL",
    "hazardExposure": [
      {
        "type": "flood",
        "level": "HIGH",
        "score": 0.87,
        "contributors": [
          "Beas River flash surge",
          "Manalsu Nala cloudburst overflow"
        ]
      },
      {
        "type": "landslide",
        "level": "HIGH",
        "score": 0.79,
        "contributors": [
          "Steep slope debris movement",
          "High tourist influx vulnerability"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.78,
      "level": "HIGH",
      "exposure": 0.83,
      "sensitivity": 0.75,
      "adaptiveCapacity": 0.36
    },
    "recommendedAction": "Evacuate riverbank settlements to Dhalpur Disaster Enclave",
    "nearestRelocationSite": "site-kullu-dhalpur"
  },
  {
    "id": "hab-mandi-pandoh",
    "name": "Pandoh Slopes & Aut",
    "district": "Mandi",
    "state": "Himachal Pradesh",
    "region": "Northern Himalayas",
    "block": "Mandi Sadar",
    "location": {
      "lat": 31.67,
      "lng": 77.05,
      "elevation": 890
    },
    "population": 2900,
    "households": 620,
    "riskScore": 0.4715,
    "riskLevel": "HIGH",
    "hazardExposure": [
      {
        "type": "landslide",
        "level": "HIGH",
        "score": 0.83,
        "contributors": [
          "Hillside cutting destabilization",
          "Saturated mica-schist sliding"
        ]
      },
      {
        "type": "flood",
        "level": "HIGH",
        "score": 0.8,
        "contributors": [
          "Pandoh reservoir discharge overflow",
          "Beas flood channel"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.74,
      "level": "HIGH",
      "exposure": 0.78,
      "sensitivity": 0.72,
      "adaptiveCapacity": 0.35
    },
    "recommendedAction": "Relocate low-lying households to Paddal Safe Complex",
    "nearestRelocationSite": "site-mandi-paddal"
  },
  {
    "id": "hab-chooralmala",
    "name": "Chooralmala",
    "district": "Wayanad",
    "state": "Kerala",
    "region": "Western Ghats",
    "block": "Vythiri",
    "location": {
      "lat": 11.536,
      "lng": 76.177,
      "elevation": 920
    },
    "population": 3890,
    "households": 860,
    "riskScore": 0.8332,
    "riskLevel": "CRITICAL",
    "hazardExposure": [
      {
        "type": "landslide",
        "level": "CRITICAL",
        "score": 0.98,
        "contributors": [
          "Vellarimala slope failure track",
          "572mm 48h extreme monsoon downpour",
          "Pebble & boulder slurry flow"
        ]
      },
      {
        "type": "flood",
        "level": "CRITICAL",
        "score": 0.92,
        "contributors": [
          "Iruvanipuzha river violent avulsion",
          "Bridge structural washouts"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.91,
      "level": "CRITICAL",
      "exposure": 0.96,
      "sensitivity": 0.89,
      "adaptiveCapacity": 0.18
    },
    "recommendedAction": "Urgent zero-hour total evacuation to Meppadi Community Complex",
    "nearestRelocationSite": "site-meppadi-campus"
  },
  {
    "id": "hab-mundakkai",
    "name": "Mundakkai Tea Hamlet",
    "district": "Wayanad",
    "state": "Kerala",
    "region": "Western Ghats",
    "block": "Vythiri",
    "location": {
      "lat": 11.548,
      "lng": 76.195,
      "elevation": 1040
    },
    "population": 2150,
    "households": 490,
    "riskScore": 0.8497,
    "riskLevel": "CRITICAL",
    "hazardExposure": [
      {
        "type": "landslide",
        "level": "CRITICAL",
        "score": 0.99,
        "contributors": [
          "Crown blowout landslide origin",
          "Steep estate tea plantation collapse"
        ]
      },
      {
        "type": "flood",
        "level": "HIGH",
        "score": 0.88,
        "contributors": [
          "Debris flow channel blockage and dam break"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.93,
      "level": "CRITICAL",
      "exposure": 0.97,
      "sensitivity": 0.92,
      "adaptiveCapacity": 0.15
    },
    "recommendedAction": "Immediate air and lifeline evacuation to Kalpetta Municipal Stadium",
    "nearestRelocationSite": "site-kalpetta-stadium"
  },
  {
    "id": "hab-munnar-rajamalai",
    "name": "Rajamalai / Pettimudi",
    "district": "Idukki",
    "state": "Kerala",
    "region": "Western Ghats",
    "block": "Devikulam",
    "location": {
      "lat": 10.15,
      "lng": 77.018,
      "elevation": 1650
    },
    "population": 1720,
    "households": 380,
    "riskScore": 0.5575,
    "riskLevel": "CRITICAL",
    "hazardExposure": [
      {
        "type": "landslide",
        "level": "CRITICAL",
        "score": 0.9,
        "contributors": [
          "Steep granitic escarpment failure",
          "Gravel wash and lineament slip"
        ]
      },
      {
        "type": "flood",
        "level": "MODERATE",
        "score": 0.65,
        "contributors": [
          "Periyar tributary torrents"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.82,
      "level": "CRITICAL",
      "exposure": 0.86,
      "sensitivity": 0.8,
      "adaptiveCapacity": 0.24
    },
    "recommendedAction": "Priority relocation to Adimali High School Refuge",
    "nearestRelocationSite": "site-adimali-haven"
  },
  {
    "id": "hab-kuttanad-champakulam",
    "name": "Champakulam / Kuttanad",
    "district": "Alappuzha",
    "state": "Kerala",
    "region": "Coastal Plains",
    "block": "Champakulam",
    "location": {
      "lat": 9.408,
      "lng": 76.418,
      "elevation": -1.5
    },
    "population": 4800,
    "households": 1120,
    "riskScore": 0.5951,
    "riskLevel": "CRITICAL",
    "hazardExposure": [
      {
        "type": "flood",
        "level": "CRITICAL",
        "score": 0.92,
        "contributors": [
          "Below sea-level geographic basin",
          "Pamba & Achankovil monsoon discharge surge",
          "Tidal barrier holding capacity breach"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.77,
      "level": "HIGH",
      "exposure": 0.84,
      "sensitivity": 0.75,
      "adaptiveCapacity": 0.38
    },
    "recommendedAction": "Staged boat convoy transit to Alappuzha Elevated Stilt Shelter",
    "nearestRelocationSite": "site-alappuzha-elevated"
  },
  {
    "id": "hab-amalapuram-island",
    "name": "Razole Island Hamlets",
    "district": "Dr. B.R. Ambedkar Konaseema",
    "state": "Andhra Pradesh",
    "region": "Eastern Coastal Plains",
    "block": "Razole",
    "location": {
      "lat": 16.48,
      "lng": 81.835,
      "elevation": 3.2
    },
    "population": 5200,
    "households": 1250,
    "riskScore": 0.5695,
    "riskLevel": "CRITICAL",
    "hazardExposure": [
      {
        "type": "flood",
        "level": "CRITICAL",
        "score": 0.94,
        "contributors": [
          "Godavari estuary surge (4.5m wave crest)",
          "Low-lying delta bund breach risk"
        ]
      },
      {
        "type": "glof",
        "level": "LOW",
        "score": 0.1,
        "contributors": []
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.84,
      "level": "CRITICAL",
      "exposure": 0.9,
      "sensitivity": 0.82,
      "adaptiveCapacity": 0.26
    },
    "recommendedAction": "Pre-emptive evacuation to Amalapuram Multi-Purpose Cyclone Shelter",
    "nearestRelocationSite": "site-amalapuram-mpcs"
  },
  {
    "id": "hab-bheemunipatnam",
    "name": "Bheemunipatnam Coast",
    "district": "Visakhapatnam",
    "state": "Andhra Pradesh",
    "region": "Eastern Coastal Plains",
    "block": "Bheemunipatnam",
    "location": {
      "lat": 17.89,
      "lng": 83.45,
      "elevation": 6
    },
    "population": 4300,
    "households": 980,
    "riskScore": 0.5164,
    "riskLevel": "CRITICAL",
    "hazardExposure": [
      {
        "type": "flood",
        "level": "HIGH",
        "score": 0.85,
        "contributors": [
          "Very Severe Cyclonic Storm landfall zone",
          "High-energy storm tide breach"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.75,
      "level": "HIGH",
      "exposure": 0.81,
      "sensitivity": 0.72,
      "adaptiveCapacity": 0.38
    },
    "recommendedAction": "Transit coastal population to Swarna Bharathi Indoor Stadium",
    "nearestRelocationSite": "site-vizag-indoor"
  },
  {
    "id": "hab-majuli-kamalabari",
    "name": "Kamalabari / Salmora",
    "district": "Majuli",
    "state": "Assam",
    "region": "Brahmaputra Basin",
    "block": "Majuli",
    "location": {
      "lat": 26.96,
      "lng": 94.22,
      "elevation": 84
    },
    "population": 4600,
    "households": 940,
    "riskScore": 0.8026,
    "riskLevel": "CRITICAL",
    "hazardExposure": [
      {
        "type": "flood",
        "level": "CRITICAL",
        "score": 0.96,
        "contributors": [
          "Brahmaputra discharge >50,000 cumecs",
          "Severe river island bank cutting erosion",
          "Submergence of earthen dykes"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.88,
      "level": "CRITICAL",
      "exposure": 0.95,
      "sensitivity": 0.86,
      "adaptiveCapacity": 0.22
    },
    "recommendedAction": "Immediate river ferry evacuation to Jorhat District Stadium Enclave",
    "nearestRelocationSite": "site-jorhat-stadium"
  },
  {
    "id": "hab-silchar-meherpur",
    "name": "Meherpur & Rangirkhari",
    "district": "Cachar",
    "state": "Assam",
    "region": "Barak Valley",
    "block": "Silchar",
    "location": {
      "lat": 24.81,
      "lng": 92.8,
      "elevation": 26
    },
    "population": 6200,
    "households": 1400,
    "riskScore": 0.687,
    "riskLevel": "CRITICAL",
    "hazardExposure": [
      {
        "type": "flood",
        "level": "CRITICAL",
        "score": 0.93,
        "contributors": [
          "Barak River Bethukandi dyke breach track",
          "Catastrophic urban basin submergence (up to 3.5m deep)"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.83,
      "level": "CRITICAL",
      "exposure": 0.89,
      "sensitivity": 0.81,
      "adaptiveCapacity": 0.3
    },
    "recommendedAction": "Relocate families to Silchar Government Polytechnic Refuge",
    "nearestRelocationSite": "site-silchar-polytech"
  },
  {
    "id": "hab-chungthang",
    "name": "Chungthang Town",
    "district": "Mangan",
    "state": "Sikkim",
    "region": "Eastern Himalayas",
    "block": "Chungthang",
    "location": {
      "lat": 27.603,
      "lng": 88.647,
      "elevation": 1790
    },
    "population": 2650,
    "households": 560,
    "riskScore": 0.8088,
    "riskLevel": "CRITICAL",
    "hazardExposure": [
      {
        "type": "glof",
        "level": "CRITICAL",
        "score": 0.98,
        "contributors": [
          "South Lhonak Glacial Lake outburst flood route",
          "Teesta-III Dam break downstream surge"
        ]
      },
      {
        "type": "landslide",
        "level": "HIGH",
        "score": 0.89,
        "contributors": [
          "Gorge wall collapse",
          "Sediment damming debris"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.92,
      "level": "CRITICAL",
      "exposure": 0.97,
      "sensitivity": 0.9,
      "adaptiveCapacity": 0.16
    },
    "recommendedAction": "Zero-hour high-altitude relocation to Mangan Sports Enclave",
    "nearestRelocationSite": "site-mangan-sports"
  },
  {
    "id": "hab-singtam",
    "name": "Singtam Riverbank",
    "district": "Pakyong",
    "state": "Sikkim",
    "region": "Eastern Himalayas",
    "block": "Singtam",
    "location": {
      "lat": 27.234,
      "lng": 88.498,
      "elevation": 420
    },
    "population": 3200,
    "households": 710,
    "riskScore": 0.5737,
    "riskLevel": "CRITICAL",
    "hazardExposure": [
      {
        "type": "flood",
        "level": "CRITICAL",
        "score": 0.9,
        "contributors": [
          "Teesta riverbed rise (6m silt deposit)",
          "Flash flood inundation"
        ]
      },
      {
        "type": "landslide",
        "level": "HIGH",
        "score": 0.8,
        "contributors": [
          "Toe erosion of highway embankment"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.8,
      "level": "CRITICAL",
      "exposure": 0.85,
      "sensitivity": 0.78,
      "adaptiveCapacity": 0.32
    },
    "recommendedAction": "Evacuate to Singtam Community Disaster Centre on high terrace",
    "nearestRelocationSite": "site-singtam-safehaven"
  },
  {
    "id": "hab-erasama-paradeep",
    "name": "Erasama Coastal Belt",
    "district": "Jagatsinghpur",
    "state": "Odisha",
    "region": "Eastern Coastal Plains",
    "block": "Erasama",
    "location": {
      "lat": 20.15,
      "lng": 86.62,
      "elevation": 4
    },
    "population": 5100,
    "households": 1190,
    "riskScore": 0.7767,
    "riskLevel": "CRITICAL",
    "hazardExposure": [
      {
        "type": "flood",
        "level": "CRITICAL",
        "score": 0.96,
        "contributors": [
          "Super Cyclone storm surge (>6m tidal wave)",
          "Saline marine inundation up to 15km inland"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.87,
      "level": "CRITICAL",
      "exposure": 0.93,
      "sensitivity": 0.85,
      "adaptiveCapacity": 0.28
    },
    "recommendedAction": "Pre-emptive evacuation to Erasama Central Disaster Refuge",
    "nearestRelocationSite": "site-jagatsinghpur-shelter"
  },
  {
    "id": "hab-puri-krushnaprasad",
    "name": "Krushnaprasad (Chilika)",
    "district": "Puri",
    "state": "Odisha",
    "region": "Eastern Coastal Plains",
    "block": "Krushnaprasad",
    "location": {
      "lat": 19.64,
      "lng": 85.39,
      "elevation": 3.5
    },
    "population": 4400,
    "households": 960,
    "riskScore": 0.6567,
    "riskLevel": "CRITICAL",
    "hazardExposure": [
      {
        "type": "flood",
        "level": "CRITICAL",
        "score": 0.91,
        "contributors": [
          "Chilika lagoon barrier breach",
          "Severe gale force storm tide"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.82,
      "level": "CRITICAL",
      "exposure": 0.88,
      "sensitivity": 0.8,
      "adaptiveCapacity": 0.31
    },
    "recommendedAction": "Transit via coastal highway to Puri OSDMA Cyclone Shelter",
    "nearestRelocationSite": "site-puri-mpcs"
  },
  {
    "id": "hab-anantnag-bijbehara",
    "name": "Bijbehara & Sangam",
    "district": "Anantnag",
    "state": "Jammu & Kashmir",
    "region": "Kashmir Valley",
    "block": "Bijbehara",
    "location": {
      "lat": 33.795,
      "lng": 75.105,
      "elevation": 1590
    },
    "population": 4300,
    "households": 820,
    "riskScore": 0.6009,
    "riskLevel": "CRITICAL",
    "hazardExposure": [
      {
        "type": "flood",
        "level": "CRITICAL",
        "score": 0.9,
        "contributors": [
          "Jhelum River gauge exceeding Danger Level by 4.8m",
          "South Kashmir basin convergence overflow"
        ]
      },
      {
        "type": "earthquake",
        "level": "HIGH",
        "score": 0.78,
        "contributors": [
          "Seismic Zone IV/V"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.8,
      "level": "CRITICAL",
      "exposure": 0.86,
      "sensitivity": 0.78,
      "adaptiveCapacity": 0.34
    },
    "recommendedAction": "Evacuate to Anantnag Degree College Disaster Camp on high terrace",
    "nearestRelocationSite": "site-anantnag-sports"
  },
  {
    "id": "hab-sohra-cherrapunji",
    "name": "Sohra (Cherrapunji) Rim",
    "district": "East Khasi Hills",
    "state": "Meghalaya",
    "region": "Northeastern Hills",
    "block": "Sohra",
    "location": {
      "lat": 25.27,
      "lng": 91.73,
      "elevation": 1430
    },
    "population": 3200,
    "households": 670,
    "riskScore": 0.6431,
    "riskLevel": "CRITICAL",
    "hazardExposure": [
      {
        "type": "landslide",
        "level": "CRITICAL",
        "score": 0.91,
        "contributors": [
          "World-record intensity rainfall (>11,000mm annual)",
          "Limestone cliff collapse and canyon slides"
        ]
      },
      {
        "type": "flood",
        "level": "HIGH",
        "score": 0.82,
        "contributors": [
          "High-velocity gorge surface torrents"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.83,
      "level": "CRITICAL",
      "exposure": 0.89,
      "sensitivity": 0.81,
      "adaptiveCapacity": 0.27
    },
    "recommendedAction": "Move cliffside families to Sohra Sub-Divisional Complex",
    "nearestRelocationSite": "site-sohra-shelter"
  },
  {
    "id": "hab-noney-tupul",
    "name": "Tupul Valley",
    "district": "Noney",
    "state": "Manipur",
    "region": "Northeastern Hills",
    "block": "Noney",
    "location": {
      "lat": 24.816,
      "lng": 93.682,
      "elevation": 580
    },
    "population": 2100,
    "households": 420,
    "riskScore": 0.7919,
    "riskLevel": "CRITICAL",
    "hazardExposure": [
      {
        "type": "landslide",
        "level": "CRITICAL",
        "score": 0.97,
        "contributors": [
          "High cutting slope failure",
          "Ijei River damming creating inundation lake"
        ]
      },
      {
        "type": "flood",
        "level": "HIGH",
        "score": 0.87,
        "contributors": [
          "Breach risk of landslide debris dam"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.9,
      "level": "CRITICAL",
      "exposure": 0.95,
      "sensitivity": 0.88,
      "adaptiveCapacity": 0.18
    },
    "recommendedAction": "Urgent relocation along NH-37 to Imphal Khuman Lampak Enclave",
    "nearestRelocationSite": "site-imphal-complex"
  },
  {
    "id": "hab-kohima-south",
    "name": "Kohima South Ridge",
    "district": "Kohima",
    "state": "Nagaland",
    "region": "Northeastern Hills",
    "block": "Kohima",
    "location": {
      "lat": 25.66,
      "lng": 94.105,
      "elevation": 1440
    },
    "population": 3500,
    "households": 710,
    "riskScore": 0.5298,
    "riskLevel": "CRITICAL",
    "hazardExposure": [
      {
        "type": "landslide",
        "level": "HIGH",
        "score": 0.85,
        "contributors": [
          "Shale formation progressive creeping slump",
          "Infiltration of monsoon runoff"
        ]
      },
      {
        "type": "earthquake",
        "level": "HIGH",
        "score": 0.79,
        "contributors": [
          "Indo-Burma wedge Seismic Zone V"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.77,
      "level": "HIGH",
      "exposure": 0.82,
      "sensitivity": 0.76,
      "adaptiveCapacity": 0.33
    },
    "recommendedAction": "Relocate sinking zone households to Indira Gandhi Stadium Haven",
    "nearestRelocationSite": "site-kohima-stadium"
  },
  {
    "id": "hab-meppadi-chooralmala",
    "name": "Meppadi / Chooralmala",
    "district": "Wayanad",
    "state": "Kerala",
    "region": "Western Ghats",
    "block": "Vythiri",
    "location": {
      "lat": 11.5529455,
      "lng": 76.1320079,
      "elevation": 874
    },
    "population": 4850,
    "households": 1120,
    "riskScore": 0.6804,
    "riskLevel": "CRITICAL",
    "hazardExposure": [
      {
        "type": "landslide",
        "level": "CRITICAL",
        "score": 0.98,
        "contributors": [
          "Vellarimala steep tea-estate scarp",
          "Extreme monsoonal orographic rainfall (>350mm/24h)",
          "Debris flow channelization along Iruvanjippuzha"
        ]
      },
      {
        "type": "flood",
        "level": "HIGH",
        "score": 0.82,
        "contributors": [
          "Flash flood torrents in Chaliyar tributaries"
        ]
      },
      {
        "type": "earthquake",
        "level": "LOW",
        "score": 0.25,
        "contributors": [
          "Seismic Zone III (Peninsular shield fault)"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.88,
      "level": "CRITICAL",
      "exposure": 0.94,
      "sensitivity": 0.85,
      "adaptiveCapacity": 0.22
    },
    "recommendedAction": "Immediate evacuation along Meppadi-Kalpetta route to SKMJ High Ground Haven",
    "nearestRelocationSite": "site-wayanad-civil-station"
  },
  {
    "id": "hab-vythiri",
    "name": "Vythiri Valley",
    "district": "Wayanad",
    "state": "Kerala",
    "region": "Western Ghats",
    "block": "Vythiri",
    "location": {
      "lat": 11.5560885,
      "lng": 76.038922,
      "elevation": 752
    },
    "population": 3600,
    "households": 790,
    "riskScore": 0.4895,
    "riskLevel": "HIGH",
    "hazardExposure": [
      {
        "type": "landslide",
        "level": "HIGH",
        "score": 0.88,
        "contributors": [
          "High-slope escarpment slumping",
          "Pundari riverbed pore-pressure buildup"
        ]
      },
      {
        "type": "flood",
        "level": "HIGH",
        "score": 0.74,
        "contributors": [
          "Ghat pass runoff convergence"
        ]
      },
      {
        "type": "earthquake",
        "level": "LOW",
        "score": 0.2,
        "contributors": [
          "Seismic Zone III"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.79,
      "level": "HIGH",
      "exposure": 0.85,
      "sensitivity": 0.76,
      "adaptiveCapacity": 0.35
    },
    "recommendedAction": "Preemptive relocation of valley-floor families to Kalpetta Safe Complex",
    "nearestRelocationSite": "site-wayanad-civil-station"
  },
  {
    "id": "hab-munnar-tea",
    "name": "Munnar Town & Pettimudi Slopes",
    "district": "Idukki",
    "state": "Kerala",
    "region": "Western Ghats",
    "block": "Devikulam",
    "location": {
      "lat": 10.0869959,
      "lng": 77.0600915,
      "elevation": 1457
    },
    "population": 5200,
    "households": 1250,
    "riskScore": 0.6289,
    "riskLevel": "CRITICAL",
    "hazardExposure": [
      {
        "type": "landslide",
        "level": "CRITICAL",
        "score": 0.94,
        "contributors": [
          "Anamudi bedrock debris avalanche trajectory",
          "Perforated estate tea-slope saturation"
        ]
      },
      {
        "type": "flood",
        "level": "HIGH",
        "score": 0.85,
        "contributors": [
          "Muthirapuzha river bank overspill"
        ]
      },
      {
        "type": "earthquake",
        "level": "LOW",
        "score": 0.3,
        "contributors": [
          "Seismic Zone III"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.86,
      "level": "CRITICAL",
      "exposure": 0.9,
      "sensitivity": 0.82,
      "adaptiveCapacity": 0.25
    },
    "recommendedAction": "Evacuation to Munnar Higher Ground Sports Enclave",
    "nearestRelocationSite": "site-idukki-painavu"
  },
  {
    "id": "hab-painavu",
    "name": "Painavu / Cheruthoni",
    "district": "Idukki",
    "state": "Kerala",
    "region": "Western Ghats",
    "block": "Idukki",
    "location": {
      "lat": 9.8540061,
      "lng": 76.9446486,
      "elevation": 848
    },
    "population": 3100,
    "households": 710,
    "riskScore": 0.5643,
    "riskLevel": "CRITICAL",
    "hazardExposure": [
      {
        "type": "flood",
        "level": "CRITICAL",
        "score": 0.9,
        "contributors": [
          "Cheruthoni Dam spillway discharge surge",
          "Periyar river gorge overtopping"
        ]
      },
      {
        "type": "landslide",
        "level": "HIGH",
        "score": 0.86,
        "contributors": [
          "Steep reservoir peripheral slope cutting"
        ]
      },
      {
        "type": "earthquake",
        "level": "LOW",
        "score": 0.28,
        "contributors": [
          "Reservoir-induced seismicity (Zone III)"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.82,
      "level": "CRITICAL",
      "exposure": 0.87,
      "sensitivity": 0.79,
      "adaptiveCapacity": 0.32
    },
    "recommendedAction": "Stage-1 movement to Idukki District Stadium Safe Haven",
    "nearestRelocationSite": "site-idukki-painavu"
  },
  {
    "id": "hab-kumarakom",
    "name": "Kumarakom Inland Basin",
    "district": "Kottayam",
    "state": "Kerala",
    "region": "Coastal & Backwaters",
    "block": "Kottayam",
    "location": {
      "lat": 9.5960545,
      "lng": 76.4305378,
      "elevation": 7
    },
    "population": 6400,
    "households": 1520,
    "riskScore": 0.5336,
    "riskLevel": "HIGH",
    "hazardExposure": [
      {
        "type": "flood",
        "level": "CRITICAL",
        "score": 0.93,
        "contributors": [
          "Below sea-level Vembanad lake inundation",
          "Meenachil river drainage blockade during high tide"
        ]
      },
      {
        "type": "landslide",
        "level": "LOW",
        "score": 0.05,
        "contributors": [
          "Negligible slope"
        ]
      },
      {
        "type": "earthquake",
        "level": "LOW",
        "score": 0.15,
        "contributors": [
          "Seismic Zone III"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.8,
      "level": "HIGH",
      "exposure": 0.92,
      "sensitivity": 0.78,
      "adaptiveCapacity": 0.38
    },
    "recommendedAction": "Boat & amphibious transport to Kottayam Collectorate High Ridge",
    "nearestRelocationSite": "site-kottayam-collectorate"
  },
  {
    "id": "hab-haripad-kuttanad",
    "name": "Haripad Delta (Lower Kuttanad)",
    "district": "Alappuzha",
    "state": "Kerala",
    "region": "Coastal & Backwaters",
    "block": "Haripad",
    "location": {
      "lat": 9.2844934,
      "lng": 76.4562679,
      "elevation": 9
    },
    "population": 7100,
    "households": 1680,
    "riskScore": 0.5811,
    "riskLevel": "CRITICAL",
    "hazardExposure": [
      {
        "type": "flood",
        "level": "CRITICAL",
        "score": 0.95,
        "contributors": [
          "Pamba & Achankovil river delta convergence",
          "Continuous 1.8m sub-surface waterlogging"
        ]
      },
      {
        "type": "landslide",
        "level": "LOW",
        "score": 0.02,
        "contributors": [
          "Delta alluvial flat"
        ]
      },
      {
        "type": "earthquake",
        "level": "LOW",
        "score": 0.15,
        "contributors": [
          "Seismic Zone III"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.83,
      "level": "CRITICAL",
      "exposure": 0.95,
      "sensitivity": 0.8,
      "adaptiveCapacity": 0.3
    },
    "recommendedAction": "Relocation to Alappuzha Model College Elevated Cyclone Shelter",
    "nearestRelocationSite": "site-alappuzha-relief"
  },
  {
    "id": "hab-nilambur",
    "name": "Nilambur & Kavalappara Tract",
    "district": "Malappuram",
    "state": "Kerala",
    "region": "Western Ghats Foothills",
    "block": "Nilambur",
    "location": {
      "lat": 11.2865083,
      "lng": 76.2407387,
      "elevation": 37
    },
    "population": 5800,
    "households": 1340,
    "riskScore": 0.5914,
    "riskLevel": "CRITICAL",
    "hazardExposure": [
      {
        "type": "landslide",
        "level": "CRITICAL",
        "score": 0.92,
        "contributors": [
          "Muthappanpuzha hill breach",
          "Kavalappara historical debris flow footprint"
        ]
      },
      {
        "type": "flood",
        "level": "HIGH",
        "score": 0.86,
        "contributors": [
          "Chaliyar river overflow across low plains"
        ]
      },
      {
        "type": "earthquake",
        "level": "LOW",
        "score": 0.2,
        "contributors": [
          "Seismic Zone III"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.84,
      "level": "CRITICAL",
      "exposure": 0.89,
      "sensitivity": 0.81,
      "adaptiveCapacity": 0.29
    },
    "recommendedAction": "Immediate evacuation to Nilambur High School Flood Relief Campus",
    "nearestRelocationSite": "site-wayanad-civil-station"
  },
  {
    "id": "hab-aluva",
    "name": "Aluva Riverbed Basin",
    "district": "Ernakulam",
    "state": "Kerala",
    "region": "Coastal Plains",
    "block": "Aluva",
    "location": {
      "lat": 10.1077682,
      "lng": 76.3568532,
      "elevation": 14
    },
    "population": 8900,
    "households": 2100,
    "riskScore": 0.4767,
    "riskLevel": "HIGH",
    "hazardExposure": [
      {
        "type": "flood",
        "level": "CRITICAL",
        "score": 0.91,
        "contributors": [
          "Periyar river direct downstream discharge from Idamalayar & Idukki reservoirs"
        ]
      },
      {
        "type": "landslide",
        "level": "LOW",
        "score": 0.05,
        "contributors": [
          "Low-lying alluvial plain"
        ]
      },
      {
        "type": "earthquake",
        "level": "LOW",
        "score": 0.2,
        "contributors": [
          "Seismic Zone III"
        ]
      }
    ],
    "vulnerabilityIndex": {
      "overall": 0.76,
      "level": "HIGH",
      "exposure": 0.93,
      "sensitivity": 0.72,
      "adaptiveCapacity": 0.45
    },
    "recommendedAction": "Relocation to Aluva UC College Elevated Campus",
    "nearestRelocationSite": "site-kottayam-collectorate"
  }
];
