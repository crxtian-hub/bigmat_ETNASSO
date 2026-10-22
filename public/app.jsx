const { useEffect, useLayoutEffect, useMemo, useRef, useState } = React;

const apiUrl = '/api/products.php';
const authUrl = '/api/auth.php';
const brandsApiUrl = '/api/brands.php';
const googleReviewsApiUrl = '/api/google-reviews.php';
const productCategoriesApiUrl = '/api/product-categories.php';
const layoutGridStorageKey = 'bigmat-layout-grid-visible';
const SITE_PRELOADER_ENABLED = false;
const homeSectionColors = ['#f5f2f0', '#f5f2f0', '#58575c', '#f5f2f0', '#f5f2f0', '#f5f2f0'];
const fallbackClientReviews = [
  {
    author: 'Francesco Canino',
    rating: 5,
    text: "Distribuito bene nell'espozione dei prodotti offerti, con vasta scelta tra gli articoli dei marchi proposti. Personale qualificato e disponibilissimo.",
    googleMapsUri: '',
  },
  {
    author: 'Antonino Nocera',
    rating: 5,
    text: 'Ottima RIVENDITA, super fornita, personale professionale',
  },
  {
    author: 'Norman Zerbi',
    rating: 5,
    text: 'Francesco che è la persona che mi segue spesso ed è super disponibile e soprattutto competente',
  },
  {
    author: 'Salvo Corigliano',
    rating: 5,
    text: 'Prodotti di alta qualità e personale preparatissimo.',
  },
  {
    author: 'Francesco Marchetta',
    rating: 5,
    text: 'Negozio molto fornito con materiali di alta qualità personale competente e disponibile forniscono la giusta soluzione per ogni esigenza',
  },
  {
    author: 'Tiziano Pisano',
    rating: 5,
    text: 'Professionalità senza paragoni,e prodotti al top.',
  },
  {
    author: 'Rosalba.Romeo Romeo',
    rating: 5,
    text: 'Sempre gentili e professionali lo consiglio',
  },
  {
    author: 'carmelo Puleio',
    rating: 5,
    text: 'Un punto esclusivo con professionalità',
  },
  {
    author: 'Angelo Rodofili (Angelo)',
    rating: 5,
    text: 'Pellet di buona qualità, il personale gentile e professionale',
  },
  {
    author: 'Luigi Pugliese',
    rating: 5,
    text: 'Tutto e di più per costruire',
  },
  {
    author: 'Bruno Malara',
    rating: 5,
    text: 'N.1',
  },
];
const emptyForm = {
  id: '',
  name: '',
  category: '',
  description: '',
  price: '',
  featured: false,
  image: '',
  file: null,
};
const emptyBrandForm = {
  id: '',
  name: '',
  image: '',
  imageFile: null,
  link: '',
  type: 'showroom',
};
const emptyProductForm = {
  id: '',
  brand: '',
  model: '',
  link: '',
  miniDescription: '',
  priceDay: '',
  priceWeek: '',
  priceMonth: '',
  originalPrice: '',
  discountedPrice: '',
  priceSuffix: '',
  renderTags: [],
  category: 'categoria',
  image: '',
  imageFile: null,
};
const maxProductsPerCategory = 7;
function getMobilePublicScroller() {
  if (!document.body.classList.contains('mobile-public-scroll')) return null;
  return document.getElementById('root');
}

function getPageScrollTop() {
  return getMobilePublicScroller()?.scrollTop ?? window.scrollY;
}

function scrollPageTo(options) {
  const scroller = getMobilePublicScroller();
  if (scroller) scroller.scrollTo(options);
  else window.scrollTo(options);
}

const productSections = {
  'edilizia-prodotti': {
    title: 'EDILIZIA - Prodotti',
    category: 'Edilizia',
  },
  'showroom-prodotti': {
    title: 'SHOWROOM - Prodotti',
    category: 'Showroom',
  },
  'noleggio-prodotti': {
    title: 'NOLEGGIO - Prodotti',
    category: 'Noleggio',
  },
  'promozioni-prodotti': {
    title: 'PROMOZIONI - Prodotti',
    category: 'Promozioni',
  },
};
const renderSection = {
  base: 'showroom-render',
  title: 'SHOWROOM - Render',
  category: 'Showroom Render',
};
const peopleSection = {
  base: 'chi-siamo-persone',
  title: 'CHI SIAMO - Persone',
  category: 'Chi Siamo Persone',
};
const backendStaticPages = {};

function assetUrl(path) {
  if (!path) {
    return '';
  }
  
  return path.startsWith('/') || path.startsWith('http') ? path : `/${path}`;
}

function productSectionFromView(view) {
  for (const [base, config] of Object.entries(productSections)) {
    if (view === base) {
      return { ...config, base, mode: 'list', id: '' };
    }
    
    if (view === `${base}-new`) {
      return { ...config, base, mode: 'new', id: '' };
    }
    
    if (view.startsWith(`${base}-edit:`)) {
      return { ...config, base, mode: 'edit', id: view.replace(`${base}-edit:`, '') };
    }
  }
  
  return null;
}

function renderSectionFromView(view) {
  if (view === renderSection.base) {
    return { ...renderSection, mode: 'list', id: '' };
  }
  
  if (view === `${renderSection.base}-new`) {
    return { ...renderSection, mode: 'new', id: '' };
  }
  
  if (view.startsWith(`${renderSection.base}-edit:`)) {
    return { ...renderSection, mode: 'edit', id: view.replace(`${renderSection.base}-edit:`, '') };
  }
  
  return null;
}

function peopleSectionFromView(view) {
  if (view === peopleSection.base) {
    return { ...peopleSection, mode: 'list', id: '' };
  }
  
  if (view === `${peopleSection.base}-new`) {
    return { ...peopleSection, mode: 'new', id: '' };
  }
  
  if (view.startsWith(`${peopleSection.base}-edit:`)) {
    return { ...peopleSection, mode: 'edit', id: view.replace(`${peopleSection.base}-edit:`, '') };
  }
  
  return null;
}

function PreloaderTestPage() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 4000;
    const startedAt = performance.now();
    let frameId;

    const updateProgress = (now) => {
      const elapsed = Math.min(now - startedAt, duration);
      setProgress(Math.round((elapsed / duration) * 100));
      if (elapsed < duration) {
        frameId = requestAnimationFrame(updateProgress);
      }
    };

    frameId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <main className="preloader-test-page" aria-label="Test preloader BigMat">
    <section className="preloader-stage">
    <div className="preloader-identity">
    <div className="preloader-header-logo" role="img" aria-label="BigMat ET Nasso">
      <span className="preloader-logo-part preloader-logo-bigmat"><img src="/assets/logos/BigMat_ETN_Logo_Preloader.svg" alt="" /></span>
      <span className="preloader-logo-part preloader-logo-divider"><img src="/assets/logos/BigMat_ETN_Logo_Preloader.svg" alt="" /></span>
      <span className="preloader-logo-part preloader-logo-etn"><img src="/assets/logos/BigMat_ETN_Logo_Preloader.svg" alt="" /></span>
    </div>
    <svg className="preloader-symbol" viewBox="0 0 960 720" role="img" aria-label="Preloader in costruzione">
    <line className="preloader-draw-line preloader-draw-line-1" x1="140" y1="474.286" x2="720" y2="142.857" />
    <line className="preloader-draw-line preloader-draw-line-2" x1="240" y1="577.143" x2="820" y2="245.714" />
    <line className="preloader-draw-line preloader-draw-line-3" x1="240" y1="142.857" x2="820" y2="474.286" />
    <line className="preloader-draw-line preloader-draw-line-4" x1="140" y1="245.714" x2="720" y2="577.143" />
    <polygon
    className="preloader-intersection-fill"
    points="480 280 620 360 620 360 480 440 340 360 340 360"
    >
    <animate
    attributeName="points"
    begin="1.88s"
    dur="0.66s"
    fill="freeze"
    calcMode="spline"
    keyTimes="0;0.363636;0.618182;0.840909;1"
    keySplines="0.22 0.61 0.64 0.92;0.16 0.12 0.3 1;0.4 0 0.6 1;0.16 1 0.3 1"
    values="480 280 620 360 620 360 480 440 340 360 340 360;480 120 620 200 620 360 480 440 340 360 340 200;480 94.4 631.2 180.8 631.2 353.6 480 440 328.8 353.6 328.8 180.8;480 123.2 618.6 202.4 618.6 360.8 480 440 341.4 360.8 341.4 202.4;480 120 620 200 620 360 480 440 340 360 340 200"
    />
    </polygon>
    </svg>
    <p className="preloader-tagline"><RevealLines lines={['HOME OF BUILDERS']} /></p>
    </div>
    </section>
    <p className="preloader-progress" aria-label={`Caricamento ${progress}%`}>
    {progress === 100 ? <><span className="preloader-progress-leading-one">1</span>00</> : progress}
    </p>
    </main>
  );
}

function RevealLines({ lines }) {
  return (
    <>
    {lines.map((line, index) => (
      <span className="text-reveal-line" style={{ '--text-line-delay': `${index * 70}ms` }} key={`${line}-${index}`}>
      <span className="text-reveal-line-inner">{line}</span>
      </span>
    ))}
    </>
  );
}

function headerLogoForPath(path) {
  const pathname = path.split('#')[0].replace(/\/+$/, '') || '/';
  if (pathname === '/showroom' || pathname.startsWith('/showroom-render')) return '/assets/logos/HabiMar_Logo_Header.svg';
  if (pathname === '/noleggio') return '/assets/logos/BigRent_Logo_Header.svg';
  return '/assets/logos/BigMat_ETN_Logo_Header.svg';
}

