/**
 * Google Ads Script — pause everything except top UK seller keywords
 * Tools → Scripts → New → paste → Preview → Run
 * Campaign: Lead_Search_Campaign / Ad group: Fine Jewellery Buyers
 */
function main() {
  var KEEP = {
    'sell scrap gold london': true,
    'sell gold london': true,
    'sell gold hatton garden': true,
    'scrap gold buyers london': true,
    'scrap gold hatton garden': true,
    'gold buyers hatton garden': true,
    'where to sell gold in london': true,
    'sell gold jewellery london': true,
    'sell gold bars london': true,
    'sell gold bar hatton garden': true,
    'sell gold bullion london': true,
    'sell gold coins london': true,
    'gold coin buyers london': true,
    'sell britannia gold coin': true,
    'sell krugerrand london': true,
    'sell gold sovereign hatton garden': true,
    'sell engagement ring london': true,
    'sell diamond ring hatton garden': true,
    'sell natural diamond engagement ring': true
  };

  var iter = AdsApp.keywords()
    .withCondition("CampaignName = 'Lead_Search_Campaign'")
    .withCondition("AdGroupName = 'Fine Jewellery Buyers'")
    .withCondition("Status = ENABLED")
    .get();

  var paused = 0;
  var kept = 0;
  while (iter.hasNext()) {
    var kw = iter.next();
    var text = (kw.getText() || '').toLowerCase().replace(/["\\[\\]]/g, '').trim();
    if (KEEP[text]) {
      kept++;
      continue;
    }
    kw.pause();
    paused++;
    Logger.log('Paused: ' + kw.getText());
  }
  Logger.log('Kept enabled: ' + kept + ' | Paused: ' + paused);
}
