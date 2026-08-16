export const getGithubToken = () => {
  return localStorage.getItem('GITHUB_TOKEN') || '';
};

export const saveGithubToken = (key: string) => {
  localStorage.setItem('GITHUB_TOKEN', key);
};

export const removeGithubToken = () => {
  localStorage.removeItem('GITHUB_TOKEN');
};

export const fetchUserRepos = async () => {
  const token = getGithubToken();
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  // Fetch repositories for the authenticated user (or public repos if no token, though /user/repos requires auth)
  // If no token, maybe we can fetch for a specific username? Better to require token for this feature or handle gracefully.
  const endpoint = token ? 'https://api.github.com/user/repos?sort=updated&per_page=100' : null;
  if (!endpoint) return [];

  try {
    const response = await fetch(endpoint, { headers });
    if (!response.ok) return [];
    const data = await response.json();
    return data.map((repo: any) => ({
      name: repo.full_name,
      url: repo.html_url
    }));
  } catch (err) {
    console.error("Error fetching repos", err);
    return [];
  }
};

export const fetchGithubRepoData = async (repoUrl: string, onProgress?: (msg: string) => void) => {
  try {
    // Parse URL (e.g. https://github.com/Muhammad-Al-amin/portfolio)
    const urlParts = repoUrl.replace(/\/$/, '').split('/');
    const repo = urlParts.pop();
    const owner = urlParts.pop();

    if (!owner || !repo) {
      throw new Error('Invalid GitHub URL');
    }

    const token = getGithubToken();
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };
    
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    // Fetch Repo Info (Description, topics, etc)
    if (onProgress) onProgress('Scanning repository details...');
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
       if (repoRes.status === 404) {
           throw new Error('Repository not found. If it is private, please add a valid GitHub Token in AI Settings.');
       }
       throw new Error(`Failed to fetch repo info (HTTP ${repoRes.status}): ${repoRes.statusText}`);
    }
    const repoInfo = await repoRes.json();

    // Fetch full recursive file tree to deeply scan project architecture (screens, pages, controllers)
    if (onProgress) onProgress('Scanning entire project structure (folders, screens, pages)...');
    let fileList: string[] = [];
    let fileListText = 'Unknown';
    try {
      const branch = repoInfo.default_branch || 'main';
      const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, { headers });
      if (treeRes.ok) {
        const treeData = await treeRes.json();
        if (treeData.tree && Array.isArray(treeData.tree)) {
          // Extract only file paths (exclude directories from the list to save space, keeping actual files)
          const paths = treeData.tree
            .filter((node: any) => node.type === 'blob')
            .map((node: any) => node.path)
            // Filter out node_modules, build directories, image assets to keep context small and relevant
            .filter((p: string) => 
              !p.includes('node_modules/') && 
              !p.includes('build/') && 
              !p.includes('.git/') &&
              !p.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/i)
            );
          
          fileList = paths;
          // Format as a bulleted list for the AI
          fileListText = paths.map((p: string) => `- ${p}`).join('\n');
          // Cap the file list string length to avoid context window explosion
          if (fileListText.length > 5000) {
            fileListText = fileListText.substring(0, 5000) + '\n... (truncated due to size)';
          }
        }
      }
    } catch (e) {
      console.log('Error fetching recursive tree:', e);
    }

    // Helper to fetch file content safely
    const fetchFileSafely = async (filename: string) => {
      try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filename}`, { headers });
        if (res.ok) {
          const data = await res.json();
          return decodeURIComponent(escape(atob(data.content)));
        }
      } catch (e) {}
      return '';
    };

    // Fetch README
    if (onProgress) onProgress('Scanning README.md...');
    let readmeText = await fetchFileSafely('README.md');
    if (!readmeText) readmeText = await fetchFileSafely('readme.md');

    // Fetch crucial configuration files
    if (onProgress) onProgress('Analyzing configuration files (pubspec.yaml, package.json, etc)...');
    let configData = '';
    
    if (fileList.some(p => p.endsWith('pubspec.yaml'))) {
      const pubspecPath = fileList.find(p => p.endsWith('pubspec.yaml'))!;
      const pubspec = await fetchFileSafely(pubspecPath);
      if (pubspec) configData += `\nPUBSPEC.YAML:\n${pubspec.substring(0, 1500)}`;
    }
    if (fileList.some(p => p.endsWith('package.json'))) {
      const pkgPath = fileList.find(p => p.endsWith('package.json'))!;
      const pkgJson = await fetchFileSafely(pkgPath);
      if (pkgJson) configData += `\nPACKAGE.JSON:\n${pkgJson.substring(0, 1500)}`;
    }
    if (fileList.some(p => p.endsWith('requirements.txt'))) {
      const reqPath = fileList.find(p => p.endsWith('requirements.txt'))!;
      const reqTxt = await fetchFileSafely(reqPath);
      if (reqTxt) configData += `\nREQUIREMENTS.TXT:\n${reqTxt.substring(0, 1000)}`;
    }
    if (fileList.some(p => p.endsWith('build.gradle'))) {
      const gradlePath = fileList.find(p => p.endsWith('build.gradle'))!;
      const gradle = await fetchFileSafely(gradlePath);
      if (gradle) configData += `\nBUILD.GRADLE:\n${gradle.substring(0, 1000)}`;
    }

    // Fetch Commits (to understand challenges, progress, features)
    if (onProgress) onProgress('Scanning last 40 commit messages for project evolution...');
    let commitsText = '';
    try {
      const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=40`, { headers });
      if (commitsRes.ok) {
        const commitsData = await commitsRes.json();
        commitsText = commitsData.map((c: any) => `- ${c.commit.message}`).join('\n').substring(0, 4000);
      }
    } catch (e) {
      console.log('No commits found or error fetching them');
    }
    
    if (onProgress) onProgress('Data gathering complete! AI is now generating content...');

    // Combine data into a structured string for the AI
    return `
Repository Name: ${repoInfo.name}
Description: ${repoInfo.description || 'None'}
Language: ${repoInfo.language || 'Unknown'}
Topics: ${(repoInfo.topics || []).join(', ')}

README CONTENT:
${readmeText.substring(0, 5000) /* Limit readme size */}

ROOT AND NESTED FILE LIST (Use this to understand the EXACT features, screens, and architecture of the project. Pay close attention to folders like lib/screens, pages/, controllers/):
${fileListText}

CONFIGURATION FILES:
${configData || 'None'}

RECENT COMMITS (For understanding problems faced, solutions, and project progress):
${commitsText ? commitsText : 'None'}
`;
  } catch (error: any) {
    console.error("GitHub Fetch Error:", error);
    throw new Error(error.message || 'Failed to fetch GitHub repository data');
  }
};

