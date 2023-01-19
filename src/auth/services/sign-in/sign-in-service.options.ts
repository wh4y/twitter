export type SignInCredentials = {
  email: string;
  password: string;
};

export type SignInOptions = {
  ip: string;
  userAgent: string;
} & SignInCredentials;
