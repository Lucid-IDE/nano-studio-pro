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
    <DSLRCameraBody>
      <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-panel border-b border-border px-4 py-2 flex items-center justify-between shadow-[var(--shadow-panel)]">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img src={nanoBananaLogo} alt="Nano Banana" className="h-8 w-8" />
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Nano Banana
              </span>
            </div>
            
            {/* Global Controls */}
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Redo2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Module Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 max-w-2xl mx-8">
            <TabsList className="grid w-full grid-cols-4 bg-surface border border-border">
              <TabsTrigger value="editor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Camera className="h-4 w-4 mr-2" />
                Main Editor
              </TabsTrigger>
              <TabsTrigger value="composer" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Layers2 className="h-4 w-4 mr-2" />
                Element Composer
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Settings className="h-4 w-4 mr-2" />
                Advanced Settings
              </TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Download className="h-4 w-4 mr-2" />
                Preview/Export
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* API Status & Quick Actions */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-success" />
              <span>15/15 API calls</span>
            </div>
            <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:from-primary-glow hover:to-accent/80">
              Generate
            </Button>
          </div>
        </header>

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