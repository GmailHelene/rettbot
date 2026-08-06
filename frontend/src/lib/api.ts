function getCookie(name: string): string | null {
  const escaped = name.replace(/([.*+?^${}()|[\]\\])/g, '\\$1');
  const m = document.cookie.match(new RegExp('(?:^|; )' + escaped + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

/**
 * Fetch mot vårt eget API. Sender auth-cookien (credentials: 'include') og legger
 * på X-CSRF-Token fra `csrf_token`-cookien på muterende kall (CSRF double-submit).
 *
 * Auth ligger nå i en HttpOnly-cookie (ikke localStorage), så XSS kan ikke lese den.
 */
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const method = (init.method || 'GET').toUpperCase();
  const headers = new Headers(init.headers || {});
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const csrf = getCookie('csrf_token');
    if (csrf) headers.set('X-CSRF-Token', csrf);
  }
  return fetch(input, { ...init, headers, credentials: 'include' });
}
