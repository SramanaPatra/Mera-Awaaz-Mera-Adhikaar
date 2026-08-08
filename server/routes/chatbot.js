import express from 'express';
import { dbState } from '../db.js';
import { findMatchingSchemes } from '../services/matchingEngine.js';

const router = express.Router();

function detectLocale(text, requestedLocale) {
  if (requestedLocale && requestedLocale !== 'AUTO') {
    const map = {
      'en-IN': { name: 'English', code: 'en-IN' },
      'bn-IN': { name: 'Bengali', code: 'bn-IN' },
      'hi-IN': { name: 'Hindi', code: 'hi-IN' },
      'ta-IN': { name: 'Tamil', code: 'ta-IN' },
      'te-IN': { name: 'Telugu', code: 'te-IN' },
      'mr-IN': { name: 'Marathi', code: 'mr-IN' }
    };
    return map[requestedLocale] || { name: 'English', code: 'en-IN' };
  }

  if (/[\u0980-\u09FF]/.test(text)) return { name: 'Bengali', code: 'bn-IN' };
  if (/[\u0B80-\u0BFF]/.test(text)) return { name: 'Tamil', code: 'ta-IN' };
  if (/[\u0C00-\u0C7F]/.test(text)) return { name: 'Telugu', code: 'te-IN' };

  if (/[\u0900-\u097F]/.test(text)) {
    if (/(आहे|नाही|शेतकरी|योजना|रुपये)/.test(text)) {
      return { name: 'Marathi', code: 'mr-IN' };
    }
    return { name: 'Hindi', code: 'hi-IN' };
  }

  const lower = text.toLowerCase();
  if (lower.includes('yojana') || lower.includes('paisa') || lower.includes('kisan') || lower.includes('sahayata')) {
    return { name: 'Hindi', code: 'hi-IN' };
  }

  return { name: 'English', code: 'en-IN' };
}

