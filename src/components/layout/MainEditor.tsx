import { useState, useRef } from "react";
import { ToolSidebar } from "./ToolSidebar";
import { Canvas } from "./Canvas";
import { RightPanel } from "./RightPanel";
import { VideoTimeline } from "./VideoTimeline";
import { CameraViewfinder } from "./CameraViewfinder";
import { CubeParams } from "./Cube3DOverlay";

interface MainEditorProps {
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
}

export const MainEditor = ({
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
}: MainEditorProps) => {
  const [activeTool, setActiveTool] = useState<string>("select");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [cubeParams, setCubeParams] = useState<CubeParams | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedPixels] = useState<Set<number>>(new Set());

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Trigger the hidden file input in Canvas
    const fileInput = document.getElementById('canvas-file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleImageGenerated = (imageUrl: string) => {
    console.log('Image generated:', imageUrl);
    // TODO: Display generated image on canvas
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-1 min-h-0">
        <ToolSidebar activeTool={activeTool} onToolChange={setActiveTool} />
        
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 p-4 min-h-0">
            <Canvas 
              ref={canvasRef}
              showGrid={showGrid} 
              zoomLevel={zoomLevel} 
              activeTool={activeTool}
              showOverlay={showOverlay}
              overlayMode={overlayMode}
              show3DCube={show3DCube}
              cubeParams={cubeParams}
              onCubeParamsChange={setCubeParams}
              showSketch={showSketch}
              showCanvasTo3D={showCanvasTo3D}
              showCameraFrustum={showCameraFrustum}
            />
          </div>
        </div>
        
        <RightPanel 
          zoomLevel={zoomLevel}
          onZoomChange={setZoomLevel}
          showGrid={showGrid}
          onGridToggle={onGridToggle}
          showOverlay={showOverlay}
          onOverlayToggle={onOverlayToggle}
          overlayMode={overlayMode}
          onOverlayModeChange={onOverlayModeChange}
          show3DCube={show3DCube}
          onShow3DCubeToggle={onShow3DCubeToggle}
          showSketch={showSketch}
          onShowSketchToggle={onShowSketchToggle}
          showCanvasTo3D={showCanvasTo3D}
          onShowCanvasTo3DToggle={onShowCanvasTo3DToggle}
          showCameraFrustum={showCameraFrustum}
          onShowCameraFrustumToggle={onShowCameraFrustumToggle}
          cubeParams={cubeParams}
          onCubeParamsChange={setCubeParams}
          canvasRef={canvasRef}
          selectedPixels={selectedPixels}
          onImageGenerated={handleImageGenerated}
        />
      </div>
    </div>
  );
};
