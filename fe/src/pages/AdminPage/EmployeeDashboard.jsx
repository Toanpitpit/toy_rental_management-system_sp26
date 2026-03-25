import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container, Table, Form, Button, Badge, Spinner,
  Modal, Row, Col, Alert, Pagination, InputGroup
} from 'react-bootstrap';
import { Search, CheckCircle, XCircle, Package, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import useBooking from '../../hooks/useBooking';
import inspectionService from '../../services/inspectionService';
import '../../styles/pages/EmployeeDashboard.css';

const STATUS_CONFIG = {
  pending_approved: { bg: 'warning', text: 'Chờ xác nhận' },
  active: { bg: 'primary', text: 'Đang thuê' },
  complete: { bg: 'success', text: 'Hoàn thành' },
  rejected: { bg: 'danger', text: 'Từ chối' },
  waiting_refund: { bg: 'info', text: 'Chờ hoàn cọc' },
  waiting_payment: { bg: 'warning', text: 'Chờ thanh toán' },
};

const INSPECT_INITIAL = {
  condition: 'Good',
  surcharge: 0,
  notes: '',
  paymentMethod: 'cash',
};

export default function EmployeeDashboard() {
  const { bookings, loading, pagination, fetchBookings, confirmBooking, rejectBooking } = useBooking();

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const searchTimer = useRef(null);

  const [showInspect, setShowInspect] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [inspectForm, setInspectForm] = useState(INSPECT_INITIAL);
  const [inspectLoading, setInspectLoading] = useState(false);

  const [showDetail, setShowDetail] = useState(false);
  const [detailBooking, setDetailBooking] = useState(null);

  const loadBookings = useCallback(() => {
    fetchBookings({ page, limit: 10, status: statusFilter || undefined, search: searchText || undefined });
  }, [page, statusFilter, searchText, fetchBookings]);

  // Debounce search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(1); loadBookings(); }, 400);
    return () => clearTimeout(searchTimer.current);
  }, [searchText, statusFilter]);

  useEffect(() => { loadBookings(); }, [page]);

  const handleConfirm = async (booking) => {
    try {
      const res = await confirmBooking(booking._id);
      if (res.success) { toast.success('✅ Xác nhận đơn thành công!'); loadBookings(); }
    } catch (err) { toast.error(err.message); }
  };

  const handleReject = async (booking) => {
    if (!window.confirm(`Từ chối đơn của "${booking.renterId?.name || booking.renterId?.email}"?`)) return;
    try {
      const res = await rejectBooking(booking._id);
      if (res.success) { toast.success('Đã từ chối đơn.'); loadBookings(); }
    } catch (err) { toast.error(err.message); }
  };

  const openInspection = (booking) => {
    setSelectedBooking(booking);
    setInspectForm(INSPECT_INITIAL);
    setShowInspect(true);
  };

  const handleSubmitInspection = async () => {
    setInspectLoading(true);
    try {
      const res = await inspectionService.createInspection(selectedBooking._id, {
        type: 'return',
        condition: inspectForm.condition,
        surcharge: Number(inspectForm.surcharge),
        notes: inspectForm.notes,
        rentalFee: selectedBooking.totalAmount || 0,
      });

      if (res.success) {
        toast.success('📦 Ghi nhận trả đồ thành công!');
        setShowInspect(false);
        loadBookings();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi tạo inspection.');
    } finally {
      setInspectLoading(false);
    }
  };

  const surchargeAmt = Number(inspectForm.surcharge);

  return (
    <div className="employee-dashboard">
      <Container fluid className="py-4">
        <div className="dashboard-header mb-4">
          <h2>🗂️ Quản lý Đơn Thuê</h2>
          <p className="text-muted">Xem và xử lý các đơn đặt thuê đồ chơi</p>
        </div>

        {/* Search & Filter */}
        <Row className="mb-3 g-2 align-items-center">
          <Col xs={12} md={5}>
            <InputGroup>
              <InputGroup.Text><Search size={16} /></InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Tìm theo tên, email, số điện thoại khách..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                id="employee-search"
              />
            </InputGroup>
          </Col>
          <Col xs={12} md={3}>
            <Form.Select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              id="status-filter"
            >
              <option value="">Tất cả trạng thái</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.text}</option>
              ))}
            </Form.Select>
          </Col>
          <Col xs="auto" className="ms-auto text-muted small">
            {pagination.total ?? 0} đơn
          </Col>
        </Row>

        {/* Table */}
        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <Package size={48} className="mb-2" />
            <p>Không có đơn nào.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="employee-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Khách hàng</th>
                  <th>Đồ chơi</th>
                  <th>Nhận</th>
                  <th>Trả</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => {
                  const sc = STATUS_CONFIG[b.status] || { bg: 'secondary', text: b.status };
                  return (
                    <tr key={b._id}>
                      <td className="text-muted small">{(page - 1) * 10 + i + 1}</td>
                      <td>
                        <div className="fw-semibold">{b.renterId?.name || '—'}</div>
                        <div className="text-muted small">{b.renterId?.email}</div>
                        <div className="text-muted small">{b.renterId?.phoneNumber}</div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {b.toyId?.thumbnail && (
                            <img src={b.toyId.thumbnail} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                          )}
                          <span className="fw-semibold small">{b.toyId?.title}</span>
                        </div>
                      </td>
                      <td className="small">{new Date(b.startDate).toLocaleString('vi-VN')}</td>
                      <td className="small">{new Date(b.endDate).toLocaleString('vi-VN')}</td>
                      <td className="fw-bold text-success">{b.totalAmount?.toLocaleString('vi-VN')}đ</td>
                      <td><Badge bg={sc.bg}>{sc.text}</Badge></td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          <Button
                            size="sm" variant="outline-secondary"
                            onClick={() => { setDetailBooking(b); setShowDetail(true); }}
                            title="Xem chi tiết"
                          >
                            <Eye size={14} />
                          </Button>

                          {b.status === 'pending_approved' && (
                            <>
                              <Button size="sm" variant="success" onClick={() => handleConfirm(b)} title="Xác nhận">
                                <CheckCircle size={14} />
                              </Button>
                              <Button size="sm" variant="outline-danger" onClick={() => handleReject(b)} title="Từ chối">
                                <XCircle size={14} />
                              </Button>
                            </>
                          )}

                          {b.status === 'active' && (
                            <Button size="sm" variant="primary" onClick={() => openInspection(b)}>
                              <Package size={14} className="me-1" /> Trả đồ
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {(pagination.pages || 0) > 1 && (
          <div className="d-flex justify-content-center mt-3">
            <Pagination size="sm">
              <Pagination.Prev onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} />
              {[...Array(pagination.pages)].map((_, i) => (
                <Pagination.Item key={i + 1} active={page === i + 1} onClick={() => setPage(i + 1)}>
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} />
            </Pagination>
          </div>
        )}
      </Container>

      {/* Detail Modal */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailBooking && (
            <Row className="g-3">
              <Col md={6}>
                <h6>👤 Khách hàng</h6>
                <div>{detailBooking.renterId?.name}</div>
                <div className="text-muted">{detailBooking.renterId?.email}</div>
                <div className="text-muted">{detailBooking.renterId?.phoneNumber}</div>
              </Col>
              <Col md={6}>
                <h6>🧸 Đồ chơi</h6>
                <div>{detailBooking.toyId?.title}</div>
                <div className="text-muted">{detailBooking.toyId?.category}</div>
              </Col>
              <Col md={6}>
                <h6>📅 Lịch thuê</h6>
                <div>Nhận: {new Date(detailBooking.startDate).toLocaleString('vi-VN')}</div>
                <div>Trả: {new Date(detailBooking.endDate).toLocaleString('vi-VN')}</div>
              </Col>
              <Col md={6}>
                <h6>💰 Chi phí</h6>
                <div>Thuê: <strong>{detailBooking.totalAmount?.toLocaleString('vi-VN')}đ</strong></div>
                <div>Cọc: <strong>{detailBooking.depositAmount?.toLocaleString('vi-VN')}đ</strong></div>
              </Col>
              {detailBooking.message && (
                <Col xs={12}>
                  <h6>💬 Ghi chú</h6>
                  <p className="text-muted">{detailBooking.message}</p>
                </Col>
              )}
            </Row>
          )}
        </Modal.Body>
      </Modal>

      {/* Return Inspection Modal */}
      <Modal show={showInspect} onHide={() => setShowInspect(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>📋 Kiểm tra & Ghi nhận Trả Đồ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <>
              <Alert variant="info" className="py-2">
                <strong>{selectedBooking.toyId?.title}</strong> — Khách: {selectedBooking.renterId?.name || selectedBooking.renterId?.email}
              </Alert>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label className="fw-semibold">Tình trạng đồ chơi khi trả</Form.Label>
                  <Form.Select
                    value={inspectForm.condition}
                    onChange={(e) => setInspectForm((p) => ({ ...p, condition: e.target.value }))}
                    id="inspect-condition"
                  >
                    {['New', 'Excellent', 'Good', 'Fair', 'Broken'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label className="fw-semibold">Phụ phí hỏng hóc (đ)</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    step={1000}
                    value={inspectForm.surcharge}
                    onChange={(e) => setInspectForm((p) => ({ ...p, surcharge: e.target.value }))}
                    id="inspect-surcharge"
                    placeholder="0"
                  />
                </Col>
                <Col md={6}>
                  <Form.Label className="fw-semibold">Phương thức thanh toán phụ phí</Form.Label>
                  <Form.Select
                    value={inspectForm.paymentMethod}
                    onChange={(e) => setInspectForm((p) => ({ ...p, paymentMethod: e.target.value }))}
                    id="inspect-payment"
                    disabled={surchargeAmt === 0}
                  >
                    <option value="cash">💵 Tiền mặt</option>
                    <option value="vnpay">🏦 VNPay</option>
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label className="fw-semibold">Ghi chú</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={inspectForm.notes}
                    onChange={(e) => setInspectForm((p) => ({ ...p, notes: e.target.value }))}
                    id="inspect-notes"
                    placeholder="Mô tả tình trạng, lý do phụ phí..."
                  />
                </Col>
              </Row>

              {/* Tổng kết */}
              <div className="mt-3 p-3 bg-light rounded">
                <div className="d-flex justify-content-between">
                  <span>Phí thuê ban đầu</span>
                  <strong>{selectedBooking.totalAmount?.toLocaleString('vi-VN')}đ</strong>
                </div>
                {surchargeAmt > 0 && (
                  <div className="d-flex justify-content-between text-danger">
                    <span>Phụ phí hỏng hóc</span>
                    <strong>+ {surchargeAmt.toLocaleString('vi-VN')}đ</strong>
                  </div>
                )}
                <hr className="my-1" />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Tổng phụ phí cần thu</span>
                  <span className={surchargeAmt > 0 ? 'text-danger' : 'text-success'}>
                    {surchargeAmt > 0 ? `${surchargeAmt.toLocaleString('vi-VN')}đ` : 'Không có'}
                  </span>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInspect(false)}>Hủy</Button>
          <Button variant="success" onClick={handleSubmitInspection} disabled={inspectLoading}>
            {inspectLoading ? <Spinner size="sm" className="me-1" /> : null}
            ✅ Xác nhận đã trả đồ
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
