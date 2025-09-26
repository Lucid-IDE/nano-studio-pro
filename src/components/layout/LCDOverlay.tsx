import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Grid3X3, 
  Focus, 
  Move3D,
  RotateCw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Eye,
  Settings
} from "lucide-react";

interface LCDOverlayProps {
  showOverlay: boolean;
  overlayMode: string;
}

export const LCDOverlay = ({ showOverlay, overlayMode }: LCDOverlayProps) => {
  const [focusPoints, setFocusPoints] = useState([
    { id: 1, x: 30, y: 40, active: true },
    { id: 2, x: 70, y: 30, active: false },
    { id: 3, x: 50, y: 60, active: false },
  ]);

  if (!showOverlay) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Grid Lines */}
      {overlayMode.includes("grid") && (
        <div className="absolute inset-0">
          {/* Rule of thirds grid */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="border border-camera-accent/30"></div>
            ))}
          </div>
          
          {/* Center cross */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-camera-accent"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-camera-accent"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 border border-camera-accent rounded-full"></div>
          </div>
        </div>
      )}

      {/* Focus Points */}
      {overlayMode.includes("focus") && (
        <div className="absolute inset-0">
          {focusPoints.map((point) => (
            <div
              key={point.id}
              className={`absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 ${
                point.active ? "text-success" : "text-camera-accent/60"
              }`}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            >
              <Focus className="w-full h-full animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Movement Guides */}
      {overlayMode.includes("movement") && (
        <div className="absolute inset-0">
          {/* Pan directions */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex space-x-2 text-camera-accent">
            <div className="flex items-center space-x-1 bg-background/80 rounded px-2 py-1 text-xs">
              <ArrowLeft className="w-3 h-3" />
              <span>PAN</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
          
          {/* Tilt directions */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col space-y-2 text-camera-accent">
            <div className="flex flex-col items-center space-y-1 bg-background/80 rounded px-2 py-1 text-xs">
              <ArrowUp className="w-3 h-3" />
              <span>TILT</span>
              <ArrowDown className="w-3 h-3" />
            </div>
          </div>

          {/* Rotation indicator */}
          <div className="absolute top-4 right-4 flex items-center space-x-1 bg-background/80 rounded px-2 py-1 text-xs text-camera-accent">
            <RotateCw className="w-3 h-3" />
            <span>ROTATE</span>
          </div>

          {/* Movement vector */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-1 bg-background/80 rounded px-2 py-1 text-xs text-camera-accent">
            <Move3D className="w-3 h-3" />
            <span>3D MOVE</span>
          </div>
        </div>
      )}

      {/* Character Analysis Overlay */}
      {overlayMode.includes("character") && (
        <div className="absolute inset-0">
          {/* Character bounds */}
          <div className="absolute left-[25%] top-[20%] w-[50%] h-[60%] border-2 border-success/80 rounded-lg">
            <div className="absolute -top-6 left-0 bg-success/90 text-background text-xs px-2 py-1 rounded">
              CHARACTER DETECTED
            </div>
            
            {/* Key points */}
            <div className="absolute top-[10%] left-[50%] w-1 h-1 bg-success rounded-full"></div>
            <div className="absolute top-[25%] left-[30%] w-1 h-1 bg-success rounded-full"></div>
            <div className="absolute top-[25%] left-[70%] w-1 h-1 bg-success rounded-full"></div>
            <div className="absolute top-[40%] left-[50%] w-1 h-1 bg-success rounded-full"></div>
            <div className="absolute bottom-[30%] left-[40%] w-1 h-1 bg-success rounded-full"></div>
            <div className="absolute bottom-[30%] left-[60%] w-1 h-1 bg-success rounded-full"></div>
            <div className="absolute bottom-0 left-[45%] w-1 h-1 bg-success rounded-full"></div>
            <div className="absolute bottom-0 left-[55%] w-1 h-1 bg-success rounded-full"></div>
          </div>

          {/* Analysis data */}
          <div className="absolute top-4 left-4 bg-background/90 rounded p-2 text-xs space-y-1">
            <div className="text-success font-medium">POSE ANALYSIS</div>
            <div className="text-foreground">Confidence: 94%</div>
            <div className="text-foreground">Angle: 15° Right</div>
            <div className="text-foreground">Distance: 2.4m</div>
          </div>
        </div>
      )}

      {/* Camera Info Display */}
      <div className="absolute bottom-4 right-4 bg-background/90 rounded p-2 text-xs space-y-1 text-foreground">
        <div className="flex items-center space-x-2">
          <Eye className="w-3 h-3 text-camera-accent" />
          <span className="text-camera-accent font-medium">VIEWFINDER</span>
        </div>
        <div>Mode: {overlayMode.toUpperCase()}</div>
        <div>ISO: 400 | f/2.8 | 1/125s</div>
        <div>Focus: AF-S Single</div>
        <div>Metering: Matrix</div>
      </div>

      {/* Frame Counter */}
      <div className="absolute top-4 right-4 bg-background/90 rounded px-3 py-1 text-sm font-mono text-camera-accent">
        [001/999]
      </div>
    </div>
  );
};