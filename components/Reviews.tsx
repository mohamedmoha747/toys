export function Reviews({ reviews }: { reviews: { name: string; text: string; rating: number }[] }) {
  if (!reviews.length) return null;
  return (
    <section className="reviews">
      <div className="wrap">
        <h2>What families say</h2>
        <div className="review-grid">
          {reviews.map((review) => (
            <article className="review-card" key={review.name}>
              <div className="stars" aria-label={`${review.rating} stars`}>{"★".repeat(review.rating)}</div>
              <p>{review.text}</p>
              <div className="who">
                <span className="avatar">{review.name.slice(0, 1)}</span>
                <div>
                  <strong>{review.name}</strong>
                  <br />
                  <small>Verified customer</small>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
