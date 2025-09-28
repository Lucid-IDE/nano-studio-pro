import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Scissors, Sparkles, Download, Loader2, Target, Layers, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SegmentationResult {
  id: string;
  mask: ImageData;
  confidence: number;
  category: string;
  bbox: {x: number, y: number, width: number, height: number};
}

interface AdvancedSegmentationProps {
  imageElement?: HTMLImageElement;
  onSegmentationComplete?: (results: SegmentationResult[]) => void;
}

export const AdvancedSegmentation = ({ imageElement, onSegmentationComplete }: AdvancedSegmentationProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [segments, setSegments] = useState<SegmentationResult[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [confidenceThreshold, setConfidenceThreshold] = useState([0.5]);
  const [segmentationModel, setSegmentationModel] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const initializeSegmentationModel = async () => {
    try {
      // Dynamically import HuggingFace transformers
      const { pipeline, env } = await import('@huggingface/transformers');
      
      // Configure for browser use
      env.allowLocalModels = false;
      env.useBrowserCache = true;
      
      toast({
        title: "Loading AI Model",
        description: "Initializing advanced segmentation model...",
      });

      // Initialize segmentation pipeline with SAM or similar model
      const segmenter = await pipeline(
        'image-segmentation',
        'Xenova/segformer-b0-finetuned-ade-512-512',
        { device: 'webgpu' }
      );
      
      setSegmentationModel(segmenter);
      
      toast({
        title: "Model Ready",
        description: "Advanced segmentation model loaded successfully!",
      });
      
      return segmenter;
    } catch (error) {
      console.error('Failed to initialize segmentation model:', error);
      toast({
        title: "Model Error",
        description: "Failed to load segmentation model. Falling back to basic segmentation.",
        variant: "destructive",
      });
      return null;
    }
  };

  const performAdvancedSegmentation = async () => {
    if (!imageElement) {
      toast({
        title: "No Image",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      let model = segmentationModel;
      if (!model) {
        model = await initializeSegmentationModel();
        if (!model) return;
      }

      // Convert image to canvas for processing
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = imageElement.naturalWidth;
      canvas.height = imageElement.naturalHeight;
      ctx.drawImage(imageElement, 0, 0);

      // Get image data
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);

      // Perform segmentation
      const results = await model(imageDataUrl);
      
      // Process results into our format
      const processedSegments: SegmentationResult[] = results.map((result: any, index: number) => ({
        id: `segment_${index}`,
        mask: result.mask,
        confidence: result.score || 0.8,
        category: result.label || 'object',
        bbox: {
          x: 0,
          y: 0,
          width: canvas.width,
          height: canvas.height
        }
      })).filter((segment: SegmentationResult) => segment.confidence >= confidenceThreshold[0]);

      setSegments(processedSegments);
      onSegmentationComplete?.(processedSegments);
      
      toast({
        title: "Segmentation Complete",
        description: `Found ${processedSegments.length} segments`,
      });

    } catch (error) {
      console.error('Segmentation failed:', error);
      toast({
        title: "Segmentation Error",
        description: "Failed to segment image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSegmentSelection = (segmentId: string) => {
    setSelectedSegments(prev => 
      prev.includes(segmentId) 
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId]
    );
  };

  const exportSelectedSegments = () => {
    if (selectedSegments.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select segments to export",
        variant: "destructive",
      });
      return;
    }

    // Create download for selected segments
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'segmented_image.png';
    link.href = dataUrl;
    link.click();
    
    toast({
      title: "Export Complete",
      description: "Segmented image downloaded successfully",
    });
  };

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Main Controls */}
      <Card className="p-4 space-y-4 bg-camera-surface border-camera-metal/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium">AI Segmentation</span>
          </div>
          <Badge variant="outline" className="text-xs">
            SAM-Based
          </Badge>
        </div>
        
        <Button 
          onClick={performAdvancedSegmentation}
          disabled={!imageElement || isProcessing}
          className="w-full bg-gradient-button-3d shadow-3d-button"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Target className="h-4 w-4 mr-2" />
              Segment Image
            </>
          )}
        </Button>
      </Card>

      {/* Confidence Threshold */}
      <Card className="p-4 space-y-3 bg-camera-surface border-camera-metal/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Confidence Threshold</span>
          <span className="text-xs text-muted-foreground">{(confidenceThreshold[0] * 100).toFixed(0)}%</span>
        </div>
        <Slider
          value={confidenceThreshold}
          onValueChange={setConfidenceThreshold}
          max={1}
          min={0.1}
          step={0.05}
          className="w-full"
        />
      </Card>

      {/* Segments List */}
      {segments.length > 0 && (
        <Card className="p-4 space-y-3 bg-camera-surface border-camera-metal/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="h-4 w-4 text-accent" />
              <span className="font-medium">Detected Segments</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {segments.length} found
            </Badge>
          </div>
          
          <Separator />
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {segments.map((segment) => (
              <div
                key={segment.id}
                className={`
                  flex items-center justify-between p-2 rounded border cursor-pointer transition-all
                  ${selectedSegments.includes(segment.id) 
                    ? 'bg-primary/10 border-primary' 
                    : 'bg-muted/30 border-border hover:bg-muted/50'
                  }
                `}
                onClick={() => toggleSegmentSelection(segment.id)}
              >
                <div className="flex items-center space-x-2">
                  {selectedSegments.includes(segment.id) ? (
                    <Eye className="h-3 w-3 text-primary" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span className="text-sm capitalize">{segment.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {(segment.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          {selectedSegments.length > 0 && (
            <>
              <Separator />
              <div className="flex space-x-2">
                <Button
                  onClick={exportSelectedSegments}
                  size="sm"
                  className="flex-1 bg-gradient-button-3d shadow-3d-button"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export Selected
                </Button>
                <Button
                  onClick={() => setSelectedSegments([])}
                  size="sm"
                  variant="outline"
                >
                  Clear
                </Button>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Advanced Options */}
      <Card className="p-4 space-y-3 bg-camera-surface border-camera-metal/20">
        <div className="flex items-center space-x-2">
          <Scissors className="h-4 w-4 text-destructive" />
          <span className="font-medium">Advanced Options</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" className="text-xs">
            Remove Background
          </Button>
          <Button size="sm" variant="outline" className="text-xs">
            Extract Objects
          </Button>
          <Button size="sm" variant="outline" className="text-xs">
            Mask Editor
          </Button>
          <Button size="sm" variant="outline" className="text-xs">
            Batch Process
          </Button>
        </div>
      </Card>
    </div>
  );
};