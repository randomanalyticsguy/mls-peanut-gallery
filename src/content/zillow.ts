import Zillow from "../support/content/Zillow";

Zillow.hasPageLoaded().then(() => {
  console.log("huh?")
  let data = Zillow.scrapeWebPage();
  let listing = Zillow.buildFromPropertyData(data);
  listing.storeActiveFrontend();
});