function PreloaderTestPage() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
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
