
export const environment = {
  production: false,
  baseURL: '', // Use relative path so the same build works in Netlify and local environments.
  URL: '/assets/data', // Serve static JSON from bundled assets.
  storageURL: '/assets', // Serve static media from bundled assets.
  aiApiURL: 'http://127.0.0.1:5004',
};



//FOR HOSTING
// export const environment = {
//   production: false,
//   baseURL: 'https://dev-prt-justbill.itbycloud.com', // This represents the base URL for running our frontend project.
//   URL: 'https://dev-prt-justbill.itbycloud.com/assets/data', // Change only the domain part, keeping "/api" intact
//   storageURL: 'https://dev-prt-justbill.itbycloud.com/assets', // Change only the laravel primary domain
// };