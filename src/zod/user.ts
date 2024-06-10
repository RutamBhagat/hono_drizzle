import { z } from 'zod';

export const signupInput = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(6).max(20),
  name: z.string().min(3).max(20),
});

export type TSignUpInput = z.infer<typeof signupInput>;

export const signinInput = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(6).max(20),
});

export type TSignInInput = z.infer<typeof signinInput>;

// Only use the Type for the frontend
export const tokenResponse = z.object({
  token: z.string(),
});

export type TTokenResponse = z.infer<typeof tokenResponse>;
