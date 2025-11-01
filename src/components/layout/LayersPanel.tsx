import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  Image as ImageIcon,
  Layers,
  Upload,
  ChevronDown,
  ChevronRight,
  Box
} from "lucide-react";
import { toast } from "sonner";

interface Layer {
  id: string;
  name: string;
  type: '2d' | '3d';
  visible: boolean;
  locked: boolean;
  opacity: number;
  imageUrl?: string;
  position3D?: { x: number; y: number; z: number };
  rotation3D?: { x: number; y: number; z: number };
  scale3D?: { x: number; y: number };
}

interface LayersPanelProps {
  cubeParams?: any;
  onCubeParamsChange?: (params: any) => void;
}

export const LayersPanel = ({ cubeParams, onCubeParamsChange }: LayersPanelProps) => {
  const [layers, setLayers] = useState<Layer[]>([
    { 
      id: 'layer-1', 
      name: 'Background', 
      type: '2d', 
      visible: true, 
      locked: false, 
      opacity: 100 
    }
  ]);
  const [selectedLayerId, setSelectedLayerId] = useState<string>('layer-1');
  const [expanded2D, setExpanded2D] = useState(true);
  const [expanded3D, setExpanded3D] = useState(true);

  const layers2D = layers.filter(l => l.type === '2d');
  const layers3D = layers.filter(l => l.type === '3d');

  const addLayer = (type: '2d' | '3d') => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name: `${type.toUpperCase()} Layer ${layers.filter(l => l.type === type).length + 1}`,
      type,
      visible: true,
      locked: false,
      opacity: 100,
      ...(type === '3d' && {
        position3D: { x: 0, y: 0, z: 0 },
        rotation3D: { x: 0, y: 0, z: 0 },
        scale3D: { x: 1, y: 1 }
      })
    };
    
    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
    
    // Update 3D params if adding 3D layer
    if (type === '3d' && cubeParams && onCubeParamsChange) {
      const newLayers3D = [...(cubeParams.layers3D || []), {
        id: newLayer.id,
        imageUrl: '',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1 }
      }];
      onCubeParamsChange({ ...cubeParams, layers3D: newLayers3D });
    }
    
    toast.success(`${type.toUpperCase()} layer added`);
  };

  const deleteLayer = (layerId: string) => {
    if (layers.length === 1) {
      toast.error("Cannot delete the last layer");
      return;
    }
    
    const layer = layers.find(l => l.id === layerId);
    setLayers(layers.filter(l => l.id !== layerId));
    
    if (selectedLayerId === layerId) {
      setSelectedLayerId(layers[0].id);
    }
    
    // Update 3D params if deleting 3D layer
    if (layer?.type === '3d' && cubeParams && onCubeParamsChange) {
      const newLayers3D = (cubeParams.layers3D || []).filter((l: any) => l.id !== layerId);
      onCubeParamsChange({ ...cubeParams, layers3D: newLayers3D });
    }
    
    toast.success("Layer deleted");
  };

  const toggleVisibility = (layerId: string) => {
    setLayers(layers.map(l => 
      l.id === layerId ? { ...l, visible: !l.visible } : l
    ));
  };

  const toggleLock = (layerId: string) => {
    setLayers(layers.map(l => 
      l.id === layerId ? { ...l, locked: !l.locked } : l
    ));
  };

  const updateOpacity = (layerId: string, opacity: number) => {
    setLayers(layers.map(l => 
      l.id === layerId ? { ...l, opacity } : l
    ));
  };

  const updateLayerName = (layerId: string, name: string) => {
    setLayers(layers.map(l => 
      l.id === layerId ? { ...l, name } : l
    ));
  };

  const uploadToLayer = (layerId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      // Create object URL for the image
      const imageUrl = URL.createObjectURL(file);
      
      setLayers(layers.map(l => 
        l.id === layerId ? { ...l, imageUrl } : l
      ));
      
      // Update 3D params if it's a 3D layer
      const layer = layers.find(l => l.id === layerId);
      if (layer?.type === '3d' && cubeParams && onCubeParamsChange) {
        const newLayers3D = (cubeParams.layers3D || []).map((l: any) => 
          l.id === layerId ? { ...l, imageUrl } : l
        );
        onCubeParamsChange({ ...cubeParams, layers3D: newLayers3D });
      }
      
      toast.success("Image uploaded to layer");
    };
    input.click();
  };

  const renderLayer = (layer: Layer) => {
    const isSelected = selectedLayerId === layer.id;
    
    return (
      <div
        key={layer.id}
        className={`p-2 rounded border transition-colors cursor-pointer ${
          isSelected 
            ? 'bg-primary/10 border-primary' 
            : 'bg-surface border-border hover:bg-surface/80'
        }`}
        onClick={() => !layer.locked && setSelectedLayerId(layer.id)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {layer.type === '3d' ? <Box className="h-3 w-3 text-camera-accent flex-shrink-0" /> : <Layers className="h-3 w-3 flex-shrink-0" />}
            <Input
              value={layer.name}
              onChange={(e) => updateLayerName(layer.id, e.target.value)}
              className="h-6 text-xs bg-transparent border-none px-1 flex-1 min-w-0"
              disabled={layer.locked}
            />
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleVisibility(layer.id);
              }}
            >
              {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleLock(layer.id);
              }}
            >
              {layer.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                deleteLayer(layer.id);
              }}
              disabled={layers.length === 1}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Layer Preview */}
        {layer.imageUrl && (
          <div className="mb-2 rounded overflow-hidden border border-border">
            <img src={layer.imageUrl} alt={layer.name} className="w-full h-16 object-cover" />
          </div>
        )}
        
        {/* Upload Button */}
        <Button
          size="sm"
          variant="outline"
          className="w-full h-7 text-xs mb-2"
          onClick={(e) => {
            e.stopPropagation();
            uploadToLayer(layer.id);
          }}
          disabled={layer.locked}
        >
          <Upload className="h-3 w-3 mr-1" />
          Upload Image
        </Button>
        
        {/* Opacity Slider */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Opacity</span>
            <span className="text-xs font-medium">{layer.opacity}%</span>
          </div>
          <Slider
            value={[layer.opacity]}
            onValueChange={([value]) => updateOpacity(layer.id, value)}
            min={0}
            max={100}
            step={1}
            className="w-full"
            disabled={layer.locked}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold mb-3">Layers</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => addLayer('2d')}
          >
            <Plus className="h-3 w-3 mr-1" />
            2D Layer
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => addLayer('3d')}
          >
            <Plus className="h-3 w-3 mr-1" />
            3D Layer
          </Button>
        </div>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 2D Layers Group */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start mb-2 h-7"
            onClick={() => setExpanded2D(!expanded2D)}
          >
            {expanded2D ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
            <Layers className="h-3 w-3 mr-2" />
            <span className="text-xs font-medium">2D Layers ({layers2D.length})</span>
          </Button>
          {expanded2D && (
            <div className="space-y-2">
              {layers2D.map(renderLayer)}
            </div>
          )}
        </div>

        {/* 3D Layers Group */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start mb-2 h-7"
            onClick={() => setExpanded3D(!expanded3D)}
          >
            {expanded3D ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
            <Box className="h-3 w-3 mr-2" />
            <span className="text-xs font-medium">3D Layers ({layers3D.length})</span>
          </Button>
          {expanded3D && (
            <div className="space-y-2">
              {layers3D.map(renderLayer)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
