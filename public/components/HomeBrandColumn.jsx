function HomeBrandColumn({ id, title, brands }) {
  return (
    <div className={`home-brands-category home-brands-category-${id}`}>
      <span>{title}</span>
      {brands.length > 0 && (
        <ul>
          {brands.map((brand) => (
            <li key={brand.id || brand.name}>
              <div className="home-brand-name">
                {brand.link ? (
                  <a href={brand.link} target="_blank" rel="noreferrer">
                    <span>{brand.name}</span>
                    <ion-icon name="arrow-up-sharp" aria-hidden="true"></ion-icon>
                  </a>
                ) : (
                  <span>
                    <span>{brand.name}</span>
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
  );
}
