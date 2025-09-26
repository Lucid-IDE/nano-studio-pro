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
import nanoBananaLogo from "@/assets/nano-banana-logo.png";

export const EditorLayout = () => {
  const [activeTab, setActiveTab] = useState("editor");

  return (
    <DSLRCameraBody activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          <Tabs value={activeTab} className="flex-1 flex flex-col">
            <TabsContent value="editor" className="flex-1 m-0">
              <MainEditor />
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