export const openGoogleMapsInNewTab = (coordinates) => {
  window.open('https://maps.google.com?q=' + coordinates[1] + ',' + coordinates[0]);
};