function HeaderLogoTransition({ transition, onSwap, onDone }) {
  const rectangleRef = useRef(null);
  const callbacksRef = useRef({ onSwap, onDone });
  callbacksRef.current = { onSwap, onDone };

  useLayoutEffect(() => {
    let cancelled = false;
    const animations = [];
    async function animate(element, frames, duration) {
      const animation = element.animate(frames, { duration, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' });
      animations.push(animation);
      await animation.finished;
    }
    async function run() {
      const rectangle = rectangleRef.current;
      if (transition.phase === 'out') {
        if (transition.mobile) {
          const nextLogo = document.querySelector('.home-logo img');
          if (nextLogo) await nextLogo.decode();
        }
        await animate(rectangle, [{ clipPath: 'inset(0 0% 0 0)' }, { clipPath: 'inset(0 100% 0 0)' }], 360);
        if (!cancelled) callbacksRef.current.onSwap();
        return;
      }
      const targetElement = transition.mobile || window.matchMedia('(max-width: 767px)').matches
        ? document.querySelector('.home-logo')
        : document.querySelector('.home-logo img');
      const targetBounds = targetElement?.getBoundingClientRect();
      if (!targetBounds || !targetBounds.width || !targetBounds.height) {
        callbacksRef.current.onDone();
        return;
      }
      const target = {
        left: targetBounds.left + (transition.mobile ? 0 : window.scrollX),
        top: targetBounds.top + (transition.mobile ? 0 : getPageScrollTop()),
        width: targetBounds.width,
        height: targetBounds.height,
      };
      Object.assign(rectangle.style, {
        left: `${target.left}px`, top: `${target.top}px`,
        width: `${target.width}px`, height: `${target.height}px`,
      });
      await Promise.all([
        rectangle.querySelector('img').decode(),
        document.querySelector('.home-logo img').decode(),
      ]);
      if (cancelled) return;
      await animate(rectangle, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], 440);
      // Keep the completed overlay until the actual header image has a painted frame.
      await new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
      if (!cancelled) callbacksRef.current.onDone();
    }
    run().catch(() => { if (!cancelled) callbacksRef.current.onDone(); });
    return () => {
      cancelled = true;
      animations.forEach((animation) => animation.cancel());
    };
  }, [transition]);

  return ReactDOM.createPortal(
    <div ref={rectangleRef} className={`header-logo-transition${transition.mobile ? ' is-mobile' : ''}`} data-phase={transition.phase} aria-hidden="true"
      style={{ left: transition.from.left, top: transition.from.top, width: transition.from.width, height: transition.from.height, clipPath: transition.phase === 'out' ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' }}>
      <img src={transition.phase === 'out' ? transition.fromSrc : transition.toSrc} alt="" />
    </div>, document.body
  );
}

function ContactDetails({ prefix, lead = ['Per maggiori informazioni', 'visita il nostro store', 'o contattaci.'] }) {
  const [mapOpen, setMapOpen] = useState(false);
  const [mapPresent, setMapPresent] = useState(false);
  const mapRef = useRef(null);

  useLayoutEffect(() => {
    if (!mapPresent) return;
    const element = mapRef.current;
    let cancelled = false;
    const animation = element.animate([
      { opacity: mapOpen ? 0 : getComputedStyle(element).opacity },
      { opacity: mapOpen ? 1 : 0 },
    ], {
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300,
      easing: 'ease',
      fill: 'forwards',
    });
    animation.finished.then(() => {
      if (!cancelled && !mapOpen) setMapPresent(false);
    }).catch(() => {});
    return () => {
      cancelled = true;
      element.style.opacity = getComputedStyle(element).opacity;
      animation.cancel();
    };
  }, [mapOpen, mapPresent]);

  return (
    <>
    <span>
    <span className={`${prefix}-lead contact-lead`}><RevealLines lines={lead} /></span>
    <small><RevealLines lines={['Viale Paolo Borsellino, 2', '89024 - Polistena (RC)']} /></small>
    <button className="contact-map-trigger" type="button" onClick={() => {
      if (!mapOpen) setMapPresent(true);
      setMapOpen((open) => !open);
    }} aria-controls={`${prefix}-map`} aria-expanded={mapOpen}>
    <span className="contact-map-label"><RevealLines lines={['INDICAZIONI STRADALI']} /></span>
    </button>
    <a href="tel:+390966941019"><RevealLines lines={['+39 0966 941019']} /></a>
    <a className={`${prefix}-whatsapp`} href="https://wa.me/390966941019" target="_blank" rel="noreferrer">
    <span><RevealLines lines={['WHATSAPP']} /></span>
    <ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon>
    </a>
    </span>
    <span className={`contact-inline-map${mapOpen ? ' is-open' : ''}`} ref={mapRef} id={`${prefix}-map`}
      hidden={!mapPresent} aria-hidden={!mapOpen} inert={mapOpen ? undefined : ''}>
    {mapPresent && (
      <iframe title="Mappa BigMat ETN — Viale Paolo Borsellino, 2, Polistena"
        src="https://maps.google.com/maps?q=BigMat%20ETN%20Viale%20Paolo%20Borsellino%202%2089024%20Polistena%20RC&output=embed"
        referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
    )}
    </span>
    </>
  );
}

function CustomerReviews({ reviews }) {
  return <>
    <h2 className="home-section-title"><span><RevealLines lines={['I nostri clienti']} /></span></h2>
    <div className="home-google-rating">
      <p>
        <img src="/assets/logos/Google_Logo.png" alt="Google" width="24" height="24" />
        <span className="home-google-rating-copy"><RevealLines lines={['PUNTEGGIO DELLE RECENSIONI DI GOOGLE: 4.6 SU 5.']} /></span>
      </p>
    </div>
    <div className="client-reviews" aria-label="Recensioni clienti">
      <div className="client-reviews-viewport" role="region" aria-label="Recensioni Google" tabIndex={0}>
        <div className="client-reviews-track" style={{ '--reviews-loop-duration': `${reviews.length * 36}s` }}>
          {[0, 1].map((copy) => (
            <div className="client-reviews-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
              {reviews.map((review, index) => (
                <article className="client-review" key={`${review.author || 'review'}-${review.publishedAt || index}`}>
                  <header className="client-review-header">
                    <h3><RevealLines lines={[review.author || 'Cliente Google']} /></h3>
                    <span className="client-review-rating"><RevealLines lines={[`${Number(review.rating || 5).toFixed(1).replace('.', ',')} / 5,0`]} /></span>
                  </header>
                  <p><RevealLines lines={[<>“{review.text}”</>]} /></p>
                  <a href={review.googleMapsUri || 'https://www.google.com/maps/search/?api=1&query=BigMat%20ET%20Nasso%20Polistena'} target="_blank" rel="noreferrer" tabIndex={copy === 1 ? -1 : undefined} aria-label={`Scopri di più sulla recensione di ${review.author || 'Cliente Google'}`}>
                    <span><RevealLines lines={['SCOPRI DI PIÙ']} /></span>
                    <ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon>
                  </a>
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  </>;
}

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const scrollTarget = getMobilePublicScroller() || window;
    const update = () => setVisible(getPageScrollTop() > Math.max(300, (scrollTarget === window ? window.innerHeight : scrollTarget.clientHeight) * 0.65));
    update();
    scrollTarget.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      scrollTarget.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return ReactDOM.createPortal(
    <button className={`back-to-top${visible ? ' is-visible' : ''}`} type="button"
      aria-label="Torna su" title="Torna su"
      tabIndex={visible ? 0 : -1} aria-hidden={!visible}
      onClick={() => scrollPageTo({ top: 0,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>
      <span className="back-to-top-icon" aria-hidden="true"></span>
    </button>, document.body
  );
}

function RenderPageTransition({ phase, onComplete }) {
  if (phase !== 'covering' && phase !== 'closing' && phase !== 'uncovering') {
    return null;
  }
  return <div className={`showroom-render-transition is-${phase}`} aria-hidden="true" onAnimationEnd={(event) => {
    if (event.target === event.currentTarget) onComplete();
  }} />;
}

function ShowroomRenderImage({ render, closing, onClosed }) {
  const imageRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [imageBounds, setImageBounds] = useState(null);
  const [tagsVisible, setTagsVisible] = useState(false);
  const [tagsClosing, setTagsClosing] = useState(false);
  const tagItemsId = `showroom-render-tag-items-${render.id}`;
  const tagsAreVisible = tagsVisible && !closing;
  const tagsAreMounted = !closing && (tagsVisible || tagsClosing);

  function toggleTags() {
    if (!ready || closing) return;
    if (tagsVisible) {
      setTagsVisible(false);
      setTagsClosing(true);
    } else {
      setTagsClosing(false);
      setTagsVisible(true);
    }
  }

  useEffect(() => {
    setTagsVisible(false);
    setTagsClosing(false);
  }, [render.id, render.image, closing]);

  useEffect(() => {
    if (!tagsClosing) return undefined;
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220;
    const timeout = window.setTimeout(() => setTagsClosing(false), duration);
    return () => window.clearTimeout(timeout);
  }, [tagsClosing]);

  useEffect(() => {
    const image = imageRef.current;
    let firstFrame = 0;
    let secondFrame = 0;
    function measureImage() {
      if (!image.naturalWidth || !image.naturalHeight) return;
      const scale = Math.min(image.clientWidth / image.naturalWidth, image.clientHeight / image.naturalHeight);
      setImageBounds({ width: image.naturalWidth * scale, height: image.naturalHeight * scale });
    }
    function reveal() {
      measureImage();
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => setReady(true));
      });
    }
    if (image.complete && image.naturalWidth > 0) reveal();
    else image.addEventListener('load', reveal, { once: true });
    const observer = new ResizeObserver(measureImage);
    observer.observe(image);
    return () => {
      observer.disconnect();
      image.removeEventListener('load', reveal);
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [render.image]);

  return (
    <figure className={`showroom-render-image ${ready ? 'is-ready' : ''} ${closing ? 'is-closing' : ''}`}>
    <img
    ref={imageRef}
    src={assetUrl(render.image)}
    alt={render.model || render.name || render.brand || 'Render showroom'}
    decoding="async"
    role="button"
    tabIndex={ready && !closing ? 0 : -1}
    aria-label={tagsAreVisible ? 'Nascondi tag prodotti sulla foto' : 'Mostra tag prodotti sulla foto'}
    aria-pressed={tagsAreVisible}
    aria-controls={tagItemsId}
    onClick={toggleTags}
    onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleTags();
      }
    }}
    onTransitionEnd={(event) => {
      if (closing && event.propertyName === 'clip-path') onClosed();
    }}
    />
    {imageBounds && (
      <div className="showroom-render-tags" style={imageBounds}>
        <div id={tagItemsId} className={`showroom-render-tag-items${tagsClosing ? ' is-closing' : ''}`} aria-hidden={!tagsAreVisible}>
        {tagsAreMounted && (Array.isArray(render.renderTags) ? render.renderTags : []).map((tag, index) => {
          if (!tag.brand && !tag.product) return null;
          let href;
          if (tag.link) {
            try {
              const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(tag.link) ? tag.link : `https://${tag.link}`);
              if (url.protocol === 'https:' || url.protocol === 'http:') href = url.href;
            } catch {}
          }
          const Tag = href ? 'a' : 'span';
          return <Tag className="showroom-render-tag" key={index} href={href}
            target={href ? '_blank' : undefined} rel={href ? 'noreferrer' : undefined}
            style={{ left: `${Math.max(0, Math.min(100, Number(tag.x ?? 50)))}%`, top: `${Math.max(0, Math.min(100, Number(tag.y ?? 50)))}%`, '--tag-delay': `${Math.min(index, 6) * 30}ms` }}>
            {tag.brand}{tag.brand && tag.product ? ' - ' : ''}<em>{tag.product}</em>
          </Tag>;
        })}
        </div>
        <button className="showroom-render-tags-toggle" type="button"
          aria-label={tagsAreVisible ? 'Nascondi tag prodotti' : 'Mostra tag prodotti'}
          aria-pressed={tagsAreVisible} aria-controls={tagItemsId}
          disabled={!ready || closing} onClick={toggleTags}>
          <img className="showroom-render-tags-icon" src="/assets/logos/Cubo_Tag.svg" alt="" aria-hidden="true" />
        </button>
      </div>
    )}
    </figure>
  );
}

function CompanyDetailsBar() {
  return (
    <div className="company-details-bar" role="region" aria-label="Dati societari ETN">
      <span className="company-details-name">ETN S.R.L.</span>
      <span className="company-details-vat">P.IVA / C.F. : 02791000801</span>
      <a className="company-details-pec" href="mailto:etnsrl@pec.bigmat.it">etnsrl@pec.bigmat.it</a>
      <span className="company-details-address">Viale Paolo Borsellino, 2 - 89024 - Polistena (RC)</span>
      <span className="company-details-rea">REA: 190653</span>
      <span className="company-details-capital">Capitale Sociale: €400.000,00</span>
    </div>
  );
}

function useCategoryProductHover(pageKey) {
  const [hoveredId, setHoveredId] = useState(null);
  const [focusedId, setFocusedId] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [phase, setPhase] = useState('idle');
  const desiredId = focusedId || hoveredId;
  const animationMs = 300;

  // Finish each opening or closing before processing the latest pointer target.
  useEffect(() => {
    if (phase !== 'opening' && phase !== 'closing') return;
    const timer = window.setTimeout(() => {
      setPhase(phase === 'opening' ? 'open' : 'idle');
    }, animationMs);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === 'idle' && desiredId) {
      const timer = window.setTimeout(() => {
        setActiveId(desiredId);
        setPhase('opening');
      }, 180);
      return () => window.clearTimeout(timer);
    }
    if (phase === 'open' && desiredId !== activeId) {
      const timer = window.setTimeout(() => {
        setActiveId(null);
        setPhase('closing');
      }, 60);
      return () => window.clearTimeout(timer);
    }
  }, [desiredId, activeId, phase]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)');
    function reset() {
      setHoveredId(null);
      setFocusedId(null);
      setActiveId(null);
      setPhase('idle');
    }
    reset();
    desktop.addEventListener('change', reset);
    return () => desktop.removeEventListener('change', reset);
  }, [pageKey]);

  function productProps(id) {
    return {
      className: activeId === id ? 'is-product-active' : undefined,
      onPointerEnter: (event) => {
        if (event.pointerType !== 'touch' && window.matchMedia('(min-width: 768px)').matches) {
          setHoveredId(id);
        }
      },
      onPointerLeave: () => setHoveredId((current) => current === id ? null : current),
      onPointerCancel: () => setHoveredId((current) => current === id ? null : current),
      onFocus: (event) => {
        if (event.target.matches(':focus-visible') && window.matchMedia('(min-width: 768px)').matches) {
          setFocusedId(id);
        }
      },
      onBlur: () => setFocusedId((current) => current === id ? null : current),
    };
  }

  return { productProps, animationMs };
}

function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname.replace(/\/+$/, '') || '/');
  const [initialPreloaderPhase, setInitialPreloaderPhase] = useState(() => {
    const initialPath = window.location.pathname.replace(/\/+$/, '') || '/';
    return SITE_PRELOADER_ENABLED && initialPath !== '/preloader' && !initialPath.startsWith('/admin') ? 'visible' : 'done';
  });
  const [mobileMenuPhase, setMobileMenuPhase] = useState('closed');
  const [mobileMenuBottomCollapsed, setMobileMenuBottomCollapsed] = useState(false);
  const [mobileMenuPageClosing, setMobileMenuPageClosing] = useState(false);
  const [mobileMenuRenderOpening, setMobileMenuRenderOpening] = useState('');
  const mobileMenuOpen = mobileMenuPhase !== 'closed';
  const mobileMenuButtonOpen = mobileMenuOpen && ['button-opening', 'panel-opening', 'open'].includes(mobileMenuPhase);
  const mobileMenuPanelOpen = ['panel-opening', 'open'].includes(mobileMenuPhase);

  useEffect(() => {
    const mobileScroller = getMobilePublicScroller();
    if (!mobileScroller || window.innerWidth > 767) {
      setMobileMenuBottomCollapsed(false);
      return undefined;
    }
    const updateBottomState = () => {
      const distanceFromBottom = mobileScroller.scrollHeight - mobileScroller.clientHeight - mobileScroller.scrollTop;
      setMobileMenuBottomCollapsed(distanceFromBottom <= 4);
    };
    updateBottomState();
    mobileScroller.addEventListener('scroll', updateBottomState, { passive: true });
    window.addEventListener('resize', updateBottomState);
    return () => {
      mobileScroller.removeEventListener('scroll', updateBottomState);
      window.removeEventListener('resize', updateBottomState);
    };
  }, [currentPath]);

  function closeMobileMenu(immediate = false) {
    setMobileMenuPhase((phase) => {
      if (immediate || phase === 'closed') return 'closed';
      if (phase === 'button-opening' || phase === 'button-closing') return 'button-closing';
      return 'panel-closing';
    });
  }

  useEffect(() => {
    const stages = {
      'button-opening': [0, 'panel-opening'],
      'panel-opening': [560, 'open'],
      'panel-closing': [480, 'button-closing'],
      'button-closing': [320, 'closed'],
    };
    const stage = stages[mobileMenuPhase];
    if (!stage) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => setMobileMenuPhase(stage[1]), reducedMotion ? 0 : stage[0]);
    return () => window.clearTimeout(timer);
  }, [mobileMenuPhase]);

  useEffect(() => {
    if (mobileMenuPhase === 'closed') setMobileMenuPageClosing(false);
  }, [mobileMenuPhase]);

  useEffect(() => {
    if (mobileMenuPhase === 'open') {
      document.querySelector('.mobile-menu-links a')?.focus({ preventScroll: true });
    }
  }, [mobileMenuPhase]);
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const mobileScroller = getMobilePublicScroller();
    const previousScrollerOverflow = mobileScroller?.style.overflowY;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (mobileScroller) mobileScroller.style.overflowY = 'hidden';
    function handleEscape(event) {
      if (event.key === 'Escape') closeMobileMenu();
      if (event.key === 'Tab') {
        const controls = [...document.querySelectorAll('.mobile-menu a, .mobile-menu button')]
          .filter((element) => !element.closest('[inert]'));
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    function handleResize() {
      if (window.innerWidth >= 768) closeMobileMenu(true);
    }
    window.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      if (mobileScroller) mobileScroller.style.overflowY = previousScrollerOverflow;
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleResize);
      document.querySelector('.mobile-menu-toggle')?.focus({ preventScroll: true });
    };
  }, [mobileMenuOpen]);
  const [renderTransition, setRenderTransition] = useState('');
  const renderTransitionRef = useRef('');
  const renderDestinationRef = useRef('');
  const homeServicesCleanupRef = useRef(null);
  const renderReturnPathRef = useRef(window.history.state?.renderReturn?.path || '/showroom');
  const renderReturnScrollRef = useRef(window.history.state?.renderReturn?.scrollY || 0);
  const renderHasReturnHistoryRef = useRef(Boolean(window.history.state?.renderReturn));
  const renderRestoreScrollRef = useRef(false);
  const renderUncoverPendingRef = useRef(false);
  const renderCloseFromHistoryRef = useRef(false);
  const closeRenderRef = useRef(null);
  const activePathRef = useRef(currentPath);
  activePathRef.current = currentPath;
  const isPreloaderPage = currentPath === '/preloader';
  const isAdminPage = currentPath === '/admin' || currentPath.startsWith('/admin/');
  const categoryProductHover = useCategoryProductHover(currentPath);
  const [logoTransition, setLogoTransition] = useState(null);
  const logoBusyRef = useRef(false);
  const publicPath = currentPath;
  const isEdiliziaPage = publicPath === '/edilizia';
  const isShowroomPage = publicPath === '/showroom';
  const showroomRenderRoute = publicPath.match(/^\/showroom-render(?:\/([^/]+))?$/);
  const isShowroomRenderPage = Boolean(showroomRenderRoute);
  const requestedRenderId = showroomRenderRoute?.[1] || '';
  const isNoleggioPage = publicPath === '/noleggio';
  const isPromozioniPage = publicPath === '/promozioni';
  const isChiSiamoPage = publicPath === '/chi-siamo';
  const isPublicHome = !isAdminPage && !isPreloaderPage && !isEdiliziaPage && !isShowroomPage && !isShowroomRenderPage && !isNoleggioPage && !isPromozioniPage && !isChiSiamoPage;

  useLayoutEffect(() => {
    if (mobileMenuRenderOpening !== 'pending' || isShowroomRenderPage) return undefined;
    const frame = window.requestAnimationFrame(() => setMobileMenuRenderOpening('opening'));
    return () => window.cancelAnimationFrame(frame);
  }, [mobileMenuRenderOpening, isShowroomRenderPage]);

  useEffect(() => {
    if (initialPreloaderPhase !== 'visible') return undefined;
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 4500;
    const timer = window.setTimeout(() => setInitialPreloaderPhase('fading'), duration);
    return () => window.clearTimeout(timer);
  }, [initialPreloaderPhase]);

  useEffect(() => {
    if (initialPreloaderPhase !== 'fading') return undefined;
    const timer = window.setTimeout(() => setInitialPreloaderPhase('done'), 500);
    return () => window.clearTimeout(timer);
  }, [initialPreloaderPhase]);

  useEffect(() => {
    document.body.classList.toggle('is-site-preloader-active', initialPreloaderPhase !== 'done');
    return () => document.body.classList.remove('is-site-preloader-active');
  }, [initialPreloaderPhase]);

  useLayoutEffect(() => {
    const mobileViewport = window.matchMedia('(max-width: 767px)');
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');

    function syncMobileScrollRoot() {
      const shouldUseInternalScroll = mobileViewport.matches && !isAdminPage && !isPreloaderPage;
      const alreadyEnabled = body.classList.contains('mobile-public-scroll');
      if (shouldUseInternalScroll === alreadyEnabled) return;

      if (shouldUseInternalScroll) {
        if (root) root.scrollTop = window.scrollY;
        html.classList.add('mobile-public-scroll');
        body.classList.add('mobile-public-scroll');
      } else {
        const previousScrollTop = root?.scrollTop || 0;
        html.classList.remove('mobile-public-scroll');
        body.classList.remove('mobile-public-scroll');
        if (previousScrollTop) window.scrollTo({ top: previousScrollTop, left: 0, behavior: 'auto' });
      }
    }

    syncMobileScrollRoot();
    mobileViewport.addEventListener('change', syncMobileScrollRoot);
    return () => mobileViewport.removeEventListener('change', syncMobileScrollRoot);
  }, [isAdminPage, isPreloaderPage]);

  const [authenticated, setAuthenticated] = useState(!isAdminPage);
  const [authChecked, setAuthChecked] = useState(!isAdminPage);
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tutte');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [backendView, setBackendView] = useState(() => backendViewFromPath(window.location.pathname));
  const [brandLists, setBrandLists] = useState({
    showroom: [],
    rivendita: [],
  });
  const [clientReviews, setClientReviews] = useState(fallbackClientReviews);
  const [brandForm, setBrandForm] = useState(emptyBrandForm);
  const [brandImagePreview, setBrandImagePreview] = useState('');
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [productImagePreview, setProductImagePreview] = useState('');
  const [productCategories, setProductCategories] = useState([]);
  const [visibleEdiliziaCategoryCount, setVisibleEdiliziaCategoryCount] = useState(3);
  const [visibleShowroomCategoryCount, setVisibleShowroomCategoryCount] = useState(3);
  const [categoryEditorOpen, setCategoryEditorOpen] = useState(false);
  const [newProductCategory, setNewProductCategory] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('categoria');
  const [placingRenderTag, setPlacingRenderTag] = useState(false);
  const [layoutGridVisible, setLayoutGridVisible] = useState(
    () => window.localStorage.getItem(layoutGridStorageKey) !== 'false'
  );
  const activeProductSection = productSectionFromView(backendView);
  const activeRenderSection = renderSectionFromView(backendView);
  const activePeopleSection = peopleSectionFromView(backendView);
  
  useEffect(() => {
    if (isAdminPage) {
      checkAuthentication();
    }
  }, [isAdminPage]);
  
  useEffect(() => {
    function syncBackendView() {
      const path = window.location.pathname.replace(/\/+$/, '') || '/';
      logoBusyRef.current = false;
      setLogoTransition(null);
      homeServicesCleanupRef.current?.();
      if (activePathRef.current.startsWith('/showroom-render') && !path.startsWith('/showroom-render')) {
        if (renderTransitionRef.current === 'uncovering') {
          setCurrentPath(path);
          return;
        }
        closeRenderRef.current({ fromHistory: true, returnPath: path });
        return;
      }
      renderTransitionRef.current = '';
      setRenderTransition('');
      setCurrentPath(path);
      setBackendView(backendViewFromPath(window.location.pathname));
      if (getMobilePublicScroller()) {
        const destinationScrollTop = Number(window.history.state?.mobileScrollY || 0);
        window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
          scrollPageTo({ top: destinationScrollTop, left: 0, behavior: 'auto' });
        }));
      }
    }
    
    window.addEventListener('popstate', syncBackendView);
    return () => window.removeEventListener('popstate', syncBackendView);
  }, []);

  useLayoutEffect(() => {
    if (!logoTransition) return;
    document.body.classList.add('is-logo-transitioning');
    return () => document.body.classList.remove('is-logo-transitioning');
  }, [Boolean(logoTransition)]);

  function navigatePublic(path) {
    const normalizedPath = path.replace(/\/+$/, '') || '/';
    if (normalizedPath === currentPath) {
      return;
    }

    const enteringRender = normalizedPath.startsWith('/showroom-render');
    const alreadyInRender = currentPath.startsWith('/showroom-render');
    const mobileScroller = getMobilePublicScroller();
    if (mobileScroller) {
      window.history.replaceState({ ...(window.history.state || {}), mobileScrollY: mobileScroller.scrollTop }, '', window.location.href);
    }
    if (enteringRender && !alreadyInRender) {
      renderReturnPathRef.current = currentPath;
      renderReturnScrollRef.current = getPageScrollTop();
      renderHasReturnHistoryRef.current = true;
    }
    homeServicesCleanupRef.current?.();
    const historyState = {
      ...(mobileScroller ? { mobileScrollY: 0 } : {}),
      ...(enteringRender && renderHasReturnHistoryRef.current
        ? { renderReturn: { path: renderReturnPathRef.current, scrollY: renderReturnScrollRef.current } }
        : {}),
    };
    window.history[enteringRender && alreadyInRender ? 'replaceState' : 'pushState'](historyState, '', normalizedPath);
    setCurrentPath(normalizedPath);
    scrollPageTo({ top: 0, left: 0, behavior: 'auto' });
  }

  function changeRenderTransition(phase) {
    renderTransitionRef.current = phase;
    setRenderTransition(phase);
  }

  function openShowroomRender(event, path) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (renderTransitionRef.current) return;
    setMobileMenuPageClosing(false);
    setMobileMenuRenderOpening('');
    closeMobileMenu();
    renderReturnScrollRef.current = getPageScrollTop();
    renderDestinationRef.current = path;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      navigatePublic(path);
      return;
    }
    changeRenderTransition('covering');
  }

  function finishRenderClose() {
    if (renderTransitionRef.current !== 'closing') return;
    renderRestoreScrollRef.current = true;
    renderUncoverPendingRef.current = true;
    if (window.matchMedia('(max-width: 767px)').matches) {
      setMobileMenuRenderOpening('pending');
    }
    // Keep the black cover in place while the destination mounts and its scroll is restored.
    renderTransitionRef.current = 'uncovering';
    returnFromRender();
  }

  function returnFromRender() {
    if (renderCloseFromHistoryRef.current) setCurrentPath(renderReturnPathRef.current);
    else if (renderHasReturnHistoryRef.current) window.history.back();
    else navigatePublic(renderReturnPathRef.current);
  }

  function closeShowroomRender({ fromHistory = false, returnPath } = {}) {
    if (renderTransitionRef.current) return;
    renderCloseFromHistoryRef.current = fromHistory;
    if (returnPath) renderReturnPathRef.current = returnPath;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      renderRestoreScrollRef.current = true;
      returnFromRender();
      return;
    }
    changeRenderTransition('closing');
  }
  closeRenderRef.current = closeShowroomRender;

  function finishRenderTransition() {
    if (renderTransitionRef.current === 'covering') {
      changeRenderTransition('');
      navigatePublic(renderDestinationRef.current);
    } else if (renderTransitionRef.current === 'closing') {
      finishRenderClose();
    } else if (renderTransitionRef.current === 'uncovering') {
      changeRenderTransition('');
    }
  }

  useEffect(() => {
    if (!renderTransition) return undefined;
    const previousOverflow = document.body.style.overflow;
    const mobileScroller = getMobilePublicScroller();
    const previousScrollerOverflow = mobileScroller?.style.overflowY;
    document.body.style.overflow = 'hidden';
    if (mobileScroller) mobileScroller.style.overflowY = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      if (mobileScroller) mobileScroller.style.overflowY = previousScrollerOverflow;
    };
  }, [renderTransition]);

  useEffect(() => {
    if (renderTransition !== 'closing') return undefined;
    // A cached or unfinished image may have no clip-path transition to finish.
    const timeout = window.setTimeout(finishRenderClose, 950);
    return () => window.clearTimeout(timeout);
  }, [renderTransition]);

  useLayoutEffect(() => {
    if (isShowroomRenderPage || !renderRestoreScrollRef.current) return;
    renderRestoreScrollRef.current = false;
    let secondFrame = 0;
    let uncoverFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        window.ScrollTrigger?.refresh();
        scrollPageTo({ top: renderReturnScrollRef.current, left: 0, behavior: 'auto' });
        if (renderUncoverPendingRef.current) {
          uncoverFrame = window.requestAnimationFrame(() => {
            renderUncoverPendingRef.current = false;
            if (renderTransitionRef.current === 'uncovering') setRenderTransition('uncovering');
          });
        }
      });
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.cancelAnimationFrame(uncoverFrame);
    };
  }, [currentPath, isShowroomRenderPage]);
  
  useEffect(() => {
    window.localStorage.setItem(layoutGridStorageKey, String(layoutGridVisible));
  }, [layoutGridVisible]);
  
  useEffect(() => {
    if (brandForm.imageFile) {
      const previewUrl = URL.createObjectURL(brandForm.imageFile);
      setBrandImagePreview(previewUrl);
      
      return () => URL.revokeObjectURL(previewUrl);
    }
    
    if (brandForm.image) {
      const imageUrl = brandForm.image.startsWith('/') || brandForm.image.startsWith('http')
      ? brandForm.image
      : `/${brandForm.image}`;
      setBrandImagePreview(imageUrl);
      return undefined;
    }
    
    if (!brandForm.image && !brandForm.imageFile) {
      setBrandImagePreview('');
      return undefined;
    }
    
    return undefined;
  }, [brandForm.image, brandForm.imageFile]);
  
  useEffect(() => {
    if (productForm.imageFile) {
      const previewUrl = URL.createObjectURL(productForm.imageFile);
      setProductImagePreview(previewUrl);
      
      return () => URL.revokeObjectURL(previewUrl);
    }
    
    if (productForm.image) {
      const imageUrl = productForm.image.startsWith('/') || productForm.image.startsWith('http')
      ? productForm.image
      : `/${productForm.image}`;
      setProductImagePreview(imageUrl);
      return undefined;
    }
    
    if (!productForm.image && !productForm.imageFile) {
      setProductImagePreview('');
      return undefined;
    }
    
    return undefined;
  }, [productForm.image, productForm.imageFile]);
  
  useEffect(() => {
    if (isPublicHome || (isAdminPage && authenticated)) {
      loadBrands();
    }
    
    if (isEdiliziaPage || isShowroomPage || isShowroomRenderPage || isNoleggioPage || isPromozioniPage || isChiSiamoPage || (isAdminPage && authenticated)) {
      loadProducts();
    }
  }, [isPublicHome, isEdiliziaPage, isShowroomPage, isShowroomRenderPage, isNoleggioPage, isPromozioniPage, isChiSiamoPage, isAdminPage, authenticated]);
  
  useEffect(() => {
    if (isPublicHome || isChiSiamoPage) {
      loadGoogleReviews();
    }
  }, [isPublicHome, isChiSiamoPage]);

  useEffect(() => {
    if (isEdiliziaPage) {
      loadProductCategories(productSections['edilizia-prodotti'].category);
      setVisibleEdiliziaCategoryCount(3);
    }
    
    if (isShowroomPage) {
      loadProductCategories(productSections['showroom-prodotti'].category);
      setVisibleShowroomCategoryCount(3);
    }
  }, [isEdiliziaPage, isShowroomPage]);
  
  useEffect(() => {
    if (!isAdminPage || !authenticated || !activeProductSection) {
      return;
    }
    
    setProductCategoryFilter('categoria');
    if (activeProductSection.category === 'Noleggio' || activeProductSection.category === 'Promozioni') {
      setProductCategories([]);
      return;
    }
    
    loadProductCategories(activeProductSection.category);
  }, [isAdminPage, authenticated, activeProductSection?.category]);
  
  useEffect(() => {
    if (!backendView.startsWith('home-brandlist-edit:')) {
      return;
    }
    
    const id = backendView.replace('home-brandlist-edit:', '');
    const brand = [...brandLists.showroom, ...brandLists.rivendita].find((item) => item.id === id);
    if (brand) {
      setBrandForm({ ...emptyBrandForm, ...brand, imageFile: null });
    }
  }, [backendView, brandLists]);
  
  useEffect(() => {
    if (!activeProductSection || activeProductSection.mode !== 'edit') {
      return;
    }
    
    const product = products.find((item) => item.id === activeProductSection.id);
    if (product) {
      setProductForm({
        ...emptyProductForm,
        id: product.id,
        brand: product.brand || product.name || '',
        model: product.model || product.description || '',
        link: product.link || '',
        miniDescription: product.miniDescription || '',
        priceDay: product.priceDay || '',
        priceWeek: product.priceWeek || '',
        priceMonth: product.priceMonth || '',
        originalPrice: product.originalPrice || '',
        discountedPrice: product.discountedPrice || '',
        priceSuffix: product.priceSuffix || '',
        category: product.productCategory || 'categoria',
        image: product.image || '',
        imageFile: null,
      });
    }
  }, [activeProductSection?.mode, activeProductSection?.id, products]);
  
  useEffect(() => {
    if (!activeRenderSection || activeRenderSection.mode !== 'edit') {
      return;
    }
    
    const render = products.find((item) => item.id === activeRenderSection.id);
    if (render) {
      setProductForm({
        ...emptyProductForm,
        id: render.id,
        brand: render.brand || render.name || '',
        model: render.model || '',
        link: render.link || '',
        renderTags: Array.isArray(render.renderTags) ? render.renderTags : [],
        image: render.image || '',
        imageFile: null,
      });
    }
  }, [activeRenderSection?.mode, activeRenderSection?.id, products]);
  
  useEffect(() => {
    if (!activePeopleSection || activePeopleSection.mode !== 'edit') {
      return;
    }
    
    const person = products.find((item) => item.id === activePeopleSection.id);
    if (person) {
      setProductForm({
        ...emptyProductForm,
        id: person.id,
        brand: person.brand || person.name || '',
        model: person.model || person.description || '',
        image: person.image || '',
        imageFile: null,
      });
    }
  }, [activePeopleSection?.mode, activePeopleSection?.id, products]);
  

  
  useLayoutEffect(() => {
    if (!isPublicHome) {
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
    const servicesMedia = gsap.matchMedia();
    servicesMedia.add('(min-width: 768px)', () => {

      function getScrollDistance() {
        return Math.max(0, track.scrollWidth - carousel.clientWidth);
      }

      if (getScrollDistance() <= 0) {
        return;
      }

      const parallaxImages = gsap.utils.toArray('.services-parallax-image');
      const softParallaxImages = gsap.utils.toArray('.services-parallax-image-soft');

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

      function createParallaxTween(image, distance) {
        return gsap.fromTo(
          image,
          { xPercent: -distance },
          {
            xPercent: distance,
            ease: 'none',
            scrollTrigger: {
              trigger: servicesSection,
              start: 'top top',
              end: () => `+=${getScrollDistance()}`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      }

      const parallaxTweens = [
        ...parallaxImages.map((image) => createParallaxTween(image, 30)),
        ...softParallaxImages.map((image) => createParallaxTween(image, 8)),
      ];

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
  });

    const cleanup = () => {
      servicesMedia.revert();
      if (homeServicesCleanupRef.current === cleanup) homeServicesCleanupRef.current = null;
    };
    homeServicesCleanupRef.current = cleanup;
    return cleanup;
}, [isPublicHome]);

async function loadProducts() {
  setBusy(true);
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (response.status === 401) {
      setAuthenticated(false);
      setStatus('Sessione scaduta. Accedi di nuovo.');
      return;
    }
    if (!response.ok) {
      throw new Error(data.error || 'Impossibile caricare il catalogo.');
    }
    setProducts(data.products || []);
  } catch (error) {
    setStatus('Impossibile caricare il catalogo.');
  } finally {
    setBusy(false);
  }
}

async function checkAuthentication() {
  setAuthChecked(false);
  try {
    const response = await fetch(authUrl);
    const data = await response.json();
    setAuthenticated(Boolean(data.authenticated));
  } catch (error) {
    setAuthenticated(false);
  } finally {
    setAuthChecked(true);
  }
}

async function login(event) {
  event.preventDefault();
  setBusy(true);
  setStatus('');
  
  try {
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Accesso non riuscito.');
    }
    
    setPassword('');
    setAuthenticated(true);
  } catch (error) {
    setStatus(error.message);
  } finally {
    setBusy(false);
  }
}

async function logout() {
  setBusy(true);
  try {
    await fetch(authUrl, { method: 'DELETE' });
  } finally {
    setProducts([]);
    setForm(emptyForm);
    navigateBackend('menu', true);
    setAuthenticated(false);
    setStatus('');
    setBusy(false);
  }
}

function navigateBackend(view, replace = false) {
  const path = backendPathForView(view);
  const method = replace ? 'replaceState' : 'pushState';
  window.history[method]({}, '', path);
  setBackendView(view);
}

function updateBrandForm(name, value) {
  setBrandForm((current) => ({ ...current, [name]: value }));
}

function updateProductForm(name, value) {
  setProductForm((current) => ({ ...current, [name]: value }));
}

function updateProductPriceField(name, value) {
  updateProductForm(name, value.replace(/[^0-9,.]/g, ''));
}

function addRenderTag() {
  if (!productImagePreview) {
    setStatus('Carica prima la foto del render.');
    return;
  }
  
  setStatus('');
  setPlacingRenderTag(true);
}

function placeRenderTag(event) {
  if (!placingRenderTag || !productImagePreview) {
    return;
  }
  
  event.preventDefault();
  event.stopPropagation();
  
  const rect = event.currentTarget.getBoundingClientRect();
  const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
  const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
  
  setProductForm((current) => ({
    ...current,
    renderTags: [...(current.renderTags || []), { brand: '', product: '', link: '', x, y }],
  }));
  setPlacingRenderTag(false);
}

function updateRenderTag(index, name, value) {
  setProductForm((current) => ({
    ...current,
    renderTags: (current.renderTags || []).map((tag, tagIndex) => (
      tagIndex === index ? { ...tag, [name]: value } : tag
    )),
  }));
}

function deleteRenderTag(index) {
  setProductForm((current) => ({
    ...current,
    renderTags: (current.renderTags || []).filter((_, tagIndex) => tagIndex !== index),
  }));
}

function resetBrandForm() {
  setBrandForm(emptyBrandForm);
  setStatus('');
}

function resetProductForm() {
  setProductForm(emptyProductForm);
  setPlacingRenderTag(false);
  setStatus('');
}

async function loadProductCategories(section) {
  try {
    const url = `${productCategoriesApiUrl}?section=${encodeURIComponent(section)}`;
    const response = await fetch(url);
    const data = await response.json();
    if (response.status === 401) {
      setAuthenticated(false);
      return;
    }
    if (!response.ok) {
      throw new Error(data.error || 'Impossibile caricare le categorie.');
    }
    
    setProductCategories(data.categories || []);
  } catch (error) {
    setStatus(error.message);
  }
}

async function addProductCategory() {
  if (!activeProductSection || busy) {
    return;
  }
  
  const name = newProductCategory.trim();
  if (!name) {
    return;
  }
  
  setBusy(true);
  setStatus('');
  
  try {
    const response = await fetch(productCategoriesApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, section: activeProductSection.category }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Categoria non salvata.');
    }
    
    setProductCategories(data.categories || []);
    setNewProductCategory('');
    updateProductForm('category', name);
  } catch (error) {
    setStatus(error.message);
  } finally {
    setBusy(false);
  }
}

async function deleteProductCategory(name) {
  if (!activeProductSection) {
    return;
  }
  
  setBusy(true);
  setStatus('');
  
  try {
    const response = await fetch(productCategoriesApiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, section: activeProductSection.category }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Categoria non eliminata.');
    }
    
    setProductCategories(data.categories || []);
    if (productForm.category === name) {
      updateProductForm('category', 'categoria');
    }
    if (productCategoryFilter === name) {
      setProductCategoryFilter('categoria');
    }
  } catch (error) {
    setStatus(error.message);
  } finally {
    setBusy(false);
  }
}

