import { useState, useEffect, useCallback } from 'react';
import { 
  Table, Button, Badge, Form, Row, Col, Card, Modal, 
  Spinner, InputGroup, Pagination 
} from 'react-bootstrap';
import { Plus, Edit2, Trash2, Search, Eye, Camera } from 'lucide-react';
import toyService from '../../services/toyService';
import AdminLayout from '../../components/Admin/AdminLayout';
import useDebounce from '../../hooks/useDebounce';
import { toast } from 'react-toastify';

const TOY_INITIAL_FORM = {
  title: '',
  category: '',
  pricePerHour: 0,
  depositValue: 0,
  status: 'AVAILABLE',
  thumbnail: '',
  description: '',
  ageRange: '',
  origin: '',
};

export default function ManageToys() {
  const [toys, setToys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 500);
  
  const [showModal, setShowModal] = useState(false);
  const [editingToy, setEditingToy] = useState(null);
  const [formData, setFormData] = useState(TOY_INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchToys = useCallback(async () => {
    try {
      setLoading(true);
      const res = await toyService.getListToys({ search: debouncedSearch });
      if (res.success) setToys(res.data);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách đồ chơi');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchToys();
  }, [fetchToys]);

  const handleOpenModal = (toy = null) => {
    if (toy) {
      setEditingToy(toy);
      setFormData({
        title: toy.title || '',
        category: toy.category || 'LEGO',
        pricePerHour: toy.pricePerHour || 0,
        depositValue: toy.depositValue || 0,
        status: toy.status || 'available',
        thumbnail: toy.thumbnail || '',
        description: toy.detail?.description || '',
        ageRange: toy.detail?.ageRange || '',
        origin: toy.detail?.origin || '',
      });
    } else {
      setEditingToy(null);
      setFormData(TOY_INITIAL_FORM);
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa đồ chơi này?')) return;
    try {
      const res = await toyService.deleteToy(id);
      if (res.success) {
        toast.success('Xóa thành công');
        fetchToys();
      }
    } catch (err) {
      toast.error('Lỗi khi xóa đồ chơi');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        pricePerHour: Number(formData.pricePerHour),
        depositValue: Number(formData.depositValue),
        status: formData.status,
        thumbnail: formData.thumbnail,
        detail: {
          description: formData.description,
          ageRange: formData.ageRange,
          origin: formData.origin,
          images: editingToy ? editingToy.detail?.images : []
        }
      };

      let res;
      if (editingToy) {
        res = await toyService.updateToy(editingToy._id, payload);
      } else {
        res = await toyService.createToy(payload);
      }

      if (res.success) {
        toast.success(editingToy ? 'Cập nhật thành công' : 'Thêm mới thành công');
        setShowModal(false);
        fetchToys();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi khi lưu đồ chơi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="manage-toys-page">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">📦 Quản lý Kho Đồ chơi</h3>
            <p className="text-muted small mb-0">Thêm, sửa, xóa và quản lý danh mục đồ chơi thuê</p>
          </div>
          <Button variant="success" className="d-flex align-items-center gap-2 shadow-sm" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Thêm đồ chơi mới
          </Button>
        </div>

        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <Card.Header className="bg-white py-3 border-0">
            <Row className="align-items-center">
              <Col md={6}>
                <InputGroup className="bg-light border-0 rounded-pill px-2">
                  <InputGroup.Text className="bg-transparent border-0"><Search size={18} className="text-muted" /></InputGroup.Text>
                  <Form.Control 
                    className="bg-transparent border-0 shadow-none py-2" 
                    placeholder="Tìm theo tên, danh mục..." 
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={6} className="text-end text-muted small">
                Hiển thị <strong>{toys.length}</strong> đồ chơi trong kho
              </Col>
            </Row>
          </Card.Header>
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-4 py-3 border-0">Đồ chơi</th>
                      <th className="py-3 border-0">Danh mục</th>
                      <th className="py-3 border-0">Giá thuê/Giờ</th>
                      <th className="py-3 border-0">Tiền cọc</th>
                      <th className="py-3 border-0">Trạng thái</th>
                      <th className="px-4 py-3 border-0 text-end">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {toys.map((toy) => (
                      <tr key={toy._id}>
                        <td className="px-4">
                          <div className="d-flex align-items-center gap-3">
                            <img src={toy.thumbnail} alt="" className="rounded" style={{ width: 45, height: 45, objectFit: 'cover' }} />
                            <div className="fw-bold fs-6">{toy.title}</div>
                          </div>
                        </td>
                        <td><Badge bg="light" text="dark" className="border">{toy.category}</Badge></td>
                        <td className="fw-semibold text-success">{toy.pricePerHour?.toLocaleString()}đ</td>
                        <td className="text-muted">{toy.depositValue?.toLocaleString()}đ</td>
                        <td>
                          <Badge bg={toy.status === 'AVAILABLE' ? 'success' : (toy.status === 'RENTED' ? 'danger' : 'warning')} className="badge-status">
                            {toy.status}
                          </Badge>
                        </td>
                        <td className="px-4 text-end">
                          <Button variant="link" className="p-1 me-2 text-primary" onClick={() => handleOpenModal(toy)}><Edit2 size={16} /></Button>
                          <Button variant="link" className="p-1 text-danger" onClick={() => handleDelete(toy._id)}><Trash2 size={16} /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Modal Thêm/Sửa */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered backdrop="static">
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold">{editingToy ? '📝 Chỉnh sửa Đồ chơi' : '➕ Thêm Đồ chơi mới'}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Tên đồ chơi</Form.Label>
                    <Form.Control 
                      required
                      value={formData.title} 
                      onChange={(e) => setFormData({...formData, title: e.target.value})} 
                      placeholder="VD: LEGO City Police Station"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Danh mục</Form.Label>
                    <Form.Control 
                      required
                      value={formData.category} 
                      onChange={(e) => setFormData({...formData, category: e.target.value})} 
                      placeholder="Lego, Car, Board Game..."
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Trạng thái</Form.Label>
                    <Form.Select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="available">Available</option>
                      <option value="rented">Rented</option>
                      <option value="pending">Pending</option>
                      <option value="unavailable">Unavailable</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Giá thuê mỗi giờ (đ)</Form.Label>
                    <Form.Control 
                      type="number"
                      required
                      value={formData.pricePerHour} 
                      onChange={(e) => setFormData({...formData, pricePerHour: e.target.value})} 
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Tiền cọc (đ)</Form.Label>
                    <Form.Control 
                      type="number"
                      required
                      value={formData.depositValue} 
                      onChange={(e) => setFormData({...formData, depositValue: e.target.value})} 
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Link ảnh đại diện (Thumbnail)</Form.Label>
                    <InputGroup>
                      <InputGroup.Text><Camera size={16} /></InputGroup.Text>
                      <Form.Control 
                        required
                        value={formData.thumbnail} 
                        onChange={(e) => setFormData({...formData, thumbnail: e.target.value})} 
                        placeholder="https://..."
                      />
                    </InputGroup>
                    {formData.thumbnail && (
                      <div className="mt-2 text-center border rounded p-2 bg-light">
                        <img src={formData.thumbnail} alt="Preview" style={{ maxHeight: 150 }} />
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Độ tuổi</Form.Label>
                    <Form.Control 
                      value={formData.ageRange} 
                      onChange={(e) => setFormData({...formData, ageRange: e.target.value})} 
                      placeholder="VD: 3+, 6-12"
                    />
                  </Form.Group>
                </Col>
                <Col md={8}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Xuất xứ</Form.Label>
                    <Form.Control 
                      value={formData.origin} 
                      onChange={(e) => setFormData({...formData, origin: e.target.value})} 
                      placeholder="Đan Mạch, Việt Nam..."
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Mô tả sản phẩm</Form.Label>
                    <Form.Control 
                      as="textarea"
                      rows={3}
                      value={formData.description} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})} 
                      placeholder="Mô tả chi tiết về đồ chơi..."
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button variant="light" className="px-4" onClick={() => setShowModal(false)} disabled={submitting}>Hủy</Button>
                <Button variant="success" className="px-4" type="submit" disabled={submitting}>
                  {submitting ? <Spinner size="sm" className="me-2" /> : null}
                  {editingToy ? 'Lưu thay đổi' : 'Thêm đồ chơi'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </AdminLayout>
  );
}
