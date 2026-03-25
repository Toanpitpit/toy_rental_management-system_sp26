import { ShieldCheck, Truck, CreditCard, Clock, Award } from "lucide-react";
import { useState, useEffect } from "react";
import configService from "../services/configService";

const defaultPerks = [
  { icon: <Award size={28} />, title: "Great Value", desc: "Affordable daily rental rates so kids can enjoy more for less." },
  { icon: <Truck size={28} />, title: "Free Delivery", desc: "Free delivery and pickup for orders over $30. Fast and reliable." },
  { icon: <ShieldCheck size={28} />, title: "Safe & Sanitized", desc: "All toys are carefully cleaned and safety-checked before every rental." },
  { icon: <CreditCard size={28} />, title: "Secure Payment", desc: "Multiple secure payment options. Your data is always protected." },
  { icon: <Clock size={28} />, title: "24H Support", desc: "Our team is ready to help you any time, day or night." },
];

export function PromoSection() {
  const [promo, setPromo] = useState({
    subtitle: "Dream It, Build It",
    title: "ENJOY UP TO",
    highlight: "50% OFF",
    desc: "Toys for your little cuties — limited time offer!",
    cta: "SHOP NOW →",
    link: "/toys"
  });

  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const res = await configService.getConfigByKey('promo_banner');
        if (res.success && res.data) {
          setPromo(res.data);
        }
      } catch (error) {
        console.warn('Using default promo banner');
      }
    };
    fetchPromo();
  }, []);
  return (
    <section className="py-5" style={{ background: "#f7faf8" }}>
      <div className="container-xl">

        {/* Sale Banner */}
        <div
          className="rounded-4 overflow-hidden mb-5 p-5 d-flex flex-column flex-md-row align-items-center justify-content-between gap-4"
          style={{ background: "linear-gradient(135deg, #3cb14a 0%, #267a30 100%)" }}
        >
          <div className="text-white text-center text-md-start">
            <div
              className="mb-1 opacity-75"
              style={{ fontSize: "0.78rem", letterSpacing: 3, textTransform: "uppercase" }}
            >
              {promo.subtitle}
            </div>
            <h2 className="mb-1 text-white" style={{ fontWeight: 800 }}>
              {promo.title}{" "}
              <span style={{ fontSize: "3rem" }}>{promo.highlight}</span> OFF
            </h2>
            <p className="mb-0 text-white opacity-75" style={{ fontSize: "0.875rem" }}>
              {promo.desc}
            </p>
          </div>
          <button
            className="btn rounded-pill text-white px-5 py-2 fw-bold flex-shrink-0"
            style={{
              border: "2px solid #fff",
              background: "transparent",
              letterSpacing: 1,
              fontSize: "0.875rem",
            }}
            onMouseEnter={e => {
              e.target.style.backgroundColor = "#fff";
              e.target.style.color = "#3cb14a";
            }}
            onMouseLeave={e => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "#fff";
            }}
          >
            {promo.cta}
          </button>
        </div>

        <div className="row row-cols-2 row-cols-sm-3 row-cols-lg-5 g-4">
          {defaultPerks.map((perk, i) => (
            <div className="col" key={i}>
              <div className="d-flex flex-column align-items-center text-center gap-2">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: 56, height: 56, background: "#e0f5e4", color: "#3cb14a" }}
                >
                  {perk.icon}
                </div>
                <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#1f2937" }}>
                  {perk.title}
                </div>
                <div className="text-muted" style={{ fontSize: "0.775rem", lineHeight: 1.6 }}>
                  {perk.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
