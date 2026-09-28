import type { RelocationSite } from '../types';

export const DEMO_RELOCATION_SITES: RelocationSite[] = [
  {
    "id": "site-pipalkoti",
    "name": "Pipalkoti Government Polytechnic Complex",
    "facilityType": "Government Polytechnic Disaster Campus",
    "district": "Chamoli",
    "state": "Uttarakhand",
    "region": "Western Himalayas",
    "block": "Dasholi",
    "location": {
      "lat": 30.429,
      "lng": 79.431,
      "elevation": 1260
    },
    "suitability": "HIGH",
    "suitabilityScore": 0.89,
    "capacity": 6500,
    "currentOccupants": 0,
    "maxBeds": 1000,
    "medicalBayBeds": 15,
    "dailyWaterLiters": 10000,
    "powerBackupHours": 48,
    "sanitationUnits": 30,
    "foodStockDays": 10,
    "distanceFromAffected": 14.2,
    "slopeGrade": "Gentle (5-8\u00b0)",
    "hasRoadAccess": true,
    "hasWaterAccess": true,
    "nearInfrastructure": true,
    "elevationAboveFloodPlane": 145,
    "structuralType": "Reinforced Concrete RCC Category-IV Seismic Resilient Frame",
    "managingAgency": "USDMA & Chamoli District Emergency Operations Centre (DEOC)",
    "amenities": [
      "Solar-DG Hybrid Power Backup (250 kVA)",
      "10-bed Emergency Medical Triage Bay",
      "RO Water Purification Unit (8,000 L/day)",
      "Helipad Landing Ground (Polytechnic Field)",
      "Direct NH-7 All-Weather Lifeline Access",
      "HAM Radio / SATCOM Communication Link",
      "14-Day Rations & Community Kitchen Setup"
    ],
    "operationalStatus": "READY",
    "lifelineCorridor": "NH-7 (Rishikesh-Badrinath National Highway)",
    "constraints": [
      {
        "label": "Low slope gradient (<10\u00b0)",
        "met": true
      },
      {
        "label": "Outside active subsidence/crevasse zones",
        "met": true
      },
      {
        "label": "Heavy vehicle corridor (NH-7)",
        "met": true
      },
      {
        "label": "Independent potable water source",
        "met": true
      },
      {
        "label": "Sufficient carrying capacity (>6,000 evacuees)",
        "met": true
      },
      {
        "label": "District Hospital within 12km",
        "met": true
      }
    ]
  },
  {
    "id": "site-chamoli-town",
    "name": "Chamoli District Indoor Sports Stadium",
    "facilityType": "District Stadium & Youth Enclave",
    "district": "Chamoli",
    "state": "Uttarakhand",
    "region": "Western Himalayas",
    "block": "Gopeshwar",
    "location": {
      "lat": 30.405,
      "lng": 79.325,
      "elevation": 1320
    },
    "suitability": "HIGH",
    "suitabilityScore": 0.82,
    "capacity": 4500,
    "currentOccupants": 0,
    "maxBeds": 1000,
    "medicalBayBeds": 15,
    "dailyWaterLiters": 10000,
    "powerBackupHours": 48,
    "sanitationUnits": 30,
    "foodStockDays": 10,
    "distanceFromAffected": 22.5,
    "slopeGrade": "Terraced (6-10\u00b0)",
    "hasRoadAccess": true,
    "hasWaterAccess": true,
    "nearInfrastructure": true,
    "elevationAboveFloodPlane": 180,
    "structuralType": "Steel Truss & RCC Multi-Purpose Sports Complex",
    "managingAgency": "District Administration Chamoli & NDRF 15th Bn Liaison",
    "amenities": [
      "Indoor Covered Arena (3,200 sq.m)",
      "Dedicated Ambulatory Casualty Station",
      "Municipal Water Connection + 50,000L Underground Tank",
      "Dual 125 kVA Diesel Generator Sets",
      "Helicopter Landing Pad on Football Turf"
    ],
    "operationalStatus": "READY",
    "lifelineCorridor": "NH-7 to Gopeshwar Highway Link",
    "constraints": [
      {
        "label": "Outside major landslide/GLOF runout tracks",
        "met": true
      },
      {
        "label": "Paved two-lane road connectivity",
        "met": true
      },
      {
        "label": "Sanitation capacity for 4,500 people",
        "met": true
      }
    ]
  },
  {
    "id": "site-tilwara",
    "name": "Tilwara Mandakini High-Ground Complex",
    "facilityType": "Elevated Community Disaster Refuge",
    "district": "Rudraprayag",
    "state": "Uttarakhand",
    "region": "Western Himalayas",
    "block": "Augustmuni",
    "location": {
      "lat": 30.458,
      "lng": 79.08,
      "elevation": 840
    },
    "suitability": "HIGH",
    "suitabilityScore": 0.86,
    "capacity": 4000,
    "currentOccupants": 0,
    "maxBeds": 1000,
    "medicalBayBeds": 15,
    "dailyWaterLiters": 10000,
    "powerBackupHours": 48,
    "sanitationUnits": 30,
    "foodStockDays": 10,
    "distanceFromAffected": 18,
    "slopeGrade": "Gentle (4-7\u00b0)",
    "hasRoadAccess": true,
    "hasWaterAccess": true,
    "nearInfrastructure": true,
    "elevationAboveFloodPlane": 65,
    "structuralType": "Engineered RCC Terraced Safe Structure",
    "managingAgency": "Rudraprayag District Magistrate Disaster Cell",
    "amenities": [
      "High Ground elevation 65m above Mandakini 2013 flood watermark",
      "Community Kitchen with LPG Bank",
      "Medical First-Aid Centre",
      "NH-107 Kedarnath Lifeline Direct Access"
    ],
    "operationalStatus": "READY",
    "lifelineCorridor": "NH-107 (Rudraprayag-Gaurikund Highway)",
    "constraints": [
      {
        "label": "Exceeds Mandakini high-water flood envelope",
        "met": true
      },
      {
        "label": "Direct bus and ambulance evacuation access",
        "met": true
      }
    ]
  },
  {
    "id": "site-kullu-dhalpur",
    "name": "Dhalpur Ground Disaster Evacuation Enclave",
    "facilityType": "District Emergency Staging Complex",
    "district": "Kullu",
    "state": "Himachal Pradesh",
    "region": "Northern Himalayas",
    "block": "Kullu",
    "location": {
      "lat": 31.956,
      "lng": 77.108,
      "elevation": 1278
    },
    "suitability": "HIGH",
    "suitabilityScore": 0.91,
    "capacity": 6000,
    "currentOccupants": 0,
    "maxBeds": 1000,
    "medicalBayBeds": 15,
    "dailyWaterLiters": 10000,
    "powerBackupHours": 48,
    "sanitationUnits": 30,
    "foodStockDays": 10,
    "distanceFromAffected": 28,
    "slopeGrade": "Flat (0-3\u00b0)",
    "hasRoadAccess": true,
    "hasWaterAccess": true,
    "nearInfrastructure": true,
    "elevationAboveFloodPlane": 45,
    "structuralType": "Reinforced Concrete Exhibition Hall & Open Staging Grounds",
    "managingAgency": "HPSDMA & Kullu District Disaster Management Authority (DDMA)",
    "amenities": [
      "Wide Paved Assembly Area for 150 Evacuation Buses",
      "Civil Hospital Kullu within 1.5km",
      "Dedicated Helipad for Indian Air Force Mi-17 Relief Sorties",
      "Pre-positioned SDRF Rescue Equipment Depot",
      "High-Capacity Water Filtration System"
    ],
    "operationalStatus": "READY",
    "lifelineCorridor": "NH-3 (Chandigarh-Manali Highway)",
    "constraints": [
      {
        "label": "Outside Beas river flash flood contour",
        "met": true
      },
      {
        "label": "Multiple ingress and egress evacuation routes",
        "met": true
      }
    ]
  },
  {
    "id": "site-mandi-paddal",
    "name": "Paddal Multi-Purpose Emergency Safe Complex",
    "facilityType": "Municipal Sports & Relief Enclave",
    "district": "Mandi",
    "state": "Himachal Pradesh",
    "region": "Northern Himalayas",
    "block": "Mandi Sadar",
    "location": {
      "lat": 31.708,
      "lng": 76.932,
      "elevation": 760
    },
    "suitability": "HIGH",
    "suitabilityScore": 0.84,
    "capacity": 5000,
    "currentOccupants": 0,
    "maxBeds": 1000,
    "medicalBayBeds": 15,
    "dailyWaterLiters": 10000,
    "powerBackupHours": 48,
    "sanitationUnits": 30,
    "foodStockDays": 10,
    "distanceFromAffected": 16.5,
    "slopeGrade": "Flat Terraced (2-5\u00b0)",
    "hasRoadAccess": true,
    "hasWaterAccess": true,
    "nearInfrastructure": true,
    "elevationAboveFloodPlane": 32,
    "structuralType": "Heavy RCC Stilt Ground Pavilion with Indoor Stadium",
    "managingAgency": "Mandi Municipal Corporation & DDMA",
    "amenities": [
      "Covered Multi-Sport Halls for Dormitory Conversion",
      "Primary Health Centre & Trauma Care Staging",
      "Heavy Earthmover Equipment Standby Station"
    ],
    "operationalStatus": "READY",
    "lifelineCorridor": "NH-21 Highway Corridor",
    "constraints": [
      {
        "label": "Safe from upstream dam release levels",
        "met": true
      },
      {
        "label": "Direct highway connectivity",
        "met": true
      }
    ]
  },
  {
    "id": "site-meppadi-campus",
    "name": "St. Joseph Higher Secondary Community Haven",
    "facilityType": "High-Altitude Bedrock Educational Complex",
    "district": "Wayanad",
    "state": "Kerala",
    "region": "Western Ghats",
    "block": "Vythiri",
    "location": {
      "lat": 11.554,
      "lng": 76.126,
      "elevation": 980
    },
    "suitability": "HIGH",
    "suitabilityScore": 0.94,
    "capacity": 5500,
    "currentOccupants": 0,
    "maxBeds": 1000,
    "medicalBayBeds": 15,
    "dailyWaterLiters": 10000,
    "powerBackupHours": 48,
    "sanitationUnits": 30,
    "foodStockDays": 10,
    "distanceFromAffected": 6.8,
    "slopeGrade": "Gentle (3-6\u00b0)",
    "hasRoadAccess": true,
    "hasWaterAccess": true,
    "nearInfrastructure": true,
    "elevationAboveFloodPlane": 120,
    "structuralType": "Multi-Block Heavy RCC Masonry on Stable Crystalline Bedrock",
    "managingAgency": "KSDMA & Wayanad District Collectorate DEOC",
    "amenities": [
      "50-bed Emergency Field Trauma Hospital with Ventilators",
      "4 Large Multi-Storey School Wings Converted to Family Dorms",
      "24/7 Dedicated Solar Microgrid with 150 kVA Diesel Generator",
      "RO Clean Drinking Water Plant (10,000 L/day capacity)",
      "Helicopter Landing Facility at Meppadi Higher Secondary Ground",
      "Police & NDRF Joint Incident Command Post",
      "Separated Quarantine and Pediatric Care Blocks"
    ],
    "operationalStatus": "ACTIVE_CAMP",
    "lifelineCorridor": "Meppadi-Chooralmala Main Road & NH-766 Connection",
    "constraints": [
      {
        "label": "Bedrock slope stability certified by GSI Kerala Unit",
        "met": true
      },
      {
        "label": "Completely outside Chooralmala debris avalanche flow path",
        "met": true
      },
      {
        "label": "Unobstructed ambulance & 4x4 relief convoy route",
        "met": true
      },
      {
        "label": "Wayanad Institute of Medical Sciences (WIMS) within 7km",
        "met": true
      }
    ]
  },
  {
    "id": "site-kalpetta-stadium",
    "name": "Kalpetta Municipal Indoor Stadium & Relief Hub",
    "facilityType": "District Multi-Purpose Safe Haven",
    "district": "Wayanad",
    "state": "Kerala",
    "region": "Western Ghats",
    "block": "Kalpetta",
    "location": {
      "lat": 11.608,
      "lng": 76.082,
      "elevation": 780
    },
    "suitability": "HIGH",
    "suitabilityScore": 0.92,
    "capacity": 7000,
    "currentOccupants": 0,
    "maxBeds": 1000,
    "medicalBayBeds": 15,
    "dailyWaterLiters": 10000,
    "powerBackupHours": 48,
    "sanitationUnits": 30,
    "foodStockDays": 10,
    "distanceFromAffected": 15.4,
    "slopeGrade": "Flat (0-3\u00b0)",
    "hasRoadAccess": true,
    "hasWaterAccess": true,
    "nearInfrastructure": true,
    "elevationAboveFloodPlane": 95,
    "structuralType": "Reinforced Column-Beam Sports Stadium with High Plinth",
    "managingAgency": "Wayanad District Administration & Fire and Rescue Services",
    "amenities": [
      "Central Logistics Warehouse for NDRF / Army Supply Drop",
      "Mass Feeding Kitchen (Capacity 15,000 Meals/Day)",
      "Fiber Optic High-Speed Emergency Telecommunications"
    ],
    "operationalStatus": "READY",
    "lifelineCorridor": "NH-766 (Kozhikode-Mysuru National Highway)",
    "constraints": [
      {
        "label": "Zero slope failure susceptibility",
        "met": true
      },
      {
        "label": "Inter-district highway lifeline",
        "met": true
      }
    ]
  },
  {
    "id": "site-adimali-haven",
    "name": "Adimali Government High School Complex",
    "facilityType": "High-Elevation Solid Rock Relief Centre",
    "district": "Idukki",
    "state": "Kerala",
    "region": "Western Ghats",
    "block": "Adimali",
    "location": {
      "lat": 10.012,
      "lng": 76.954,
      "elevation": 620
    },
    "suitability": "HIGH",
    "suitabilityScore": 0.88,
    "capacity": 3800,
    "currentOccupants": 0,
    "maxBeds": 1000,
    "medicalBayBeds": 15,
    "dailyWaterLiters": 10000,
    "powerBackupHours": 48,
    "sanitationUnits": 30,
    "foodStockDays": 10,
    "distanceFromAffected": 19,
    "slopeGrade": "Gentle Terraced (4-8\u00b0)",
    "hasRoadAccess": true,
    "hasWaterAccess": true,
    "nearInfrastructure": true,
    "elevationAboveFloodPlane": 85,
    "structuralType": "Multi-Storey RCC Educational Complex on Non-Failing Ridge",
    "managingAgency": "Idukki DDMA & Taluk Disaster Operations Desk",
    "amenities": [
      "Taluk Hospital Adimali within 1.2km",
      "High-Output Diesel Generators",
      "Safe All-Weather Access on NH-85"
    ],
    "operationalStatus": "READY",
    "lifelineCorridor": "NH-85 (Kochi-Madurai National Highway)",
    "constraints": [
      {
        "label": "Geotechnical clearance from Mining & Geology Dept",
        "met": true
      },
      {
        "label": "Reliable road access during torrential downpours",
        "met": true
      }
    ]
  },
  {
    "id": "site-alappuzha-elevated",
    "name": "Alappuzha Multi-Purpose Cyclone & Flood Shelter",
    "facilityType": "NDMA Elevated Stilt Cyclone Refuge",
    "district": "Alappuzha",
    "state": "Kerala",
    "region": "Coastal Plains",
    "block": "Ambalappuzha",
    "location": {
      "lat": 9.498,
      "lng": 76.338,
      "elevation": 18
    },
    "suitability": "HIGH",
    "suitabilityScore": 0.9,
    "capacity": 4500,
    "currentOccupants": 0,
    "maxBeds": 1000,
    "medicalBayBeds": 15,
    "dailyWaterLiters": 10000,
    "powerBackupHours": 48,
    "sanitationUnits": 30,
    "foodStockDays": 10,
    "distanceFromAffected": 12,
    "slopeGrade": "Flat Stilt Elevated",
    "hasRoadAccess": true,
    "hasWaterAccess": true,
    "nearInfrastructure": true,
    "elevationAboveFloodPlane": 19.5,
    "structuralType": "3-Tier Heavy RCC on Deep Pile Foundation (World Bank NCRMP Standard)",
    "managingAgency": "Kerala State Disaster Management Authority (KSDMA)",
    "amenities": [
      "Ground Floor Open Stilt for Emergency Rescue Boat Berthing",
      "First & Second Floors Flood-Proof Living Quarters",
      "Rooftop Rainwater Harvesting + Solar Inverters",
      "Helipad on Reinforced Concrete Roof Deck"
    ],
    "operationalStatus": "READY",
    "lifelineCorridor": "NH-66 Coastal Highway Corridor",
    "constraints": [
      {
        "label": "Elevated 15m above 100-year backwater flood watermark",
        "met": true
      },
      {
        "label": "Direct water and road rescue vehicle connectivity",
        "met": true
      }
    ]
  },
  {
    "id": "site-amalapuram-mpcs",
    "name": "Amalapuram Multi-Purpose Cyclone Shelter (MPCS)",
    "facilityType": "NDMA NCRMP Multi-Purpose Cyclone Shelter",
    "district": "Dr. B.R. Ambedkar Konaseema",
    "state": "Andhra Pradesh",
    "region": "Eastern Coastal Plains",
    "block": "Amalapuram",
    "location": {
      "lat": 16.578,
      "lng": 81.996,
      "elevation": 14.5
    },
    "suitability": "HIGH",
    "suitabilityScore": 0.93,
    "capacity": 5200,
    "currentOccupants": 0,
    "maxBeds": 1000,
    "medicalBayBeds": 15,
    "dailyWaterLiters": 10000,
    "powerBackupHours": 48,
    "sanitationUnits": 30,
    "foodStockDays": 10,
    "distanceFromAffected": 16,
    "slopeGrade": "Elevated Stilt (0-2\u00b0)",
    "hasRoadAccess": true,
    "hasWaterAccess": true,
    "nearInfrastructure": true,
    "elevationAboveFloodPlane": 11.5,
    "structuralType": "Category-IV Cyclone Resilient RCC Stilt Structure (Winds >250 km/h)",
    "managingAgency": "APSDMA & Konaseema District Disaster Operations Center",
    "amenities": [
      "Engineered Stilt Elevation Resisting 6m Coastal Surge",
      "Dedicated Wind-Resistant Aerodynamic Shutter System",
      "10,000 L/Day Desalination & RO Purification Plant",
      "Backup Solar Photovoltaic + 100 kVA Silent DG Set",
      "Amphibious Vehicle & Inflatable Boat Staging Dock",
      "Emergency Satellite Mobile Radio Tower"
    ],
    "operationalStatus": "READY",
    "lifelineCorridor": "NH-216 (Coastal Highway Bypass)",
    "constraints": [
      {
        "label": "Built under National Cyclone Risk Mitigation Project (NCRMP)",
        "met": true
      },
      {
        "label": "Zero risk of tidal inundation on living floors",
        "met": true
      }
    ]
  },
  {
    "id": "site-vizag-indoor",
    "name": "Swarna Bharathi Indoor Stadium & Evacuation Hub",
    "facilityType": "Municipal Sports & Disaster Complex",
    "district": "Visakhapatnam",
    "state": "Andhra Pradesh",
    "region": "Eastern Coastal Plains",
    "block": "Visakhapatnam Urban",
    "location": {
      "lat": 17.728,
      "lng": 83.305,
      "elevation": 28
    },
    "suitability": "HIGH",
    "suitabilityScore": 0.89,
    "capacity": 7500,
    "currentOccupants": 0,
    "maxBeds": 1000,
    "medicalBayBeds": 15,
    "dailyWaterLiters": 10000,
    "powerBackupHours": 48,
    "sanitationUnits": 30,
    "foodStockDays": 10,
    "distanceFromAffected": 14,
    "slopeGrade": "Gentle (2-4\u00b0)",
    "hasRoadAccess": true,
    "hasWaterAccess": true,
    "nearInfrastructure": true,
    "elevationAboveFloodPlane": 24,
    "structuralType": "Reinforced Space-Frame & Concrete Complex",
    "managingAgency": "Greater Visakhapatnam Municipal Corporation (GVMC) & NDRF 10th Bn",
    "amenities": [
      "Massive 4,500 sq.m Main Arena with Ventilation",
      "King George Hospital (KGH) Medical Response Support",
      "Naval Eastern Command Liaison Coordination Desk"
    ],
    "operationalStatus": "READY",
    "lifelineCorridor": "NH-16 (Kolkata-Chennai Expressway)",
    "constraints": [
      {
        "label": "Elevated 28m above mean sea level",
        "met": true
      },
      {
        "label": "Protected from storm surge wave dynamics",
        "met": true
      }
    ]
  },
  {
    "id": "site-jorhat-stadium",
    "name": "Jorhat District Stadium Safe Enclave",
    "facilityType": "Elevated Flood Relief Enclave",
    "district": "Majuli",
    "state": "Assam",
    "region": "Brahmaputra Basin",
    "block": "Jorhat Mainland",
    "location": {
      "lat": 26.758,
      "lng": 94.212,
      "elevation": 96
    },
    "suitability": "HIGH",
    "suitabilityScore": 0.92,
    "capacity": 8000,
    "currentOccupants": 0,
    "maxBeds": 1000,
    "medicalBayBeds": 15,
    "dailyWaterLiters": 10000,
    "powerBackupHours": 48,
    "sanitationUnits": 30,
    "foodStockDays": 10,
    "distanceFromAffected": 18.5,
    "slopeGrade": "Flat Embanked (0-2\u00b0)",
    "hasRoadAccess": true,
    "hasWaterAccess": true,
    "nearInfrastructure": true,
    "elevationAboveFloodPlane": 14,
    "structuralType": "Heavy High-Plinth Stadium and Pavilion with Embankment Protection",
    "managingAgency": "ASDMA & Jorhat District Administration (Majuli Evacuation Support)",
    "amenities": [
      "Direct River Ferry Landing to Elevated Bus Transit Link",
      "Army Eastern Command Logistics Base Connection",
      "Water Treatment Plant & Water Tankers fleet",
      "500-bed Field Tent and Dormitory Capacity"
    ],
    "operationalStatus": "READY",
    "lifelineCorridor": "NH-715 & Majuli-Jorhat Ferry Terminal Link",
    "constraints": [
      {
        "label": "Mainland high bank beyond Brahmaputra erosion buffer",
        "met": true
      },
      {
        "label": "Uncuttable road communication to Jorhat Medical College (JMCH)",
        "met": true
      }
    ]
  },
  {
    "id": "site-silchar-polytech",
    "name": "Silchar Government Polytechnic Flood Refuge",
    "facilityType": "High-Ground Technical Campus Refuge",
    "district": "Cachar",
    "state": "Assam",
    "region": "Barak Valley",
    "block": "Silchar",
    "location": {
      "lat": 24.842,
      "lng": 92.775,
      "elevation": 42
    },
    "suitability": "HIGH",
    "suitabilityScore": 0.88,
    "capacity": 5500,
    "currentOccupants": 0,
    "maxBeds": 1000,
    "medicalBayBeds": 15,
    "dailyWaterLiters": 10000,
    "powerBackupHours": 48,
    "sanitationUnits": 30,
    "foodStockDays": 10,
    "distanceFromAffected": 8.5,
    "slopeGrade": "Elevated Tilla (Hillock 5-9\u00b0)",
    "hasRoadAccess": true,
    "hasWaterAccess": true,
    "nearInfrastructure": true,
    "elevationAboveFloodPlane": 16,
    "structuralType": "Reinforced Concrete Academic Blocks on Stable Hillock (Tilla)",
    "managingAgency": "Cachar District Administration & Silchar Municipal Board",
    "amenities": [
      "Higher ground immune to Bethukandi dyke breach floodwaters",
      "Dedicated Power Supply via 11kV Feeder + Generators",
      "Ample Clean Groundwater Deep Tube Well"
    ],
    "operationalStatus": "READY",
    "lifelineCorridor": "NH-37 & Silchar Bypass",
    "constraints": [
      {
        "label": "Safe from Barak river basin drainage stagnation",
        "met": true
      },
      {
        "label": "Air drop receiving zone in campus grounds",
        "met": true
      }
    ]
  },
  {
    "id": "site-mangan-sports",
    "name": "Mangan Senior Secondary High-Plateau Enclave",
    "facilityType": "Mountain Plateau Disaster Enclave",
    "district": "Mangan",
    "state": "Sikkim",
    "region": "Eastern Himalayas",
    "block": "Mangan",
    "location": {
      "lat": 27.512,
      "lng": 88.534,
      "elevation": 1580
    },
    "suitability": "HIGH",
    "suitabilityScore": 0.94,
    "capacity": 3500,
    "currentOccupants": 0,
    "maxBeds": 1000,
    "medicalBayBeds": 15,
    "dailyWaterLiters": 10000,
    "powerBackupHours": 48,
    "sanitationUnits": 30,
    "foodStockDays": 10,
    "distanceFromAffected": 14.8,
    "slopeGrade": "Stable Plateau (3-6\u00b0)",
    "hasRoadAccess": true,
    "hasWaterAccess": true,
    "nearInfrastructure": true,
    "elevationAboveFloodPlane": 320,
    "structuralType": "Reinforced Concrete Multi-Wing Earthquake-Engineered Complex",
    "managingAgency": "SSDMA & North Sikkim District Magistrate Command Desk",
    "amenities": [
      "Massive Vertical Clearance from any Teesta GLOF or dam breach wave",
      "Mangan District Hospital Access within 800m",
      "Helipad at Mangan Helidrome for Indian Air Force sorties",
      "SATCOM VSAT Terminal for communications when optical fiber severed"
    ],
    "operationalStatus": "READY",
    "lifelineCorridor": "North Sikkim Highway (NH-310A)",
    "constraints": [
      {
        "label": "100% safe from Teesta riverbed flash torrents and GLOF surges",
        "met": true
      },
      {
        "label": "Solid bedrock ridge with zero subsidence history",
        "met": true
      }
    ]
  },
  {
    "id": "site-singtam-safehaven",
    "name": "Singtam Community Disaster Centre",
    "facilityType": "Terraced Civic Refuge Centre",
    "district": "Pakyong",
    "state": "Sikkim",
    "region": "Eastern Himalayas",
    "block": "Singtam",
    "location": {
      "lat": 27.245,
      "lng": 88.512,
      "elevation": 520
    },
    "suitability": "HIGH",
    "suitabilityScore": 0.85,
    "capacity": 4000,
    "currentOccupants": 0,
    "maxBeds": 1000,
    "medicalBayBeds": 15,
    "dailyWaterLiters": 10000,
    "powerBackupHours": 48,
    "sanitationUnits": 30,
    "foodStockDays": 10,
    "distanceFromAffected": 4.5,
    "slopeGrade": "Terraced (4-8\u00b0)",
    "hasRoadAccess": true,
    "hasWaterAccess": true,
    "nearInfrastructure": true,
    "elevationAboveFloodPlane": 65,
    "structuralType": "Engineered RCC Structural Frame",
    "managingAgency": "Pakyong District Disaster Management Unit",
    "amenities": [
      "High ground terrace 65m above Teesta silted basin",
      "Direct highway access to Gangtok capital enclave",
      "Emergency food & blanket stockpile"
    ],
    "operationalStatus": "READY",
    "lifelineCorridor": "NH-10 (Siliguri-Gangtok Highway)",
    "constraints": [
      {
        "label": "Elevated terrace above flood line",
        "met": true
      },
      {
        "label": "NH-10 arterial corridor access",
        "met": true
      }
    ]
  },
  {
    "id": "site-jagatsinghpur-shelter",
    "name": "Erasama Central Multi-Purpose Cyclone Refuge",
    "facilityType": "OSDMA State Prototype Cyclone Refuge",
    "district": "Jagatsinghpur",
    "state": "Odisha",
    "region": "Eastern Coastal Plains",
    "block": "Erasama",
    "location": {
      "lat": 20.21,
      "lng": 86.53,
      "elevation": 18
    },
    "suitability": "HIGH",
    "suitabilityScore": 0.95,
    "capacity": 6000,
    "currentOccupants": 0,
    "maxBeds": 1000,
    "medicalBayBeds": 15,
    "dailyWaterLiters": 10000,
    "powerBackupHours": 48,
    "sanitationUnits": 30,
    "foodStockDays": 10,
    "distanceFromAffected": 11,
    "slopeGrade": "Engineered Stilt Mound",
    "hasRoadAccess": true,
    "hasWaterAccess": true,
    "nearInfrastructure": true,
    "elevationAboveFloodPlane": 15,
    "structuralType": "Double-Stilt RCC Structure with Aerodynamic Circular Dome Architecture",
    "managingAgency": "Odisha State Disaster Management Authority (OSDMA)",
    "amenities": [
      "Engineered to withstand 300 km/h wind velocity (1999 Super Cyclone certified)",
      "High Plinth Stone Riprap Ring Wall resisting tidal scour and storm surge",
      "15,000 L/Day Desalination & Solar RO Plant",
      "Satellite Early Warning Sirens and VHF Wireless Relay",
      "Pre-positioned ODRAF & NDRF rescue boats and diving gear"
    ],
    "operationalStatus": "READY",
    "lifelineCorridor": "State Highway 12 to Cuttack-Bhubaneswar Corridor",
    "constraints": [
      {
        "label": "OSDMA certified category benchmark facility",
        "met": true
      },
      {
        "label": "Unbreachable during highest astronomical tide + 6m surge",
        "met": true
      }
    ]
  },
  {
    "id": "site-puri-mpcs",
    "name": "Brahmagiri Multi-Purpose Cyclone Shelter",
    "facilityType": "OSDMA NCRMP Cyclone Safe Haven",
    "district": "Puri",
    "state": "Odisha",
    "region": "Eastern Coastal Plains",
    "block": "Brahmagiri",
    "location": {
      "lat": 19.805,
      "lng": 85.67,
      "elevation": 15
    },
    "suitability": "HIGH",
    "suitabilityScore": 0.91,
    "capacity": 5000,
    "currentOccupants": 0,
    "maxBeds": 1000,
    "medicalBayBeds": 15,
    "dailyWaterLiters": 10000,
    "powerBackupHours": 48,
    "sanitationUnits": 30,
    "foodStockDays": 10,
    "distanceFromAffected": 14,
    "slopeGrade": "Flat Stilt Elevated",
    "hasRoadAccess": true,
    "hasWaterAccess": true,
    "nearInfrastructure": true,
    "elevationAboveFloodPlane": 12,
    "structuralType": "RCC Category-IV Stilt Hurricane Shelter",
    "managingAgency": "Puri District Administration & OSDMA",
    "amenities": [
      "Rooftop Helipad for Emergency Food Drop",
      "Dual Diesel Generator Sets with 5,000L Fuel Reserve",
      "Separated Maternity and Infant Healthcare Station"
    ],
    "operationalStatus": "READY",
    "lifelineCorridor": "NH-316 (Bhubaneswar-Puri National Highway)",
    "constraints": [
      {
        "label": "Safe from Chilika barrier spit wave breach",
        "met": true
      },
      {
        "label": "Direct evacuation corridor to Puri District Hospital",
        "met": true
      }
    ]
  },
  {
    "id": "site-anantnag-sports",
    "name": "Anantnag Government Degree College Disaster Camp",
    "facilityType": "Terraced Educational & Sports Campus",
    "district": "Anantnag",
    "state": "Jammu & Kashmir",
    "region": "Kashmir Valley",
    "block": "Anantnag",
    "location": {
      "lat": 33.725,
      "lng": 75.148,
      "elevation": 1625
    },
    "suitability": "HIGH",
    "suitabilityScore": 0.89,
    "capacity": 5000,
    "currentOccupants": 0,
    "maxBeds": 1000,
    "medicalBayBeds": 15,
    "dailyWaterLiters": 10000,
    "powerBackupHours": 48,
    "sanitationUnits": 30,
    "foodStockDays": 10,
    "distanceFromAffected": 9.5,
    "slopeGrade": "Terraced Carewa (Hillock 3-6\u00b0)",
    "hasRoadAccess": true,
    "hasWaterAccess": true,
    "nearInfrastructure": true,
    "elevationAboveFloodPlane": 35,
    "structuralType": "Multi-Storey Masonry & Reinforced Concrete Complex on Karewa Terrace",
    "managingAgency": "J&K Disaster Management Authority (JKDMA) & District Magistrate",
    "amenities": [
      "High Karewa Topography immune to 2014 catastrophic Jhelum flood level",
      "Govt Medical College Anantnag within 2km",
      "Central Heating & Winterized Thermal Blankets for Cold Climate",
      "Helipad at South Campus Ground"
    ],
    "operationalStatus": "READY",
    "lifelineCorridor": "NH-44 (Srinagar-Jammu National Highway)",
    "constraints": [
      {
        "label": "Completely outside Jhelum river overflow zone",
        "met": true
      },
      {
        "label": "Direct access to national highway artery",
        "met": true
      }
    ]
  },
  {
    "id": "site-sohra-shelter",
    "name": "Sohra Sub-Divisional Civil Emergency Complex",
    "facilityType": "Limestone Plateau Emergency Centre",
    "district": "East Khasi Hills",
    "state": "Meghalaya",
    "region": "Northeastern Hills",
    "block": "Sohra",
    "location": {
      "lat": 25.295,
      "lng": 91.718,
      "elevation": 1475
    },
    "suitability": "HIGH",
    "suitabilityScore": 0.9,
    "capacity": 3800,
    "currentOccupants": 0,
    "maxBeds": 1000,
    "medicalBayBeds": 15,
    "dailyWaterLiters": 10000,
    "powerBackupHours": 48,
    "sanitationUnits": 30,
    "foodStockDays": 10,
    "distanceFromAffected": 5.2,
    "slopeGrade": "Gentle (2-5\u00b0)",
    "hasRoadAccess": true,
    "hasWaterAccess": true,
    "nearInfrastructure": true,
    "elevationAboveFloodPlane": 90,
    "structuralType": "Heavy Reinforced Concrete Administrative Complex on Massive Sandstone Plateau",
    "managingAgency": "Meghalaya State Disaster Management Authority (SDMA)",
    "amenities": [
      "Sub-Divisional Hospital Sohra in Adjacent Wing",
      "Protected from Waterfall Escarpment Landslips",
      "Rainwater Reservoir System with High-Volume Filtration"
    ],
    "operationalStatus": "READY",
    "lifelineCorridor": "Shillong-Sohra Road (SH-5)",
    "constraints": [
      {
        "label": "Central plateau location far from gorge rim",
        "met": true
      },
      {
        "label": "Reliable all-weather lifeline to Shillong state capital",
        "met": true
      }
    ]
  },
  {
    "id": "site-imphal-complex",
    "name": "Khuman Lampak Main Stadium Safe Refuge Enclave",
    "facilityType": "State Central Sports & Relief Complex",
    "district": "Noney",
    "state": "Manipur",
    "region": "Northeastern Hills",
    "block": "Imphal Valley Central",
    "location": {
      "lat": 24.815,
      "lng": 93.945,
      "elevation": 790
    },
    "suitability": "HIGH",
    "suitabilityScore": 0.93,
    "capacity": 8500,
    "currentOccupants": 0,
    "maxBeds": 1000,
    "medicalBayBeds": 15,
    "dailyWaterLiters": 10000,
    "powerBackupHours": 48,
    "sanitationUnits": 30,
    "foodStockDays": 10,
    "distanceFromAffected": 32,
    "slopeGrade": "Flat Engineered Ground",
    "hasRoadAccess": true,
    "hasWaterAccess": true,
    "nearInfrastructure": true,
    "elevationAboveFloodPlane": 28,
    "structuralType": "Massive Heavy RCC Concrete Stadium & Multi-Purpose Indoor Halls",
    "managingAgency": "Manipur State Disaster Management Authority & 12th Bn NDRF",
    "amenities": [
      "Capacity to Shelter Over 8,500 Evacuees in Covered Halls",
      "Regional Institute of Medical Sciences (RIMS) Level-1 Trauma Hospital Link",
      "Massive Open Staging Ground for Disaster Supply Truck Convoys",
      "Army Leimakhong Garrison Emergency Airhead Liaison"
    ],
    "operationalStatus": "READY",
    "lifelineCorridor": "NH-37 (Imphal-Jiribam Lifeline Highway)",
    "constraints": [
      {
        "label": "Completely outside mountain landslide zones",
        "met": true
      },
      {
        "label": "High capacity drainage preventing valley waterlogging",
        "met": true
      }
    ]
  },
  {
    "id": "site-kohima-stadium",
    "name": "Indira Gandhi Stadium Disaster Enclave",
    "facilityType": "Ridge Disaster Evacuation Complex",
    "district": "Kohima",
    "state": "Nagaland",
    "region": "Northeastern Hills",
    "block": "Kohima",
    "location": {
      "lat": 25.712,
      "lng": 94.118,
      "elevation": 1490
    },
    "suitability": "HIGH",
    "suitabilityScore": 0.88,
    "capacity": 5500,
    "currentOccupants": 0,
    "maxBeds": 1000,
    "medicalBayBeds": 15,
    "dailyWaterLiters": 10000,
    "powerBackupHours": 48,
    "sanitationUnits": 30,
    "foodStockDays": 10,
    "distanceFromAffected": 8.5,
    "slopeGrade": "Engineered Ridge (3-7\u00b0)",
    "hasRoadAccess": true,
    "hasWaterAccess": true,
    "nearInfrastructure": true,
    "elevationAboveFloodPlane": 110,
    "structuralType": "Reinforced Retaining Wall & Concrete Sports Complex on Solid Bedrock Spur",
    "managingAgency": "NSDMA (Nagaland State Disaster Management Authority)",
    "amenities": [
      "Exceeds Sinking Zone Boundary of Kohima Town",
      "Direct Air Evacuation Helicopter Landing Ground",
      "Emergency Satellite Telecommunications"
    ],
    "operationalStatus": "READY",
    "lifelineCorridor": "NH-29 (Dimapur-Kohima Highway)",
    "constraints": [
      {
        "label": "Stable geological foundation surveyed by GSI North-East",
        "met": true
      },
      {
        "label": "Arterial connectivity to Dimapur plain railhead",
        "met": true
      }
    ]
  },
  {
    "id": "site-wayanad-civil-station",
    "name": "Kalpetta Mini Civil Station & SKMJ Ground",
    "facilityType": "District Administrative Safe Ground",
    "district": "Wayanad",
    "state": "Kerala",
    "region": "Western Ghats",
    "block": "Kalpetta",
    "location": {
      "lat": 11.611,
      "lng": 76.084,
      "elevation": 780
    },
    "suitability": "HIGH",
    "suitabilityScore": 0.91,
    "capacity": 5500,
    "currentOccupants": 0,
    "maxBeds": 1000,
    "medicalBayBeds": 15,
    "dailyWaterLiters": 10000,
    "powerBackupHours": 48,
    "sanitationUnits": 30,
    "foodStockDays": 10,
    "distanceFromAffected": 12.5,
    "slopeGrade": "Gentle (<6\u00b0)",
    "hasRoadAccess": true,
    "hasWaterAccess": true,
    "nearInfrastructure": true,
    "elevationAboveFloodPlane": 120,
    "structuralType": "Reinforced RCC Multi-Storey Administrative Complex",
    "managingAgency": "Wayanad DDMA & Kerala State Disaster Management Authority (KSDMA)",
    "amenities": [
      "120 kVA DG Generator",
      "District Hospital 1.5km",
      "Direct NH-766 Road Corridor",
      "Helipad at SKMJ School Ground"
    ],
    "operationalStatus": "READY",
    "lifelineCorridor": "NH-766 (Kozhikode-Kollegal National Highway)",
    "constraints": [
      {
        "label": "Low slope gradient",
        "met": true
      },
      {
        "label": "Above flood level",
        "met": true
      }
    ]
  },
  {
    "id": "site-idukki-painavu",
    "name": "Painavu Idukki District Stadium Ground",
    "facilityType": "Elevated Sports Complex & Relief Hub",
    "district": "Idukki",
    "state": "Kerala",
    "region": "Western Ghats",
    "block": "Idukki",
    "location": {
      "lat": 9.852,
      "lng": 76.946,
      "elevation": 920
    },
    "suitability": "HIGH",
    "suitabilityScore": 0.88,
    "capacity": 4200,
    "currentOccupants": 0,
    "maxBeds": 1000,
    "medicalBayBeds": 15,
    "dailyWaterLiters": 10000,
    "powerBackupHours": 48,
    "sanitationUnits": 30,
    "foodStockDays": 10,
    "distanceFromAffected": 8.0,
    "slopeGrade": "Engineered Terrace (<5\u00b0)",
    "hasRoadAccess": true,
    "hasWaterAccess": true,
    "nearInfrastructure": true,
    "elevationAboveFloodPlane": 180,
    "structuralType": "Engineered Heavy Column Indoor Pavilion",
    "managingAgency": "Idukki DDMA & DEOC Painavu",
    "amenities": [
      "Solar-Diesel Hybrid Power",
      "20-bed Medical Camp",
      "Direct SH-33 Lifeline"
    ],
    "operationalStatus": "READY",
    "lifelineCorridor": "SH-33 (Thodupuzha-Puliyanmala Road)",
    "constraints": [
      {
        "label": "Engineered drainage",
        "met": true
      },
      {
        "label": "Stable bedrock",
        "met": true
      }
    ]
  },
  {
    "id": "site-kottayam-collectorate",
    "name": "Kottayam Collectorate High Ground Shelter",
    "facilityType": "District Civic Enclave",
    "district": "Kottayam",
    "state": "Kerala",
    "region": "Coastal & Backwaters",
    "block": "Kottayam",
    "location": {
      "lat": 9.591,
      "lng": 76.522,
      "elevation": 35
    },
    "suitability": "HIGH",
    "suitabilityScore": 0.93,
    "capacity": 6000,
    "currentOccupants": 0,
    "maxBeds": 1000,
    "medicalBayBeds": 15,
    "dailyWaterLiters": 10000,
    "powerBackupHours": 48,
    "sanitationUnits": 30,
    "foodStockDays": 10,
    "distanceFromAffected": 10.4,
    "slopeGrade": "Elevated Ridge (<4\u00b0)",
    "hasRoadAccess": true,
    "hasWaterAccess": true,
    "nearInfrastructure": true,
    "elevationAboveFloodPlane": 30,
    "structuralType": "Multi-tier RCC Disaster Center",
    "managingAgency": "Kottayam District Administration",
    "amenities": [
      "Water Filtration Unit",
      "Direct MC Road Lifeline Access",
      "Helicopter Triage Pad"
    ],
    "operationalStatus": "READY",
    "lifelineCorridor": "SH-1 (Main Central MC Road)",
    "constraints": [
      {
        "label": "Safe from Lake Vembanad storm surges",
        "met": true
      }
    ]
  },
  {
    "id": "site-alappuzha-relief",
    "name": "Haripad / Alappuzha Model College Cyclone Shelter",
    "facilityType": "Multi-Purpose Cyclone & Flood Shelter (MPCS)",
    "district": "Alappuzha",
    "state": "Kerala",
    "region": "Coastal & Backwaters",
    "block": "Haripad",
    "location": {
      "lat": 9.288,
      "lng": 76.462,
      "elevation": 18
    },
    "suitability": "HIGH",
    "suitabilityScore": 0.89,
    "capacity": 4800,
    "currentOccupants": 0,
    "maxBeds": 1000,
    "medicalBayBeds": 15,
    "dailyWaterLiters": 10000,
    "powerBackupHours": 48,
    "sanitationUnits": 30,
    "foodStockDays": 10,
    "distanceFromAffected": 4.5,
    "slopeGrade": "Elevated Mound",
    "hasRoadAccess": true,
    "hasWaterAccess": true,
    "nearInfrastructure": true,
    "elevationAboveFloodPlane": 14,
    "structuralType": "RCC Stilt Structure",
    "managingAgency": "NDMA / Alappuzha DDMA",
    "amenities": [
      "Rooftop Solar Array",
      "Water Tankers",
      "Ambulance Station"
    ],
    "operationalStatus": "READY",
    "lifelineCorridor": "NH-66 (Panvel-Kanyakumari Highway)",
    "constraints": [
      {
        "label": "Stilt elevation protects against 4m flood surge",
        "met": true
      }
    ]
  }
];
