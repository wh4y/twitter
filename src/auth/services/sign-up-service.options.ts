export type SignUpRequestOptions = {
  email: string;
  name: string;
  password: string;
};

export type ConfirmSignUpOptions = {
  code: number;
  email: string;
};
