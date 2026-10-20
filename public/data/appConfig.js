const apiUrl = '/api/products.php';
const authUrl = '/api/auth.php';
const brandsApiUrl = '/api/brands.php';
const googleReviewsApiUrl = '/api/google-reviews.php';
const productCategoriesApiUrl = '/api/product-categories.php';
const layoutGridStorageKey = 'bigmat-layout-grid-visible';

const homeSectionColors = ['#f5f2f0', '#f5f2f0', '#58575c', '#f5f2f0', '#f5f2f0', '#f5f2f0'];

const fallbackClientReviews = [
  {
    author: 'Francesco Canino',
    rating: 5,
    text: "Distribuito bene nell'espozione dei prodotti offerti, con vasta scelta tra gli articoli dei marchi proposti. Personale qualificato e disponibilissimo.",
    googleMapsUri: '',
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
