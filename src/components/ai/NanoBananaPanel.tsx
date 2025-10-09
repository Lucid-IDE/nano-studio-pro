import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Wand2, Eye, Layers, Settings2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { canvasToWebP, createBinaryMask, exceedsSizeLimit } from '@/utils/webpConverter';
import { SketchOverlay, type SketchOverlayHandle } from '@/components/canvas/SketchOverlay';
import type { SketchAnalysis } from '@/utils/sketchMaskProcessor';

interface NanoBananaPanelProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  selectedPixels?: Set<number>;
  onImageGenerated: (imageUrl: string) => void;
}

const NanoBananaPanel: React.FC<NanoBananaPanelProps> = ({ 
  canvasRef, 
  selectedPixels,
  onImageGenerated 
}) => {
  const { toast } = useToast();
  const [mode, setMode] = useState<'generate' | 'edit'>('generate');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [structuralWeight, setStructuralWeight] = useState([0.7]);
  const [colorWeight, setColorWeight] = useState([0.3]);
  const [featherAmount, setFeatherAmount] = useState([0.03]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [gotPlan, setGotPlan] = useState<string>('');
  const [showGoT, setShowGoT] = useState(false);
  const [showSketchOverlay, setShowSketchOverlay] = useState(false);
  const [currentSketchAnalysis, setCurrentSketchAnalysis] = useState<SketchAnalysis | null>(null);
  const sketchOverlayRef = useRef<SketchOverlayHandle>(null);

  const aspectRatios = [
    { value: '1:1', label: 'Square (1:1)' },
    { value: '16:9', label: 'Landscape (16:9)' },
    { value: '9:16', label: 'Portrait (9:16)' },
    { value: '21:9', label: 'Cinematic (21:9)' },
    { value: '4:3', label: 'Standard (4:3)' },
  ];

  const generateGoT = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt Required',
        description: 'Please enter a prompt first',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setShowGoT(true);

    try {
      const { data, error } = await supabase.functions.invoke('nano-banana', {
        body: {
          mode,
          prompt,
          aspectRatio,
          sketchAnalysis: currentSketchAnalysis,
          structuralWeight: structuralWeight[0],
          colorWeight: colorWeight[0],
          featherAmount: featherAmount[0],
          generateGoT: true,
        },
      });

      if (error) throw error;

      if (data.got) {
        setGotPlan(data.got);
        toast({
          title: 'Generation Plan Ready',
          description: 'Review the AI\'s step-by-step approach below',
        });
      }
    } catch (error) {
      console.error('GoT generation error:', error);
      toast({
        title: 'Preview Failed',
        description: error instanceof Error ? error.message : 'Failed to generate preview',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt Required',
        description: 'Please enter a prompt to generate an image',
        variant: 'destructive',
      });
      return;
    }

    if (!canvasRef.current) {
      toast({
        title: 'Canvas Not Ready',
        description: 'Please wait for the canvas to load',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      let baseImage: string | undefined;
      let maskImage: string | undefined;

      // For edit mode, capture canvas and mask
      if (mode === 'edit') {
        const canvas = canvasRef.current;
        
        // Convert canvas to WebP
        baseImage = await canvasToWebP(canvas, 1.0);
        
        if (exceedsSizeLimit(baseImage)) {
          toast({
            title: 'Image Too Large',
            description: 'Base image exceeds 7MB limit. Please use a smaller canvas.',
            variant: 'destructive',
          });
          setIsGenerating(false);
          return;
        }

        // Get mask from sketch overlay if active, otherwise use selected pixels
        if (showSketchOverlay && sketchOverlayRef.current) {
          const sketchCanvas = sketchOverlayRef.current.getSketchCanvas();
          const sketchAnalysis = sketchOverlayRef.current.getSketchAnalysis();
          
          if (!sketchCanvas || !sketchAnalysis) {
            toast({
              title: 'No Sketch',
              description: 'Please draw a sketch overlay or disable sketch mode',
              variant: 'destructive',
            });
            setIsGenerating(false);
            return;
          }
          
          // Use the analyzed sketch mask
          maskImage = sketchAnalysis.binaryMask;
          
          console.log('Using sketch overlay with multimodal analysis:', {
            structuralSegments: sketchAnalysis.structuralMap.lineGeometry.length,
            colorRegions: sketchAnalysis.colorMap.length,
            confidence: sketchAnalysis.structuralMap.confidenceScore
          });
        } else {
          // Fallback to selected pixels mask
          if (selectedPixels && selectedPixels.size > 0) {
            maskImage = await createBinaryMask(
              canvas.width,
              canvas.height,
              selectedPixels,
              featherAmount[0]
            );
          } else {
            toast({
              title: 'No Selection',
              description: 'Please select an area or use sketch overlay',
              variant: 'destructive',
            });
            setIsGenerating(false);
            return;
          }
        }

        if (maskImage && exceedsSizeLimit(maskImage)) {
          toast({
            title: 'Mask Too Large',
            description: 'Mask exceeds 7MB limit. Please reduce canvas size.',
            variant: 'destructive',
          });
          setIsGenerating(false);
          return;
        }
      }

      // Call edge function
      const { data, error } = await supabase.functions.invoke('nano-banana', {
        body: {
          mode,
          prompt,
          baseImage,
          maskImage,
          sketchAnalysis: currentSketchAnalysis,
          aspectRatio,
          structuralWeight: structuralWeight[0],
          colorWeight: colorWeight[0],
          featherAmount: featherAmount[0],
          generateGoT: false,
        },
      });

      if (error) throw error;

      if (data.images && data.images.length > 0) {
        const generatedImageUrl = data.images[0];
        onImageGenerated(generatedImageUrl);
        
        toast({
          title: 'Image Generated!',
          description: `Successfully generated ${mode === 'edit' ? 'edited' : 'new'} image`,
        });

        setShowGoT(false);
        setGotPlan('');
      } else {
        throw new Error('No images returned from API');
      }

    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate image',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Nano Banana AI</h3>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as 'generate' | 'edit')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Prompt</Label>
            <Textarea
              placeholder="Describe the image you want to create..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Aspect Ratio</Label>
            <Select value={aspectRatio} onValueChange={setAspectRatio}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {aspectRatios.map((ar) => (
                  <SelectItem key={ar.value} value={ar.value}>
                    {ar.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="edit" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Edit Prompt</Label>
            <Textarea
              placeholder="Describe what to change in the selected area..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Sketch Overlay Toggle */}
          <Card className="p-3 bg-primary/5 border-primary/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Sketch Overlay</span>
              </div>
              <Button
                size="sm"
                variant={showSketchOverlay ? "default" : "outline"}
                onClick={() => setShowSketchOverlay(!showSketchOverlay)}
              >
                {showSketchOverlay ? 'Active' : 'Enable'}
              </Button>
            </div>
            {showSketchOverlay && (
              <p className="text-xs text-muted-foreground mt-2">
                Draw on canvas to define structural and color guidance
              </p>
            )}
          </Card>

          <Separator />

          {/* Advanced Multimodal Controls */}
          <Card className="p-3 bg-surface/50 border-border">
            <div className="flex items-center gap-2 mb-3">
              <Settings2 className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Multimodal Control</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Structure Weight (OAL)</Label>
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(structuralWeight[0] * 100)}%
                  </Badge>
                </div>
                <Slider
                  value={structuralWeight}
                  onValueChange={setStructuralWeight}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Preserve geometric structure and layout
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Color Weight (CCL)</Label>
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(colorWeight[0] * 100)}%
                  </Badge>
                </div>
                <Slider
                  value={colorWeight}
                  onValueChange={setColorWeight}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Apply color consistency in marked regions
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Edge Feathering</Label>
                  <Badge variant="secondary" className="text-xs">
                    {(featherAmount[0] * 100).toFixed(1)}%
                  </Badge>
                </div>
                <Slider
                  value={featherAmount}
                  onValueChange={setFeatherAmount}
                  min={0}
                  max={0.1}
                  step={0.01}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Smooth blend between edited and original
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2 pt-4">
        <Button
          onClick={generateGoT}
          disabled={isGenerating || !prompt.trim()}
          variant="outline"
          className="flex-1"
        >
          {isGenerating && showGoT ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Eye className="w-4 h-4 mr-2" />
          )}
          Preview Plan
        </Button>
        
        <Button
          onClick={generateImage}
          disabled={isGenerating || !prompt.trim()}
          className="flex-1"
        >
          {isGenerating && !showGoT ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4 mr-2" />
          )}
          Generate
        </Button>
      </div>

      {showGoT && gotPlan && (
        <Card className="p-4 mt-4 border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Generation Plan (GoT)
          </h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {gotPlan}
          </p>
        </Card>
      )}

      <div className="text-xs text-muted-foreground pt-2 border-t">
        <p className="font-medium mb-1">💡 Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Use sketch overlay for precise structural control</li>
          <li>Different sketch colors guide appearance changes</li>
          <li>Higher structure weight preserves layout better</li>
          <li>Preview Plan shows AI's step-by-step approach</li>
        </ul>
      </div>

      {/* Sketch Overlay Component */}
      {showSketchOverlay && canvasRef.current && (
        <SketchOverlay
          ref={sketchOverlayRef}
          baseCanvas={canvasRef.current}
          visible={showSketchOverlay}
          onSketchComplete={(analysis) => setCurrentSketchAnalysis(analysis)}
        />
      )}
    </div>
  );
};

export default NanoBananaPanel;