async function loadBrands() {
  try {
    const response = await fetch(brandsApiUrl);
    const data = await response.json();
    if (response.status === 401) {
      setAuthenticated(false);
      return;
    }
    if (!response.ok) {
      throw new Error(data.error || 'Impossibile caricare i brand.');
    }
    
    const grouped = {
      showroom: [],
      rivendita: [],
    };
    (data.brands || []).forEach((brand) => {
      const type = brand.type === 'rivendita' ? 'rivendita' : 'showroom';
      grouped[type].push(brand);
    });
    setBrandLists(grouped);
  } catch (error) {
    setStatus(error.message);
  }
}

async function loadGoogleReviews() {
  try {
    const response = await fetch(googleReviewsApiUrl);
    const data = await response.json();
    const reviews = Array.isArray(data.reviews)
    ? data.reviews.filter((review) => Number(review.rating) === 5 && review.text)
    : [];
    
    if (reviews.length > 0) {
      const featuredAuthors = new Set(fallbackClientReviews.map((review) => review.author.trim().toLowerCase()));
      setClientReviews([
        ...fallbackClientReviews.map((review) => ({
          ...review,
          googleMapsUri: reviews.find((item) => item.author?.trim().toLowerCase() === review.author.trim().toLowerCase())?.googleMapsUri || review.googleMapsUri,
        })),
        ...reviews.filter((review) => !featuredAuthors.has((review.author || '').trim().toLowerCase())),
      ]);
    }
  } catch (error) {
    setClientReviews(fallbackClientReviews);
  }
}

function editBrand(brand) {
  setBrandForm({ ...emptyBrandForm, ...brand, imageFile: null });
  navigateBackend(`home-brandlist-edit:${brand.id}`);
}

async function saveBrand() {
  setBusy(true);
  setStatus('');
  
  const body = new FormData();
  body.append('name', brandForm.name);
  body.append('link', brandForm.link);
  body.append('type', brandForm.type);
  if (brandForm.imageFile) {
    body.append('image', brandForm.imageFile);
  }
  if (brandForm.id) {
    body.append('_method', 'PUT');
  }
  
  const url = brandForm.id ? `${brandsApiUrl}?id=${encodeURIComponent(brandForm.id)}` : brandsApiUrl;
  
  try {
    const response = await fetch(url, { method: 'POST', body });
    const data = await response.json();
    if (response.status === 401) {
      setAuthenticated(false);
      throw new Error('Sessione scaduta. Accedi di nuovo.');
    }
    if (!response.ok) {
      throw new Error(data.error || 'Salvataggio non riuscito.');
    }
    
    resetBrandForm();
    await loadBrands();
    navigateBackend('home-brandlist');
  } catch (error) {
    setStatus(error.message);
  } finally {
    setBusy(false);
  }
}

