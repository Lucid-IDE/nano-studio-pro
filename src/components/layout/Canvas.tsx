import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon } from "lucide-react";
import { LCDOverlay } from "./LCDOverlay";
import { Cube3DOverlay } from "./Cube3DOverlay";

interface CanvasProps {
  showGrid: boolean;
  zoomLevel: number;
  activeTool: string;
  showOverlay?: boolean;
  overlayMode?: string;
  show3DCube?: boolean;
}

export const Canvas = ({ showGrid, zoomLevel, activeTool, showOverlay = true, overlayMode = "grid focus", show3DCube = false }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasImage, setHasImage] = useState(false);
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to fill container
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    // Clear canvas
    ctx.fillStyle = "hsl(var(--canvas-bg))";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid if enabled
    if (showGrid) {
      const gridSize = 20 * (zoomLevel / 100);
      ctx.strokeStyle = "hsl(var(--grid-line))";
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;

      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    }

    // Draw center crosshairs
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.strokeStyle = "hsl(var(--muted-foreground))";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    
    ctx.beginPath();
    ctx.moveTo(centerX - 20, centerY);
    ctx.lineTo(centerX + 20, centerY);
    ctx.moveTo(centerX, centerY - 20);
    ctx.lineTo(centerX, centerY + 20);
    ctx.stroke();
    
    ctx.globalAlpha = 1;
  }, [showGrid, zoomLevel]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type. Please select an image.');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      console.error('File too large. Please select an image under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        // Clear canvas first
        ctx.fillStyle = "hsl(var(--canvas-bg))";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate scale to fit image in canvas while maintaining aspect ratio
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.8;
        const width = img.width * scale;
        const height = img.height * scale;
        const x = (canvas.width - width) / 2;
        const y = (canvas.height - height) / 2;

        try {
          ctx.drawImage(img, x, y, width, height);
          setHasImage(true);
          setCurrentImage(img);
          console.log('Image uploaded successfully:', file.name);
        } catch (error) {
          console.error('Failed to draw image:', error);
        }
      };
      
      img.onerror = () => {
        console.error('Failed to load image. Please try a different file.');
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      console.error('Failed to read file. Please try again.');
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative w-full h-full bg-canvas-bg">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full cursor-crosshair ${
          activeTool === "select" ? "cursor-default" : 
          activeTool === "move" ? "cursor-move" : 
          activeTool === "crop" ? "cursor-crosshair" : "cursor-crosshair"
        }`}
        style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "center" }}
      />

      {/* Empty State */}
      {!hasImage && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-surface/50 flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">No Image Loaded</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Upload an image to start editing, or use the AI tools to generate new content.
              </p>
            </div>
            <div className="pointer-events-auto">
              <label htmlFor="file-upload">
                <Button className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        </div>
      )}

      {/* LCD Overlay */}
      <LCDOverlay showOverlay={showOverlay} overlayMode={overlayMode} />

      {/* 3D Cube Overlay */}
      <Cube3DOverlay 
        showCube={show3DCube} 
        onCubeChange={(params) => {
          console.log("3D Cube parameters changed:", params);
          // This will be used to generate AI prompts for scene movement
        }} 
      />

      {/* Tool cursor indicator */}
      <div className="absolute top-4 left-4 bg-surface/80 backdrop-blur-sm rounded px-3 py-1 text-sm text-foreground">
        Tool: <span className="font-medium text-primary capitalize">{activeTool}</span>
      </div>
    </div>
  );
};