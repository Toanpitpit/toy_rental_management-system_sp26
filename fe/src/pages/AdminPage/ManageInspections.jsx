import { useState, useEffect, useCallback } from 'react';
import { 
  Table, Badge, Card, Row, Col, Spinner, InputGroup, Form, Button, Modal
} from 'react-bootstrap';
import { Search, ClipboardCheck, Plus, Package, Truck, Eye, CheckCircle2, User, Calendar, MessageSquare, Image } from 'lucide-react';
import inspectionService from '../../services/inspectionService';
import AdminLayout from '../../components/Admin/AdminLayout';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../styles/pages/ManageInspections.css';

const CONDITION_COLORS = {
  New: 'success',
  Excellent: 'success',
  Good: 'info',
  Fair: 'warning',
  Broken: 'danger'
};

export default function ManageInspections() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedIns, setSelectedIns] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const navigate = useNavigate();

  const fetchInspections = useCallback(async () => {
    try {
      setLoading(true);
      const res = await inspectionService.getAllInspections();
      if (res.success) setInspections(res.data);
    } catch (err) {
      toast.error('Lỗi khi tải lịch sử kiểm tra');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  const filteredInspections = inspections.filter(ins => {
    const toyTitle = ins.bookingId?.toyId?.title?.toLowerCase() || '';
    const renterName = ins.bookingId?.renterId?.name?.toLowerCase() || '';
    const search = searchText.toLowerCase();
    return toyTitle.includes(search) || renterName.includes(search);
  });

  const handleOpenDetail = (ins) => {
    setSelectedIns(ins);
    setShowDetail(true);
  };

  return (
    <AdminLayout>
      <div className="manage-inspections-page px-3">
        <div className="dashboard-header mb-4 d-flex justify-content-between align-items-end">
          <div>
            <h3 className="fw-bold mb-1 text-dark">📋 Lịch sử Kiểm tra & Bàn giao</h3>
            <p className="text-secondary small mb-0">Hệ thống lưu trữ bằng chứng hình ảnh và tình trạng đồ chơi thực tế</p>
          </div>
          <Button 
            variant="success" 
            className="rounded-4 px-4 py-2 shadow-sm d-flex align-items-center gap-2 fw-bold"
            onClick={() => navigate('/admin/bookings')}
          >
            <Plus size={18} /> Lập phiếu kiểm tra mới
          </Button>
        </div>

        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <Card.Header className="bg-white py-4 border-0">
            <Row className="align-items-center">
              <Col md={5}>
                <InputGroup className="bg-light border-0 rounded-4 px-3 py-1">
                  <InputGroup.Text className="bg-transparent border-0"><Search size={18} className="text-muted" /></InputGroup.Text>
                  <Form.Control 
                    className="bg-transparent border-0 shadow-none" 
                    placeholder="Tìm theo đồ chơi, khách hàng..." 
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={7} className="text-end text-muted small">
                 <div className="fw-medium">Tổng số: <span className="text-success fw-bold">{inspections.length}</span> lượt kiểm tra</div>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
            ) : filteredInspections.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <ClipboardCheck size={64} className="mb-3 opacity-25" />
                <p className="fs-5 fw-medium">Không tìm thấy bản ghi nào</p>
                <Button variant="link" className="text-success text-decoration-none" onClick={() => setSearchText('')}>Xóa bộ lọc</Button>
              </div>
            ) : (
              <div className="ins-table-container">
                <Table hover className="ins-table align-middle">
                  <thead>
                    <tr>
                      <th>PHÂN LOẠI</th>
                      <th>ĐỒ CHƠI / ĐƠN HÀNG</th>
                      <th>KHÁCH HÀNG</th>
                      <th>TÌNH TRẠNG</th>
                      <th className="text-center">ẢNH</th>
                      <th>GHI CHÚ</th>
                      <th className="text-end">HÀNH ĐỘNG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInspections.map((ins) => {
                      const isPickup = ins.type === 'pickup';
                      const imgCount = ins.imageUrl?.length || 0;
                      return (
                        <tr key={ins._id}>
                          <td>
                            <div className={`ins-badge ${isPickup ? 'pickup' : 'return'}`}>
                              {isPickup ? <Package size={14}/> : <Truck size={14}/>}
                              {isPickup ? 'GIAO ĐỒ' : 'NHẬN ĐỒ'}
                            </div>
                          </td>
                          <td>
                            <div className="fw-bold text-dark">{ins.bookingId?.toyId?.title || '—'}</div>
                            <div className="text-muted small">#{ins.bookingId?._id?.slice(-8).toUpperCase()}</div>
                          </td>
                          <td>
                            <div className="fw-medium text-dark">{ins.bookingId?.renterId?.name || '—'}</div>
                            <div className="text-muted small font-monospace">{ins.bookingId?.renterId?.phoneNumber}</div>
                          </td>
                          <td>
                            <div className={`ins-condition-badge bg-${CONDITION_COLORS[ins.condition] || 'light'} text-white text-center`}>
                              {ins.condition}
                            </div>
                          </td>
                          <td className="text-center">
                             {imgCount > 0 ? (
                               <Badge bg="light" text="dark" className="border">
                                  <Image size={12} className="me-1" /> {imgCount} ảnh
                               </Badge>
                             ) : <span className="text-muted opacity-50 small">Không có</span>}
                          </td>
                          <td>
                            <div className="small text-truncate" style={{ maxWidth: '150px' }}>{ins.notes || '—'}</div>
                            {ins.surcharge > 0 && <div className="text-danger fw-bold x-small">Phụ phí: +{ins.surcharge.toLocaleString()}đ</div>}
                          </td>
                          <td className="text-end pe-4">
                             <Button 
                               variant="outline-success" 
                               size="sm" 
                               className="rounded-pill px-3 border-2"
                               onClick={() => handleOpenDetail(ins)}
                             >
                               <Eye size={14} className="me-1" /> Chi tiết
                             </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Detail Modal */}
        <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" centered rounded="4">
           {selectedIns && (
             <>
               <Modal.Header closeButton className="border-0 pb-0">
                  <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                    <CheckCircle2 className="text-success" /> Chi tiết phiếu kiểm tra
                  </Modal.Title>
               </Modal.Header>
               <Modal.Body className="p-4">
                  <Row className="g-4">
                     <Col md={7}>
                        <div className="mb-4">
                           <h6 className="fw-bold text-uppercase small text-muted mb-3 ls-wider">📸 Hình ảnh thực tế ({selectedIns.imageUrl?.length || 0})</h6>
                           {selectedIns.imageUrl?.length > 0 ? (
                             <div className="ins-image-preview-grid">
                                {selectedIns.imageUrl.map((url, i) => (
                                   <div key={i} className="ins-preview-item">
                                      <img src={url} alt={`Inspection ${i}`} onClick={() => window.open(url, '_blank')} />
                                   </div>
                                ))}
                             </div>
                           ) : (
                             <div className="p-4 bg-light rounded-4 text-center text-muted border border-dashed">
                                <Image size={32} className="mb-2 opacity-25" />
                                <div className="small">Không đính kèm ảnh thực tế</div>
                             </div>
                           )}
                        </div>
                        
                        <div>
                           <h6 className="fw-bold text-uppercase small text-muted mb-3 ls-wider">📝 Ghi chú & Đánh giá</h6>
                           <div className="p-3 bg-light rounded-4 border">
                               <div className="d-flex align-items-center gap-2 mb-2">
                                  <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3">Tình trạng: {selectedIns.condition}</span>
                                  {selectedIns.surcharge > 0 && (
                                     <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3">Phụ phí: {selectedIns.surcharge.toLocaleString()}đ</span>
                                  )}
                               </div>
                               <p className="mb-0 text-dark small" style={{ lineHeight: 1.6 }}>{selectedIns.notes || 'Không có ghi chú chi tiết nào được ghi lại.'}</p>
                           </div>
                        </div>
                     </Col>
                     
                     <Col md={5}>
                        <div className="p-4 bg-light rounded-4 border h-100">
                           <h6 className="fw-bold text-dark mb-4 border-bottom pb-2">Thông tin vận hành</h6>
                           
                           <div className="mb-3 d-flex gap-3">
                              <div className="text-muted"><User size={18} /></div>
                              <div>
                                 <div className="text-muted x-small">Nhân viên thực hiện</div>
                                 <div className="fw-bold">{selectedIns.employeeId?.name || 'Administrator'}</div>
                                 <div className="text-muted small">{selectedIns.employeeId?.email}</div>
                              </div>
                           </div>

                           <div className="mb-3 d-flex gap-3">
                              <div className="text-muted"><Calendar size={18} /></div>
                              <div>
                                 <div className="text-muted x-small">Thời gian ghi nhận</div>
                                 <div className="fw-bold text-dark">{new Date(selectedIns.createdAt).toLocaleString('vi-VN')}</div>
                              </div>
                           </div>

                           <hr className="my-4 opacity-10" />

                           <div className="mb-3 d-flex gap-3">
                              <div className="text-muted"><Package size={18} /></div>
                              <div>
                                 <div className="text-muted x-small">Đồ chơi</div>
                                 <div className="fw-bold text-success">{selectedIns.bookingId?.toyId?.title}</div>
                                 <div className="text-muted small">#{selectedIns.bookingId?._id?.slice(-8).toUpperCase()}</div>
                              </div>
                           </div>

                           <div className="mb-0 d-flex gap-3">
                              <div className="text-muted"><User size={18} className="text-primary" /></div>
                              <div>
                                 <div className="text-muted x-small">Khách hàng thuê</div>
                                 <div className="fw-bold">{selectedIns.bookingId?.renterId?.name}</div>
                                 <div className="text-muted small">{selectedIns.bookingId?.renterId?.phoneNumber}</div>
                              </div>
                           </div>
                        </div>
                     </Col>
                  </Row>
               </Modal.Body>
               <Modal.Footer className="border-0 px-4 pb-4">
                  <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => setShowDetail(false)}>Đóng phiên</Button>
                  <Button variant="success" className="rounded-pill px-4 fw-bold" onClick={() => toast.info('Chức năng in phiếu đang phát triển')}>In phiếu kiểm tra</Button>
               </Modal.Footer>
             </>
           )}
        </Modal>
      </div>
    </AdminLayout>
  );
}

