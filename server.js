const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

// check if server is running
app.get('/', (req, res) => {
  res.send("Server is running");
});

// basic scanning route
app.post('/scan', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const response = await axios.get(url);

    const issues = [];

    // Store headers in a variable for convenience
    const headers = response.headers;

    // 1. Basic check – does the user-provided URL use HTTPS?
    if (!url.startsWith('https://')) {
      issues.push({
        id: 'no_https',
        title: 'The site does not use HTTPS',
        severity: 'high',
        description: 'The website is accessible over unencrypted HTTP, which allows attackers to intercept or modify data.',
        recommendation: 'Install an SSL certificate (e.g., Let\'s Encrypt) and redirect all traffic to HTTPS.'
      });
    }

    // 2. Check for Content-Security-Policy header
    if (!headers['content-security-policy']) {
      issues.push({
        id: 'missing_csp',
        title: 'Missing Content-Security-Policy (CSP)',
        severity: 'medium',
        description: 'CSP helps prevent XSS attacks by restricting which sources are allowed to load scripts and resources.',
        recommendation: 'Add a Content-Security-Policy header that only allows trusted domains.'
      });
    }

    // 3. Check for Strict-Transport-Security (HSTS)
    if (!headers['strict-transport-security']) {
      issues.push({
        id: 'missing_hsts',
        title: 'Missing Strict-Transport-Security (HSTS)',
        severity: 'medium',
        description: 'HSTS forces browsers to use HTTPS on future visits, improving transport security.',
        recommendation: 'Add a Strict-Transport-Security header with a long max-age and includeSubDomains if needed.'
      });
    }

    // 4. Check for X-Frame-Options header
    if (!headers['x-frame-options']) {
      issues.push({
        id: 'missing_xfo',
        title: 'Missing X-Frame-Options',
        severity: 'low',
        description: 'Without this header, the site can be embedded inside an iframe, allowing clickjacking attacks.',
        recommendation: 'Set X-Frame-Options to DENY or SAMEORIGIN.'
      });
    }

    // 5. Check for X-Content-Type-Options header
    if (!headers['x-content-type-options']) {
      issues.push({
        id: 'missing_xcto',
        title: 'Missing X-Content-Type-Options',
        severity: 'low',
        description: 'Without this header, browsers may guess MIME types incorrectly (MIME sniffing), enabling attacks.',
        recommendation: 'Add X-Content-Type-Options: nosniff to all static file responses.'
      });
    }

    // Final response returned to the client
    res.json({
      url: url,
      status: response.status,
      issues: issues
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch URL" });
  }
});   // <-- THIS was missing

// Server listener
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
