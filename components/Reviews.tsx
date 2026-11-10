const reviews = [
  { name: "Arun Kumar", text: "The Thunder buggy arrived bound and ready. First pack on the ground was faster than I expected." },
  { name: "Shameer A", text: "Ordered a drone and a spare LiPo. Packing was tight and the props were protected." },
  { name: "Fathima", text: "Bought the hover drone for my nephew. Takeoff is one button and the guards actually help." },
  { name: "Riyaz M", text: "Wave Racer self-rights in the pool. WhatsApp reply came within a few minutes." },
  { name: "Karthik", text: "Drift King holds a line once the gyro is on. Tyres included were the right compound." },
  { name: "Ayesha", text: "Trainer plane is calm in a light breeze. Good first plane after a micro." },
  { name: "Hameed", text: "Rock crawler walked a kerb course without flipping. Alloy kit fitted the same chassis." },
  { name: "Naseer", text: "Charger storage mode is the feature I wanted. Both packs finished evenly." },
];

export function Reviews() {
  const loop = [reviews, reviews];
  return (
    <section className="reviews">
      <div className="wrap">
        <h2>What riders say</h2>
      </div>
      <div className="marquee">
        <div className="marquee-track">
          {loop.map((group, groupIndex) => (
            <div className="marquee-group" key={groupIndex}>
              {group.map((review) => (
                <article className="review-card" key={`${groupIndex}-${review.name}`}>
                  <div className="stars" aria-label="5 stars">★★★★★</div>
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
