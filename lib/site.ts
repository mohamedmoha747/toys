export const site = {
  name: "LMS",
  fullName: "LMS RC Toys",
  tagline: "Race more. Fly higher.",
  phone: "+91 98765 43210",
  phoneTel: "919876543210",
  email: "info@lmsrc.com",
  address: "Chennai, Tamil Nadu, India",
  hours: "24/7 Available",
};

export function waLink(message: string) {
  return `https://wa.me/${site.phoneTel}?text=${encodeURIComponent(message)}`;
}
