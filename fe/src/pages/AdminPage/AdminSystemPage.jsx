import { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { Save, Shield, Mail, Globe, Database } from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';
import { toast } from 'react-toastify';

export default function AdminSystemPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'ToyRent System',
    supportEmail: 'support@toyrent.com',
    allowRegistration: true,
    maintenanceMode: false,
    currency: 'VND',
    vnp_tmn: 'TMN12345',
    vnp_secret: 'SECRET_XXXX',
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Cấu hình đã được lưu thành công trên hệ thống!');
    } catch (err) {
      toast.error('Lỗi khi lưu cấu hình.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-system-page">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">⚙️ Cài đặt Hệ thống</h3>
            <p className="text-muted small">Quản lý các thông số cấu hình chung cho toàn bộ ứng dụng</p>
          </div>
          <Button variant="success" className="d-flex align-items-center gap-2 shadow-sm" onClick={handleSave} disabled={loading}>
            <Save size={18} /> Lưu tất cả thay đổi
          </Button>
        </div>

        <Row className="g-4">
          <Col lg={8}>
            <Form onSubmit={handleSave}>
              <Card className="border-0 shadow-sm rounded-4 mb-4">
                <Card.Header className="bg-white py-3 border-0 d-flex align-items-center gap-2">
                  <Globe size={18} className="text-primary" />
                  <h6 className="mb-0 fw-bold">Cấu hình Cơ bản</h6>
                </Card.Header>
                <Card.Body className="p-4">
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-bold">Tên Website</Form.Label>
                        <Form.Control 
                          value={settings.siteName} 
                          onChange={(e) => setSettings({...settings, siteName: e.target.value})} 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-bold">Email hỗ trợ</Form.Label>
                        <Form.Control 
                          type="email"
                          value={settings.supportEmail} 
                          onChange={(e) => setSettings({...settings, supportEmail: e.target.value})} 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Check 
                        type="switch"
                        id="allow-reg"
                        label="Cho phép đăng ký mới"
                        className="fw-semibold small"
                        checked={settings.allowRegistration}
                        onChange={(e) => setSettings({...settings, allowRegistration: e.target.checked})}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Check 
                        type="switch"
                        id="maintenance"
                        label="Bật chế độ bảo trì"
                        className="fw-semibold small text-danger"
                        checked={settings.maintenanceMode}
                        onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm rounded-4">
                <Card.Header className="bg-white py-3 border-0 d-flex align-items-center gap-2">
                  <Database size={18} className="text-success" />
                  <h6 className="mb-0 fw-bold">Cổng thanh toán VNPay</h6>
                </Card.Header>
                <Card.Body className="p-4">
                  <Alert variant="info" className="small py-2 border-0 bg-info bg-opacity-10 mb-4">
                    <Shield size={14} className="me-2" /> Các tham số này được lấy từ Sandbox VNPay.
                  </Alert>
                  <Row className="g-3">
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label className="small fw-bold">VNP_TMN_CODE</Form.Label>
                        <Form.Control 
                          value={settings.vnp_tmn} 
                          onChange={(e) => setSettings({...settings, vnp_tmn: e.target.value})} 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label className="small fw-bold">VNP_HASH_SECRET</Form.Label>
                        <Form.Control 
                          type="password"
                          value={settings.vnp_secret} 
                          onChange={(e) => setSettings({...settings, vnp_secret: e.target.value})} 
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Form>
          </Col>
          
          <Col lg={4}>
            <Card className="border-0 shadow-sm rounded-4 bg-primary text-white p-2 mb-4 text-center">
              <Card.Body>
                 <Mail size={32} className="mb-3" />
                 <h6>Gửi thông báo Email</h6>
                 <p className="small opacity-75">Hệ thống sẽ gửi email xác nhận cho khách hàng khi họ đặt đồ chơi hoặc thanh toán thành công.</p>
                 <Button variant="light" size="sm" className="fw-bold px-3">Kiểm tra kết nối</Button>
              </Card.Body>
            </Card>
            <Card className="border-0 shadow-sm rounded-4 p-2 text-center">
              <Card.Body>
                 <div className="display-6 mb-2">📊</div>
                 <h6 className="fw-bold">Thông tin Metadata</h6>
                 <div className="text-muted small">Phiên bản: 1.0.4 - Build Stable</div>
                 <div className="text-muted small">Last Sync: Today 14:00</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
}
