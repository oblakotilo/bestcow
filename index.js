const http = require('http');
const https = require('https');
const { parse } = require('url');

const get_api_url = (id, key) => `https://www.googleapis.com/youtube/v3/videos?id=${id}&key=${key}&part=statistics`;

function handle_request(id, resolve, reject) {
  https
    .get(get_api_url(id, process.env.API_KEY), (res) => {
      let rawData = '';

      res.setEncoding('utf8');

      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);

          resolve(parsedData.items[0].statistics);
        } catch (e) {
          reject(e);
        }
      });
    })
    .on('error', reject);
}

exports.cow = async (req, res) => {
  const { query: { id } } = parse(req.url, true);

  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }

  try {
    const result = await new Promise((resolve, reject) => handle_request(id, resolve, reject));

    res.end(JSON.stringify(result));
  } catch (error) {
    console.log(error)

    res.end();
  }
};
