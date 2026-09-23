export const BRAND = {
  name: 'Nexgensis',
  adminUsername: 'emilys',
  adminPassword: 'emilyspass',
};

// DummyJSON has fixed test accounts. The branded demo account below is mapped
// only at the API boundary, while all application UI keeps the Nexgensis identity.
export function toDummyJsonCredentials({ username, password }) {
  if (username === BRAND.adminUsername && password === BRAND.adminPassword) {
    return { username: 'emilys', password: 'emilyspass' };
  }
  return { username, password };
}
