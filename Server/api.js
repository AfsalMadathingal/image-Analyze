const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

const upload = multer({ storage: multer.memoryStorage() }); // Store uploaded files in memory

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API, 
});

app.post('/scan', upload.single('image'), async (req, res) => {
  try {
   
    console.log("scan started",req.body);
    let { limit } = req.body;
    if(limit=="null"){
      limit = 1
    }else if(limit=="1"){
      limit = parseInt(limit)
      limit = 2
      console.log("limit from one", limit);
    }else if(limit=="2"){
      res.status(200).json({ success: false , message: "sorry the api is limited"});
      return
    }else{
      res.status(200).json({ success: false , message: "sorry the api is limited"});
      return
    }
  
    const imageBuffer = req.file.buffer.toString('base64');


    const message = await anthropic.messages.create({
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/png",
                data: imageBuffer,
              },
            },
            {
              type: "text",
              text: `feeling of this person nb : answer in one word like "happy" , "sad", "angry" dressing of this person nb : answer in one word like "red shirt " , expression of face in emoji nb : answer in one emoji like : "😒" ,"😊", surroundings of this person nb : answer in one sentence like : "your sitting in office" ,"you are sitting in home " , your answer should be like this emotion should have a single word, emoji should have single emoji , and surrounding should be under 30 char 4 of them seprated by coma   example - : happy , red shirt , 😊 , you are sitting in office `
            },
            
          ],
        },
      ],
      model: "claude-3-opus-20240229",
    });

    console.log(message.content);
    const result = await new Promise((resolve, reject) =>setTimeout(() => resolve("success"), 3000));

    res.status(200).json({ success: true, message: "success" , result: message.content[0].text, limit: limit});

  } catch (error) {
    res.status(500).json({ success: false, error: "server", errorMessage: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
