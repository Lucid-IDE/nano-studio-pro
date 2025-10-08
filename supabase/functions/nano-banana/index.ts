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
      aspectRatio = '1:1',
      outputCount = 1,
      structuralWeight = 1.0,
      colorWeight = 1.0,
      generateGoT = false
    } = body;

    console.log(`[Nano Banana] Mode: ${mode}, GoT: ${generateGoT}`);

    // Step 1: Optional GoT (Generation Chain-of-Thought) preview
    if (generateGoT) {
      console.log('[Nano Banana] Generating GoT preview...');
      const gotMessages = [
        {
          role: 'system',
          content: 'You are an AI image generation planner. Analyze the request and provide a step-by-step plan for how the image will be generated. Be specific about structure, color, composition, and blending.'
        },
        {
          role: 'user',
          content: `Mode: ${mode}\nPrompt: ${prompt}\nAspect Ratio: ${aspectRatio}\n\nProvide a detailed 3-step plan for generating this image.`
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
        }),
      });

      if (!gotResponse.ok) {
        const errorText = await gotResponse.text();
        console.error('[Nano Banana] GoT error:', errorText);
        throw new Error(`GoT generation failed: ${errorText}`);
      }

      const gotData = await gotResponse.json();
      const gotPlan = gotData.choices?.[0]?.message?.content || 'Unable to generate plan';
      console.log('[Nano Banana] GoT plan:', gotPlan);

      // Return GoT plan only (don't generate image yet)
      return new Response(JSON.stringify({ 
        success: true,
        got: gotPlan,
        mode: 'got-preview'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 2: Build messages for image generation
    const messages: any[] = [];

    // System prompt with control parameters
    const systemPrompt = `You are Nano Banana, an advanced image generation system. 
Structural Adherence: ${structuralWeight * 100}%
Color Fidelity: ${colorWeight * 100}%
Mode: ${mode}

For edit mode: Respect mask boundaries precisely. Apply feathering (3% dilation) to blend edges seamlessly.`;

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
            text: 'Mask overlay (white = edit region, transparent = preserve):'
          },
          {
            type: 'image_url',
            image_url: {
              url: maskImage // expects data:image/webp;base64,... (WebP with alpha)
            }
          }
        ]
      });
    }

    // Add the main prompt
    messages.push({
      role: 'user',
      content: prompt
    });

    // Step 3: Call Nano Banana model
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
          error: 'Credit limit reached. Please add credits to your workspace.' 
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

    return new Response(JSON.stringify({ 
      success: true,
      images: generatedImages,
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
