// Keep game assets under the app directory, including GitHub Pages project paths.
export function assetUrl(url:string){
 if(!url.startsWith('/'))return url;
 return import.meta.env.BASE_URL+url.slice(1);
}
