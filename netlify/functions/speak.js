const { proxyRequest } = require('./_proxy');

exports.handler = async (event) => proxyRequest(event, '/speak', { binary: true, timeoutMs: 30000 });