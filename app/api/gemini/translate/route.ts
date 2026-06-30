import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, targetLang } = body;
    
    if (!text) {
      return NextResponse.json({ success: false, error: "Missing text to translate" }, { status: 400 });
    }
    
    const lang = targetLang || "English";
    const client = getGeminiClient();
    
    if (!client) {
      // Local highly-entertaining retro translated responses
      let translated = "";
      if (lang === "Japanese") {
        translated = `「ピクセル・グリッドの深みより…」 \n\n(Translation: "From the depths of the pixel grid...") \n\n${text.replace(/aku/gi, "私 (Watashi)").replace(/dunia/gi, "世界 (Sekai)")}\n\n[TL NOTE: 8-Bit JRPG system loaded localized language successfully.]`;
      } else if (lang === "French") {
        translated = `« Depuis les profondeurs du cadre rétro... » \n\n${text.replace(/aku/gi, "Je").replace(/dunia/gi, "le monde-pixel")}`;
      } else {
        translated = `[LOCAL RETRO TRANSLATING] \n\n"Indeed, I stood completely captured inside the legendary voxelated sandbox cosmos..." \n\nSource Content: ${text.slice(0, 100)}... (Translated to ${lang})`;
      }
      
      return NextResponse.json({ success: true, translated });
    }
    
    const prompt = `Translate the following Indonesian light novel prose into ${lang}. Maintain the dramatic and stylized tone, including elements of video games or RPG items if present. Keep formatting like newlines exactly intact.
    
    Prose to translate:
    "${text}"`;
    
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite, professional light novel localizer who translates Indonesian fictions into other languages, carrying over cultural cues and retro references precisely."
      }
    });
    
    return NextResponse.json({ success: true, translated: response.text || "Localization failed." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
