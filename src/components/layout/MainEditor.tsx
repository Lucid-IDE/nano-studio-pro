import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Crop,
  Lasso,
  Wand2,
  Paintbrush,
  Move,
  RotateCcw,
  Square,
  Circle,
  Upload,
  ZoomIn,
  ZoomOut,
  Grid3X3
} from "lucide-react";
import { ToolSidebar } from "./ToolSidebar";
import { DSLRControls } from "./DSLRControls";
import { Canvas } from "./Canvas";

export const MainEditor = () => {
  const [activeTool, setActiveTool] = useState<string>("select");
  const [showGrid, setShowGrid] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  return (
    <div className="flex h-full">
      {/* Left Tool Sidebar */}
      <ToolSidebar activeTool={activeTool} onToolChange={setActiveTool} />
      
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col bg-canvas-bg">
        {/* Canvas Toolbar */}
        <div className="bg-panel border-b border-border p-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              className={showGrid ? "bg-primary/20 text-primary" : ""}
            >
              <Grid3X3 className="h-4 w-4 mr-1" />
              Grid
            </Button>
            <div className="h-4 w-px bg-border" />
            <Button variant="ghost" size="sm" onClick={() => setZoomLevel(Math.max(25, zoomLevel - 25))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[60px] text-center">
              {zoomLevel}%
            </span>
            <Button variant="ghost" size="sm" onClick={() => setZoomLevel(Math.min(400, zoomLevel + 25))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-1" />
              Import Image
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <Canvas 
            showGrid={showGrid} 
            zoomLevel={zoomLevel}
            activeTool={activeTool}
          />
        </div>
      </div>

      {/* Right DSLR Controls Sidebar */}
      <DSLRControls />
    </div>
  );
};