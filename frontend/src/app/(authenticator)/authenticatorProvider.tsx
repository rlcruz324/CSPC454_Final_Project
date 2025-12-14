"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import { Amplify } from "aws-amplify";

import {
  Authenticator,
  Heading,
  Radio,
  RadioGroupField,
  useAuthenticator,
  View,
} from "@aws-amplify/ui-react";

import "@aws-amplify/ui-react/styles.css";

//no local component imports in this file
//add project-local imports below if needed


//amplify config values can be changed by updating environment variables
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!,
      userPoolClientId:
        process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID!,
      loginWith: { username: true },
    },
  },
});



//custom UI components for branding and layout
//text, colors, and structure in this section can be updated
const customAuthenticatorComponents = {
  Header() {
    return (
      <View className="mt-4 mb-7">
        {/* App branding can be customized here */}
        <Heading level={3} className="!text-2xl !font-bold">
          Lucky
          <span className="text-secondary-500 font-light hover:!text-primary-300">
            ⭐Star
          </span>
        </Heading>

        {/* welcome text can be edited */}
        <p className="text-muted-foreground mt-2">
          <span className="font-bold">Hello!</span> Please sign in to continue! 
        </p>
      </View>
    );
  },

  //sign In footer link text and styles can be modified
  SignIn: {
    Footer() {
      const { toSignUp } = useAuthenticator();
      return (
        <View className="text-center mt-4">
          <p className="text-muted-foreground">
            Don&apos;t have an account?{" "}
            <button
              onClick={toSignUp}
              className="text-primary hover:underline bg-transparent border-none p-0"
            >
              Sign up here
            </button>
          </p>
        </View>
      );
    },
  },

  //sign Up form fields and role options can be changed
  SignUp: {
    FormFields() {
      const { validationErrors } = useAuthenticator();

      return (
        <>
          {/* default form fields can be overridden if a custom layout is needed */}
          <Authenticator.SignUp.FormFields />

          {/* custom role selection options can be edited or expanded */}
          <RadioGroupField
            legend="Role"
            name="custom:role"
            errorMessage={validationErrors?.["custom:role"]}
            hasError={!!validationErrors?.["custom:role"]}
            isRequired
          >
            <Radio value="tenant">Tenant</Radio>
            <Radio value="manager">Manager</Radio>
          </RadioGroupField>
        </>
      );
    },

    //footer link text can be changed
    Footer() {
      const { toSignIn } = useAuthenticator();
      return (
        <View className="text-center mt-4">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={toSignIn}
              className="text-primary hover:underline bg-transparent border-none p-0"
            >
              Sign in
            </button>
          </p>
        </View>
      );
    },
  },
};

//form field labels, placeholders, and order can be modified
const authenticationFormFields = {
  signIn: {
    username: {
      placeholder: "Enter your email",
      label: "Email",
      isRequired: true,
    },
    password: {
      placeholder: "Enter your password",
      label: "Password",
      isRequired: true,
    },
  },

  signUp: {
    username: {
      order: 1,
      placeholder: "Choose a username",
      label: "Username",
      isRequired: true,
    },
    email: {
      order: 2,
      placeholder: "Enter your email address",
      label: "Email",
      isRequired: true,
    },
    password: {
      order: 3,
      placeholder: "Create a password",
      label: "Password",
      isRequired: true,
    },
    confirm_password: {
      order: 4,
      placeholder: "Confirm your password",
      label: "Confirm Password",
      isRequired: true,
    },
  },
};

//authentication wrapper that controls routing logic
//redirect behavior and protected routes can be adjusted
const AuthenticatorWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthenticator((context) => [context.user]);
  const routerInstance = useRouter();
  const currentPathname = usePathname();

  //paths for login or signup can be adjusted
  const isAuthPageRoute = currentPathname.match(/^\/(signin|signup)$/);

  //dashboard paths can be expanded if more roles are added
  const isDashboardPageRoute =
    currentPathname.startsWith("/manager") || currentPathname.startsWith("/tenants");

  //redirect logged-in users away from auth pages
  //redirect destination can be changed
  useEffect(() => {
    if (user && isAuthPageRoute) {
      routerInstance.push("/");
    }
  }, [user, isAuthPageRoute, routerInstance]);

  //allow non-auth pages to render normally
  if (!isAuthPageRoute && !isDashboardPageRoute) {
    return <>{children}</>;
  }

  //authenticator wrapper — UI and initial state can be modified
  return (
    <div className="h-full">
      <Authenticator
        initialState={currentPathname.includes("signup") ? "signUp" : "signIn"}
        components={customAuthenticatorComponents}
        formFields={authenticationFormFields}
      >
        {() => <>{children}</>}
      </Authenticator>
    </div>
  );
};

export default AuthenticatorWrapper;
