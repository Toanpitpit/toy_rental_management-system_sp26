import { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { 
  BarChart3, 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';
import toyService from '../../services/toyService';
import bookingService from '../../services/bookingService';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalToys: 0,
    totalBookings: 0,
    activeBookings: 0,
    pendingBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const [toyRes, bookingRes] = await Promise.all([
          toyService.getListToys(),
          bookingService.getBookings({ limit: 100 })
        ]);

        if (toyRes.success && bookingRes.success) {
          const bookings = bookingRes.data;
          setStats({
            totalToys: toyRes.data.length,
            totalBookings: bookings.length,
            activeBookings: bookings.filter(b => b.status === 'active').length,
            pendingBookings: bookings.filter(b => b.status === 'pending_approved').length,
          });
        }
      } catch (err) {
        toast.error('Lỗi khi tải thống kê');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Tất cả Đồ chơi', value: stats.totalToys, icon: <Package className="text-primary" />, bg: 'bg-primary' },
    { title: 'Số Đặt hàng', value: stats.totalBookings, icon: <ShoppingCart className="text-success" />, bg: 'bg-success' },
    { title: 'Đơn đang thuê', value: stats.activeBookings, icon: <TrendingUp className="text-info" />, bg: 'bg-info' },
    { title: 'Đang chờ xử lý', value: stats.pendingBookings, icon: <Clock className="text-warning" />, bg: 'bg-warning' },
  ];

  return (
    <AdminLayout>
      <div className="admin-dashboard-page">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold mb-0">🏠 Dashboard Tổng quan</h3>
          <div className="small text-muted">{new Date().toLocaleDateString('vi-VN')}</div>
        </div>

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
        ) : (
          <>
            {/* Quick Stats */}
            <Row className="g-3 mb-4">
              {statCards.map((card, idx) => (
                <Col key={idx} xs={12} sm={6} lg={3}>
                  <Card className="border-0 shadow-sm rounded-4 h-100 p-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                       <span className="text-muted small fw-bold text-uppercase">{card.title}</span>
                       <div className="p-2 rounded-3 bg-light">{card.icon}</div>
                    </div>
                    <div className="h2 fw-bold mb-1">{card.value}</div>
                    <div className="text-muted small">Cập nhật thời gian thực</div>
                  </Card>
                </Col>
              ))}
            </Row>

            <Row className="g-4 mb-4">
              <Col md={8}>
                <Card className="border-0 shadow-sm rounded-4 h-100">
                  <Card.Header className="bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">🚀 Hoạt động gần đây</h5>
                    <button className="btn btn-sm btn-outline-success">Xem tất cả</button>
                  </Card.Header>
                  <Card.Body className="p-4">
                     <div className="text-center py-5 text-muted small">
                        <BarChart3 size={48} className="mb-3 opacity-25" />
                        <p>Biểu đồ thống kê hoạt động sẽ được tích hợp tại đây.</p>
                     </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 shadow-sm rounded-4 h-100">
                   <Card.Header className="bg-white py-3 border-0">
                     <h5 className="mb-0 fw-bold">⚠️ Cảnh báo & Nhắc nhở</h5>
                   </Card.Header>
                   <Card.Body className="p-4 px-3">
                      <div className="d-flex gap-3 mb-3 p-2 bg-warning bg-opacity-10 rounded-3 border-start border-warning border-4">
                         <AlertTriangle size={20} className="text-warning flex-shrink-0 mt-1" />
                         <div>
                            <div className="fw-bold small">Có {stats.pendingBookings} đơn chờ duyệt</div>
                            <div className="text-muted small">Khách đang đợi phản hồi sơm nhất</div>
                         </div>
                      </div>
                      <div className="d-flex gap-3 p-2 bg-success bg-opacity-10 rounded-3 border-start border-success border-4">
                         <CheckCircle size={20} className="text-success flex-shrink-0 mt-1" />
                         <div>
                            <div className="fw-bold small">Tất cả đồ chơi đã sẵn sàng</div>
                            <div className="text-muted small">Kho cập nhật lúc 2h trước</div>
                         </div>
                      </div>
                   </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
