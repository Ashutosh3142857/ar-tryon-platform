const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
const REPO_OWNER = 'Ashutosh3142857';
const REPO_NAME = 'ar-tryon-platform';

// Function to get all files recursively, excluding certain directories
function getAllFiles(dirPath, arrayOfFiles = [], basePath = '') {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const relativePath = path.join(basePath, file);
    
    // Skip these directories and files
    if (file === 'node_modules' || file === '.git' || file === 'dist' || 
        file === '.cache' || file === '.local' || file === '.config' ||
        file.startsWith('.replit') || file === 'replit.nix' ||
        file.endsWith('.lock')) {
      return;
    }

    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles, relativePath);
    } else {
      arrayOfFiles.push({
        localPath: fullPath,
        remotePath: relativePath.replace(/\\/g, '/')
      });
    }
  });

  return arrayOfFiles;
}

// Function to upload a file to GitHub
async function uploadFile(filePath, content) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Add ${filePath}`,
      content: content,
      branch: 'main'
    })
  });

  return response;
}

// Main function
async function uploadAllFiles() {
  try {
    const files = getAllFiles('.');
    console.log(`Found ${files.length} files to upload`);
    
    let uploaded = 0;
    let failed = 0;

    for (const file of files) {
      try {
        // Read file and encode to base64
        const fileContent = fs.readFileSync(file.localPath);
        const base64Content = fileContent.toString('base64');
        
        console.log(`Uploading: ${file.remotePath}`);
        const response = await uploadFile(file.remotePath, base64Content);
        
        if (response.ok) {
          uploaded++;
          console.log(`✅ Uploaded: ${file.remotePath}`);
        } else {
          failed++;
          const errorData = await response.text();
          console.log(`❌ Failed: ${file.remotePath} - ${errorData}`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        failed++;
        console.log(`❌ Error uploading ${file.remotePath}: ${error.message}`);
      }
    }
    
    console.log(`\n📊 Upload Summary:`);
    console.log(`✅ Uploaded: ${uploaded} files`);
    console.log(`❌ Failed: ${failed} files`);
    console.log(`🔗 Repository: https://github.com/${REPO_OWNER}/${REPO_NAME}`);
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

uploadAllFiles();
