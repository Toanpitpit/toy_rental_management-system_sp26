import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import "../styles/components/Footer.css";

const socialIcons = [Facebook, Twitter, Instagram, Youtube];

export function Footer() {
  return (
    <footer className="ftr-container">
      {/* Newsletter strip */}
      <div className="ftr-newsletter-strip">
        <div className="container-xl">
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
            <div>
              <h5 className="ftr-newsletter-title">Subscribe to our Newsletter</h5>
              <p className="ftr-newsletter-subtitle">
                Get updates on new toys, special offers and rental tips
              </p>
            </div>
            <div className="ftr-subscribe-box">
              <input
                type="email"
                placeholder="Enter your email address"
                className="form-control ftr-input"
              />
              <button className="btn ftr-subscribe-btn">
                Subscribe <ArrowRight size={14} className="ms-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main columns */}
      <div className="container-xl ftr-main">
        <div className="row g-4">
          {/* Brand */}
          <div className="col-12 col-sm-6 col-lg-2">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="ftr-brand-logo">🧸</div>
              <span className="ftr-brand-name">ToyRent</span>
            </div>
            <p className="ftr-brand-desc">
              Premium toy rentals for happy kids. Safe, sanitized, and delivered to your door.
            </p>
            <div className="d-flex gap-2 mt-4">
              {socialIcons.map((Icon, i) => (
                <a key={i} href="#" className="ftr-social-link">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div className="col-6 col-sm-3 col-lg-2">
            <h6 className="ftr-col-title">Company</h6>
            <ul className="ftr-list">
              {["About Us", "Careers", "Contact", "Blog", "Partners"].map((item) => (
                <li key={item}>
                  <a href="#" className="ftr-link">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-sm-3 col-lg-2">
            <h6 className="ftr-col-title">Quick Links</h6>
            <ul className="ftr-list">
              {[ "All Toys", "Categories", "Popular Toys", "New Arrivals", "Special Offers" ].map((item) => (
                <li key={item}>
                  <a href="#" className="ftr-link">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="col-6 col-sm-3 col-lg-2">
            <h6 className="ftr-col-title">Services</h6>
            <ul className="ftr-list">
              {[ "Rental Process", "Delivery & Pickup", "FAQ", "Safety Standards", "Returns Policy" ].map((item) => (
                <li key={item}>
                  <a href="#" className="ftr-link">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-6 col-sm-3 col-lg-4">
            <h6 className="ftr-col-title">Contact</h6>
            <ul className="ftr-list gap-3">
              <li className="ftr-contact-item">
                <Mail size={14} className="ftr-contact-icon" />
                <span>support@toyrent.com</span>
              </li>
              <li className="ftr-contact-item">
                <Phone size={14} className="ftr-contact-icon" />
                <span>+1 (800) 555-TOYS</span>
              </li>
              <li className="ftr-contact-item">
                <MapPin size={14} className="ftr-contact-icon" />
                <span>123 Toy Lane, Fun City, CA 90001</span>
              </li>
            </ul>
            <div className="ftr-hours">
              Mon – Sat 9:00 – 18:00
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="ftr-bottom-bar">
        <div className="container-xl d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
          <span className="ftr-copy">
            © 2026 ToyRent. All rights reserved.
          </span>
          <div className="ftr-policy-links">
            {["Privacy Policy", "Terms & Conditions", "Cookie Policy"].map((item) => (
              <a key={item} href="#" className="ftr-policy-link">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
