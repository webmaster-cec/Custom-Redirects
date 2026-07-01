import https from 'https';

const CPANEL_HOSTNAME = process.env.CPANEL_HOSTNAME;
const CPANEL_USERNAME = process.env.CPANEL_USERNAME;
const CPANEL_API_TOKEN = process.env.CPANEL_API_TOKEN;

async function cpanelApi(module: string, func: string, params: Record<string, string>): Promise<any> {
  if (!CPANEL_HOSTNAME || !CPANEL_USERNAME || !CPANEL_API_TOKEN) {
    throw new Error('Missing cPanel credentials');
  }

  const url = new URL(`https://${CPANEL_HOSTNAME}:2083/execute/${module}/${func}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'GET',
      headers: {
        'Authorization': `cpanel ${CPANEL_USERNAME}:${CPANEL_API_TOKEN}`
      },
      rejectUnauthorized: false,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`cPanel API HTTP error: ${res.statusMessage || res.statusCode}`));
        }
        try {
          const parsed = JSON.parse(data);
          if (parsed.errors && parsed.errors.length > 0) {
            return reject(new Error(`cPanel API error: ${parsed.errors.join(', ')}`));
          }
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse cPanel API response: ${(e as Error).message}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

export async function addRedirect(domain: string, src: string, dest: string) {
  return cpanelApi('Mime', 'add_redirect', {
    domain,
    src: src.startsWith('/') ? src : `/${src}`,
    redirect: dest,
    type: 'permanent',
    matchwww: '2', // 2 = All (www and non-www)
  });
}

export async function deleteRedirect(domain: string, src: string) {
  return cpanelApi('Mime', 'delete_redirect', {
    domain,
    src: src.startsWith('/') ? src : `/${src}`,
    matchwww: '2',
  });
}

export async function listRedirects() {
  return cpanelApi('Mime', 'list_redirects', {});
}
