import { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Badge } from 'react-bootstrap';
import { 
  Package, 
  ShoppingCart, 
  CheckCircle,
  Calendar,
  Clock,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area
} from 'recharts';
import AdminLayout from '../../components/Admin/AdminLayout';
import statsService from '../../services/statsService';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    quickStats: {
      totalToys: 0,
      pendingBookings: 0,
      totalBookings: 0,
      confirmedToday: 0,
      confirmedMonth: 0,
      confirmedYear: 0,
      totalRevenue: 0
    },
    dailyBookings: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const res = await statsService.getDashboardStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        toast.error('Lỗi khi tải thống kê');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const isAdmin = userProfile?.role === 'ADMIN';

  // Quick stats card layout
  const statCards = [
    { 
      title: 'Kho Đồ chơi', 
      value: stats.quickStats.totalToys, 
      icon: <Package size={22} />, 
      color: 'primary',
      sub: 'Dữ liệu toàn hệ thống'
    },
    { 
      title: 'Chờ duyệt', 
      value: stats.quickStats.pendingBookings, 
      icon: <Clock size={22} />, 
      color: 'warning',
      sub: 'Cần phản hồi'
    },
    { 
      title: 'Đã duyệt (Hôm nay)', 
      value: stats.quickStats.confirmedToday, 
      icon: <CheckCircle size={22} />, 
      color: 'success',
      sub: 'Trong ngày'
    },
    { 
      title: 'Đã duyệt (Tháng này)', 
      value: stats.quickStats.confirmedMonth, 
      icon: <Calendar size={22} />, 
      color: 'info',
      sub: 'Từ đầu tháng'
    },
  ];

  return (
    <AdminLayout>
      <div className="admin-dashboard-page p-4">
        <div className="dashboard-hero mb-4 d-flex justify-content-between align-items-end">
          <div>
            <h2 className="fw-bold mb-1 text-dark">📋 {isAdmin ? 'Quản lý Hệ thống' : 'Dashboard Nhân viên'}</h2>
            <p className="text-muted mb-0">Xin chào, <strong>{userProfile?.username || 'Bạn'}</strong>. Chúc bạn một ngày làm việc hiệu quả!</p>
          </div>
          <div className="text-end d-none d-md-block">
             <Badge bg="light" text="dark" className="border px-3 py-2 rounded-3 shadow-sm">
                <Clock size={16} className="me-2 text-primary" />
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
             </Badge>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : (
          <>
            {/* Simple Grid Stats */}
            <Row className="g-3 mb-4">
              {statCards.map((card, idx) => (
                <Col key={idx} xs={12} sm={6} lg={3}>
                  <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                    <Card.Body className="p-4">
                       <div className="d-flex justify-content-between align-items-center mb-3">
                          <div className={`p-2 rounded-3 bg-${card.color} bg-opacity-10 text-${card.color}`}>
                             {card.icon}
                          </div>
                          <span className="small text-muted fw-semibold">{card.sub}</span>
                       </div>
                       <h3 className="fw-bold mb-1">{card.value}</h3>
                       <div className="text-muted small fw-bold text-uppercase">{card.title}</div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            <Row className="g-4 mb-4">
              {/* Yearly Summary Card */}
              <Col lg={4}>
                 <Card className="border-0 shadow-sm rounded-4 h-100 bg-primary text-white p-2">
                    <Card.Body className="d-flex flex-column justify-content-center p-4">
                       <h6 className="opacity-75 text-uppercase fw-bold small mb-2">Tổng kết Năm {new Date().getFullYear()}</h6>
                       <h2 className="fw-bold mb-3">{stats.quickStats.confirmedYear} <span className="h5 fw-normal">Đơn đã duyệt</span></h2>
                       <hr className="bg-white opacity-25" />
                       <p className="small mb-0">Hệ thống ghi nhận hiệu suất tăng trưởng tốt trong năm nay. Tiếp tục phát huy!</p>
                       <div className="mt-4 pt-2">
                          <button className="btn btn-light btn-sm rounded-3 fw-bold px-3">
                             Chi tiết <ArrowUpRight size={14} className="ms-1" />
                          </button>
                       </div>
                    </Card.Body>
                 </Card>
              </Col>

              {/* Main Activity Chart */}
              <Col lg={8}>
                <Card className="border-0 shadow-sm rounded-4 h-100">
                  <Card.Header className="bg-white p-4 border-0 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                      <Activity size={18} className="text-primary" /> Hoạt động Thuê đồ 7 ngày
                    </h5>
                  </Card.Header>
                  <Card.Body className="px-4 pb-4">
                    <div style={{ width: '100%', height: 260 }}>
                      {stats.dailyBookings?.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stats.dailyBookings}>
                            <defs>
                              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#0d6efd" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                            <Tooltip 
                               contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} 
                            />
                            <Area type="monotone" dataKey="count" name="Số đơn" stroke="#0d6efd" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center py-5 text-muted small">Không có dữ liệu 7 ngày qua</div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Monthly and Revenue Distribution */}
            <Row className="g-4">
               <Col md={12}>
                  <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                    <Card.Body className="p-0">
                       <Row className="g-0">
                          <Col md={4} className="border-end p-4 bg-light bg-opacity-50">
                             <div className="d-flex align-items-center gap-2 mb-3">
                                <div className="p-2 rounded-2 bg-success bg-opacity-10 text-success"><ShoppingCart size={18} /></div>
                                <h6 className="mb-0 fw-bold">Doanh thu Hoàn tất</h6>
                             </div>
                             <h3 className="fw-bold mb-1">{stats.quickStats.totalRevenue?.toLocaleString()}đ</h3>
                             <p className="text-muted small">Ghi nhận từ các đơn đã hoàn thành</p>
                          </Col>
                          <Col md={8} className="p-4">
                             <div className="d-flex flex-wrap gap-4">
                                <div>
                                   <div className="text-muted small fw-bold">TỶ LỆ DUYỆT</div>
                                   <div className="h4 fw-bold mb-0">
                                      {stats.quickStats.totalBookings > 0 
                                         ? Math.round((stats.quickStats.confirmedYear / stats.quickStats.totalBookings) * 100)
                                         : 0}%
                                   </div>
                                </div>
                                <div className="vr d-none d-sm-block"></div>
                                <div>
                                   <div className="text-muted small fw-bold">TỔNG ĐƠN HÀNG</div>
                                   <div className="h4 fw-bold mb-0">{stats.quickStats.totalBookings}</div>
                                </div>
                             </div>
                          </Col>
                       </Row>
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
