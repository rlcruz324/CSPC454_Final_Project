//Redux slice for global UI and filter state.

//Manages global application state including search filters,
//filter modal visibility, and property listing view mode. Provides reducers for
//updating filter values, toggling UI elements, and switching between grid and
//list layouts. Ensures structured and centralized state control.


//Third-party libraries
import { createSlice, PayloadAction } from '@reduxjs/toolkit';


//Types last
export interface FiltersState {
  location: string;
  beds: string;
  baths: string;
  propertyType: string;
  amenities: string[];
  availableFrom: string;
  priceRange: [number, number] | [null, null];
  squareFeet: [number, number] | [null, null];
  coordinates: [number, number];
}

interface InitialStateTypes {
  filters: FiltersState;
  isFiltersFullOpen: boolean;
  viewMode: 'grid' | 'list';
}

//Initial state establishing default filter values and UI state.
//Coordinates centered on Los Angeles to provide a default search region.
export const initialState: InitialStateTypes = {
  filters: {
    location: 'Los Angeles',
    beds: 'any',
    baths: 'any',
    propertyType: 'any',
    amenities: [],
    availableFrom: 'any',
    priceRange: [null, null],
    squareFeet: [null, null],
    coordinates: [-118.25, 34.05],
  },
  isFiltersFullOpen: false,
  viewMode: 'grid',
};

//Global slice encapsulating state logic for filters, UI toggles, and layout mode.
//Reducers ensure predictable state updates following Redux Toolkit conventions.
export const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    //Merges provided filter updates into existing filter state.
    setFilters: (state, action: PayloadAction<Partial<FiltersState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    //Toggles the full filter panel. Helpful for controlling layout visibility.
    toggleFiltersFullOpen: (state) => {
      state.isFiltersFullOpen = !state.isFiltersFullOpen;
    },

    //Updates the view mode between grid and list formats.
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
  },
});

export const { setFilters, toggleFiltersFullOpen, setViewMode } =
  globalSlice.actions;

export default globalSlice.reducer;
