import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Video, Play, Loader2, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface VideoGenPanelProps {
  sourceImage?: string;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

const VideoGenPanel = ({ sourceImage, canvasRef }: VideoGenPanelProps) => {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState([3]);
  const [fps, setFps] = useState([24]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a video generation prompt",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Get image from canvas or sourceImage
      let imageData = sourceImage;
      if (canvasRef?.current && !imageData) {
        imageData = canvasRef.current.toDataURL('image/png');
      }

      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          sourceImage: imageData,
          duration: duration[0],
          fps: fps[0]
        })
      });

      if (!response.ok) throw new Error('Video generation failed');

      const data = await response.json();
      setGeneratedVideo(data.videoUrl);
      
      toast({
        title: "Video Generated!",
        description: "Your AI video is ready"
      });
    } catch (error) {
      console.error('Video generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4 p-4 bg-gradient-to-br from-camera-metal/5 to-camera-metal/10">
      <Card className="bg-gradient-button-3d border-camera-metal/30 shadow-3d-button">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-camera-accent">
            <Video className="h-5 w-5" />
            <span>Google Video Generation</span>
          </CardTitle>
          <CardDescription>Convert your image to video with AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Video Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-camera-metal">Video Motion Prompt</label>
            <Textarea
              placeholder="Describe the motion and action... e.g., 'Camera slowly zooms in while the subject waves'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] bg-background/50 border-camera-metal/30"
            />
          </div>

          {/* Duration Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-camera-metal">Duration (seconds)</label>
              <Badge variant="secondary" className="bg-camera-metal/20 text-camera-accent">
                {duration[0]}s
              </Badge>
            </div>
            <Slider
              value={duration}
              onValueChange={setDuration}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
          </div>

          {/* FPS Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-camera-metal">Frame Rate (FPS)</label>
              <Badge variant="secondary" className="bg-camera-metal/20 text-camera-accent">
                {fps[0]} fps
              </Badge>
            </div>
            <Slider
              value={fps}
              onValueChange={setFps}
              min={12}
              max={60}
              step={12}
              className="w-full"
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-br from-camera-accent via-camera-accent/80 to-camera-accent/60 shadow-3d-button hover:from-camera-accent/90 hover:to-camera-accent/70"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Generate Video
              </>
            )}
          </Button>

          {/* Video Preview */}
          {generatedVideo && (
            <div className="space-y-2 pt-4 border-t border-camera-metal/30">
              <label className="text-sm font-medium text-camera-accent">Generated Video</label>
              <div className="relative rounded-lg overflow-hidden border-2 border-camera-accent/30">
                <video
                  src={generatedVideo}
                  controls
                  className="w-full aspect-video bg-black"
                />
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = generatedVideo;
                  a.download = 'generated-video.mp4';
                  a.click();
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Video
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-gradient-button-3d border-camera-metal/30 shadow-3d-button">
        <CardHeader>
          <CardTitle className="text-sm text-camera-metal">Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <p>• Describe camera movements (zoom, pan, rotate)</p>
          <p>• Specify subject actions and interactions</p>
          <p>• Mention lighting or atmospheric changes</p>
          <p>• Keep prompts clear and specific</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoGenPanel;
