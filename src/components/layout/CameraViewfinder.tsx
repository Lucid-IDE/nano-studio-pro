import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface CameraViewfinderProps {
  aperture?: number;
  iso?: number;
  shutterSpeed?: number;
  exposure?: number;
  onFileUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CameraViewfinder = ({ 
  aperture = 2.8, 
  iso = 400, 
  shutterSpeed = 125, 
  exposure = 0,
  onFileUpload 
}: CameraViewfinderProps) => {
  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-camera-metal/5 via-camera-metal/10 to-camera-metal/5 border border-camera-metal/30 rounded-lg px-4 py-2 shadow-3d-inset">
      {/* Left: Upload Button */}
      <div>
        <label htmlFor="camera-file-upload">
          <Button 
            size="sm" 
            variant="ghost"
            className="h-8 px-3 bg-gradient-button-3d shadow-3d-button border border-camera-metal/30 cursor-pointer"
            asChild
          >
            <span>
              <Upload className="h-3 w-3 mr-2" />
              Upload
            </span>
          </Button>
        </label>
        <input
          id="camera-file-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileUpload}
        />
      </div>

      {/* Center: Camera Settings Display - LCD Style */}
      <div className="flex items-center space-x-4">
        {/* Aperture */}
        <div className="flex flex-col items-center">
          <div className="text-[9px] text-camera-metal uppercase tracking-wider">Aperture</div>
          <div className="flex items-baseline space-x-0.5">
            <span className="text-[10px] text-camera-accent">f/</span>
            <Badge variant="secondary" className="h-5 px-1.5 text-xs font-mono bg-camera-metal/20 text-camera-accent border-camera-metal/40">
              {aperture.toFixed(1)}
            </Badge>
          </div>
        </div>

        <div className="w-px h-8 bg-camera-metal/30"></div>

        {/* ISO */}
        <div className="flex flex-col items-center">
          <div className="text-[9px] text-camera-metal uppercase tracking-wider">ISO</div>
          <Badge variant="secondary" className="h-5 px-1.5 text-xs font-mono bg-camera-metal/20 text-camera-accent border-camera-metal/40">
            {iso}
          </Badge>
        </div>

        <div className="w-px h-8 bg-camera-metal/30"></div>

        {/* Shutter Speed */}
        <div className="flex flex-col items-center">
          <div className="text-[9px] text-camera-metal uppercase tracking-wider">Shutter</div>
          <div className="flex items-baseline space-x-0.5">
            <span className="text-[10px] text-camera-accent">1/</span>
            <Badge variant="secondary" className="h-5 px-1.5 text-xs font-mono bg-camera-metal/20 text-camera-accent border-camera-metal/40">
              {shutterSpeed}
            </Badge>
          </div>
        </div>

        <div className="w-px h-8 bg-camera-metal/30"></div>

        {/* Exposure Compensation */}
        <div className="flex flex-col items-center">
          <div className="text-[9px] text-camera-metal uppercase tracking-wider">EV</div>
          <Badge 
            variant="secondary" 
            className={`h-5 px-1.5 text-xs font-mono border-camera-metal/40 ${
              exposure > 0 ? 'bg-amber-500/20 text-amber-400' : 
              exposure < 0 ? 'bg-blue-500/20 text-blue-400' : 
              'bg-camera-metal/20 text-camera-accent'
            }`}
          >
            {exposure > 0 ? '+' : ''}{exposure.toFixed(1)}
          </Badge>
        </div>

        <div className="w-px h-8 bg-camera-metal/30"></div>

        {/* Battery & Status Indicators */}
        <div className="flex flex-col items-center">
          <div className="text-[9px] text-camera-metal uppercase tracking-wider">Status</div>
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
            <span className="text-[10px] text-success font-mono">RDY</span>
          </div>
        </div>
      </div>

      {/* Right: Mode Display */}
      <div className="flex flex-col items-center">
        <div className="text-[9px] text-camera-metal uppercase tracking-wider">Mode</div>
        <Badge variant="secondary" className="h-5 px-2 text-xs font-bold bg-camera-accent/20 text-camera-accent border-camera-accent/40">
          M
        </Badge>
      </div>
    </div>
  );
};