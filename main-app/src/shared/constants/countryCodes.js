// Small hand-maintained list matching this app's existing "10 digits, no
// fancier validation" convention for phone numbers - not a full E.164
// library, since every phone field in this codebase already assumes a
// fixed-length national number regardless of country.
const countryCodes = [
  { name: "India", dialCode: "+91", iso: "IN" },
  { name: "United States", dialCode: "+1", iso: "US" },
  { name: "United Kingdom", dialCode: "+44", iso: "GB" },
  { name: "United Arab Emirates", dialCode: "+971", iso: "AE" },
  { name: "Saudi Arabia", dialCode: "+966", iso: "SA" },
  { name: "Australia", dialCode: "+61", iso: "AU" },
  { name: "Canada", dialCode: "+1", iso: "CA" },
  { name: "Singapore", dialCode: "+65", iso: "SG" },
  { name: "Nepal", dialCode: "+977", iso: "NP" },
  { name: "Bangladesh", dialCode: "+880", iso: "BD" },
  { name: "Sri Lanka", dialCode: "+94", iso: "LK" },
  { name: "Qatar", dialCode: "+974", iso: "QA" },
  { name: "Kuwait", dialCode: "+965", iso: "KW" },
  { name: "Germany", dialCode: "+49", iso: "DE" },
  { name: "France", dialCode: "+33", iso: "FR" },
  { name: "Malaysia", dialCode: "+60", iso: "MY" },
  { name: "New Zealand", dialCode: "+64", iso: "NZ" },
];

export const DEFAULT_COUNTRY_CODE = "+91";

export default countryCodes;
