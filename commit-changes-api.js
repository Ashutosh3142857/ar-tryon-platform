import fs from 'fs';
import { execSync } from 'child_process';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'Ashutosh3142857';
const REPO = 'ar-tryon-platform';

async function getChangedFiles() {
  try {
    // Get files that are different from the last commit
    const modifiedFiles = execSync('git diff --name-only HEAD', { encoding: 'utf8' }).trim().split('\n').filter(f => f);
    const untrackedFiles = execSync('git ls-files --others --exclude-standard', { encoding: 'utf8' }).trim().split('\n').filter(f => f);
    
    return [...modifiedFiles, ...untrackedFiles].filter(f => f && !f.startsWith('.git'));
  } catch (error) {
    console.log('No git differences found, checking working directory status...');
    return [];
  }
}

async function commitChangesToGithub() {
  if (!GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN not found in environment variables');
    return;
  }

  try {
    // Get current branch
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    console.log(`Current branch: ${branch}`);

    // Get changed files
    const changedFiles = await getChangedFiles();
    console.log('Changed files:', changedFiles);

    if (changedFiles.length === 0) {
      console.log('No changes detected. Creating a status commit to sync with GitHub...');
    }

    // Get the current commit SHA from GitHub to use as parent
    const refResponse = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/git/refs/heads/${branch}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!refResponse.ok) {
      console.error('Failed to get current branch reference from GitHub');
      return;
    }

    const refData = await refResponse.json();
    const parentSha = refData.object.sha;
    console.log(`Parent commit SHA: ${parentSha}`);

    // Get the current tree SHA
    const commitResponse = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/git/commits/${parentSha}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const commitData = await commitResponse.json();
    let baseTreeSha = commitData.tree.sha;

    let newTreeSha = baseTreeSha;

    // If we have changed files, create a new tree
    if (changedFiles.length > 0) {
      const tree = [];
      
      for (const filePath of changedFiles) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          tree.push({
            path: filePath,
            mode: '100644',
            type: 'blob',
            content: content
          });
        } catch (error) {
          console.log(`Skipping file ${filePath}: ${error.message}`);
        }
      }

      if (tree.length > 0) {
        const treeResponse = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/git/trees`, {
          method: 'POST',
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            base_tree: baseTreeSha,
            tree: tree
          })
        });

        if (!treeResponse.ok) {
          const error = await treeResponse.text();
          console.error('Failed to create tree:', error);
          return;
        }

        const treeData = await treeResponse.json();
        newTreeSha = treeData.sha;
        console.log('New tree created:', newTreeSha);
      }
    }

    // Create a new commit
    const commitMessage = changedFiles.length > 0 ? 
      `Update AR try-on platform: ${changedFiles.length} files changed` : 
      `Sync AR try-on platform - ${new Date().toISOString().split('T')[0]}`;

    const newCommitResponse = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/git/commits`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        message: commitMessage,
        tree: newTreeSha,
        parents: [parentSha]
      })
    });

    if (!newCommitResponse.ok) {
      const error = await newCommitResponse.text();
      console.error('Failed to create commit:', error);
      return;
    }

    const newCommitData = await newCommitResponse.json();
    console.log('New commit created:', newCommitData.sha);

    // Update the branch reference
    const updateRefResponse = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        sha: newCommitData.sha
      })
    });

    if (!updateRefResponse.ok) {
      const error = await updateRefResponse.text();
      console.error('Failed to update reference:', error);
      return;
    }

    console.log('✅ Successfully committed to GitHub!');
    console.log(`Commit SHA: ${newCommitData.sha}`);
    console.log(`View at: https://github.com/${OWNER}/${REPO}/commit/${newCommitData.sha}`);

  } catch (error) {
    console.error('Error committing to GitHub:', error.message);
  }
}

commitChangesToGithub();