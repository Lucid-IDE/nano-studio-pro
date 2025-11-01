import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NanoBananaPanel from "@/components/ai/NanoBananaPanel";
import VideoGenPanel from "@/components/ai/VideoGenPanel";
import { 
  Camera,
  Palette,
  Move3D,
  Eye,
  Layers3,
  Aperture,
  Sun,
  Focus,
  Zap,
  Settings2,
  Box,
  ToggleLeft,
  ToggleRight,
  Scissors,
  Video
} from "lucide-react";
import { AdvancedSegmentation } from "./AdvancedSegmentation";

interface RightPanelProps {
  zoomLevel: number;
  onZoomChange: (level: number) => void;
  showGrid: boolean;
  onGridToggle: (show: boolean) => void;
  showOverlay: boolean;
  onOverlayToggle: (show: boolean) => void;
  overlayMode: string;
  onOverlayModeChange: (mode: string) => void;
  show3DCube: boolean;
  onShow3DCubeToggle: (show: boolean) => void;
  showSketch: boolean;
  onShowSketchToggle: (show: boolean) => void;
  showCanvasTo3D: boolean;
  onShowCanvasTo3DToggle: (show: boolean) => void;
  showCameraFrustum: boolean;
  onShowCameraFrustumToggle: (show: boolean) => void;
  onSettingChange?: (setting: string, value: any) => void;
  cubeParams?: any;
  onCubeParamsChange?: (params: any) => void;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  selectedPixels?: Set<number>;
  onImageGenerated?: (imageUrl: string) => void;
}

