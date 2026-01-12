
import { GoogleGenAI } from "@google/genai";
import * as fs from 'fs';

const apiKey = "AIzaSyDP-Oj611vMsb6gtLP0A0YedxpMLpF6SFg";
const ai = new GoogleGenAI({ apiKey: apiKey });

async function listModels() {
    try {
        console.log("Fetching available models...");
        const response = await ai.models.list();

        // Log the keys to understand structure
        console.log("Response Keys:", Object.keys(response));

        // Attempt to find the array
        let models = [];
        if (Array.isArray(response)) {
            models = response;
        } else if (response.models) {
            models = response.models;
        } else if (response.data) {
            models = response.data;
        } else {
            // Try to dump the whole thing to file if we can't find the array
            fs.writeFileSync('models_raw_dump.json', JSON.stringify(response, null, 2));
            console.log("Dumped raw response to models_raw_dump.json");
            return;
        }

        const modelNames = models.map((m: any) => `${m.name} (${m.displayName})`);
        console.log("Models found:", modelNames.join('\n'));
        fs.writeFileSync('models_list.txt', modelNames.join('\n'));

    } catch (error) {
        console.error("Error listing models:", error);
        fs.writeFileSync('models_error.txt', JSON.stringify(error, null, 2));
    }
}

listModels();
