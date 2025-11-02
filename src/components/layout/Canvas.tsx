import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon } from "lucide-react";
import { LCDOverlay } from "./LCDOverlay";
import { Cube3DOverlay, CubeParams } from "./Cube3DOverlay";

interface CanvasProps {
  showGrid: boolean;
  zoomLevel: number;
  activeTool: string;
  showOverlay?: boolean;
  overlayMode?: string;
  show3DCube?: boolean;
  cubeParams?: CubeParams | null;
  onCubeParamsChange?: (params: CubeParams) => void;
  showSketch?: boolean;
  showCanvasTo3D?: boolean;
  showCameraFrustum?: boolean;
  layers?: any[];
}

const CanvasComponent = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({
    showGrid,
    zoomLevel,
    activeTool,
    showOverlay = true,
    overlayMode = "grid focus",
    show3DCube = false,
    cubeParams,
    onCubeParamsChange,
    showSketch = false,
    showCanvasTo3D = false,
    showCameraFrustum = false,
    layers = [],
  }, ref) => {
    const internalCanvasRef = useRef<HTMLCanvasElement>(null);
    const [hasImage, setHasImage] = useState(false);
    const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null);
    const [isRightMouseDown, setIsRightMouseDown] = useState(false);

    // Expose the canvas ref to parent
    useImperativeHandle(ref, () => internalCanvasRef.current!);

    useEffect(() => {
      const canvas = internalCanvasRef.current;
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

      // Draw 2D layers
      layers.filter(l => l.type === '2d' && l.visible && l.imageUrl).forEach(layer => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.8;
          const width = img.width * scale;
          const height = img.height * scale;
          const x = (canvas.width - width) / 2;
          const y = (canvas.height - height) / 2;
          
          ctx.globalAlpha = layer.opacity / 100;
          try {
            ctx.drawImage(img, x, y, width, height);
          } catch (e) {
            console.error('Failed to draw layer image:', e);
          }
          ctx.globalAlpha = 1;
        };
        img.src = layer.imageUrl;
      });

      // Draw image if present (fit to canvas, keep aspect)
      if (hasImage && currentImage) {
        const img = currentImage;
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.8;
        const width = img.width * scale;
        const height = img.height * scale;
        const x = (canvas.width - width) / 2;
        const y = (canvas.height - height) / 2;
        try {
          ctx.drawImage(img, x, y, width, height);
        } catch (e) {
          console.error('Redraw image failed:', e);
        }
      }

      // Draw grid if enabled (on top of image)
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

      // Draw center crosshairs (on top)
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
    }, [showGrid, zoomLevel, hasImage, currentImage, layers]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        console.log('No file selected');
        return;
      }

      console.log('File selected:', file.name, 'Type:', file.type, 'Size:', file.size);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Invalid file type. Please select an image.');
        console.error('Invalid file type:', file.type);
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File too large. Please select an image under 10MB.');
        console.error('File too large:', file.size);
        return;
      }

      console.log('Starting file read...');
      const reader = new FileReader();

      reader.onload = (e) => {
        console.log('FileReader onload triggered');
        const result = e.target?.result;
        if (!result) {
          console.error('No result from FileReader');
          return;
        }

        const img = new Image();
        img.onload = () => {
          console.log('Image loaded successfully. Dimensions:', img.width, 'x', img.height);
          const canvas = internalCanvasRef.current;
          const ctx = canvas?.getContext("2d");
          if (!canvas || !ctx) {
            console.error('Canvas or context not available');
            return;
          }

          console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);

          // Clear canvas first
          ctx.fillStyle = "hsl(var(--canvas-bg))";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Calculate scale to fit image in canvas while maintaining aspect ratio
          const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.8;
          const width = img.width * scale;
          const height = img.height * scale;
          const x = (canvas.width - width) / 2;
          const y = (canvas.height - height) / 2;

          console.log('Drawing image at:', x, y, 'Size:', width, 'x', height);

          try {
            ctx.drawImage(img, x, y, width, height);
            setHasImage(true);
            setCurrentImage(img);
            console.log('Image uploaded and drawn successfully');
          } catch (error) {
            console.error('Failed to draw image:', error);
            alert('Failed to draw image. Please try again.');
          }
        };

        img.onerror = (error) => {
          console.error('Image load error:', error);
          alert('Failed to load image. Please try a different file.');
        };

        console.log('Setting image src...');
        img.src = result as string;
      };

      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        alert('Failed to read file. Please try again.');
      };

      reader.readAsDataURL(file);

      // Reset the input to allow re-uploading the same file
      event.target.value = '';
    };

    return (
      <div 
        className="relative w-full h-full bg-canvas-bg"
        onMouseDown={(e) => {
          if (e.button === 2) { // Right mouse button
            e.preventDefault();
            setIsRightMouseDown(true);
          }
        }}
        onMouseUp={(e) => {
          if (e.button === 2) {
            setIsRightMouseDown(false);
          }
        }}
        onWheel={(e) => {
          if (isRightMouseDown) {
            e.preventDefault();
            // Right-click + scroll zoom behavior would be handled by parent
            // For now, just prevent default scrolling
          }
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Canvas */}
        <canvas
          ref={internalCanvasRef}
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
                  Upload an image using the button in the top bar, or use the AI tools to generate new content.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          id="canvas-file-upload"
          type="file"
          accept="image/*,.glb,.gltf"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* LCD Overlay */}
        <LCDOverlay showOverlay={showOverlay} overlayMode={overlayMode} />

        {/* 3D Cube Overlay */}
        <Cube3DOverlay
          showCube={show3DCube || showCanvasTo3D || showCameraFrustum}
          cubeParams={cubeParams ? {
            ...cubeParams,
            cameraFrustum: {
              ...cubeParams.cameraFrustum,
              enabled: showCameraFrustum
            },
            canvasTo3D: {
              ...cubeParams.canvasTo3D,
              enabled: showCanvasTo3D
            }
          } : undefined}
          onCubeParamsChange={onCubeParamsChange}
          onCubeChange={(params) => {
            console.log("3D Cube parameters changed:", params);
          }}
        />

        {/* Tool cursor indicator */}
        <div className="absolute top-4 left-4 bg-surface/80 backdrop-blur-sm rounded px-3 py-1 text-sm text-foreground">
          Tool: <span className="font-medium text-primary capitalize">{activeTool}</span>
        </div>
      </div>
    );
  }
);

CanvasComponent.displayName = 'Canvas';

export const Canvas = CanvasComponent;
