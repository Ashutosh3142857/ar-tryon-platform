import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'Ashutosh3142857';
const REPO = 'ar-tryon-platform';

async function getFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

async function getAllFiles() {
  const files = [];
  
  function walkDir(dir, ignore = ['.git', 'node_modules', '.replit']) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      if (ignore.includes(item)) continue;
      
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath, ignore);
      } else {
        const relativePath = path.relative('.', fullPath);
        files.push(relativePath);
      }
    }
  }
  
  walkDir('.');
  return files;
}

async function commitToGithub() {
  if (!GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN not found in environment variables');
    return;
  }

  try {
    // Get current branch and latest commit
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    const latestCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    
    console.log(`Current branch: ${branch}`);
    console.log(`Latest commit: ${latestCommit}`);

    // Get all files
    const allFiles = await getAllFiles();
    console.log(`Found ${allFiles.length} files`);

    // Create tree objects for all files
    const tree = [];
    
    for (const filePath of allFiles) {
      const content = await getFileContent(filePath);
      if (content !== null) {
        const base64Content = Buffer.from(content).toString('base64');
        tree.push({
          path: filePath,
          mode: '100644',
          type: 'blob',
          content: content
        });
      }
    }

    if (tree.length === 0) {
      console.log('No files to commit');
      return;
    }

    // Create a new tree
    const treeResponse = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/git/trees`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        tree: tree
      })
    });

    if (!treeResponse.ok) {
      const error = await treeResponse.text();
      console.error('Failed to create tree:', error);
      return;
    }

    const treeData = await treeResponse.json();
    console.log('Tree created:', treeData.sha);

    // Get the parent commit SHA from GitHub
    const refResponse = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/git/refs/heads/${branch}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    let parentSha = null;
    if (refResponse.ok) {
      const refData = await refResponse.json();
      parentSha = refData.object.sha;
    }

    // Create a new commit
    const commitMessage = `Update AR try-on platform - ${new Date().toISOString()}`;
    const commitData = {
      message: commitMessage,
      tree: treeData.sha
    };

    if (parentSha) {
      commitData.parents = [parentSha];
    }

    const commitResponse = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/git/commits`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify(commitData)
    });

    if (!commitResponse.ok) {
      const error = await commitResponse.text();
      console.error('Failed to create commit:', error);
      return;
    }

    const commitResult = await commitResponse.json();
    console.log('Commit created:', commitResult.sha);

    // Update the reference
    const updateRefResponse = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        sha: commitResult.sha
      })
    });

    if (!updateRefResponse.ok) {
      const error = await updateRefResponse.text();
      console.error('Failed to update reference:', error);
      return;
    }

    console.log('✅ Successfully committed to GitHub!');
    console.log(`Commit SHA: ${commitResult.sha}`);
    console.log(`View at: https://github.com/${OWNER}/${REPO}/commit/${commitResult.sha}`);

  } catch (error) {
    console.error('Error committing to GitHub:', error);
  }
}

commitToGithub();