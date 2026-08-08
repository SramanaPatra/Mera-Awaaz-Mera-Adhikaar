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

  const vishwakarmaKeywords = ['vishwakarma', 'artisan', 'craft', 'weaver', 'विश्वकर्मा', 'कारीगर', 'বিশ্বকর্মা', 'விஸ்வகர்மா', 'విశ్వకర్మ'];
  const farmerKeywords = ['farmer', 'kisan', 'irrigation', 'water pump', 'किसान', 'सिंचाई', 'कृषक', 'விவசாயி', 'రైతు', 'शेतकरी'];
  const evKeywords = ['ev', 'electric', 'vehicle', 'mobility', 'permit', 'ईवी', 'इलेक्ट्रिक', 'மின்சார', 'విద్యుత్'];
  const womenKeywords = ['mahila', 'women', 'incubator', 'female', 'महिला', 'स्त्री', 'மகளிர்', 'మహిళ'];
  const seniorKeywords = ['senior', 'elder', 'health', 'pension', 'medicine', 'वरिष्ठ', 'बुजुर्ग', 'स्वास्थ्य', 'முதியோர்', 'వృద్ధులు'];
  const emergencyKeywords = ['emergency', 'sos', 'gps', 'broadcast', 'help', 'danger', 'आपातकाल', 'सुरक्षा', 'அவசரம்', 'అత్యవసరం'];
  const complaintKeywords = ['complaint', 'grievance', 'pothole', 'drain', 'water issue', 'report', 'शिकायत', 'समस्या', 'புகார்', 'ఫిర్యాదు'];
  const docKeywords = ['document', 'paper', 'proof', 'aadhaar', 'certificate', 'दस्तावेज़', 'कागज़', 'कागदपत्रे', 'ஆவணங்கள்', 'పత్రాలు', 'কাগজপত্র'];

  let matchedSchemeTarget = null;
  if (vishwakarmaKeywords.some(k => lowerMsg.includes(k))) matchedSchemeTarget = dbState.schemes[0];
  else if (farmerKeywords.some(k => lowerMsg.includes(k))) matchedSchemeTarget = dbState.schemes[1];
  else if (evKeywords.some(k => lowerMsg.includes(k))) matchedSchemeTarget = dbState.schemes[2];
  else if (womenKeywords.some(k => lowerMsg.includes(k))) matchedSchemeTarget = dbState.schemes[3];
  else if (seniorKeywords.some(k => lowerMsg.includes(k))) matchedSchemeTarget = dbState.schemes[4];

  if (!matchedSchemeTarget) matchedSchemeTarget = topMatch;

  if (emergencyKeywords.some(k => lowerMsg.includes(k))) {
    if (localeCode === 'hi-IN') {
      return 'आपातकालीन सहायता के लिए बाईं ओर Emergency SOS बटन पर जाएं। Share Live Location पर क्लिक करते ही आपका सटीक GPS लोकेशन कंट्रोल रूम को भेजा जाएगा।';
    }
    if (localeCode === 'bn-IN') {
      return 'জরুরি সহায়তার জন্য বামপাশের Emergency SOS বাটনে যান। Share Live Location অপশনে ক্লিক করলে আপনার লাইভ GPS লোকেশন নিয়ন্ত্রণ কক্ষে পাঠানো হবে।';
    }
    return 'For immediate emergency assistance, navigate to Emergency SOS. Click Share Live Emergency Location to stream your satellite GPS telemetry directly to the response unit.';
  }

  if (complaintKeywords.some(k => lowerMsg.includes(k))) {
    if (localeCode === 'hi-IN') {
      return 'नागरिक समस्याओं (जैसे टूटी सड़क, पानी की समस्या या कचरा) की रिपोर्ट के लिए Report Issue टैब का उपयोग करें। आपका आवेदन बिना किसी लॉगिन के दर्ज हो जाएगा।';
    }
    if (localeCode === 'bn-IN') {
      return 'নাগরিক সমস্যার জন্য Report Issue ট্যাবে গিয়ে কোনো লগইন ছাড়াই বেনামে অভিযোগ ও GPS লোকেশন জমা দিতে পারেন।';
    }
    return 'To submit civic complaints (such as broken roads or sanitation issues), use the Report Issue tab. Reports are encrypted and tagged with automatic browser GPS coordinates.';
  }

  if (docKeywords.some(k => lowerMsg.includes(k))) {
    const docs = matchedSchemeTarget.document_checklist.join(', ');
    if (localeCode === 'hi-IN') {
      return `${matchedSchemeTarget.title} के लिए आवश्यक दस्तावेज़: ${docs}। कृपया आवेदन करने से पहले इन कागज़ात को तैयार रखें।`;
    }
    if (localeCode === 'bn-IN') {
      return `${matchedSchemeTarget.title} এর জন্য প্রয়োজনীয় কাগজপত্র: ${docs}। অনুগ্রহ করে আবেদনের পূর্বে এগুলো প্রস্তুত রাখুন।`;
    }
    return `Required documents for ${matchedSchemeTarget.title}: ${docs}. Ensure these documents are ready before clicking Apply Now.`;
  }

  if (matchedSchemeTarget) {
    const docs = matchedSchemeTarget.document_checklist.join(', ');
    if (localeCode === 'hi-IN') {
      return `आपकी प्रोफ़ाइल (आय: INR ${Number(userIncome).toLocaleString('en-IN')}, व्यवसाय: ${userOcc}) के अनुसार ${matchedSchemeTarget.title} आपके लिए उपयुक्त है। इसमें ${matchedSchemeTarget.financial_grant} का अनुदान (${matchedSchemeTarget.subsidy_rate}) प्रदान किया जाता है। आवश्यक दस्तावेज़: ${docs}। आप अभी Apply Now पर क्लिक करके आवेदन कर सकते हैं।`;
    }
    if (localeCode === 'bn-IN') {
      return `আপনার প্রোফাইল (আয়: INR ${Number(userIncome).toLocaleString('en-IN')}, পেশা: ${userOcc}) অনুসারে ${matchedSchemeTarget.title} আপনার জন্য উপযোগী। এতে ${matchedSchemeTarget.financial_grant} অনুদান (${matchedSchemeTarget.subsidy_rate}) প্রদান করা হয়। প্রয়োজনীয় কাগজ: ${docs}। আবেদন করতে Apply Now নির্বাচন করুন।`;
    }
    if (localeCode === 'ta-IN') {
      return `உங்கள் சுயவிவரப்படி (INR ${Number(userIncome).toLocaleString('en-IN')}, ${userOcc}) சிறந்த திட்டம்: ${matchedSchemeTarget.title}. மானியம்: ${matchedSchemeTarget.financial_grant} (${matchedSchemeTarget.subsidy_rate}). தேவையான ஆவணங்கள்: ${docs}.`;
    }
    if (localeCode === 'te-IN') {
      return `మీ ప్రొఫైల్ ప్రకారం (INR ${Number(userIncome).toLocaleString('en-IN')}, ${userOcc}) తగిన పథకం: ${matchedSchemeTarget.title}. ఆర్థిక సాయం: ${matchedSchemeTarget.financial_grant} (${matchedSchemeTarget.subsidy_rate}). అవసరమైన పత్రాలు: ${docs}.`;
    }
    if (localeCode === 'mr-IN') {
      return `तुमच्या प्रोफाइलनुसार (उत्पन्न: INR ${Number(userIncome).toLocaleString('en-IN')}, व्यवसाय: ${userOcc}) सर्वोत्तम योजना: ${matchedSchemeTarget.title}. अनुदान: ${matchedSchemeTarget.financial_grant} (${matchedSchemeTarget.subsidy_rate}). आवश्यक कागदपत्रे: ${docs}.`;
    }

    return `Based on your citizen profile (Income: INR ${Number(userIncome).toLocaleString('en-IN')}, Occupation: ${userOcc}), the scheme ${matchedSchemeTarget.title} provides a benefit of ${matchedSchemeTarget.financial_grant} (${matchedSchemeTarget.subsidy_rate}). Required checklist: ${docs}. Click Apply Now to submit your application immediately.`;
  }

  const schemeList = matchedSchemes.slice(0, 3).map(s => `${s.title} (${s.financial_grant})`).join(', ');
  if (localeCode === 'hi-IN') {
    return `आपकी प्रोफ़ाइल के अनुसार अनुशंसित योजनाएं: ${schemeList}। आप किसी भी योजना के बारे में विवरण या आवश्यक दस्तावेज़ पूछ सकते हैं।`;
  }
  return `Based on your citizen profile, your top matching welfare schemes are: ${schemeList}. Ask about any specific scheme to view its eligibility criteria or document checklist.`;
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
              content: `You are Mera Awaaz Mera Adhikar AI Assistant. Citizen profile: Income INR ${citizenProfile?.income || 350000}, Location ${citizenProfile?.location || 'Urban'}, Occupation ${citizenProfile?.occupation || 'Artisan'}. Respond concisely in exact native script of ${langInfo.name} (${langInfo.code}). Query: ${message}`
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
