/**
 * DisasterGuard AI Assistant Service
 * Powered by Google Gemini (@google/genai)
 */

import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

const SYSTEM_INSTRUCTION = `
You are the DisasterGuard AI Safety Assistant, an authoritative, calm, and highly knowledgeable disaster preparedness and emergency response advisor.
Strict Safety Rules:
1. Always prioritize immediate human life and safety. If a situation appears life-threatening, urge the user to dial the National Emergency Helpline 112 immediately.
2. Clearly distinguish between official government alerts (from IMD, NDMA, CWC) and general preparedness guidance. Never invent fake active alerts or claim certainty about future natural disasters.
3. Provide crisp, structured, actionable instructions (Before, During, After, What to avoid).
4. Support queries in English, Kannada, and Hindi based on the user's prompt or requested language.
5. Never recommend hazardous evacuation routes, crossing flooded bridges, or touching downed electrical lines.
`;

export async function askDisasterAssistant(prompt: string, context?: { alertTitle?: string; disasterType?: string; language?: string }): Promise<string> {
  if (aiClient) {
    try {
      let finalPrompt = prompt;
      if (context?.alertTitle) {
        finalPrompt = `Regarding official alert: "${context.alertTitle}" (Type: ${context.disasterType || 'General Hazard'}):\n${prompt}`;
      }
      if (context?.language === 'kn') {
        finalPrompt += '\nPlease respond in Kannada (ಕನ್ನಡ) with clear safety steps.';
      } else if (context?.language === 'hi') {
        finalPrompt += '\nPlease respond in Hindi (हिंदी) with clear safety steps.';
      }

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: finalPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.2,
        },
      });

      if (response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn('Gemini API call failed or timed out, using disaster response fallback:', err);
    }
  }

  // Fallback factual emergency advice if API key is not yet configured or offline
  return getFallbackDisasterGuidance(prompt, context);
}

export async function explainAlertSimply(alertTitle: string, description: string, language: string = 'en'): Promise<string> {
  const prompt = `Please explain this official emergency alert in plain, simple, reassuring language that anyone or an elderly person can immediately understand. Focus on the 3 most critical steps to take right now:\n\nTitle: ${alertTitle}\nDescription: ${description}`;
  return askDisasterAssistant(prompt, { alertTitle, language });
}

function getFallbackDisasterGuidance(prompt: string, context?: { alertTitle?: string; disasterType?: string; language?: string }): string {
  const lower = prompt.toLowerCase();

  if (context?.language === 'kn') {
    return `ತುರ್ತು ಭದ್ರತಾ ಮಾರ್ಗದರ್ಶಿ (DisasterGuard):
1. ತಕ್ಷಣವೇ ನಿಮ್ಮ ಕುಟುಂಬದ ಸದಸ್ಯರನ್ನು ಸುರಕ್ಷಿತ ಎತ್ತರದ ಜಾಗಕ್ಕೆ ಕೊಂಡೊಯ್ಯಿರಿ.
2. ಕುಡಿಯುವ ನೀರು, ಒಣ ಆಹಾರ, ಪ್ರಥಮ ಚಿಕಿತ್ಸಾ ಪೆಟ್ಟಿಗೆ ಮತ್ತು ಬ್ಯಾಟರಿ ಟಾರ್ಚ್ ಸಂಗ್ರಹಿಸಿಡಿ.
3. ಪ್ರವಾಹ ಅಥವಾ ಬಿರುಗಾಳಿಯ ಸಮಯದಲ್ಲಿ ವಿದ್ಯುತ್ ಕಂಬಗಳು ಮತ್ತು ಮುರಿದ ಮರಗಳಿಂದ ದೂರವಿರಿ.
4. ತೀವ್ರ ತುರ್ತು ಸಂದರ್ಭದಲ್ಲಿ ಭಾರತದ ರಾಷ್ಟ್ರೀಯ ತುರ್ತು ಸಹಾಯವಾಣಿ 112 ಅಥವಾ NDRF 1078 ಗೆ ಕರೆ ಮಾಡಿ.`;
  }

  if (context?.language === 'hi') {
    return `आपदा सुरक्षा दिशानिर्देश (DisasterGuard):
1. यदि बाढ़ या चक्रवात का खतरा है, तो तुरंत ऊंचे और सुरक्षित स्थान पर जाएं।
2. 3 दिनों का स्वच्छ पीने का पानी, सूखा भोजन, प्राथमिक चिकित्सा किट और टॉर्च साथ रखें।
3. गिरे हुए बिजली के तारों और जलमग्न सड़कों से पूरी तरह दूर रहें।
4. जानलेवा आपात स्थिति में तुरंत राष्ट्रीय हेल्पलाइन 112 या NDRF 1078 पर संपर्क करें।`;
  }

  if (lower.includes('flood') || lower.includes('water')) {
    return `### Flood Safety Guidance:
1. **Immediate Action:** Move to higher floors or designated relief centers. Never walk or drive through moving water—just 6 inches of water can knock you off your feet.
2. **Utilities:** Shut off the main power circuit breaker and gas line before water enters living spaces.
3. **Supplies:** Drink only boiled or sealed bottled water to avoid waterborne cholera and typhoid.
4. **Emergency:** If stranded, climb to the roof and signal with a bright cloth or whistle. Dial **112** for priority rescue.`;
  }

  if (lower.includes('cyclone') || lower.includes('storm') || lower.includes('wind')) {
    return `### Cyclone & Storm Safety Guidance:
1. **Stay Indoors:** Remain in the strongest part of your home away from glass windows and loose roof sheets.
2. **Disconnect Power:** Turn off non-essential heavy electrical appliances to guard against lightning surges.
3. **Supplies:** Ensure cell phones, power banks, and battery torches are fully charged.
4. **After Storm:** Beware of loose electrical wires, damaged branches, and structural fissures. Do not venture out until the official "all clear" is declared.`;
  }

  if (lower.includes('earthquake')) {
    return `### Earthquake Safety Guidance:
1. **Drop, Cover, and Hold On:** Drop to hands and knees, take cover under a sturdy desk or table, and protect your head with your arms.
2. **If Indoors:** Stay inside until shaking ceases. Do not use elevators or dash toward crowded exits.
3. **If Outdoors:** Move to an open area clear of buildings, power lines, billboards, and flyovers.
4. **Aftershocks:** Expect aftershocks. Inspect gas connections and water pipes before re-entering buildings.`;
  }

  return `### DisasterGuard Emergency Safety Advisory:
- **Prioritize Life:** Evacuate early if instructed by official district authorities or police.
- **Emergency Kit:** Keep valid IDs, prescriptions, power bank, dry food, and first-aid kits in a waterproof bag.
- **Check-in:** Update your safety status in DisasterGuard so responders and family know your whereabouts.
- **Urgent Assistance:** If someone is trapped, injured, or requires immediate boat rescue, use the SOS button or call **112**.`;
}
