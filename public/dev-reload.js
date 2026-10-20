(function () {
  const watchedFiles = ['/index.html', '/app.jsx', '/styles.css'];
  const intervalMs = 1000;
  const scrollStorageKey = 'bigmat-dev-scroll-position';
  const signatures = new Map();

  function saveScrollPosition() {
    window.sessionStorage.setItem(
      scrollStorageKey,
      JSON.stringify({ x: window.scrollX, y: window.scrollY })
    );
  }

  function restoreScrollPosition() {
    const rawPosition = window.sessionStorage.getItem(scrollStorageKey);
    if (!rawPosition) {
      return;
    }

    window.sessionStorage.removeItem(scrollStorageKey);

    try {
      const position = JSON.parse(rawPosition);
      window.requestAnimationFrame(() => {
        window.scrollTo(position.x || 0, position.y || 0);
      });
    } catch (error) {
      window.sessionStorage.removeItem(scrollStorageKey);
    }
  }

  async function getSignature(file) {
    const response = await fetch(`${file}?reload-check=${Date.now()}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return '';
    }

    return await response.text();
  }

  async function checkFiles() {
    try {
      for (const file of watchedFiles) {
        const signature = await getSignature(file);
        const previous = signatures.get(file);

        if (previous && signature && previous !== signature) {
          saveScrollPosition();
          window.location.reload();
          return;
        }

        if (signature) {
          signatures.set(file, signature);
        }
      }
    } catch (error) {
      // The PHP dev server may be restarting; try again on the next tick.
    }
  }

  checkFiles().then(() => {
    restoreScrollPosition();
    window.setInterval(checkFiles, intervalMs);
  });
})();
