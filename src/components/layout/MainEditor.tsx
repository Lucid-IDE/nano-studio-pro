import { useState } from "react";
import { ToolSidebar } from "./ToolSidebar";
import { Canvas } from "./Canvas";
import { RightPanel } from "./RightPanel";
import { VideoTimeline } from "./VideoTimeline";

export const MainEditor = () => {
  const [activeTool, setActiveTool] = useState<string>("select");
  const [showGrid, setShowGrid] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showOverlay, setShowOverlay] = useState(true);
  const [overlayMode, setOverlayMode] = useState("grid focus");
  const [show3DCube, setShow3DCube] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 overflow-hidden">
        <ToolSidebar activeTool={activeTool} onToolChange={setActiveTool} />
        
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4">
            <Canvas 
              showGrid={showGrid} 
              zoomLevel={zoomLevel} 
              activeTool={activeTool}
              showOverlay={showOverlay}
              overlayMode={overlayMode}
              show3DCube={show3DCube}
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
        />
      </div>
      
      <VideoTimeline />
    </div>
  );
};