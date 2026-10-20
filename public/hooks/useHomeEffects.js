function useHomeMap(enabled) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const mapElement = document.querySelector('.clients-map-canvas');
    const L = window.L;

    if (!mapElement || !L) {
      return;
    }

    const etNassoCoordinates = [38.4228, 16.0680];
    const map = L.map(mapElement, {
      attributionControl: false,
      boxZoom: false,
      doubleClickZoom: false,
      dragging: true,
      keyboard: false,
      scrollWheelZoom: false,
      tap: true,
      touchZoom: true,
      zoomControl: false,
    }).setView(etNassoCoordinates, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    const markerIcon = L.divIcon({
      className: 'clients-map-marker',
      html: '<span></span><strong>Bigmat ETN S.r.l.</strong>',
      iconAnchor: [19, 38],
      iconSize: [190, 38],
    });

    L.marker(etNassoCoordinates, {
      icon: markerIcon,
      interactive: false,
    }).addTo(map);

    window.setTimeout(() => map.invalidateSize(), 0);

    return () => {
      map.remove();
    };
  }, [enabled]);
}

function useServicesCarousel(enabled) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const servicesSection = document.querySelector('.home-section-services');
    const carousel = document.querySelector('.services-carousel');
    const track = document.querySelector('.services-track');
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    if (!servicesSection || !carousel || !track || !gsap || !ScrollTrigger) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    function getScrollDistance() {
      return Math.max(0, track.scrollWidth - carousel.clientWidth);
    }

    if (getScrollDistance() <= 0) {
      return;
    }

    const parallaxImages = gsap.utils.toArray('.services-parallax-image');

    const tween = gsap.to(track, {
      x: () => -getScrollDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: servicesSection,
        start: 'top top',
        end: () => `+=${getScrollDistance()}`,
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          servicesSection.style.setProperty('--services-progress', self.progress);
        },
      },
    });

    const parallaxTweens = parallaxImages.map((image) =>
      gsap.fromTo(
        image,
        { xPercent: -30 },
        {
          xPercent: 30,
          ease: 'none',
          scrollTrigger: {
            trigger: servicesSection,
            start: 'top top',
            end: () => `+=${getScrollDistance()}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      )
    );

    ScrollTrigger.refresh();

    return () => {
      servicesSection.style.removeProperty('--services-progress');
      tween.scrollTrigger?.kill();
      tween.kill();
      parallaxTweens.forEach((parallaxTween) => {
        parallaxTween.scrollTrigger?.kill();
        parallaxTween.kill();
      });
    };
  }, [enabled]);
}
