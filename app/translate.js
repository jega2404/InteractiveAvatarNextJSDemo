import 'dotenv/config';
import axios from 'axios';

async function translateText(text) {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_API_KEY}`;

  const response = await axios.post(url, {
    q: text,
    target: "ar",
    format: "text"
  });

  return response.data.data.translations[0].translatedText;
}

(async () => {
  const english = "Welcome to our hospital. How can I assist you?";
  const arabic = await translateText(english);

  console.log("English:", english);
  console.log("Arabic:", arabic);
})();
