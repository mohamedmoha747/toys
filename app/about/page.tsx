import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="wrap page prose">
      <div className="page-head">
        <h1>About LMS</h1>
        <p className="muted">{site.tagline}</p>
      </div>
      <p>
        LMS RC Toys is a Chennai hobby shop for people who want a kit that runs the same day it arrives. We stock
        remote-control cars, drones, boats, planes, helicopters, and the batteries and parts that keep them in the air
        or on the ground.
      </p>
      <p>
        Every ready-to-run model is checked for a bound radio, a charged pack where the kit includes one, and the
        spare hardware that usually goes missing in the box. If you are choosing a first car or a first trainer, message
        us on WhatsApp and we will point you at the calmer option.
      </p>
      <div className="trust">
        <article>
          <strong>Shop floor</strong>
          <span>{site.address}</span>
        </article>
        <article>
          <strong>Talk to us</strong>
          <span>{site.phone}</span>
        </article>
        <article>
          <strong>Email</strong>
          <span>{site.email}</span>
        </article>
        <article>
          <strong>Hours</strong>
          <span>Counter 10–8. WhatsApp all day.</span>
        </article>
      </div>
    </div>
  );
}
