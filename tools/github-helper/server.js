require('dotenv').config();
const express = require('express');
const { Octokit } = require('octokit');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Debug logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Initialize Octokit with GitHub token
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get user's repositories
app.get('/api/repos', async (req, res) => {
  try {
    console.log('Fetching repositories...');
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100
    });
    console.log(`Found ${data.length} repositories`);
    res.json(data);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ error: 'Failed to fetch repositories', details: error.message });
  }
});

// Get repository branches
app.get('/api/repos/:owner/:repo/branches', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    console.log(`Fetching branches for ${owner}/${repo}...`);
    const { data } = await octokit.rest.repos.listBranches({
      owner,
      repo,
      per_page: 100
    });
    console.log(`Found ${data.length} branches`);
    res.json(data);
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ error: 'Failed to fetch branches', details: error.message });
  }
});

// Create and push file to branch
app.post('/api/repos/:owner/:repo/push', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { branchName, content } = req.body;
    console.log(`Creating branch ${branchName} in ${owner}/${repo}...`);

    // Get the default branch's latest commit SHA
    const { data: defaultBranch } = await octokit.rest.repos.getBranch({
      owner,
      repo,
      branch: 'main' // or 'master' depending on the default branch
    });

    // Create a new branch
    const { data: newBranch } = await octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: defaultBranch.commit.sha
    });

    // Create the file
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: 'index.html',
      message: `Create index.html in ${branchName}`,
      content: Buffer.from(content).toString('base64'),
      branch: branchName
    });

    console.log('Successfully created branch and pushed file');
    res.json({ success: true, branch: newBranch });
  } catch (error) {
    console.error('Error creating branch and pushing file:', error);
    res.status(500).json({ error: 'Failed to create branch and push file', details: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Not Found', path: req.url });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Available routes:');
  console.log('GET /');
  console.log('GET /api/repos');
  console.log('GET /api/repos/:owner/:repo/branches');
  console.log('POST /api/repos/:owner/:repo/push');
}); 