import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const generateTripPlan = async (prompt) => {
    let retries = 3;

    while (retries > 0) {
        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
            
        } catch (error) {

            if (error.status === 503 && retries > 1) {
                console.log("Gemini busy. Retrying...");

                await new Promise(resolve =>
                    setTimeout(resolve, 3000)
                );

                retries--;
                continue;
            }

            throw error;
        }
    }
};