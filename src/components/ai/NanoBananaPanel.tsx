import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Loader2, Sparkles, Wand2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { canvasToWebP, createBinaryMask, exceedsSizeLimit } from '@/utils/webpConverter';

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
  const [structuralWeight, setStructuralWeight] = useState([1.0]);
  const [colorWeight, setColorWeight] = useState([1.0]);
  const [featherAmount, setFeatherAmount] = useState([0.03]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [gotPlan, setGotPlan] = useState<string>('');
  const [showGoT, setShowGoT] = useState(false);

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
          generateGoT: true,
        },
      });

      if (error) throw error;

      if (data.got) {
        setGotPlan(data.got);
        toast({
          title: 'Generation Plan Ready',
          description: 'Review the plan before generating',
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

        // Create mask from selection
        if (selectedPixels && selectedPixels.size > 0) {
          maskImage = await createBinaryMask(
            canvas.width,
            canvas.height,
            selectedPixels,
            featherAmount[0]
          );

          if (exceedsSizeLimit(maskImage)) {
            toast({
              title: 'Mask Too Large',
              description: 'Mask exceeds 7MB limit. Please reduce canvas size.',
              variant: 'destructive',
            });
            setIsGenerating(false);
            return;
          }
        } else {
          toast({
            title: 'No Selection',
            description: 'Please select an area to edit using the selection tools',
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
          aspectRatio,
          structuralWeight: structuralWeight[0],
          colorWeight: colorWeight[0],
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
            <p className="text-xs text-muted-foreground">
              Use selection tools to define the area to edit
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Structural Weight (OAL)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={structuralWeight}
                  onValueChange={setStructuralWeight}
                  min={0}
                  max={1}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12 text-right">
                  {Math.round(structuralWeight[0] * 100)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Controls adherence to sketch structure
              </p>
            </div>

            <div className="space-y-2">
              <Label>Color Fidelity (CCL)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={colorWeight}
                  onValueChange={setColorWeight}
                  min={0}
                  max={1}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12 text-right">
                  {Math.round(colorWeight[0] * 100)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Controls color accuracy and consistency
              </p>
            </div>

            <div className="space-y-2">
              <Label>Edge Feathering</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={featherAmount}
                  onValueChange={setFeatherAmount}
                  min={0}
                  max={0.1}
                  step={0.01}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12 text-right">
                  {Math.round(featherAmount[0] * 100)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Blending radius for seamless edges
              </p>
            </div>
          </div>
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
          <li>Use specific, detailed prompts for best results</li>
          <li>Edit mode: Select area first, then describe changes</li>
          <li>Higher structural weight = stricter geometry adherence</li>
          <li>Preview Plan shows AI's step-by-step approach</li>
        </ul>
      </div>
    </div>
  );
};

export default NanoBananaPanel;
