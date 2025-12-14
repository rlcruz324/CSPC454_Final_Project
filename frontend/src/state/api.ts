//centralized Redux Toolkit Query API configuration for all backend requests.
//defines API endpoints for authentication, properties, tenants, managers, leases, payments, and applications. Handles authorization headers, request lifecycle behavior, tag invalidation, toast messaging, and automatic user creation. Ensures consistent data fetching and caching across the application without modifying core logic.


//third-party libraries
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth'

//project modules (lib, utils, state, constants)
import { cleanParams, createNewUserInDatabase, withToast } from '@/lib/utils'
import { FiltersState } from '.'

//types
import {
  Application,
  Lease,
  Manager,
  Payment,
  Property,
  Tenant
} from '@/types/prismaTypes'

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    //configure headers to include JWT extracted from Cognito session
    prepareHeaders: async (headers) => {
      const session = await fetchAuthSession()
      const { idToken } = session.tokens ?? {}
      if (idToken) headers.set('Authorization', `Bearer ${idToken}`)
      return headers
    }
  }),
  reducerPath: 'api',
  tagTypes: [
    'Managers',
    'Tenants',
    'Properties',
    'PropertyDetails',
    'Leases',
    'Payments',
    'Applications'
  ],

  //endpoint definitions for all domain areas
  endpoints: (build) => ({
    //fetch authenticated user and create one if missing in database
    getAuthUser: build.query<User, void>({
      queryFn: async (_, _queryApi, _extraoptions, fetchWithBQ) => {
        try {
          const session = await fetchAuthSession()
          const { idToken } = session.tokens ?? {}
          const user = await getCurrentUser()
          const userRole = idToken?.payload['custom:role'] as string

          const endpoint =
            userRole === 'manager'
              ? `/managers/${user.userId}`
              : `/tenants/${user.userId}`

          let userDetailsResponse = await fetchWithBQ(endpoint)

          // create new user if entry does not exist server-side
          if (
            userDetailsResponse.error &&
            userDetailsResponse.error.status === 404
          ) {
            userDetailsResponse = await createNewUserInDatabase(
              user,
              idToken,
              userRole,
              fetchWithBQ
            )
          }

          return {
            data: {
              cognitoInfo: { ...user },
              userInfo: userDetailsResponse.data as Tenant | Manager,
              userRole
            }
          }
        } catch (error: any) {
          return { error: error.message || 'Could not fetch user data' }
        }
      }
    }),

    //property list endpoint with filter support
    getProperties: build.query<
      Property[],
      Partial<FiltersState> & { favoriteIds?: number[] }
    >({
      query: (filters) => {
        const params = cleanParams({
          location: filters.location,
          priceMin: filters.priceRange?.[0],
          priceMax: filters.priceRange?.[1],
          beds: filters.beds,
          baths: filters.baths,
          propertyType: filters.propertyType,
          squareFeetMin: filters.squareFeet?.[0],
          squareFeetMax: filters.squareFeet?.[1],
          amenities: filters.amenities?.join(','),
          availableFrom: filters.availableFrom,
          favoriteIds: filters.favoriteIds?.join(','),
          latitude: filters.coordinates?.[1],
          longitude: filters.coordinates?.[0]
        })

        return { url: 'properties', params }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Properties' as const, id })),
              { type: 'Properties', id: 'LIST' }
            ]
          : [{ type: 'Properties', id: 'LIST' }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: 'Failed to fetch properties.'
        })
      }
    }),

    // fetch single property detail
    getProperty: build.query<Property, number>({
      query: (id) => `properties/${id}`,
      providesTags: (_, __, id) => [{ type: 'PropertyDetails', id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: 'Failed to load property details.'
        })
      }
    }),

    //tenant endpoints
    getTenant: build.query<Tenant, string>({
      query: (cognitoId) => `tenants/${cognitoId}`,
      providesTags: (result) => [{ type: 'Tenants', id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: 'Failed to load tenant profile.'
        })
      }
    }),

    getCurrentResidences: build.query<Property[], string>({
      query: (cognitoId) => `tenants/${cognitoId}/current-residences`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Properties' as const, id })),
              { type: 'Properties', id: 'LIST' }
            ]
          : [{ type: 'Properties', id: 'LIST' }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: 'Failed to fetch current residences.'
        })
      }
    }),

    updateTenantSettings: build.mutation<
      Tenant,
      { cognitoId: string } & Partial<Tenant>
    >({
      query: ({ cognitoId, ...updatedTenant }) => ({
        url: `tenants/${cognitoId}`,
        method: 'PUT',
        body: updatedTenant
      }),
      invalidatesTags: (result) => [{ type: 'Tenants', id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: 'Settings updated successfully!',
          error: 'Failed to update settings.'
        })
      }
    }),

    addFavoriteProperty: build.mutation<
      Tenant,
      { cognitoId: string; propertyId: number }
    >({
      query: ({ cognitoId, propertyId }) => ({
        url: `tenants/${cognitoId}/favorites/${propertyId}`,
        method: 'POST'
      }),
      invalidatesTags: (result) => [
        { type: 'Tenants', id: result?.id },
        { type: 'Properties', id: 'LIST' }
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: 'Added to favorites!!',
          error: 'Failed to add to favorites'
        })
      }
    }),

    removeFavoriteProperty: build.mutation<
      Tenant,
      { cognitoId: string; propertyId: number }
    >({
      query: ({ cognitoId, propertyId }) => ({
        url: `tenants/${cognitoId}/favorites/${propertyId}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result) => [
        { type: 'Tenants', id: result?.id },
        { type: 'Properties', id: 'LIST' }
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: 'Removed from favorites!',
          error: 'Failed to remove from favorites.'
        })
      }
    }),

    // Manager endpoints
    getManagerProperties: build.query<Property[], string>({
      query: (cognitoId) => `managers/${cognitoId}/properties`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Properties' as const, id })),
              { type: 'Properties', id: 'LIST' }
            ]
          : [{ type: 'Properties', id: 'LIST' }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: 'Failed to load manager profile.'
        })
      }
    }),

    updateManagerSettings: build.mutation<
      Manager,
      { cognitoId: string } & Partial<Manager>
    >({
      query: ({ cognitoId, ...updatedManager }) => ({
        url: `managers/${cognitoId}`,
        method: 'PUT',
        body: updatedManager
      }),
      invalidatesTags: (result) => [{ type: 'Managers', id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: 'Settings updated successfully!',
          error: 'Failed to update settings.'
        })
      }
    }),

    createProperty: build.mutation<Property, FormData>({
      query: (newProperty) => ({
        url: 'properties',
        method: 'POST',
        body: newProperty
      }),
      invalidatesTags: (result) => [
        { type: 'Properties', id: 'LIST' },
        { type: 'Managers', id: result?.manager?.id }
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: 'Property created successfully!',
          error: 'Failed to create property.'
        })
      }
    }),

    //lease endpoints
    getLeases: build.query<Lease[], number>({
      query: () => 'leases',
      providesTags: ['Leases'],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: 'Failed to fetch leases.'
        })
      }
    }),

    getPropertyLeases: build.query<Lease[], number>({
      query: (propertyId) => `properties/${propertyId}/leases`,
      providesTags: ['Leases'],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: 'Failed to fetch property leases.'
        })
      }
    }),

    getPayments: build.query<Payment[], number>({
      query: (leaseId) => `leases/${leaseId}/payments`,
      providesTags: ['Payments'],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: 'Failed to fetch payment info.'
        })
      }
    }),

    //application endpoints
    getApplications: build.query<
      Application[],
      { tenantUserId?: string; accountRole?: string }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams()
        if (params.tenantUserId) queryParams.append('userId', params.tenantUserId.toString())
        if (params.accountRole) queryParams.append('userType', params.accountRole)

        return `applications?${queryParams.toString()}`
      },
      providesTags: ['Applications'],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: 'Failed to fetch applications.'
        })
      }
    }),

    updateApplicationStatus: build.mutation<
      Application & { lease?: Lease },
      { id: number; status: string }
    >({
      query: ({ id, status }) => ({
        url: `applications/${id}/status`,
        method: 'PUT',
        body: { status }
      }),
      invalidatesTags: ['Applications', 'Leases'],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: 'Application status updated successfully!',
          error: 'Failed to update application settings.'
        })
      }
    }),

    createApplication: build.mutation<Application, Partial<Application>>({
      query: (body) => ({
        url: 'applications',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Applications'],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: 'Application created successfully!',
          error: 'Failed to create applications.'
        })
      }
    })
  })
})

export const {
  useGetAuthUserQuery,
  useUpdateTenantSettingsMutation,
  useUpdateManagerSettingsMutation,
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useGetCurrentResidencesQuery,
  useGetManagerPropertiesQuery,
  useCreatePropertyMutation,
  useGetTenantQuery,
  useAddFavoritePropertyMutation,
  useRemoveFavoritePropertyMutation,
  useGetLeasesQuery,
  useGetPropertyLeasesQuery,
  useGetPaymentsQuery,
  useGetApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useCreateApplicationMutation
} = api
