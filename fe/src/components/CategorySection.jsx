import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import toyService from "../services/toyService";
import "../styles/components/CategorySection.css";

const CAT_COLORS = [
  "#FF6B6B", 
  "#4ECDC4", 
  "#45B7D1", 
  "#FFA07A",
  "#98D8C8", 
  "#F7D794", 
  "#786FA6", 
  "#63C230", 
];

export function CategorySection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await toyService.getAllCategories();
        if (res.success) {
          setCategories(res.data || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="cat-section">
      <Container>
        {/* Header */}
        <div className="cat-header">
          <h2 className="cat-title">Tìm kiếm theo danh mục</h2>
          <p className="cat-subtitle">
            Khám phá những món đồ chơi tuyệt vời nhất theo sở thích của bé
          </p>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" />
            <p className="text-muted mt-2">Đang tải danh mục...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-4 text-muted">
            Chưa có danh mục đồ chơi nào được cập nhật.
          </div>
        ) : (
          <Row xs={2} sm={3} lg={6} className="g-4 justify-content-center">
            {categories.map((cat, index) => (
              <Col key={index}>
                <Card
                  className="cat-card border-0"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/toys?category=${encodeURIComponent(cat)}`)}
                >
                  <div 
                    className="cat-icon-container" 
                    style={{ backgroundColor: CAT_COLORS[index % CAT_COLORS.length] }}
                  >
                    <span className="cat-initial">
                      {cat.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="cat-name text-truncate" title={cat}>
                      {cat}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </section>
  );
}
