import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Brush, 
  Eraser, 
  Trash2, 
  Eye, 
  EyeOff, 
  Download,
  Sparkles,
  Layers,
  Palette
} from "lucide-react";
import { analyzeSketch, type SketchAnalysis } from "@/utils/sketchMaskProcessor";

interface SketchOverlayProps {
  baseCanvas: HTMLCanvasElement | null;
  visible?: boolean;
  onSketchComplete?: (analysis: SketchAnalysis) => void;
}

export interface SketchOverlayHandle {
  getSketchCanvas: () => HTMLCanvasElement | null;
  getSketchAnalysis: () => SketchAnalysis | null;
  clear: () => void;
}

export const SketchOverlay = forwardRef<SketchOverlayHandle, SketchOverlayProps>(
  ({ baseCanvas, visible = true, onSketchComplete }, ref) => {
    const sketchCanvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
    const [brushSize, setBrushSize] = useState([12]);
    const [brushColor, setBrushColor] = useState('#FF6B6B');
    const [opacity, setOpacity] = useState([1]);
    const [showOverlay, setShowOverlay] = useState(visible);
    const [sketchAnalysis, setSketchAnalysis] = useState<SketchAnalysis | null>(null);

    // Color palette for semantic guidance (CCL)
    const semanticColors = [
      { color: '#FF6B6B', label: 'Primary Object' },
      { color: '#4ECDC4', label: 'Secondary' },
      { color: '#FFD93D', label: 'Highlight' },
      { color: '#95E1D3', label: 'Accent' },
      { color: '#C77CFF', label: 'Metallic' },
      { color: '#FFFFFF', label: 'Light/White' },
    ];

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      getSketchCanvas: () => sketchCanvasRef.current,
      getSketchAnalysis: () => sketchAnalysis,
      clear: handleClear,
    }));

    // Initialize sketch canvas
    useEffect(() => {
      if (!sketchCanvasRef.current || !baseCanvas) return;

      const sketchCanvas = sketchCanvasRef.current;
      sketchCanvas.width = baseCanvas.width;
      sketchCanvas.height = baseCanvas.height;

      // Set canvas style to overlay
      sketchCanvas.style.position = 'absolute';
      sketchCanvas.style.top = '0';
      sketchCanvas.style.left = '0';
      sketchCanvas.style.pointerEvents = showOverlay ? 'auto' : 'none';
      sketchCanvas.style.opacity = showOverlay ? '1' : '0';
    }, [baseCanvas, showOverlay]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!showOverlay) return;
      setIsDrawing(true);
      draw(e);
    };

    const stopDrawing = () => {
      if (!isDrawing) return;
      setIsDrawing(false);
      
      // Analyze sketch when drawing stops
      if (sketchCanvasRef.current) {
        const analysis = analyzeSketch(sketchCanvasRef.current, {
          featherAmount: 0.03,
          structureWeight: 0.7,
          colorWeight: 0.3,
        });
        setSketchAnalysis(analysis);
        onSketchComplete?.(analysis);
      }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing && e.type !== 'mousedown') return;
      if (!sketchCanvasRef.current) return;

      const canvas = sketchCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = tool === 'brush' ? brushColor : 'rgba(0,0,0,1)';
      ctx.lineWidth = brushSize[0];
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = opacity[0];

      if (e.type === 'mousedown') {
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    };

    const handleClear = () => {
      if (!sketchCanvasRef.current) return;
      const ctx = sketchCanvasRef.current.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, sketchCanvasRef.current.width, sketchCanvasRef.current.height);
      setSketchAnalysis(null);
    };

    const handleDownloadMask = () => {
      if (!sketchCanvasRef.current) return;
      const dataUrl = sketchCanvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'sketch-mask.png';
      link.href = dataUrl;
      link.click();
    };

    return (
      <div className="absolute top-4 left-4 z-20 flex flex-col space-y-2">
        {/* Main Controls Card */}
        <Card className="p-3 space-y-3 bg-surface/95 backdrop-blur border-border shadow-panel max-w-[280px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Sketch Overlay</span>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant={showOverlay ? "default" : "outline"}
                onClick={() => setShowOverlay(!showOverlay)}
                className="h-7 w-7 p-0"
              >
                {showOverlay ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Tool Selection */}
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={tool === 'brush' ? "default" : "outline"}
              onClick={() => setTool('brush')}
              className="flex-1"
            >
              <Brush className="h-3 w-3 mr-1" />
              Brush
            </Button>
            <Button
              size="sm"
              variant={tool === 'eraser' ? "default" : "outline"}
              onClick={() => setTool('eraser')}
              className="flex-1"
            >
              <Eraser className="h-3 w-3 mr-1" />
              Eraser
            </Button>
          </div>

          {/* Brush Size */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Brush Size</span>
              <Badge variant="secondary" className="text-xs">{brushSize[0]}px</Badge>
            </div>
            <Slider
              value={brushSize}
              onValueChange={setBrushSize}
              min={1}
              max={50}
              step={1}
              className="w-full"
            />
          </div>

          {/* Opacity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Opacity</span>
              <Badge variant="secondary" className="text-xs">{Math.round(opacity[0] * 100)}%</Badge>
            </div>
            <Slider
              value={opacity}
              onValueChange={setOpacity}
              min={0.1}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Color Palette */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Palette className="h-3 w-3 text-accent" />
              <span className="text-xs font-medium">Semantic Colors</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {semanticColors.map((c) => (
                <button
                  key={c.color}
                  onClick={() => setBrushColor(c.color)}
                  className={`
                    h-8 rounded border-2 transition-all hover:scale-110
                    ${brushColor === c.color ? 'border-primary shadow-glow' : 'border-border'}
                  `}
                  style={{ backgroundColor: c.color }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleClear}
              className="flex-1"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadMask}
              className="flex-1"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
        </Card>

        {/* Analysis Preview */}
        {sketchAnalysis && (
          <Card className="p-3 space-y-2 bg-surface/95 backdrop-blur border-primary/30 shadow-glow max-w-[280px]">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Analysis</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Structure Confidence:</span>
                <Badge variant="outline" className="text-xs">
                  {Math.round(sketchAnalysis.structuralMap.confidenceScore * 100)}%
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Line Segments:</span>
                <Badge variant="outline" className="text-xs">
                  {sketchAnalysis.structuralMap.lineGeometry.length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Color Regions:</span>
                <Badge variant="outline" className="text-xs">
                  {sketchAnalysis.colorMap.length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Feather Amount:</span>
                <Badge variant="outline" className="text-xs">
                  {(sketchAnalysis.featherAmount * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>
          </Card>
        )}

        {/* Sketch Canvas */}
        <canvas
          ref={sketchCanvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="absolute inset-0 cursor-crosshair"
          style={{
            pointerEvents: showOverlay ? 'auto' : 'none',
            opacity: showOverlay ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />
      </div>
    );
  }
);

SketchOverlay.displayName = 'SketchOverlay';
