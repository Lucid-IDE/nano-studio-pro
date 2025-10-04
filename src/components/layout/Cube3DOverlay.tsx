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
  faceOffsets: {
    front: number;
    back: number;
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
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
    faceOffsets: {
      front: 100,
      back: -100,
      left: -100,
      right: 100,
      top: 100,
      bottom: -100
    },
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
  const [dragMode, setDragMode] = useState<'rotate' | 'position' | 'scale'>('rotate');
  const [selectedCorner, setSelectedCorner] = useState<number | null>(null);
  const [selectedArrow, setSelectedArrow] = useState<string | null>(null);
  const [hoveredArrow, setHoveredArrow] = useState<string | null>(null);

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
    
    const { position, rotation, faceOffsets, perspective } = cubeParams;
    
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

    // Define cube vertices using individual face offsets
    const vertices = [
      // Front face (Z+ axis)
      project3D(faceOffsets.left, faceOffsets.bottom, faceOffsets.front),  // 0
      project3D(faceOffsets.right, faceOffsets.bottom, faceOffsets.front),   // 1
      project3D(faceOffsets.right, faceOffsets.top, faceOffsets.front),    // 2
      project3D(faceOffsets.left, faceOffsets.top, faceOffsets.front),   // 3
      // Back face (Z- axis)
      project3D(faceOffsets.left, faceOffsets.bottom, faceOffsets.back), // 4
      project3D(faceOffsets.right, faceOffsets.bottom, faceOffsets.back),  // 5
      project3D(faceOffsets.right, faceOffsets.top, faceOffsets.back),   // 6
      project3D(faceOffsets.left, faceOffsets.top, faceOffsets.back),  // 7
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

      // Fill face with transparency (dimmed)
      const alpha = face.avgZ > 0 ? 0.15 : 0.08; // More transparent
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
      const radius = selectedCorner === i ? 6 : 4;
      ctx.arc(vertex.x, vertex.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = selectedCorner === i ? "#fbbf24" : (vertex.z > 0 ? "#ffffff" : "#94a3b8");
      ctx.fill();
      ctx.strokeStyle = selectedCorner === i ? "#f59e0b" : "#1e293b";
      ctx.lineWidth = selectedCorner === i ? 2 : 1;
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

    // Draw face arrows
    drawFaceArrows(ctx, project3D);
  };

  const drawFaceArrows = (ctx: CanvasRenderingContext2D, project3D: (x: number, y: number, z: number) => { x: number; y: number; z: number }) => {
    const arrowLength = 40;
    const arrowHeadSize = 8;
    const { faceOffsets } = cubeParams;

    // Calculate face centers and arrow endpoints
    const arrows = [
      { 
        name: 'front', 
        center: project3D(0, 0, faceOffsets.front),
        end: project3D(0, 0, faceOffsets.front + arrowLength),
        color: cubeParams.walls.front
      },
      { 
        name: 'back', 
        center: project3D(0, 0, faceOffsets.back),
        end: project3D(0, 0, faceOffsets.back - arrowLength),
        color: cubeParams.walls.back
      },
      { 
        name: 'left', 
        center: project3D(faceOffsets.left, 0, 0),
        end: project3D(faceOffsets.left - arrowLength, 0, 0),
        color: cubeParams.walls.left
      },
      { 
        name: 'right', 
        center: project3D(faceOffsets.right, 0, 0),
        end: project3D(faceOffsets.right + arrowLength, 0, 0),
        color: cubeParams.walls.right
      },
      { 
        name: 'top', 
        center: project3D(0, faceOffsets.top, 0),
        end: project3D(0, faceOffsets.top + arrowLength, 0),
        color: cubeParams.walls.top
      },
      { 
        name: 'bottom', 
        center: project3D(0, faceOffsets.bottom, 0),
        end: project3D(0, faceOffsets.bottom - arrowLength, 0),
        color: cubeParams.walls.bottom
      },
    ];

    arrows.forEach(arrow => {
      const isSelected = selectedArrow === arrow.name;
      const isHovered = hoveredArrow === arrow.name;
      
      // Brighten the color
      const brightColor = brightenColor(arrow.color, 40);
      
      // Draw arrow line
      ctx.beginPath();
      ctx.moveTo(arrow.center.x, arrow.center.y);
      ctx.lineTo(arrow.end.x, arrow.end.y);
      ctx.strokeStyle = isSelected ? '#fbbf24' : (isHovered ? '#ffffff' : brightColor);
      ctx.lineWidth = isSelected ? 4 : (isHovered ? 3 : 2);
      ctx.stroke();

      // Draw arrow head
      const angle = Math.atan2(arrow.end.y - arrow.center.y, arrow.end.x - arrow.center.x);
      ctx.beginPath();
      ctx.moveTo(arrow.end.x, arrow.end.y);
      ctx.lineTo(
        arrow.end.x - arrowHeadSize * Math.cos(angle - Math.PI / 6),
        arrow.end.y - arrowHeadSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        arrow.end.x - arrowHeadSize * Math.cos(angle + Math.PI / 6),
        arrow.end.y - arrowHeadSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = isSelected ? '#fbbf24' : (isHovered ? '#ffffff' : brightColor);
      ctx.fill();

      // Draw interactive circle at arrow base
      ctx.beginPath();
      ctx.arc(arrow.center.x, arrow.center.y, isSelected ? 8 : (isHovered ? 7 : 5), 0, 2 * Math.PI);
      ctx.fillStyle = isSelected ? '#fbbf24' : (isHovered ? '#ffffff' : brightColor);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  };

  const brightenColor = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, ((num >> 16) & 255) + percent);
    const g = Math.min(255, ((num >> 8) & 255) + percent);
    const b = Math.min(255, (num & 255) + percent);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  const getMousePosition = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const findNearestArrow = (mousePos: { x: number; y: number }): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const { position, rotation, faceOffsets, perspective } = cubeParams;
    
    const project3D = (x: number, y: number, z: number) => {
      const cosRx = Math.cos(rotation.x * Math.PI / 180);
      const sinRx = Math.sin(rotation.x * Math.PI / 180);
      const cosRy = Math.cos(rotation.y * Math.PI / 180);
      const sinRy = Math.sin(rotation.y * Math.PI / 180);
      const cosRz = Math.cos(rotation.z * Math.PI / 180);
      const sinRz = Math.sin(rotation.z * Math.PI / 180);

      let rotatedX = x * cosRy - z * sinRy;
      let rotatedZ = x * sinRy + z * cosRy;
      let rotatedY = y * cosRx - rotatedZ * sinRx;
      rotatedZ = y * sinRx + rotatedZ * cosRx;
      const finalX = rotatedX * cosRz - rotatedY * sinRz;
      const finalY = rotatedX * sinRz + rotatedY * cosRz;

      const worldX = finalX + position.x;
      const worldY = finalY + position.y;
      const worldZ = rotatedZ + position.z;

      const distance = perspective;
      const screenX = centerX + (worldX * distance) / (distance + worldZ);
      const screenY = centerY - (worldY * distance) / (distance + worldZ);

      return { x: screenX, y: screenY, z: worldZ };
    };

    // Check arrows
    const arrows = [
      { name: 'front', center: project3D(0, 0, faceOffsets.front) },
      { name: 'back', center: project3D(0, 0, faceOffsets.back) },
      { name: 'left', center: project3D(faceOffsets.left, 0, 0) },
      { name: 'right', center: project3D(faceOffsets.right, 0, 0) },
      { name: 'top', center: project3D(0, faceOffsets.top, 0) },
      { name: 'bottom', center: project3D(0, faceOffsets.bottom, 0) },
    ];

    for (const arrow of arrows) {
      const distance = Math.sqrt(
        Math.pow(mousePos.x - arrow.center.x, 2) + Math.pow(mousePos.y - arrow.center.y, 2)
      );
      if (distance <= 12) {
        return arrow.name;
      }
    }
    
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const mousePos = getMousePosition(e);
    const nearestArrow = findNearestArrow(mousePos);
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    
    if (nearestArrow !== null) {
      setSelectedArrow(nearestArrow);
      setDragMode('scale');
    } else if (e.button === 2) { // Right click
      setDragMode('position');
    } else { // Left click
      setDragMode('rotate');
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) {
      // Update hover state for arrows
      const mousePos = getMousePosition(e);
      const nearestArrow = findNearestArrow(mousePos);
      setHoveredArrow(nearestArrow);
      return;
    }

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    if (dragMode === 'rotate') {
      setCubeParams(prev => ({
        ...prev,
        rotation: {
          ...prev.rotation,
          y: prev.rotation.y + deltaX * 0.5,
          x: prev.rotation.x - deltaY * 0.5,
        }
      }));
    } else if (dragMode === 'position') {
      setCubeParams(prev => ({
        ...prev,
        position: {
          ...prev.position,
          x: prev.position.x + deltaX * 0.5,
          y: prev.position.y - deltaY * 0.5,
        }
      }));
    } else if (dragMode === 'scale' && selectedArrow !== null) {
      // Adjust individual face based on arrow
      const delta = (deltaX + deltaY) * 0.5;
      setCubeParams(prev => {
        const newOffsets = { ...prev.faceOffsets };
        
        switch (selectedArrow) {
          case 'front':
            newOffsets.front = Math.max(25, Math.min(200, prev.faceOffsets.front + delta));
            break;
          case 'back':
            newOffsets.back = Math.max(-200, Math.min(-25, prev.faceOffsets.back - delta));
            break;
          case 'left':
            newOffsets.left = Math.max(-200, Math.min(-25, prev.faceOffsets.left - delta));
            break;
          case 'right':
            newOffsets.right = Math.max(25, Math.min(200, prev.faceOffsets.right + delta));
            break;
          case 'top':
            newOffsets.top = Math.max(25, Math.min(200, prev.faceOffsets.top + delta));
            break;
          case 'bottom':
            newOffsets.bottom = Math.max(-200, Math.min(-25, prev.faceOffsets.bottom - delta));
            break;
        }
        
        return { ...prev, faceOffsets: newOffsets };
      });
    }

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setSelectedArrow(null);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default right-click menu
  };

  if (!showCube) return null;

  return (
    <>
      {/* 3D Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 pointer-events-auto ${
          hoveredArrow !== null || selectedArrow !== null ? 'cursor-pointer' : 
          dragMode === 'position' ? 'cursor-move' : 'cursor-grab'
        } ${isDragging && dragMode === 'rotate' ? 'active:cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
      />

      {/* 3D Cube Controls Panel */}
      <div className="absolute top-4 right-4 bg-surface/95 backdrop-blur-sm rounded-lg border border-border p-3 space-y-3 w-64">
        <div className="flex items-center space-x-2">
          <Box className="h-4 w-4 text-camera-accent" />
          <span className="text-sm font-medium text-camera-accent">3D FACE CONTROLS</span>
        </div>

        {/* Face Controls - Individual Face Sliders */}
        <div className="space-y-2">
          <span className="text-xs font-medium">Adjust Each Face</span>
          
          {/* Front Face */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded border border-border cursor-pointer" 
                  style={{ backgroundColor: cubeParams.walls.front }}
                ></div>
                <span className="text-xs">Front</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{cubeParams.faceOffsets.front.toFixed(0)}</span>
            </div>
            <Slider
              value={[cubeParams.faceOffsets.front]}
              onValueChange={([front]) => setCubeParams(prev => ({
                ...prev,
                faceOffsets: { ...prev.faceOffsets, front }
              }))}
              min={25}
              max={200}
              step={5}
              className="h-2"
            />
          </div>

          {/* Back Face */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded border border-border cursor-pointer" 
                  style={{ backgroundColor: cubeParams.walls.back }}
                ></div>
                <span className="text-xs">Back</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{cubeParams.faceOffsets.back.toFixed(0)}</span>
            </div>
            <Slider
              value={[cubeParams.faceOffsets.back]}
              onValueChange={([back]) => setCubeParams(prev => ({
                ...prev,
                faceOffsets: { ...prev.faceOffsets, back }
              }))}
              min={-200}
              max={-25}
              step={5}
              className="h-2"
            />
          </div>

          {/* Left Face */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded border border-border cursor-pointer" 
                  style={{ backgroundColor: cubeParams.walls.left }}
                ></div>
                <span className="text-xs">Left</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{cubeParams.faceOffsets.left.toFixed(0)}</span>
            </div>
            <Slider
              value={[cubeParams.faceOffsets.left]}
              onValueChange={([left]) => setCubeParams(prev => ({
                ...prev,
                faceOffsets: { ...prev.faceOffsets, left }
              }))}
              min={-200}
              max={-25}
              step={5}
              className="h-2"
            />
          </div>

          {/* Right Face */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded border border-border cursor-pointer" 
                  style={{ backgroundColor: cubeParams.walls.right }}
                ></div>
                <span className="text-xs">Right</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{cubeParams.faceOffsets.right.toFixed(0)}</span>
            </div>
            <Slider
              value={[cubeParams.faceOffsets.right]}
              onValueChange={([right]) => setCubeParams(prev => ({
                ...prev,
                faceOffsets: { ...prev.faceOffsets, right }
              }))}
              min={25}
              max={200}
              step={5}
              className="h-2"
            />
          </div>

          {/* Top Face */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded border border-border cursor-pointer" 
                  style={{ backgroundColor: cubeParams.walls.top }}
                ></div>
                <span className="text-xs">Top</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{cubeParams.faceOffsets.top.toFixed(0)}</span>
            </div>
            <Slider
              value={[cubeParams.faceOffsets.top]}
              onValueChange={([top]) => setCubeParams(prev => ({
                ...prev,
                faceOffsets: { ...prev.faceOffsets, top }
              }))}
              min={25}
              max={200}
              step={5}
              className="h-2"
            />
          </div>

          {/* Bottom Face */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded border border-border cursor-pointer" 
                  style={{ backgroundColor: cubeParams.walls.bottom }}
                ></div>
                <span className="text-xs">Bottom</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{cubeParams.faceOffsets.bottom.toFixed(0)}</span>
            </div>
            <Slider
              value={[cubeParams.faceOffsets.bottom]}
              onValueChange={([bottom]) => setCubeParams(prev => ({
                ...prev,
                faceOffsets: { ...prev.faceOffsets, bottom }
              }))}
              min={-200}
              max={-25}
              step={5}
              className="h-2"
            />
          </div>
        </div>

        {/* Rotation Controls */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <RotateCw className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium">Rotation</span>
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

        {/* Quick Actions */}
        <div className="flex space-x-1">
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 px-2 text-xs bg-gradient-button-3d shadow-3d-button border border-camera-metal/30"
            onClick={() => setCubeParams(prev => ({ 
              ...prev, 
              rotation: { x: 0, y: 0, z: 0 },
              faceOffsets: { front: 100, back: -100, left: -100, right: 100, top: 100, bottom: -100 }
            }))}
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