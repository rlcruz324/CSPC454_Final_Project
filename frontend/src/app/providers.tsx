"use client";

import StoreProvider from "@/state/redux";
import { Authenticator } from "@aws-amplify/ui-react";
import AuthenticatorWrapper from "./(authenticator)/authenticatorProvider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <Authenticator.Provider>
        <AuthenticatorWrapper>{children}</AuthenticatorWrapper>
      </Authenticator.Provider>
    </StoreProvider>
  );
};

export default Providers;