function generatePersonalizedAiResponse(message, history = [], citizenProfile = {}, localeCode = 'en-IN') {
  const lowerMsg = message.toLowerCase();

  const userIncome = citizenProfile.income || 350000;
  const userLoc = citizenProfile.location || 'Urban';
  const userOcc = citizenProfile.occupation === 'Other' ? (citizenProfile.customOccupation || 'Artisan') : (citizenProfile.occupation || 'Artisan');

  const matchedSchemes = findMatchingSchemes(userIncome, userLoc, userOcc, citizenProfile.customOccupation);
  const topMatch = matchedSchemes[0] || dbState.schemes[0];

  const prevUserMsgs = history.filter(h => h.sender === 'user').map(h => h.text.toLowerCase());
  const fullContext = prevUserMsgs.join(' ') + ' ' + lowerMsg;

  let topic = 'general';
  if (fullContext.includes('artisan') || fullContext.includes('weaver') || fullContext.includes('craft') || fullContext.includes('कारीगर') || fullContext.includes('আর্টিসান')) topic = 'artisan';
  else if (fullContext.includes('farmer') || fullContext.includes('kisan') || fullContext.includes('irrigation') || fullContext.includes('किसान') || fullContext.includes('কৃষক')) topic = 'farmer';
  else if (fullContext.includes('ev') || fullContext.includes('electric') || fullContext.includes('transit')) topic = 'transit';
  else if (fullContext.includes('mahila') || fullContext.includes('women') || fullContext.includes('business') || fullContext.includes('incubator')) topic = 'women';
  else if (fullContext.includes('senior') || fullContext.includes('health') || lowerMsg.includes('medicine')) topic = 'senior';
  else if (fullContext.includes('emergency') || fullContext.includes('sos') || fullContext.includes('location') || fullContext.includes('gps')) topic = 'emergency';
  else if (fullContext.includes('complaint') || fullContext.includes('report') || fullContext.includes('pothole') || fullContext.includes('water')) topic = 'complaint';

  const isFollowUp = (
    lowerMsg.includes('apply') || lowerMsg.includes('document') || lowerMsg.includes('how') ||
    lowerMsg.includes('what') || lowerMsg.includes('eligibility') || lowerMsg.includes('आवेदन') ||
    lowerMsg.includes('दस्तावेज़') || lowerMsg.includes('कागज़') || lowerMsg.includes('কাগজ') ||
    lowerMsg.includes('কীভাবে') || lowerMsg.includes('कागदपत्रे') || lowerMsg.includes('पैसे')
  );

  if (localeCode === 'bn-IN') {
    if (topic === 'emergency') {
      return 'Emergency SOS ট্যাবে গিয়ে Share Live Emergency Location বাটনে ক্লিক করুন। আপনার লাইভ GPS স্যাটেলাইট লোকেশন কন্ট্রোল রুমে সংকেত পাঠাবে।';
    }
    if (topic === 'complaint') {
      return 'Report Issue ট্যাবে গিয়ে কোনো লগইন ছাড়াই নর্দমা, রাস্তা বা আলোর সমস্যা ছবি ও GPS লোকেশন সহ বেনামে জমা দিতে পারেন।';
    }

    if (isFollowUp || topic !== 'general') {
      const targetScheme = topic === 'farmer' ? dbState.schemes[1] : topMatch;
      const docs = targetScheme.document_checklist.join(', ');
      return `আপনার প্রোফাইল (আয়: INR ${Number(userIncome).toLocaleString('en-IN')}, পেশা: ${userOcc}) অনুযায়ী সেরা স্কিম: ${targetScheme.title}। অনুদান: ${targetScheme.financial_grant} (${targetScheme.subsidy_rate})। প্রয়োজনীয় কাগজ: ${docs}। আবেদন করতে Welfare Engine ট্যাবে গাইড দেখুন।`;
    }

    const schemeNames = matchedSchemes.slice(0, 2).map(s => `${s.title} (${s.financial_grant})`).join(' এবং ');
    return `আপনার প্রোফাইল অনুসারে উপযুক্ত স্কিম: ${schemeNames}। আপনি কি বিস্তারিত আবেদন প্রক্রিয়া বা প্রয়োজনীয় কাগজপত্র জানতে চান?`;
  }

  if (localeCode === 'hi-IN') {
    if (topic === 'emergency') {
      return 'Emergency SOS टैब पर जाएं और Share Live Location पर क्लिक करें। आपका लाइव GPS लोकेशन तुरंत आपातकालीन इकाई को भेजा जाएगा।';
    }
    if (topic === 'complaint') {
      return 'Report Issue टैब से आप बिना किसी लॉगिन के सड़क, पानी या नालियों की समस्या गुमनाम रूप से दर्ज कर सकते हैं।';
    }

    if (isFollowUp || topic !== 'general') {
      const targetScheme = topic === 'farmer' ? dbState.schemes[1] : topMatch;
      const docs = targetScheme.document_checklist.join(', ');
      return `आपकी प्रोफ़ाइल (आय: INR ${Number(userIncome).toLocaleString('en-IN')}, व्यवसाय: ${userOcc}) के अनुसार सर्वश्रेष्ठ योजना: ${targetScheme.title}। अनुदान: ${targetScheme.financial_grant} (${targetScheme.subsidy_rate})। आवश्यक दस्तावेज़: ${docs}। आवेदन के लिए Welfare Engine टैब देखें।`;
    }

    const schemeNames = matchedSchemes.slice(0, 2).map(s => `${s.title} (${s.financial_grant})`).join(' और ');
    return `आपकी प्रोफ़ाइल के अनुसार सबसे उपयुक्त योजनाएं: ${schemeNames}। क्या आप आवेदन प्रक्रिया या आवश्यक दस्तावेज़ों की सूची देखना चाहते हैं?`;
  }

  if (localeCode === 'ta-IN') {
    return `உங்கள் சுயவிவரப்படி (INR ${Number(userIncome).toLocaleString('en-IN')}, ${userOcc}) சிறந்த திட்டம்: ${topMatch.title}. மானியம்: ${topMatch.financial_grant}. தேவையான ஆவணங்கள்: ${topMatch.document_checklist.join(', ')}.`;
  }

  if (localeCode === 'te-IN') {
    return `మీ ప్రొఫైల్ ప్రకారం (INR ${Number(userIncome).toLocaleString('en-IN')}, ${userOcc}) సిఫార్సు చేసిన పథకం: ${topMatch.title}. ఆర్థిక సహాయం: ${topMatch.financial_grant}. అవసరమైన ధృవపత్రాలు: ${topMatch.document_checklist.join(', ')}.`;
  }

  if (localeCode === 'mr-IN') {
    return `तुमच्या प्रोफाइलनुसार (उत्पन्न: INR ${Number(userIncome).toLocaleString('en-IN')}, व्यवसाय: ${userOcc}) सर्वोत्तम योजना: ${topMatch.title}. अनुदान: ${topMatch.financial_grant}. आवश्यक कागदपत्रे: ${topMatch.document_checklist.join(', ')}.`;
  }

  if (topic === 'emergency') {
    return 'Open the Emergency SOS tab and click Share Live Emergency Location to broadcast real-time GPS telemetry to the municipal response unit.';
  }
  if (topic === 'complaint') {
    return 'Use the Report Issue tab to submit anonymous civic grievances tagged with browser GPS coordinates.';
  }

  if (isFollowUp || topic !== 'general') {
    const targetScheme = topic === 'farmer' ? dbState.schemes[1] : topMatch;
    return `Based on your profile (Income: INR ${Number(userIncome).toLocaleString('en-IN')}, Occupation: ${userOcc}), top recommended scheme is ${targetScheme.title}. Benefit: ${targetScheme.financial_grant} (${targetScheme.subsidy_rate}). Required documents: ${targetScheme.document_checklist.join(', ')}. Click Apply Now in Welfare Engine to submit.`;
  }

  const schemeList = matchedSchemes.slice(0, 2).map(s => `${s.title} (${s.financial_grant})`).join(' and ');
  return `Based on your citizen profile, top recommended schemes are: ${schemeList}. Would you like to view the required documents or step-by-step application procedure?`;
}

