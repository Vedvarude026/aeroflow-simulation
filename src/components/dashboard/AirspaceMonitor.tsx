import React, { useState, useRef, useEffect } from 'react';
import { 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Plane, 
  RotateCcw,
  Radio,
  X,
  Clock
} from 'lucide-react';
import { usePlannerStore } from '../../store/usePlannerStore';
import { BASE_COORDINATES } from '../../server/syntheticData';
import { BaseName, Aircraft } from '../../types/index';

export const AirspaceMonitor: React.FC = () => {
  const { 
    fleet, 
    mapLayers, 
    toggleMapLayer, 
    setSelectedAircraft, 
    selectedAircraft, 
    simTime,
    simDateStr
  } = usePlannerStore();

  const [zoom, setZoom] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [layersOpen, setLayersOpen] = useState(false);
  const [hoveredAircraft, setHoveredAircraft] = useState<Aircraft | null>(null);

  // Local filter toggles
  const [filterEnRoute, setFilterEnRoute] = useState(true);
  const [filterDelayed, setFilterDelayed] = useState(true);
  const [filterUnserviceable, setFilterUnserviceable] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const bases = Object.entries(BASE_COORDINATES) as [BaseName, { lat: number; lng: number }][];

  // Map SVG viewport dimensions
  const viewBoxWidth = 1000;
  const viewBoxHeight = 600;

  const toSvgX = (lng: number) => (lng / 100) * viewBoxWidth;
  const toSvgY = (lat: number) => (1 - lat / 100) * viewBoxHeight;

  // Filtered aircraft list based on checkboxes
  const filteredFleet = fleet.filter((ac) => {
    if (!filterUnserviceable && ac.status === 'Unserviceable') return false;
    if (!filterDelayed && ac.status === 'Limited') return false;
    if (!filterEnRoute && ac.status === 'Serviceable') return false;
    return true;
  });

  // Animated Tactical Dark Blue Radar Sweep Canvas Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let sweepAngle = 0;

    const renderCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw radar sweep beam
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.max(canvas.width, canvas.height) * 0.8;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, sweepAngle, sweepAngle + 0.35);
      ctx.closePath();

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
      gradient.addColorStop(0.7, 'rgba(30, 64, 175, 0.15)');
      gradient.addColorStop(1, 'rgba(5, 12, 30, 0.0)');

      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();

      // Draw restricted zone on canvas if enabled
      if (mapLayers.restricted) {
        ctx.save();
        ctx.strokeStyle = '#60A5FA';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(350, 280, 140, 110);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
        ctx.fillRect(350, 280, 140, 110);
        ctx.restore();
      }

      sweepAngle += 0.012;
      animFrameRef.current = requestAnimationFrame(renderCanvas);
    };

    renderCanvas();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [mapLayers.restricted]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleResetView = () => {
    setZoom(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="bg-[#0A122A] border border-[#1E3E6A] rounded-md p-3 flex flex-col gap-2 relative shadow-lg overflow-hidden h-full min-h-[580px] select-none text-[#F8FAFC]">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[#1E3E6A] pb-2 z-20">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#60A5FA] animate-pulse" />
          <span className="text-[11px] font-bold text-[#F8FAFC] uppercase tracking-wider">
            REAL-TIME AIRSPACE MONITOR
          </span>
          <span className="text-[10px] font-mono text-[#93C5FD] bg-[#172554] border border-[#1E3E6A] px-2 py-0.5 rounded font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#60A5FA]" />
            SIM CLOCK: {simTime} ({simDateStr})
          </span>
        </div>

        {/* Top-Right Toggle Layers Button */}
        <div className="relative">
          <button
            onClick={() => setLayersOpen(!layersOpen)}
            className="flex items-center gap-1.5 bg-[#172554] border border-[#1E3E6A] hover:bg-[#1E3A8A] text-[#F8FAFC] px-2.5 py-1 rounded text-xs transition-colors font-medium shadow-2xs"
          >
            <Layers className="w-3.5 h-3.5 text-[#60A5FA]" />
            <span>Toggle Layers</span>
          </button>

          {/* Toggle Layers & Filter Flights Dropdown Panel */}
          {layersOpen && (
            <div className="absolute right-0 mt-1 w-64 bg-[#0D1B2A] border border-[#1E3E6A] rounded-md shadow-2xl p-3 z-50 text-xs text-[#F8FAFC]">
              <div className="flex items-center justify-between border-b border-[#1E3E6A] pb-1.5 mb-2">
                <span className="font-bold text-[#F8FAFC] uppercase text-[10px] tracking-wider">
                  Toggle Layers
                </span>
                <button onClick={() => setLayersOpen(false)} className="text-[#93C5FD] hover:text-[#FFFFFF]">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {Object.entries(mapLayers).map(([layerKey, isEnabled]) => (
                  <label key={layerKey} className="flex items-center gap-2 text-[#93C5FD] cursor-pointer hover:text-[#FFFFFF]">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => toggleMapLayer(layerKey as any)}
                      className="rounded bg-[#0A122A] border-[#1E3E6A] text-[#3B82F6] focus:ring-0 w-3.5 h-3.5"
                    />
                    <span className="capitalize">{layerKey.replace(/([A-Z])/g, ' $1')}</span>
                  </label>
                ))}
              </div>

              <div className="font-bold text-[#F8FAFC] border-b border-[#1E3E6A] pb-1.5 mb-2 uppercase text-[10px] tracking-wider">
                Filter Flights
              </div>
              <div className="flex flex-col gap-1.5 text-[#93C5FD] font-mono">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterEnRoute}
                    onChange={(e) => setFilterEnRoute(e.target.checked)}
                    className="rounded bg-[#0A122A] border-[#1E3E6A] text-[#3B82F6] w-3.5 h-3.5"
                  />
                  <span>Serviceable Sorties</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterDelayed}
                    onChange={(e) => setFilterDelayed(e.target.checked)}
                    className="rounded bg-[#0A122A] border-[#1E3E6A] text-[#3B82F6] w-3.5 h-3.5"
                  />
                  <span>Limited / Delayed</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterUnserviceable}
                    onChange={(e) => setFilterUnserviceable(e.target.checked)}
                    className="rounded bg-[#0A122A] border-[#1E3E6A] text-[#3B82F6] w-3.5 h-3.5"
                  />
                  <span>Unserviceable Aircraft</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Left Controls: Zoom +/- & Reset View */}
      <div className="absolute top-12 left-5 z-30 flex flex-col gap-1 bg-[#0D1B2A]/90 border border-[#1E3E6A] p-1 rounded-md backdrop-blur-sm shadow-md">
        <button
          onClick={() => setZoom(Math.min(2.5, zoom + 0.2))}
          className="p-1.5 hover:bg-[#172554] text-[#93C5FD] hover:text-[#60A5FA] rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(Math.max(0.7, zoom - 0.2))}
          className="p-1.5 hover:bg-[#172554] text-[#93C5FD] hover:text-[#60A5FA] rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          className="p-1.5 hover:bg-[#172554] text-[#93C5FD] hover:text-[#60A5FA] rounded transition-colors"
          title="Reset Map View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Expanded Map Container */}
      <div 
        className={`relative flex-1 w-full min-h-[510px] bg-[#050C1E] rounded-md border border-[#1E3E6A] overflow-hidden ${
          isPanning ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Radar Sweep Canvas Layer */}
        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-90"
        />

        {/* SVG Vector Map Layer */}
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-full relative z-10"
          style={{ 
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`, 
            transformOrigin: 'center center', 
            transition: isPanning ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' 
          }}
        >
          <defs>
            {/* Dark Blue Grid Pattern */}
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1E3E6A" strokeWidth="0.8" opacity="0.6" />
            </pattern>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Lat / Lng Coordinate Markings */}
          <g fill="#60A5FA" fontSize="8" fontFamily="JetBrains Mono" opacity="0.8" className="select-none">
            <text x="20" y="30">25°N 020°E</text>
            <text x="920" y="30">80°N 080°E</text>
            <text x="20" y="580">10°N 020°E</text>
            <text x="920" y="580">10°N 080°E</text>
          </g>

          {/* Stylized Synthetic Landmasses & Coastlines */}
          <path
            d="M 40 80 Q 180 60, 290 140 T 460 210 T 610 170 T 820 230 T 960 190 L 960 560 Q 820 590, 670 510 T 390 490 T 190 550 L 40 560 Z"
            fill="#0E223D"
            stroke="#1E3E6A"
            strokeWidth="1.5"
          />

          {/* Base Markers & Range Rings */}
          {bases.map(([name, coords]) => {
            const x = toSvgX(coords.lng);
            const y = toSvgY(coords.lat);

            return (
              <g key={name} transform={`translate(${x}, ${y})`}>
                <circle r="22" fill="none" stroke="#3B82F6" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.7" />
                <circle r="8" fill="#0D1B2A" stroke="#60A5FA" strokeWidth="2" />
                <circle r="3" fill="#60A5FA" />
                <text
                  x="12"
                  y="4"
                  fill="#F8FAFC"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                  className="select-none pointer-events-none drop-shadow-md"
                >
                  {name}
                </text>
              </g>
            );
          })}

          {/* Aircraft Rotated by Heading with Callout Telemetry Labels */}
          {filteredFleet.map((ac) => {
            const x = toSvgX(ac.position.lng);
            const y = toSvgY(ac.position.lat);
            const isSelected = selectedAircraft?.id === ac.id;

            return (
              <g
                key={ac.id}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer group transition-transform duration-500 ease-out"
                onClick={() => setSelectedAircraft(ac)}
                onMouseEnter={() => setHoveredAircraft(ac)}
                onMouseLeave={() => setHoveredAircraft(null)}
              >
                {/* Ping ring if selected */}
                {isSelected && (
                  <circle r="18" fill="none" stroke="#60A5FA" strokeWidth="1.5" className="animate-ping" />
                )}

                {/* Plane Icon rotated by heading */}
                <g transform={`rotate(${ac.heading})`}>
                  <polygon
                    points="0,-9 7,9 0,6 -7,9"
                    fill="#3B82F6"
                    stroke="#F8FAFC"
                    strokeWidth="1"
                  />
                </g>

                {/* Callout Label Box: ID + Altitude + Speed */}
                <g transform="translate(10, -10)">
                  <rect
                    width="64"
                    height="14"
                    rx="2"
                    fill="#0D1B2A"
                    stroke="#1E3E6A"
                    strokeWidth="0.8"
                    opacity="0.95"
                  />
                  <text
                    x="4"
                    y="10"
                    fill="#E2E8F0"
                    fontSize="8"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {ac.id.replace('-', '')} {ac.altitude} {ac.speed}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Hover / Selection Aircraft Telemetry Card Overlay */}
        {(hoveredAircraft || selectedAircraft) && (
          <div className="absolute bottom-3 left-3 bg-[#0D1B2A]/95 border border-[#1E3E6A] p-3 rounded-md shadow-xl text-xs backdrop-blur max-w-xs z-40 select-text text-[#F8FAFC]">
            {(() => {
              const ac = hoveredAircraft || selectedAircraft!;
              return (
                <div className="flex flex-col gap-1.5 font-mono">
                  <div className="flex items-center justify-between font-bold border-b border-[#1E3E6A] pb-1.5">
                    <span className="text-[#F8FAFC] flex items-center gap-1.5">
                      <Plane className="w-3.5 h-3.5 text-[#60A5FA]" />
                      {ac.id} ({ac.type})
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-[#172554] text-[#60A5FA] font-bold border border-[#1E3E6A]">
                      {ac.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-[#93C5FD]">
                    <div>Station: <span className="text-[#F8FAFC] font-bold">{ac.currentBase}</span></div>
                    <div>Heading: <span className="text-[#F8FAFC] font-bold">{ac.heading}°</span></div>
                    <div>Altitude: <span className="text-[#F8FAFC] font-bold">{ac.altitude * 100} ft</span></div>
                    <div>Airspeed: <span className="text-[#F8FAFC] font-bold">{ac.speed} kt</span></div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Bottom Right Mini Legend */}
        <div className="absolute bottom-3 right-3 bg-[#0D1B2A]/90 border border-[#1E3E6A] px-2.5 py-1.5 rounded text-[10px] font-mono text-[#93C5FD] backdrop-blur z-30 flex items-center gap-3 shadow-md">
          <span className="font-bold text-[#F8FAFC] uppercase">Radar Telemetry:</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#60A5FA]" /> Active</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#93C5FD]" /> Limited</span>
        </div>
      </div>
    </div>
  );
};
