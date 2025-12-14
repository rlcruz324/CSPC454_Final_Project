'use client'

//renders a Mapbox map with property markers based on current filters.
//this component initializes a Mapbox map, listens for property data updates based on global filters, and renders interactive markers for each property. The map automatically resizes after load, updates when filters change, and includes formatted popups for each property marker. Existing map instances are cleaned up to prevent memory leaks.


import React, { useEffect, useRef } from 'react'

import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import { useAppSelector } from '@/state/redux'
import { useGetPropertiesQuery } from '@/state/api'

import { Property } from '@/types/prismaTypes'

//mapbox access token setup
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string

//component: Renders a Mapbox map and places property markers on it
const Map = () => {
  //map container reference for Mapbox initialization
  const mapContainerRef = useRef(null)

  //redux filters used to determine query behavior and map center
  const filters = useAppSelector((state) => state.global.filters)

  //fetch properties based on selected filters
  const {
    data: properties,
    isLoading,
    isError
  } = useGetPropertiesQuery(filters)

  useEffect(() => {
    

    //prevent map initialization until data is ready
    if (isLoading || isError || !properties) return

    //map instance configuration
    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: 'mapbox://styles/rlcruz/cmioaodbl00m301r9hebz2q6y',
      center: filters.coordinates || [-74.5, 40],
      zoom: 9
    })

    //render markers for each property
    properties.forEach((property) => {
      const marker = createPropertyMarker(property, map)
      const markerElement = marker.getElement()

      //update default marker color
      const path = markerElement.querySelector('path[fill="#3FB1CE"]')
      if (path) path.setAttribute('fill', '#000000')
    })

    //resize handling ensures the map loads fully in flex layouts
    const resizeMap = () => {
      if (map) setTimeout(() => map.resize(), 700)
    }
    resizeMap()

    //cleanup on unmount or filter change
    return () => map.remove()
  }, [isLoading, isError, properties, filters.coordinates])

  //loading state
  if (isLoading) return <>Loading...</>

  //error state
  if (isError || !properties) return <div>Failed to fetch properties</div>

  //map container rendering
  return (
    <div className='basis-5/12 grow relative rounded-xl'>
      <div
        className='map-container rounded-xl'
        ref={mapContainerRef}
        style={{
          height: '100%',
          width: '100%'
        }}
      />
    </div>
  )
}

//Helper: Creates and attaches a property marker to the map
const createPropertyMarker = (property: Property, map: mapboxgl.Map) => {
  const marker = new mapboxgl.Marker()
    .setLngLat([
      property.location.coordinates.longitude,
      property.location.coordinates.latitude
    ])
    .setPopup(
      new mapboxgl.Popup().setHTML(
        `
        <div class="marker-popup">
          <div class="marker-popup-image"></div>
          <div>
            <a href="/search/${property.id}" target="_blank" class="marker-popup-title">${property.name}</a>
            <p class="marker-popup-price">
              $${property.pricePerMonth}
              <span class="marker-popup-price-unit"> / month</span>
            </p>
          </div>
        </div>
        `
      )
    )
    .addTo(map)

  return marker
}

export default Map
