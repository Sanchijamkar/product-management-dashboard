import api from './client';
import { BRAND, toDummyJsonCredentials } from '../brand';

export async function login({ username, password }) {
  const credentials = toDummyJsonCredentials({ username, password });
  const { data } = await api.post('/auth/login', { ...credentials, expiresInMins: 60 });
  return username === BRAND.adminUsername
    ? { ...data, username: BRAND.adminUsername, firstName: 'Nexgensis', lastName: 'Administrator', email: 'admin@nexgensis.demo' }
    : data;
}
