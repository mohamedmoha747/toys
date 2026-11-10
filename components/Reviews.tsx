export function Reviews({ reviews }: { reviews: { name: string; text: string; rating: number }[] }) {
  if (!reviews.length) return null;
  const loop = reviews.length > 2 ? [reviews, reviews] : [reviews];
  return (
    <section className="reviews">
      <div className="wrap">
        <h2>What families say</h2>
      </div>
      <div className="marquee">
        <div className="marquee-track">
          {loop.map((group, groupIndex) => (
            <div className="marquee-group" key={groupIndex}>
              {group.map((review) => (
                <article className="review-card" key={`${groupIndex}-${review.name}`}>
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
          ))}
        </div>
      </div>
    </section>
  );
}
