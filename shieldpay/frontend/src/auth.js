export function setAuth(token, user) {
  localStorage.setItem('shieldpay_token', token);
  localStorage.setItem('shieldpay_user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('shieldpay_token');
  localStorage.removeItem('shieldpay_user');
}

export function getUser() {
  const raw = localStorage.getItem('shieldpay_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthed() {
  return Boolean(localStorage.getItem('shieldpay_token'));
}

