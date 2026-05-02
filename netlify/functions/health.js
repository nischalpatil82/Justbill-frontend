const { proxyRequest } = require('./_proxy');

exports.handler = async (event) => proxyRequest(event, '/health');