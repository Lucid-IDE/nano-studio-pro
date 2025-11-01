import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Power,
  Camera,
  Video,
  Settings2,
  RotateCcw,
  Zap,
  Sun,
  Aperture,
  Timer,
  Focus,
  Wifi,
  Battery,
  Download,
  Layers3,
  Undo2,
  Redo2,
  Save,
  Grid3x3,
  Eye,
  ToggleLeft,
  ToggleRight,
  Box,
  Pencil,
  CircleDot,
  Image
} from "lucide-react";

interface DSLRCameraBodyProps {
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  videoTimeline?: React.ReactNode;
  showGrid?: boolean;
  onGridToggle?: (show: boolean) => void;
  showOverlay?: boolean;
  onOverlayToggle?: (show: boolean) => void;
  overlayMode?: string;
  onOverlayModeChange?: (mode: string) => void;
  show3DCube?: boolean;
  onShow3DCubeToggle?: (show: boolean) => void;
  showSketch?: boolean;
  onShowSketchToggle?: (show: boolean) => void;
  showCanvasTo3D?: boolean;
  onShowCanvasTo3DToggle?: (show: boolean) => void;
  showCameraFrustum?: boolean;
  onShowCameraFrustumToggle?: (show: boolean) => void;
  aperture?: number;
  iso?: number;
  shutterSpeed?: number;
  exposure?: number;
  onApertureChange?: (value: number) => void;
  onIsoChange?: (value: number) => void;
  onShutterSpeedChange?: (value: number) => void;
  onExposureChange?: (value: number) => void;
}

