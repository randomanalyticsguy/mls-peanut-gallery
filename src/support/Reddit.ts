import { Buffer } from 'buffer';
import { storage, identity } from 'webextension-polyfill';
import Listing from './Listing';

export default class Reddit {

  static app_client_id = "diz0vEIY6acv3Jh8BrAAXg"
  static user_agent = `bot:[${Reddit.app_client_id}]:v0.0.1 (by /r/MLSPeanutGallery)`
  static app_redirect_uri = "https://mgbjgjpjidnodhjochgaceidabklppde.chromiumapp.org/reddit_oauth"
  static storage_keys = {
    refresh: "reddit_oauth_refresh",
    access: "reddit_oauth_access",
    expires: "reddit_oauth_expires"
  }

  static async auth(){
    const codeResp = await identity.launchWebAuthFlow({
      url: `https://www.reddit.com/api/v1/authorize?client_id=${Reddit.app_client_id}&response_type=code&state=reddit&redirect_uri=${Reddit.app_redirect_uri}&duration=permanent&scope=identity,read,submit`,
      interactive: true
    })

    const codeUrl = new URL(codeResp);

    console.log("codeResp", codeResp)

    const tokenResp = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(Reddit.app_client_id + ':').toString('base64')}`
      },
      body: `grant_type=authorization_code&code=${codeUrl.searchParams.get('code')}&redirect_uri=${Reddit.app_redirect_uri}`
    })

    const tokenRespJson = await tokenResp.json()

    console.log("tokenResp", tokenRespJson)

    Reddit.storeTokenResp(tokenRespJson);

    return true;
  }

  static async logout(){
    // todo - logout https://github.com/reddit-archive/reddit/wiki/OAuth2#manually-revoking-a-token
    await storage.local.clear();
  }

  static async isAuthed(){
    return await Reddit.refresh_token !== undefined;
  }

  async refreshAccessToken(){
    const tokenResp = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(Reddit.app_client_id + ':').toString('base64')}`
      },
      body: `grant_type=refresh_token&refresh_token=${await Reddit.refresh_token}`
    })
    const tokenRespJson = await tokenResp.json()

    Reddit.storeTokenResp(tokenRespJson);

    return tokenRespJson.access_token;
  }

  async hasListing(listing:Listing) {
    const redditResp = await fetch(`https://oauth.reddit.com/r/MLSPeanutGallery/search?q=${listing.mls}&restrict_sr=true&t=all`, {
      headers: {
        'Authorization': `Bearer ${await this.access_token}`
      }
    })
    let js = await redditResp.json()
    console.log("was found?", js)
    if(js.data.children.length == 1){
      return js.data.children[0];
    } else {
      return false;
    }
  }

  async post(listing:Listing){
    // TODO: needs support for single-image listings

    console.log(listing)
    console.log(listing.requiredOPComment);

    // have to splice for redd
    const REDDIT_MAX_IMAGES_IN_GALLERY = 20;
    let imgs = listing.images.splice(0, REDDIT_MAX_IMAGES_IN_GALLERY).map((img:any) => {
      return new Promise(async (r, j) => {
        if(img == undefined){
          j("No image");
        }
        const { webSocketUrl, assetID } = await this.uploadMediaFile(img.url);
        if(listing !== undefined){
          r({
            "media_id": assetID,
            "outbound_url": listing.url
          })
        }
      })
    })

    // thank you praw <3
    let data = {
      "api_type": "json",
      "items": await Promise.all(imgs),
      "nsfw": false,
      "sendreplies": false,
      "show_error_list": true,
      "spoiler": false,
      "sr": "mlspeanutgallery",
      "title": listing.title,
      "validate_on_submit": false,
      "resubmit": false
    }

    const postResp = await fetch("https://oauth.reddit.com/api/submit_gallery_post.json", {
      method: 'POST',
      headers: {
        'Content-Type': 'text/json',
        'Authorization': `Bearer ${await this.access_token}`
      },
      body: JSON.stringify(data)
    })

    console.log(postResp)

    let rs = await postResp.json();

    console.log(rs)
    if(rs.json.errors.length == 0){ // now we need to post the obligatory top comment
      let postID = rs.json.data.id;
      console.log(postID)

      const commentResp = await fetch("https://oauth.reddit.com/api/comment", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${await this.access_token}`
        },
        body: `thing_id=${postID}&text=${listing.requiredOPComment}`
      })

      console.log(commentResp)

      let crs = await commentResp.json();
      console.log(crs)
    }
  }

  static get refresh_token():any|string|undefined{
    return new Promise(async (r, j) => {
      let stored = await storage.local.get(Reddit.storage_keys.refresh);
      r(stored[Reddit.storage_keys.refresh])
    })
  }

  get access_token(){
    return new Promise(async (r, j) => {
      let stored = await storage.local.get(Object.values(Reddit.storage_keys));

      // every value must be present, otherwise refresh
      if(!Object.values(Reddit.storage_keys).every(key => stored.hasOwnProperty(key))){
        console.error(stored)
        j("Not all storage properties were present")
      }

      let token = stored[Reddit.storage_keys.access];
  
      if((new Date(stored[Reddit.storage_keys.expires]).getTime() <= (new Date()).getTime() - 1000)){
        // let's automatically refresh it here.
        token = await this.refreshAccessToken()
      }

      r(token)
    })
  }

  static storeTokenResp(tokenResp:{
    "access_token": string,
    "token_type": string,
    "expires_in": number,
    "scope": string,
    "refresh_token"?: string
  }){
    let expire_in = tokenResp.expires_in - 10;
    expire_in = expire_in > 0 ? expire_in : 0;
    let expire_at = (new Date()).getTime() + (expire_in * 1000);

    storage.local.set({
      [Reddit.storage_keys.access]: tokenResp.access_token,
      [Reddit.storage_keys.expires]: expire_at
    })

    if(tokenResp.refresh_token){
      storage.local.set({
        [Reddit.storage_keys.refresh]: tokenResp.refresh_token
      })
    }
  }

  // a TON of this is pulled from https://github.com/VityaSchel/reddit-api-image-upload/'
  // VityaSchel made my life seriously easier so mad ups to him
  async uploadMediaFile(url:string){
    // first grab the file
    let filename = extractFilenameFromUrl(url);
    if(!filename){
      throw 'Could not extract filename from url.'
    }

    let file = await fetch(url).then(res => res.blob());
    let mimetype = file.type;

    const { uploadURL, fields, listenWSUrl, assetID } = await this.obtainMediaUploadURL(filename, mimetype)

    /*
    let p = new Promise((r, j) => {
      const connection = new WebSocket(listenWSUrl)
      connection.onopen = () => {
        console.log('open')
      }

      connection.onerror = error => {
        console.log(`WebSocket error: ${error}`)
      }

      connection.onmessage = e => {
        console.log(e.data)
        connection.close()
        r(e.data);
      }
    })
    */

    await this.uploadToAWS(uploadURL, fields, file, filename) // since we use no-cors we have to blind upload

    return { webSocketUrl: listenWSUrl, assetID};
  }

  async uploadToAWS(uploadURL:string, fields:any, blob:any, filename:string) {
    const bodyForm = new FormData();
    fields.forEach((field:any) => {
      bodyForm.append(field.name, field.value)
    })
    bodyForm.append('file', blob, filename)

    const responseRaw = await fetch(uploadURL, {
      method: 'POST',
      mode: 'no-cors',
      body: bodyForm
    })
    
    // since we have to use no-cors, all we can do is await a response
    // we have to rely on the websocket url to know when it's finally done uploading
    return true;
  }

  async obtainMediaUploadURL(filename:string, mimetype:string){
    const bodyForm = new FormData();
    bodyForm.append('filepath', filename);
    bodyForm.append('mimetype', mimetype);

    const uploadURLResponseRaw = await fetch('https://oauth.reddit.com/api/media/asset.json', {
      method: 'POST',
      body: bodyForm,
      headers: {
        Authorization: `Bearer ${await this.access_token}`,
        'User-Agent': Reddit.user_agent
      }
    })
    
    const uploadURLResponse = await uploadURLResponseRaw.json();

    console.log(uploadURLResponse)

    try {
      const assetID = uploadURLResponse.asset.asset_id
      const uploadURL = `https:${uploadURLResponse.args.action}`;
      const fields = uploadURLResponse.args.fields
      const listenWSUrl = uploadURLResponse.asset.websocket_url

      return { uploadURL, fields, listenWSUrl, assetID }
    } catch (e) {
      console.error('Reddit API response:', uploadURLResponse)
      throw e;
    }
  }


}

const extractFilenameFromUrl = (url:string) => {
  let split = url.split('/fp/');
  let filename;
  if(split.length > 0){
    filename = split.pop()?.split('.')[0];
  }
  return filename;
}