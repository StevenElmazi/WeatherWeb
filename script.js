document.addEventListener('DOMContentLoaded', () => {
    const cityEl = document.getElementById('city');
    const countryEl = document.getElementById('country');
    const coordinatesEl = document.getElementById('coordinates');
    const locationBtn = document.getElementById('locationBtn');

    const showMessage = (title, subtitle = '') => {
        if (cityEl) cityEl.textContent = title;
        if (countryEl) countryEl.textContent = subtitle;
    };

    const isSecureContext = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';

    const requestLocation = () => {
        if (!navigator.geolocation) {
            showMessage('Geolocation is not supported', 'Your browser cannot request location access.');
            return;
        }

        if (!isSecureContext) {
            showMessage('Location access needs HTTPS or localhost', 'Open the app through a secure URL or Localhost to allow permission prompts.');
            return;
        }

        showMessage('Requesting location...', 'Please allow location access in your browser.');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                if (coordinatesEl) {
                    coordinatesEl.textContent = `Latitude: ${latitude.toFixed(3)}  Longitude: ${longitude.toFixed(3)}`;
                }

                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();

                    const placeName = data.address.city
                        || data.address.town
                        || data.address.village
                        || data.address.county
                        || 'Your location';

                    const countryName = data.address.country || '---';

                    if (cityEl) cityEl.textContent = placeName;
                    if (countryEl) countryEl.textContent = countryName;
                } catch (error) {
                    showMessage('Location detected', 'City lookup failed, but your coordinates are available.');
                }
            },
            (error) => {
                if (error.code === 1) {
                    showMessage('Location permission denied', 'Please allow location access to use this feature.');
                } else {
                    showMessage('Unable to detect your location', 'Try again or check your browser settings.');
                }
            }
        );
    };

    if (locationBtn) {
        locationBtn.addEventListener('click', requestLocation);
    } else {
        requestLocation();
    }
});
