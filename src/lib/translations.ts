export type Lang = 'en' | 'hi';

export const T = {
  // ── Portal ────────────────────────────────────────────────────────────────
  portalName:    { en: 'Power Distribution Monitoring Portal', hi: 'विद्युत वितरण निगरानी पोर्टल' },
  orgName:       { en: 'State Power Distribution Company Ltd. (Demo)', hi: 'राज्य विद्युत वितरण कंपनी लि. (डेमो)' },
  subLine:       { en: 'Renewable Energy Supply Management', hi: 'नवीकरणीय ऊर्जा आपूर्ति प्रबंधन' },

  // ── Nav ───────────────────────────────────────────────────────────────────
  navHome:       { en: 'Home',               hi: 'होम' },
  navAreas:      { en: 'Area-wise Status',   hi: 'क्षेत्रवार स्थिति' },
  navAdjust:     { en: 'Adjust Supply',      hi: 'आपूर्ति समायोजित करें' },
  navForecast:   { en: 'Demand Forecast',    hi: 'मांग पूर्वानुमान' },
  navNotices:    { en: 'Notices & Records',  hi: 'सूचनाएँ और अभिलेख' },
  navHelp:       { en: 'Help',               hi: 'सहायता' },
  menu:          { en: 'Menu',               hi: 'मेनू' },

  // ── Utility bar ───────────────────────────────────────────────────────────
  skipToMain:    { en: 'Skip to main content', hi: 'मुख्य सामग्री पर जाएँ' },
  textSize:      { en: 'Text size',            hi: 'पाठ आकार' },
  highContrast:  { en: 'High contrast',        hi: 'उच्च कंट्रास्ट' },
  langSwitch:    { en: 'हिन्दी',               hi: 'English' },
  lastUpdated:   { en: 'Last updated',         hi: 'अंतिम अद्यतन' },
  today:         { en: 'Today',                hi: 'आज' },
  logout:        { en: 'Logout',               hi: 'लॉगआउट' },

  // ── Status ────────────────────────────────────────────────────────────────
  normal:        { en: 'Normal',          hi: 'सामान्य' },
  warn:          { en: 'Needs attention', hi: 'ध्यान चाहिए' },
  urgent:        { en: 'Urgent',          hi: 'अत्यावश्यक' },

  // ── KPI labels ────────────────────────────────────────────────────────────
  powerNeeded:   { en: 'Power needed right now',   hi: 'अभी आवश्यक बिजली' },
  powerAvailable:{ en: 'Power available right now', hi: 'अभी उपलब्ध बिजली' },
  spareCap:      { en: 'Spare capacity',            hi: 'अतिरिक्त क्षमता' },
  battCharge:    { en: 'Battery charge left',       hi: 'बैटरी चार्ज शेष' },
  areasAttention:{ en: 'Areas needing attention',   hi: 'ध्यान देने योग्य क्षेत्र' },

  // ── Plain language ────────────────────────────────────────────────────────
  powerGiven:    { en: 'Power given',                       hi: 'दी गई बिजली' },
  powerNeededArea:{ en: 'Power the area needs right now',   hi: 'क्षेत्र को अभी आवश्यक बिजली' },
  safeMax:       { en: 'Most power that can safely be given', hi: 'सुरक्षित रूप से दी जा सकने वाली अधिकतम बिजली' },
  shareOfLimit:  { en: 'Share of limit in use',             hi: 'सीमा का उपयोगित हिस्सा' },
  spareSupply:   { en: 'Spare supply in system',            hi: 'सिस्टम में अतिरिक्त आपूर्ति' },
  changeAutoPlan:{ en: 'Change the automatic plan',         hi: 'स्वचालित योजना बदलें' },
  recordOfChanges:{ en: 'Record of changes',                hi: 'परिवर्तनों का अभिलेख' },

  // ── Sources ───────────────────────────────────────────────────────────────
  solar:         { en: 'Solar',           hi: 'सौर' },
  hydro:         { en: 'Hydro',           hi: 'जल विद्युत' },
  thermal:       { en: 'Thermal / non-renewable', hi: 'तापीय / गैर-नवीकरणीय' },
  battery:       { en: 'Battery storage', hi: 'बैटरी भंडारण' },

  // ── Common ────────────────────────────────────────────────────────────────
  loading:       { en: 'Loading…',        hi: 'लोड हो रहा है…' },
  noData:        { en: 'No data.',         hi: 'कोई डेटा नहीं।' },
  error:         { en: 'An error occurred. Please refresh the page.', hi: 'एक त्रुटि हुई। कृपया पृष्ठ ताज़ा करें।' },
  viewDetails:   { en: 'View Details',     hi: 'विवरण देखें' },
  viewAll:       { en: 'Show all',         hi: 'सभी दिखाएँ' },
  showTop10:     { en: 'Top 10',           hi: 'शीर्ष 10' },
  apply:         { en: 'Apply',            hi: 'लागू करें' },
  adjustManual:  { en: 'Adjust manually',  hi: 'मैन्युअल रूप से समायोजित करें' },
  confirm:       { en: 'Confirm',          hi: 'पुष्टि करें' },
  cancel:        { en: 'Cancel',           hi: 'रद्द करें' },
  goBack:        { en: 'Go Back',          hi: 'वापस जाएँ' },
  download:      { en: 'Download as CSV',  hi: 'CSV के रूप में डाउनलोड करें' },
  acknowledge:   { en: 'Acknowledge',      hi: 'स्वीकार करें' },
  acknowledgeAll:{ en: 'Acknowledge all',  hi: 'सभी स्वीकार करें' },
  goToArea:      { en: 'Go to area',       hi: 'क्षेत्र पर जाएँ' },
  adjustSupply:  { en: 'Adjust supply',    hi: 'आपूर्ति समायोजित करें' },
  search:        { en: 'Search area…',     hi: 'क्षेत्र खोजें…' },
  showForecast:  { en: 'Show Forecast',    hi: 'पूर्वानुमान दिखाएँ' },
  submit:        { en: 'Submit',           hi: 'जमा करें' },
  undo:          { en: 'Undo this change', hi: 'यह परिवर्तन पूर्ववत करें' },
  emergencyBoost:{ en: 'Emergency Supply Boost', hi: 'आपातकालीन आपूर्ति बूस्ट' },
  requestDemandReduction: { en: 'Request demand reduction', hi: 'मांग कम करने का अनुरोध' },

  // ── Table columns ─────────────────────────────────────────────────────────
  colSr:         { en: 'Sr.', hi: 'क्र.' },
  colArea:       { en: 'Area', hi: 'क्षेत्र' },
  colUsed:       { en: 'Power used (MW)', hi: 'उपयोग (MW)' },
  colLimit:      { en: 'Limit (MW)', hi: 'सीमा (MW)' },
  colShare:      { en: 'Share of limit', hi: 'सीमा का हिस्सा' },
  colTrend:      { en: 'Trend', hi: 'रुझान' },
  colStatus:     { en: 'Status', hi: 'स्थिति' },
  colView:       { en: 'View', hi: 'देखें' },
  colRefNo:      { en: 'Ref. No.', hi: 'संदर्भ सं.' },
  colDateTime:   { en: 'Date & Time', hi: 'दिनांक और समय' },
  colOld:        { en: 'Old (MW)', hi: 'पुराना (MW)' },
  colNew:        { en: 'New (MW)', hi: 'नया (MW)' },
  colReason:     { en: 'Reason', hi: 'कारण' },
  colDuration:   { en: 'Duration', hi: 'अवधि' },
  colDoneBy:     { en: 'Done by', hi: 'किसने किया' },
  colSource:     { en: 'Source', hi: 'स्रोत' },
  colType:       { en: 'Type', hi: 'प्रकार' },
  colMessage:    { en: 'Message', hi: 'संदेश' },
  colRaisedAt:   { en: 'Raised at', hi: 'उठाया गया' },
  colStatusCol:  { en: 'Status', hi: 'स्थिति' },
  colAction:     { en: 'Action', hi: 'कार्रवाई' },

  // ── Forecast ──────────────────────────────────────────────────────────────
  forecastTitle: { en: 'Expected Power Demand', hi: 'अपेक्षित विद्युत मांग' },
  wholeSystem:   { en: 'Whole system',  hi: 'संपूर्ण सिस्टम' },
  singleArea:    { en: 'Single area',   hi: 'एक क्षेत्र' },
  next6h:        { en: 'Next 6 hours',  hi: 'अगले 6 घंटे' },
  next24h:       { en: 'Next 24 hours', hi: 'अगले 24 घंटे' },
  next48h:       { en: 'Next 48 hours', hi: 'अगले 48 घंटे' },
  howMetTitle:   { en: 'How this demand will be met', hi: 'यह मांग कैसे पूरी होगी' },

  // ── Notices ───────────────────────────────────────────────────────────────
  noticesTitle:  { en: 'Notices', hi: 'सूचनाएँ' },
  recordsTitle:  { en: 'Record of Changes', hi: 'परिवर्तनों का अभिलेख' },
  noticeUrgent:  { en: 'Urgent', hi: 'अत्यावश्यक' },
  noticeAdvisory:{ en: 'Advisory', hi: 'परामर्शी' },
  statusOpen:    { en: 'Open', hi: 'खुला' },
  statusAckd:    { en: 'Acknowledged', hi: 'स्वीकृत' },
  statusResolved:{ en: 'Resolved', hi: 'समाधान हुआ' },

  // ── Help ──────────────────────────────────────────────────────────────────
  helpTitle:     { en: 'Help & Support',   hi: 'सहायता और समर्थन' },
  faq:           { en: 'Frequently Asked Questions', hi: 'अक्सर पूछे जाने वाले प्रश्न' },
  userGuide:     { en: 'User Guide',        hi: 'उपयोगकर्ता मार्गदर्शिका' },
  contact:       { en: 'Contact',           hi: 'संपर्क' },
  accessStmt:    { en: 'Accessibility Statement', hi: 'अभिगम्यता वक्तव्य' },

  // ── Improvement ───────────────────────────────────────────────────────────
  improvTitle:   { en: 'Improvement with this system (from simulation)', hi: 'इस प्रणाली से सुधार (सिमुलेशन से)' },
  outageAvoided: { en: 'Hours without power avoided', hi: 'बिजली कटौती के घंटे बचाए' },
  energySaved:   { en: 'Unserved energy avoided', hi: 'बिना आपूर्ति ऊर्जा बचाई' },
  thermalReduced:{ en: 'Thermal power reduced', hi: 'तापीय बिजली में कमी' },
  co2Avoided:    { en: 'CO₂ avoided', hi: 'CO₂ बचाई गई' },
} as const;

export type TKey = keyof typeof T;

/** Returns the string for a given key and language */
export function t(key: TKey, lang: Lang): string {
  return T[key][lang];
}

/** Template replacement helper */
export function tf(key: TKey, lang: Lang, vars: Record<string, string | number>): string {
  let s = t(key, lang);
  for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}
