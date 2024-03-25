export function result_cache_today_key_base() {
  let today = new Date().toISOString().split('T')[0];
  return `result_cache-${today}`;
}
export function result_cache_today_key_for_stock(stock) {
  return `${result_cache_today_key_base()}-${stock}`;
}
export function result_cache_key_today(ticker, section) {
  return `${result_cache_today_key_for_stock(ticker)}-${section}`;
}
export function result_cache_set(ticker, section, value) {
  localStorage.setItem(result_cache_key_today(ticker, section), value);
}
export function result_cache_has_key(ticker, section) {
  return localStorage.getItem(result_cache_key_today(ticker, section)) != null;
}
export function result_cache_get(ticker, section) {
  return localStorage.getItem(result_cache_key_today(ticker, section));
}
export function result_cache_find_with_prefix(prefix) {
  console.log("result_cache_find_with_prefix - prefix:", prefix);
  let keys_found = [];
  console.log("result_cache_find_with_prefix - keys in localstorage:", localStorage.length);
  for (let i = 0; i < localStorage.length; i++) {
    let key = localStorage.key(i);
    if (key.startsWith(prefix)) {
      keys_found.push(key);
    }
  }
  return keys_found;
}
export function result_cache_delete_today_stock(ticker) {
  let today_key_stock = result_cache_today_key_for_stock(ticker);
  let keys_to_remove = result_cache_find_with_prefix(today_key_stock);
  console.log("keys_to_remove:", keys_to_remove);
  keys_to_remove.forEach(key => localStorage.removeItem(key));
}