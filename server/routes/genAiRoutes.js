import express from "express";
import * as dotenv from "dotenv";
import { GoogleGenAI, Modality } from "@google/genai";

dotenv.config();

const router = express.Router();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

router.route("/").post(async (req, res) => {
  try {
    const { prompt } = req.body;
    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: prompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    for (const part of aiResponse.candidates[0].content.parts) {
      if (part.text) {
        console.log(part.text);
      } else if (part.inlineData) {
        const imageData = part.inlineData;
        return res.json({
          photo: imageData.data,
          mimeType: imageData.mimeType || "image/png",
        });
      }
    }
    res.status(500).send("Image generation failed!");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
