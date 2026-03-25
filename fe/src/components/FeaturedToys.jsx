import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ChevronRight, Loader } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import "../styles/components/FeaturedToys.css";

function FeaturedCard({ toy }) {
  const [liked, setLiked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className="ftc-card row g-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image column */}
      <div className="col-12 col-md-4 ftc-img-col">
        <img
          src={toy.thumbnail || "https://via.placeholder.com/600x400?text=No+Image"}
          alt={toy.title}
          className="ftc-img"
          onError={(e) => { 
            if (e.target.src !== "https://via.placeholder.com/600x400?text=No+Image") {
              e.target.src = "https://via.placeholder.com/600x400?text=No+Image"; 
            }
          }}
        />
        <span className="ftc-badge" style={{ background: "#3cb14a" }}>
          Nổi bật
        </span>
        <button
          onClick={() => setLiked(!liked)}
          className="ftc-like-btn"
        >
          <Heart
            size={18}
            fill={liked ? "#ef4444" : "none"}
            stroke={liked ? "#ef4444" : "#aaa"}
          />
        </button>
      </div>

      {/* Body column */}
      <div className="col-12 col-md-8">
        <div className="ftc-body h-100 d-flex flex-column justify-content-between">
          <div>
            <div className="text-muted small mb-1">{toy.category}</div>
            <h5 className="ftc-title">{toy.title}</h5>
            {toy.detail?.description && (
              <p className="ftc-desc">{toy.detail.description}</p>
            )}
          </div>

          <div className="d-flex align-items-center justify-content-between mt-auto">
            <div className="d-flex align-items-baseline">
              <span className="ftc-price">
                {toy.pricePerHour?.toLocaleString("vi-VN")}đ
              </span>
              <span className="ftc-price-unit ms-1">/giờ</span>
            </div>
            <button
              className="btn ftc-rent-btn"
              onClick={() => navigate(`/toys/${toy._id}`)}
            >
              Thuê ngay <ChevronRight size={18} className="ms-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeaturedToys() {
  const [toys, setToys] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance
      .get("/toys/featured")
      .then((res) => {
        if (res.data.success) setToys(res.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="ft-section">
      <div className="container-xl">
        {/* Header */}
        <div className="ft-header">
          <div>
            <h2 className="ft-title">Đồ chơi nổi bật</h2>
            <p className="ft-subtitle">Được thuê nhiều nhất trong tháng</p>
          </div>
          <button
            className="ft-view-all btn btn-link"
            onClick={() => navigate("/toys")}
          >
            Xem tất cả →
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-4">
            <Loader size={24} className="text-muted" style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : toys.length === 0 ? (
          <div className="text-center text-muted py-4">Chưa có dữ liệu.</div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {toys.map((toy) => (
              <FeaturedCard key={toy._id} toy={toy} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
