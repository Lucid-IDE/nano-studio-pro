import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Plus,
  Scissors,
  Copy,
  Trash2,
  Move,
  RotateCw,
  Zap,
  Film,
  Clock,
  Undo2,
  Redo2,
  X
} from "lucide-react";

interface Frame {
  id: number;
  timestamp: number;
  thumbnail?: string;
  movements: {
    pan: { x: number; y: number };
    tilt: number;
    zoom: number;
    rotate: number;
  };
  prompt: string;
}

interface VideoTimelineProps {
  onClose?: () => void;
}

export const VideoTimeline = ({ onClose }: VideoTimelineProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [frames, setFrames] = useState<Frame[]>([
    {
      id: 1,
      timestamp: 0,
      movements: { pan: { x: 0, y: 0 }, tilt: 0, zoom: 100, rotate: 0 },
      prompt: "Wide establishing shot"
    },
    {
      id: 2,
      timestamp: 2000,
      movements: { pan: { x: 20, y: 0 }, tilt: 0, zoom: 120, rotate: 0 },
      prompt: "Slow zoom and pan right"
    },
    {
      id: 3,
      timestamp: 4000,
      movements: { pan: { x: 20, y: -10 }, tilt: 5, zoom: 150, rotate: 0 },
      prompt: "Tilt up slightly, continue zoom"
    },
  ]);

  const [selectedFrames, setSelectedFrames] = useState<number[]>([]);
  const totalDuration = 10000; // 10 seconds

  const addFrame = () => {
    const newFrame: Frame = {
      id: Date.now(),
      timestamp: (currentFrame / 100) * totalDuration,
      movements: { pan: { x: 0, y: 0 }, tilt: 0, zoom: 100, rotate: 0 },
      prompt: "New keyframe"
    };
    setFrames([...frames, newFrame].sort((a, b) => a.timestamp - b.timestamp));
  };

  const deleteSelectedFrames = () => {
    setFrames(frames.filter(frame => !selectedFrames.includes(frame.id)));
    setSelectedFrames([]);
  };

  const duplicateFrame = (frameId: number) => {
    const frame = frames.find(f => f.id === frameId);
    if (frame) {
      const newFrame = { ...frame, id: Date.now(), timestamp: frame.timestamp + 500 };
      setFrames([...frames, newFrame].sort((a, b) => a.timestamp - b.timestamp));
    }
  };

  return (
    <div className="bg-panel border-t border-border p-4 space-y-4">
      {/* Timeline Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Film className="h-4 w-4 text-camera-accent" />
            <span className="text-sm font-medium text-camera-accent">VIDEO TIMELINE</span>
          </div>
          
          <div className="w-px h-6 bg-border mx-2"></div>
          
          {/* Playback Controls */}
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-gradient-button-3d shadow-3d-button border border-camera-metal/30">
            <SkipBack className="h-3 w-3" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-10 w-10 p-0 bg-gradient-button-3d shadow-3d-button border border-camera-metal/30"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-gradient-button-3d shadow-3d-button border border-camera-metal/30">
            <SkipForward className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {/* History Controls */}
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-gradient-button-3d shadow-3d-button border border-camera-metal/30">
            <Undo2 className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-gradient-button-3d shadow-3d-button border border-camera-metal/30">
            <Redo2 className="h-3 w-3" />
          </Button>
          
          <div className="w-px h-6 bg-border mx-2"></div>
          
          {/* API Status */}
          <div className="flex items-center space-x-2 bg-gradient-to-r from-camera-metal/10 to-camera-metal/5 px-3 py-1 rounded-full border border-camera-metal/30">
            <Zap className="h-3 w-3 text-success" />
            <span className="text-xs text-camera-metal font-medium">15/15 API</span>
          </div>
          
          <div className="w-px h-6 bg-border mx-2"></div>
          
          {/* Timeline Tools */}
          <Button size="sm" variant="ghost" className="h-8 px-3 bg-gradient-button-3d shadow-3d-button border border-camera-metal/30 text-xs" onClick={addFrame}>
            <Plus className="h-3 w-3 mr-1" />
            Frame
          </Button>
          <Button size="sm" variant="ghost" className="h-8 px-3 bg-gradient-button-3d shadow-3d-button border border-camera-metal/30 text-xs">
            <Scissors className="h-3 w-3 mr-1" />
            Cut
          </Button>
          <Button size="sm" variant="ghost" className="h-8 px-3 bg-gradient-button-3d shadow-3d-button border border-camera-metal/30 text-xs">
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
          {selectedFrames.length > 0 && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 px-3 bg-gradient-button-3d shadow-3d-button border border-destructive/30 text-xs text-destructive" 
              onClick={deleteSelectedFrames}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          )}
          
          <div className="w-px h-6 bg-border mx-2"></div>
          
          {/* Generate Video */}
          <Button size="sm" className="h-8 px-4 bg-gradient-to-r from-primary to-accent text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Generate Video
          </Button>
          
          {/* Close Timeline */}
          {onClose && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0 bg-gradient-button-3d shadow-3d-button border border-camera-metal/30"
              onClick={onClose}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Timeline Scrubber */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[currentFrame]}
            onValueChange={([value]) => setCurrentFrame(value)}
            max={100}
            step={1}
            className="flex-1"
          />
          <div className="text-xs text-muted-foreground font-mono min-w-[80px]">
            {Math.floor((currentFrame / 100) * 10)}s / 10s
          </div>
        </div>
      </div>

      {/* Keyframes Track */}
      <div className="bg-surface rounded border border-border p-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">KEYFRAMES</span>
          <span className="text-xs text-muted-foreground">{frames.length} frames</span>
        </div>
        
        <div className="relative h-16 bg-canvas-bg rounded border border-border overflow-x-auto">
          {/* Timeline ruler */}
          <div className="absolute top-0 left-0 right-0 h-4 border-b border-border bg-surface/50">
            {Array.from({ length: 11 }).map((_, i) => (
              <div 
                key={i} 
                className="absolute top-0 bottom-0 w-px bg-border" 
                style={{ left: `${i * 10}%` }}
              >
                <div className="absolute -bottom-4 left-0 text-[10px] text-muted-foreground transform -translate-x-1/2">
                  {i}s
                </div>
              </div>
            ))}
          </div>

          {/* Current time indicator */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-camera-accent shadow-glow z-10" 
            style={{ left: `${currentFrame}%` }}
          >
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-camera-accent rounded-full shadow-glow"></div>
          </div>

          {/* Keyframes */}
          {frames.map((frame) => {
            const position = (frame.timestamp / totalDuration) * 100;
            const isSelected = selectedFrames.includes(frame.id);
            
            return (
              <div
                key={frame.id}
                className={`absolute top-4 bottom-0 w-2 cursor-pointer transform -translate-x-1/2 ${
                  isSelected ? 'bg-primary' : 'bg-success'
                } rounded-b shadow-3d-button hover:scale-110 transition-transform`}
                style={{ left: `${position}%` }}
                onClick={() => {
                  if (selectedFrames.includes(frame.id)) {
                    setSelectedFrames(selectedFrames.filter(id => id !== frame.id));
                  } else {
                    setSelectedFrames([...selectedFrames, frame.id]);
                  }
                }}
                title={frame.prompt}
              >
                {/* Keyframe icon */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-success rounded-full shadow-glow flex items-center justify-center">
                  <div className="w-2 h-2 bg-background rounded-full"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Movement Tracks */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-surface rounded p-2 border border-border">
          <div className="flex items-center space-x-1 mb-2">
            <Move className="h-3 w-3 text-camera-accent" />
            <span className="text-xs font-medium">PAN/TILT</span>
          </div>
          <div className="h-8 bg-canvas-bg rounded border border-border relative">
            <div className="absolute inset-1 bg-primary/20 rounded"></div>
          </div>
        </div>
        
        <div className="bg-surface rounded p-2 border border-border">
          <div className="flex items-center space-x-1 mb-2">
            <Plus className="h-3 w-3 text-camera-accent" />
            <span className="text-xs font-medium">ZOOM</span>
          </div>
          <div className="h-8 bg-canvas-bg rounded border border-border relative">
            <div className="absolute inset-1 bg-accent/20 rounded"></div>
          </div>
        </div>
        
        <div className="bg-surface rounded p-2 border border-border">
          <div className="flex items-center space-x-1 mb-2">
            <RotateCw className="h-3 w-3 text-camera-accent" />
            <span className="text-xs font-medium">ROTATE</span>
          </div>
          <div className="h-8 bg-canvas-bg rounded border border-border relative">
            <div className="absolute inset-1 bg-warning/20 rounded"></div>
          </div>
        </div>
        
        <div className="bg-surface rounded p-2 border border-border">
          <div className="flex items-center space-x-1 mb-2">
            <Zap className="h-3 w-3 text-camera-accent" />
            <span className="text-xs font-medium">AI ENHANCE</span>
          </div>
          <div className="h-8 bg-canvas-bg rounded border border-border relative">
            <div className="absolute inset-1 bg-success/20 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};