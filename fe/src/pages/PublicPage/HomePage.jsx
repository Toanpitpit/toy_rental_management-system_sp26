import { useNavigate } from "react-router-dom";
import { CategorySection } from "../../components/CategorySection";
import { FeaturedToys } from "../../components/FeaturedToys";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { HeroBanner } from "../../components/HeroBanner";
import { PopularToys } from "../../components/PopularToys";

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div style={{ background: "#f7faf8", minHeight: "100vh" }}>
      <Header navigate={navigate} />
      <HeroBanner />
      <CategorySection />
      <PopularToys />
      <FeaturedToys />
      <Footer />
    </div>
  );
}
