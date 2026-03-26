import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Button, Form, Alert, Spinner, Badge, Modal, Card
} from 'react-bootstrap';
import { ChevronLeft } from 'lucide-react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import toyService from '../../services/toyService';
import useBooking from '../../hooks/useBooking';
import useAuth from '../../hooks/useAuth';
import '../../styles/pages/ToyDetail.css';

const STATUS_CONFIG = {
  AVAILABLE: { text: 'Sẵn sàng cho thuê', variant: 'success' },
  PENDING: { text: 'Đang có người đặt', variant: 'warning' },
  RENTED: { text: 'Đang được thuê', variant: 'danger' },
  UNAVAILABLE: { text: 'Không khả dụng', variant: 'secondary' },
};

export default function ToyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { createBooking, loading: bookingLoading } = useBooking();

  const [toy, setToy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [formError, setFormError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentType, setPaymentType] = useState('cod'); 

  // Auto navigate on success
  useEffect(() => {
    let timer;
    if (showSuccess) {
      timer = setTimeout(() => {
        navigate('/bookings');
      }, 4000);
    }
    return () => clearTimeout(timer);
  }, [showSuccess, navigate]);

  // Fetch toy data
  useEffect(() => {
    setLoading(true);
    setActiveImg(0); // Reset active image to first one
    toyService.getToyById(id)
      .then((res) => { if (res.success) setToy(res.data); })
      .catch(() => setToy(null))
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [id]);

  // Tính toán thời gian thuê
  const pickupMs = pickupDate ? new Date(pickupDate).getTime() : 0;
  const returnMs = returnDate ? new Date(returnDate).getTime() : 0;
  const diffMs = returnMs - pickupMs;
  const rentalHours = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60)) : 0;
  const estimatedTotal = rentalHours * (toy?.pricePerHour || 0);

  // Min datetime = now
  const minDatetime = new Date(Date.now() + 30 * 60 * 1000)
    .toISOString().slice(0, 16);

  const validateForm = () => {
    if (!userProfile) return 'Vui lòng đăng nhập để đặt thuê.';
    if (!pickupDate) return 'Vui lòng chọn thời gian nhận đồ.';
    if (!returnDate) return 'Vui lòng chọn thời gian trả đồ.';
    if (new Date(pickupDate) < new Date()) return 'Thời gian nhận không thể là quá khứ.';
    if (diffMs < 60 * 60 * 1000) return 'Thời gian thuê tối thiểu 1 giờ.';
    return '';
  };

  const handleBooking = async () => {
    const err = validateForm();
    if (err) { setFormError(err); return; }
    setFormError('');

    try {
      const res = await createBooking({
        toyId: id,
        startDate: new Date(pickupDate).toISOString(),
        endDate: new Date(returnDate).toISOString(),
        paymentType,
      });
      if (res.success) {
        if (res.paymentUrl) {
          window.location.href = res.paymentUrl;
        } else {
          setShowSuccess(true);
        }
      } else {
        setFormError(res.message || 'Đặt thuê thất bại.');
      }
    } catch (err) {
      setFormError(err.message || 'Đặt thuê thất bại.');
    }
  };

  // --- Render ---
  if (loading) return (
    <div className="text-center py-5 mt-5">
      <Spinner animation="border" variant="success" />
      <p className="text-muted mt-2">Đang tải thông tin...</p>
    </div>
  );

  if (!toy) return (
    <Container className="py-5 text-center">
      <div style={{ fontSize: 64 }}>😕</div>
      <h4>Không tìm thấy đồ chơi</h4>
      <Button variant="outline-success" onClick={() => navigate('/toys')}>Quay lại danh sách</Button>
    </Container>
  );

  const currentStatus = (toy.status || '').toUpperCase();
  const statusConf = STATUS_CONFIG[currentStatus] || { text: currentStatus, variant: 'secondary' };
  const canBook = currentStatus === 'AVAILABLE';
  const isMyBooking = userProfile && 
                    toy?.currentBooking?.renterId?.toString() === userProfile._id?.toString() &&
                    toy.status !== 'AVAILABLE';
  
  // Ensure default images if none exist
  const rawImages = [toy.thumbnail, ...(toy.detail?.images || [])].filter(Boolean);
  const allImages = rawImages.length > 0 ? rawImages : ['https://via.placeholder.com/600x400?text=No+Image+Available'];

  return (
    <div className="toy-detail-wrapper">
      <Header navigate={navigate} />
      <div className="toy-detail-page">
        {/* Breadcrumb */}
        <div className="toy-detail-breadcrumb py-3">
          <Container>
            <div className="d-flex align-items-center gap-2">
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="rounded-pill px-3 py-1 d-flex align-items-center gap-1 border-0 bg-light"
                onClick={() => navigate('/toys')}
              >
                <ChevronLeft size={14} /> Quay lại
              </Button>
              <div className="breadcrumb-links d-flex align-items-center gap-2 small">
                <span className="text-secondary">/</span>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-decoration-none p-0 text-success fw-medium"
                  onClick={() => navigate(`/toys?category=${encodeURIComponent(toy.category)}`)}
                >
                  {toy.category}
                </Button>
                <span className="text-secondary">/</span>
                <span className="text-dark fw-bold">{toy.title}</span>
              </div>
            </div>
          </Container>
        </div>

        <Container className="py-4">
          <Row className="g-4">
            {/* Cột ảnh */}
            <Col md={6}>
              <div className="toy-detail-main-img-wrap">
                <img
                  src={allImages[activeImg]}
                  alt={toy.title}
                  className="toy-detail-main-img"
                  onError={(e) => { 
                    if (e.target.src !== 'https://via.placeholder.com/600x400?text=No+Image') {
                      e.target.src = 'https://via.placeholder.com/600x400?text=No+Image'; 
                    }
                  }}
                />
                <Badge bg={statusConf.variant} className="toy-detail-status-badge">
                  {statusConf.text}
                </Badge>
              </div>
              {allImages.length > 1 && (
                <Row className="g-2 mt-2">
                  {allImages.map((img, i) => (
                    <Col xs={3} key={i}>
                      <img
                        src={img}
                        alt={`${toy.title} ${i}`}
                        className={`toy-detail-thumb ${activeImg === i ? 'active' : ''}`}
                        onClick={() => setActiveImg(i)}
                        onError={(e) => { 
                          if (e.target.src !== 'https://via.placeholder.com/100?text=No') {
                            e.target.src = 'https://via.placeholder.com/100?text=No'; 
                          }
                        }}
                      />
                    </Col>
                  ))}
                </Row>
              )}
            </Col>

            {/* Cột thông tin */}
            <Col md={6}>
              <Card className="border-0 shadow-sm rounded-4 mb-4">
                <Card.Body className="p-4">
                  <div className="text-success small fw-bold text-uppercase mb-2" style={{ letterSpacing: '1px' }}>
                    {toy.category}
                  </div>
                  <h2 className="toy-detail-title mb-3 fw-bold">{toy.title}</h2>

                  <div className="toy-detail-price-box mb-4 p-3 rounded-3" style={{ background: '#f8fdf9' }}>
                    <span className="toy-detail-price text-success h3 mb-0 fw-bold">
                      {toy.pricePerHour ? `${toy.pricePerHour.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                    </span>
                    <span className="toy-detail-price-unit ms-2 text-muted fw-normal">/ giờ</span>
                  </div>

                  {/* Thông tin chi tiết */}
                  <div className="toy-detail-specs mb-4">
                    <h6 className="fw-bold mb-3 border-bottom pb-2">Thông số sản phẩm</h6>
                    <Row className="g-2">
                      {toy.detail?.ageRange && (
                        <Col xs={6}><div className="small"><strong>Độ tuổi:</strong> {toy.detail.ageRange}</div></Col>
                      )}
                      {toy.detail?.origin && (
                        <Col xs={6}><div className="small"><strong>Xuất xứ:</strong> {toy.detail.origin}</div></Col>
                      )}
                      {toy.detail?.specifications?.material && (
                        <Col xs={6}><div className="small"><strong>Chất liệu:</strong> {toy.detail.specifications.material}</div></Col>
                      )}
                      {toy.detail?.specifications?.size && (
                        <Col xs={6}><div className="small"><strong>Kích thước:</strong> {toy.detail.specifications.size}</div></Col>
                      )}
                    </Row>
                  </div>

                  {toy.detail?.description && (
                    <div className="mb-4">
                      <h6 className="fw-bold mb-2">Mô tả</h6>
                      <p className="text-muted small mb-0" style={{ lineHeight: '1.6' }}>{toy.detail.description}</p>
                    </div>
                  )}

                  {/* Thông tin bổ sung */}
                  <div className="toy-detail-info-chips d-flex flex-wrap gap-2">
                    <Badge bg="light" text="dark" className="px-3 py-2 border fw-normal rounded-pill">
                      Cọc: <strong>{toy.depositValue?.toLocaleString('vi-VN')}đ</strong>
                    </Badge>
                    <Badge bg="light" text="dark" className="px-3 py-2 border fw-normal rounded-pill">
                      Nhận tại cửa hàng
                    </Badge>
                    <Badge bg="light" text="dark" className="px-3 py-2 border fw-normal rounded-pill">
                      Tối thiểu 1 giờ
                    </Badge>
                  </div>
                </Card.Body>
              </Card>

              {/* Form đặt thuê */}
              {isMyBooking ? (
                <Alert variant="info" className="border-0 shadow-sm rounded-4 d-flex align-items-center gap-3">
                  <div className="fs-3">🎁</div>
                  <div>
                    <strong className="d-block mb-1">
                      {toy.currentBooking?.status === 'ACTIVE' ? 'Bạn đang thuê món đồ này!' : 'Bạn đã đặt món đồ này!'}
                    </strong>
                    <Button 
                      variant="link" 
                      className="p-0 text-decoration-none small fw-bold text-info"
                      onClick={() => navigate('/bookings')}
                    >
                      Xem trạng thái đơn hàng của bạn →
                    </Button>
                  </div>
                </Alert>
              ) : canBook ? (
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                  <Card.Header className="bg-light border-0 py-3">
                    <h6 className="mb-0 fw-bold">Chọn thời gian thuê</h6>
                  </Card.Header>
                  <Card.Body className="p-4">
                    {formError && <Alert variant="danger" className="py-2 small" onClose={() => setFormError('')} dismissible>{formError}</Alert>}

                    <Form.Group className="mb-2">
                      <Form.Label>Thời gian nhận đồ <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="datetime-local"
                        value={pickupDate}
                        min={minDatetime}
                        onChange={(e) => setPickupDate(e.target.value)}
                        id="pickup-date"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Thời gian trả đồ <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="datetime-local"
                        value={returnDate}
                        min={pickupDate || minDatetime}
                        onChange={(e) => setReturnDate(e.target.value)}
                        id="return-date"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Phương thức thanh toán <span className="text-danger">*</span></Form.Label>
                      <div className="d-flex gap-3">
                        <Form.Check
                          type="radio"
                          label="Tiền mặt"
                          name="paymentType"
                          checked={paymentType === 'cod'}
                          onChange={() => setPaymentType('cod')}
                          id="pay-cash"
                        />
                        <Form.Check
                          type="radio"
                          label="VNPay"
                          name="paymentType"
                          checked={paymentType === 'vnpay'}
                          onChange={() => setPaymentType('vnpay')}
                          id="pay-vnpay"
                        />
                      </div>
                    </Form.Group>

                    {/* Ước tính chi phí */}
                    {rentalHours > 0 && (
                      <div className="toy-detail-estimate p-3 bg-light rounded-3 mb-3 small">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Thời gian thuê</span>
                          <strong>{rentalHours} giờ</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <span>Phí thuê ({toy.pricePerHour?.toLocaleString('vi-VN')}đ × {rentalHours}h)</span>
                          <strong>{estimatedTotal.toLocaleString('vi-VN')}đ</strong>
                        </div>
                        <div className="d-flex justify-content-between text-muted">
                          <span>Tiền cọc (hoàn lại)</span>
                          <span>{toy.depositValue?.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <hr className="my-2" />
                        <div className="d-flex justify-content-between fw-bold text-success fs-6">
                          <span>Tổng ước tính</span>
                          <span>{(estimatedTotal + toy.depositValue).toLocaleString('vi-VN')}đ</span>
                        </div>
                      </div>
                    )}

                    <div className="text-muted small mb-3">
                      Đến nhận trực tiếp tại: <strong>Cửa hàng ToyRent</strong>
                    </div>

                    <Button
                      variant="success"
                      size="lg"
                      className="w-100 fw-bold"
                      onClick={handleBooking}
                      disabled={bookingLoading || !userProfile}
                      id="btn-book-now"
                    >
                      {bookingLoading ? <Spinner size="sm" className="me-2" /> : null}
                      {userProfile ? 'Đặt thuê ngay' : 'Đăng nhập để đặt thuê'}
                    </Button>

                    {!userProfile && (
                      <Button
                        variant="outline-success"
                        className="w-100 mt-2 fw-medium"
                        onClick={() => navigate('/login')}
                      >
                        Đăng nhập
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              ) : (
                <Alert variant="warning" className="border-0 shadow-sm rounded-4">
                  <strong>Đồ chơi này hiện {statusConf.text.toLowerCase()}.</strong>
                  <br />
                  <Button
                    variant="link"
                    className="p-0 text-decoration-none fw-bold"
                    onClick={() => navigate('/toys')}
                  >
                    Xem đồ chơi khác →
                  </Button>
                </Alert>
              )}
            </Col>
          </Row>
        </Container>

        {/* Success Modal */}
        <Modal show={showSuccess} onHide={() => setShowSuccess(false)} centered backdrop="static" keyboard={false}>
          <Modal.Header>
            <Modal.Title className="w-100 text-center">🎉 Đặt thuê thành công!</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center py-5">
            <div className="success-checkmark">
              <div className="check-icon">
                <span className="icon-line line-tip"></span>
                <span className="icon-line line-long"></span>
                <div className="icon-circle"></div>
                <div className="icon-fix"></div>
              </div>
            </div>
            <h4 className="mt-4 fw-bold text-success">Cảm ơn bạn!</h4>
            <p className="mb-1">Đơn đặt thuê của bạn đã được ghi nhận thành công.</p>
            <p className="text-muted small">Bạn sẽ được tự động chuyển đến trang quản lý đơn hàng sau vài giây...</p>
          </Modal.Body>
          <Modal.Footer className="border-0 justify-content-center pb-4 pt-0">
            <Button 
              variant="success" 
              className="px-5 py-2 rounded-pill fw-bold" 
              onClick={() => navigate('/bookings')}
            >
              Xem đơn của tôi ngay
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
      <Footer />
    </div>
  );
}
