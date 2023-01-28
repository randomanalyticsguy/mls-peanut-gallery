import {runtime, storage, webRequest} from "webextension-polyfill";
import Listing from "./support/Listing";
import Zillow from "./support/content/zillow";

console.log("Hello from the background! Background change!");

let once = false;

let activeRequests:any = [];

webRequest.onBeforeRequest.addListener(
  (details) => {
    if(activeRequests.includes(details.url)){ // do nothing here globally
      return;
    }

    if(Zillow.matchesWebRequestFilter(details)){
      activeRequests.push(details.url)
      Zillow.replicateWebRequest(details).then(body => {
        console.log('resp', body)
        activeRequests = activeRequests.filter((r:any) => r !== details.url);

        let listing = Zillow.buildFromPropertyData(body.data.property);
        listing.storeActiveBackend();
      });
    }
  },
  {
    urls: ["https://www.zillow.com/graphql*"]
  }
)

// important to mirror the runtime out in case a listing is invoked from the webpage
runtime.onMessage.addListener((message:any, sender:any) => {
  if(message.command == 'store'){
    if(message.method === 'set'){
      storage.local.set(message.data)
    }
  }
})

storage.local.onChanged.addListener(changes => {
  console.log('general storage changes', changes)
  Listing.handleStorageChanges(changes)
})
