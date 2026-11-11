export const site = {
  name: "Limee enterprise",
  fullName: "Limee enterprise",
  tagline: "Race more. Fly higher.",
  phone: "+91 98765 43210",
  phoneTel: "919876543210",
  email: "info@limeetoys.com",
  address: "Chennai, Tamil Nadu, India",
  hours: "24/7 Available",
};

export function waLink(message: string, phoneTel = site.phoneTel) {
  return `https://wa.me/${phoneTel}?text=${encodeURIComponent(message)}`;
}
