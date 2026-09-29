"""
Optional Adapter: CARTO Spatial Vector & Basemap Services.
Provides high-contrast operational dispatch basemaps and spatial SQL endpoints.
Ready adapter interface — not a mandatory runtime dependency.
"""
from __future__ import annotations


class CartoAdapter:
    def __init__(self, api_key: str = "cb1_3rb7_2_6ffade6a2c1f6d15a74a8aaf", username: str = ""):
        self.api_key = api_key
        self.username = username
        self.is_enabled = bool(api_key)

    @property
    def name(self) -> str:
        return "CARTO Spatial Platform (Optional)"

    def get_basemap_url(self, theme: str = "dark_all") -> str:
        key_param = f"?key={self.api_key}" if self.api_key else ""
        return f"https://{{s}}.basemaps.cartocdn.com/rastertiles/{theme}/{{z}}/{{x}}/{{y}}.png{key_param}"
