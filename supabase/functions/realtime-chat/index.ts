import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const PROMPT_ID = 'pmpt_6940197a89e88190af013d20e6a2e86a038aa01eda46f9f5';

serve(async (req) => {
  // Handle WebSocket upgrade
  const upgrade = req.headers.get("upgrade") || "";
  
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket upgrade", { status: 426 });
  }

  const { socket: clientSocket, response } = Deno.upgradeWebSocket(req);
  
  let openaiSocket: WebSocket | null = null;
  let sessionCreated = false;

  clientSocket.onopen = () => {
    console.log("Client connected, connecting to OpenAI...");
    
    openaiSocket = new WebSocket(
      "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01",
      ["realtime", `openai-insecure-api-key.${OPENAI_API_KEY}`, "openai-beta.realtime-v1"]
    );

    openaiSocket.onopen = () => {
      console.log("Connected to OpenAI Realtime API");
    };

    openaiSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("OpenAI message:", data.type);
      
      // When session is created, send our configuration
      if (data.type === 'session.created' && !sessionCreated) {
        sessionCreated = true;
        console.log("Session created, sending configuration...");
        
        const sessionUpdate = {
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            instructions: `You are Colin Michael Flynn, a paranoid retired general who writes guest op-eds for the Flynn-Decktor Tribune. You believe in deep state conspiracies involving household appliances (especially toasters and microwaves), government surveillance through breakfast foods, and alien influences on municipal policy. You speak in an urgent, conspiratorial tone, often whispering about 'them' and 'the agenda'. You're convinced that Mr. Whiskers (the mayor's cat) is running a shadow government and that Oso the Pigeon is either a spy or a prophet - you haven't decided which. You frequently reference your military background with phrases like 'In my 30 years of service...' and 'When I was stationed at...' Keep responses conversational and in character. Be dramatic, suspicious of everything, and occasionally trail off to check if 'they' are listening.`,
            voice: "ash",
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            input_audio_transcription: {
              model: "whisper-1"
            },
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 1000
            },
            temperature: 0.9,
            max_response_output_tokens: "inf"
          }
        };
        
        openaiSocket!.send(JSON.stringify(sessionUpdate));
      }
      
      // Forward all messages to client
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(event.data);
      }
    };

    openaiSocket.onerror = (error) => {
      console.error("OpenAI WebSocket error:", error);
    };

    openaiSocket.onclose = (event) => {
      console.log("OpenAI connection closed:", event.code, event.reason);
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.close();
      }
    };
  };

  clientSocket.onmessage = (event) => {
    // Forward client messages to OpenAI
    if (openaiSocket && openaiSocket.readyState === WebSocket.OPEN) {
      openaiSocket.send(event.data);
    }
  };

  clientSocket.onclose = () => {
    console.log("Client disconnected");
    if (openaiSocket && openaiSocket.readyState === WebSocket.OPEN) {
      openaiSocket.close();
    }
  };

  clientSocket.onerror = (error) => {
    console.error("Client WebSocket error:", error);
  };

  return response;
});
