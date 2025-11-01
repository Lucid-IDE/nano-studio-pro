import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Upload, 
  Trash2, 
  Search,
  Image as ImageIcon,
  FileImage,
  Grid3x3,
  List
} from "lucide-react";
import { toast } from "sonner";

interface Asset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'model';
  size: number;
  uploadedAt: Date;
}

export const AssetsPanel = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const uploadAsset = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*,.glb,.gltf';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      
      const newAssets: Asset[] = files.map(file => ({
        id: `asset-${Date.now()}-${Math.random()}`,
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' : 'model',
        size: file.size,
        uploadedAt: new Date()
      }));
      
      setAssets([...assets, ...newAssets]);
      toast.success(`${newAssets.length} asset(s) uploaded`);
    };
    input.click();
  };

  const deleteAsset = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      URL.revokeObjectURL(asset.url);
      setAssets(assets.filter(a => a.id !== assetId));
      toast.success("Asset deleted");
    }
  };

  const downloadAsset = (asset: Asset) => {
    const a = document.createElement('a');
    a.href = asset.url;
    a.download = asset.name;
    a.click();
    toast.success("Asset downloaded");
  };

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Assets Library</h3>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              className="h-7 w-7 p-0"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              className="h-7 w-7 p-0"
              onClick={() => setViewMode('list')}
            >
              <List className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 h-8 text-xs"
          />
        </div>

        {/* Upload Button */}
        <Button
          size="sm"
          variant="default"
          className="w-full"
          onClick={uploadAsset}
        >
          <Upload className="h-3 w-3 mr-2" />
          Upload Assets
        </Button>

        {/* Stats */}
        <div className="text-xs text-muted-foreground">
          {assets.length} asset{assets.length !== 1 ? 's' : ''} • {
            formatFileSize(assets.reduce((sum, a) => sum + a.size, 0))
          }
        </div>
      </div>

      {/* Assets Grid/List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FileImage className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground mb-1">No assets yet</p>
            <p className="text-xs text-muted-foreground/70">
              Upload images, videos, or 3D models to get started
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredAssets.map(asset => (
              <div
                key={asset.id}
                className="group relative rounded-lg border border-border overflow-hidden bg-surface hover:border-primary transition-colors cursor-pointer"
              >
                {/* Preview */}
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {asset.type === 'image' ? (
                    <img 
                      src={asset.url} 
                      alt={asset.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : asset.type === 'video' ? (
                    <video src={asset.url} className="w-full h-full object-cover" />
                  ) : (
                    <FileImage className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 px-2"
                    onClick={() => downloadAsset(asset)}
                  >
                    <ImageIcon className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 px-2"
                    onClick={() => deleteAsset(asset.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* Info */}
                <div className="p-2 bg-background/95">
                  <p className="text-xs font-medium truncate" title={asset.name}>
                    {asset.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(asset.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAssets.map(asset => (
              <div
                key={asset.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface hover:border-primary transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {asset.type === 'image' ? (
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                  ) : (
                    <FileImage className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{asset.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(asset.size)} • {asset.type}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => downloadAsset(asset)}
                  >
                    <ImageIcon className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    onClick={() => deleteAsset(asset.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
