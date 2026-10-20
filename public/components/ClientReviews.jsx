function ClientReviews({ reviews }) {
  return (
    <div className="client-reviews" aria-label="Recensioni clienti">
      <div className="client-reviews-track">
        {reviews.map((review, index) => (
          <article className="client-review" key={`${review.author || 'review'}-${review.publishedAt || index}`}>
            <h3>{review.author || 'Cliente Google'}</h3>
            <div>
              <p>{review.text}</p>
              {review.googleMapsUri && (
                <a href={review.googleMapsUri} target="_blank" rel="noreferrer">
                  Recensione Google
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
