import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Camera, 
  Layers2, 
  Settings, 
  Download,
  Undo2,
  Redo2,
  Save,
  Zap
} from "lucide-react";
import { MainEditor } from "./MainEditor";
import { ElementComposer } from "./ElementComposer";
import { AdvancedSettings } from "./AdvancedSettings";
import { PreviewExport } from "./PreviewExport";
import { DSLRCameraBody } from "./DSLRCameraBody";
import { VideoTimeline } from "./VideoTimeline";
import nanoBananaLogo from "@/assets/nano-banana-logo.png";

export const EditorLayout = () => {
  const [activeTab, setActiveTab] = useState("editor");
  const [showTimeline, setShowTimeline] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [overlayMode, setOverlayMode] = useState("grid focus");
  const [show3DCube, setShow3DCube] = useState(false);
  const [showSketch, setShowSketch] = useState(false);
  const [showCanvasTo3D, setShowCanvasTo3D] = useState(false);
  const [showCameraFrustum, setShowCameraFrustum] = useState(false);
  const [aperture, setAperture] = useState(2.8);
  const [iso, setIso] = useState(400);
  const [shutterSpeed, setShutterSpeed] = useState(125);
  const [exposure, setExposure] = useState(0);

  return (
    <DSLRCameraBody 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      videoTimeline={showTimeline ? <VideoTimeline onClose={() => setShowTimeline(false)} /> : undefined}
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
      aperture={aperture}
      iso={iso}
      shutterSpeed={shutterSpeed}
      exposure={exposure}
      onApertureChange={setAperture}
      onIsoChange={setIso}
      onShutterSpeedChange={setShutterSpeed}
      onExposureChange={setExposure}
    >
      <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          <Tabs value={activeTab} className="flex-1 flex flex-col">
            <TabsContent value="editor" className="flex-1 m-0">
              <MainEditor 
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
              />
            </TabsContent>
            <TabsContent value="composer" className="flex-1 m-0">
              <ElementComposer />
            </TabsContent>
            <TabsContent value="settings" className="flex-1 m-0">
              <AdvancedSettings />
            </TabsContent>
            <TabsContent value="preview" className="flex-1 m-0">
              <PreviewExport />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DSLRCameraBody>
  );
};