router.post('/message', async (req, res) => {
  const { message, conversationHistory, citizenProfile, localeCode } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Message payload required' });
  }

  const langInfo = detectLocale(message, localeCode);

  const grokApiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;

  if (grokApiKey) {
    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${grokApiKey}`
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [
            {
              role: 'system',
              content: `You are Mera Awaaz Mera Adhikar AI Assistant. Citizen profile: Income INR ${citizenProfile?.income || 350000}, Location ${citizenProfile?.location || 'Urban'}, Occupation ${citizenProfile?.occupation || 'Artisan'}. Respond in exact native script of ${langInfo.name} (${langInfo.code}). Answer query: ${message}`
            },
            ...((conversationHistory || []).map(h => ({
              role: h.sender === 'user' ? 'user' : 'assistant',
              content: h.text
            }))),
            { role: 'user', content: message }
          ]
        })
      });
      const data = await response.json();
      const aiText = data.choices?.[0]?.message?.content;
      if (aiText) {
        return res.json({
          success: true,
          reply: aiText,
          localeCode: langInfo.code,
          languageName: langInfo.name
        });
      }
    } catch (e) {}
  }

  const geminiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  if (geminiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `System Prompt: You are Mera Awaaz Mera Adhikar AI Assistant. Citizen Profile: Income INR ${citizenProfile?.income || 350000}, Location ${citizenProfile?.location || 'Urban'}, Occupation ${citizenProfile?.occupation || 'Artisan'}. Respond in native script ${langInfo.name} (${langInfo.code}). Query: ${message}` }]
            }
          ]
        })
      });
      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (aiText) {
        return res.json({
          success: true,
          reply: aiText,
          localeCode: langInfo.code,
          languageName: langInfo.name
        });
      }
    } catch (e) {}
  }

  const replyText = generatePersonalizedAiResponse(message, conversationHistory || [], citizenProfile || {}, langInfo.code);

  res.json({
    success: true,
    reply: replyText,
    localeCode: langInfo.code,
    languageName: langInfo.name
  });
});

export default router;
