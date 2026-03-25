import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Badge, Button } from "react-bootstrap";
import { Heart, Star } from "lucide-react";
import { popularToys as mockToys } from "../constants/mockData";
import toyService from "../services/toyService";
import "../styles/components/PopularToys.css";

function ToyCard({ toy }) {
  const [liked, setLiked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const image = toy.thumbnail || toy.image || "https://placehold.co/400x400?text=No+Image";
  const price = toy.pricePerHour || toy.pricePerDay;
  const title = toy.title || toy.name;
  const rating = toy.rating || 4.5;
  const reviewCount = toy.reviewCount || 0;

  return (
    <Card
      className="ptc-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="ptc-img-container">
        <Card.Img
          variant="top"
          src={image}
          alt={title}
          className="ptc-img"
          onError={(e) => {
            if (e.target.src !== "https://placehold.co/400x400?text=No+Image") {
              e.target.src = "https://placehold.co/400x400?text=No+Image";
            }
          }}
        />
        {toy.tag && (
          <Badge className="ptc-badge">
            {toy.tag}
          </Badge>
        )}
        <Button
          variant="light"
          className="ptc-like-btn"
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
        >
          <Heart
            size={15}
            fill={liked ? "#ef4444" : "none"}
            stroke={liked ? "#ef4444" : "#aaa"}
          />
        </Button>
      </div>

      <Card.Body className="ptc-body">
        <Card.Title className="ptc-name">
          {title}
        </Card.Title>
        <div className="ptc-rating">
          <Star size={12} fill="#f59e0b" stroke="none" />
          <span className="ptc-rating-value">{rating}</span>
          <span className="ptc-rating-count">({reviewCount})</span>
        </div>
        <div className="ptc-footer">
          <span className="ptc-price">
            ${price}/hour
          </span>
          <Button
            size="sm"
            className="ptc-rent-btn"
            onClick={() => toy._id && navigate(`/toys/${toy._id}`)}
          >
            Rent Now
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export function PopularToys() {
  const [displayToys, setDisplayToys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    toyService.getAllToys({ limit: 8, status: 'AVAILABLE' })
      .then((res) => {
        if (res.success) {
          setDisplayToys(res.data);
        }
      })
      .catch((err) => { console.error("Error fetching popular toys:", err); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="pt-section">
      <Container>
        <div className="pt-header">
          <div>
            <h2 className="pt-title">Popular Toys</h2>
            <p className="pt-subtitle">
              Most rented by happy families
            </p>
          </div>
          <a href="/toys" className="pt-view-all">
            View All →
          </a>
        </div>

        {loading ? (
          <div className="text-center py-5">
             <div className="spinner-border text-success" role="status"></div>
             <p className="mt-2 text-muted">Đang tải đồ chơi phổ biến...</p>
          </div>
        ) : displayToys.length === 0 ? (
          <div className="text-center py-5 text-muted">Chưa có đồ chơi nào khả dụng.</div>
        ) : (
          <Row xs={2} sm={3} lg={4} className="g-4">
            {displayToys.map((toy, idx) => (
              <Col key={toy._id || idx}>
                <ToyCard toy={toy} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </section>
  );
}
