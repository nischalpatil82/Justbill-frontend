const { proxyRequest } = require('./_proxy');

exports.handler = async (event) => {
  const jobId =
    (event.queryStringParameters && event.queryStringParameters.job_id) ||
    (event.path ? (event.path.match(/\/command-result\/(.+)$/) || [])[1] : null);

  if (!jobId) {
    return {
      statusCode: 400,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
      body: JSON.stringify({ error: 'missing job_id' }),
    };
  }

  return proxyRequest(event, `/command-result/${encodeURIComponent(jobId)}`, { timeoutMs: 10000 });
};