import { useState, useCallback } from 'react';

interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface GeolocationState {
  coordinates: Coordinates | null;
  isLoading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    isLoading: false,
    error: null,
  });

  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser.',
        isLoading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
          isLoading: false,
          error: null,
        });
      },
      (err) => {
        let message = 'Location unavailable — accuracy not guaranteed.';
        if (err.code === err.PERMISSION_DENIED) {
          message = 'Location access denied. Please allow location permission.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          message = 'Location information is unavailable.';
        } else if (err.code === err.TIMEOUT) {
          message = 'Location request timed out.';
        }
        setState({
          coordinates: null,
          isLoading: false,
          error: message,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  const formatCoordinates = (coords: Coordinates): string => {
    const lat = coords.latitude;
    const lng = coords.longitude;
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
  };

  return {
    ...state,
    fetchLocation,
    formatCoordinates,
  };
}
