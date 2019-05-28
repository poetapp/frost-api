export enum Path {
  LOGIN = '/login',
  PASSWORD_RESET = '/password/reset',
  PASSWORD_CHANGE_TOKEN = '/password/change/token',
  PASSWORD_CHANGE = '/password/change',
  ACCOUNTS = '/accounts',
  ACCOUNTS_ID = '/accounts/:issuer',
  ACCOUNTS_ID_POE_CHALLENGE = '/accounts/:issuer/poe-challenge',
  ACCOUNTS_VERIFY = '/accounts/verify',
  ACCOUNTS_VERIFY_TOKEN = '/accounts/verify/:token',
  WORKS = '/works',
  WORKS_WORKID = '/works/:workId',
  TOKENS = '/tokens',
  TOKENS_TOKENID = '/tokens/:tokenId',
  HEALTH = '/health',
  ARCHIVES = '/archives',
}
