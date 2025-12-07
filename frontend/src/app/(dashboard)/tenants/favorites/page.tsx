'use client';

/* React / framework imports */
import React from 'react';

/* Project state modules */
import {
  useGetAuthUserQuery,
  useGetPropertiesQuery,
  useGetTenantQuery,
} from '@/state/api';

/* UI components */
import Card from '@/components/Card';
import Header from '@/components/Header';
import Loading from '@/components/Loading';

/* Favorites page component
   Fetches the authenticated user, derives tenant data, loads favorited
   properties, and renders them in a responsive grid layout. */
const Favorites = () => {
  /* Retrieve authenticated user information.
     Authenticated user data determines whether tenant data should load. */
  const { data: authUser } = useGetAuthUserQuery();

  /* Fetch tenant details only when a valid userId exists.
     Skip logic prevents unnecessary fetches before auth is available. */
  const { data: tenant } = useGetTenantQuery(
    authUser?.cognitoInfo?.userId || '',
    {
      skip: !authUser?.cognitoInfo?.userId,
    }
  );

  /* Query for favorited properties.
     - Extracts property IDs from tenant favorites.
     - Skips request if no favorites exist, avoiding empty queries. */
  const {
    data: favoriteProperties,
    isLoading,
    error,
  } = useGetPropertiesQuery(
    { favoriteIds: tenant?.favorites?.map((fav: { id: number }) => fav.id) },
    { skip: !tenant?.favorites || tenant?.favorites.length === 0 }
  );

  /* Handle loading and error states before rendering content. */
  if (isLoading) return <Loading />;
  if (error) return <div>Error loading favorites</div>;

  /* Render results, including message when no favorites are available. */
  return (
    <div className='dashboard-container'>
      <Header
        title='Favorited Properties'
        subtitle='Browse and manage saved property listings'
      />

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {favoriteProperties?.map((property) => (
          <Card
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
        <p>You don&rsquo;t have any favorited properties</p>
      )}
    </div>
  );
};

export default Favorites;

/* Summary:
   Renders the Favorites page by loading authenticated user info,
   retrieving tenant data, fetching favorited properties, and displaying
   them within a responsive grid. Includes loading and fallback handling. */
