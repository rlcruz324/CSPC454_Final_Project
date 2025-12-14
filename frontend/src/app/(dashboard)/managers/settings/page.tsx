"use client";

//manager settings page for viewing and updating profile information

import SettingsForm from "@/components/UserSettingsForm";
import {
  useGetAuthUserQuery,
  useUpdateManagerSettingsMutation,
} from "@/state/api";
import React from "react";

const ManagerSettingsPage = () => {
  //fetches authenticated user data for pre-filling the settings form
  const { data: authenticatedUser, isLoading: isFetchingUser } =
    useGetAuthUserQuery();

  //mutation for updating manager profile settings
  const [updateManager] = useUpdateManagerSettingsMutation();

  //loading state while user data is being retrieved
  if (isFetchingUser) return <>Loading...</>;

  //initial form values derived from authenticated user info
  const userSettingsInitialValues = {
    name: authenticatedUser?.userInfo.name,
    email: authenticatedUser?.userInfo.email,
    phoneNumber: authenticatedUser?.userInfo.phoneNumber,
  };

  //submits updated manager settings to the backend
  const submitManagerSettings = async (
    data: typeof userSettingsInitialValues
  ) => {
    await updateManager({
      cognitoId: authenticatedUser?.cognitoInfo?.userId,
      ...data,
    });
  };

  return (
    //reusable settings form configured for manager role
    <SettingsForm
      defaultSettings={userSettingsInitialValues}
      onSaveManagerSettings={submitManagerSettings}
      roleType="manager"
    />
  );
};

export default ManagerSettingsPage;
