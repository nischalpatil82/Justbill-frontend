const { proxyRequest } = require('./_proxy');

exports.handler = async (event) => proxyRequest(event, '/voice-command', { timeoutMs: 60000 });