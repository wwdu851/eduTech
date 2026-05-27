export function getAuthToken() {
  try {
    const stored = JSON.parse(localStorage.getItem('auth_user'));
    return stored?.token || null;
  } catch {
    return null;
  }
}

export function getDisplayName(user) {
  if (!user?.email) return 'Explorer';
  const local = user.email.split('@')[0];
  return local.charAt(0).toUpperCase() + local.slice(1);
}
