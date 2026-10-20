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
