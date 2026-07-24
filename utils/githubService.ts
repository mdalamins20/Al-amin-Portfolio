export const getGithubToken = () => {
  return localStorage.getItem('GITHUB_TOKEN') || '';
};

export const saveGithubToken = (key: string) => {
  localStorage.setItem('GITHUB_TOKEN', key);
};

export const removeGithubToken = () => {
  localStorage.removeItem('GITHUB_TOKEN');
};

export const fetchGithubRepoData = async (repoUrl: string) => {
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
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
       if (repoRes.status === 404) {
           throw new Error('Repository not found. If it is private, please add a GitHub Token in AI Settings.');
       }
       throw new Error(`Failed to fetch repo info: ${repoRes.statusText}`);
    }
    const repoInfo = await repoRes.json();

    // Fetch README
    let readmeText = '';
    try {
      const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
      if (readmeRes.ok) {
        const readmeData = await readmeRes.json();
        // Decode Base64 safely (handles utf-8 correctly unlike plain atob for complex chars)
        readmeText = decodeURIComponent(escape(atob(readmeData.content)));
      }
    } catch (e) {
      console.log('No readme found or error fetching it');
    }

    // Fetch package.json (if exists, to detect tech stack)
    let packageJson = '';
    try {
      const pkgRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/package.json`, { headers });
      if (pkgRes.ok) {
        const pkgData = await pkgRes.json();
        packageJson = decodeURIComponent(escape(atob(pkgData.content)));
      }
    } catch (e) {
      console.log('No package.json found');
    }

    // Combine data into a structured string for the AI
    return `
Repository Name: ${repoInfo.name}
Description: ${repoInfo.description || 'None'}
Language: ${repoInfo.language || 'Unknown'}
Topics: ${(repoInfo.topics || []).join(', ')}

README CONTENT:
${readmeText.substring(0, 5000) /* Limit readme size */}

PACKAGE.JSON:
${packageJson ? packageJson.substring(0, 2000) : 'None'}
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
    throw new Error(`GitHub API Error: ${res.statusText}`);
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
