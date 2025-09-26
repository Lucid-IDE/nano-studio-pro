import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Camera,
  Aperture, 
  Sun,
  Palette,
  Focus,
  Zap,
  Settings2,
  Eye,
  Gauge
} from "lucide-react";

export const DSLRControls = () => {
  const [aperture, setAperture] = useState([2.8]);
  const [iso, setIso] = useState([400]);
  const [shutter, setShutter] = useState([125]);
  const [exposure, setExposure] = useState([0]);
  const [focus, setFocus] = useState([50]);
  const [saturation, setSaturation] = useState([50]);
  const [contrast, setContrast] = useState([50]);

  return (
    <div className="w-80 bg-panel border-l border-border overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center space-x-2 pb-2 border-b border-border">
          <Camera className="h-5 w-5 text-camera-accent" />
          <h3 className="font-semibold text-lg">DSLR Controls</h3>
        </div>

        {/* Camera Settings */}
        <Card className="bg-surface border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Aperture className="h-4 w-4 mr-2 text-camera-accent" />
              Camera Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-muted-foreground">Aperture</label>
                <Badge variant="secondary" className="bg-camera-metal/20">f/{aperture[0]}</Badge>
              </div>
              <Slider
                value={aperture}
                onValueChange={setAperture}
                max={22}
                min={1.4}
                step={0.1}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-muted-foreground">ISO</label>
                <Badge variant="secondary" className="bg-camera-metal/20">{iso[0]}</Badge>
              </div>
              <Slider
                value={iso}
                onValueChange={setIso}
                max={6400}
                min={100}
                step={100}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-muted-foreground">Shutter Speed</label>
                <Badge variant="secondary" className="bg-camera-metal/20">1/{shutter[0]}</Badge>
              </div>
              <Slider
                value={shutter}
                onValueChange={setShutter}
                max={4000}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Exposure & Focus */}
        <Card className="bg-surface border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Sun className="h-4 w-4 mr-2 text-highlight" />
              Exposure & Focus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-muted-foreground">Exposure</label>
                <Badge variant="secondary">{exposure[0] > 0 ? '+' : ''}{exposure[0]} EV</Badge>
              </div>
              <Slider
                value={exposure}
                onValueChange={setExposure}
                max={3}
                min={-3}
                step={0.1}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-muted-foreground">Focus Point</label>
                <Badge variant="secondary">{focus[0]}%</Badge>
              </div>
              <Slider
                value={focus}
                onValueChange={setFocus}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Color & Style */}
        <Card className="bg-surface border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Palette className="h-4 w-4 mr-2 text-accent" />
              Color & Style
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-muted-foreground">Saturation</label>
                <Badge variant="secondary">{saturation[0]}%</Badge>
              </div>
              <Slider
                value={saturation}
                onValueChange={setSaturation}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-muted-foreground">Contrast</label>
                <Badge variant="secondary">{contrast[0]}%</Badge>
              </div>
              <Slider
                value={contrast}
                onValueChange={setContrast}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Prompt Preview */}
        <Card className="bg-surface border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Eye className="h-4 w-4 mr-2 text-primary" />
              AI Prompt Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground bg-canvas-bg p-3 rounded border">
              Professional DSLR photo, aperture f/{aperture[0]}, ISO {iso[0]}, 
              shutter speed 1/{shutter[0]}, {exposure[0] > 0 ? 'overexposed' : exposure[0] < 0 ? 'underexposed' : 'balanced exposure'}, 
              {saturation[0] > 60 ? 'vibrant colors' : saturation[0] < 40 ? 'muted tones' : 'natural saturation'}, 
              {contrast[0] > 60 ? 'high contrast' : contrast[0] < 40 ? 'soft contrast' : 'balanced contrast'}
            </div>
            <Button className="w-full mt-3 bg-gradient-to-r from-primary to-accent hover:from-primary-glow hover:to-accent/80">
              <Zap className="h-4 w-4 mr-2" />
              Generate with AI
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};