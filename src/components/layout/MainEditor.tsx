import { useState, useRef } from "react";
import { ToolSidebar } from "./ToolSidebar";
import { Canvas } from "./Canvas";
import { RightPanel } from "./RightPanel";
import { VideoTimeline } from "./VideoTimeline";
import { CameraViewfinder } from "./CameraViewfinder";
import { CubeParams } from "./Cube3DOverlay";

export const MainEditor = () => {
  const [activeTool, setActiveTool] = useState<string>("select");
  const [showGrid, setShowGrid] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showOverlay, setShowOverlay] = useState(true);
  const [overlayMode, setOverlayMode] = useState("grid focus");
  const [show3DCube, setShow3DCube] = useState(false);
  const [cubeParams, setCubeParams] = useState<CubeParams | null>(null);
  const [showSketch, setShowSketch] = useState(false);
  const [showCanvasTo3D, setShowCanvasTo3D] = useState(false);
  const [showCameraFrustum, setShowCameraFrustum] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedPixels] = useState<Set<number>>(new Set());

  // Camera settings for 3D dials
  const [aperture, setAperture] = useState(2.8);
  const [iso, setIso] = useState(400);
  const [shutterSpeed, setShutterSpeed] = useState(125);
  const [exposure, setExposure] = useState(0);

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
          onGridToggle={setShowGrid}
          showOverlay={showOverlay}
          onOverlayToggle={setShowOverlay}
          overlayMode={overlayMode}
          onOverlayModeChange={setOverlayMode}
          show3DCube={show3DCube}
          onShow3DCubeToggle={setShow3DCube}
          showSketch={showSketch}
          onShowSketchToggle={setShowSketch}
          showCanvasTo3D={showCanvasTo3D}
          onShowCanvasTo3DToggle={setShowCanvasTo3D}
          showCameraFrustum={showCameraFrustum}
          onShowCameraFrustumToggle={setShowCameraFrustum}
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
