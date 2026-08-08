import express from 'express';

const router = express.Router();

function detectLanguage(text, forced) {
  if (forced && forced !== 'AUTO') {
    const map = {
      'hi-IN': { name: 'Hindi', code: 'hi-IN' },
      'bn-IN': { name: 'Bengali', code: 'bn-IN' },
      'ta-IN': { name: 'Tamil', code: 'ta-IN' },
      'te-IN': { name: 'Telugu', code: 'te-IN' },
      'mr-IN': { name: 'Marathi', code: 'mr-IN' },
      'en-IN': { name: 'English', code: 'en-IN' }
    };
    return map[forced] || { name: 'English', code: 'en-IN' };
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

function generateResponse(text, langCode) {
  const lower = text.toLowerCase();

  if (langCode === 'hi-IN') {
    if (lower.includes('scheme') || lower.includes('yojana') || lower.includes('welfare') || lower.includes('paisa') || lower.includes('money') || lower.includes('rupee')) {
      return 'Aap Welfare Engine tab par jaakar apni varshik aay (INR Rupees) aur vyavsay darj karke sabhi sarkari yojanaon ki patrata janch sakte hain.';
    }
    if (lower.includes('emergency') || lower.includes('sos') || lower.includes('help') || lower.includes('location') || lower.includes('madad')) {
      return 'Emergency Assistance tab par click karke aap apna live GPS satellite location municipal emergency unit ke saath share kar sakte hain.';
    }
    if (lower.includes('report') || lower.includes('complaint') || lower.includes('pothole') || lower.includes('pani') || lower.includes('sadak')) {
      return 'Aap Report Issue tab se bina kisi login ke gumnam roop se apni nagrik samasya darj kar sakte hain.';
    }
    return 'Main aapka Civic Pulse AI sahayak hoon. Aap mujhse sarkari yojanaon, INR aarthik grant, aapatkalin SOS, ya nagrik shikayaton ke baare mein pooch sakte hain.';
  }

  if (langCode === 'bn-IN') {
    if (lower.includes('scheme') || lower.includes('welfare') || lower.includes('taka') || lower.includes('sahayata')) {
      return 'Apni Welfare Engine tab-e giye apnar barshik ay (INR) ebong pesha proboesh koriye shob sarkari prokolper eligibility dekhun.';
    }
    if (lower.includes('emergency') || lower.includes('sos') || lower.includes('location')) {
      return 'Emergency Assistance tab use kore apnar live GPS satellite location emergency team-er sathe share korun.';
    }
    return 'Apni amake bhashar madhyame bhabishyat sarkari prokolpo ebong nagorik obhijog somporoboke jignasa korte paren.';
  }

  if (langCode === 'ta-IN') {
    return 'Civic Pulse AI ungalukku udavugiren. Welfare Engine tab dwara ungalukkana sarkari nalathittam matrum INR maniyam kurithu therindhu kollungal.';
  }

  if (langCode === 'te-IN') {
    return 'Nenu mee Civic Pulse AI sahayakudini. Prabhutva padhakaalu, INR financial grants, mariyu emergency GPS tracking pai prashnalaku samadhanam isthanu.';
  }

  if (langCode === 'mr-IN') {
    return 'Me tumcha Civic Pulse AI sahayak aahe. Aaplyala shaskiya yojana, INR anudan, ani emergency SOS GPS babat sarv mahiti ithe milel.';
  }

  if (lower.includes('scheme') || lower.includes('welfare') || lower.includes('grant') || lower.includes('rupee') || lower.includes('inr')) {
    return 'You can use the Welfare Engine tab to input your annual income in INR (Rupees) and occupation to calculate explainable matching grants and subsidies.';
  }
  if (lower.includes('emergency') || lower.includes('sos') || lower.includes('location') || lower.includes('track')) {
    return 'Open the Emergency SOS tab to start real-time GPS location sharing with municipal dispatch teams on an interactive satellite grid map.';
  }
  if (lower.includes('report') || lower.includes('complaint') || lower.includes('grievance') || lower.includes('pothole')) {
    return 'Use the Report Issue tab to log anonymous civic grievances tagged automatically with browser GPS coordinates.';
  }

  return 'Civic Pulse Assistant is active. I can automatically detect your language and guide you through welfare recommendations, emergency SOS GPS tracking, or public grievance reports.';
}

router.post('/message', (req, res) => {
  const { message, forcedLanguage } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Message payload required' });
  }

  const langInfo = detectLanguage(message, forcedLanguage);
  const replyText = generateResponse(message, langInfo.code);

  res.json({
    success: true,
    reply: replyText,
    detectedLanguage: langInfo.code,
    languageCode: langInfo.code,
    languageName: langInfo.name
  });
});

export default router;
