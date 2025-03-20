import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Octokit } from "octokit";
import { TwitterApi } from "twitter-api-v2";
import { generateTweet } from "./openai";

if (!process.env.GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required");
}

if (!process.env.TWITTER_API_KEY ||
    !process.env.TWITTER_API_SECRET ||
    !process.env.TWITTER_ACCESS_TOKEN ||
    !process.env.TWITTER_ACCESS_TOKEN_SECRET) {
  throw new Error("Twitter API credentials are required");
}

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  userAgent: 'GitHub-Commit-Viewer'
});

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/commits", async (_req, res) => {
    try {
      // First get the authenticated user's info
      const { data: user } = await octokit.rest.users.getAuthenticated();

      // Get user's repositories
      const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 10 // Limit to 10 most recently updated repos
      });

      await storage.clearAllCommits();

      // Fetch commits from each repository
      const allCommitsPromises = repos.map(async (repo) => {
        try {
          const { data: repoCommits } = await octokit.rest.repos.listCommits({
            owner: repo.owner.login,
            repo: repo.name,
            per_page: 5 // Get 5 most recent commits per repo
          });

          return repoCommits.map(commit => ({
            id: commit.sha,
            message: commit.commit.message,
            author: commit.commit.author?.name || "Unknown",
            authorEmail: commit.commit.author?.email || "unknown@email.com",
            timestamp: new Date(commit.commit.author?.date || Date.now()),
            repository: `${repo.owner.login}/${repo.name}`,
            sha: commit.sha,
            url: commit.html_url
          }));
        } catch (error) {
          console.error(`Error fetching commits for ${repo.full_name}:`, error);
          return [];
        }
      });

      const commitArrays = await Promise.all(allCommitsPromises);
      const allCommits = commitArrays.flat();

      await storage.saveCommits(allCommits);
      const savedCommits = await storage.getAllCommits();

      res.json(savedCommits);
    } catch (error: any) {
      console.error('GitHub API Error:', error);
      if (error.status === 401) {
        res.status(401).json({ message: "Invalid GitHub token" });
      } else if (error.status === 403 && error.response?.headers?.["x-ratelimit-remaining"] === "0") {
        res.status(429).json({ message: "GitHub API rate limit exceeded" });
      } else {
        res.status(500).json({ message: "Failed to fetch commits" });
      }
    }
  });

  app.post("/api/tweet", async (req, res) => {
    try {
      const { message, repository, url } = req.body;
      if (!message || !repository || !url) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Create a tweet with commit info
      const tweetText = `${message}\n\nFrom ${repository}\n${url}`.slice(0, 280);

      const tweet = await twitterClient.v2.tweet(tweetText);

      res.json({
        success: true,
        tweetId: tweet.data.id,
        tweetUrl: `https://twitter.com/user/status/${tweet.data.id}`
      });
    } catch (error: any) {
      console.error('Twitter API Error:', error);
      res.status(500).json({
        message: "Failed to post tweet",
        error: error.message
      });
    }
  });

  app.post("/api/tweet/ai", async (req, res) => {
    try {
      const { message, repository, author } = req.body;
      if (!message || !repository || !author) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Generate tweet using AI
      const aiTweetText = await generateTweet({ message, repository, author });

      // If preview parameter is true, just return the generated text
      if (req.query.preview === "true") {
        return res.json({
          success: true,
          generatedText: aiTweetText
        });
      }

      // Otherwise, post to Twitter
      const tweet = await twitterClient.v2.tweet(aiTweetText);

      res.json({
        success: true,
        tweetId: tweet.data.id,
        tweetUrl: `https://twitter.com/user/status/${tweet.data.id}`,
        generatedText: aiTweetText
      });
    } catch (error: any) {
      console.error('AI Tweet Error:', error);
      res.status(500).json({
        message: "Failed to generate or post AI tweet",
        error: error.message
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}