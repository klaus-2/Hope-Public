const list = new Intl.ListFormat('en');
// All functions returned from this module will now be in string format

// TextTruncate -> Shortens the string to desired length
function textTruncate(str = '', length = 100, end = '...'){
  return String(str).substring(0, length - end.length) + (str.length > length ? end : '');
};

// extends textTruncate function -> lesser length
function truncate(...options){
  return textTruncate(...options);
};

// Appends ordinal suffixes to input numbers. Max input before failing is 10e307
function ordinalize(n = 0){
  return Number(n)+[,'º','º','º'][n/10%10^1&&n%10]||Number(n)+'º'; //return Number(n)+[,'st','nd','rd'][n/10%10^1&&n%10]||Number(n)+'th';
};

// Converts number to string and adds a comma separator
function commatize(number, maximumFractionDigits = 2){
  return Number(number || '')
  .toLocaleString('en-US', { maximumFractionDigits });
};

// Converts a number to a stringified compact version
function compactNum(number, maximumFractionDigits = 2){
  return Number(number || '')
  .toLocaleString('en-US', {
    notation: 'compact', maximumFractionDigits
  });
};

// Joins array via oxford comma and append 'and' on last 2 items
function joinArray(array = []){
  return list.format(array.map(x => String(x)));
};

// Join array and add a limiter
function joinArrayAndLimit(array = [], limit = 1000, connector = '\n'){
  return array.reduce((a,c,i,x) => a.text.length + String(c).length > limit
  ? { text: a.text, excess: a.excess + 1 }
  : { text: a.text + (!!i ? connector : '') + String(c), excess: a.excess }
  , { text: '', excess: 0});
};

// cleans text from unnecessary character
function clean(text){
  return String(text).replace(/`/g, `\`${String.fromCharCode(8203)}`).replace(/@/g, `@${String.fromCharCode(8203)}`)
};

module.exports = {
  textTruncate,
  truncate,
  ordinalize,
  commatize,
  compactNum,
  joinArray,
  joinArrayAndLimit,
  clean
};
