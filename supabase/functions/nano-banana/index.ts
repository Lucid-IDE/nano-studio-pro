import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const body = await req.json();
    const { 
      mode = 'generate', 
      prompt, 
      baseImage, 
      maskImage,
      sketchAnalysis,
      aspectRatio = '1:1',
      outputCount = 1,
      structuralWeight = 0.7,
      colorWeight = 0.3,
      featherAmount = 0.03,
      generateGoT = false
    } = body;

    console.log(`[Nano Banana] Mode: ${mode}, GoT: ${generateGoT}`);
    
    if (sketchAnalysis) {
      console.log('[Nano Banana] Sketch Analysis:', {
        structuralSegments: sketchAnalysis.structuralMap?.lineGeometry?.length || 0,
        colorRegions: sketchAnalysis.colorMap?.length || 0,
        confidence: sketchAnalysis.structuralMap?.confidenceScore || 0
      });
    }

    // Step 1: Optional GoT (Generation Chain-of-Thought) preview
    if (generateGoT) {
      console.log('[Nano Banana] Generating GoT preview...');
      
      let enhancedPrompt = `Mode: ${mode}\nPrompt: ${prompt}\nAspect Ratio: ${aspectRatio}`;
      
      // Add sketch analysis data if available
      if (sketchAnalysis) {
        const { structuralMap, colorMap } = sketchAnalysis;
        enhancedPrompt += `\n\nSKETCH ANALYSIS DATA:
- Detected ${structuralMap?.lineGeometry?.length || 0} structural line segments (confidence: ${Math.round((structuralMap?.confidenceScore || 0) * 100)}%)
- Identified ${colorMap?.length || 0} distinct color regions for appearance guidance
- Mask feathering: ${(featherAmount * 100).toFixed(1)}%
- Structure preservation weight: ${(structuralWeight * 100).toFixed(0)}%
- Color consistency weight: ${(colorWeight * 100).toFixed(0)}%`;
      }
      
      const gotMessages = [
        {
          role: 'system',
          content: `You are an AI image editing assistant with expertise in multimodal sketch-based editing. 

When analyzing a request, explain:
1. **Spatial Analysis**: What regions are being modified (based on mask/sketch)
2. **Structural Control (OAL)**: How you will preserve or modify geometric structure
3. **Appearance Control (CCL)**: How color and texture will be applied
4. **Blending Strategy**: How edges will be feathered for seamless integration
5. **Consistency Maintenance**: How character/object identity will be preserved

Provide a clear, step-by-step execution plan.`
        },
        {
          role: 'user',
          content: enhancedPrompt
        }
      ];

      const gotResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: gotMessages,
          temperature: 0.7,
          max_tokens: 600
        }),
      });

      if (!gotResponse.ok) {
        const errorText = await gotResponse.text();
        console.error('[Nano Banana] GoT error:', errorText);
        throw new Error(`GoT generation failed: ${errorText}`);
      }

      const gotData = await gotResponse.json();
      const gotPlan = gotData.choices?.[0]?.message?.content || 'Unable to generate plan';
      console.log('[Nano Banana] GoT plan generated successfully');

      // Return GoT plan only (don't generate image yet)
      return new Response(JSON.stringify({ 
        success: true,
        got: gotPlan,
        sketchAnalysis: sketchAnalysis || null,
        mode: 'got-preview'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 2: Build messages for image generation
    const messages: any[] = [];

    // Enhanced system prompt with multimodal control parameters
    let systemPrompt = `You are Nano Banana, an advanced multimodal image generation system with precise structural and appearance control.

Mode: ${mode}
Structural Adherence (OAL): ${structuralWeight * 100}%
Color Fidelity (CCL): ${colorWeight * 100}%`;

    if (mode === 'edit') {
      systemPrompt += `\n
EDITING REQUIREMENTS:
- Respect mask boundaries precisely
- Apply ${(featherAmount * 100).toFixed(1)}% edge feathering for seamless blending
- Prevent cross-attention leakage across mask boundaries
- Maintain character/object consistency across the edit`;
      
      // Add structural control guidance (OAL analog)
      if (structuralWeight > 0.5) {
        systemPrompt += `\n
STRUCTURAL CONTROL (High Priority):
- Strictly preserve geometric boundaries and layout defined by the mask
- Maintain spatial relationships and proportions
- The mask defines the structural "skeleton" that must be respected`;
      }
      
      // Add color control guidance (CCL analog)
      if (colorWeight > 0.3 && sketchAnalysis?.colorMap) {
        const colorRegions = sketchAnalysis.colorMap.map((c: any) => 
          `${c.color} (weight: ${(c.weight * 100).toFixed(0)}%)`
        ).join(', ');
        
        systemPrompt += `\n
COLOR CONSISTENCY CONTROL:
- Apply these colors precisely within their respective regions: ${colorRegions}
- Prevent color leakage across region boundaries
- Match color intensity and saturation from the guidance map`;
      }
    }

    messages.push({
      role: 'system',
      content: systemPrompt
    });

    // Add base image if provided (for editing)
    if (baseImage && mode === 'edit') {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Base image to edit:'
          },
          {
            type: 'image_url',
            image_url: {
              url: baseImage // expects data:image/webp;base64,... or URL
            }
          }
        ]
      });
    }

    // Add mask image if provided (for editing)
    if (maskImage && mode === 'edit') {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Mask overlay with alpha channel (defines edit region and provides structural/color guidance):'
          },
          {
            type: 'image_url',
            image_url: {
              url: maskImage // expects data:image/webp;base64,... (WebP/PNG with alpha)
            }
          }
        ]
      });
    }

    // Add the main prompt with aspect ratio hint for generate mode
    let finalPrompt = prompt;
    if (mode === 'generate' && aspectRatio && aspectRatio !== 'auto') {
      finalPrompt = `${aspectRatio} aspect ratio. ${prompt}`;
    }
    
    messages.push({
      role: 'user',
      content: finalPrompt
    });

    // Step 3: Call Nano Banana model (Gemini 2.5 Flash Image)
    console.log('[Nano Banana] Calling image generation API...');
    const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages,
        modalities: ['image', 'text']
      }),
    });

    if (!imageResponse.ok) {
      if (imageResponse.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please wait a moment and try again.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (imageResponse.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI usage limit reached. Please add credits to your Lovable workspace.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await imageResponse.text();
      console.error('[Nano Banana] Generation error:', imageResponse.status, errorText);
      throw new Error(`Image generation failed: ${errorText}`);
    }

    const imageData = await imageResponse.json();
    console.log('[Nano Banana] Generation successful');

    // Extract generated images
    const images = imageData.choices?.[0]?.message?.images || [];
    const generatedImages = images.map((img: any) => img.image_url?.url || '');
    const explanation = imageData.choices?.[0]?.message?.content || '';

    if (generatedImages.length === 0) {
      throw new Error('No images generated in response');
    }

    return new Response(JSON.stringify({ 
      success: true,
      images: generatedImages,
      explanation,
      mode,
      aspectRatio
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Nano Banana] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
