'use client';

import React from 'react';
import {
  useGetAuthUserQuery,
  useGetPropertiesQuery as useFetchFavoritePropertiesQuery,
  useGetTenantQuery as useFetchTenantDataQuery,
} from '@/state/api';
import PropertyCard from '@/components/PropertyCard';
import ContentHeader from '@/components/ContentHeader';
import LoadingSpinner from '@/components/LoadingSpinner';

/* Favorites page component
   Fetches the authenticated user, derives tenant data, loads favorited
   properties, and renders them in a responsive grid layout. */
const TenantFavoriteProperties = () => {
  /* Retrieve authenticated user information.
     Authenticated user data determines whether tenant data should load. */
  const { data: authenticatedUser } = useGetAuthUserQuery();

  /* Fetch tenant details only when a valid userId exists.
     Skip logic prevents unnecessary fetches before auth is available. */
  const { data: tenant } = useFetchTenantDataQuery(
    authenticatedUser?.cognitoInfo?.userId || '',
    {
      skip: !authenticatedUser?.cognitoInfo?.userId,
    }
  );

  /* Query for favorited properties.
     - Extracts property IDs from tenant favorites.
     - Skips request if no favorites exist, avoiding empty queries. */
  const {
    data: favoriteProperties,
    isLoading,
    error,
  } = useFetchFavoritePropertiesQuery(
    { favoriteIds: tenant?.favorites?.map((fav: { id: number }) => fav.id) },
    { skip: !tenant?.favorites || tenant?.favorites.length === 0 }
  );

  /* Handle loading and error states before rendering content. */
  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading favorites uwu</div>;

  /* Render results, including message when no favorites are available. */
  return (
    <div className='dashboard-container'>
      <ContentHeader
        title='Favorited Properties'
        subtitle='Browse and manage saved property listings'
      />

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {favoriteProperties?.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            isFavorite={true}
            onFavoriteToggle={() => {}}
            showFavoriteButton={false}
            propertyLink={`/tenants/residences/${property.id}`}
          />
        ))}
      </div>

      {(!favoriteProperties || favoriteProperties.length === 0) && (
        <p>You don&rsquo;t have any favorited properties yet :D</p>
      )}
    </div>
  );
};

export default TenantFavoriteProperties;

/* Summary:
   Renders the Favorites page by loading authenticated user info,
   retrieving tenant data, fetching favorited properties, and displaying
   them within a responsive grid. Includes loading and fallback handling. */
