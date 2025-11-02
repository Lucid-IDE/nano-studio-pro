import { Button } from "@/components/ui/button";
import { 
  MousePointer2,
  Crop,
  Lasso,
  Wand2,
  Paintbrush,
  Move,
  RotateCcw,
  Square,
  Circle,
  Type,
  Eraser,
  Upload
} from "lucide-react";

interface ToolSidebarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
}

const tools = [
  { id: "select", icon: MousePointer2, name: "Select", description: "Select and move objects" },
  { id: "crop", icon: Crop, name: "Crop", description: "Crop image areas" },
  { id: "lasso", icon: Lasso, name: "Lasso", description: "Freehand selection" },
  { id: "segment", icon: Wand2, name: "Segment", description: "AI-powered segmentation" },
  { id: "brush", icon: Paintbrush, name: "Brush", description: "Paint and draw" },
  { id: "eraser", icon: Eraser, name: "Eraser", description: "Erase content" },
  { id: "move", icon: Move, name: "Move", description: "Move and transform" },
  { id: "rotate", icon: RotateCcw, name: "Rotate", description: "Rotate objects" },
  { id: "rectangle", icon: Square, name: "Rectangle", description: "Draw rectangles" },
  { id: "circle", icon: Circle, name: "Circle", description: "Draw circles" },
  { id: "text", icon: Type, name: "Text", description: "Add text" },
];

export const ToolSidebar = ({ activeTool, onToolChange }: ToolSidebarProps) => {
  const handleUploadClick = () => {
    const fileInput = document.getElementById('canvas-file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <div className="w-16 bg-panel border-r border-border flex flex-col items-center py-4 space-y-2">
      {/* Upload Button */}
      <Button
        variant="ghost"
        size="sm"
        className="w-12 h-12 p-0 rounded-lg transition-all duration-200 group relative hover:bg-control-hover text-tool-inactive hover:text-foreground hover:scale-105 mb-4"
        onClick={handleUploadClick}
        title="Upload - Load image or 3D model"
      >
        <Upload className="h-5 w-5 transition-all duration-200 group-hover:scale-105" />
      </Button>

      <div className="w-full h-px bg-border/50" />
      
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        
        return (
          <Button
            key={tool.id}
            variant="ghost"
            size="sm"
            className={`
              w-12 h-12 p-0 rounded-lg transition-all duration-200 group relative
              ${isActive 
                ? "bg-primary text-primary-foreground shadow-glow animate-tool-select" 
                : "hover:bg-control-hover text-tool-inactive hover:text-foreground hover:scale-105"
              }
            `}
            onClick={() => onToolChange(tool.id)}
            title={`${tool.name} - ${tool.description}`}
          >
            <Icon className={`h-5 w-5 transition-all duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
            {isActive && (
              <div className="absolute inset-0 rounded-lg bg-primary/20 animate-glow-pulse" />
            )}
          </Button>
        );
      })}
    </div>
  );
};