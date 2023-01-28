import Zillow from "../support/content/Zillow";

Zillow.hasPageLoaded().then(() => {
  let data = Zillow.scrapeWebPage();
  let listing = Zillow.buildFromPropertyData(data);
  listing.storeActiveFrontend();
});