import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Camera,
  Palette,
  Move3D,
  Eye,
  Layers3,
  Sliders,
  Aperture,
  Sun,
  Focus,
  Zap,
  Grid3X3,
  RotateCw,
  Maximize2,
  Settings2
} from "lucide-react";

interface RightPanelProps {
  onSettingChange?: (setting: string, value: any) => void;
}

export const RightPanel = ({ onSettingChange }: RightPanelProps) => {
  const [activePanel, setActivePanel] = useState("camera");
  
  // Camera Settings
  const [aperture, setAperture] = useState([2.8]);
  const [iso, setIso] = useState([400]);
  const [shutterSpeed, setShutterSpeed] = useState([125]);
  const [exposure, setExposure] = useState([0]);
  const [focus, setFocus] = useState([50]);
  
  // Color Settings
  const [saturation, setSaturation] = useState([50]);
  const [contrast, setContrast] = useState([50]);
  const [brightness, setBrightness] = useState([50]);
  const [temperature, setTemperature] = useState([5500]);
  
  // Movement Settings
  const [panX, setPanX] = useState([0]);
  const [panY, setPanY] = useState([0]);
  const [tilt, setTilt] = useState([0]);
  const [zoom, setZoom] = useState([100]);
  const [rotation, setRotation] = useState([0]);

  // Overlay Settings
  const [showGrid, setShowGrid] = useState(true);
  const [showFocus, setShowFocus] = useState(true);
  const [showMovement, setShowMovement] = useState(false);
  const [showCharacter, setShowCharacter] = useState(false);

  const panelTabs = [
    { id: "camera", icon: Camera, name: "Camera", color: "text-primary" },
    { id: "color", icon: Palette, name: "Color", color: "text-accent" },
    { id: "movement", icon: Move3D, name: "Movement", color: "text-success" },
    { id: "overlay", icon: Eye, name: "Overlay", color: "text-warning" },
    { id: "layers", icon: Layers3, name: "Layers", color: "text-camera-accent" },
    { id: "advanced", icon: Settings2, name: "Advanced", color: "text-muted-foreground" },
  ];

  const renderCameraControls = () => (
    <div className="space-y-6">
      {/* Aperture */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-button-3d shadow-3d-button rounded-full border border-camera-metal/30 flex items-center justify-center">
              <Aperture className="h-4 w-4 text-camera-accent" />
            </div>
            <span className="text-sm font-medium">Aperture</span>
          </div>
          <Badge variant="secondary" className="bg-surface text-camera-accent border-camera-metal/30">
            f/{aperture[0]}
          </Badge>
        </div>
        <Slider
          value={aperture}
          onValueChange={setAperture}
          min={1.4}
          max={22}
          step={0.1}
          className="w-full"
        />
      </div>

      {/* ISO */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-button-3d shadow-3d-button rounded-full border border-camera-metal/30 flex items-center justify-center">
              <Sun className="h-4 w-4 text-camera-accent" />
            </div>
            <span className="text-sm font-medium">ISO</span>
          </div>
          <Badge variant="secondary" className="bg-surface text-camera-accent border-camera-metal/30">
            {iso[0]}
          </Badge>
        </div>
        <Slider
          value={iso}
          onValueChange={setIso}
          min={100}
          max={6400}
          step={100}
          className="w-full"
        />
      </div>

      {/* Shutter Speed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-button-3d shadow-3d-button rounded-full border border-camera-metal/30 flex items-center justify-center">
              <Zap className="h-4 w-4 text-camera-accent" />
            </div>
            <span className="text-sm font-medium">Shutter</span>
          </div>
          <Badge variant="secondary" className="bg-surface text-camera-accent border-camera-metal/30">
            1/{shutterSpeed[0]}s
          </Badge>
        </div>
        <Slider
          value={shutterSpeed}
          onValueChange={setShutterSpeed}
          min={30}
          max={4000}
          step={1}
          className="w-full"
        />
      </div>

      {/* Exposure */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-button-3d shadow-3d-button rounded-full border border-camera-metal/30 flex items-center justify-center">
              <Sun className="h-4 w-4 text-camera-accent" />
            </div>
            <span className="text-sm font-medium">Exposure</span>
          </div>
          <Badge variant="secondary" className="bg-surface text-camera-accent border-camera-metal/30">
            {exposure[0] > 0 ? "+" : ""}{exposure[0]} EV
          </Badge>
        </div>
        <Slider
          value={exposure}
          onValueChange={setExposure}
          min={-3}
          max={3}
          step={0.3}
          className="w-full"
        />
      </div>

      {/* Focus */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-button-3d shadow-3d-button rounded-full border border-camera-metal/30 flex items-center justify-center">
              <Focus className="h-4 w-4 text-camera-accent" />
            </div>
            <span className="text-sm font-medium">Focus Point</span>
          </div>
          <Badge variant="secondary" className="bg-surface text-camera-accent border-camera-metal/30">
            {focus[0]}%
          </Badge>
        </div>
        <Slider
          value={focus}
          onValueChange={setFocus}
          min={0}
          max={100}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  );

  const renderColorControls = () => (
    <div className="space-y-6">
      {/* Saturation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Saturation</span>
          <Badge variant="secondary" className="bg-surface text-accent border-camera-metal/30">
            {saturation[0]}%
          </Badge>
        </div>
        <Slider
          value={saturation}
          onValueChange={setSaturation}
          min={0}
          max={200}
          step={1}
          className="w-full"
        />
      </div>

      {/* Contrast */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Contrast</span>
          <Badge variant="secondary" className="bg-surface text-accent border-camera-metal/30">
            {contrast[0]}%
          </Badge>
        </div>
        <Slider
          value={contrast}
          onValueChange={setContrast}
          min={0}
          max={200}
          step={1}
          className="w-full"
        />
      </div>

      {/* Brightness */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Brightness</span>
          <Badge variant="secondary" className="bg-surface text-accent border-camera-metal/30">
            {brightness[0]}%
          </Badge>
        </div>
        <Slider
          value={brightness}
          onValueChange={setBrightness}
          min={0}
          max={200}
          step={1}
          className="w-full"
        />
      </div>

      {/* Color Temperature */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Temperature</span>
          <Badge variant="secondary" className="bg-surface text-accent border-camera-metal/30">
            {temperature[0]}K
          </Badge>
        </div>
        <Slider
          value={temperature}
          onValueChange={setTemperature}
          min={2000}
          max={10000}
          step={100}
          className="w-full"
        />
      </div>
    </div>
  );

  const renderMovementControls = () => (
    <div className="space-y-6">
      {/* Pan X */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Pan Horizontal</span>
          <Badge variant="secondary" className="bg-surface text-success border-camera-metal/30">
            {panX[0]}°
          </Badge>
        </div>
        <Slider
          value={panX}
          onValueChange={setPanX}
          min={-180}
          max={180}
          step={1}
          className="w-full"
        />
      </div>

      {/* Pan Y */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Pan Vertical</span>
          <Badge variant="secondary" className="bg-surface text-success border-camera-metal/30">
            {panY[0]}°
          </Badge>
        </div>
        <Slider
          value={panY}
          onValueChange={setPanY}
          min={-90}
          max={90}
          step={1}
          className="w-full"
        />
      </div>

      {/* Tilt */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Camera Tilt</span>
          <Badge variant="secondary" className="bg-surface text-success border-camera-metal/30">
            {tilt[0]}°
          </Badge>
        </div>
        <Slider
          value={tilt}
          onValueChange={setTilt}
          min={-45}
          max={45}
          step={1}
          className="w-full"
        />
      </div>

      {/* Zoom */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Zoom Level</span>
          <Badge variant="secondary" className="bg-surface text-success border-camera-metal/30">
            {zoom[0]}%
          </Badge>
        </div>
        <Slider
          value={zoom}
          onValueChange={setZoom}
          min={50}
          max={500}
          step={5}
          className="w-full"
        />
      </div>

      {/* Rotation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Scene Rotation</span>
          <Badge variant="secondary" className="bg-surface text-success border-camera-metal/30">
            {rotation[0]}°
          </Badge>
        </div>
        <Slider
          value={rotation}
          onValueChange={setRotation}
          min={0}
          max={360}
          step={5}
          className="w-full"
        />
      </div>
    </div>
  );

  const renderOverlayControls = () => (
    <div className="space-y-4">
      <div className="space-y-3">
        <Button
          variant={showGrid ? "default" : "outline"}
          size="sm"
          className="w-full justify-start bg-gradient-button-3d shadow-3d-button border border-camera-metal/30"
          onClick={() => setShowGrid(!showGrid)}
        >
          <Grid3X3 className="h-4 w-4 mr-2" />
          Rule of Thirds Grid
        </Button>
        
        <Button
          variant={showFocus ? "default" : "outline"}
          size="sm"
          className="w-full justify-start bg-gradient-button-3d shadow-3d-button border border-camera-metal/30"
          onClick={() => setShowFocus(!showFocus)}
        >
          <Focus className="h-4 w-4 mr-2" />
          Focus Points
        </Button>
        
        <Button
          variant={showMovement ? "default" : "outline"}
          size="sm"
          className="w-full justify-start bg-gradient-button-3d shadow-3d-button border border-camera-metal/30"
          onClick={() => setShowMovement(!showMovement)}
        >
          <Move3D className="h-4 w-4 mr-2" />
          Movement Guides
        </Button>
        
        <Button
          variant={showCharacter ? "default" : "outline"}
          size="sm"
          className="w-full justify-start bg-gradient-button-3d shadow-3d-button border border-camera-metal/30"
          onClick={() => setShowCharacter(!showCharacter)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Character Analysis
        </Button>
      </div>
    </div>
  );

  return (
    <div className="w-80 bg-panel border-l border-border flex flex-col">
      {/* Panel Tabs - Vertical on the right edge */}
      <div className="flex">
        <div className="flex-1 p-4">
          <Tabs value={activePanel} onValueChange={setActivePanel} orientation="vertical" className="w-full">
            <TabsContent value="camera" className="mt-0 space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Camera className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Camera Settings</h3>
              </div>
              {renderCameraControls()}
            </TabsContent>
            
            <TabsContent value="color" className="mt-0 space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Palette className="h-5 w-5 text-accent" />
                <h3 className="text-lg font-semibold">Color & Style</h3>
              </div>
              {renderColorControls()}
            </TabsContent>
            
            <TabsContent value="movement" className="mt-0 space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Move3D className="h-5 w-5 text-success" />
                <h3 className="text-lg font-semibold">3D Movement</h3>
              </div>
              {renderMovementControls()}
            </TabsContent>
            
            <TabsContent value="overlay" className="mt-0 space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Eye className="h-5 w-5 text-warning" />
                <h3 className="text-lg font-semibold">Overlay Settings</h3>
              </div>
              {renderOverlayControls()}
            </TabsContent>
            
            <TabsContent value="layers" className="mt-0 space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Layers3 className="h-5 w-5 text-camera-accent" />
                <h3 className="text-lg font-semibold">Layers</h3>
              </div>
              <div className="text-center text-muted-foreground">
                Layer management coming soon...
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="mt-0 space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Settings2 className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Advanced</h3>
              </div>
              <div className="text-center text-muted-foreground">
                Advanced settings coming soon...
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Vertical Tab Strip */}
        <div className="w-14 bg-surface border-l border-border flex flex-col items-center py-4 space-y-2">
          {panelTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activePanel === tab.id;
            
            return (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                className={`
                  w-10 h-10 p-0 rounded-lg transition-all duration-200 bg-gradient-button-3d shadow-3d-button border border-camera-metal/30
                  ${isActive 
                    ? `${tab.color} scale-110 shadow-glow` 
                    : "text-camera-metal hover:text-foreground hover:scale-105"
                  }
                `}
                onClick={() => setActivePanel(tab.id)}
                title={tab.name}
              >
                <Icon className={`h-4 w-4 transition-all duration-200 ${isActive ? 'scale-110' : ''}`} />
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};