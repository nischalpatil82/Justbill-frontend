const { proxyRequest } = require('./_proxy');

exports.handler = async (event) => proxyRequest(event, '/command-async', { timeoutMs: 10000 });