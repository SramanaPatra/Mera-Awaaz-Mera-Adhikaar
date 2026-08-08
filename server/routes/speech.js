import express from 'express';

const router = express.Router();

const sampleScriptMap = {
  'bn-IN': 'আমি সরকারি স্কিম এবং কল্যাণমূলক অনুদানের বিস্তারিত জানতে চাই',
  'hi-IN': 'मुझे सरकारी जनकल्याणकारी योजना और अनुदान की जानकारी चाहिए',
  'ta-IN': 'அரசு நலத்திட்டங்கள் மற்றும் உதவித்தொகை விவரங்களை அறிய விரும்புகிறேன்',
  'te-IN': 'ప్రభుత్వ సంక్షేమ పథకాలు మరియు సహాయం గురించి వివరాలు కావాలి',
  'mr-IN': 'मला शासकीय योजना आणि अनुदानाबाबत माहिती हवी आहे',
  'en-IN': 'I want to inquire about civic welfare schemes and financial grants'
};

const langNameMap = {
  'bn-IN': 'Bengali',
  'hi-IN': 'Hindi',
  'ta-IN': 'Tamil',
  'te-IN': 'Telugu',
  'mr-IN': 'Marathi',
  'en-IN': 'English'
};

router.post('/transcribe', (req, res) => {
  const { audioBase64, localeCode, sampleText } = req.body;
  const targetLocale = localeCode && localeCode !== 'AUTO' ? localeCode : 'en-IN';

  let transcribedText = sampleText || sampleScriptMap[targetLocale] || sampleScriptMap['en-IN'];

  res.json({
    success: true,
    text: transcribedText,
    localeCode: targetLocale,
    languageName: langNameMap[targetLocale] || 'English'
  });
});

export default router;
