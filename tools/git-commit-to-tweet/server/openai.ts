import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file, might need to be changed for replit
dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not set in environment variables. Please add it to your .env file");
}

const openai = new OpenAI({ apiKey });

// Read character configuration
const characterConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "character.json"), "utf-8")
);

export async function generateTweet(commit: {
  message: string;
  repository: string;
  author: string;
}): Promise<string> {
  const prompt = `
You are roleplaying as a developer with the following personality:
${JSON.stringify(characterConfig, null, 2)}

Write a tweet (maximum 280 characters) about this commit:
- Commit Message: ${commit.message}
- Repository: ${commit.repository}
- Author: ${commit.author}

Write the tweet in the style of the character, incorporating their personality traits and speaking style.
The tweet should be creative and fun while still being informative about what the commit actually does.
Just return the tweet text without any additional formatting or explanation.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 100,
    temperature: 0.8,
  });

  return response.choices[0].message.content?.trim() || "Failed to generate tweet";
}
