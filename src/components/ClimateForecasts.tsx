import React, { useState, useEffect } from 'react';
import {
  CloudRain,
  Sun,
  Droplet,
  Wind,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Compass,
  Calendar,
  CheckCircle2,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { ClimateRiskForecast } from '../types/disaster';
import { CLIMATE_FORECAST_DATA } from '../data/mockAndHistoricalData';

export const ClimateForecasts: React.FC = () => {
  const [forecasts] = useState<ClimateRiskForecast[]>(CLIMATE_FORECAST_DATA);
  const [selectedForecast, setSelectedForecast] = useState<ClimateRiskForecast>(CLIMATE_FORECAST_DATA[0]);
  const [liveWeather, setLiveWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Fetch live Open-Meteo weather data for selected forecast coordinates
  useEffect(() => {
    let isCancelled = false;

    async function fetchWeather() {
      setWeatherLoading(true);
      try {
        const [lat, lng] = selectedForecast.coordinates;
        const res = await fetch(`/api/weather/risk?lat=${lat}&lng=${lng}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!isCancelled) setLiveWeather(data);
      } catch (err) {
        console.warn('Weather fetch error:', err);
      } finally {
        if (!isCancelled) setWeatherLoading(false);
      }
    }

    fetchWeather();

    return () => {
      isCancelled = true;
    };
  }, [selectedForecast.id]);

  const getHazardBadge = (hazard: string) => {
    switch (hazard) {
      case 'flood':
        return { icon: <CloudRain className="w-4 h-4 text-cyan-400" />, label: 'Flood Risk Model', color: 'text-cyan-400 border-cyan-500/30' };
      case 'heatwave':
        return { icon: <Sun className="w-4 h-4 text-amber-400" />, label: 'Extreme Heat Stress', color: 'text-amber-400 border-amber-500/30' };
      case 'drought':
        return { icon: <Droplet className="w-4 h-4 text-orange-400" />, label: 'Drought & Water Deficit', color: 'text-orange-400 border-orange-500/30' };
      default:
        return { icon: <AlertTriangle className="w-4 h-4 text-rose-400" />, label: 'Climate Risk', color: 'text-rose-400 border-rose-500/30' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <CloudRain className="w-4 h-4" />
            <span>Multi-Hazard Climate Forecasting & Early Warning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Climate Risk Intelligence: Flood, Heat & Drought
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Predictive modeling combining Open-Meteo High-Resolution Ensemble, CWC Hydrology, and WRF Meso-Scale Weather.
          </p>
        </div>

        {/* Selected Horizon Badge */}
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-lg p-2 shrink-0">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Operational Window: 24h to 14 Days</span>
        </div>
      </div>

      {/* 3 Interactive Hazard Models Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {forecasts.map((fc) => {
          const isSelected = selectedForecast.id === fc.id;
          const badge = getHazardBadge(fc.hazard);

          return (
            <div
              key={fc.id}
              onClick={() => setSelectedForecast(fc)}
              className={`p-5 rounded-xl border transition-all cursor-pointer text-left space-y-3 ${
                isSelected
                  ? 'bg-slate-900/90 border-rose-500 shadow-xl ring-1 ring-rose-500/20'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {badge.icon}
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    {badge.label}
                  </span>
                </div>
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                  fc.riskLevel === 'Critical' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                  fc.riskLevel === 'High' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                  'bg-blue-950 text-blue-400 border border-blue-800'
                }`}>
                  {fc.riskLevel} Risk ({fc.probabilityPercent}%)
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white line-clamp-1">{fc.locationName}</h3>
                <span className="text-xs text-slate-400 mt-0.5 block">{fc.forecastHorizon}</span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-[180px]">{fc.sourceModel}</span>
                <span className="text-emerald-400">{fc.dataFreshness}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Forecast Detail Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Indicators & Guidance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Hydrological / Meteorological Indicators */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-400" />
              <span>Diagnostic Risk Drivers & Physical Measurements</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedForecast.keyIndicators.map((ind, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <span className="text-xs text-slate-400 block">{ind.label}</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold font-mono text-white tabular-nums">
                      {ind.value}
                    </span>
                    <span className={`text-[11px] font-medium flex items-center gap-1 ${
                      ind.trend === 'rising' ? 'text-rose-400' :
                      ind.trend === 'falling' ? 'text-cyan-400' : 'text-slate-400'
                    }`}>
                      {ind.trend === 'rising' ? '▲ Rising' : ind.trend === 'falling' ? '▼ Falling' : '■ Steady'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Preparedness Guidance */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Recommended Preparedness & Response Measures</span>
            </h3>

            <div className="space-y-3">
              {selectedForecast.precautionaryGuidance.map((step, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-200 flex items-start gap-3">
                  <span className="font-mono text-rose-400 font-bold shrink-0 mt-0.5">#{i + 1}</span>
                  <p className="leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Live Atmospheric Telemetry via Open-Meteo */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Sensor Telemetry
              </h3>
              {weatherLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-400" />}
            </div>

            {liveWeather ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Ambient Temperature</span>
                  <span className="font-mono text-base font-bold text-white">
                    {liveWeather.current.tempC.toFixed(1)} °C
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Heat Index (Apparent)</span>
                  <span className="font-mono text-base font-bold text-amber-400">
                    {liveWeather.current.apparentTempC.toFixed(1)} °C
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Relative Humidity</span>
                  <span className="font-mono text-base font-bold text-cyan-400">
                    {liveWeather.current.humidityPercent}%
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">24h Precipitation Sum</span>
                  <span className="font-mono text-base font-bold text-emerald-400">
                    {liveWeather.current.dailyRainSumMm.toFixed(1)} mm
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Sustained Wind Speed</span>
                  <span className="font-mono text-base font-bold text-purple-400">
                    {liveWeather.current.windKmh.toFixed(1)} km/h
                  </span>
                </div>

                <div className="pt-2 text-[11px] text-slate-400">
                  <span>Feed Provider: </span>
                  <span className="text-slate-300 font-medium">{liveWeather.derivedRisks.forecastModel}</span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                Contacting atmospheric satellite sensor grid...
              </div>
            )}
          </div>

          {/* Model Uncertainty & Baseline Disclaimer */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
            <h4 className="font-semibold text-slate-300">Model Validation & Limitations</h4>
            <p className="leading-relaxed">
              These climate risk outputs use numerical weather prediction models and statistical return periods. We disclose confidence intervals transparently and never claim earthquake or hyper-localized flash flood certainty without ground radar telemetry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
