import { useState, useEffect, useCallback } from 'react';
import { 
  Table, Badge, Card, Row, Col, Spinner, InputGroup, Form, Button, Dropdown, Pagination, Modal
} from 'react-bootstrap';
import { Search, UserCog, UserMinus, UserCheck, Shield, Mail } from 'lucide-react';
import userService from '../../services/userService';
import AdminLayout from '../../components/Admin/AdminLayout';
import useDebounce from '../../hooks/useDebounce';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';

export default function ManageUsers() {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', action: null });
  const debouncedSearch = useDebounce(searchText, 500);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userService.getUsers({ search: debouncedSearch, page, limit: 10 });
      if (res.success) {
        setUsers(res.data);
        setPagination(res.pagination || { total: res.data.length, pages: 1 });
      }
    } catch (err) {
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, page]);

  const handleRoleChange = async (userId, newRole) => {
    setConfirmModal({
      show: true,
      title: 'Xác nhận đổi vai trò',
      message: `Bạn có chắc chắn muốn thay đổi vai trò người dùng này thành ${newRole}?`,
      action: async () => {
        try {
          const res = await userService.updateUserRole(userId, newRole);
          if (res.success) {
            toast.success(`Đã cập nhật vai trò thành ${newRole}`);
            fetchUsers();
          }
        } catch (err) {
          toast.error('Không thể cập nhật vai trò');
        }
      }
    });
  };

  const handleStatusChange = async (userId, newStatus) => {
    const isBan = newStatus === 'BANNED';
    setConfirmModal({
      show: true,
      title: isBan ? 'Xác nhận khóa tài khoản' : 'Xác nhận mở khóa',
      message: `Bạn có chắc chắn muốn ${isBan ? 'khóa' : 'mở khóa'} tài khoản người dùng này?`,
      action: async () => {
        try {
          const res = await userService.updateUserStatus(userId, newStatus);
          if (res.success) {
            toast.success(`Đã ${isBan ? 'khóa' : 'mở khóa'} tài khoản`);
            fetchUsers();
          }
        } catch (err) {
          toast.error('Không thể cập nhật trạng thái');
        }
      }
    });
  };

  return (
    <AdminLayout>
      <div className="manage-users-page">
        <div className="dashboard-header mb-4">
          <h3 className="fw-bold mb-1">👥 Quản lý Người dùng</h3>
          <p className="text-muted small mb-0">Xem danh sách, phân quyền và quản lý trạng thái tài khoản người dùng</p>
        </div>

        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <Card.Header className="bg-white py-3 border-0">
            <Row className="align-items-center">
              <Col md={6}>
                <InputGroup className="bg-light border-0 rounded-pill px-2">
                  <InputGroup.Text className="bg-transparent border-0"><Search size={18} className="text-muted" /></InputGroup.Text>
                  <Form.Control 
                    className="bg-transparent border-0 shadow-none py-2" 
                    placeholder="Tìm theo tên, email..." 
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={6} className="text-end text-muted small">
                Có tổng cộng <strong>{pagination.total}</strong> người dùng trong hệ thống
              </Col>
            </Row>
          </Card.Header>
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle mb-0 custom-table">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-4 py-4 border-0">Người dùng</th>
                      <th className="py-4 border-0">Vai trò</th>
                      <th className="py-4 border-0">Trạng thái</th>
                      <th className="py-4 border-0">Ngày đăng ký</th>
                      <th className="py-4 border-0">Liên hệ</th>
                      <th className="px-4 py-4 border-0 text-center">Tùy chỉnh & Khóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-4">
                          <div className="d-flex align-items-center gap-3">
                            <img 
                              src={user.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
                              alt="" 
                              className="rounded-circle" 
                              style={{ width: 40, height: 40, objectFit: 'cover' }} 
                            />
                            <div>
                               <div className="fw-bold small">{user.name || 'N/A'}</div>
                               <div className="text-muted small" style={{ fontSize: 11 }}>{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge bg={user.role === 'ADMIN' ? 'danger' : (user.role === 'EMPLOYEE' ? 'info' : 'primary')} className="badge-fixed shadow-sm">
                            {user.role}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={user.status === 'ACTIVE' ? 'success' : 'secondary'} className="badge-fixed rounded-pill shadow-sm">
                            {user.status}
                          </Badge>
                        </td>
                        <td className="small text-muted">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
                        </td>
                        <td className="small">{user.phoneNumber || '—'}</td>
                         <td className="px-2">
                           <div className="d-flex align-items-center justify-content-center gap-3">
                              {/* Không cho phép đổi role/khóa tài khoản hệ thống (admin@gmail.com) hoặc chính mình */}
                              {user.email === 'admin@gmail.com' || user.email === userProfile?.email ? (
                                <Shield size={18} className="text-muted opacity-50" />
                              ) : (
                                <>
                                  {user.role === 'CUSTOMER' && (
                                    <Button variant="light" onClick={() => handleRoleChange(user._id, 'EMPLOYEE')} className="action-icon-btn text-primary bg-white shadow-sm" title="Lên Employee">
                                      <UserCheck size={16} />
                                    </Button>
                                  )}
                                  {user.role === 'EMPLOYEE' && (
                                    <Button variant="light" onClick={() => handleRoleChange(user._id, 'CUSTOMER')} className="action-icon-btn text-secondary bg-white shadow-sm" title="Về Customer">
                                      <UserCog size={16} />
                                    </Button>
                                  )}
                                  {user.role === 'ADMIN' && (
                                    <Button variant="light" onClick={() => handleRoleChange(user._id, 'EMPLOYEE')} className="action-icon-btn text-secondary bg-white shadow-sm" title="Về Employee">
                                      <UserCog size={16} />
                                    </Button>
                                  )}
                                  
                                  {user.status === 'ACTIVE' ? (
                                    <Button variant="light" onClick={() => handleStatusChange(user._id, 'BANNED')} className="action-icon-btn text-danger bg-white shadow-sm" title="Khóa">
                                      <UserMinus size={16} />
                                    </Button>
                                  ) : (
                                    <Button variant="light" onClick={() => handleStatusChange(user._id, 'ACTIVE')} className="action-icon-btn text-success bg-white shadow-sm" title="Mở khóa">
                                      <UserCheck size={16} />
                                    </Button>
                                  )}
                                </>
                              )}
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
          {pagination.pages > 1 && (
            <Card.Footer className="bg-white border-0 py-3 d-flex justify-content-center">
               <Pagination className="mb-0">
                 <Pagination.Prev onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} />
                 {[...Array(pagination.pages)].map((_, i) => (
                   <Pagination.Item key={i + 1} active={page === (i + 1)} onClick={() => setPage(i + 1)}>
                     {i + 1}
                   </Pagination.Item>
                 ))}
                 <Pagination.Next onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} />
               </Pagination>
            </Card.Footer>
          )}
        </Card>
      </div>

      <Modal show={confirmModal.show} onHide={() => setConfirmModal({ ...confirmModal, show: false })} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5">{confirmModal.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4 text-secondary">
          {confirmModal.message}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={() => setConfirmModal({ ...confirmModal, show: false })} className="px-4 rounded-3 text-secondary border-0">
            Hủy bỏ
          </Button>
          <Button variant="primary" onClick={() => {
            confirmModal.action();
            setConfirmModal({ ...confirmModal, show: false });
          }} className="px-4 rounded-3 shadow-sm border-0 bg-primary bg-gradient">
            Đồng ý
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .custom-table td, .custom-table th {
          padding-top: 1.5rem !important;
          padding-bottom: 1.5rem !important;
        }
        .custom-table th:first-child, .custom-table td:first-child {
          padding-left: 2rem !important;
        }
        .custom-table tr:hover {
          background-color: rgba(0,0,0,0.01);
        }
        .badge-fixed {
          width: 90px;
          display: inline-block;
          text-align: center;
          padding: 6px 0;
          font-weight: 500;
          letter-spacing: 0.5px;
        }
        .action-icon-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border-radius: 8px;
          transition: all 0.2s ease;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .action-icon-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
      `}</style>
    </AdminLayout>
  );
}
