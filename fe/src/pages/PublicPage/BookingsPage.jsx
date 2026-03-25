import { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Trash2, ExternalLink, Info, Clock, AlertCircle, CheckCircle2, History } from 'lucide-react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import bookingService from '../../services/bookingService';
import inspectionService from '../../services/inspectionService';
import ConfirmModal from '../../components/ConfirmModal';
import { toast } from 'react-toastify';
import '../../styles/pages/BookingsPage.css';

const STATUS_MAP = {
  PENDING_APPROVED: { text: 'Chờ duyệt', variant: 'warning' },
  WAITING_PAYMENT: { text: 'Chờ thanh toán', variant: 'info' },
  APPROVED: { text: 'Đã duyệt', variant: 'primary' },
  ACTIVE: { text: 'Đang thuê', variant: 'warning' },
  REJECTED: { text: 'Bị từ chối', variant: 'danger' },
  CANCELLED: { text: 'Đã hủy', variant: 'secondary' },
  COMPLETE: { text: 'Hoàn thành', variant: 'primary' },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null, loading: false });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedInspections, setSelectedInspections] = useState([]);
  const [inspectionsLoading, setInspectionsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (selectedBooking) {
      fetchInspections(selectedBooking._id);
    } else {
      setSelectedInspections([]);
    }
  }, [selectedBooking]);

  const fetchInspections = async (bookingId) => {
    try {
      setInspectionsLoading(true);
      const res = await inspectionService.getInspections(bookingId);
      if (res.success) {
        setSelectedInspections(res.data);
      }
    } catch (err) {
      console.error('Error fetching inspections:', err);
    } finally {
      setInspectionsLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getBookings();
      if (res.success) {
        setBookings(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    setConfirmModal({ show: true, id, loading: false });
  };

  const executeCancel = async () => {
    const { id } = confirmModal;
    setConfirmModal(prev => ({ ...prev, loading: true }));
    try {
      const res = await bookingService.cancelBooking(id);
      if (res.success) {
        toast.success('Hủy đơn thành công!');
        fetchBookings();
      } else {
        toast.error(res.message || 'Không thể hủy đơn.');
      }
    } catch (err) {
      toast.error('Lỗi: ' + err.message);
    } finally {
      setConfirmModal({ show: false, id: null, loading: false });
    }
  };

  const handlePayment = async (bookingId) => {
    try {
      setSelectedBooking(prev => ({ ...prev, paymentLoading: true }));
      const res = await bookingService.getPaymentUrl(bookingId);
      if (res.success && res.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else {
        toast.error(res.message || 'Không thể tạo liên kết thanh toán.');
      }
    } catch (err) {
      toast.error('Lỗi thanh toán: ' + err.message);
    } finally {
      setSelectedBooking(prev => ({ ...prev, paymentLoading: false }));
    }
  };

  return (
    <div className="bookings-page-wrapper">
      <Header navigate={navigate} />
      <Container className="py-5" style={{ minHeight: '70vh' }}>
        <h2 className="mb-4 fw-bold">Đơn đặt thuê của tôi</h2>
        
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" />
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : bookings.length === 0 ? (
          <div className="text-center py-5 bg-light rounded-4">
            <div className="display-1 mb-3">📭</div>
            <h4>Bạn chưa có đơn đặt thuê nào</h4>
            <Button variant="success" className="mt-3" onClick={() => navigate('/toys')}>
              Khám phá đồ chơi ngay
            </Button>
          </div>
        ) : (
          <div className="table-responsive shadow-sm rounded-4">
            <Table hover className="align-middle mb-0 bg-white">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">Đồ chơi</th>
                  <th className="border-0 py-3">Thời gian thuê</th>
                  <th className="border-0 py-3">Tổng tiền</th>
                  <th className="border-0 py-3">Trạng thái</th>
                  <th className="border-0 px-4 py-3 text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const status = STATUS_MAP[b.status] || { text: b.status, variant: 'secondary' };
                  const canCancel = ['PENDING_APPROVED', 'WAITING_PAYMENT'].includes(b.status);
                  
                  return (
                    <tr key={b._id}>
                      <td className="px-4">
                        <div className="d-flex align-items-center gap-3">
                          <img 
                            src={b.toyId?.thumbnail || 'https://via.placeholder.com/50'} 
                            alt={b.toyId?.title} 
                            style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '8px' }}
                          />
                          <div>
                            <div className="fw-bold">{b.toyId?.title}</div>
                            <div className="text-muted small">Cọc: {b.depositAmount?.toLocaleString()}đ</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="small">
                          <div><strong>Bắt đầu:</strong> {new Date(b.startDate).toLocaleString('vi-VN')}</div>
                          <div><strong>Kết thúc:</strong> {new Date(b.endDate).toLocaleString('vi-VN')}</div>
                        </div>
                      </td>
                      <td>
                        <div className="fw-bold text-success">
                          {(b.totalAmount).toLocaleString()}đ
                        </div>
                      </td>
                      <td>
                        <Badge 
                          bg={status.variant} 
                          className="rounded-pill px-3 py-2 fw-normal text-center"
                          style={{ minWidth: '110px' }}
                        >
                          {status.text}
                        </Badge>
                      </td>
                      <td className="px-4 text-end">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2 rounded-pill"
                          onClick={() => setSelectedBooking(b)}
                        >
                          Chi tiết
                        </Button>
                        {canCancel && (
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            className="rounded-pill"
                            onClick={() => handleCancel(b._id)}
                          >
                            Hủy đơn
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Container>

      {/* Booking Detail Modal */}
      <Modal 
        show={!!selectedBooking} 
        onHide={() => setSelectedBooking(null)} 
        centered 
        size="lg"
        className="booking-detail-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <Info className="text-primary" /> Chi tiết đơn đặt thuê
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          {selectedBooking && (
            <>
              {/* Product Info Card */}
              <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-4 shadow-sm border border-light">
                <img 
                  src={selectedBooking.toyId?.thumbnail} 
                  alt={selectedBooking.toyId?.title} 
                  style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 16 }}
                />
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <h5 className="fw-bold mb-1">{selectedBooking.toyId?.title}</h5>
                    <Badge 
                      bg={STATUS_MAP[selectedBooking.status]?.variant || 'secondary'} 
                      className="rounded-pill px-3 py-2 text-center"
                      style={{ minWidth: '110px' }}
                    >
                      {STATUS_MAP[selectedBooking.status]?.text || selectedBooking.status}
                    </Badge>
                  </div>
                  <p className="text-muted small mb-2">Mã đơn: <span className="text-dark fw-medium">#{selectedBooking._id.slice(-8).toUpperCase()}</span></p>
                  <p className="text-muted small mb-0 mt-1">Loại: <Badge bg="white" text="dark" className="border fw-normal">{selectedBooking.toyId?.category}</Badge></p>
                </div>
              </div>

              {/* Rejection Alert */}
              {selectedBooking.status === 'REJECTED' && (
                <Alert variant="danger" className="rounded-3 border-0 shadow-sm mb-4 d-flex align-items-start gap-3">
                  <AlertCircle className="mt-1 flex-shrink-0" />
                  <div>
                    <h6 className="fw-bold mb-1">Đơn bị từ chối</h6>
                    <p className="mb-0 small">{selectedBooking.rejectionReason || 'Rất tiếc, đơn hành này không thể thực hiện.'}</p>
                  </div>
                </Alert>
              )}

              <div className="row g-4">
                {/* Planned Schedule */}
                <div className="col-md-6">
                  <div className="h-100 border rounded-4 p-3 bg-white">
                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-primary">
                      <Clock size={18} /> Lịch hẹn đặt thuê
                    </h6>
                    <div className="small mb-3">
                      <div className="text-muted mb-1">Thời gian nhận dự kiến</div>
                      <div className="fw-medium text-dark">{new Date(selectedBooking.startDate).toLocaleString('vi-VN')}</div>
                    </div>
                    <div className="small">
                      <div className="text-muted mb-1">Thời gian trả dự kiến</div>
                      <div className="fw-medium text-dark">{new Date(selectedBooking.endDate).toLocaleString('vi-VN', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</div>
                    </div>
                  </div>
                </div>

                {/* Actual Schedule (Inspections) */}
                <div className="col-md-6">
                  <div className="h-100 border rounded-4 p-3 bg-white">
                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-success">
                      <CheckCircle2 size={18} /> Lịch sử thực tế
                    </h6>
                    {inspectionsLoading ? (
                      <div className="text-center py-3"><Spinner size="sm" variant="success" /></div>
                    ) : selectedInspections.length > 0 ? (
                      <>
                        {selectedInspections.find(i => i.type === 'pickup') && (
                          <div className="small mb-3">
                            <div className="text-muted mb-1">Đã nhận đồ vào</div>
                            <div className="fw-bold text-success">
                              {new Date(selectedInspections.find(i => i.type === 'pickup').createdAt).toLocaleString('vi-VN')}
                            </div>
                          </div>
                        )}
                        {selectedInspections.find(i => i.type === 'return') && (
                          <div className="small">
                            <div className="text-muted mb-1">Đã trả đồ vào</div>
                            <div className="fw-bold text-success">
                              {new Date(selectedInspections.find(i => i.type === 'return').createdAt).toLocaleString('vi-VN')}
                            </div>
                          </div>
                        )}
                        {!selectedInspections.find(i => i.type === 'return') && selectedInspections.find(i => i.type === 'pickup') && (
                          <div className="text-muted small italic mt-2">Đang sử dụng...</div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-3 text-muted small italic">Chưa có thông tin nhận/trả đồ</div>
                    )}
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="col-12 mt-4">
                  <div className="bg-success bg-opacity-10 p-4 rounded-4 border border-success border-opacity-10">
                    <h6 className="fw-bold mb-3 border-bottom border-success border-opacity-10 pb-2">Chi phí thanh toán</h6>
                    <div className="d-flex justify-content-between mb-2">
                        <span>Đơn giá thuê</span>
                        <span className="fw-medium">{selectedBooking.toyId?.pricePerHour?.toLocaleString('vi-VN')}đ / giờ</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Thời gian thuê (ước tính)</span>
                      <span className="fw-medium">
                        {Math.ceil((new Date(selectedBooking.endDate) - new Date(selectedBooking.startDate)) / (1000 * 60 * 60))} giờ
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Tổng phí thuê</span>
                      <span className="fw-bold">{selectedBooking.totalAmount?.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2 text-muted">
                      <span>Tiền đặt cọc (sẽ hoàn lại)</span>
                      <span>{selectedBooking.depositAmount?.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2 text-muted">
                      <span>Phương thức thanh toán</span>
                      <span className="fw-medium text-uppercase text-dark small">
                        {selectedBooking.paymentMethod === 'vnpay' ? 'VNPay' : 'Tiền mặt'}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mb-3 text-muted">
                      <span>Trạng thái thanh toán</span>
                      <span className={`fw-bold small text-uppercase ${selectedBooking.paymentStatus === 'paid' ? 'text-success' : 'text-warning'}`}>
                        {selectedBooking.paymentStatus === 'paid' ? 'Đã thanh toán' : 
                         selectedBooking.paymentStatus === 'failed' ? 'Thất bại' : 'Chưa thanh toán'}
                      </span>
                    </div>
                    <hr className="my-3 border-success border-opacity-25" />
                    <div className="d-flex justify-content-between text-success align-items-center">
                      <span className="fw-bold">TỔNG CỘNG</span>
                      <span className="fw-bold fs-4">
                        {(selectedBooking.totalAmount + selectedBooking.depositAmount).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedBooking.message && (
                <div className="mt-4 p-3 border-start border-4 border-info bg-light rounded-2">
                  <p className="text-muted small mb-1 fw-bold"><History size={14} className="me-1" /> Ghi chú từ khách hàng:</p>
                  <p className="small mb-0 fst-italic">"{selectedBooking.message}"</p>
                </div>
              )}

              {selectedBooking.status === 'WAITING_PAYMENT' && (
                <div className="mt-4">
                  <Button 
                    variant="success" 
                    className="w-100 py-3 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                    onClick={() => handlePayment(selectedBooking._id)}
                    disabled={selectedBooking.paymentLoading}
                  >
                    {selectedBooking.paymentLoading ? (
                      <Spinner size="sm" />
                    ) : (
                      <ExternalLink size={20} />
                    )}
                    Thanh toán đơn hàng ngay
                  </Button>
                  <p className="text-center text-muted small mt-2 mb-0">
                    Bạn sẽ được chuyển đến cổng thanh toán VNPay
                  </p>
                </div>
              )}

              {selectedBooking.employeeId && (
                <div className="mt-4 pt-3 border-top small text-muted text-end">
                  Phụ trách bởi nhân viên: <strong className="text-dark">{selectedBooking.employeeId.name}</strong>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 p-4 pt-0">
          <Button variant="secondary" className="px-5 rounded-pill fw-bold w-100" onClick={() => setSelectedBooking(null)}>
            Đóng cửa sổ
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reusable Confirm Modal */}
      <ConfirmModal
        show={confirmModal.show}
        onHide={() => setConfirmModal({ show: false, id: null, loading: false })}
        onConfirm={executeCancel}
        title="Xác nhận hủy đơn"
        message="Bạn có chắc chắn muốn hủy đơn đặt thuê này? Hành động này không thể hoàn tác."
        type="danger"
        confirmText="Đồng ý hủy"
        cancelText="Quay lại"
        loading={confirmModal.loading}
      />

      <Footer />
    </div>
  );
}
