import BaseListing, { ListingInterface } from "../Listing";

export default class Zillow extends BaseListing implements ListingInterface {
  static site = 'Zillow';
  
  constructor(settings:ListingInterface){
    settings.site = Zillow.site;
    super(settings)
  }

  static hasPageLoaded() {
    return new Promise((r, j) => {
      if(!document){
        j();
      }
      let hdp:any = document.getElementById('hdpApolloPreloadedData');
      let next:any = document.getElementById('__NEXT_DATA__'); // did they literally just change something?

      
      if(!hdp && !next){
        setTimeout(() => {
          Zillow.hasPageLoaded().then(d => {
            console.log(d)
            r(d)
          })
        }, 50)
      }

      if(hdp){
        r(hdp)
      }

      if(next){ // there is some really weird next progression thing that's possible and I haven't been able to implement it yet
        console.log(next)
      }
    })
  }

  static matchesWebRequestFilter(details:any){ // expects web request details
    return details.url.includes('operationName=ForSaleShopperPlatformFullRenderQuery')
  }

  static async replicateWebRequest(details:any){
    let url = new URL(details.url)
    let payload = {
      clientVersion: "home-details/6.1.1838.master.5845ab4",
      operationName: url.searchParams.get('operationName'),
      queryId: url.searchParams.get('queryId'),
      variables: {
        zpid: url.searchParams.get('zpid'),
        contactFormRenderParameter: {
          isDoubleScroll: true,
          platform: 'desktop',
          zpid: url.searchParams.get('zpid')
        }
      }
    }
    let res = await fetch(details.url, {
      method: 'POST',
      headers: {
        'Content-Type': "application/json"
      },
      body: JSON.stringify(payload)
    })
    let json = await res.json()
    return json;
  }

  static scrapeWebPage(){
    if(!document){
      return
    }
    
    let data:any = document.getElementById('hdpApolloPreloadedData')?.innerHTML
    data = data ? JSON.parse(data) : false;
    data = data.hasOwnProperty('apiCache') ? JSON.parse(data.apiCache) : false;
    
    data = Object.values(data).filter((datum:any) => datum.hasOwnProperty('viewer'))[0]
    data = data.hasOwnProperty('property') ? data.property : false;

    return data;
  }

  static buildFromPropertyData(property:any){ // expects the property graphql res
    console.log("building from prop data", property)
    return new Zillow({
      site: Zillow.site,
      url: "https://zillow.com" + property.hdpUrl,
      retrieved: new Date(),
      address: `${property.address.streetAddress}, ${property.address.city}, ${property.address.state} `,
      mls: property.mlsid,
      bd: property.bedrooms,
      ba: property.bathrooms,
      mainImage: property.hiResImageLink,
      images: property.photos.map((photo:any) => {
        return {
          url: photo.mixedSources.jpeg.sort((a:any, b:any) => b.width - a.width)[0].url
        }
      }),
      sqft: property.livingAreaValue,
      year_built: property.yearBuilt,
      price: property.price,
      description: property.description
    })
  }
}