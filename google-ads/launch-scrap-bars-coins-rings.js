/**
 * Fine Jewellery Buyers — launch scrap gold / bars / coins / natural rings keywords
 * Paste into Google Ads > Tools > Bulk actions > Scripts, then Preview + Run
 */
function main() {
  var CAMPAIGN = 'Lead_Search_Campaign';
  var AD_GROUP = 'Fine Jewellery Buyers';

  var keywords = [
    // Scrap gold / sell gold London
    { text: 'sell scrap gold London', match: 'PHRASE', url: 'https://www.finejewellerybuyers.co.uk/sell-gold-london' },
    { text: 'sell gold London', match: 'PHRASE', url: 'https://www.finejewellerybuyers.co.uk/sell-gold-london' },
    { text: 'sell gold Hatton Garden', match: 'PHRASE', url: 'https://www.finejewellerybuyers.co.uk/sell-gold-london' },
    { text: 'scrap gold buyers London', match: 'PHRASE', url: 'https://www.finejewellerybuyers.co.uk/sell-gold-london' },
    { text: 'scrap gold Hatton Garden', match: 'PHRASE', url: 'https://www.finejewellerybuyers.co.uk/sell-gold-london' },
    { text: 'gold buyers Hatton Garden', match: 'PHRASE', url: 'https://www.finejewellerybuyers.co.uk/sell-gold-london' },
    { text: 'where to sell gold in London', match: 'PHRASE', url: 'https://www.finejewellerybuyers.co.uk/sell-gold-london' },
    { text: 'sell gold jewellery London', match: 'PHRASE', url: 'https://www.finejewellerybuyers.co.uk/sell-gold-london' },
    { text: 'sell broken gold London', match: 'PHRASE', url: 'https://www.finejewellerybuyers.co.uk/sell-gold-london' },
    { text: 'sell scrap gold London', match: 'EXACT', url: 'https://www.finejewellerybuyers.co.uk/sell-gold-london' },
    { text: 'sell gold London', match: 'EXACT', url: 'https://www.finejewellerybuyers.co.uk/sell-gold-london' },
    { text: 'sell gold Hatton Garden', match: 'EXACT', url: 'https://www.finejewellerybuyers.co.uk/sell-gold-london' },
    // Gold bars
    { text: 'sell gold bars London', match: 'PHRASE', url: 'https://www.finejewellerybuyers.co.uk/sell-gold-bars' },
    { text: 'sell gold bar Hatton Garden', match: 'PHRASE', url: 'https://www.finejewellerybuyers.co.uk/sell-gold-bars' },
    { text: 'gold bar buyers London', match: 'PHRASE', url: 'https://www.finejewellerybuyers.co.uk/sell-gold-bars' },
    { text: 'sell gold bullion London', match: 'PHRASE', url: 'https://www.finejewellerybuyers.co.uk/sell-gold-bars' },
    { text: 'sell gold bars London', match: 'EXACT', url: 'https://www.finejewellerybuyers.co.uk/sell-gold-bars' },
    // Gold coins
    { text: 'sell gold coins London', match: 'PHRASE', url: 'https://www.finejewellerybuyers.co.uk/sell-gold-coins' },
    { text: 'sell sovereign coins London', match: 'PHRASE', url: 'https://www.finejewellerybuyers.co.uk/sell-gold-coins' },
    { text: 'sell gold sovereign Hatton Garden', match: 'PHRASE', url: 'https://www.finejewellerybuyers.co.uk/sell-gold-coins' },
    { text: 'gold coin buyers London', match: 'PHRASE', url: 'https://www.finejewellerybuyers.co.uk/sell-gold-coins' },
    { text: 'sell Britannia gold coin', match: 'PHRASE', url: 'https://www.finejewellerybuyers.co.uk/sell-gold-coins' },
    { text: 'sell Krugerrand London', match: 'PHRASE', url: 'https://www.finejewellerybuyers.co.uk/sell-gold-coins' },
    { text: 'sell gold coins London', match: 'EXACT', url: 'https://www.finejewellerybuyers.co.uk/sell-gold-coins' },
    // Natural engagement rings
    { text: 'sell engagement ring London', match: 'PHRASE', url: 'https://www.finejewellerybuyers.co.uk/sell-jewellery-hatton-garden' },
    { text: 'sell diamond engagement ring London', match: 'PHRASE', url: 'https://www.finejewellerybuyers.co.uk/sell-jewellery-hatton-garden' },
    { text: 'sell natural diamond ring London', match: 'PHRASE', url: 'https://www.finejewellerybuyers.co.uk/sell-jewellery-hatton-garden' },
    { text: 'sell diamond ring Hatton Garden', match: 'PHRASE', url: 'https://www.finejewellerybuyers.co.uk/sell-jewellery-hatton-garden' },
    { text: 'engagement ring buyers London', match: 'PHRASE', url: 'https://www.finejewellerybuyers.co.uk/sell-jewellery-hatton-garden' },
    { text: 'sell natural diamond engagement ring', match: 'PHRASE', url: 'https://www.finejewellerybuyers.co.uk/sell-jewellery-hatton-garden' },
    { text: 'sell engagement ring London', match: 'EXACT', url: 'https://www.finejewellerybuyers.co.uk/sell-jewellery-hatton-garden' }
  ];

  var negatives = [
    'pawn', 'pawnbroker', 'pawn shop', 'cash converters',
    'jewelry', 'lab grown', 'lab-grown', 'synthetic diamond',
    'cheap', 'ebay', 'gumtree', 'we buy any gold',
    'hatton jewellers', 'hatton jewels', 'hatton garden jewellers',
    'buy gold', 'gold price', 'spot price', 'jobs', 'salary', 'course'
  ];

  var campaignIterator = AdsApp.campaigns()
    .withCondition("Name = '" + CAMPAIGN + "'")
    .get();
  if (!campaignIterator.hasNext()) {
    Logger.log('Campaign not found: ' + CAMPAIGN);
    return;
  }
  var campaign = campaignIterator.next();
  campaign.enable();

  var agIterator = campaign.adGroups()
    .withCondition("Name = '" + AD_GROUP + "'")
    .get();
  if (!agIterator.hasNext()) {
    Logger.log('Ad group not found: ' + AD_GROUP);
    return;
  }
  var adGroup = agIterator.next();
  adGroup.enable();

  // Pause weak / US / cash-for keywords still eligible
  var pauseTexts = [
    'sell gold for cash', 'cash for jewellery', 'cash for jewelry',
    'sell jewelry for cash', 'sell your jewelry online', 'sell my jewelry online',
    'sell jewellery for cash near me', 'hatton jewellers london',
    'sell gold', // too broad — replaced by London/scrap phrases
    'we buy gold', 'cash for gold'
  ];
  var kwIter = adGroup.keywords().get();
  while (kwIter.hasNext()) {
    var kw = kwIter.next();
    var t = kw.getText().toLowerCase().replace(/^\[|\]$/g, '').replace(/^"|"$/g, '');
    for (var p = 0; p < pauseTexts.length; p++) {
      if (t === pauseTexts[p].toLowerCase()) {
        kw.pause();
        Logger.log('Paused: ' + kw.getText());
        break;
      }
    }
  }

  // Add new keywords
  var added = 0;
  for (var i = 0; i < keywords.length; i++) {
    var k = keywords[i];
    var op = adGroup.newKeywordBuilder()
      .withText(k.match === 'EXACT' ? '[' + k.text + ']' : '"' + k.text + '"')
      .withFinalUrl(k.url)
      .build();
    if (op.isSuccessful()) {
      added++;
    } else {
      Logger.log('Skip/fail: ' + k.text + ' — ' + op.getErrors().join('; '));
    }
  }
  Logger.log('Keywords added: ' + added);

  // Campaign-level negatives
  for (var n = 0; n < negatives.length; n++) {
    campaign.createNegativeKeyword(negatives[n]);
  }
  Logger.log('Negatives applied: ' + negatives.length);
  Logger.log('Done. Lead_Search_Campaign enabled with scrap/bars/coins/rings focus.');
}