async function deleteBrand() {
  if (!brandForm.id) {
    resetBrandForm();
    navigateBackend('home-brandlist');
    return;
  }
  
  setBusy(true);
  setStatus('');
  
  try {
    const response = await fetch(`${brandsApiUrl}?id=${encodeURIComponent(brandForm.id)}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (response.status === 401) {
      setAuthenticated(false);
      throw new Error('Sessione scaduta. Accedi di nuovo.');
    }
    if (!response.ok) {
      throw new Error(data.error || 'Eliminazione non riuscita.');
    }
    
    resetBrandForm();
    await loadBrands();
    navigateBackend('home-brandlist');
  } catch (error) {
    setStatus(error.message);
  } finally {
    setBusy(false);
  }
}

const sectionProducts = useMemo(
  () => {
    if (!activeProductSection) {
      return [];
    }
    
    const sectionCategory = activeProductSection.category.toLowerCase();
    return products.filter((product) => (product.category || '').toLowerCase() === sectionCategory);
  },
  [products, activeProductSection?.category]
);

const visibleSectionProducts = useMemo(
  () => sectionProducts.filter((product) => (
    ['Noleggio', 'Promozioni'].includes(activeProductSection?.category)
    || productCategoryFilter === 'categoria'
    || (product.productCategory || '').trim().toLowerCase() === productCategoryFilter.trim().toLowerCase()
  )),
  [sectionProducts, productCategoryFilter, activeProductSection?.category]
);

const showroomRenders = useMemo(
  () => products.filter((product) => (product.category || '').toLowerCase() === renderSection.category.toLowerCase()),
  [products]
);

const latestShowroomRenders = showroomRenders.filter((render) => render.image).slice(0, 4);

const firstShowroomRender = showroomRenders.find((render) => render.image);
const firstShowroomRenderPath = firstShowroomRender
  ? `/showroom-render/${encodeURIComponent(firstShowroomRender.id)}`
  : '/showroom-render';

useEffect(() => {
  if (!isShowroomRenderPage || requestedRenderId || !firstShowroomRender) {
    return;
  }
  window.history.replaceState(window.history.state, '', firstShowroomRenderPath);
  setCurrentPath(firstShowroomRenderPath);
}, [isShowroomRenderPage, requestedRenderId, firstShowroomRenderPath]);

const peopleItems = useMemo(
  () => products.filter((product) => (product.category || '').toLowerCase() === peopleSection.category.toLowerCase()),
  [products]
);

function editSectionProduct(product) {
  if (!activeProductSection) {
    return;
  }
  
  setProductForm({
    ...emptyProductForm,
    id: product.id,
    brand: product.brand || product.name || '',
    model: product.model || product.description || '',
    link: product.link || '',
    miniDescription: product.miniDescription || '',
    priceDay: product.priceDay || '',
    priceWeek: product.priceWeek || '',
    priceMonth: product.priceMonth || '',
    originalPrice: product.originalPrice || '',
    discountedPrice: product.discountedPrice || '',
    priceSuffix: product.priceSuffix || '',
    category: product.productCategory || 'categoria',
    image: product.image || '',
    imageFile: null,
  });
  navigateBackend(`${activeProductSection.base}-edit:${product.id}`);
}

async function saveSectionProduct() {
  if (!activeProductSection) {
    return;
  }
  
  setStatus('');

  const selectedCategory = ['Noleggio', 'Promozioni'].includes(activeProductSection.category)
    ? '' : productForm.category.trim().toLowerCase();
  const originalProduct = sectionProducts.find((product) => product.id === productForm.id);
  const categoryChanged = !originalProduct
    || (originalProduct.productCategory || '').trim().toLowerCase() !== selectedCategory;
  const categoryCount = sectionProducts.filter((product) =>
    product.id !== productForm.id && (product.productCategory || '').trim().toLowerCase() === selectedCategory
  ).length;
  if (categoryChanged && selectedCategory && selectedCategory !== 'categoria' && categoryCount >= maxProductsPerCategory) {
    setStatus('Puoi aggiungere al massimo 7 prodotti per categoria.');
    return;
  }
  
  if (!productForm.image && !productForm.imageFile) {
    setStatus('La foto è obbligatoria.');
    return;
  }
  
  setBusy(true);
  
  const isRentalSection = activeProductSection.category === 'Noleggio';
  const isPromoSection = activeProductSection.category === 'Promozioni';
  const body = new FormData();
  body.append('name', [productForm.brand, productForm.model].filter(Boolean).join(' - ') || productForm.brand);
  body.append('category', activeProductSection.category);
  body.append('description', isRentalSection || isPromoSection ? productForm.miniDescription : productForm.model);
  body.append('price', '0');
  body.append('featured', 'false');
  body.append('brand', productForm.brand);
  body.append('model', productForm.model);
  body.append('link', productForm.link);
  body.append('miniDescription', productForm.miniDescription);
  body.append('priceDay', productForm.priceDay);
  body.append('priceWeek', productForm.priceWeek);
  body.append('priceMonth', productForm.priceMonth);
  body.append('originalPrice', productForm.originalPrice);
  body.append('discountedPrice', productForm.discountedPrice);
  body.append('priceSuffix', productForm.priceSuffix);
  body.append('productCategory', isRentalSection || isPromoSection ? '' : productForm.category);
  if (productForm.imageFile) {
    body.append('image', productForm.imageFile);
  }
  if (productForm.id) {
    body.append('_method', 'PUT');
  }
  
  const url = productForm.id ? `${apiUrl}?id=${encodeURIComponent(productForm.id)}` : apiUrl;
  
  try {
    const response = await fetch(url, { method: 'POST', body });
    const data = await response.json();
    if (response.status === 401) {
      setAuthenticated(false);
      throw new Error('Sessione scaduta. Accedi di nuovo.');
    }
    if (!response.ok) {
      throw new Error(data.error || 'Salvataggio non riuscito.');
    }
    
    resetProductForm();
    await loadProducts();
    navigateBackend(activeProductSection.base);
  } catch (error) {
    setStatus(error.message);
  } finally {
    setBusy(false);
  }
}

async function deleteSectionProduct() {
  if (!activeProductSection) {
    return;
  }
  
  if (!productForm.id) {
    resetProductForm();
    navigateBackend(activeProductSection.base);
    return;
  }
  
  setBusy(true);
  setStatus('');
  
  try {
    const response = await fetch(`${apiUrl}?id=${encodeURIComponent(productForm.id)}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (response.status === 401) {
      setAuthenticated(false);
      throw new Error('Sessione scaduta. Accedi di nuovo.');
    }
    if (!response.ok) {
      throw new Error(data.error || 'Eliminazione non riuscita.');
    }
    
    resetProductForm();
    await loadProducts();
    navigateBackend(activeProductSection.base);
  } catch (error) {
    setStatus(error.message);
  } finally {
    setBusy(false);
  }
}

function editRender(render) {
  setProductForm({
    ...emptyProductForm,
    id: render.id,
    brand: render.brand || render.name || '',
    model: render.model || '',
    link: render.link || '',
    renderTags: Array.isArray(render.renderTags) ? render.renderTags : [],
    image: render.image || '',
    imageFile: null,
  });
  navigateBackend(`${renderSection.base}-edit:${render.id}`);
}

async function saveRender() {
  setStatus('');
  
  if (!productForm.image && !productForm.imageFile) {
    setStatus('La foto è obbligatoria.');
    return;
  }
  
  setBusy(true);
  
  const body = new FormData();
  body.append('name', productForm.brand || `Render ${showroomRenders.length + 1}`);
  body.append('category', renderSection.category);
  body.append('description', productForm.model);
  body.append('price', '0');
  body.append('featured', 'false');
  body.append('brand', productForm.brand);
  body.append('model', productForm.model);
  body.append('link', productForm.link);
  body.append('productCategory', '');
  body.append('renderTags', JSON.stringify(productForm.renderTags || []));
  if (productForm.imageFile) {
    body.append('image', productForm.imageFile);
  }
  if (productForm.id) {
    body.append('_method', 'PUT');
  }
  
  const url = productForm.id ? `${apiUrl}?id=${encodeURIComponent(productForm.id)}` : apiUrl;
  
  try {
    const response = await fetch(url, { method: 'POST', body });
    const data = await response.json();
    if (response.status === 401) {
      setAuthenticated(false);
      throw new Error('Sessione scaduta. Accedi di nuovo.');
    }
    if (!response.ok) {
      throw new Error(data.error || 'Salvataggio non riuscito.');
    }
    
    resetProductForm();
    await loadProducts();
    navigateBackend(renderSection.base);
  } catch (error) {
    setStatus(error.message);
  } finally {
    setBusy(false);
  }
}

async function deleteRender() {
  if (!productForm.id) {
    resetProductForm();
    navigateBackend(renderSection.base);
    return;
  }
  
  setBusy(true);
  setStatus('');
  
  try {
    const response = await fetch(`${apiUrl}?id=${encodeURIComponent(productForm.id)}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (response.status === 401) {
      setAuthenticated(false);
      throw new Error('Sessione scaduta. Accedi di nuovo.');
    }
    if (!response.ok) {
      throw new Error(data.error || 'Eliminazione non riuscita.');
    }
    
    resetProductForm();
    await loadProducts();
    navigateBackend(renderSection.base);
  } catch (error) {
    setStatus(error.message);
  } finally {
    setBusy(false);
  }
}

async function movePerson(id, direction) {
  if (busy) return;
  const index = peopleItems.findIndex((person) => person.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= peopleItems.length) return;

  const ordered = [...peopleItems];
  [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
  const body = new FormData();
  body.append('ids', JSON.stringify(ordered.map((person) => person.id)));
  setBusy(true);
  setStatus('');
  try {
    const response = await fetch(`${apiUrl}?action=reorder-people`, { method: 'POST', body });
    const data = await response.json();
    if (response.status === 401) {
      setAuthenticated(false);
      throw new Error('Sessione scaduta. Accedi di nuovo.');
    }
    if (!response.ok) throw new Error(data.error || 'Salvataggio ordine non riuscito.');
    setProducts(data.products);
    setStatus('Ordine salvato.');
  } catch (error) {
    setStatus(error.message);
  } finally {
    setBusy(false);
  }
}

function editPerson(person) {
  setProductForm({
    ...emptyProductForm,
    id: person.id,
    brand: person.brand || person.name || '',
    model: person.model || person.description || '',
    image: person.image || '',
    imageFile: null,
  });
  navigateBackend(`${peopleSection.base}-edit:${person.id}`);
}

async function savePerson() {
  setStatus('');
  
  if (!productForm.image && !productForm.imageFile) {
    setStatus('La foto è obbligatoria.');
    return;
  }
  
  setBusy(true);
  
  const body = new FormData();
  body.append('name', productForm.brand || `Persona ${peopleItems.length + 1}`);
  body.append('category', peopleSection.category);
  body.append('description', productForm.model);
  body.append('price', '0');
  body.append('featured', 'false');
  body.append('brand', productForm.brand);
  body.append('model', productForm.model);
  body.append('link', '');
  body.append('productCategory', '');
  if (productForm.imageFile) {
    body.append('image', productForm.imageFile);
  }
  if (productForm.id) {
    body.append('_method', 'PUT');
  }
  
  const url = productForm.id ? `${apiUrl}?id=${encodeURIComponent(productForm.id)}` : apiUrl;
  
  try {
    const response = await fetch(url, { method: 'POST', body });
    const data = await response.json();
    if (response.status === 401) {
      setAuthenticated(false);
      throw new Error('Sessione scaduta. Accedi di nuovo.');
    }
    if (!response.ok) {
      throw new Error(data.error || 'Salvataggio non riuscito.');
    }
    
    resetProductForm();
    await loadProducts();
    navigateBackend(peopleSection.base);
  } catch (error) {
    setStatus(error.message);
  } finally {
    setBusy(false);
  }
}

async function deletePerson() {
  if (!productForm.id) {
    resetProductForm();
    navigateBackend(peopleSection.base);
    return;
  }
  
  setBusy(true);
  setStatus('');
  
  try {
    const response = await fetch(`${apiUrl}?id=${encodeURIComponent(productForm.id)}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (response.status === 401) {
      setAuthenticated(false);
      throw new Error('Sessione scaduta. Accedi di nuovo.');
    }
    if (!response.ok) {
      throw new Error(data.error || 'Eliminazione non riuscita.');
    }
    
    resetProductForm();
    await loadProducts();
    navigateBackend(peopleSection.base);
  } catch (error) {
    setStatus(error.message);
  } finally {
    setBusy(false);
  }
}

const categories = useMemo(() => {
  const unique = products
  .map((product) => product.category)
  .filter(Boolean)
  .sort((a, b) => a.localeCompare(b));
  return ['Tutte', ...new Set(unique)];
}, [products]);

const visibleProducts = useMemo(() => {
  const needle = query.trim().toLowerCase();
  return products.filter((product) => {
    const matchesCategory = category === 'Tutte' || product.category === category;
    const haystack = `${product.name} ${product.category} ${product.description}`.toLowerCase();
    return matchesCategory && (!needle || haystack.includes(needle));
  });
}, [products, query, category]);

const ediliziaCategoryTitle = productCategories.find(
  (item) => item.toLowerCase() === productSections['edilizia-prodotti'].category.toLowerCase()
) || productSections['edilizia-prodotti'].category;

const ediliziaProductCategoryTitles = productCategories.length > 0
  ? productCategories
  : [ediliziaCategoryTitle];

const ediliziaProductCategoryGroups = ediliziaProductCategoryTitles.map((title) => ({
  title,
  products: products.filter((product) => (
    product.category === productSections['edilizia-prodotti'].category
    && product.productCategory?.toLowerCase() === title.toLowerCase()
    && product.image
  )),
}));

const visibleEdiliziaProductCategoryGroups = ediliziaProductCategoryGroups.slice(0, visibleEdiliziaCategoryCount);
const hasMoreEdiliziaProductCategories = visibleEdiliziaCategoryCount < ediliziaProductCategoryGroups.length;

const showroomCategoryTitle = productCategories.find(
  (item) => item.toLowerCase() === productSections['showroom-prodotti'].category.toLowerCase()
) || productSections['showroom-prodotti'].category;

const showroomProductCategoryTitles = productCategories.length > 0
  ? productCategories
  : [showroomCategoryTitle];

const showroomProductCategoryGroups = showroomProductCategoryTitles.map((title) => ({
  title,
  products: products.filter((product) => (
    product.category === productSections['showroom-prodotti'].category
    && product.productCategory?.toLowerCase() === title.toLowerCase()
    && product.image
  )),
}));

const visibleShowroomProductCategoryGroups = showroomProductCategoryGroups.slice(0, visibleShowroomCategoryCount);
const hasMoreShowroomProductCategories = visibleShowroomCategoryCount < showroomProductCategoryGroups.length;

const noleggioProducts = products.filter((product) => (
  (product.category || '').toLowerCase() === productSections['noleggio-prodotti'].category.toLowerCase()
  && product.image
));

const promozioniProducts = products.filter((product) => (
  (product.category || '').toLowerCase() === productSections['promozioni-prodotti'].category.toLowerCase()
  && product.image
));

useLayoutEffect(() => {
  if (initialPreloaderPhase !== 'done') return undefined;
  if ((!isPublicHome && !isChiSiamoPage && !isEdiliziaPage) || !('IntersectionObserver' in window)
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const images = document.querySelector(isPublicHome ? '.mission-images' : isChiSiamoPage ? '.chi-siamo-story-images' : '.edilizia-color-center');
  const composition = isPublicHome ? document.querySelector('.mission-composition') : images;
  if (!images || !composition) return;
  images.classList.add('is-reveal-pending');
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    images.classList.add('is-revealed');
    observer.disconnect();
  }, { root: getMobilePublicScroller(), threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  observer.observe(composition);
  return () => {
    observer.disconnect();
    images.classList.remove('is-reveal-pending', 'is-revealed');
  };
}, [initialPreloaderPhase, isPublicHome, isChiSiamoPage, isEdiliziaPage]);

useLayoutEffect(() => {
  if (initialPreloaderPhase !== 'done') return undefined;
  if (!isPublicHome && !isEdiliziaPage && !isShowroomPage && !isNoleggioPage && !isPromozioniPage && !isChiSiamoPage) {
    return undefined;
  }

  const root = document.querySelector(isEdiliziaPage ? '.edilizia-page' : isShowroomPage ? '.showroom-blank-page' : isNoleggioPage ? '.noleggio-page' : isPromozioniPage ? '.promozioni-page' : isChiSiamoPage ? '.chi-siamo-page' : '.blank-page');

  if (!root) {
    return undefined;
  }

  const revealSelectors = [
    '.contact-map-label',
    '.home-hero-copy h1',
    '.home-hero-copy p',
    '.showroom-hero-copy h1',
    '.showroom-blank-hero-copy h1',
    '.noleggio-hero-copy h1',
    '.showroom-store-copy h3',
    '.showroom-store-copy p',
    '.showroom-renders-copy h3',
    '.showroom-renders-copy a',
    '.showroom-info-lead',
    '.showroom-info-cta small',
    '.showroom-info-cta a:not(.showroom-info-whatsapp)',
    '.showroom-info-whatsapp > span',
    '.noleggio-info-lead',
    '.noleggio-info-cta small',
    '.noleggio-info-cta a:not(.noleggio-info-whatsapp)',
    '.noleggio-info-whatsapp > span',
    '.noleggio-service-lead',
    '.noleggio-product-data h3',
    '.noleggio-product-data > p:not(.noleggio-product-prices)',
    '.noleggio-product-prices > span',
    '.promozione-product-data h2',
    '.promozione-product-data > p:not(.promozione-product-prices)',
    '.promozione-product-prices > del',
    '.promozione-product-prices > strong',
    '.promozioni-lead > span',
    '.promozioni-empty',
    '.promozioni-info-lead',
    '.promozioni-info-cta small',
    '.promozioni-info-cta a:not(.promozioni-info-whatsapp)',
    '.promozioni-info-whatsapp > span',
    '.chi-siamo-info-lead',
    '.chi-siamo-intro h1',
    '.chi-siamo-intro p',
    '.chi-siamo-value',
    '.home-section-title > span',
    '.home-mission-text',
    '.services-panel-title > span:not(.text-reveal-line)',
    '.services-text-title',
    '.services-copy p',
    '.services-copy li',
    '.services-edilizia-cta',
    '.services-small-copy',
    '.services-small-list li',
    '.services-showroom-cta',
    '.services-render-cta > span',
    '.services-noleggio-cta',
    '.services-products-cta > span',
    '.home-brands-subtitle',
    '.home-brands-category > span',
    '.home-brand-name > a > span',
    '.home-brand-name > span > span',
    '.client-review h3',
    '.client-review-rating',
    '.client-review p',
    '.client-review a',
    '.home-google-rating-copy',
    '.clients-brand-cta small',
    '.clients-brand-lead',
    '.clients-brand-cta a:not(.clients-brand-whatsapp)',
    '.clients-brand-whatsapp > span',
    '.edilizia-store-lead',
    '.edilizia-store-support',
    '.edilizia-category-group h3',
    '.edilizia-more-products-label',
    '.edilizia-color-center h2',
    '.edilizia-info-cta small',
    '.edilizia-info-lead',
    '.edilizia-info-cta a:not(.edilizia-info-whatsapp)',
    '.edilizia-info-whatsapp > span',
  ];
  const revealElements = Array.from(root.querySelectorAll(revealSelectors.join(',')))
    .filter((element) => !element.matches('.text-reveal-line, .text-reveal-line-inner'));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  revealElements.forEach((element) => {
    element.classList.add('text-mask-reveal');
    element.style.setProperty('--text-reveal-delay', '0ms');

    if (prefersReducedMotion) {
      element.classList.add('is-text-revealed');
    }
  });

  if (!('IntersectionObserver' in window)) {
    revealElements.forEach((element) => {
      element.classList.add('is-text-revealed');
    });

    return () => {
      revealElements.forEach((element) => {
        element.classList.remove('text-mask-reveal', 'is-text-revealed');
        element.style.removeProperty('--text-reveal-delay');
      });
    };
  }

  if (prefersReducedMotion) {
    return () => {
      revealElements.forEach((element) => {
        element.classList.remove('text-mask-reveal', 'is-text-revealed');
        element.style.removeProperty('--text-reveal-delay');
      });
    };
  }

  let revealAnimationFrame = 0;

  function revealVisibleText() {
    revealAnimationFrame = 0;
    revealElements.forEach((element) => {
      if (element.classList.contains('is-text-revealed')) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const viewportHeight = getMobilePublicScroller()?.clientHeight || window.innerHeight;
      if (rect.top < viewportHeight * 0.96 && rect.bottom > 0 && rect.left < window.innerWidth && rect.right > 0) {
        element.classList.add('is-text-revealed');
      }
    });
  }

  function scheduleRevealVisibleText() {
    if (revealAnimationFrame) {
      return;
    }

    revealAnimationFrame = window.requestAnimationFrame(revealVisibleText);
  }

  window.requestAnimationFrame(revealVisibleText);
  const revealTimeout = window.setTimeout(revealVisibleText, 120);
  const scrollTarget = getMobilePublicScroller() || window;
  scrollTarget.addEventListener('scroll', scheduleRevealVisibleText, { passive: true });
  window.addEventListener('resize', scheduleRevealVisibleText);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add('is-text-revealed');
      observer.unobserve(entry.target);
    });
  }, {
    root: getMobilePublicScroller(),
    rootMargin: '0px 0px -8% 0px',
    threshold: 0.08,
  });

  revealElements.forEach((element) => {
    if (element.classList.contains('is-text-revealed')) {
      return;
    }

    observer.observe(element);
  });

  return () => {
    observer.disconnect();
    window.clearTimeout(revealTimeout);
    scrollTarget.removeEventListener('scroll', scheduleRevealVisibleText);
    window.removeEventListener('resize', scheduleRevealVisibleText);
    if (revealAnimationFrame) {
      window.cancelAnimationFrame(revealAnimationFrame);
    }
    revealElements.forEach((element) => {
      element.classList.remove('text-mask-reveal', 'is-text-revealed');
      element.style.removeProperty('--text-reveal-delay');
    });
  };
}, [
  isPublicHome,
  initialPreloaderPhase,
  isEdiliziaPage,
  isShowroomPage,
  isNoleggioPage,
  isPromozioniPage,
  isChiSiamoPage,
  currentPath,
  brandLists.showroom.length,
  brandLists.rivendita.length,
  clientReviews.length,
  productCategories,
  visibleEdiliziaCategoryCount,
  visibleEdiliziaProductCategoryGroups.length,
  visibleShowroomCategoryCount,
  visibleShowroomProductCategoryGroups.length,
  noleggioProducts.length,
  promozioniProducts.length,
]);

function updateField(name, value) {
  setForm((current) => ({ ...current, [name]: value }));
}

function editProduct(product) {
  setForm({
    ...product,
    price: String(product.price ?? ''),
    file: null,
  });
  setStatus('Modifica il prodotto selezionato.');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
  setForm(emptyForm);
  setStatus('');
}

async function saveProduct(event) {
  event.preventDefault();
  setBusy(true);
  setStatus('');
  
  const body = new FormData();
  body.append('name', form.name);
  body.append('category', form.category);
  body.append('description', form.description);
  body.append('price', form.price);
  body.append('featured', String(form.featured));
  if (form.id) {
    body.append('_method', 'PUT');
  }
  
  const url = form.id ? `${apiUrl}?id=${encodeURIComponent(form.id)}` : apiUrl;
  const method = 'POST';
  
  try {
    const response = await fetch(url, { method, body });
    const data = await response.json();
    if (response.status === 401) {
      setAuthenticated(false);
      throw new Error('Sessione scaduta. Accedi di nuovo.');
    }
    if (!response.ok) {
      throw new Error(data.error || 'Salvataggio non riuscito.');
    }
    
    setStatus(form.id ? 'Prodotto aggiornato.' : 'Prodotto creato.');
    setForm(emptyForm);
    await loadProducts();
  } catch (error) {
    setStatus(error.message);
  } finally {
    setBusy(false);
  }
}

