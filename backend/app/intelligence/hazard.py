"""
Hazard scoring engine.
Transparent, explainable composite risk calculation.
NO black-box AI — every factor is traceable.
"""
from __future__ import annotations
from dataclasses import dataclass


@dataclass
class HazardInput:
    rainfall_anomaly: float = 0.0        # 0-1 normalized
    slope_degree: float = 0.0            # degrees
    elevation: float = 0.0               # meters
    landslide_susceptibility: float = 0.0 # 0-1
    distance_to_river: float = 0.0       # km
    historical_disasters: int = 0
    seismic_zone: int = 0                # 1-5
    glof_exposure: float = 0.0           # 0-1
    population_density: float = 0.0      # people/km²
    region_type: str = "auto"            # "mountainous", "coastal", "plains", or "auto"


@dataclass
class HazardScore:
    overall: float
    landslide: float
    flood: float
    glof: float
    earthquake: float
    contributors: list[str]


def compute_hazard_score(inputs: HazardInput) -> HazardScore:
    """
    Compute composite hazard score from multiple transparent inputs,
    using dynamic formulas (weights) based on the location/region type.
    """
    contributors = []
    
    # Dynamically determine region_type if auto
    region = inputs.region_type
    if region == "auto":
        if inputs.elevation > 1500 or inputs.slope_degree > 15:
            region = "mountainous"
        elif inputs.elevation < 50 and inputs.distance_to_river > 5:
            region = "coastal"
        else:
            region = "plains"
            
    # Dynamic disaster weights based on region
    if region == "mountainous":
        weights = {"landslide": 0.40, "flood": 0.15, "glof": 0.20, "earthquake": 0.15, "historical": 0.10}
    elif region == "coastal":
        weights = {"landslide": 0.05, "flood": 0.50, "glof": 0.0, "earthquake": 0.15, "historical": 0.30}
    else: # plains
        weights = {"landslide": 0.05, "flood": 0.50, "glof": 0.0, "earthquake": 0.25, "historical": 0.20}


    # Landslide score
    landslide = 0.0
    if inputs.landslide_susceptibility > 0.6:
        landslide += 0.4
        contributors.append("High landslide susceptibility")
    elif inputs.landslide_susceptibility > 0.3:
        landslide += 0.2
    if inputs.slope_degree > 30:
        landslide += 0.3
        contributors.append("High slope gradient")
    elif inputs.slope_degree > 15:
        landslide += 0.15
    if inputs.rainfall_anomaly > 0.5:
        landslide += 0.3
        contributors.append("Recent rainfall anomaly")
    elif inputs.rainfall_anomaly > 0.2:
        landslide += 0.15
    landslide = min(landslide, 1.0)

    # Flood score
    flood = 0.0
    if inputs.distance_to_river < 1.0:
        flood += 0.4
        contributors.append("Very close to river")
    elif inputs.distance_to_river < 3.0:
        flood += 0.2
        contributors.append("Near river")
    if inputs.rainfall_anomaly > 0.5:
        flood += 0.3
    if inputs.elevation < 500:
        flood += 0.2
        contributors.append("Low elevation")
    flood = min(flood, 1.0)

    # GLOF score
    glof = inputs.glof_exposure
    if glof > 0.5:
        contributors.append("GLOF exposure from upstream glacial features")

    # Earthquake score
    eq_scores = {5: 0.7, 4: 0.5, 3: 0.3, 2: 0.15, 1: 0.05}
    earthquake = eq_scores.get(inputs.seismic_zone, 0.1)
    if inputs.seismic_zone >= 4:
        contributors.append(f"Seismic Zone {inputs.seismic_zone}")

    # Historical factor
    historical = min(inputs.historical_disasters * 0.15, 0.5)
    if inputs.historical_disasters >= 2:
        contributors.append(f"{inputs.historical_disasters} historical disasters")

    # Weighted composite based on region-specific formula
    overall = (
        weights["landslide"] * landslide +
        weights["flood"] * flood +
        weights["glof"] * glof +
        weights["earthquake"] * earthquake +
        weights["historical"] * historical
    )


    return HazardScore(
        overall=round(min(overall, 1.0), 3),
        landslide=round(landslide, 3),
        flood=round(flood, 3),
        glof=round(glof, 3),
        earthquake=round(earthquake, 3),
        contributors=contributors,
    )
