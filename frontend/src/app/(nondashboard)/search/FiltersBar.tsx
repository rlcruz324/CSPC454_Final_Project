//Renders and manages the full filter bar and view mode controls for the listings page.
//This component provides all quick-access filters used on the listings page, including location search, price range selection, bedroom and bathroom counts, and property type selection. It updates global filter state, syncs filters with the URL, performs debounced updates for performance, and integrates view mode switching. Existing inline section comments (from professor) are preserved and expanded for clarity and purpose-driven context.

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useDispatch } from 'react-redux';
import { debounce } from 'lodash';
import { Filter, Grid, List, Search } from 'lucide-react';

//project modules (lib, utils, state, constants)
import {
  FiltersState,
  setFilters,
  setViewMode,
  toggleFiltersFullOpen,
} from '@/state';
import { useAppSelector } from '@/state/redux';
import { cleanParams, cn, formatPriceValue } from '@/lib/utils';
import { PropertyTypeIcons } from '@/lib/constants';

//UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


const FiltersBar = () => {
  //retrieves dispatcher and routing helpers for global state updates and URL navigation
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  //selects global filter state, view mode, and filter panel visibility
  const filters = useAppSelector((state) => state.global.filters);
  const isFiltersFullOpen = useAppSelector((state) => state.global.isFiltersFullOpen);
  const viewMode = useAppSelector((state) => state.global.viewMode);

  //local controlled state for the location search input
  const [searchInput, setSearchInput] = useState(filters.location);

  //updates the URL query string whenever filters change
  //debounced to prevent excessive navigation updates during rapid interactions
  const updateURL = debounce((newFilters: FiltersState) => {
    const cleanFilters = cleanParams(newFilters);
    const updatedSearchParams = new URLSearchParams();

    Object.entries(cleanFilters).forEach(([key, value]) => {
      updatedSearchParams.set(key, Array.isArray(value) ? value.join(',') : value.toString());
    });

    router.push(`${pathname}?${updatedSearchParams.toString()}`);
  });

  //handles updates to individual filter values
  //includes normalization logic for range filters and 'any' values
  const handleFilterChange = (key: string, value: any, isMin: boolean | null) => {
    let newValue = value;

    if (key === 'priceRange' || key === 'squareFeet') {
      const currentArrayRange = [...filters[key]];
      if (isMin !== null) {
        const index = isMin ? 0 : 1;
        currentArrayRange[index] = value === 'any' ? null : Number(value);
      }
      newValue = currentArrayRange;
    } else if (key === 'coordinates') {
      newValue = value === 'any' ? [0, 0] : value.map(Number);
    } else {
      newValue = value === 'any' ? 'any' : value;
    }

    const newFilters = { ...filters, [key]: newValue };
    dispatch(setFilters(newFilters));
    updateURL(newFilters);
  };

  //executes a Mapbox geocoding request to convert text input into coordinates
  //updates global state with both the resolved location string and coordinates
  const handleLocationSearch = async () => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchInput
        )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&fuzzyMatch=true`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        dispatch(
          setFilters({
            location: searchInput,
            coordinates: [lng, lat],
          })
        );
      }
    } catch (err) {
      console.error('Error search location:', err);
    }
  };

  return (
    <div className='flex justify-between items-center w-full py-5'>
      {/* filters */}
      {/* this left section contains all user-facing quick filters such as location, price, beds/baths, and property type. */}
      <div className='flex justify-between items-center gap-4 p-2'>
        {/* all filters */}
        {/* opens the full filter panel for access to additional filtering options not shown on the quick bar. */}
       <Button
          variant="outline"
          className={cn(
            'gap-2 rounded-xl bg-secondary-500 text-white border-secondary-500 hover:bg-secondary-600 hover:text-white',
            isFiltersFullOpen && 'bg-secondary-600'
          )}
          onClick={() => dispatch(toggleFiltersFullOpen())}
        >
          <Filter className='w-4 h-4' />
          <span>All Filters</span>
        </Button>


        {/* search Location */}
        {/* handles text-based location input and triggers map-based geocoding when searching. */}
        <div className='flex items-center'>
          <Input
            placeholder='Search location'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className='w-40 rounded-l-xl rounded-r-none border-primary-400 border-r-0'
          />
          <Button
            onClick={handleLocationSearch}
            className='rounded-r-xl rounded-l-none bg-secondary-500 text-white border border-secondary-500 shadow-none hover:bg-secondary-600 hover:text-white'
          >
            <Search className='w-4 h-4 text-white' />
          </Button>

        </div>

        {/* price range */}
        {/* Two-part selector for min and max price values. Normalized and stored as numeric range array. */}
        <div className='flex gap-1'>
          {/* minimum Price Selector */}
          <Select
            value={filters.priceRange[0]?.toString() || 'any'}
            onValueChange={(value) => handleFilterChange('priceRange', value, true)}
          >
            <SelectTrigger className='w-22 rounded-xl border-primary-400'>
              <SelectValue>{formatPriceValue(filters.priceRange[0], true)}</SelectValue>
            </SelectTrigger>
            <SelectContent className='bg-white'>
              <SelectItem value='any'>Any Min Price</SelectItem>
              {[500, 1000, 1500, 2000, 3000, 5000, 10000].map((price) => (
                <SelectItem key={price} value={price.toString()}>
                  ${price / 1000}k+
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* maximum Price Selector */}
          <Select
            value={filters.priceRange[1]?.toString() || 'any'}
            onValueChange={(value) => handleFilterChange('priceRange', value, false)}
          >
            <SelectTrigger className='w-22 rounded-xl border-primary-400'>
              <SelectValue>{formatPriceValue(filters.priceRange[1], false)}</SelectValue>
            </SelectTrigger>
            <SelectContent className='bg-white'>
              <SelectItem value='any'>Any Max Price</SelectItem>
              {[1000, 2000, 3000, 5000, 10000].map((price) => (
                <SelectItem key={price} value={price.toString()}>
                  &lt;${price / 1000}k
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* beds and baths */}
        {/* basic bedroom/bathroom count filters used heavily for narrowing down rental searches. */}
        <div className='flex gap-1'>
          {/* beds */}
          <Select
            value={filters.beds}
            onValueChange={(value) => handleFilterChange('beds', value, null)}
          >
            <SelectTrigger className='w-26 rounded-xl border-primary-400'>
              <SelectValue placeholder='Beds' />
            </SelectTrigger>
            <SelectContent className='bg-white'>
              <SelectItem value='any'>Any Beds</SelectItem>
              <SelectItem value='1'>1+ bed</SelectItem>
              <SelectItem value='2'>2+ beds</SelectItem>
              <SelectItem value='3'>3+ beds</SelectItem>
              <SelectItem value='4'>4+ beds</SelectItem>
            </SelectContent>
          </Select>

          {/* baths */}
          <Select
            value={filters.baths}
            onValueChange={(value) => handleFilterChange('baths', value, null)}
          >
            <SelectTrigger className='w-26 rounded-xl border-primary-400'>
              <SelectValue placeholder='Baths' />
            </SelectTrigger>
            <SelectContent className='bg-white'>
              <SelectItem value='any'>Any Baths</SelectItem>
              <SelectItem value='1'>1+ bath</SelectItem>
              <SelectItem value='2'>2+ baths</SelectItem>
              <SelectItem value='3'>3+ baths</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* property Type */}
        {/* dropdown populated dynamically using icons from the constants file. */}
        <Select
          value={filters.propertyType || 'any'}
          onValueChange={(value) => handleFilterChange('propertyType', value, null)}
        >
          <SelectTrigger className='w-32 rounded-xl border-primary-400'>
            <SelectValue placeholder='Home Type' />
          </SelectTrigger>
          <SelectContent className='bg-white'>
            <SelectItem value='any'>Any Property Type</SelectItem>
            {Object.entries(PropertyTypeIcons).map(([type, Icon]) => (
              <SelectItem key={type} value={type}>
                <div className='flex items-center'>
                  <Icon className='w-4 h-4 mr-2' />
                  <span>{type}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* view Mode */}
      {/* toggles between list and grid visual layouts for listings. Stores preference globally. */}
      <div className='flex justify-between items-center gap-4 p-2'>
        <div className='flex border rounded-xl'>
          <Button
            variant='ghost'
            className={cn(
              'px-3 py-1 rounded-none rounded-l-xl hover:bg-primary-600 hover:text-primary-50',
              viewMode === 'list' ? 'bg-primary-700 text-primary-50' : ''
            )}
            onClick={() => dispatch(setViewMode('list'))}
          >
            <List className='w-5 h-5' />
          </Button>
          <Button
            variant='ghost'
            className={cn(
              'px-3 py-1 rounded-none rounded-r-xl hover:bg-primary-600 hover:text-primary-50',
              viewMode === 'grid' ? 'bg-primary-700 text-primary-50' : ''
            )}
            onClick={() => dispatch(setViewMode('grid'))}
          >
            <Grid className='w-5 h-5' />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;