export const fetchGithubContributions = async (username: string) => {
  const token = getGithubToken();
  if (!token) {
    throw new Error('No GitHub token found. Please add it in AI Settings.');
  }

  const query = `
    query($userName:String!) {
      user(login: $userName){
        repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}) {
          totalCount
          nodes {
            stargazerCount
            forkCount
          }
        }
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { userName: username },
    }),
  });

  if (!res.ok) {
    let errorMsg = res.statusText;
    try {
       const errBody = await res.json();
       if (errBody.message) errorMsg = errBody.message;
    } catch(e) {}
    throw new Error(`HTTP ${res.status}: ${errorMsg || 'Unauthorized or Invalid Token'}`);
  }

  const data = await res.json();
  if (data.errors) {
    throw new Error(data.errors[0].message || 'GraphQL Error');
  }

  const user = data.data.user;
  
  let totalStars = 0;
  let totalForks = 0;
  
  if (user.repositories && user.repositories.nodes) {
    user.repositories.nodes.forEach((repo: any) => {
      totalStars += repo.stargazerCount;
      totalForks += repo.forkCount;
    });
  }

  return {
    calendar: user.contributionsCollection.contributionCalendar,
    stats: {
      repos: user.repositories?.totalCount || 0,
      stars: totalStars,
      forks: totalForks,
      totalContributions: user.contributionsCollection.contributionCalendar.totalContributions
    }
  };
};

export const syncToGist = async (data: any, existingGistId?: string): Promise<string> => {
  const token = getGithubToken();
  if (!token) {
    throw new Error('No GitHub token found. Please add it in AI Settings.');
  }

  const gistContent = {
    description: "Portfolio Data JSON",
    public: true,
    files: {
      "portfolio_data.json": {
        content: JSON.stringify(data, null, 2)
      }
    }
  };

  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };

  if (existingGistId) {
    // Update existing Gist
    const res = await fetch(`https://api.github.com/gists/${existingGistId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(gistContent)
    });
    if (!res.ok) throw new Error(`Failed to update Gist: ${res.statusText}`);
    return existingGistId;
  } else {
    // Create new Gist
    const res = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers,
      body: JSON.stringify(gistContent)
    });
    if (!res.ok) throw new Error(`Failed to create Gist: ${res.statusText}`);
    const resData = await res.json();
    return resData.id;
  }
};
