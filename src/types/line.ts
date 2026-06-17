// ─────────────────────────────────────────────────────────────────────────────
// LINE OAuth 2.0 – Token response
// https://developers.line.biz/en/reference/line-login/#issue-access-token
// ─────────────────────────────────────────────────────────────────────────────

export interface LineTokenResponse {
  access_token: string;
  expires_in: number;
  id_token?: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// LINE Profile
// https://developers.line.biz/en/reference/line-login/#get-user-profile
// ─────────────────────────────────────────────────────────────────────────────

export interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// LINE error response shape (for narrowing errors)
// ─────────────────────────────────────────────────────────────────────────────

export interface LineErrorResponse {
  error: string;
  error_description: string;
}
