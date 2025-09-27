import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Box, 
  RotateCw, 
  Move3D, 
  Maximize2,
  Eye,
  Palette,
  Grid3X3
} from "lucide-react";

interface Cube3DOverlayProps {
  showCube: boolean;
  onCubeChange?: (params: CubeParams) => void;
}

interface CubeParams {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { width: number; height: number; depth: number };
  perspective: number;
  fov: number;
  walls: {
    front: string;
    back: string;
    left: string;
    right: string;
    top: string;
    bottom: string;
  };
}

export const Cube3DOverlay = ({ showCube, onCubeChange }: Cube3DOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cubeParams, setCubeParams] = useState<CubeParams>({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 15, y: 45, z: 0 },
    scale: { width: 200, height: 200, depth: 200 },
    perspective: 800,
    fov: 60,
    walls: {
      front: "#3b82f6",   // Blue
      back: "#ef4444",    // Red  
      left: "#10b981",    // Green
      right: "#f59e0b",   // Amber
      top: "#8b5cf6",     // Violet
      bottom: "#6b7280"   // Gray
    }
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!showCube) return;
    drawCube();
  }, [showCube, cubeParams]);

  useEffect(() => {
    onCubeChange?.(cubeParams);
  }, [cubeParams, onCubeChange]);

  const drawCube = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match parent
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const { position, rotation, scale, perspective } = cubeParams;
    
    // 3D to 2D projection
    const project3D = (x: number, y: number, z: number) => {
      // Apply rotation
      const cosRx = Math.cos(rotation.x * Math.PI / 180);
      const sinRx = Math.sin(rotation.x * Math.PI / 180);
      const cosRy = Math.cos(rotation.y * Math.PI / 180);
      const sinRy = Math.sin(rotation.y * Math.PI / 180);
      const cosRz = Math.cos(rotation.z * Math.PI / 180);
      const sinRz = Math.sin(rotation.z * Math.PI / 180);

      // Rotate around Y axis
      let rotatedX = x * cosRy - z * sinRy;
      let rotatedZ = x * sinRy + z * cosRy;
      
      // Rotate around X axis
      let rotatedY = y * cosRx - rotatedZ * sinRx;
      rotatedZ = y * sinRx + rotatedZ * cosRx;

      // Rotate around Z axis
      const finalX = rotatedX * cosRz - rotatedY * sinRz;
      const finalY = rotatedX * sinRz + rotatedY * cosRz;

      // Apply position offset
      const worldX = finalX + position.x;
      const worldY = finalY + position.y;
      const worldZ = rotatedZ + position.z;

      // Perspective projection
      const distance = perspective;
      const screenX = centerX + (worldX * distance) / (distance + worldZ);
      const screenY = centerY - (worldY * distance) / (distance + worldZ);

      return { x: screenX, y: screenY, z: worldZ };
    };

    // Define cube vertices
    const vertices = [
      // Front face
      project3D(-scale.width/2, -scale.height/2, scale.depth/2),  // 0
      project3D(scale.width/2, -scale.height/2, scale.depth/2),   // 1
      project3D(scale.width/2, scale.height/2, scale.depth/2),    // 2
      project3D(-scale.width/2, scale.height/2, scale.depth/2),   // 3
      // Back face
      project3D(-scale.width/2, -scale.height/2, -scale.depth/2), // 4
      project3D(scale.width/2, -scale.height/2, -scale.depth/2),  // 5
      project3D(scale.width/2, scale.height/2, -scale.depth/2),   // 6
      project3D(-scale.width/2, scale.height/2, -scale.depth/2),  // 7
    ];

    // Define faces (with z-sorting for proper rendering)
    const faces = [
      { vertices: [0, 1, 2, 3], color: cubeParams.walls.front, name: "Front Wall" },
      { vertices: [5, 4, 7, 6], color: cubeParams.walls.back, name: "Back Wall" },
      { vertices: [4, 0, 3, 7], color: cubeParams.walls.left, name: "Left Wall" },
      { vertices: [1, 5, 6, 2], color: cubeParams.walls.right, name: "Right Wall" },
      { vertices: [3, 2, 6, 7], color: cubeParams.walls.top, name: "Ceiling" },
      { vertices: [4, 5, 1, 0], color: cubeParams.walls.bottom, name: "Floor" },
    ];

    // Calculate face depths for z-sorting
    const facesWithDepth = faces.map(face => {
      const avgZ = face.vertices.reduce((sum, vIdx) => sum + vertices[vIdx].z, 0) / 4;
      return { ...face, avgZ };
    });

    // Sort by depth (back to front)
    facesWithDepth.sort((a, b) => a.avgZ - b.avgZ);

    // Draw faces
    facesWithDepth.forEach(face => {
      ctx.beginPath();
      const firstVertex = vertices[face.vertices[0]];
      ctx.moveTo(firstVertex.x, firstVertex.y);

      for (let i = 1; i < face.vertices.length; i++) {
        const vertex = vertices[face.vertices[i]];
        ctx.lineTo(vertex.x, vertex.y);
      }
      ctx.closePath();

      // Fill face with transparency
      const alpha = face.avgZ > 0 ? 0.3 : 0.15; // Front faces more opaque
      ctx.fillStyle = face.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.fill();

      // Draw edges
      ctx.strokeStyle = face.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = face.avgZ > 0 ? 0.8 : 0.4;
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Draw vertices as control points
    vertices.forEach((vertex, i) => {
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = vertex.z > 0 ? "#ffffff" : "#94a3b8";
      ctx.fill();
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw coordinate axes
    const axisLength = 60;
    const origin = project3D(0, 0, 0);
    
    // X axis (red)
    const xEnd = project3D(axisLength, 0, 0);
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(xEnd.x, xEnd.y);
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Y axis (green)
    const yEnd = project3D(0, axisLength, 0);
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(yEnd.x, yEnd.y);
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Z axis (blue)
    const zEnd = project3D(0, 0, axisLength);
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(zEnd.x, zEnd.y);
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setCubeParams(prev => ({
      ...prev,
      rotation: {
        ...prev.rotation,
        y: prev.rotation.y + deltaX * 0.5,
        x: prev.rotation.x - deltaY * 0.5,
      }
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!showCube) return null;

  return (
    <>
      {/* 3D Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* 3D Cube Controls Panel */}
      <div className="absolute top-4 right-4 bg-surface/95 backdrop-blur-sm rounded-lg border border-border p-3 space-y-3 w-64">
        <div className="flex items-center space-x-2">
          <Box className="h-4 w-4 text-camera-accent" />
          <span className="text-sm font-medium text-camera-accent">3D PERSPECTIVE GUIDE</span>
        </div>

        {/* Position Controls */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Move3D className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium">Position</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="text-[10px] text-muted-foreground mb-1">X</div>
              <Slider
                value={[cubeParams.position.x]}
                onValueChange={([x]) => setCubeParams(prev => ({
                  ...prev,
                  position: { ...prev.position, x }
                }))}
                min={-200}
                max={200}
                step={5}
                className="h-2"
              />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground mb-1">Y</div>
              <Slider
                value={[cubeParams.position.y]}
                onValueChange={([y]) => setCubeParams(prev => ({
                  ...prev,
                  position: { ...prev.position, y }
                }))}
                min={-200}
                max={200}
                step={5}
                className="h-2"
              />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground mb-1">Z</div>
              <Slider
                value={[cubeParams.position.z]}
                onValueChange={([z]) => setCubeParams(prev => ({
                  ...prev,
                  position: { ...prev.position, z }
                }))}
                min={-200}
                max={200}
                step={5}
                className="h-2"
              />
            </div>
          </div>
        </div>

        {/* Rotation Controls */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <RotateCw className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium">Rotation (°)</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="text-[10px] text-muted-foreground mb-1">Pitch</div>
              <Slider
                value={[cubeParams.rotation.x]}
                onValueChange={([x]) => setCubeParams(prev => ({
                  ...prev,
                  rotation: { ...prev.rotation, x }
                }))}
                min={-90}
                max={90}
                step={1}
                className="h-2"
              />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground mb-1">Yaw</div>
              <Slider
                value={[cubeParams.rotation.y]}
                onValueChange={([y]) => setCubeParams(prev => ({
                  ...prev,
                  rotation: { ...prev.rotation, y }
                }))}
                min={0}
                max={360}
                step={1}
                className="h-2"
              />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground mb-1">Roll</div>
              <Slider
                value={[cubeParams.rotation.z]}
                onValueChange={([z]) => setCubeParams(prev => ({
                  ...prev,
                  rotation: { ...prev.rotation, z }
                }))}
                min={-45}
                max={45}
                step={1}
                className="h-2"
              />
            </div>
          </div>
        </div>

        {/* Scale Controls */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Maximize2 className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium">Dimensions</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="text-[10px] text-muted-foreground mb-1">W</div>
              <Slider
                value={[cubeParams.scale.width]}
                onValueChange={([width]) => setCubeParams(prev => ({
                  ...prev,
                  scale: { ...prev.scale, width }
                }))}
                min={50}
                max={400}
                step={10}
                className="h-2"
              />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground mb-1">H</div>
              <Slider
                value={[cubeParams.scale.height]}
                onValueChange={([height]) => setCubeParams(prev => ({
                  ...prev,
                  scale: { ...prev.scale, height }
                }))}
                min={50}
                max={400}
                step={10}
                className="h-2"
              />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground mb-1">D</div>
              <Slider
                value={[cubeParams.scale.depth]}
                onValueChange={([depth]) => setCubeParams(prev => ({
                  ...prev,
                  scale: { ...prev.scale, depth }
                }))}
                min={50}
                max={400}
                step={10}
                className="h-2"
              />
            </div>
          </div>
        </div>

        {/* Perspective Control */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Eye className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium">Perspective</span>
          </div>
          <Slider
            value={[cubeParams.perspective]}
            onValueChange={([perspective]) => setCubeParams(prev => ({
              ...prev,
              perspective
            }))}
            min={200}
            max={1200}
            step={20}
            className="h-2"
          />
        </div>

        {/* Wall Color Indicators */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Palette className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium">Wall Colors</span>
          </div>
          <div className="grid grid-cols-3 gap-1 text-[10px]">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cubeParams.walls.front }}></div>
              <span>Front</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cubeParams.walls.back }}></div>
              <span>Back</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cubeParams.walls.left }}></div>
              <span>Left</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cubeParams.walls.right }}></div>
              <span>Right</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cubeParams.walls.top }}></div>
              <span>Top</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cubeParams.walls.bottom }}></div>
              <span>Floor</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-1">
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 px-2 text-xs bg-gradient-button-3d shadow-3d-button border border-camera-metal/30"
            onClick={() => setCubeParams(prev => ({ ...prev, rotation: { x: 0, y: 0, z: 0 } }))}
          >
            Reset
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 px-2 text-xs bg-gradient-button-3d shadow-3d-button border border-camera-metal/30"
            onClick={() => setCubeParams(prev => ({ ...prev, rotation: { x: 15, y: 45, z: 0 } }))}
          >
            Iso
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 px-2 text-xs bg-gradient-button-3d shadow-3d-button border border-camera-metal/30"
            onClick={() => setCubeParams(prev => ({ ...prev, rotation: { x: 0, y: 90, z: 0 } }))}
          >
            Side
          </Button>
        </div>
      </div>
    </>
  );
};