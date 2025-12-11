"use client";

import PropertyCard from "@/components/PropertyCard";
import ContentHeader from "@/components/ContentHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  useGetAuthUserQuery,
  useGetCurrentResidencesQuery,
  useGetTenantQuery,
} from "@/state/api";
import React from "react";

const TenantResidences = () => {
  const { data: authenticatedUser } = useGetAuthUserQuery();
  const { data: tenantData } = useGetTenantQuery(
    authenticatedUser?.cognitoInfo?.userId || "",
    {
      skip: !authenticatedUser?.cognitoInfo?.userId,
    }
  );

  const {
    data: currentResidences,
    isLoading,
    error,
  } = useGetCurrentResidencesQuery(authenticatedUser?.cognitoInfo?.userId || "", {
    skip: !authenticatedUser?.cognitoInfo?.userId,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading current residences</div>;

  return (
    <div className="dashboard-container">
      <ContentHeader
        title="Current Residences"
        subtitle="View and manage your current living spaces"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentResidences?.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            isFavorite={tenantData?.favorites.includes(property.id) || false}
            onFavoriteToggle={() => {}}
            showFavoriteButton={false}
            propertyLink={`/tenants/residences/${property.id}`}
          />
        ))}
      </div>
      {(!currentResidences || currentResidences.length === 0) && (
        <p>You don&lsquo;t have any current residences yet uwu </p>
      )}
    </div>
  );
};

export default TenantResidences;