async function deleteProduct(product) {
  const confirmed = window.confirm(`Eliminare "${product.name}" dal catalogo?`);
  if (!confirmed) {
    return;
  }
  
  setBusy(true);
  try {
    const response = await fetch(`${apiUrl}?id=${encodeURIComponent(product.id)}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (response.status === 401) {
      setAuthenticated(false);
      throw new Error('Sessione scaduta. Accedi di nuovo.');
    }
    if (!response.ok) {
      throw new Error(data.error || 'Eliminazione non riuscita.');
    }
    
    if (form.id === product.id) {
      resetForm();
    }
    setStatus('Prodotto eliminato.');
    await loadProducts();
  } catch (error) {
    setStatus(error.message);
  } finally {
    setBusy(false);
  }
}

  function renderGridControls() {
    return (
      <>
    {!isAdminPage && !isPreloaderPage && !isShowroomRenderPage && initialPreloaderPhase !== 'done' && (
      <div className={`site-preloader${initialPreloaderPhase === 'fading' ? ' is-fading' : ''}`} aria-label="Caricamento pagina">
      <PreloaderTestPage />
      </div>
    )}
    {!isAdminPage && !isPreloaderPage && !isShowroomRenderPage && <BackToTop key={currentPath} />}
    <RenderPageTransition phase={renderTransition} onComplete={finishRenderTransition} />
    {logoTransition && <HeaderLogoTransition transition={logoTransition}
      onSwap={() => {
        navigatePublic(logoTransition.path);
        setLogoTransition({ ...logoTransition, phase: 'resize' });
      }}
      onDone={() => { logoBusyRef.current = false; setLogoTransition(null); }} />}
    {!isAdminPage && !isPreloaderPage && renderMobileMenu()}
    <button
    className="grid-toggle"
    type="button"
    aria-label={layoutGridVisible ? 'Nascondi griglia layout' : 'Mostra griglia layout'}
    aria-pressed={layoutGridVisible}
    title={layoutGridVisible ? 'Nascondi griglia layout' : 'Mostra griglia layout'}
    onClick={() => setLayoutGridVisible((visible) => !visible)}
    >
    <span aria-hidden="true">#</span>
    </button>
    
    {layoutGridVisible && (
      <div className="layout-grid-overlay" aria-hidden="true">
      <div className="layout-grid-inner">
      {Array.from({ length: 8 }).map((_, index) => (
        <div className="layout-grid-column" key={index} />
      ))}
      </div>
      </div>
    )}
    </>
    );
  }

  async function handlePublicNavClick(event, path, { animateLogo = true, animateLogoOnMobile = false } = {}) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button > 0) return;
    event.preventDefault();
    if (logoBusyRef.current) return;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const fromMobileMenu = isMobile && event.currentTarget?.closest('.mobile-menu');
    if (fromMobileMenu) {
      setMobileMenuPageClosing(true);
      setMobileMenuRenderOpening('');
    }
    if (!animateLogo && !(isMobile && animateLogoOnMobile)) {
      closeMobileMenu();
      navigatePublic(path);
      return;
    }
    const source = document.querySelector('.home-logo img');
    const sourceFrame = isMobile
      ? [...document.querySelectorAll('.home-logo')].find((element) => {
        const bounds = element.getBoundingClientRect();
        return bounds.width > 0 && bounds.height > 0 && bounds.bottom > 0 && bounds.top < window.innerHeight;
      })
      : source;
    const fromSrc = sourceFrame?.querySelector('img')?.getAttribute('src') || source?.getAttribute('src');
    const toSrc = headerLogoForPath(path);
    closeMobileMenu();
    if (!source || !sourceFrame || fromSrc === toSrc || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      navigatePublic(path);
      return;
    }
    const from = sourceFrame?.getBoundingClientRect();
    if (!from?.width || !from.height || from.bottom <= 0) {
      navigatePublic(path);
      return;
    }
    if (isMobile) {
      logoBusyRef.current = true;
      navigatePublic(path);
      setLogoTransition({
        phase: 'out',
        mobile: true,
        from: { left: from.left, top: from.top, width: from.width, height: from.height },
        fromSrc,
        toSrc,
        path,
      });
      return;
    }
    logoBusyRef.current = true;
    try {
      const heroSrc = {
        '/': '/assets/home/fullscreenHome.jpeg',
        '/showroom': '/assets/home/headerShowroom.webp',
        '/noleggio': '/assets/home/headerNoleggio.webp',
        '/edilizia': '/assets/home/ediliziaHeader.webp',
        '/promozioni': '/assets/home/headerPromozioni.webp',
      }[path];
      await Promise.all([toSrc, heroSrc].filter(Boolean).map(async (src) => {
        const image = new Image();
        image.src = src;
        await image.decode();
      }));
      if (!logoBusyRef.current) return;
      setLogoTransition({ phase: 'out', from: { left: from.left + window.scrollX, top: from.top + getPageScrollTop(), width: from.width, height: from.height }, fromSrc, toSrc, path });
    } catch {
      logoBusyRef.current = false;
      navigatePublic(path);
    }
  }

  function renderMobileMenu() {
    const navItems = [
      { key: 'edilizia', label: 'EDILIZIA', href: '/edilizia' },
      { key: 'showroom', label: 'SHOWROOM', href: '/showroom' },
      { key: 'noleggio', label: 'NOLEGGIO', href: '/noleggio' },
      { key: 'promozioni', label: 'PROMOZIONI', href: '/promozioni' },
      { key: 'chi-siamo', label: 'CHI SIAMO', href: '/chi-siamo' },
    ];
    const active = {
      '/edilizia': 'edilizia',
      '/showroom': 'showroom',
      '/noleggio': 'noleggio',
      '/promozioni': 'promozioni',
      '/chi-siamo': 'chi-siamo',
    }[publicPath] || (isShowroomRenderPage ? 'showroom' : '');
    const mobileMenuLabel = navItems.find((item) => item.key === active)?.label || 'MENU';

    return ReactDOM.createPortal(
      <div className={`mobile-menu${mobileMenuButtonOpen ? ' is-open' : ''}${mobileMenuPanelOpen ? ' is-panel-open' : ''}${mobileMenuBottomCollapsed ? ' is-bottom-collapsed' : ''}${mobileMenuPageClosing ? ' is-page-closing' : ''}${isShowroomRenderPage ? ' is-render-page' : ''}${renderTransition === 'covering' ? ' is-render-closing' : ''}${mobileMenuRenderOpening === 'pending' ? ' is-render-opening-pending' : ''}${mobileMenuRenderOpening === 'opening' ? ' is-render-opening' : ''}`}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget && event.animationName === 'mobileMenuRenderOpen') {
            setMobileMenuRenderOpening('');
          }
        }}
        data-phase={mobileMenuPhase}
        role={mobileMenuOpen ? 'dialog' : undefined} aria-modal={mobileMenuOpen ? true : undefined}
        aria-label={mobileMenuOpen ? 'Menu principale' : undefined}>
        <div id="mobile-menu-panel" className="mobile-menu-panel"
          aria-hidden={!mobileMenuPanelOpen} inert={mobileMenuPanelOpen ? undefined : ''}>
          <nav className="mobile-menu-links" aria-label="Navigazione mobile">
            {navItems.map((item) => (
              <a key={item.key} href={item.href} aria-current={active === item.key ? 'page' : undefined}
                onClick={(event) => handlePublicNavClick(event, item.href, { animateLogo: false, animateLogoOnMobile: true })}>
                {item.label}
              </a>
            ))}
          </nav>
          <address className="mobile-menu-contact">
            <span>Via Paolo Borsellino, 2<br />89024 - Polistena (RC)</span>
            <a href="tel:+390966941019">+39 0966 941019</a>
          </address>
          <div className="mobile-menu-social">
            <a href="https://wa.me/390966941019" target="_blank" rel="noreferrer"><span>WHATSAPP</span><ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon></a>
            <a href="https://www.instagram.com/bigmat_etnasso/" target="_blank" rel="noreferrer"><span>INSTAGRAM</span><ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon></a>
            <a href="mailto:amministrazione.etnsrl@bigmat.it"><span>EMAIL</span><ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon></a>
          </div>
        </div>
        <button className="mobile-menu-toggle" type="button" aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Chiudi menu' : 'Apri menu'}
          aria-controls="mobile-menu-panel"
          onClick={() => mobileMenuPhase === 'closed' ? setMobileMenuPhase('button-opening') : closeMobileMenu()}>
          <span className={`mobile-menu-toggle-label${mobileMenuLabel.length > 8 ? ' is-long' : ''}`}>{mobileMenuLabel}</span>
          <span className="mobile-menu-icon" aria-hidden="true"><i /><i /><i /></span>
        </button>
      </div>, document.body, 'mobile-public-menu'
    );
  }

  function renderPublicNav({ active = '', logo = '/assets/logos/BigMat_ETN_Logo_Header.svg', logoAlt = 'BigMat ET Nasso', tone = 'default' } = {}) {
    const navItems = [
      { key: 'edilizia', label: 'EDILIZIA', href: '/edilizia', className: 'home-nav-edilizia' },
      { key: 'showroom', label: 'SHOWROOM', href: '/showroom', className: 'home-nav-showroom' },
      { key: 'noleggio', label: 'NOLEGGIO', href: '/noleggio', className: 'home-nav-noleggio' },
      { key: 'promozioni', label: 'PROMOZIONI', href: '/promozioni', className: 'home-nav-promozioni' },
      { key: 'chi-siamo', label: 'CHI SIAMO', href: '/chi-siamo', className: 'home-nav-chi-siamo' },
    ];
    return (
      <>
      <nav className={`home-nav ${tone === 'light' ? 'showroom-nav' : ''}`} aria-label="Navigazione principale">
      <a className="home-logo" href="/" aria-label={logoAlt} onClick={(event) => handlePublicNavClick(event, '/')}>
      <img src={logo} alt={logoAlt} />
      </a>
      {navItems.map((item) => (
        <a
        className={`home-nav-item ${item.className} ${active === item.key ? 'is-active' : ''}`}
        href={item.href}
        key={item.key}
        onClick={(event) => handlePublicNavClick(event, item.href, { animateLogo: false, animateLogoOnMobile: true })}
        >
        {item.label}
        </a>
      ))}
      <a className="home-nav-item home-nav-contattaci" href="#footer-contatti" onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button > 0) return;
        event.preventDefault();
        document.getElementById('footer-contatti')?.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
          block: 'start',
        });
      }}>CONTATTACI</a>
      </nav>
      </>
    );
  }

if (isPreloaderPage) {
  return <PreloaderTestPage />;
}

if (isShowroomRenderPage) {
  const renders = showroomRenders.filter((render) => render.image);
  const renderIndex = requestedRenderId
    ? renders.findIndex((render) => encodeURIComponent(render.id) === requestedRenderId)
    : 0;
  const render = renders[renderIndex];
  function navigateRender(index) {
    if (!renderTransitionRef.current && renders[index]) {
      navigatePublic(`/showroom-render/${encodeURIComponent(renders[index].id)}`);
    }
  }
  return (
    <>
    {renderGridControls()}
    <main className={`showroom-render-page${renderTransition === 'closing' ? ' is-closing' : ''}`}>
    <button className="showroom-render-close" type="button" aria-label="Torna alla pagina precedente" title="Torna alla pagina precedente" onClick={() => closeShowroomRender()} disabled={Boolean(renderTransition)}>
    </button>
    <section className="showroom-render-gallery" aria-label="Render showroom" aria-busy={busy}>
    {render && (
      <ShowroomRenderImage render={render} key={render.id} closing={renderTransition === 'closing'} onClosed={finishRenderClose} />
    )}
    {!render && (
      <p className="showroom-render-status" role="status">{busy ? 'Caricamento render...' : status || (requestedRenderId ? 'Render non trovato.' : 'Nessun render disponibile.')}</p>
    )}
    <div className="showroom-render-controls">
    <nav className="showroom-render-navigation" aria-label="Seleziona render">
    {renders.length > 1 && (
      <button className="showroom-render-navigation-button showroom-render-navigation-button-prev" type="button" aria-label="Render precedente" title="Render precedente" onClick={() => navigateRender(renderIndex - 1)} disabled={Boolean(renderTransition) || renderIndex <= 0}>
      <span className="showroom-render-navigation-icon showroom-render-navigation-icon-prev" aria-hidden="true" />
      </button>
    )}
    <div className="showroom-render-indicators">
      {renders.map((item, index) => (
        <button className="showroom-render-indicator" type="button" key={item.id}
          aria-label={`Visualizza Render_${String(index + 1).padStart(2, '0')}`}
          title={`Render_${String(index + 1).padStart(2, '0')}`}
          aria-current={index === renderIndex ? 'true' : undefined}
          onClick={() => navigateRender(index)} disabled={Boolean(renderTransition)}>
          <span aria-hidden="true"></span>
        </button>
      ))}
    </div>
    {renders.length > 1 && (
      <button className="showroom-render-navigation-button showroom-render-navigation-button-next" type="button" aria-label="Render successivo" title="Render successivo" onClick={() => navigateRender(renderIndex + 1)} disabled={Boolean(renderTransition) || renderIndex < 0 || renderIndex >= renders.length - 1}>
      <span className="showroom-render-navigation-icon showroom-render-navigation-icon-next" aria-hidden="true" />
      </button>
    )}
    </nav>
    {render && <span className="showroom-render-label">RENDER_{String(renderIndex + 1).padStart(2, '0')}</span>}
    </div>
    </section>
    </main>
    </>
  );
}

if (isShowroomPage) {
  return (
    <>
    {renderGridControls()}
    <main className="showroom-blank-page">
    <section className="showroom-blank-section showroom-blank-section-hero">
    {renderPublicNav({
      active: 'showroom',
      logo: '/assets/logos/HabiMar_Logo_Header.svg',
      logoAlt: 'HabiMat ET Nasso',
      tone: 'light',
    })}
    <img className="showroom-blank-hero-image" src="/assets/home/headerShowroom.webp" alt="" aria-hidden="true" />
    <div className="showroom-blank-hero-copy">
    <h1>
    <span className="showroom-hero-title-desktop">
    <RevealLines lines={['Diamo vita alle tue idee', 'trovando soluzioni', 'su misura.']} />
    </span>
    <span className="showroom-hero-title-mobile">
    <RevealLines lines={['Diamo vita', 'alle tue idee', 'trovando soluzioni', 'su misura.']} />
    </span>
    </h1>
    </div>
    </section>
    <section className="showroom-blank-section showroom-store">
    <h2 className="home-section-title"><span><RevealLines lines={['Il nostro showroom']} /></span></h2>
    <div className="showroom-store-copy">
    <h3>
    <span className="showroom-store-title-desktop">
    <RevealLines lines={['Trattiamo articoli dal design', 'innovativo e funzionale', 'pensati per esprimere', 'solidità e qualità formale.']} />
    </span>
    <span className="showroom-store-title-mobile">
    <RevealLines lines={['Trattiamo articoli', 'dal design', 'innovativo', 'e funzionale', 'pensati per esprimere', 'solidità e qualità formale.']} />
    </span>
    </h3>
    <p>
    <span className="showroom-store-concepts-desktop">
    <RevealLines lines={['I concetti di rivestimento,', 'illuminazione, arredobagno,', 'rubinetteria e sanitari', 'espressi ai massimi livelli.']} />
    </span>
    <span className="showroom-store-concepts-mobile">
    <RevealLines lines={['I concetti di rivestimento, illuminazione, arredobagno, rubinetteria e sanitari espressi ai massimi livelli.']} />
    </span>
    </p>
    </div>
    </section>
    <section className="showroom-blank-section showroom-products-section">
    <h2 className="home-section-title"><span><RevealLines lines={['I nostri prodotti']} /></span></h2>
    <div className="edilizia-category-feature showroom-category-feature" style={{ '--category-motion-duration': `${categoryProductHover.animationMs}ms` }}>
    {visibleShowroomProductCategoryGroups.map((group) => (
      <div className="edilizia-category-group" key={group.title}>
      <h3><RevealLines lines={[group.title]} /></h3>
      <div className="edilizia-category-images">
      {group.products.length > 0 ? group.products.map((product) => {
        const productImage = assetUrl(product.image);
        return (
          <article key={product.id} {...categoryProductHover.productProps(product.id)}>
          <a href={product.link || '/prodotti'} target={product.link ? '_blank' : undefined} rel={product.link ? 'noreferrer' : undefined}>
          <img src={productImage} alt={product.name} />
          <span>
          <strong>{product.brand || product.name}</strong>
          <em>{product.model || product.miniDescription || group.title}</em>
          </span>
          <ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon>
          </a>
          </article>
        );
      }) : (
        <article>
        <div className="edilizia-category-link">
        <span>
        <strong>{group.title}</strong>
        <em>Prodotti in arrivo</em>
        </span>
        </div>
        </article>
      )}
      </div>
      </div>
    ))}
    {hasMoreShowroomProductCategories && (
      <button
        className="edilizia-more-products showroom-more-products"
        type="button"
        onClick={() => setVisibleShowroomCategoryCount((count) => Math.min(count + 1, showroomProductCategoryGroups.length))}
      >
      <span className="edilizia-more-products-label"><RevealLines lines={['GUARDA ALTRI PRODOTTI']} /></span>
      <span className="edilizia-more-products-plus" aria-hidden="true">+</span>
      </button>
    )}
    </div>
    </section>
    <section className="showroom-blank-section showroom-renders-section">
    <h2 className="home-section-title"><span><RevealLines lines={['I nostri render']} /></span></h2>
    <div className="showroom-renders-copy">
    <h3>
    <span className="showroom-renders-title-desktop">
    <RevealLines lines={['Rendiamo le tue idee', 'visualizzabili con i render', 'realizzati su misura', 'dai nostri professionisti.']} />
    </span>
    <span className="showroom-renders-title-mobile">
    <RevealLines lines={['Rendiamo', 'le tue idee', 'visualizzabili', 'con i render', 'realizzati su misura', 'dai nostri', 'professionisti.']} />
    </span>
    </h3>
    {latestShowroomRenders.length > 0 && (
      <div className="showroom-renders-collage" aria-label="Gli ultimi render dello showroom">
      {latestShowroomRenders.map((render) => {
        const path = `/showroom-render/${encodeURIComponent(render.id)}`;
        return (
          <a className="showroom-renders-preview" key={render.id} href={path} onClick={(event) => openShowroomRender(event, path)} aria-label={`Visualizza ${render.name || 'render'}`}>
            <img src={assetUrl(render.image)} alt={render.name || 'Render showroom'} loading="lazy" />
          </a>
        );
      })}
      </div>
    )}
    <a className="showroom-renders-cta" href={firstShowroomRenderPath} onClick={(event) => openShowroomRender(event, firstShowroomRenderPath)}>
    <RevealLines lines={['VISUALIZZA I RENDER']} />
    </a>
    </div>
    </section>
    <section className="showroom-info-section">
    <p className="showroom-info-cta">
    <ContactDetails prefix="showroom-info" lead={['Per approfondire', 'le nostre collezioni', 'visita il nostro showroom', 'o contattaci.']} />
    </p>
    </section>
    <footer id="footer-contatti" className="home-section home-section-final home-footer showroom-footer">
    <img className="home-footer-image" src="/assets/home/footerShowroom.webp" alt="" aria-hidden="true" />
    <nav className="home-footer-links" aria-label="Contatti footer">
    <a className="home-footer-link-instagram" href="https://www.instagram.com/bigmat_etnasso/" target="_blank" rel="noreferrer" aria-label="Instagram">
    <span>INSTAGRAM</span>
    <ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon>
    </a>
    <a className="home-footer-link-whatsapp" href="https://wa.me/390966941019" target="_blank" rel="noreferrer">
    <span>WHATSAPP</span>
    <ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon>
    </a>
    <a className="home-footer-link-email" href="mailto:amministrazione.etnsrl@bigmat.it">
    <span>EMAIL</span>
    <ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon>
    </a>
    </nav>
    <div className="home-footer-logos" aria-label="Loghi ETN">
    <div className="home-footer-logos-group">
    <img className="home-footer-logo-bigmat" src="/assets/logos/BigMat_Logo_Footer.svg" alt="BigMat ETN" />
    <img className="home-footer-logo-bigrent" src="/assets/logos/BigRent_Logo_Footer.svg" alt="BigRent ETN" />
    <img className="home-footer-logo-habimat" src="/assets/logos/HabiMat_Logo_Footer.svg" alt="HabiMat ETN" />
    </div>
    </div>
    <p className="home-footer-credits">
    DESIGNED BY <a href="https://www.instagram.com/fliesneverlie/" target="_blank" rel="noreferrer">FLIESNEVERLIE</a>
    <br />
    DEVELOPED BY <a href="https://www.crxtianhub.com/" target="_blank" rel="noreferrer">CRXTIANHUB</a>
    </p>
    <p className="home-footer-copyright">©BIGMATETNASSO2026</p>
    </footer>
    <CompanyDetailsBar />
    </main>
    </>
  );
}

if (isChiSiamoPage) {
  return (
    <>
    {renderGridControls()}
    <main className="chi-siamo-page">
    <section className="chi-siamo-hero">
    {renderPublicNav({ active: 'chi-siamo' })}
    <div className="chi-siamo-intro">
    <h1>
    <RevealLines lines={['Dal 1986 ad oggi,', 'con cura e passione,', 'siamo diventati', 'un punto di riferimento', 'nel nostro settore.']} />
    </h1>
    <div className="chi-siamo-story">
    <p>
    <RevealLines lines={[
      <>Abbiamo fondato <em>BigMat ETN S.r.l.</em> nel 1986,</>,
      'e possiamo dire di essere una realtà concreta',
      'nel territorio della piana di Gioia Tauro e non solo.',
      'Sin da subito abbiamo creato un rapporto con i nostri',
      'clienti basato sulla fiducia, e conservandolo con cura',
      'siamo arrivati ad oggi.',
    ]} />
    </p>
    <p>
    <RevealLines lines={[
      'Quando scegli noi sai di trovare un’azienda sana',
      'con un personale formato e competente pronto',
      'a soddisfare le tue esigenze con passione',
      'e dedizione.',
    ]} />
    </p>
    <p>
    <RevealLines lines={[
      'Oltre alla qualità dei nostri servizi e prodotti',
      'mettiamo in campo le nostre qualità individuali',
      'e collettive senza perdere mai di vista l’obiettivo:',
      'la tua soddisfazione.',
    ]} />
    </p>
    <p className="chi-siamo-motto">
    <RevealLines lines={[<em>I tuoi desideri, sono anche i nostri.</em>]} />
    </p>
    </div>
    <div className="chi-siamo-story-images">
    <img className="chi-siamo-image-primary" src="/assets/home/chiSiamo1.webp" alt="La sede BigMat ET Nasso" />
    <img className="chi-siamo-image-secondary" src="/assets/home/chiSiamo2.webp" alt="Vista dall'alto della sede" />
    </div>
    <div className="chi-siamo-values">
    <h2 className="chi-siamo-value chi-siamo-value-quality"><RevealLines lines={['qualità']} /></h2>
    <h2 className="chi-siamo-value chi-siamo-value-expertise"><RevealLines lines={['competenza']} /></h2>
    <h2 className="chi-siamo-value chi-siamo-value-passion"><RevealLines lines={['passione']} /></h2>
    </div>
    <p className="chi-siamo-values-copy">
    <RevealLines lines={['sono gli elementi', 'imprescindibili', 'del nostro lavoro.']} />
    </p>
    </div>
    </section>
    <section className="chi-siamo-section chi-siamo-team">
    <h2 className="home-section-title"><span><RevealLines lines={['La nostra squadra']} /></span></h2>
    <figure className="chi-siamo-team-person chi-siamo-founders">
      <img src="/assets/home/Paride_Pino.webp" alt="Giuseppe Nasso e Paride Nasso, fondatori" loading="lazy" />
      <figcaption>
        <h3>Paride Nasso, Giuseppe Nasso</h3>
        <p>fondatori</p>
      </figcaption>
    </figure>
    {peopleItems.some((person) => person.image) && (
      <div className="chi-siamo-team-grid">
        {peopleItems.filter((person) => person.image).map((person) => (
          <figure className="chi-siamo-team-person" key={person.id}>
            <img src={assetUrl(person.image)} alt={person.brand || person.name} loading="lazy" />
            <figcaption>
              <h3>{person.brand || person.name}</h3>
              {(person.model || person.description) && <p>{person.model || person.description}</p>}
            </figcaption>
          </figure>
        ))}
      </div>
    )}
    </section>
    <section className="home-section-clients chi-siamo-reviews">
    <CustomerReviews reviews={clientReviews} />
    </section>
    <section className="showroom-info-section chi-siamo-info-section">
    <p className="showroom-info-cta">
    <ContactDetails prefix="showroom-info" />
    </p>
    </section>
    <footer id="footer-contatti" className="home-section home-section-final home-footer chi-siamo-footer">
    <img className="home-footer-image" src="/assets/home/footerChiSiamo.webp" alt="" aria-hidden="true" />
    <nav className="home-footer-links" aria-label="Contatti footer">
    <a className="home-footer-link-instagram" href="https://www.instagram.com/bigmat_etnasso/" target="_blank" rel="noreferrer" aria-label="Instagram"><span>INSTAGRAM</span><ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon></a>
    <a className="home-footer-link-whatsapp" href="https://wa.me/390966941019" target="_blank" rel="noreferrer"><span>WHATSAPP</span><ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon></a>
    <a className="home-footer-link-email" href="mailto:amministrazione.etnsrl@bigmat.it"><span>EMAIL</span><ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon></a>
    </nav>
    <div className="home-footer-logos" aria-label="Loghi ETN"><div className="home-footer-logos-group">
    <img className="home-footer-logo-bigmat" src="/assets/logos/BigMat_Logo_Footer.svg" alt="BigMat ETN" />
    <img className="home-footer-logo-bigrent" src="/assets/logos/BigRent_Logo_Footer.svg" alt="BigRent ETN" />
    <img className="home-footer-logo-habimat" src="/assets/logos/HabiMat_Logo_Footer.svg" alt="HabiMat ETN" />
    </div></div>
    <p className="home-footer-credits">DESIGNED BY <a href="https://www.instagram.com/fliesneverlie/" target="_blank" rel="noreferrer">FLIESNEVERLIE</a><br />DEVELOPED BY <a href="https://www.crxtianhub.com/" target="_blank" rel="noreferrer">CRXTIANHUB</a></p>
    <p className="home-footer-copyright">©BIGMATETNASSO2026</p>
    </footer>
    <CompanyDetailsBar />
    </main>
    </>
  );
}

if (isPromozioniPage) {
  return (
    <>
    {renderGridControls()}
    <main className="promozioni-page">
    <section className="promozioni-hero">
    <img className="promozioni-hero-image" src="/assets/home/headerPromozioni.webp" alt="" aria-hidden="true" />
    {renderPublicNav({ active: 'promozioni', tone: 'light' })}
    <h1 className="promozioni-lead">
    <span><RevealLines lines={['Selezioniamo per te', 'i prezzi più vantaggiosi', 'senza perdere di vista', 'la qualità.']} /></span>
    </h1>
    </section>
    <section className="promozioni-products-section">
    <h2 className="home-section-title promozioni-active-title"><span><RevealLines lines={['Le nostre promozioni attive']} /></span></h2>
    <div className="promozioni-product-list">
    {promozioniProducts.map((product) => {
      const productLink = product.link?.trim();
      const ProductElement = productLink ? 'a' : 'article';
      return (
      <ProductElement
      className={`promozione-product-item${productLink ? ' is-linked' : ''}`}
      key={product.id}
      href={productLink || undefined}
      target={productLink ? '_blank' : undefined}
      rel={productLink ? 'noreferrer' : undefined}
      >
      <img src={assetUrl(product.image)} alt={product.name || product.brand || product.model || 'Promozione'} />
      <div className="promozione-product-data">
      {product.brand && <p className="promozione-product-brand"><RevealLines lines={[product.brand]} /></p>}
      {(product.model || product.name) && <h2><RevealLines lines={[product.model || product.name]} /></h2>}
      {product.miniDescription && <p className="promozione-product-description"><RevealLines lines={product.miniDescription.split('\n')} /></p>}
      {(product.originalPrice || product.discountedPrice) && (
        <p className="promozione-product-prices">
        {product.originalPrice && <del><RevealLines lines={[<>&euro; {product.originalPrice} + IVA</>]} /></del>}
        {product.discountedPrice && <strong><RevealLines lines={[<>&euro; {product.discountedPrice}{product.priceSuffix?.trim() ? ` ${product.priceSuffix.trim()}` : ''} + IVA</>]} /></strong>}
        </p>
      )}
      </div>
      {productLink && <ion-icon class="promozione-product-arrow" name="arrow-up-sharp" aria-hidden="true"></ion-icon>}
      </ProductElement>
      );
    })}
    {promozioniProducts.length === 0 && <p className="promozioni-empty"><RevealLines lines={['Nessuna promozione disponibile.']} /></p>}
    </div>
    </section>
    <section className="promozioni-info-section">
    <p className="promozioni-info-cta">
    <ContactDetails prefix="promozioni-info" />
    </p>
    </section>
    <footer id="footer-contatti" className="home-section home-section-final home-footer promozioni-footer">
    <img className="home-footer-image" src="/assets/home/footerPromozioni.webp" alt="" aria-hidden="true" />
    <nav className="home-footer-links" aria-label="Contatti footer">
    <a className="home-footer-link-instagram" href="https://www.instagram.com/bigmat_etnasso/" target="_blank" rel="noreferrer" aria-label="Instagram"><span>INSTAGRAM</span><ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon></a>
    <a className="home-footer-link-whatsapp" href="https://wa.me/390966941019" target="_blank" rel="noreferrer"><span>WHATSAPP</span><ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon></a>
    <a className="home-footer-link-email" href="mailto:amministrazione.etnsrl@bigmat.it"><span>EMAIL</span><ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon></a>
    </nav>
    <div className="home-footer-logos" aria-label="Loghi ETN"><div className="home-footer-logos-group">
    <img className="home-footer-logo-bigmat" src="/assets/logos/BigMat_Logo_Footer.svg" alt="BigMat ETN" />
    <img className="home-footer-logo-bigrent" src="/assets/logos/BigRent_Logo_Footer.svg" alt="BigRent ETN" />
    <img className="home-footer-logo-habimat" src="/assets/logos/HabiMat_Logo_Footer.svg" alt="HabiMat ETN" />
    </div></div>
    <p className="home-footer-credits">DESIGNED BY <a href="https://www.instagram.com/fliesneverlie/" target="_blank" rel="noreferrer">FLIESNEVERLIE</a><br />DEVELOPED BY <a href="https://www.crxtianhub.com/" target="_blank" rel="noreferrer">CRXTIANHUB</a></p>
    <p className="home-footer-copyright">©BIGMATETNASSO2026</p>
    </footer>
    <CompanyDetailsBar />
    </main>
    </>
  );
}

if (isNoleggioPage) {
  return (
    <>
    {renderGridControls()}
    <main className="noleggio-page">
    <section className="noleggio-hero">
    {renderPublicNav({
      active: 'noleggio',
      logo: '/assets/logos/BigRent_Logo_Header.svg',
      logoAlt: 'BigRent ET Nasso',
      tone: 'light',
    })}
    <img className="noleggio-hero-image" src="/assets/home/headerNoleggio.webp" alt="" aria-hidden="true" />
    <div className="showroom-hero-copy noleggio-hero-copy">
    <h1>
    <RevealLines lines={['Noleggiamo macchinari', 'all’avanguardia', 'per professionisti.']} />
    </h1>
    </div>
    </section>
    <section className="noleggio-blank-section" aria-label="Noleggio">
    <p className="noleggio-service-lead">
    <span className="noleggio-service-lead-desktop">
    <RevealLines lines={['Il nostro servizio BigRent', 'mette a disposizione', 'a prezzi vantaggiosi', 'macchinari da cantiere.']} />
    </span>
    <span className="noleggio-service-lead-mobile">
    <RevealLines lines={['Il nostro servizio BigRent mette', 'a disposizione', 'a prezzi', 'vantaggiosi', 'macchinari', 'da cantiere.']} />
    </span>
    </p>
    <h2 className="home-section-title noleggio-products-title"><span><RevealLines lines={['I nostri prodotti']} /></span></h2>
    <div className="noleggio-product-list">
    {noleggioProducts.map((product) => {
      const productImage = assetUrl(product.image);
      const formatRentalPrice = (price) => `${String.fromCharCode(8364)} ${String(price).trim()} + IVA`;
      const productPrices = [
        product.priceDay && { price: product.priceDay, period: 'al giorno' },
        product.priceWeek && { price: product.priceWeek, period: 'alla settimana' },
        product.priceMonth && { price: product.priceMonth, period: 'al mese' },
      ].filter(Boolean);
      const productModel = product.model || product.name;
      const productLink = product.link?.trim();
      const ProductElement = productLink ? 'a' : 'article';

      return (
        <ProductElement
        className={`noleggio-product-item${productLink ? ' is-linked' : ''}`}
        key={product.id}
        href={productLink || undefined}
        target={productLink ? '_blank' : undefined}
        rel={productLink ? 'noreferrer' : undefined}
        >
        <img src={productImage} alt={product.name || product.brand || product.model || 'Prodotto noleggio'} />
        <div className="noleggio-product-data">
        {product.brand && <p className="noleggio-product-brand"><RevealLines lines={[product.brand]} /></p>}
        {productModel && <h3><RevealLines lines={[productModel]} /></h3>}
        {product.miniDescription && <p className="noleggio-product-description"><RevealLines lines={product.miniDescription.split('\n')} /></p>}
        {productPrices.length > 0 && (
          <p className="noleggio-product-prices">
          {productPrices.map((price, index) => (
            <span key={`${product.id}-price-${index}`}>
            <RevealLines lines={[<>{formatRentalPrice(price.price)} <small>{price.period}</small></>]} />
            </span>
          ))}
          </p>
        )}
        </div>
        {productLink && <ion-icon class="noleggio-product-arrow" name="arrow-up-sharp" aria-hidden="true"></ion-icon>}
        </ProductElement>
      );
    })}
    </div>
    </section>
    <section className="noleggio-info-section">
    <p className="noleggio-info-cta">
    <ContactDetails prefix="noleggio-info" />
    </p>
    </section>
    <footer id="footer-contatti" className="home-section home-section-final home-footer noleggio-footer">
    <img className="home-footer-image" src="/assets/home/footerNoleggio.webp" alt="" aria-hidden="true" />
    <nav className="home-footer-links" aria-label="Contatti footer">
    <a className="home-footer-link-instagram" href="https://www.instagram.com/bigmat_etnasso/" target="_blank" rel="noreferrer" aria-label="Instagram">
    <span>INSTAGRAM</span>
    <ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon>
    </a>
    <a className="home-footer-link-whatsapp" href="https://wa.me/390966941019" target="_blank" rel="noreferrer">
    <span>WHATSAPP</span>
    <ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon>
    </a>
    <a className="home-footer-link-email" href="mailto:amministrazione.etnsrl@bigmat.it">
    <span>EMAIL</span>
    <ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon>
    </a>
    </nav>
    <div className="home-footer-logos" aria-label="Loghi ETN">
    <div className="home-footer-logos-group">
    <img className="home-footer-logo-bigmat" src="/assets/logos/BigMat_Logo_Footer.svg" alt="BigMat ETN" />
    <img className="home-footer-logo-bigrent" src="/assets/logos/BigRent_Logo_Footer.svg" alt="BigRent ETN" />
    <img className="home-footer-logo-habimat" src="/assets/logos/HabiMat_Logo_Footer.svg" alt="HabiMat ETN" />
    </div>
    </div>
    <p className="home-footer-credits">
    DESIGNED BY <a href="https://www.instagram.com/fliesneverlie/" target="_blank" rel="noreferrer">FLIESNEVERLIE</a>
    <br />
    DEVELOPED BY <a href="https://www.crxtianhub.com/" target="_blank" rel="noreferrer">CRXTIANHUB</a>
    </p>
    <p className="home-footer-copyright">©BIGMATETNASSO2026</p>
    </footer>
    <CompanyDetailsBar />
    </main>
    </>
  );
}

if (isEdiliziaPage) {
  return (
    <>
    {renderGridControls()}
    <main className="showroom-page edilizia-page">
    <section className="showroom-hero">
    <img
    className="showroom-hero-image"
    src="/assets/home/ediliziaHeader.webp"
    alt=""
    aria-hidden="true"
    />
    {renderPublicNav({ active: 'edilizia' })}
    <div className="showroom-hero-copy edilizia-hero-copy">
    <h1>
    <span className="edilizia-hero-title-desktop">
    <RevealLines lines={['Proponiamo articoli', 'e materiali edili duraturi,', 'sicuri e certificati.']} />
    </span>
    <span className="edilizia-hero-title-mobile">
    <RevealLines lines={['Proponiamo articoli', 'e materiali edili', 'duraturi, sicuri', 'e certificati.']} />
    </span>
    </h1>
    </div>
    </section>
    <section className="edilizia-store">
    <h2 className="home-section-title"><span><RevealLines lines={['Il nostro store']} /></span></h2>
    <div className="edilizia-store-copy">
    <p className="edilizia-store-lead">
    <span className="edilizia-store-lead-desktop">
    <RevealLines lines={['Forniamo materiali edili', 'per ogni esigenza e utilizzo', 'accomunati tutti', 'dalla qualità eccelsa', 'che ci contraddistingue.']} />
    </span>
    <span className="edilizia-store-lead-mobile">
    <RevealLines lines={['Forniamo', 'materiali edili', 'per ogni esigenza', 'e utilizzo', 'accomunati tutti', 'dalla qualità', 'eccelsa che ci', 'contraddistingue.']} />
    </span>
    </p>
    <p className="edilizia-store-support">
    <span className="edilizia-store-support-desktop">
    <RevealLines lines={['Il nostro personale', 'specializzato ti assiste', 'nella scelta del prodotto', 'più adatto al tuo lavoro.']} />
    </span>
    <span className="edilizia-store-support-mobile">
    <RevealLines lines={['Il nostro personale specializzato ti assiste nella scelta del prodotto più adatto al tuo lavoro.']} />
    </span>
    </p>
    </div>
    </section>
    <section className="edilizia-categories">
    <h2 className="home-section-title"><span><RevealLines lines={['I nostri prodotti']} /></span></h2>
    <div className="edilizia-category-feature" style={{ '--category-motion-duration': `${categoryProductHover.animationMs}ms` }}>
    {visibleEdiliziaProductCategoryGroups.map((group) => (
      <div className="edilizia-category-group" key={group.title}>
      <h3><RevealLines lines={[group.title]} /></h3>
      <div className="edilizia-category-images">
      {group.products.length > 0 ? group.products.map((product) => {
        const productImage = assetUrl(product.image);
        return (
          <article key={product.id} {...categoryProductHover.productProps(product.id)}>
          <a href={product.link || '/prodotti'} target={product.link ? '_blank' : undefined} rel={product.link ? 'noreferrer' : undefined}>
          <img src={productImage} alt={product.name} />
          <span>
          <strong>{product.brand || product.name}</strong>
          <em>{product.model || product.miniDescription || group.title}</em>
          </span>
          <ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon>
          </a>
          </article>
        );
      }) : (
        <article>
        <div className="edilizia-category-link">
        <span>
        <strong>{group.title}</strong>
        <em>Prodotti in arrivo</em>
        </span>
        </div>
        </article>
      )}
      </div>
      </div>
    ))}
    {hasMoreEdiliziaProductCategories && (
      <button
        className="edilizia-more-products"
        type="button"
        onClick={() => setVisibleEdiliziaCategoryCount((count) => Math.min(count + 1, ediliziaProductCategoryGroups.length))}
      >
      <span className="edilizia-more-products-label"><RevealLines lines={['GUARDA ALTRI PRODOTTI']} /></span>
      <span className="edilizia-more-products-plus" aria-hidden="true">+</span>
      </button>
    )}
    </div>
    </section>
    <section className="edilizia-color-center">
    <h2>
    <span className="edilizia-color-title-desktop">
    <RevealLines lines={['Il nostro centro colore', 'personalizzato realizza', 'ogni tipo di vernice', 'del colore che preferisci.']} />
    </span>
    <span className="edilizia-color-title-mobile">
    <RevealLines lines={['Il nostro', 'centro colore', 'personalizzato', 'realizza ogni tipo', 'di vernice', 'del colore', 'che preferisci.']} />
    </span>
    </h2>
    <img className="edilizia-color-image" src="/assets/home/edilizia1.webp" alt="" aria-hidden="true" />
    <img className="edilizia-color-image edilizia-color-image-secondary" src="/assets/home/edilizia2.webp" alt="" aria-hidden="true" loading="lazy" />
    <img className="edilizia-color-image edilizia-color-image-tertiary" src="/assets/home/edilizia3.webp" alt="" aria-hidden="true" loading="lazy" />
    </section>
    <section className="edilizia-info-section">
    <p className="edilizia-info-cta">
    <ContactDetails prefix="edilizia-info" />
    </p>
    </section>
    <footer id="footer-contatti" className="home-section home-section-final home-footer edilizia-footer">
    <img className="home-footer-image" src="/assets/home/ediliziaFooter.webp" alt="" aria-hidden="true" />
    <nav className="home-footer-links" aria-label="Contatti footer">
    <a className="home-footer-link-instagram" href="https://www.instagram.com/bigmat_etnasso/" target="_blank" rel="noreferrer" aria-label="Instagram">
    <span>INSTAGRAM</span>
    <ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon>
    </a>
    <a className="home-footer-link-whatsapp" href="https://wa.me/390966941019" target="_blank" rel="noreferrer">
    <span>WHATSAPP</span>
    <ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon>
    </a>
    <a className="home-footer-link-email" href="mailto:amministrazione.etnsrl@bigmat.it">
    <span>EMAIL</span>
    <ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon>
    </a>
    </nav>
    <div className="home-footer-logos" aria-label="Loghi ETN">
    <div className="home-footer-logos-group">
    <img className="home-footer-logo-bigmat" src="/assets/logos/BigMat_Logo_Footer.svg" alt="BigMat ETN" />
    <img className="home-footer-logo-bigrent" src="/assets/logos/BigRent_Logo_Footer.svg" alt="BigRent ETN" />
    <img className="home-footer-logo-habimat" src="/assets/logos/HabiMat_Logo_Footer.svg" alt="HabiMat ETN" />
    </div>
    </div>
    <p className="home-footer-credits">
    DESIGNED BY <a href="https://www.instagram.com/fliesneverlie/" target="_blank" rel="noreferrer">FLIESNEVERLIE</a>
    <br />
    DEVELOPED BY <a href="https://www.crxtianhub.com/" target="_blank" rel="noreferrer">CRXTIANHUB</a>
    </p>
    <p className="home-footer-copyright">©BIGMATETNASSO2026</p>
    </footer>
    <CompanyDetailsBar />
    </main>
    </>
  );
}

if (isPublicHome) {
  return (
    <>
    {renderGridControls()}
    <main className="blank-page">
    <section className="home-section home-section-hero" data-bg={homeSectionColors[0]}>
    <img
    className="home-hero-image"
    src="/assets/home/fullscreenHome.jpeg"
    alt=""
    aria-hidden="true"
    />
    {renderPublicNav()}
    <div className="home-hero-copy">
    <h1>
    <RevealLines lines={['I tuoi desideri', 'sono anche i nostri.']} />
    </h1>
    <p><RevealLines lines={[<>dal 1<span className="home-hero-year-rest">986</span></>]} /></p>
    </div>
    </section>
    <section className="home-section home-section-mission" data-bg={homeSectionColors[1]}>
    <h2 className="home-section-title"><span><RevealLines lines={['La nostra missione']} /></span></h2>
    <div className="mission-composition">
    <p className="home-mission-text">
    <span className="home-mission-text-desktop">
    <RevealLines lines={['Costruiamo spazi', 'secondo le tue esigenze', 'affiancandoti con cura,', 'dalle fondamenta', 'alle finiture.']} />
    </span>
    <span className="home-mission-text-mobile">
    <RevealLines lines={['Costruiamo spazi', 'secondo le tue', 'esigenze affiancandoti', 'con cura,', 'dalle fondamenta', 'alle finiture.']} />
    </span>
    </p>
    <div className="mission-images" aria-hidden="true">
    <img className="mission-image mission-image-0" src="/assets/home/0.jpg" alt="" />
    <img className="mission-image mission-image-1" src="/assets/home/1.jpg" alt="" />
    <img className="mission-image mission-image-2" src="/assets/home/2.png" alt="" />
    <img className="mission-image mission-image-3" src="/assets/home/3.jpg" alt="" />
    </div>
    </div>
    </section>
    <section className="home-section home-section-services" data-bg={homeSectionColors[2]}>
    <div className="services-carousel">
    <div className="services-track">
    <div className="services-layout-grid" aria-hidden="true">
    {Array.from({ length: 48 }).map((_, index) => (
      <div className="services-layout-grid-column" key={index}>
      <span>{index + 1}</span>
      </div>
    ))}
    </div>
    <section className="services-panel services-panel-intro">
    <h2 className="services-panel-title"><span><RevealLines lines={['I nostri servizi']} /></span></h2>
    <div className="services-copy">
    <p>
    <span className="services-desktop-copy">
    <RevealLines lines={['Vendiamo materiali edili', 'di prima fascia per tutte', 'le costruzioni.']} />
    </span>
    <span className="services-mobile-copy">
    <RevealLines lines={['Vendiamo prodotti', 'di prima qualità.']} />
    </span>
    </p>
    <ul>
    <li><RevealLines lines={['EDILIZIA']} /></li>
    <li><RevealLines lines={['UTENSILERIA']} /></li>
    <li><RevealLines lines={['CENTRO COLORE']} /></li>
    <li><RevealLines lines={['TERMOIDRAULICA']} /></li>
    <li><RevealLines lines={['FERRAMENTA']} /></li>
    <li><span className="services-desktop-copy"><RevealLines lines={['SICUREZZA']} /></span><span className="services-mobile-copy"><RevealLines lines={['PROTEZIONI']} /></span></li>
    </ul>
    <a className="services-edilizia-cta" href="/edilizia" onClick={(event) => handlePublicNavClick(event, '/edilizia')}>
    <RevealLines lines={['EDILIZIA']} />
    </a>
    </div>
    <div className="services-carousel-image-frame">
    <picture>
    <source media="(max-width: 767px)" srcSet="/assets/home/scroll_1.webp" />
    <img
    className="services-carousel-image services-parallax-image services-carousel-image-first"
    src="/assets/home/scroll_1.webp"
    alt=""
    aria-hidden="true"
    />
    </picture>
    </div>
    </section>
    <section className="services-panel services-panel-tools">
    <h2 className="services-panel-title services-text-title services-tools-title">
    <span className="services-tools-title-desktop">
    <RevealLines lines={['Disponiamo degli strumenti', 'necessari a completare', 'le lavorazioni.']} />
    </span>
    <span className="services-tools-title-mobile">
    <RevealLines lines={['Disponiamo', 'degli strumenti', 'necessari', 'a completare', 'tutte le lavorazioni.']} />
    </span>
    </h2>
    <p className="services-small-copy services-tools-copy">
    <span className="services-tools-copy-desktop">
    <RevealLines lines={['Forniamo un servizio di', 'consulenza, progettazione e', 'costruzione con ditte edili partner.']} />
    </span>
    <span className="services-tools-copy-mobile">
    <RevealLines lines={['Forniamo un servizio di consulenza, progettazione e costruzione con ditte edili partner.']} />
    </span>
    </p>
    <div className="services-tools-image-frame">
    <img className="services-parallax-image-soft" src="/assets/home/scroll_2.webp" alt="" aria-hidden="true" />
    </div>
    <div className="services-tools-image-frame services-tools-image-frame-secondary">
    <img className="services-parallax-image-soft" src="/assets/home/scroll_3.webp" alt="" aria-hidden="true" />
    </div>
    </section>
    <section className="services-panel services-panel-guidance">
    <div className="services-guidance-image-frame">
    <img className="services-parallax-image" src="/assets/home/scroll_4.webp" alt="" aria-hidden="true" />
    </div>
    <h2 className="services-panel-title services-text-title services-guidance-title">
    <span className="services-guidance-title-desktop">
    <RevealLines lines={['Ti accompagniamo', 'passo dopo passo', 'aiutandoti a rendere', 'chiare e reali le tue idee.']} />
    </span>
    <span className="services-guidance-title-mobile">
    <RevealLines lines={['Ti accompagniamo', 'passo dopo passo', 'aiutandoti', 'a rendere chiare', 'e reali le tue idee.']} />
    </span>
    </h2>
    <ul className="services-small-list services-guidance-list">
    <li><RevealLines lines={['RUBINETTERIA E SANITARI']} /></li>
    <li><RevealLines lines={['ARREDOBAGNO']} /></li>
    <li><RevealLines lines={['ILLUMINAZIONI']} /></li>
    <li><RevealLines lines={['INFISSI E SERRAMENTI']} /></li>
    <li><RevealLines lines={['RIVESTIMENTI']} /></li>
    <li><RevealLines lines={['CREAZIONE RENDER']} /></li>
    </ul>
    <a className="services-showroom-cta" href="/showroom" onClick={(event) => handlePublicNavClick(event, '/showroom')}>
    <RevealLines lines={['SHOWROOM']} />
    </a>
    <div className="services-guidance-image-frame-small services-guidance-image-frame-small-5">
    <img className="services-parallax-image-soft" src="/assets/home/scroll_5.webp" alt="" aria-hidden="true" />
    </div>
    <div className="services-guidance-image-frame-small services-guidance-image-frame-small-6">
    <img className="services-parallax-image-soft" src="/assets/home/scroll_6.webp" alt="" aria-hidden="true" />
    </div>
    </section>
    <section className="services-panel services-panel-render">
    <h2 className="services-panel-title services-text-title services-render-title">
    <span className="services-render-title-desktop">
    <RevealLines lines={['Abbiamo cura del tuo', 'progetto e ci teniamo', 'a visualizzarlo.']} />
    </span>
    <span className="services-render-title-mobile">
    <RevealLines lines={['Abbiamo cura', 'del tuo', 'progetto', 'e ci teniamo', 'a visualizzarlo.']} />
    </span>
    </h2>
    <p className="services-small-copy services-render-copy">
    <span className="services-render-copy-desktop">
    <RevealLines lines={['Attraverso i render realizzati', 'dai nostri professionisti puoi avere', "un'anteprima credibile e precisa", "dell'ambiente che desideri."]} />
    </span>
    <span className="services-render-copy-mobile">
    <RevealLines lines={["Attraverso i render realizzati dai nostri professionisti puoi avere un’anteprima credibile e precisa dell’ambiente che desideri."]} />
    </span>
    </p>
    <a className="services-render-cta" href={firstShowroomRenderPath} onClick={(event) => openShowroomRender(event, firstShowroomRenderPath)}>
    <span><RevealLines lines={['SCOPRI I RENDER']} /></span>
    <ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon>
    </a>
    </section>
    <section className="services-panel services-panel-rental">
    <div className="services-rental-image-frame">
    <img className="services-parallax-image" src="/assets/home/scroll_7.webp" alt="" aria-hidden="true" />
    </div>
    <h2 className="services-panel-title services-text-title services-rental-title">
    <RevealLines lines={['Noleggiamo attrezzature', 'per professionisti', 'e imprese edili', 'specializzate.']} />
    </h2>
    <ul className="services-small-list services-rental-list">
    <li><RevealLines lines={['GRU']} /></li>
    <li><RevealLines lines={['ELETTROUTENSILI']} /></li>
    <li><RevealLines lines={['MACCHINE IMPASTATRICI']} /></li>
    <li><RevealLines lines={['ATTREZZI PER DEMOLIZIONI']} /></li>
    </ul>
    <a className="services-noleggio-cta" href="/noleggio">
    <RevealLines lines={['NOLEGGIO']} />
    </a>
    </section>
    <section className="services-products-group">
    <div className="services-products-image-frame services-products-image-frame-8">
    <img className="services-parallax-image-soft" src="/assets/home/scroll_8.webp" alt="" aria-hidden="true" />
    </div>
    <div className="services-products-image-frame services-products-image-frame-9">
    <img className="services-parallax-image-soft" src="/assets/home/scroll_9.webp" alt="" aria-hidden="true" />
    </div>
    <h2 className="services-panel-title services-text-title services-products-title">
    <span className="services-products-title-desktop">
    <RevealLines lines={['Trattiamo macchinari, dai', 'pesanti alle attrezzature', 'per alimentazione', 'o finiture.']} />
    </span>
    <span className="services-products-title-mobile">
    <RevealLines lines={['Trattiamo macchinari,', 'dai pesanti', 'alle attrezzature', 'per alimentazione', 'o finiture.']} />
    </span>
    </h2>
    <p className="services-small-copy services-products-copy">
    <span className="services-products-copy-desktop">
    <RevealLines lines={['Puoi consultare il catalogo', 'dei nostri macchinari attualmente', 'disponibili qui sul nostro sito.']} />
    </span>
    <span className="services-products-copy-mobile">
    <RevealLines lines={['Puoi consultare il catalogo dei nostri macchinari attualmente disponibili qui sul nostro sito.']} />
    </span>
    </p>
    <a className="services-products-cta" href="/noleggio" onClick={(event) => handlePublicNavClick(event, '/noleggio')}>
    <span><RevealLines lines={['SCOPRI I PRODOTTI']} /></span>
    <ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon>
    </a>
    </section>
    <section className="services-panel services-panel-half">
    </section>
    </div>
    </div>
    <div className="services-progress" aria-hidden="true">
    <div className="services-progress-track">
    <div className="services-progress-fill" />
    </div>
    </div>
    </section>
    <section className="home-section home-section-brands" data-bg={homeSectionColors[3]}>
    <h2 className="home-section-title"><span><RevealLines lines={['I nostri brand']} /></span></h2>
    <p className="home-brands-subtitle">
    <RevealLines lines={['Questi sono solo alcuni dei brand che trattiamo.', 'Tutti le case produttruci dei nostri prodotti costituiscono', 'l’eccellenza in termini di efficacia, funzionalità', 'e affidabilità targata BigMat.']} />
    </p>
    <div className="home-brands-categories">
    <div className="home-brands-category home-brands-category-showroom">
    <span><RevealLines lines={['SHOWROOM']} /></span>
    {brandLists.showroom.length > 0 && (
      <ul>
      {brandLists.showroom.map((brand) => (
        <li key={brand.id || brand.name}>
        <div className="home-brand-name">
        {brand.link ? (
          <a href={brand.link} target="_blank" rel="noreferrer">
          <span><RevealLines lines={[brand.name]} /></span>
          <ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon>
          </a>
        ) : (
          <span>
          <span><RevealLines lines={[brand.name]} /></span>
          <ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon>
          </span>
        )}
        </div>
        {brand.image && (
          <div className="home-brand-image">
          <img src={assetUrl(brand.image)} alt="" />
          </div>
        )}
        </li>
      ))}
      </ul>
    )}
    </div>
    <div className="home-brands-category home-brands-category-rivendita">
    <span>
    <span className="home-brands-desktop-label"><RevealLines lines={['EDILIZIA']} /></span>
    <span className="home-brands-mobile-label"><RevealLines lines={['EDILIZIA']} /></span>
    </span>
    {brandLists.rivendita.length > 0 && (
      <ul>
      {brandLists.rivendita.map((brand) => (
        <li key={brand.id || brand.name}>
        <div className="home-brand-name">
        {brand.link ? (
          <a href={brand.link} target="_blank" rel="noreferrer">
          <span><RevealLines lines={[brand.name]} /></span>
          <ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon>
          </a>
        ) : (
          <span>
          <span><RevealLines lines={[brand.name]} /></span>
          <ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon>
          </span>
        )}
        </div>
        {brand.image && (
          <div className="home-brand-image">
          <img src={assetUrl(brand.image)} alt="" />
          </div>
        )}
        </li>
      ))}
      </ul>
    )}
    </div>
    </div>
    </section>
    <section className="home-section home-section-clients" data-bg={homeSectionColors[4]}>
    <CustomerReviews reviews={clientReviews} />
    <div className="home-clients-contact">
    <p className="clients-brand-cta">
    <ContactDetails prefix="clients-brand" />
    </p>
    </div>
    </section>
    <footer id="footer-contatti" className="home-section home-section-final home-footer" data-bg={homeSectionColors[5]}>
    <img className="home-footer-image" src="/assets/home/footerHome.jpg" alt="" aria-hidden="true" />
    <nav className="home-footer-links" aria-label="Contatti footer">
    <a className="home-footer-link-instagram" href="https://www.instagram.com/bigmat_etnasso/" target="_blank" rel="noreferrer" aria-label="Instagram">
    <span>INSTAGRAM</span>
    <ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon>
    </a>
    <a className="home-footer-link-whatsapp" href="https://wa.me/390966941019" target="_blank" rel="noreferrer">
    <span>WHATSAPP</span>
    <ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon>
    </a>
    <a className="home-footer-link-email" href="mailto:amministrazione.etnsrl@bigmat.it">
    <span>EMAIL</span>
    <ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon>
    </a>
    </nav>
    <div className="home-footer-logos" aria-label="Loghi ETN">
    <div className="home-footer-logos-group">
    <img className="home-footer-logo-bigmat" src="/assets/logos/BigMat_Logo_Footer.svg" alt="BigMat ETN" />
    <img className="home-footer-logo-bigrent" src="/assets/logos/BigRent_Logo_Footer.svg" alt="BigRent ETN" />
    <img className="home-footer-logo-habimat" src="/assets/logos/HabiMat_Logo_Footer.svg" alt="HabiMat ETN" />
    </div>
    </div>
    <p className="home-footer-credits">
    DESIGNED BY <a href="https://www.instagram.com/fliesneverlie/" target="_blank" rel="noreferrer">FLIESNEVERLIE</a>
    <br />
    DEVELOPED BY <a href="https://www.crxtianhub.com/" target="_blank" rel="noreferrer">CRXTIANHUB</a>
    </p>
    <p className="home-footer-copyright">©BIGMATETNASSO2026</p>
    </footer>
    <CompanyDetailsBar />
    </main>
    </>
  );
}

if (isAdminPage && !authChecked) {
  return (
    <>
    {renderGridControls()}
    <div className="backend-login-logo" aria-label="BigMat ETN" />
    <main className="login-shell">
    <p className="status">Controllo accesso...</p>
    </main>
    </>
  );
}

if (isAdminPage && !authenticated) {
  return (
    <>
    {renderGridControls()}
    <div className="backend-login-logo" aria-label="BigMat ETN" />
    <main className="login-shell">
    <form className="login-panel" onSubmit={login}>
    <h1>Ciao editor</h1>
    
    <label className="password-box">
    <input
    autoFocus
    required
    type="password"
    value={password}
    onChange={(event) => setPassword(event.target.value)}
    placeholder="Password"
    />
    </label>
    
    <button className="login-submit" type="submit" disabled={busy}>
    {busy ? 'Accesso...' : 'Accedi'}
    </button>
    
    {status && <p className="status" role="alert">{status}</p>}
    </form>
    </main>
    </>
  );
}

if (isAdminPage) {
  const adminActions = [
    { id: 'home-brandlist', label: 'HOME - Brandlist' },
    { id: 'edilizia-prodotti', label: 'EDILIZIA - Prodotti' },
    { id: 'showroom-prodotti', label: 'SHOWROOM - Prodotti' },
    { id: 'showroom-render', label: 'SHOWROOM - Render' },
    { id: 'noleggio-prodotti', label: 'NOLEGGIO - Prodotti' },
    { id: 'promozioni-prodotti', label: 'PROMOZIONI - Prodotti' },
    { id: 'chi-siamo-persone', label: 'CHI SIAMO - Persone' },
  ];
  
  if (backendView === 'home-brandlist') {
    return (
      <>
      {renderGridControls()}
      <main className="backend-dashboard backend-detail">
      <button
      className="backend-dashboard-logo"
      type="button"
      aria-label="Torna al menu backend"
      onClick={() => navigateBackend('menu')}
      />
      <button className="backend-board-link" type="button" onClick={() => navigateBackend('menu')}>
      Bacheca
      </button>
      <h1 className="backend-detail-title">HOME - Brandlist</h1>
      <button className="backend-logout" type="button" onClick={logout} disabled={busy}>
      Logout
      </button>
      <section className="backend-brandlist-workspace" aria-label="HOME - Brandlist">
      {[
        { id: 'showroom', title: 'SHOWROOM' },
        { id: 'rivendita', title: 'EDILIZIA' },
      ].map((group) => (
        <div className={`brandlist-column brandlist-column-${group.id}`} key={group.id}>
        <h2>{group.title}</h2>
        {brandLists[group.id].length > 0 ? (
          <ul className="brandlist-items">
          {brandLists[group.id].map((brand) => (
            <li key={brand.id}>
            <button type="button" onClick={() => editBrand(brand)}>
            {brand.name}
            </button>
            </li>
          ))}
          </ul>
        ) : (
          <p className="brandlist-empty">Nessun brand</p>
        )}
        </div>
      ))}
      </section>
      <button
      className="backend-add-button"
      type="button"
      onClick={() => {
        resetBrandForm();
        navigateBackend('home-brandlist-new');
      }}
      >
      aggiungi
      </button>
      </main>
      </>
    );
  }
  
  if (backendView === 'home-brandlist-new' || backendView.startsWith('home-brandlist-edit:')) {
    return (
      <>
      {renderGridControls()}
      <main className="backend-dashboard backend-detail">
      <button
      className="backend-dashboard-logo"
      type="button"
      aria-label="Torna al menu backend"
      onClick={() => navigateBackend('menu')}
      />
      <button className="backend-board-link" type="button" onClick={() => navigateBackend('menu')}>
      Bacheca
      </button>
      <h1 className="backend-detail-title">HOME - Brandlist</h1>
      <button className="backend-logout" type="button" onClick={logout} disabled={busy}>
      Logout
      </button>
      <form className="brand-form" aria-label="Aggiungi brand">
      <label className="brand-image-preview" aria-label="Carica immagine brand">
      {brandImagePreview ? <img src={brandImagePreview} alt="" /> : <span>+</span>}
      <input
      type="file"
      accept="image/*"
      onChange={(event) => updateBrandForm('imageFile', event.target.files?.[0] || null)}
      />
      </label>
      <div className="brand-form-labels" aria-hidden="true">
      <span>BRAND</span>
      <span>TIPOLOGIA</span>
      <span>LINK</span>
      </div>
      <div className="brand-form-fields">
      <input
      value={brandForm.name}
      onChange={(event) => updateBrandForm('name', event.target.value)}
      placeholder="Nome"
      />
      <select value={brandForm.type} onChange={(event) => updateBrandForm('type', event.target.value)}>
      <option value="showroom">Showroom</option>
      <option value="rivendita">Edilizia</option>
      </select>
      <textarea
      rows="3"
      value={brandForm.link}
      onChange={(event) => updateBrandForm('link', event.target.value)}
      placeholder="https://"
      />
      </div>
      </form>
      <div className="brand-form-actions" aria-label="Azioni brand">
      <button className="brand-action-close" type="button" onClick={() => navigateBackend('home-brandlist')}>
      x
      </button>
      <button className="brand-action-delete" type="button" onClick={deleteBrand} disabled={busy}>
      ELIMINA
      </button>
      <button className="brand-action-save" type="button" onClick={saveBrand} disabled={busy}>
      SALVA
      </button>
      </div>
      {status && <p className="brand-form-status">{status}</p>}
      </main>
      </>
    );
  }
  
  if (activeProductSection?.mode === 'list') {
    return (
      <>
      {renderGridControls()}
      <main className="backend-dashboard backend-detail">
      <button
      className="backend-dashboard-logo"
      type="button"
      aria-label="Torna al menu backend"
      onClick={() => navigateBackend('menu')}
      />
      <button className="backend-board-link" type="button" onClick={() => navigateBackend('menu')}>
      Bacheca
      </button>
      <h1 className="backend-detail-title">{activeProductSection.title}</h1>
      <button className="backend-logout" type="button" onClick={logout} disabled={busy}>
      Logout
      </button>
      {activeProductSection.category !== 'Noleggio' && activeProductSection.category !== 'Promozioni' && (
        <select
        className="product-list-category-select"
        value={productCategoryFilter}
        onChange={(event) => setProductCategoryFilter(event.target.value)}
        aria-label="Filtra categoria prodotti"
        >
        <option value="categoria">Categoria</option>
        {productCategories.map((item) => (
          <option value={item} key={item}>{item}</option>
        ))}
        </select>
      )}
      <section className={`backend-productlist-workspace${['Noleggio', 'Promozioni'].includes(activeProductSection.category) ? ' is-unlimited' : ''}`} aria-label={activeProductSection.title}>
      {Array.from({ length: ['Noleggio', 'Promozioni'].includes(activeProductSection.category)
        ? Math.max(maxProductsPerCategory, visibleSectionProducts.length) : maxProductsPerCategory }).map((_, index) => {
        const product = visibleSectionProducts[index];
        const imageUrl = product?.image
        ? (product.image.startsWith('/') || product.image.startsWith('http') ? product.image : `/${product.image}`)
        : '';
        
        return (
          <button
          className="product-square"
          type="button"
          key={product?.id || index}
          aria-label={product ? `Modifica ${product.name}` : `Slot prodotto ${index + 1}`}
          onClick={product ? () => editSectionProduct(product) : undefined}
          >
          {imageUrl && <img src={imageUrl} alt="" />}
          {product && !imageUrl && <span>{product.brand || product.name}</span>}
          </button>
        );
      })}
      </section>
      <button
      className="backend-add-button"
      type="button"
      onClick={() => {
        resetProductForm();
        navigateBackend(`${activeProductSection.base}-new`);
      }}
      disabled={busy}
      >
      aggiungi
      </button>
      </main>
      </>
    );
  }
  
  if (activeProductSection?.mode === 'new' || activeProductSection?.mode === 'edit') {
    return (
      <>
      {renderGridControls()}
      <main className="backend-dashboard backend-detail">
      <button
      className="backend-dashboard-logo"
      type="button"
      aria-label="Torna al menu backend"
      onClick={() => navigateBackend('menu')}
      />
      <button className="backend-board-link" type="button" onClick={() => navigateBackend('menu')}>
      Bacheca
      </button>
      <h1 className="backend-detail-title">{activeProductSection.title}</h1>
      <button className="backend-logout" type="button" onClick={logout} disabled={busy}>
      Logout
      </button>
      <form
      className={`brand-form product-form ${
        activeProductSection.category === 'Noleggio'
        ? 'rental-product-form'
        : activeProductSection.category === 'Promozioni'
        ? 'promo-product-form'
        : ''
      }`}
      aria-label={`Aggiungi prodotto ${activeProductSection.category}`}
      >
      <div className="product-media-column">
      <label className="brand-image-preview" aria-label="Carica immagine prodotto">
      {productImagePreview ? <img src={productImagePreview} alt="" /> : <span>+</span>}
      <input
      type="file"
      accept="image/*"
      onChange={(event) => updateProductForm('imageFile', event.target.files?.[0] || null)}
      />
      </label>
      {activeProductSection.category !== 'Noleggio' && activeProductSection.category !== 'Promozioni' && (
        <>
        <select
        className="product-category-select"
        value={productForm.category}
        onChange={(event) => updateProductForm('category', event.target.value)}
        aria-label="Categoria prodotto"
        >
        <option value="categoria">Categoria</option>
        {productCategories.map((item) => (
          <option value={item} key={item}>{item}</option>
        ))}
        </select>
        <button
        className="product-category-toggle"
        type="button"
        onClick={() => setCategoryEditorOpen((open) => !open)}
        aria-label="Gestisci categorie"
        >
        +
        </button>
        {categoryEditorOpen && (
          <div className="product-category-editor">
          <div className="product-category-editor-row">
          <input
          value={newProductCategory}
          onChange={(event) => setNewProductCategory(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
            event.preventDefault();
            if (!event.repeat) addProductCategory();
          }}
          placeholder="Nuova categoria"
          />
          <button type="button" onClick={addProductCategory} disabled={busy} aria-label="Aggiungi categoria">
          +
          </button>
          </div>
          {productCategories.length > 0 && (
            <ul>
            {productCategories.map((item) => (
              <li key={item}>
              <span>{item}</span>
              <button type="button" onClick={() => deleteProductCategory(item)} disabled={busy}>
              x
              </button>
              </li>
            ))}
            </ul>
          )}
          </div>
        )}
        </>
      )}
      </div>
      <div className="brand-form-labels" aria-hidden="true">
      <span>BRAND</span>
      <span>MODELLO</span>
      {activeProductSection.category === 'Noleggio' && (
        <>
        <span>PREZZO AL GIORNO</span>
        <span>PREZZO A SETTIMANA</span>
        <span>PREZZO AL MESE</span>
        <span>MINIDESCRIZIONE</span>
        </>
      )}
      {activeProductSection.category === 'Promozioni' && (
        <>
        <span>PREZZO ORIGINALE</span>
        <span>PREZZO SCONTATO</span>
        <span>MINIDESCRIZIONE</span>
        </>
      )}
      <span>LINK</span>
      </div>
      <div className="brand-form-fields">
      <input
      value={productForm.brand}
      onChange={(event) => updateProductForm('brand', event.target.value)}
      placeholder="Nome"
      />
      <input
      value={productForm.model}
      onChange={(event) => updateProductForm('model', event.target.value)}
      placeholder="Modello"
      />
      {activeProductSection.category === 'Noleggio' && (
        <>
        <input
        inputMode="decimal"
        value={productForm.priceDay}
        onChange={(event) => updateProductPriceField('priceDay', event.target.value)}
        placeholder="Prezzo al giorno"
        />
        <input
        inputMode="decimal"
        value={productForm.priceWeek}
        onChange={(event) => updateProductPriceField('priceWeek', event.target.value)}
        placeholder="Prezzo a settimana"
        />
        <input
        inputMode="decimal"
        value={productForm.priceMonth}
        onChange={(event) => updateProductPriceField('priceMonth', event.target.value)}
        placeholder="Prezzo al mese"
        />
        <textarea
        rows="2"
        value={productForm.miniDescription}
        onChange={(event) => updateProductForm('miniDescription', event.target.value)}
        placeholder="Minidescrizione"
        />
        </>
      )}
      {activeProductSection.category === 'Promozioni' && (
        <>
        <input
        inputMode="decimal"
        value={productForm.originalPrice}
        onChange={(event) => updateProductPriceField('originalPrice', event.target.value)}
        placeholder="Prezzo originale"
        />
        <div className="promo-discounted-price-row">
          <input
          inputMode="decimal"
          value={productForm.discountedPrice}
          onChange={(event) => updateProductPriceField('discountedPrice', event.target.value)}
          placeholder="Prezzo scontato"
          aria-label="Prezzo scontato"
          />
          <input
          type="text"
          value={productForm.priceSuffix}
          onChange={(event) => updateProductForm('priceSuffix', event.target.value)}
          placeholder="al sacco"
          aria-label="Testo dopo il prezzo, ad esempio al sacco o al kg"
          />
        </div>
        <textarea
        rows="2"
        value={productForm.miniDescription}
        onChange={(event) => updateProductForm('miniDescription', event.target.value)}
        placeholder="Minidescrizione"
        />
        </>
      )}
      <textarea
      rows="3"
      value={productForm.link}
      onChange={(event) => updateProductForm('link', event.target.value)}
      placeholder="https://"
      />
      </div>
      </form>
      <div className="brand-form-actions" aria-label="Azioni prodotto">
      <button className="brand-action-close" type="button" onClick={() => navigateBackend(activeProductSection.base)}>
      x
      </button>
      <button className="brand-action-delete" type="button" onClick={deleteSectionProduct} disabled={busy}>
      ELIMINA
      </button>
      <button className="brand-action-save" type="button" onClick={saveSectionProduct} disabled={busy}>
      SALVA
      </button>
      </div>
      {status && <p className="brand-form-status">{status}</p>}
      </main>
      </>
    );
  }
  
  if (activeRenderSection?.mode === 'list') {
    return (
      <>
      {renderGridControls()}
      <main className="backend-dashboard backend-detail">
      <button
      className="backend-dashboard-logo"
      type="button"
      aria-label="Torna al menu backend"
      onClick={() => navigateBackend('menu')}
      />
      <button className="backend-board-link" type="button" onClick={() => navigateBackend('menu')}>
      Bacheca
      </button>
      <h1 className="backend-detail-title">{activeRenderSection.title}</h1>
      <button className="backend-logout" type="button" onClick={logout} disabled={busy}>
      Logout
      </button>
      <section className="backend-renderlist-workspace" aria-label={activeRenderSection.title}>
      {showroomRenders.map((render) => {
        const imageUrl = render.image
        ? (render.image.startsWith('/') || render.image.startsWith('http') ? render.image : `/${render.image}`)
        : '';
        
        return (
          <button
          className="render-list-item"
          type="button"
          key={render.id}
          onClick={() => editRender(render)}
          >
          {imageUrl && <img src={imageUrl} alt="" />}
          <span>{render.brand || render.name}</span>
          </button>
        );
      })}
      {showroomRenders.length === 0 && (
        <p className="brandlist-empty">Nessun render</p>
      )}
      </section>
      <button
      className="backend-add-button"
      type="button"
      onClick={() => {
        resetProductForm();
        navigateBackend(`${renderSection.base}-new`);
      }}
      >
      aggiungi
      </button>
      </main>
      </>
    );
  }
  
  if (activeRenderSection?.mode === 'new' || activeRenderSection?.mode === 'edit') {
    return (
      <>
      {renderGridControls()}
      <main className="backend-dashboard backend-detail">
      <button
      className="backend-dashboard-logo"
      type="button"
      aria-label="Torna al menu backend"
      onClick={() => navigateBackend('menu')}
      />
      <button className="backend-board-link" type="button" onClick={() => navigateBackend('menu')}>
      Bacheca
      </button>
      <h1 className="backend-detail-title">{activeRenderSection.title}</h1>
      <button className="backend-logout" type="button" onClick={logout} disabled={busy}>
      Logout
      </button>
      <form className="brand-form render-form" aria-label="Aggiungi render showroom">
      <div className="product-media-column">
      <label
      className={`brand-image-preview ${placingRenderTag ? 'is-placing-tag' : ''}`}
      aria-label={placingRenderTag ? 'Clicca sulla foto per posizionare il tag' : 'Carica immagine render'}
      onClick={placeRenderTag}
      >
      {productImagePreview ? <img src={productImagePreview} alt="" /> : <span>+</span>}
      {productImagePreview && (productForm.renderTags || []).map((tag, index) => (
        <i
        className="render-image-tag"
        style={{ left: `${tag.x ?? 50}%`, top: `${tag.y ?? 50}%` }}
        key={index}
        >
        {index + 1}
        </i>
      ))}
      <input
      type="file"
      accept="image/*"
      onChange={(event) => updateProductForm('imageFile', event.target.files?.[0] || null)}
      />
      </label>
      </div>
      <div className="render-tag-editor" aria-label="Tag render">
      {(productForm.renderTags || []).map((tag, index) => (
        <div className="render-tag-row" key={index}>
        <span>TAG BRAND</span>
        <input
        value={tag.brand || ''}
        onChange={(event) => updateRenderTag(index, 'brand', event.target.value)}
        placeholder="Tag brand"
        />
        <span>TAG PRODOTTO</span>
        <input
        value={tag.product || ''}
        onChange={(event) => updateRenderTag(index, 'product', event.target.value)}
        placeholder="Tag prodotto"
        />
        <span>LINK</span>
        <input
        value={tag.link || ''}
        onChange={(event) => updateRenderTag(index, 'link', event.target.value)}
        placeholder="Link"
        />
        <button type="button" onClick={() => deleteRenderTag(index)} aria-label="Rimuovi tag">
        x
        </button>
        </div>
      ))}
      <button
      className={`render-tag-add ${placingRenderTag ? 'is-active' : ''}`}
      type="button"
      onClick={addRenderTag}
      >
      +
      </button>
      </div>
      </form>
      <div className="brand-form-actions" aria-label="Azioni render">
      <button className="brand-action-close" type="button" onClick={() => navigateBackend(renderSection.base)}>
      x
      </button>
      <button className="brand-action-delete" type="button" onClick={deleteRender} disabled={busy}>
      ELIMINA
      </button>
      <button className="brand-action-save" type="button" onClick={saveRender} disabled={busy}>
      SALVA
      </button>
      </div>
      {status && <p className="brand-form-status">{status}</p>}
      </main>
      </>
    );
  }
  
  if (activePeopleSection?.mode === 'list') {
    return (
      <>
      {renderGridControls()}
      <main className="backend-dashboard backend-detail">
      <button
      className="backend-dashboard-logo"
      type="button"
      aria-label="Torna al menu backend"
      onClick={() => navigateBackend('menu')}
      />
      <button className="backend-board-link" type="button" onClick={() => navigateBackend('menu')}>
      Bacheca
      </button>
      <h1 className="backend-detail-title">{activePeopleSection.title}</h1>
      <button className="backend-logout" type="button" onClick={logout} disabled={busy}>
      Logout
      </button>
      <section className="backend-peoplelist-workspace" aria-label={activePeopleSection.title}>
      {status && <p className="people-order-status" role="status">{status}</p>}
      {peopleItems.map((person, index) => {
        const imageUrl = person.image
        ? (person.image.startsWith('/') || person.image.startsWith('http') ? person.image : `/${person.image}`)
        : '';
        
        return (
          <div className="people-list-row" key={person.id}>
          <button
          className="people-list-item"
          type="button"
          disabled={busy}
          onClick={() => editPerson(person)}
          >
          {imageUrl && <img src={imageUrl} alt="" />}
          <span>{person.brand || person.name}</span>
          {person.model && <small>{person.model}</small>}
          </button>
          <div className="people-order-actions" role="group" aria-label={`Ordine di ${person.brand || person.name}`}>
          <button type="button" disabled={busy || index === 0} onClick={() => movePerson(person.id, -1)} aria-label={`Sposta su ${person.brand || person.name}`} title="Sposta su">↑</button>
          <button type="button" disabled={busy || index === peopleItems.length - 1} onClick={() => movePerson(person.id, 1)} aria-label={`Sposta giù ${person.brand || person.name}`} title="Sposta giù">↓</button>
          </div>
          </div>
        );
      })}
      {peopleItems.length === 0 && (
        <p className="brandlist-empty">Nessuna persona</p>
      )}
      </section>
      <button
      className="backend-add-button"
      type="button"
      onClick={() => {
        resetProductForm();
        navigateBackend(`${peopleSection.base}-new`);
      }}
      disabled={busy}
      >
      aggiungi
      </button>
      </main>
      </>
    );
  }
  
  if (activePeopleSection?.mode === 'new' || activePeopleSection?.mode === 'edit') {
    return (
      <>
      {renderGridControls()}
      <main className="backend-dashboard backend-detail">
      <button
      className="backend-dashboard-logo"
      type="button"
      aria-label="Torna al menu backend"
      onClick={() => navigateBackend('menu')}
      />
      <button className="backend-board-link" type="button" onClick={() => navigateBackend('menu')}>
      Bacheca
      </button>
      <h1 className="backend-detail-title">{activePeopleSection.title}</h1>
      <button className="backend-logout" type="button" onClick={logout} disabled={busy}>
      Logout
      </button>
      <form className="brand-form people-form" aria-label="Aggiungi persona">
      <label className="brand-image-preview" aria-label="Carica immagine persona">
      {productImagePreview ? <img src={productImagePreview} alt="" /> : <span>+</span>}
      <input
      type="file"
      accept="image/*"
      onChange={(event) => updateProductForm('imageFile', event.target.files?.[0] || null)}
      />
      </label>
      <div className="brand-form-labels" aria-hidden="true">
      <span>NOME E COGNOME</span>
      <span>RUOLO</span>
      </div>
      <div className="brand-form-fields">
      <input
      value={productForm.brand}
      onChange={(event) => updateProductForm('brand', event.target.value)}
      placeholder="Nome e cognome"
      />
      <input
      value={productForm.model}
      onChange={(event) => updateProductForm('model', event.target.value)}
      placeholder="Ruolo"
      />
      </div>
      </form>
      <div className="brand-form-actions" aria-label="Azioni persona">
      <button className="brand-action-close" type="button" onClick={() => navigateBackend(peopleSection.base)}>
      x
      </button>
      <button className="brand-action-delete" type="button" onClick={deletePerson} disabled={busy}>
      ELIMINA
      </button>
      <button className="brand-action-save" type="button" onClick={savePerson} disabled={busy}>
      SALVA
      </button>
      </div>
      {status && <p className="brand-form-status">{status}</p>}
      </main>
      </>
    );
  }
  
  if (backendStaticPages[backendView]) {
    return (
      <>
      {renderGridControls()}
      <main className="backend-dashboard backend-detail">
      <button
      className="backend-dashboard-logo"
      type="button"
      aria-label="Torna al menu backend"
      onClick={() => navigateBackend('menu')}
      />
      <button className="backend-board-link" type="button" onClick={() => navigateBackend('menu')}>
      Bacheca
      </button>
      <h1 className="backend-detail-title">{backendStaticPages[backendView]}</h1>
      <button className="backend-logout" type="button" onClick={logout} disabled={busy}>
      Logout
      </button>
      </main>
      </>
    );
  }
  
  return (
    <>
    {renderGridControls()}
    <main className="backend-dashboard">
    <div className="backend-dashboard-logo" aria-label="BigMat ETN" />
    <h1>Welcome</h1>
    <button className="backend-logout" type="button" onClick={logout} disabled={busy}>
    Logout
    </button>
    <nav className="backend-actions" aria-label="Sezioni backend">
    {adminActions.map((action, index) => (
      <button type="button" key={action.id} onClick={() => navigateBackend(action.id)}>
      <span>{index + 1}.</span>
      {action.label}
      </button>
    ))}
    </nav>
    </main>
    </>
  );
}

return (
  <>
  {renderGridControls()}
  
  <main className="shell">
  <section className="topbar">
  <div>
  <p className="eyebrow">{isAdminPage ? 'Gestione catalogo' : 'Catalogo prodotti'}</p>
  <h1>{isAdminPage ? 'Backend' : 'BigMat'}</h1>
  </div>
  <div className="topbar-actions">
  <a className="page-link" href={isAdminPage ? '/' : '/admin'}>
  {isAdminPage ? 'Catalogo' : 'Backend'}
  </a>
  {isAdminPage && (
    <button className="page-link" type="button" onClick={logout} disabled={busy}>
    Esci
    </button>
  )}
  <div className="stats" aria-label="Statistiche catalogo">
  <strong>{products.length}</strong>
  <span>prodotti</span>
  </div>
  </div>
  </section>
  
  <section className={isAdminPage ? 'workspace' : 'workspace public-workspace'}>
  {isAdminPage && (
    <form className="editor" onSubmit={saveProduct}>
    <div className="section-title">
    <h2>{form.id ? 'Modifica prodotto' : 'Nuovo prodotto'}</h2>
    {form.id && (
      <button className="icon-button" type="button" onClick={resetForm} title="Annulla modifica">
      x
      </button>
    )}
    </div>
    
    <label>
    Nome
    <input
    required
    value={form.name}
    onChange={(event) => updateField('name', event.target.value)}
    placeholder="Es. Malta premiscelata"
    />
    </label>
    
    <div className="field-row">
    <label>
    Categoria
    <input
    value={form.category}
    onChange={(event) => updateField('category', event.target.value)}
    placeholder="Es. Edilizia"
    />
    </label>
    <label>
    Prezzo
    <input
    type="number"
    min="0"
    step="0.01"
    value={form.price}
    onChange={(event) => updateField('price', event.target.value)}
    placeholder="0.00"
    />
    </label>
    </div>
    
    <label>
    Descrizione
    <textarea
    rows="4"
    value={form.description}
    onChange={(event) => updateField('description', event.target.value)}
    placeholder="Dettagli tecnici, uso consigliato, formato..."
    />
    </label>
    
    <label className="toggle">
    <input
    type="checkbox"
    checked={form.featured}
    onChange={(event) => updateField('featured', event.target.checked)}
    />
    <span>In evidenza</span>
    </label>
    
    <button className="primary" type="submit" disabled={busy}>
    {busy ? 'Salvataggio...' : form.id ? 'Aggiorna' : 'Pubblica'}
    </button>
    
    {status && <p className="status">{status}</p>}
    </form>
  )}
  
  <section className={isAdminPage ? 'catalog' : 'catalog public-catalog'}>
  <div className="toolbar">
  <input
  value={query}
  onChange={(event) => setQuery(event.target.value)}
  placeholder="Cerca prodotto"
  aria-label="Cerca prodotto"
  />
  <select value={category} onChange={(event) => setCategory(event.target.value)}>
  {categories.map((item) => (
    <option key={item}>{item}</option>
  ))}
  </select>
  </div>
  
  <div className="grid">
  {visibleProducts.map((product) => (
    <article className="product-card" key={product.id}>
    <div className="media">
    {product.image ? (
      <img src={product.image} alt={product.name} />
    ) : (
      <div className="placeholder">{product.name.slice(0, 2).toUpperCase()}</div>
    )}
    {product.featured && <span className="badge">In evidenza</span>}
    </div>
    <div className="product-body">
    <div>
    <p>{product.category || 'Senza categoria'}</p>
    <h3>{product.name}</h3>
    </div>
    <strong>{formatPrice(product.price)}</strong>
    <p className="description">{product.description || 'Nessuna descrizione inserita.'}</p>
    {isAdminPage && (
      <div className="actions">
      <button type="button" onClick={() => editProduct(product)}>
      Modifica
      </button>
      <button className="danger" type="button" onClick={() => deleteProduct(product)}>
      Elimina
      </button>
      </div>
    )}
    </div>
    </article>
  ))}
  </div>
  
  {!busy && visibleProducts.length === 0 && (
    <div className="empty">Nessun prodotto trovato.</div>
  )}
  </section>
  </section>
  </main>
  </>
);
}

function backendViewFromPath(pathname) {
  const normalized = pathname.replace(/\/+$/, '');
  const renderEditMatch = normalized.match(/^\/admin\/showroom-render\/edit\/([^/]+)$/);
  if (renderEditMatch) {
    return `showroom-render-edit:${decodeURIComponent(renderEditMatch[1])}`;
  }
  
  if (normalized === '/admin/showroom-render/new') {
    return 'showroom-render-new';
  }
  
  if (normalized === '/admin/showroom-render') {
    return 'showroom-render';
  }
  
  const peopleEditMatch = normalized.match(/^\/admin\/chi-siamo-persone\/edit\/([^/]+)$/);
  if (peopleEditMatch) {
    return `chi-siamo-persone-edit:${decodeURIComponent(peopleEditMatch[1])}`;
  }
  
  if (normalized === '/admin/chi-siamo-persone/new') {
    return 'chi-siamo-persone-new';
  }
  
  if (normalized === '/admin/chi-siamo-persone') {
    return 'chi-siamo-persone';
  }
  
  for (const base of Object.keys(backendStaticPages)) {
    if (normalized === `/admin/${base}`) {
      return base;
    }
  }
  
  for (const base of Object.keys(productSections)) {
    const productEditMatch = normalized.match(new RegExp(`^/admin/${base}/edit/([^/]+)$`));
    if (productEditMatch) {
      return `${base}-edit:${decodeURIComponent(productEditMatch[1])}`;
    }
    
    if (normalized === `/admin/${base}/new`) {
      return `${base}-new`;
    }
    
    if (normalized === `/admin/${base}`) {
      return base;
    }
  }
  
  const editMatch = normalized.match(/^\/admin\/home-brandlist\/edit\/([^/]+)$/);
  if (editMatch) {
    return `home-brandlist-edit:${decodeURIComponent(editMatch[1])}`;
  }
  
  if (normalized === '/admin/home-brandlist/new') {
    return 'home-brandlist-new';
  }
  
  if (normalized === '/admin/home-brandlist') {
    return 'home-brandlist';
  }
  
  return 'menu';
}

function backendPathForView(view) {
  if (view.startsWith('showroom-render-edit:')) {
    return `/admin/showroom-render/edit/${encodeURIComponent(view.replace('showroom-render-edit:', ''))}`;
  }
  
  if (view === 'showroom-render-new') {
    return '/admin/showroom-render/new';
  }
  
  if (view === 'showroom-render') {
    return '/admin/showroom-render';
  }
  
  if (view.startsWith('chi-siamo-persone-edit:')) {
    return `/admin/chi-siamo-persone/edit/${encodeURIComponent(view.replace('chi-siamo-persone-edit:', ''))}`;
  }
  
  if (view === 'chi-siamo-persone-new') {
    return '/admin/chi-siamo-persone/new';
  }
  
  if (view === 'chi-siamo-persone') {
    return '/admin/chi-siamo-persone';
  }
  
  if (backendStaticPages[view]) {
    return `/admin/${view}`;
  }
  
  for (const base of Object.keys(productSections)) {
    if (view.startsWith(`${base}-edit:`)) {
      return `/admin/${base}/edit/${encodeURIComponent(view.replace(`${base}-edit:`, ''))}`;
    }
    
    if (view === `${base}-new`) {
      return `/admin/${base}/new`;
    }
    
    if (view === base) {
      return `/admin/${base}`;
    }
  }
  
  if (view.startsWith('home-brandlist-edit:')) {
    return `/admin/home-brandlist/edit/${encodeURIComponent(view.replace('home-brandlist-edit:', ''))}`;
  }
  
  if (view === 'home-brandlist-new') {
    return '/admin/home-brandlist/new';
  }
  
  if (view === 'home-brandlist') {
    return '/admin/home-brandlist';
  }
  
  return '/admin';
}

function formatPrice(value) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(value || 0));
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
