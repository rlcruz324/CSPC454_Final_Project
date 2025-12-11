"use client";

import SettingsForm from "@/components/UserSettingsForm";
import {
  useGetAuthUserQuery,
  useUpdateManagerSettingsMutation,
} from "@/state/api";
import React from "react";

const ManagerSettingsPage = () => {
  const { data: authenticatedUser, isLoading: isFetchingUser } = useGetAuthUserQuery();
  const [updateManager] = useUpdateManagerSettingsMutation();

  if (isFetchingUser) return <>Loading...</>;

  const userSettingsInitialValues = {
    name: authenticatedUser?.userInfo.name,
    email: authenticatedUser?.userInfo.email,
    phoneNumber: authenticatedUser?.userInfo.phoneNumber,
  };

  const submitManagerSettings = async (data: typeof userSettingsInitialValues) => {
    await updateManager({
      cognitoId: authenticatedUser?.cognitoInfo?.userId,
      ...data,
    });
  };

  return (
    <SettingsForm
      defaultSettings={userSettingsInitialValues}
      onSaveManagerSettings={submitManagerSettings}
      roleType="manager"
    />
  );
};

export default ManagerSettingsPage;
