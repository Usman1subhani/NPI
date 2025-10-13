export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in',sendotp:"/auth/sign-up/send-otp", signUpBussiness: '/auth/signupbussiness', resetPassword: '/auth/reset-password',forgotPassword:'/auth/forgot-password' },
  dashboard: {
    dashboard: '/dashboard',
    

  },
  errors: { notFound: '/errors/not-found' },
} as const;
