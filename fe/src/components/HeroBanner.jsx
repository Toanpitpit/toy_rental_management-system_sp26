import { useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { heroSlides as mockSlides } from "../constants/mockData";
import configService from "../services/configService";
import "../styles/components/HeroBanner.css";

export function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState(mockSlides);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await configService.getConfigByKey('hero_banners');
        if (res.success && res.data && res.data.length > 0) {
          setSlides(res.data);
        }
      } catch (error) {
        console.warn('Using mock banners due to error');
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (!slides.length) return;
    const timer = setInterval(() => {
      next();
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length, current]);

  const handleSlideChange = (newIndex) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(newIndex);
    setTimeout(() => setAnimating(false), 800);
  };

  const prev = () => handleSlideChange((current - 1 + slides.length) % slides.length);
  const next = () => handleSlideChange((current + 1) % slides.length);

  if (!slides.length) return null;
  const slide = slides[current];

  return (
    <section className="hb-section">
      {/* Background Images with Fade Effect */}
      {slides.map((s, idx) => (
        <div
          key={idx}
          className={`hb-bg-slide ${idx === current ? 'hb-active' : 'hb-hidden'}`}
          style={{ backgroundImage: `url(${s.bgImage})` }}
        />
      ))}
      
      {/* Overlay */}
      <div
        className="hb-overlay"
        style={{ background: slide.overlay || "rgba(0,0,0,0.4)" }}
      />

      <Container className="position-relative" style={{ zIndex: 10 }}>
        <div className={`hb-content-box animate__animated ${animating ? 'animate__fadeOutDown' : 'animate__fadeInUp'}`}>
          <span className="hb-tag">{slide.tag}</span>

          <h1 className="hb-title">{slide.title}</h1>
          <h2 className="hb-highlight">{slide.highlight}</h2>
          <p className="hb-subtitle">{slide.subtitle}</p>

          <Button variant="success" className="hb-cta-btn shadow-lg">
            {slide.cta}
          </Button>
        </div>
      </Container>

      {/* Navigation Arrows */}
      <Button
        variant="link"
        onClick={prev}
        className="hb-nav-arrow hb-nav-prev"
      >
        <ChevronLeft size={28} />
      </Button>

      <Button
        variant="link"
        onClick={next}
        className="hb-nav-arrow hb-nav-next"
      >
        <ChevronRight size={28} />
      </Button>

      {/* Indicators */}
      <div className="hb-indicators">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => handleSlideChange(i)}
            className={`hb-dot ${i === current ? 'hb-active' : ''}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
