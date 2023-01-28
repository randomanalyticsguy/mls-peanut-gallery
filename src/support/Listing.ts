import { runtime, storage, notifications } from "webextension-polyfill";

export interface ListingImageInterface {
  url: string
}

export interface ListingInterface {
  address: string,
  url: string,
  site: string,
  mls: string,
  mainImage: string,
  images: Array<ListingImageInterface>,
  bd: number,
  ba: number,
  sqft: number,
  year_built: number,
  retrieved: Date,
  price: number,
  description: string
}

export default class Listing implements ListingInterface {
  retrieved;
  site;
  url;
  address;
  mls;
  bd;
  ba;
  mainImage;
  images;
  sqft;
  year_built;
  price;
  description;

  static storage_keys = {
    active: "active_listing"
  }

  constructor(settings:ListingInterface){
    this.retrieved = new Date();
    this.site = settings.site;
    this.url = settings.url;
    this.address = settings.address;
    this.mls = settings.mls;
    this.bd = settings.bd;
    this.ba = settings.ba;
    this.mainImage = settings.mainImage;
    this.images = settings.images;
    this.sqft = settings.sqft;
    this.year_built = settings.year_built;
    this.price = settings.price;
    this.description = settings.description;
  }

  storeActiveFrontend(){
    console.log("store frontend")
    runtime.sendMessage({
      command: 'store',
      method: 'set',
      data: {
        [Listing.storage_keys.active]: this
      }
    })
  }

  storeActiveBackend(){
    console.log("store backend")
    storage.local.set({
      [Listing.storage_keys.active]: this
    })
  }

  storeActive(){
    console.log("store active")
    runtime.sendMessage({
      command: 'store',
      method: 'set',
      data: {
        [Listing.storage_keys.active]: this
      }
    })
    
  }

  get title(){ // reddit interface
    return `${this.address} | MLS#${this.mls}`
  }

  get requiredOPComment(){ // reddit interface
    return `## Stats
|Name|Value|
|-----|-----|
|Built|${this.year_built}|
|Sq. Ft.|${this.sqft}|
|Bedrooms|${this.bd}|
|Bathrooms|${this.ba}|
|Price|${this.price}|

## Description
> ${this.description}

The original listing can be found [here](${this.url}).

*All information listed as of the date of this comment.`;
  }

  static async has_active_listing(){
    return await Listing.active_listing !== undefined;
  }

  static get active_listing():Promise<Listing>{
    return new Promise(async (r, j) => {
      let stored = await storage.local.get(Listing.storage_keys.active)
      if(!stored.hasOwnProperty('active_listing')){
        j(undefined)
      } else {
        r(new Listing(stored.active_listing))
      }
    })
  }

  static async handleStorageChanges(changes:any){
    if(!changes.hasOwnProperty(Listing.storage_keys.active)){
      return;
    }

    let listing = new Listing(changes[Listing.storage_keys.active]);

    notifications.create(listing.mls, {
      title: 'Listing identified!',
      iconUrl: runtime.getURL('icon/128.png'),
      message: "Open the MLS Peanut Gallery extension to post the extension to the subreddit, or view other users' comments.",
      type: 'basic'
    })

    /*
    changes = changes[Listing.storage_keys.active];
    let listing = new Listing(changes.newValue);
    let reddit = new Reddit();
    let isAuthed = await reddit.isAuthed()
    if(!isAuthed){
      console.log("ERR NOT AUTH INTO REDDIT")
    }

    let hasListing = await reddit.hasListing(listing);
    if(!hasListing){
      console.log("listing not found")
      
    } else {
      
    }

    console.log(listing);
    */

    /*
    return changes.filter((change:any) => {
      console.log(change)
      return true;
    })
    */
    // return changes;
  }

/*
  static subscribeActive(cb:Function){
    storage.local.onChanged.addListener(changes => {
      console.log(changes)
      if(changes[Listing.storage_keys.active]){
        cb(this)
      }
    })
  }
*/
}