export const DSLRCameraBody = ({ 
  children, 
  activeTab = "editor", 
  setActiveTab = () => {},
  videoTimeline,
  showGrid = false,
  onGridToggle = () => {},
  showOverlay = true,
  onOverlayToggle = () => {},
  overlayMode = "grid focus",
  onOverlayModeChange = () => {},
  show3DCube = false,
  onShow3DCubeToggle = () => {},
  showSketch = false,
  onShowSketchToggle = () => {},
  showCanvasTo3D = false,
  onShowCanvasTo3DToggle = () => {},
  showCameraFrustum = false,
  onShowCameraFrustumToggle = () => {},
  aperture = 2.8,
  iso = 400,
  shutterSpeed = 125,
  exposure = 0,
  onApertureChange = () => {},
  onIsoChange = () => {},
  onShutterSpeedChange = () => {},
  onExposureChange = () => {}
}: DSLRCameraBodyProps) => {
  const [mode, setMode] = useState("M");
  const [focusMode, setFocusMode] = useState("AF");
  const [lightMode, setLightMode] = useState<"M" | "TTL">("TTL");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-black p-4">
      {/* Camera Body Container */}
      <div className="max-w-[1600px] mx-auto bg-gradient-camera-body rounded-3xl shadow-camera-body border-2 border-camera-metal/30 p-6 relative">
        
        {/* Top Camera Controls */}
        <div className="flex justify-between items-start mb-4">
          {/* Left Side Controls */}
          <div className="flex items-center space-x-3">
            {/* Mode Dial */}
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-dial-3d rounded-full shadow-3d-dial border border-camera-metal/40 relative overflow-hidden">
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-camera-metal/20 to-camera-metal/5">
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-camera-accent">
                    {mode}
                  </div>
                </div>
                {/* Mode indicators around dial */}
                <div className="absolute inset-0">
                  {["M", "A", "S", "P", "AUTO"].map((m, i) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`absolute text-[10px] font-medium transition-colors ${
                        m === mode ? "text-camera-accent" : "text-camera-metal"
                      }`}
                      style={{
                        transform: `rotate(${i * 72}deg) translateY(-24px) rotate(-${i * 72}deg)`,
                        top: "50%",
                        left: "50%",
                        transformOrigin: "0 0"
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Command Dial */}
            <div className="w-12 h-12 bg-gradient-button-3d rounded-full shadow-3d-button border border-camera-metal/30 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-camera-metal/30 to-camera-metal/10 rounded-full flex items-center justify-center">
                <div className="w-1 h-4 bg-camera-accent/60 rounded-full"></div>
              </div>
            </div>

            {/* Function Buttons */}
            <div className="flex flex-col space-y-1">
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 w-8 p-0 bg-gradient-button-3d shadow-3d-button text-[10px] border border-camera-metal/30"
              >
                ISO
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 w-8 p-0 bg-gradient-button-3d shadow-3d-button text-[10px] border border-camera-metal/30"
              >
                WB
              </Button>
            </div>
          </div>

          {/* Center Navigation & Controls - Integrated into Camera Body */}
          <div className="flex-1 flex flex-col items-center space-y-2 max-w-4xl mx-4">
            {/* Brand Area */}
            <div className="bg-gradient-to-r from-camera-metal/20 via-camera-metal/30 to-camera-metal/20 px-6 py-2 rounded-lg shadow-3d-inset border border-camera-metal/40">
              <div className="text-camera-accent font-bold text-lg tracking-wider" style={{ fontFamily: 'serif' }}>NANO BANANA D6</div>
              <div className="text-camera-metal text-xs text-center">Professional AI Editor</div>
            </div>

            {/* Navigation Tabs - Camera Style */}
            <div className="flex items-center space-x-1 bg-gradient-to-r from-camera-metal/10 via-camera-metal/20 to-camera-metal/10 px-4 py-2 rounded-xl shadow-3d-inset border border-camera-metal/40">
              {[
                { id: "editor", name: "MAIN", icon: Camera },
                { id: "composer", name: "COMPOSER", icon: Layers3 },
                { id: "settings", name: "SETTINGS", icon: Settings2 },
                { id: "preview", name: "EXPORT", icon: Download },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-3 text-xs font-medium bg-gradient-button-3d shadow-3d-button border border-camera-metal/30 ${
                      activeTab === tab.id 
                        ? "text-camera-accent shadow-3d-inset" 
                        : "text-camera-metal hover:text-foreground"
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {tab.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-3">
            {/* Camera Control Buttons - 3D Style */}
            <div className="flex items-center space-x-2 bg-gradient-to-r from-camera-metal/10 via-camera-metal/20 to-camera-metal/10 px-3 py-2 rounded-xl shadow-3d-inset border border-camera-metal/40">
              {/* Aperture Dial */}
              <div className="flex flex-col items-center">
                <div className="text-[8px] text-camera-metal uppercase">Aperture</div>
                <div className="relative w-12 h-12 bg-gradient-dial-3d rounded-full shadow-3d-dial border border-camera-metal/40">
                  <input
                    type="range"
                    min="1.4"
                    max="22"
                    step="0.1"
                    value={aperture}
                    onChange={(e) => onApertureChange(parseFloat(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-camera-metal/20 to-camera-metal/5 flex items-center justify-center">
                    <div className="text-[10px] font-bold text-camera-accent">f/{aperture.toFixed(1)}</div>
                  </div>
                </div>
              </div>

              {/* ISO Dial */}
              <div className="flex flex-col items-center">
                <div className="text-[8px] text-camera-metal uppercase">ISO</div>
                <div className="relative w-12 h-12 bg-gradient-dial-3d rounded-full shadow-3d-dial border border-camera-metal/40">
                  <input
                    type="range"
                    min="100"
                    max="6400"
                    step="100"
                    value={iso}
                    onChange={(e) => onIsoChange(parseInt(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-camera-metal/20 to-camera-metal/5 flex items-center justify-center">
                    <div className="text-[10px] font-bold text-camera-accent">{iso}</div>
                  </div>
                </div>
              </div>

              {/* Shutter Speed Dial */}
              <div className="flex flex-col items-center">
                <div className="text-[8px] text-camera-metal uppercase">Shutter</div>
                <div className="relative w-12 h-12 bg-gradient-dial-3d rounded-full shadow-3d-dial border border-camera-metal/40">
                  <input
                    type="range"
                    min="30"
                    max="8000"
                    step="10"
                    value={shutterSpeed}
                    onChange={(e) => onShutterSpeedChange(parseInt(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-camera-metal/20 to-camera-metal/5 flex items-center justify-center">
                    <div className="text-[9px] font-bold text-camera-accent">1/{shutterSpeed}</div>
                  </div>
                </div>
              </div>

              {/* EV Dial */}
              <div className="flex flex-col items-center">
                <div className="text-[8px] text-camera-metal uppercase">EV</div>
                <div className="relative w-12 h-12 bg-gradient-dial-3d rounded-full shadow-3d-dial border border-camera-metal/40">
                  <input
                    type="range"
                    min="-3"
                    max="3"
                    step="0.3"
                    value={exposure}
                    onChange={(e) => onExposureChange(parseFloat(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-camera-metal/20 to-camera-metal/5 flex items-center justify-center">
                    <div className={`text-[10px] font-bold ${
                      exposure > 0 ? 'text-amber-400' : exposure < 0 ? 'text-blue-400' : 'text-camera-accent'
                    }`}>
                      {exposure > 0 ? '+' : ''}{exposure.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AF/MF Switch */}
            <div className="bg-gradient-button-3d shadow-3d-button border border-camera-metal/30 rounded-full p-1">
              <div className="flex">
                <Button 
                  size="sm"
                  onClick={() => setFocusMode("AF")}
                  className={`h-7 px-3 text-xs rounded-l-full ${
                    focusMode === "AF" 
                      ? "bg-camera-accent text-background shadow-3d-inset" 
                      : "bg-transparent text-camera-metal hover:bg-camera-metal/20"
                  }`}
                >
                  AF
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setFocusMode("MF")}
                  className={`h-7 px-3 text-xs rounded-r-full ${
                    focusMode === "MF" 
                      ? "bg-camera-accent text-background shadow-3d-inset" 
                      : "bg-transparent text-camera-metal hover:bg-camera-metal/20"
                  }`}
                >
                  MF
                </Button>
              </div>
            </div>

            {/* Timer Button */}
            <Button 
              size="sm" 
              className="h-9 w-9 p-0 bg-gradient-button-3d shadow-3d-button border border-camera-metal/30 rounded-full"
            >
              <Timer className="h-4 w-4" />
            </Button>

            {/* Light Mode (M/TTL) */}
            <div className="bg-gradient-button-3d shadow-3d-button border border-camera-metal/30 rounded-full p-1">
              <div className="flex">
                <Button 
                  size="sm"
                  onClick={() => setLightMode("M")}
                  className={`h-7 px-3 text-xs rounded-l-full ${
                    lightMode === "M" 
                      ? "bg-camera-accent text-background shadow-3d-inset" 
                      : "bg-transparent text-camera-metal hover:bg-camera-metal/20"
                  }`}
                >
                  <Sun className="h-3 w-3 mr-1" />M
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setLightMode("TTL")}
                  className={`h-7 px-3 text-xs rounded-r-full ${
                    lightMode === "TTL" 
                      ? "bg-camera-accent text-background shadow-3d-inset" 
                      : "bg-transparent text-camera-metal hover:bg-camera-metal/20"
                  }`}
                >
                  <Zap className="h-3 w-3 mr-1" />TTL
                </Button>
              </div>
            </div>

            {/* Settings Button */}
            <Button 
              size="sm" 
              className="h-9 w-9 p-0 bg-gradient-button-3d shadow-3d-button border border-camera-metal/30 rounded-full"
            >
              <Settings2 className="h-4 w-4" />
            </Button>

            {/* Video Button */}
            <Button 
              size="sm" 
              className="h-9 w-9 p-0 bg-gradient-button-3d shadow-3d-button border border-camera-metal/30 rounded-full"
            >
              <Video className="h-4 w-4" />
            </Button>

            <div className="w-px h-12 bg-camera-metal/40"></div>

            {/* Status Indicators */}
            <div className="flex flex-col items-end space-y-1">
              <div className="flex items-center space-x-1">
                <Wifi className="h-3 w-3 text-success" />
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-1">
                <Battery className="h-3 w-3 text-camera-accent" />
                <div className="text-xs text-camera-metal">98%</div>
              </div>
            </div>

            {/* Shutter Button - Generate Function */}
            <div className="relative">
              <Button 
                size="lg"
                className="h-16 w-16 p-0 bg-gradient-to-br from-camera-accent via-camera-accent/80 to-camera-accent/60 shadow-3d-button border-2 border-camera-accent/50 rounded-full hover:from-camera-accent/90 hover:to-camera-accent/70 transition-all duration-200 transform hover:scale-105 active:scale-95"
                title="Generate Image - Click to create with AI"
              >
                <Zap className="h-6 w-6 text-background" />
              </Button>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full shadow-glow animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Second Row: Overlay Controls */}
        <div className="flex justify-center items-center space-x-2 px-4 pb-2">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-camera-metal/10 via-camera-metal/20 to-camera-metal/10 px-4 py-2 rounded-xl shadow-3d-inset border border-camera-metal/40">
            <Button
              size="sm"
              variant={showGrid ? "default" : "ghost"}
              onClick={() => onGridToggle(!showGrid)}
              className="h-8 px-3 bg-gradient-button-3d shadow-3d-button border border-camera-metal/30 text-xs"
              title="Toggle Grid Overlay"
            >
              <Grid3x3 className="h-3 w-3 mr-1" />
              Grid
            </Button>
            <Button
              size="sm"
              variant={showOverlay ? "default" : "ghost"}
              onClick={() => onOverlayToggle(!showOverlay)}
              className="h-8 px-3 bg-gradient-button-3d shadow-3d-button border border-camera-metal/30 text-xs"
              title="Toggle LCD Overlay"
            >
              <Eye className="h-3 w-3 mr-1" />
              LCD
            </Button>
            <Button
              size="sm"
              variant={show3DCube ? "default" : "ghost"}
              onClick={() => onShow3DCubeToggle(!show3DCube)}
              className="h-8 px-3 bg-gradient-button-3d shadow-3d-button border border-camera-metal/30 text-xs"
              title="Toggle 3D Guide"
            >
              <Box className="h-3 w-3 mr-1" />
              3D
            </Button>
            <Button
              size="sm"
              variant={showSketch ? "default" : "ghost"}
              onClick={() => onShowSketchToggle(!showSketch)}
              className="h-8 px-3 bg-gradient-button-3d shadow-3d-button border border-camera-metal/30 text-xs"
              title="Toggle Sketch Overlay"
            >
              <Pencil className="h-3 w-3 mr-1" />
              Sketch
            </Button>
            <Button
              size="sm"
              variant={showCanvasTo3D ? "default" : "ghost"}
              onClick={() => onShowCanvasTo3DToggle(!showCanvasTo3D)}
              className="h-8 px-3 bg-gradient-button-3d shadow-3d-button border border-camera-metal/30 text-xs"
              title="Convert Canvas to 3D"
            >
              <Image className="h-3 w-3 mr-1" />
              Canvas3D
            </Button>
            <Button
              size="sm"
              variant={showCameraFrustum ? "default" : "ghost"}
              onClick={() => onShowCameraFrustumToggle(!showCameraFrustum)}
              className="h-8 px-3 bg-gradient-button-3d shadow-3d-button border border-camera-metal/30 text-xs"
              title="Toggle Camera Frustum"
            >
              <CircleDot className="h-3 w-3 mr-1" />
              Camera
            </Button>
          </div>
        </div>

        {/* Main Screen Area (LCD) */}
        <div className="bg-background border-4 border-camera-metal/60 rounded-2xl shadow-3d-inset overflow-visible mb-4">
          <div className="border-2 border-camera-metal/20 rounded-xl overflow-visible">
            {children}
          </div>
        </div>

        {/* Bottom: Video Timeline */}
        {videoTimeline && (
          <div className="bg-gradient-to-r from-camera-metal/5 via-camera-metal/10 to-camera-metal/5 border border-camera-metal/30 rounded-lg shadow-3d-inset">
            {videoTimeline}
          </div>
        )}

        {/* Camera Grip Texture */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-32 bg-gradient-camera-grip rounded-l-xl shadow-3d-inset">
          <div className="w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.05)_2px,rgba(255,255,255,0.05)_4px)] rounded-l-xl"></div>
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-32 bg-gradient-camera-grip rounded-r-xl shadow-3d-inset">
          <div className="w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.05)_2px,rgba(255,255,255,0.05)_4px)] rounded-r-xl"></div>
        </div>

        {/* Lens Mount Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-camera-accent/60 rounded-full shadow-glow"></div>
      </div>
    </div>
  );
};