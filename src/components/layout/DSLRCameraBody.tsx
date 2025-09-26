import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  Battery
} from "lucide-react";

interface DSLRCameraBodyProps {
  children: React.ReactNode;
}

export const DSLRCameraBody = ({ children }: DSLRCameraBodyProps) => {
  const [mode, setMode] = useState("M");
  const [focusMode, setFocusMode] = useState("AF");

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

          {/* Center Brand Area */}
          <div className="flex-1 flex justify-center">
            <div className="bg-gradient-to-r from-camera-metal/20 via-camera-metal/30 to-camera-metal/20 px-6 py-2 rounded-lg shadow-3d-inset border border-camera-metal/40">
              <div className="text-camera-accent font-bold text-lg tracking-wider">NANO BANANA D6</div>
              <div className="text-camera-metal text-xs text-center">Professional AI Editor</div>
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-3">
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

            {/* Power Button */}
            <Button 
              size="sm"
              className="h-10 w-10 p-0 bg-gradient-button-3d shadow-3d-button border border-camera-metal/30 rounded-full"
            >
              <Power className="h-4 w-4 text-success" />
            </Button>

            {/* Shutter Button */}
            <div className="relative">
              <Button 
                size="lg"
                className="h-16 w-16 p-0 bg-gradient-to-br from-camera-accent via-camera-accent/80 to-camera-accent/60 shadow-3d-button border-2 border-camera-accent/50 rounded-full hover:from-camera-accent/90 hover:to-camera-accent/70 transition-all duration-200 transform hover:scale-105"
              >
                <Camera className="h-6 w-6 text-background" />
              </Button>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full shadow-glow animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Main Screen Area (LCD) */}
        <div className="bg-background border-4 border-camera-metal/60 rounded-2xl shadow-3d-inset overflow-hidden mb-4">
          <div className="border-2 border-camera-metal/20 rounded-xl overflow-hidden">
            {children}
          </div>
        </div>

        {/* Bottom Camera Controls */}
        <div className="flex justify-between items-center">
          {/* Left Control Group */}
          <div className="flex items-center space-x-4">
            {/* AF/MF Switch */}
            <div className="bg-gradient-button-3d shadow-3d-button border border-camera-metal/30 rounded-full p-1">
              <div className="flex">
                <Button 
                  size="sm"
                  onClick={() => setFocusMode("AF")}
                  className={`h-6 px-3 text-xs rounded-l-full ${
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
                  className={`h-6 px-3 text-xs rounded-r-full ${
                    focusMode === "MF" 
                      ? "bg-camera-accent text-background shadow-3d-inset" 
                      : "bg-transparent text-camera-metal hover:bg-camera-metal/20"
                  }`}
                >
                  MF
                </Button>
              </div>
            </div>

            {/* Drive Mode */}
            <Button 
              size="sm" 
              className="h-8 px-4 bg-gradient-button-3d shadow-3d-button text-xs border border-camera-metal/30"
            >
              <Timer className="h-3 w-3 mr-1" />
              S
            </Button>

            {/* Metering */}
            <Button 
              size="sm" 
              className="h-8 px-4 bg-gradient-button-3d shadow-3d-button text-xs border border-camera-metal/30"
            >
              <Sun className="h-3 w-3 mr-1" />
              M
            </Button>
          </div>

          {/* Center Status Display */}
          <div className="flex items-center space-x-6 bg-gradient-to-r from-camera-metal/10 via-camera-metal/20 to-camera-metal/10 px-6 py-2 rounded-lg shadow-3d-inset border border-camera-metal/30">
            <div className="text-center">
              <div className="text-xs text-camera-metal">f/</div>
              <div className="text-sm font-bold text-camera-accent">2.8</div>
            </div>
            <div className="w-px h-8 bg-camera-metal/40"></div>
            <div className="text-center">
              <div className="text-xs text-camera-metal">ISO</div>
              <div className="text-sm font-bold text-camera-accent">400</div>
            </div>
            <div className="w-px h-8 bg-camera-metal/40"></div>
            <div className="text-center">
              <div className="text-xs text-camera-metal">1/</div>
              <div className="text-sm font-bold text-camera-accent">125</div>
            </div>
          </div>

          {/* Right Control Group */}
          <div className="flex items-center space-x-4">
            {/* Exposure Compensation */}
            <Button 
              size="sm" 
              className="h-8 px-4 bg-gradient-button-3d shadow-3d-button text-xs border border-camera-metal/30"
            >
              <Aperture className="h-3 w-3 mr-1" />
              +/-
            </Button>

            {/* Flash Control */}
            <Button 
              size="sm" 
              className="h-8 px-4 bg-gradient-button-3d shadow-3d-button text-xs border border-camera-metal/30"
            >
              <Zap className="h-3 w-3 mr-1" />
              TTL
            </Button>

            {/* Menu Button */}
            <Button 
              size="sm" 
              className="h-8 w-12 bg-gradient-button-3d shadow-3d-button text-xs border border-camera-metal/30"
            >
              <Settings2 className="h-3 w-3" />
            </Button>

            {/* Playback */}
            <Button 
              size="sm" 
              className="h-8 w-12 bg-gradient-button-3d shadow-3d-button text-xs border border-camera-metal/30"
            >
              <Video className="h-3 w-3" />
            </Button>
          </div>
        </div>

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