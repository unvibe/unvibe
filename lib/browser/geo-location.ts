// get the user location
export async function geoLocation() {
  // check support for geolocation api
  if ('geolocation' in navigator) {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  } else {
    throw new Error('Geolocation API not available');
  }
}
