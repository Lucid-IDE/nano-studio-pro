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
  cubeParams?: CubeParams;
  onCubeParamsChange?: (params: CubeParams) => void;
}

export interface CubeParams {
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
  floor: {
    enabled: boolean;
    height: number;
    azimuth: number;
    color: string;
  };
  objects: Array<{
    id: string;
    type: 'car' | 'person';
    position: { x: number; y: number; z: number };
    rotation: number;
  }>;
}

export const Cube3DOverlay = ({ showCube, onCubeChange, cubeParams: externalCubeParams, onCubeParamsChange }: Cube3DOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [internalCubeParams, setInternalCubeParams] = useState<CubeParams>({
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
    },
    floor: {
      enabled: true,
      height: -100,
      azimuth: 0,
      color: "#94a3b8"
    },
    objects: []
  });

  const cubeParams = externalCubeParams || internalCubeParams;
  const setCubeParams = onCubeParamsChange || setInternalCubeParams;

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragMode, setDragMode] = useState<'rotate' | 'position' | 'arrow' | 'rotation-circle'>('rotate');
  const [selectedArrow, setSelectedArrow] = useState<string | null>(null);
  const [hoveredArrow, setHoveredArrow] = useState<string | null>(null);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);

  useEffect(() => {
    if (!showCube) return;
    drawCube();
  }, [showCube, cubeParams]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(true);
      if (e.key === 'Control' || e.key === 'Meta') setIsCtrlPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(false);
      if (e.key === 'Control' || e.key === 'Meta') setIsCtrlPressed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

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

    // Draw floor if enabled
    if (cubeParams.floor.enabled) {
      drawFloor(ctx, project3D);
    }

    // Draw objects (cars, people)
    drawObjects(ctx, project3D);

    // Draw coordinate axes with draggable balls
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
    
    // X axis ball
    ctx.beginPath();
    ctx.arc(xEnd.x, xEnd.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = hoveredArrow === 'axis-x' || selectedArrow === 'axis-x' ? "#fbbf24" : "#ef4444";
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Y axis (green)
    const yEnd = project3D(0, axisLength, 0);
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(yEnd.x, yEnd.y);
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Y axis ball
    ctx.beginPath();
    ctx.arc(yEnd.x, yEnd.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = hoveredArrow === 'axis-y' || selectedArrow === 'axis-y' ? "#fbbf24" : "#10b981";
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Z axis (blue)
    const zEnd = project3D(0, 0, axisLength);
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(zEnd.x, zEnd.y);
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Z axis ball
    ctx.beginPath();
    ctx.arc(zEnd.x, zEnd.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = hoveredArrow === 'axis-z' || selectedArrow === 'axis-z' ? "#fbbf24" : "#3b82f6";
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw face arrows
    drawFaceArrows(ctx, project3D);

    // Draw rotation circles
    drawRotationCircles(ctx, project3D);
  };

  const drawFloor = (ctx: CanvasRenderingContext2D, project3D: (x: number, y: number, z: number) => { x: number; y: number; z: number }) => {
    const { floor } = cubeParams;
    const size = 300;
    const gridSpacing = 50;
    
    // Apply azimuth rotation to floor
    const azimuthRad = (floor.azimuth * Math.PI) / 180;
    
    // Draw grid
    ctx.strokeStyle = floor.color + '40';
    ctx.lineWidth = 1;
    
    for (let i = -size; i <= size; i += gridSpacing) {
      // Lines parallel to X axis
      const x1 = i * Math.cos(azimuthRad);
      const z1 = i * Math.sin(azimuthRad);
      const start1 = project3D(x1 - size * Math.sin(azimuthRad), floor.height, z1 + size * Math.cos(azimuthRad));
      const end1 = project3D(x1 + size * Math.sin(azimuthRad), floor.height, z1 - size * Math.cos(azimuthRad));
      
      ctx.beginPath();
      ctx.moveTo(start1.x, start1.y);
      ctx.lineTo(end1.x, end1.y);
      ctx.stroke();
      
      // Lines parallel to Z axis
      const x2 = i * Math.sin(azimuthRad);
      const z2 = -i * Math.cos(azimuthRad);
      const start2 = project3D(x2 - size * Math.cos(azimuthRad), floor.height, z2 - size * Math.sin(azimuthRad));
      const end2 = project3D(x2 + size * Math.cos(azimuthRad), floor.height, z2 + size * Math.sin(azimuthRad));
      
      ctx.beginPath();
      ctx.moveTo(start2.x, start2.y);
      ctx.lineTo(end2.x, end2.y);
      ctx.stroke();
    }
  };

  const drawObjects = (ctx: CanvasRenderingContext2D, project3D: (x: number, y: number, z: number) => { x: number; y: number; z: number }) => {
    cubeParams.objects.forEach(obj => {
      const pos = project3D(obj.position.x, obj.position.y, obj.position.z);
      const isSelected = selectedObject === obj.id;
      
      if (obj.type === 'car') {
        // Draw simple car representation
        const width = 40;
        const height = 20;
        ctx.fillStyle = isSelected ? '#fbbf24' : '#6b7280';
        ctx.fillRect(pos.x - width/2, pos.y - height/2, width, height);
        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(pos.x - width/2, pos.y - height/2, width, height);
        
        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('CAR', pos.x, pos.y + 5);
      } else if (obj.type === 'person') {
        // Draw simple person representation
        const radius = 8;
        ctx.fillStyle = isSelected ? '#fbbf24' : '#3b82f6';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y - 10, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.stroke();
        
        // Body
        ctx.fillRect(pos.x - 5, pos.y, 10, 15);
        
        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('P', pos.x, pos.y + 10);
      }
    });
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

      // Draw larger interactive circle at arrow end for better grab area
      ctx.beginPath();
      ctx.arc(arrow.end.x, arrow.end.y, isSelected ? 12 : (isHovered ? 10 : 8), 0, 2 * Math.PI);
      ctx.fillStyle = isSelected ? '#fbbf24' : (isHovered ? '#ffffff' : brightColor);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  const drawRotationCircles = (ctx: CanvasRenderingContext2D, project3D: (x: number, y: number, z: number) => { x: number; y: number; z: number }) => {
    const circleRadius = 100;
    const segments = 32;
    
    // Draw X-axis rotation circle (YZ plane) - Red
    ctx.strokeStyle = hoveredArrow === 'rotation-x' || selectedArrow === 'rotation-x' ? '#fbbf24' : '#ef444480';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= segments / 2; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const y = circleRadius * Math.cos(angle);
      const z = circleRadius * Math.sin(angle);
      const point = project3D(0, y, z);
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
    
    // Draw sphere on X rotation circle
    const xRotPoint = project3D(0, circleRadius * Math.cos(cubeParams.rotation.x * Math.PI / 180), circleRadius * Math.sin(cubeParams.rotation.x * Math.PI / 180));
    ctx.beginPath();
    ctx.arc(xRotPoint.x, xRotPoint.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = hoveredArrow === 'rotation-x' || selectedArrow === 'rotation-x' ? '#fbbf24' : '#ef4444';
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw Y-axis rotation circle (XZ plane) - Green
    ctx.strokeStyle = hoveredArrow === 'rotation-y' || selectedArrow === 'rotation-y' ? '#fbbf24' : '#10b98180';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= segments / 2; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = circleRadius * Math.cos(angle);
      const z = circleRadius * Math.sin(angle);
      const point = project3D(x, 0, z);
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
    
    // Draw sphere on Y rotation circle
    const yRotPoint = project3D(circleRadius * Math.cos(cubeParams.rotation.y * Math.PI / 180), 0, circleRadius * Math.sin(cubeParams.rotation.y * Math.PI / 180));
    ctx.beginPath();
    ctx.arc(yRotPoint.x, yRotPoint.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = hoveredArrow === 'rotation-y' || selectedArrow === 'rotation-y' ? '#fbbf24' : '#10b981';
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw Z-axis rotation circle (XY plane) - Blue
    ctx.strokeStyle = hoveredArrow === 'rotation-z' || selectedArrow === 'rotation-z' ? '#fbbf24' : '#3b82f680';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= segments / 2; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = circleRadius * Math.cos(angle);
      const y = circleRadius * Math.sin(angle);
      const point = project3D(x, y, 0);
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
    
    // Draw sphere on Z rotation circle
    const zRotPoint = project3D(circleRadius * Math.cos(cubeParams.rotation.z * Math.PI / 180), circleRadius * Math.sin(cubeParams.rotation.z * Math.PI / 180), 0);
    ctx.beginPath();
    ctx.arc(zRotPoint.x, zRotPoint.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = hoveredArrow === 'rotation-z' || selectedArrow === 'rotation-z' ? '#fbbf24' : '#3b82f6';
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();
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
    const arrowLength = 40;
    
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

    // Check arrow endpoints (larger hit area)
    const arrows = [
      { name: 'front', end: project3D(0, 0, faceOffsets.front + arrowLength) },
      { name: 'back', end: project3D(0, 0, faceOffsets.back - arrowLength) },
      { name: 'left', end: project3D(faceOffsets.left - arrowLength, 0, 0) },
      { name: 'right', end: project3D(faceOffsets.right + arrowLength, 0, 0) },
      { name: 'top', end: project3D(0, faceOffsets.top + arrowLength, 0) },
      { name: 'bottom', end: project3D(0, faceOffsets.bottom - arrowLength, 0) },
    ];

    // Check rotation circles
    const circleRadius = 100;
    const rotationSpheres = [
      { name: 'rotation-x', point: project3D(0, circleRadius * Math.cos(cubeParams.rotation.x * Math.PI / 180), circleRadius * Math.sin(cubeParams.rotation.x * Math.PI / 180)) },
      { name: 'rotation-y', point: project3D(circleRadius * Math.cos(cubeParams.rotation.y * Math.PI / 180), 0, circleRadius * Math.sin(cubeParams.rotation.y * Math.PI / 180)) },
      { name: 'rotation-z', point: project3D(circleRadius * Math.cos(cubeParams.rotation.z * Math.PI / 180), circleRadius * Math.sin(cubeParams.rotation.z * Math.PI / 180), 0) },
    ];
    
    for (const sphere of rotationSpheres) {
      const distance = Math.sqrt(
        Math.pow(mousePos.x - sphere.point.x, 2) + Math.pow(mousePos.y - sphere.point.y, 2)
      );
      if (distance <= 20) {
        return sphere.name;
      }
    }

    // Check axis balls (X, Y, Z)
    const axisLength = 60;
    const axisBalls = [
      { name: 'axis-x', end: project3D(axisLength, 0, 0) },
      { name: 'axis-y', end: project3D(0, axisLength, 0) },
      { name: 'axis-z', end: project3D(0, 0, axisLength) },
    ];

    // Check axis balls (higher priority)
    for (const ball of axisBalls) {
      const distance = Math.sqrt(
        Math.pow(mousePos.x - ball.end.x, 2) + Math.pow(mousePos.y - ball.end.y, 2)
      );
      if (distance <= 20) {
        return ball.name;
      }
    }

    // Then check face arrows
    for (const arrow of arrows) {
      const distance = Math.sqrt(
        Math.pow(mousePos.x - arrow.end.x, 2) + Math.pow(mousePos.y - arrow.end.y, 2)
      );
      if (distance <= 20) { // Larger hit area
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
      if (nearestArrow.startsWith('rotation-')) {
        setDragMode('rotation-circle');
      } else {
        setDragMode('arrow');
      }
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
    } else if (dragMode === 'rotation-circle' && selectedArrow !== null) {
      // Handle rotation circle dragging
      setCubeParams(prev => {
        const newRotation = { ...prev.rotation };
        const delta = deltaX * 0.5;
        
        switch (selectedArrow) {
          case 'rotation-x':
            newRotation.x = (prev.rotation.x + delta) % 360;
            break;
          case 'rotation-y':
            newRotation.y = (prev.rotation.y + delta) % 360;
            break;
          case 'rotation-z':
            newRotation.z = (prev.rotation.z + delta) % 360;
            break;
        }
        
        return { ...prev, rotation: newRotation };
      });
    } else if (dragMode === 'arrow' && selectedArrow !== null) {
      // Handle axis ball dragging (move cube in X/Y/Z planes)
      if (selectedArrow.startsWith('axis-')) {
        setCubeParams(prev => {
          const newPosition = { ...prev.position };
          
          switch (selectedArrow) {
            case 'axis-x':
              // X axis: left-right movement
              newPosition.x = prev.position.x + deltaX * 0.8;
              break;
            case 'axis-y':
              // Y axis: up-down movement
              newPosition.y = prev.position.y - deltaY * 0.8;
              break;
            case 'axis-z':
              // Z axis: forward-backward movement (combined XY drag for intuitive control)
              newPosition.z = prev.position.z + (deltaX - deltaY) * 0.4;
              break;
          }
          
          return { ...prev, position: newPosition };
        });
      } else {
        // Adjust individual face based on arrow drag along its axis
        const delta = (deltaX - deltaY) * 0.5;
        
        setCubeParams(prev => {
          const newOffsets = { ...prev.faceOffsets };
          
          // Ctrl modifier: scale entire cube
          if (isCtrlPressed) {
            const scaleFactor = 1 + (delta * 0.01);
            Object.keys(newOffsets).forEach(key => {
              newOffsets[key as keyof typeof newOffsets] = prev.faceOffsets[key as keyof typeof newOffsets] * scaleFactor;
            });
            return { ...prev, faceOffsets: newOffsets };
          }
          
          // Helper to get mirror face name
          const getMirrorFace = (face: string): keyof typeof newOffsets | null => {
            const mirrors: Record<string, keyof typeof newOffsets> = {
              front: 'back', back: 'front',
              left: 'right', right: 'left',
              top: 'bottom', bottom: 'top'
            };
            return mirrors[face] || null;
          };
          
          switch (selectedArrow) {
            case 'front':
              newOffsets.front = Math.max(25, Math.min(200, prev.faceOffsets.front + delta));
              if (isShiftPressed) {
                newOffsets.back = Math.max(-200, Math.min(-25, prev.faceOffsets.back - delta));
              }
              break;
            case 'back':
              newOffsets.back = Math.max(-200, Math.min(-25, prev.faceOffsets.back - delta));
              if (isShiftPressed) {
                newOffsets.front = Math.max(25, Math.min(200, prev.faceOffsets.front + delta));
              }
              break;
            case 'left':
              newOffsets.left = Math.max(-200, Math.min(-25, prev.faceOffsets.left - delta));
              if (isShiftPressed) {
                newOffsets.right = Math.max(25, Math.min(200, prev.faceOffsets.right + delta));
              }
              break;
            case 'right':
              newOffsets.right = Math.max(25, Math.min(200, prev.faceOffsets.right + delta));
              if (isShiftPressed) {
                newOffsets.left = Math.max(-200, Math.min(-25, prev.faceOffsets.left - delta));
              }
              break;
            case 'top':
              newOffsets.top = Math.max(25, Math.min(200, prev.faceOffsets.top - delta));
              if (isShiftPressed) {
                newOffsets.bottom = Math.max(-200, Math.min(-25, prev.faceOffsets.bottom + delta));
              }
              break;
            case 'bottom':
              newOffsets.bottom = Math.max(-200, Math.min(-25, prev.faceOffsets.bottom + delta));
              if (isShiftPressed) {
                newOffsets.top = Math.max(25, Math.min(200, prev.faceOffsets.top - delta));
              }
              break;
          }
          
          return { ...prev, faceOffsets: newOffsets };
        });
      }
    }

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setSelectedArrow(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    // Mouse scroll moves cube toward/away from camera (zoom in/out)
    setCubeParams(prev => ({
      ...prev,
      position: {
        ...prev.position,
        z: prev.position.z - e.deltaY * 0.5
      }
    }));
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default right-click menu
  };

  if (!showCube) return null;

  return (
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
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
    />
  );
};