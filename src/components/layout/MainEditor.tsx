import { useState } from "react";
import { ToolSidebar } from "./ToolSidebar";
import { Canvas } from "./Canvas";
import { RightPanel } from "./RightPanel";
import { VideoTimeline } from "./VideoTimeline";

export const MainEditor = () => {
  const [activeTool, setActiveTool] = useState<string>("select");
  const [showGrid, setShowGrid] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

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
              showOverlay={true}
              overlayMode="grid focus movement character"
            />
          </div>
        </div>
        
        <RightPanel />
      </div>
      
      <VideoTimeline />
    </div>
  );
};