"use client";

//manager dashboard page for listing and managing owned properties

import PropertyCard from "@/components/PropertyCard";
import ContentHeader from "@/components/ContentHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useGetAuthUserQuery, useGetManagerPropertiesQuery } from "@/state/api";
import React from "react";

const Properties = () => {
  //fetches authenticated user to identify the manager
  const { data: authUser } = useGetAuthUserQuery();

  //retrieves all properties associated with the manager
  //query is skipped until the cognito user id is available
  const {
    data: managerProperties,
    isLoading,
    error,
  } = useGetManagerPropertiesQuery(authUser?.cognitoInfo?.userId || "", {
    skip: !authUser?.cognitoInfo?.userId,
  });

  //loading and error states
  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading manager properties</div>;

  return (
    <div className="dashboard-container">
      {/* page header describing the manager property overview */}
      <ContentHeader
        title="My Properties"
        subtitle="View and manage your property listings"
      />

      {/* responsive grid layout for property cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {managerProperties?.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            isFavorite={false}
            onFavoriteToggle={() => {}}
            showFavoriteButton={false}
            propertyLink={`/managers/properties/${property.id}`}
          />
        ))}
      </div>

      {/* empty state message when manager has no properties */}
      {(!managerProperties || managerProperties.length === 0) && (
        <p>You don&lsquo;t manage any properties</p>
      )}
    </div>
  );
};

export default Properties;
