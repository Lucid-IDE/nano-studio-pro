import { useState } from "react";
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
  const [showTimeline, setShowTimeline] = useState(true);
  const [cubeParams, setCubeParams] = useState<CubeParams | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Trigger the hidden file input in Canvas
    const fileInput = document.getElementById('canvas-file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Camera Viewfinder at Top */}
      <div className="flex-shrink-0 px-4 pt-2 pb-2">
        <CameraViewfinder 
          aperture={2.8}
          iso={400}
          shutterSpeed={125}
          exposure={0}
          onFileUpload={handleFileUpload}
        />
      </div>

      <div className="flex flex-1 min-h-0">
        <ToolSidebar activeTool={activeTool} onToolChange={setActiveTool} />
        
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 p-4 min-h-0">
            <Canvas 
              showGrid={showGrid} 
              zoomLevel={zoomLevel} 
              activeTool={activeTool}
              showOverlay={showOverlay}
              overlayMode={overlayMode}
              show3DCube={show3DCube}
              cubeParams={cubeParams}
              onCubeParamsChange={setCubeParams}
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
          cubeParams={cubeParams}
          onCubeParamsChange={setCubeParams}
        />
      </div>
      
      {showTimeline && (
        <div className="flex-shrink-0">
          <VideoTimeline onClose={() => setShowTimeline(false)} />
        </div>
      )}
    </div>
  );
};