export const RightPanel = ({ 
  zoomLevel,
  onZoomChange,
  showGrid,
  onGridToggle,
  showOverlay,
  onOverlayToggle,
  overlayMode,
  onOverlayModeChange,
  show3DCube,
  onShow3DCubeToggle,
  showSketch,
  onShowSketchToggle,
  showCanvasTo3D,
  onShowCanvasTo3DToggle,
  showCameraFrustum,
  onShowCameraFrustumToggle,
  onSettingChange,
  cubeParams,
  onCubeParamsChange,
  canvasRef,
  selectedPixels,
  onImageGenerated
}: RightPanelProps) => {
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

  const panelTabs = [
    { id: "color", icon: Palette, name: "Color", color: "text-accent" },
    { id: "movement", icon: Move3D, name: "Movement", color: "text-success" },
    { id: "3d", icon: Box, name: "3D Guide", color: "text-camera-accent" },
    { id: "segmentation", icon: Scissors, name: "AI Segmentation", color: "text-destructive" },
    { id: "ai", icon: Zap, name: "Nano Banana", color: "text-purple-500" },
    { id: "video", icon: Video, name: "Video Gen", color: "text-blue-500" },
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
              <Aperture className="h-4 w-4 text-camera-accent" />
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
      {/* Overlay Toggle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">LCD Overlay</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOverlayToggle(!showOverlay)}
            className="h-7 w-12 p-0 bg-gradient-button-3d shadow-3d-button border border-camera-metal/30"
          >
            {showOverlay ? (
              <ToggleRight className="h-4 w-4 text-success" />
            ) : (
              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      {/* Overlay Mode */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-foreground">Overlay Mode</span>
        <div className="grid grid-cols-1 gap-1">
          {["grid focus", "rule of thirds", "center point", "histogram", "level meter"].map((mode) => (
            <Button
              key={mode}
              variant="ghost"
              size="sm"
              onClick={() => onOverlayModeChange(mode)}
              className={`h-7 text-xs justify-start bg-gradient-button-3d shadow-3d-button border border-camera-metal/30 ${
                overlayMode === mode ? "text-camera-accent shadow-3d-inset" : "text-muted-foreground"
              }`}
            >
              {mode}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid Toggle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Grid</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onGridToggle(!showGrid)}
            className="h-7 w-12 p-0 bg-gradient-button-3d shadow-3d-button border border-camera-metal/30"
          >
            {showGrid ? (
              <ToggleRight className="h-4 w-4 text-success" />
            ) : (
              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSegmentationControls = () => (
    <AdvancedSegmentation 
      imageElement={undefined}
      onSegmentationComplete={(results) => {
        console.log("Segmentation results:", results);
      }}
    />
  );

  const render3DGuideControls = () => {
    const defaultCubeParams = {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 15, y: 45, z: 0 },
      faceOffsets: { front: 100, back: -100, left: -100, right: 100, top: 100, bottom: -100 },
      perspective: 800,
      fov: 60,
      walls: { front: "#3b82f6", back: "#ef4444", left: "#10b981", right: "#f59e0b", top: "#8b5cf6", bottom: "#6b7280" },
      floor: { enabled: true, height: -100, azimuth: 0, color: "#94a3b8" },
      objects: []
    };
    
    const params = cubeParams || defaultCubeParams;
    
    const updateCubeParams = (updates: any) => {
      if (onCubeParamsChange) {
        onCubeParamsChange({ ...params, ...updates });
      }
    };
    
    return (
      <div className="space-y-4">
        {/* 3D Cube Toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">3D Perspective Guide</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { if (!show3DCube && !cubeParams) onCubeParamsChange?.(defaultCubeParams); onShow3DCubeToggle(!show3DCube); }}
              className="h-7 w-12 p-0 bg-gradient-button-3d shadow-3d-button border border-camera-metal/30"
            >
              {show3DCube ? (
                <ToggleRight className="h-4 w-4 text-success" />
              ) : (
                <ToggleLeft className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Drag arrows to adjust faces. Shift+drag for mirror faces. Ctrl+drag to scale entire cube. Drag rotation circles to rotate.
          </p>
        </div>

        {show3DCube && (
          <>
            {/* Floor Controls */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Floor</span>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={() => updateCubeParams({
                    floor: { ...params.floor, enabled: !params.floor.enabled }
                  })}
                >
                  {params.floor?.enabled ? 'Hide' : 'Show'}
                </Button>
              </div>
              {params.floor?.enabled && (
                <>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Height</span>
                      <span className="text-[10px] text-muted-foreground">{params.floor.height.toFixed(0)}</span>
                    </div>
                    <Slider
                      value={[params.floor.height]}
                      onValueChange={([height]) => updateCubeParams({
                        floor: { ...params.floor, height }
                      })}
                      min={-200}
                      max={200}
                      step={5}
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Azimuth</span>
                      <span className="text-[10px] text-muted-foreground">{params.floor.azimuth.toFixed(0)}°</span>
                    </div>
                    <Slider
                      value={[params.floor.azimuth]}
                      onValueChange={([azimuth]) => updateCubeParams({
                        floor: { ...params.floor, azimuth }
                      })}
                      min={0}
                      max={360}
                      step={5}
                      className="h-2"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Face Controls */}
            <div className="space-y-2 pt-2 border-t border-border">
              <span className="text-xs font-medium">Face Offsets</span>
              
              {/* Front Face */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded border border-border" 
                      style={{ backgroundColor: params.walls?.front }}
                    ></div>
                    <span className="text-xs">Front</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{params.faceOffsets.front.toFixed(0)}</span>
                </div>
                <Slider
                  value={[params.faceOffsets.front]}
                  onValueChange={([front]) => updateCubeParams({
                    faceOffsets: { ...params.faceOffsets, front }
                  })}
                  min={25}
                  max={200}
                  step={5}
                  className="h-1.5"
                />
              </div>

              {/* Back Face */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded border border-border" 
                      style={{ backgroundColor: params.walls?.back }}
                    ></div>
                    <span className="text-xs">Back</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{params.faceOffsets.back.toFixed(0)}</span>
                </div>
                <Slider
                  value={[params.faceOffsets.back]}
                  onValueChange={([back]) => updateCubeParams({
                    faceOffsets: { ...params.faceOffsets, back }
                  })}
                  min={-200}
                  max={-25}
                  step={5}
                  className="h-1.5"
                />
              </div>

              {/* Left Face */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded border border-border" 
                      style={{ backgroundColor: params.walls?.left }}
                    ></div>
                    <span className="text-xs">Left</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{params.faceOffsets.left.toFixed(0)}</span>
                </div>
                <Slider
                  value={[params.faceOffsets.left]}
                  onValueChange={([left]) => updateCubeParams({
                    faceOffsets: { ...params.faceOffsets, left }
                  })}
                  min={-200}
                  max={-25}
                  step={5}
                  className="h-1.5"
                />
              </div>

              {/* Right Face */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded border border-border" 
                      style={{ backgroundColor: params.walls?.right }}
                    ></div>
                    <span className="text-xs">Right</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{params.faceOffsets.right.toFixed(0)}</span>
                </div>
                <Slider
                  value={[params.faceOffsets.right]}
                  onValueChange={([right]) => updateCubeParams({
                    faceOffsets: { ...params.faceOffsets, right }
                  })}
                  min={25}
                  max={200}
                  step={5}
                  className="h-1.5"
                />
              </div>

              {/* Top Face */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded border border-border" 
                      style={{ backgroundColor: params.walls?.top }}
                    ></div>
                    <span className="text-xs">Top</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{params.faceOffsets.top.toFixed(0)}</span>
                </div>
                <Slider
                  value={[params.faceOffsets.top]}
                  onValueChange={([top]) => updateCubeParams({
                    faceOffsets: { ...params.faceOffsets, top }
                  })}
                  min={25}
                  max={200}
                  step={5}
                  className="h-1.5"
                />
              </div>

              {/* Bottom Face */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded border border-border" 
                      style={{ backgroundColor: params.walls?.bottom }}
                    ></div>
                    <span className="text-xs">Bottom</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{params.faceOffsets.bottom.toFixed(0)}</span>
                </div>
                <Slider
                  value={[params.faceOffsets.bottom]}
                  onValueChange={([bottom]) => updateCubeParams({
                    faceOffsets: { ...params.faceOffsets, bottom }
                  })}
                  min={-200}
                  max={-25}
                  step={5}
                  className="h-1.5"
                />
              </div>
            </div>

            {/* Rotation Controls */}
            <div className="space-y-2 pt-2 border-t border-border">
              <span className="text-xs font-medium">Rotation</span>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground">X</span>
                  <Slider
                    value={[params.rotation.x]}
                    onValueChange={([x]) => updateCubeParams({
                      rotation: { ...params.rotation, x }
                    })}
                    min={-90}
                    max={90}
                    step={1}
                    className="h-1.5"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground">Y</span>
                  <Slider
                    value={[params.rotation.y]}
                    onValueChange={([y]) => updateCubeParams({
                      rotation: { ...params.rotation, y }
                    })}
                    min={0}
                    max={360}
                    step={1}
                    className="h-1.5"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground">Z</span>
                  <Slider
                    value={[params.rotation.z]}
                    onValueChange={([z]) => updateCubeParams({
                      rotation: { ...params.rotation, z }
                    })}
                    min={-45}
                    max={45}
                    step={1}
                    className="h-1.5"
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex space-x-1">
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-7 px-2 text-xs bg-gradient-button-3d shadow-3d-button border border-camera-metal/30"
                onClick={() => updateCubeParams({ 
                  rotation: { x: 0, y: 0, z: 0 },
                  faceOffsets: { front: 100, back: -100, left: -100, right: 100, top: 100, bottom: -100 }
                })}
              >
                Reset
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-7 px-2 text-xs bg-gradient-button-3d shadow-3d-button border border-camera-metal/30"
                onClick={() => updateCubeParams({ rotation: { x: 15, y: 45, z: 0 } })}
              >
                Iso
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-7 px-2 text-xs bg-gradient-button-3d shadow-3d-button border border-camera-metal/30"
                onClick={() => updateCubeParams({ rotation: { x: 0, y: 90, z: 0 } })}
              >
                Side
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="w-80 h-full bg-gradient-surface shadow-3d-panel border-l border-camera-metal/20 flex">
      {/* Vertical Tab Strip - Left Edge */}
      <div className="w-14 bg-surface border-r border-border flex flex-col items-center py-4 space-y-2">
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

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto">
          <Tabs value={activePanel} onValueChange={setActivePanel} className="w-full">
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
                <h3 className="text-lg font-semibold">Movement</h3>
              </div>
              {renderMovementControls()}
            </TabsContent>
            
            <TabsContent value="3d" className="mt-0 space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Box className="h-5 w-5 text-camera-accent" />
                <h3 className="text-lg font-semibold">3D Guide</h3>
              </div>
              {render3DGuideControls()}
            </TabsContent>
            
            <TabsContent value="segmentation" className="mt-0 space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Scissors className="h-5 w-5 text-destructive" />
                <h3 className="text-lg font-semibold">AI Segmentation</h3>
              </div>
              {renderSegmentationControls()}
            </TabsContent>
            
            <TabsContent value="ai" className="mt-0">
              {canvasRef && onImageGenerated ? (
                <NanoBananaPanel 
                  canvasRef={canvasRef}
                  selectedPixels={selectedPixels}
                  onImageGenerated={onImageGenerated}
                />
              ) : (
                <div className="text-sm text-muted-foreground p-4">
                  Nano Banana AI requires canvas reference
                </div>
              )}
            </TabsContent>

            <TabsContent value="video" className="mt-0">
              <VideoGenPanel 
                canvasRef={canvasRef}
              />
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
      </div>
    </div>
  );
};