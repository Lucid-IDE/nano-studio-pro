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
    tilt: number;
    yaw: number;
    scale: number;
    color: string;
  };
  cameraFrustum: {
    enabled: boolean;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    fov: number;
    aspectRatio: number;
    nearPlane: number;
    farPlane: number;
  };
  canvasTo3D: {
    enabled: boolean;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: number;
  };
  models: Array<{
    id: string;
    url: string;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
  }>;
  layers3D: Array<{
    id: string;
    imageUrl: string;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number };
  }>;
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
      tilt: 0,
      yaw: 0,
      scale: 1,
      color: "#94a3b8"
    },
    cameraFrustum: {
      enabled: false,
      position: { x: 0, y: 50, z: 150 },
      rotation: { x: -10, y: 0, z: 0 },
      fov: 60,
      aspectRatio: 16 / 9,
      nearPlane: 10,
      farPlane: 200
    },
    canvasTo3D: {
      enabled: false,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: 1
    },
    models: [],
    layers3D: [],
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
      drawFloorControls(ctx, project3D);
    }

    // Draw camera frustum if enabled
    if (cubeParams.cameraFrustum.enabled) {
      drawCameraFrustum(ctx, project3D);
    }

    // Draw canvas as 3D plane if enabled
    if (cubeParams.canvasTo3D.enabled) {
      drawCanvasPlane(ctx, project3D);
    }

    // Draw 3D layers
    draw3DLayers(ctx, project3D);

    // Draw 3D models
    draw3DModels(ctx, project3D);

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
    if (!floor) return;
    
    const size = 300 * (floor.scale || 1);
    const gridSpacing = 50 * (floor.scale || 1);
    
    // Apply azimuth, tilt, and yaw rotations
    const azimuthRad = ((floor.azimuth || 0) * Math.PI) / 180;
    const tiltRad = ((floor.tilt || 0) * Math.PI) / 180;
    const yawRad = ((floor.yaw || 0) * Math.PI) / 180;
    
    // Draw grid
    ctx.strokeStyle = floor.color + '40';
    ctx.lineWidth = 1;
    
    for (let i = -size; i <= size; i += gridSpacing) {
      // Apply rotation transformations
      for (let j = -size; j <= size; j += gridSpacing) {
        const x1 = i * Math.cos(azimuthRad) - j * Math.sin(azimuthRad);
        const z1 = i * Math.sin(azimuthRad) + j * Math.cos(azimuthRad);
        const y1 = floor.height + (z1 * Math.sin(tiltRad)) + (x1 * Math.sin(yawRad));
        
        if (j === -size) {
          const x2 = i * Math.cos(azimuthRad) - (j + gridSpacing) * Math.sin(azimuthRad);
          const z2 = i * Math.sin(azimuthRad) + (j + gridSpacing) * Math.cos(azimuthRad);
          const y2 = floor.height + (z2 * Math.sin(tiltRad)) + (x2 * Math.sin(yawRad));
          
          const start = project3D(x1, y1, z1);
          const end = project3D(x2, y2, z2);
          
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
        }
      }
    }
  };

  const drawFloorControls = (ctx: CanvasRenderingContext2D, project3D: (x: number, y: number, z: number) => { x: number; y: number; z: number }) => {
    const { floor } = cubeParams;
    if (!floor) return;
    
    // Floor center position
    const centerPos = project3D(0, floor.height, 0);
    
    // Height control (up/down arrow at center)
    const heightArrow = project3D(0, floor.height - 40, 0);
    ctx.beginPath();
    ctx.moveTo(centerPos.x, centerPos.y);
    ctx.lineTo(heightArrow.x, heightArrow.y);
    ctx.strokeStyle = hoveredArrow === 'floor-height' || selectedArrow === 'floor-height' ? '#fbbf24' : '#94a3b8';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(heightArrow.x, heightArrow.y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = hoveredArrow === 'floor-height' || selectedArrow === 'floor-height' ? '#fbbf24' : '#94a3b8';
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Rotation control (azimuth)
    const rotArrow = project3D(40, floor.height, 0);
    ctx.beginPath();
    ctx.arc(rotArrow.x, rotArrow.y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = hoveredArrow === 'floor-rotation' || selectedArrow === 'floor-rotation' ? '#fbbf24' : '#10b981';
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Tilt control
    const tiltArrow = project3D(0, floor.height, 40);
    ctx.beginPath();
    ctx.arc(tiltArrow.x, tiltArrow.y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = hoveredArrow === 'floor-tilt' || selectedArrow === 'floor-tilt' ? '#fbbf24' : '#3b82f6';
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Yaw control
    const yawArrow = project3D(-40, floor.height, 0);
    ctx.beginPath();
    ctx.arc(yawArrow.x, yawArrow.y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = hoveredArrow === 'floor-yaw' || selectedArrow === 'floor-yaw' ? '#fbbf24' : '#f59e0b';
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Scale control
    const scaleArrow = project3D(0, floor.height, -40);
    ctx.beginPath();
    ctx.arc(scaleArrow.x, scaleArrow.y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = hoveredArrow === 'floor-scale' || selectedArrow === 'floor-scale' ? '#fbbf24' : '#8b5cf6';
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawCameraFrustum = (ctx: CanvasRenderingContext2D, project3D: (x: number, y: number, z: number) => { x: number; y: number; z: number }) => {
    const { cameraFrustum } = cubeParams;
    if (!cameraFrustum || !cameraFrustum.enabled) return;
    
    // Calculate frustum corners
    const halfHeightNear = cameraFrustum.nearPlane * Math.tan((cameraFrustum.fov * Math.PI) / 360);
    const halfWidthNear = halfHeightNear * cameraFrustum.aspectRatio;
    const halfHeightFar = cameraFrustum.farPlane * Math.tan((cameraFrustum.fov * Math.PI) / 360);
    const halfWidthFar = halfHeightFar * cameraFrustum.aspectRatio;
    
    const { position: camPos, rotation: camRot } = cameraFrustum;
    
    // Near plane corners
    const nearCorners = [
      project3D(camPos.x - halfWidthNear, camPos.y + halfHeightNear, camPos.z + cameraFrustum.nearPlane),
      project3D(camPos.x + halfWidthNear, camPos.y + halfHeightNear, camPos.z + cameraFrustum.nearPlane),
      project3D(camPos.x + halfWidthNear, camPos.y - halfHeightNear, camPos.z + cameraFrustum.nearPlane),
      project3D(camPos.x - halfWidthNear, camPos.y - halfHeightNear, camPos.z + cameraFrustum.nearPlane),
    ];
    
    // Far plane corners
    const farCorners = [
      project3D(camPos.x - halfWidthFar, camPos.y + halfHeightFar, camPos.z + cameraFrustum.farPlane),
      project3D(camPos.x + halfWidthFar, camPos.y + halfHeightFar, camPos.z + cameraFrustum.farPlane),
      project3D(camPos.x + halfWidthFar, camPos.y - halfHeightFar, camPos.z + cameraFrustum.farPlane),
      project3D(camPos.x - halfWidthFar, camPos.y - halfHeightFar, camPos.z + cameraFrustum.farPlane),
    ];
    
    // Draw frustum
    ctx.strokeStyle = '#fbbf2480';
    ctx.lineWidth = 2;
    
    // Near plane
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      if (i === 0) ctx.moveTo(nearCorners[i].x, nearCorners[i].y);
      else ctx.lineTo(nearCorners[i].x, nearCorners[i].y);
    }
    ctx.closePath();
    ctx.stroke();
    
    // Far plane
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      if (i === 0) ctx.moveTo(farCorners[i].x, farCorners[i].y);
      else ctx.lineTo(farCorners[i].x, farCorners[i].y);
    }
    ctx.closePath();
    ctx.stroke();
    
    // Connecting lines
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(nearCorners[i].x, nearCorners[i].y);
      ctx.lineTo(farCorners[i].x, farCorners[i].y);
      ctx.stroke();
    }
    
    // Camera position indicator
    const camPosProj = project3D(camPos.x, camPos.y, camPos.z);
    ctx.beginPath();
    ctx.arc(camPosProj.x, camPosProj.y, 12, 0, 2 * Math.PI);
    ctx.fillStyle = hoveredArrow === 'camera-frustum' || selectedArrow === 'camera-frustum' ? '#fbbf24' : '#fbbf24';
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawCanvasPlane = (ctx: CanvasRenderingContext2D, project3D: (x: number, y: number, z: number) => { x: number; y: number; z: number }) => {
    const { canvasTo3D } = cubeParams;
    if (!canvasTo3D || !canvasTo3D.enabled) return;
    
    const width = 200 * canvasTo3D.scale;
    const height = 150 * canvasTo3D.scale;
    
    const corners = [
      project3D(canvasTo3D.position.x - width/2, canvasTo3D.position.y + height/2, canvasTo3D.position.z),
      project3D(canvasTo3D.position.x + width/2, canvasTo3D.position.y + height/2, canvasTo3D.position.z),
      project3D(canvasTo3D.position.x + width/2, canvasTo3D.position.y - height/2, canvasTo3D.position.z),
      project3D(canvasTo3D.position.x - width/2, canvasTo3D.position.y - height/2, canvasTo3D.position.z),
    ];
    
    // Draw canvas plane
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#60a5fa20';
    
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      if (i === 0) ctx.moveTo(corners[i].x, corners[i].y);
      else ctx.lineTo(corners[i].x, corners[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw control node
    const centerProj = project3D(canvasTo3D.position.x, canvasTo3D.position.y, canvasTo3D.position.z);
    ctx.beginPath();
    ctx.arc(centerProj.x, centerProj.y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = hoveredArrow === 'canvas-3d' || selectedArrow === 'canvas-3d' ? '#fbbf24' : '#60a5fa';
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const draw3DLayers = (ctx: CanvasRenderingContext2D, project3D: (x: number, y: number, z: number) => { x: number; y: number; z: number }) => {
    if (!cubeParams.layers3D) return;
    cubeParams.layers3D.forEach((layer, index) => {
      if (!layer.imageUrl) return;
      
      const width = 100 * layer.scale.x;
      const height = 100 * layer.scale.y;
      
      const corners = [
        project3D(layer.position.x - width/2, layer.position.y + height/2, layer.position.z),
        project3D(layer.position.x + width/2, layer.position.y + height/2, layer.position.z),
        project3D(layer.position.x + width/2, layer.position.y - height/2, layer.position.z),
        project3D(layer.position.x - width/2, layer.position.y - height/2, layer.position.z),
      ];
      
      const isSelected = selectedObject === `layer-${layer.id}`;
      
      // Create a temporary image element for this layer if it has an imageUrl
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.save();
        
        // Define the quad path
        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        ctx.lineTo(corners[1].x, corners[1].y);
        ctx.lineTo(corners[2].x, corners[2].y);
        ctx.lineTo(corners[3].x, corners[3].y);
        ctx.closePath();
        ctx.clip();
        
        // Calculate perspective transform approximation
        // For simplicity, we'll use a basic approach - draw centered
        const centerProj = project3D(layer.position.x, layer.position.y, layer.position.z);
        const imgWidth = width * 2;
        const imgHeight = height * 2;
        
        try {
          ctx.drawImage(
            img,
            centerProj.x - imgWidth/2,
            centerProj.y - imgHeight/2,
            imgWidth,
            imgHeight
          );
        } catch (e) {
          console.error('Failed to draw 3D layer image:', e);
        }
        
        ctx.restore();
        
        // Draw border
        ctx.strokeStyle = isSelected ? '#fbbf24' : '#8b5cf6';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        ctx.lineTo(corners[1].x, corners[1].y);
        ctx.lineTo(corners[2].x, corners[2].y);
        ctx.lineTo(corners[3].x, corners[3].y);
        ctx.closePath();
        ctx.stroke();
        
        // Draw layer label
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(`Layer ${index + 1}`, centerProj.x, centerProj.y - imgHeight/2 - 10);
        ctx.fillText(`Layer ${index + 1}`, centerProj.x, centerProj.y - imgHeight/2 - 10);
      };
      img.src = layer.imageUrl;
    });
  };

  const draw3DModels = (ctx: CanvasRenderingContext2D, project3D: (x: number, y: number, z: number) => { x: number; y: number; z: number }) => {
    if (!cubeParams.models) return;
    cubeParams.models.forEach((model) => {
      const size = 40;
      
      const corners = [
        project3D(model.position.x - size/2, model.position.y + size/2, model.position.z - size/2),
        project3D(model.position.x + size/2, model.position.y + size/2, model.position.z - size/2),
        project3D(model.position.x + size/2, model.position.y - size/2, model.position.z - size/2),
        project3D(model.position.x - size/2, model.position.y - size/2, model.position.z - size/2),
        project3D(model.position.x - size/2, model.position.y + size/2, model.position.z + size/2),
        project3D(model.position.x + size/2, model.position.y + size/2, model.position.z + size/2),
        project3D(model.position.x + size/2, model.position.y - size/2, model.position.z + size/2),
        project3D(model.position.x - size/2, model.position.y - size/2, model.position.z + size/2),
      ];
      
      const isSelected = selectedObject === `model-${model.id}`;
      
      ctx.strokeStyle = isSelected ? '#fbbf24' : '#10b981';
      ctx.lineWidth = isSelected ? 3 : 2;
      
      // Draw cube wireframe
      const faces = [
        [0, 1, 2, 3], [4, 5, 6, 7], // front, back
        [0, 1, 5, 4], [2, 3, 7, 6], // top, bottom
        [0, 3, 7, 4], [1, 2, 6, 5]  // left, right
      ];
      
      faces.forEach(face => {
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const corner = corners[face[i]];
          if (i === 0) ctx.moveTo(corner.x, corner.y);
          else ctx.lineTo(corner.x, corner.y);
        }
        ctx.closePath();
        ctx.stroke();
      });
      
      // Draw model label
      const centerProj = project3D(model.position.x, model.position.y, model.position.z);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GLB', centerProj.x, centerProj.y);
    });
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

    // Check floor controls
    if (cubeParams.floor) {
      const floorControls = [
        { name: 'floor-height', point: project3D(0, cubeParams.floor.height - 40, 0) },
        { name: 'floor-rotation', point: project3D(40, cubeParams.floor.height, 0) },
        { name: 'floor-tilt', point: project3D(0, cubeParams.floor.height, 40) },
        { name: 'floor-yaw', point: project3D(-40, cubeParams.floor.height, 0) },
        { name: 'floor-scale', point: project3D(0, cubeParams.floor.height, -40) },
      ];
      
      for (const control of floorControls) {
        const distance = Math.sqrt(
          Math.pow(mousePos.x - control.point.x, 2) + Math.pow(mousePos.y - control.point.y, 2)
        );
        if (distance <= 20) {
          return control.name;
        }
      }
    }
    
    // Check camera frustum
    if (cubeParams.cameraFrustum?.enabled) {
      const camPosProj = project3D(cubeParams.cameraFrustum.position.x, cubeParams.cameraFrustum.position.y, cubeParams.cameraFrustum.position.z);
      const distance = Math.sqrt(
        Math.pow(mousePos.x - camPosProj.x, 2) + Math.pow(mousePos.y - camPosProj.y, 2)
      );
      if (distance <= 20) {
        return 'camera-frustum';
      }
    }
    
    // Check canvas-3D
    if (cubeParams.canvasTo3D?.enabled) {
      const centerProj = project3D(cubeParams.canvasTo3D.position.x, cubeParams.canvasTo3D.position.y, cubeParams.canvasTo3D.position.z);
      const distance = Math.sqrt(
        Math.pow(mousePos.x - centerProj.x, 2) + Math.pow(mousePos.y - centerProj.y, 2)
      );
      if (distance <= 20) {
        return 'canvas-3d';
      }
    }

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
      setCubeParams(prev => {
        if (!prev?.position) return prev;
        return {
          ...prev,
          rotation: {
            ...prev.rotation,
            y: prev.rotation.y + deltaX * 0.5,
            x: prev.rotation.x - deltaY * 0.5,
          }
        };
      });
    } else if (dragMode === 'position') {
      setCubeParams(prev => {
        if (!prev?.position) return prev;
        return {
          ...prev,
          position: {
            ...prev.position,
            x: prev.position.x + deltaX * 0.5,
            y: prev.position.y - deltaY * 0.5,
          }
        };
      });
    } else if (dragMode === 'rotation-circle' && selectedArrow !== null) {
      // Handle rotation circle dragging
      setCubeParams(prev => {
        if (!prev?.position) return prev;
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
          if (!prev?.position) return prev;
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
      } else if (selectedArrow?.startsWith('floor-') && cubeParams.floor) {
        // Handle floor controls
        setCubeParams(prev => {
          if (!prev?.position || !prev.floor) return prev;
          const newFloor = { ...prev.floor };
          
          switch (selectedArrow) {
            case 'floor-height':
              newFloor.height = prev.floor.height - deltaY * 0.8;
              break;
            case 'floor-rotation':
              newFloor.azimuth = ((prev.floor.azimuth || 0) + deltaX * 0.5) % 360;
              break;
            case 'floor-tilt':
              newFloor.tilt = Math.max(-45, Math.min(45, (prev.floor.tilt || 0) + deltaY * 0.3));
              break;
            case 'floor-yaw':
              newFloor.yaw = Math.max(-45, Math.min(45, (prev.floor.yaw || 0) + deltaX * 0.3));
              break;
            case 'floor-scale':
              newFloor.scale = Math.max(0.5, Math.min(2, (prev.floor.scale || 1) + deltaY * -0.01));
              break;
          }
          
          return { ...prev, floor: newFloor };
        });
      } else if (selectedArrow === 'camera-frustum' && cubeParams.cameraFrustum) {
        // Handle camera frustum movement
        setCubeParams(prev => {
          if (!prev?.position || !prev.cameraFrustum) return prev;
          const newFrustum = { ...prev.cameraFrustum };
          newFrustum.position = {
            x: prev.cameraFrustum.position.x + deltaX * 0.5,
            y: prev.cameraFrustum.position.y - deltaY * 0.5,
            z: prev.cameraFrustum.position.z
          };
          return { ...prev, cameraFrustum: newFrustum };
        });
      } else if (selectedArrow === 'canvas-3d' && cubeParams.canvasTo3D) {
        // Handle canvas-3D plane movement
        setCubeParams(prev => {
          if (!prev?.position || !prev.canvasTo3D) return prev;
          const newCanvasTo3D = { ...prev.canvasTo3D };
          newCanvasTo3D.position = {
            x: prev.canvasTo3D.position.x + deltaX * 0.5,
            y: prev.canvasTo3D.position.y - deltaY * 0.5,
            z: prev.canvasTo3D.position.z
          };
          return { ...prev, canvasTo3D: newCanvasTo3D };
        });
      } else {
        // Adjust individual face - FIXED DIRECTIONS
        setCubeParams(prev => {
          if (!prev?.position) return prev;
          const newOffsets = { ...prev.faceOffsets };
          
          // Ctrl modifier: scale entire cube
          if (isCtrlPressed) {
            const scaleDelta = (deltaX - deltaY) * 0.01;
            const scaleFactor = 1 + scaleDelta;
            Object.keys(newOffsets).forEach(key => {
              newOffsets[key as keyof typeof newOffsets] = prev.faceOffsets[key as keyof typeof newOffsets] * scaleFactor;
            });
            return { ...prev, faceOffsets: newOffsets };
          }
          
          switch (selectedArrow) {
            case 'front':
              // Front face: drag right = move forward (positive Z), drag down = move forward
              newOffsets.front = Math.max(25, Math.min(200, prev.faceOffsets.front + deltaX * 0.5 + deltaY * 0.5));
              if (isShiftPressed) {
                newOffsets.back = Math.max(-200, Math.min(-25, prev.faceOffsets.back - deltaX * 0.5 - deltaY * 0.5));
              }
              break;
            case 'back':
              // Back face: drag left = move backward (more negative Z)
              newOffsets.back = Math.max(-200, Math.min(-25, prev.faceOffsets.back - deltaX * 0.5 - deltaY * 0.5));
              if (isShiftPressed) {
                newOffsets.front = Math.max(25, Math.min(200, prev.faceOffsets.front + deltaX * 0.5 + deltaY * 0.5));
              }
              break;
            case 'left':
              // Left face: drag left = move left (more negative X)
              newOffsets.left = Math.max(-200, Math.min(-25, prev.faceOffsets.left - deltaX * 0.5 - deltaY * 0.5));
              if (isShiftPressed) {
                newOffsets.right = Math.max(25, Math.min(200, prev.faceOffsets.right + deltaX * 0.5 + deltaY * 0.5));
              }
              break;
            case 'right':
              // Right face: drag right = move right (positive X)
              newOffsets.right = Math.max(25, Math.min(200, prev.faceOffsets.right + deltaX * 0.5 + deltaY * 0.5));
              if (isShiftPressed) {
                newOffsets.left = Math.max(-200, Math.min(-25, prev.faceOffsets.left - deltaX * 0.5 - deltaY * 0.5));
              }
              break;
            case 'top':
              // Top face: drag up = move up (positive Y), drag right = move up
              newOffsets.top = Math.max(25, Math.min(200, prev.faceOffsets.top - deltaY * 0.5 + deltaX * 0.5));
              if (isShiftPressed) {
                newOffsets.bottom = Math.max(-200, Math.min(-25, prev.faceOffsets.bottom + deltaY * 0.5 - deltaX * 0.5));
              }
              break;
            case 'bottom':
              // Bottom face: drag down = move down (more negative Y)
              newOffsets.bottom = Math.max(-200, Math.min(-25, prev.faceOffsets.bottom + deltaY * 0.5 - deltaX * 0.5));
              if (isShiftPressed) {
                newOffsets.top = Math.max(25, Math.min(200, prev.faceOffsets.top - deltaY * 0.5 + deltaX * 0.5));
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
    setCubeParams(prev => {
      if (!prev?.position) return prev;
      return {
        ...prev,
        position: {
          ...prev.position,
          z: prev.position.z - e.deltaY * 0.5
        }
      };
    });
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
      style={{ background: 'transparent' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
    />
  );
};