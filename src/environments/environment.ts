// This file can be replaced during build by using the `fileReplacements` array.
export const environment = {
  production: true,
  baseURL: 'http://127.0.0.1:4200', // Changed localhost -> 127.0.0.1
  URL: 'http://127.0.0.1:4200/assets/data', // Changed localhost -> 127.0.0.1
  storageURL: 'http://127.0.0.1:4200/assets', // Changed localhost -> 127.0.0.1
  aiApiURL: 'http://13.51.255.22',
};



//FOR HOSTING
// export const environment = {  
//   production: true,
//   baseURL: 'https://dev-prt-justbill.itbycloud.com', // This represents the base URL for running our frontend project.
//   URL: 'https://dev-prt-justbill.itbycloud.com/assets/data', // Change only the domain part, keeping "/api" intact
//   storageURL: 'https://dev-prt-justbill.itbycloud.com/assets', // Change only the laravel primary domain
// };