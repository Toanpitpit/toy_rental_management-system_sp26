import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Table, Button, Badge, Form, Row, Col, Card, Modal, 
  Spinner, InputGroup, Pagination 
} from 'react-bootstrap';
import { Plus, Edit2, Trash2, Search, Eye, Camera, Filter, XCircle, X, Image as ImageIcon, Upload } from 'lucide-react';
import toyService from '../../services/toyService';
import AdminLayout from '../../components/Admin/AdminLayout';
import useDebounce from '../../hooks/useDebounce';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import "../../styles/pages/ManageToys.css";

const TOY_INITIAL_FORM = {
  title: '',
  category: 'LEGO',
  pricePerHour: 0,
  depositValue: 0,
  status: 'AVAILABLE',
  thumbnail: '',
  description: '',
  ageRange: '',
  origin: '',
  images: [], // List of detail image URLs
};

export default function ManageToys() {
  const { userProfile } = useAuth();
  const [toys, setToys] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const debouncedSearch = useDebounce(searchText, 500);
  
  const [showModal, setShowModal] = useState(false);
  const [editingToy, setEditingToy] = useState(null);
  const [formData, setFormData] = useState(TOY_INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  // File upload states
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState('');
  const [detailFiles, setDetailFiles] = useState([]);
  const thumbInputRef = useRef(null);
  const detailInputRef = useRef(null);

  const fetchCategories = async () => {
    try {
      const res = await toyService.getAllCategories();
      if (res.success) setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchToys = useCallback(async () => {
    try {
      setLoading(true);
      const res = await toyService.getAllToys({ 
        search: debouncedSearch,
        category: selectedCategory,
        status: selectedStatus,
        page,
        limit: 10
      });
      if (res.success) {
        setToys(res.data);
        setPagination(res.pagination || {});
      }
    } catch (err) {
      toast.error('Lỗi khi tải danh sách đồ chơi');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, selectedStatus, page]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchToys();
  }, [fetchToys]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory, selectedStatus]);

  const handleOpenModal = async (toy = null) => {
    setThumbFile(null);
    setThumbPreview('');
    setDetailFiles([]);
    
    if (toy) {
      try {
        // Fetch full toy detail to get description and detail images
        const res = await toyService.getToyById(toy._id);
        if (res.success) {
          const fullToy = res.data;
          setEditingToy(fullToy);
          setFormData({
            title: fullToy.title || '',
            category: fullToy.category || 'LEGO',
            pricePerHour: fullToy.pricePerHour || 0,
            depositValue: fullToy.depositValue || 0,
            status: fullToy.status || 'AVAILABLE',
            thumbnail: fullToy.thumbnail || '',
            description: fullToy.detail?.description || '',
            ageRange: fullToy.detail?.ageRange || '',
            origin: fullToy.detail?.origin || '',
            images: fullToy.detail?.images || [],
          });
          setThumbPreview(fullToy.thumbnail || '');
        }
      } catch (err) {
        toast.error('Lỗi khi lấy thông tin chi tiết đồ chơi');
        return;
      }
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

  const handleThumbChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbFile(file);
      setThumbPreview(URL.createObjectURL(file));
    }
  };

  const handleDetailFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setDetailFiles(prev => [...prev, ...files]);
  };

  const removeDetailFile = (index) => {
    setDetailFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (url) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== url)
    }));
  };

  const uploadFiles = async () => {
    let finalThumbnail = formData.thumbnail;
    let finalImages = [...formData.images];

    // 1. Upload thumbnail if chosen
    if (thumbFile) {
      const formDataThumb = new FormData();
      formDataThumb.append('images', thumbFile);
      const res = await toyService.uploadToyImages(formDataThumb);
      if (res.success && res.data?.length > 0) {
        finalThumbnail = res.data[0];
      }
    }

    // 2. Upload detail images if any
    if (detailFiles.length > 0) {
      const formDataDetails = new FormData();
      detailFiles.forEach(file => formDataDetails.append('images', file));
      const res = await toyService.uploadToyImages(formDataDetails);
      if (res.success && res.data) {
        finalImages = [...finalImages, ...res.data];
      }
    }

    return { finalThumbnail, finalImages };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // First, handle all file uploads
      const { finalThumbnail, finalImages } = await uploadFiles();

      const payload = {
        title: formData.title,
        category: formData.category,
        pricePerHour: Number(formData.pricePerHour),
        depositValue: Number(formData.depositValue),
        status: formData.status,
        thumbnail: finalThumbnail,
        description: formData.description,
        ageRange: formData.ageRange,
        origin: formData.origin,
        images: finalImages,
      };

      let res;
      if (editingToy) {
        res = await toyService.updateToy(editingToy._id, payload);
      } else {
        res = await toyService.createToy({
          ...payload,
          ownerId: userProfile?._id || userProfile?.id
        });
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

  const getStatusBadge = (status) => {
    const s = status?.toUpperCase();
    switch (s) {
      case 'AVAILABLE': return <Badge bg="success" className="mt-status-badge">Available</Badge>;
      case 'RENTED': return <Badge bg="danger" className="mt-status-badge">Rented</Badge>;
      case 'PENDING': return <Badge bg="warning" text="dark" className="mt-status-badge">Pending</Badge>;
      case 'UNAVAILABLE': return <Badge bg="secondary" className="mt-status-badge">Unavailable</Badge>;
      default: return <Badge bg="light" text="dark" className="mt-status-badge">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="mt-page">
        <div className="mt-header d-flex justify-content-between align-items-center">
          <div className="mt-title-box">
            <h3 className="fw-bold mb-1">📦 Quản lý Kho Đồ chơi</h3>
            <p className="text-muted small mb-0">Hệ thống quản lý tình trạng đồ chơi và danh mục</p>
          </div>
          <Button variant="success" className="mt-btn-add d-flex align-items-center gap-2 shadow-sm" onClick={() => handleOpenModal()}>
            <Plus size={20} fontWeight={700} /> Thêm đồ chơi
          </Button>
        </div>

        <Card className="mt-card">
          <Card.Body className="p-0">
            {/* Filters Section */}
            <div className="mt-filters p-4 border-bottom">
              <Row className="g-3 align-items-center">
                <Col lg={4} md={6}>
                  <InputGroup className="mt-search-group shadow-none border">
                    <InputGroup.Text className="bg-transparent border-0 pe-1">
                      <Search size={18} className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control 
                      className="mt-search-input bg-transparent border-0" 
                      placeholder="Tìm theo tên đồ chơi..." 
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                    {searchText && (
                      <InputGroup.Text className="bg-transparent border-0 p-0 me-2" role="button" onClick={() => setSearchText('')}>
                        <XCircle size={16} className="text-muted opacity-50" />
                      </InputGroup.Text>
                    )}
                  </InputGroup>
                </Col>
                
                <Col lg={3} md={6}>
                  <div className="d-flex align-items-center gap-2">
                    <Filter size={16} className="text-muted" />
                    <Form.Select 
                      className="mt-select-filter"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="">Tất cả danh mục</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </Form.Select>
                  </div>
                </Col>

                <Col lg={3} md={6}>
                  <div className="d-flex align-items-center gap-2">
                    <Filter size={16} className="text-muted" />
                    <Form.Select 
                      className="mt-select-filter"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="">Tất cả trạng thái</option>
                      <option value="AVAILABLE">Available</option>
                      <option value="RENTED">Rented</option>
                      <option value="PENDING">Pending</option>
                      <option value="UNAVAILABLE">Unavailable</option>
                    </Form.Select>
                  </div>
                </Col>
                
                <Col lg={2} md={6} className="text-lg-end text-muted small">
                  {toys.length > 0 ? (
                    <span>Hiển thị <strong>{toys.length}</strong> đồ chơi</span>
                  ) : (
                    <span className="text-danger">Không tìm thấy đồ chơi</span>
                  )}
                </Col>
              </Row>
            </div>

            {/* Table Section */}
            <div className="table-responsive">
              <Table borderless hover className="mt-table align-middle mb-0">
                <thead>
                  <tr>
                    <th className="px-4" style={{ width: '30%' }}>Đồ chơi</th>
                    <th>Danh mục</th>
                    <th>Giá thuê</th>
                    <th>Tiền cọc</th>
                    <th>Trạng thái</th>
                    <th className="px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <Spinner animation="border" variant="success" />
                        <div className="mt-2 text-muted small">Đang tải dữ liệu...</div>
                      </td>
                    </tr>
                  ) : toys.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                         <div className="text-muted opacity-25 mb-2"><Eye size={48} /></div>
                         <div className="text-muted small">Không tìm thấy đồ chơi nào phù hợp</div>
                      </td>
                    </tr>
                  ) : toys.map((toy) => (
                    <tr key={toy._id}>
                      <td className="px-4">
                        <div className="d-flex align-items-center gap-3">
                          <img src={toy.thumbnail || '/placeholder-toy.png'} alt="" className="mt-toy-avatar" />
                          <div>
                            <div className="mt-toy-name">{toy.title}</div>
                            <div className="text-muted x-small" style={{fontSize: '0.75rem'}}>ID: {toy._id.substring(18)}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge bg="light" text="dark" className="mt-badge-category border">
                          {toy.category}
                        </Badge>
                      </td>
                      <td>
                        <div className="mt-price">{(toy.pricePerHour || 0).toLocaleString()}đ</div>
                        <div className="text-muted x-small" style={{fontSize: '0.7rem'}}>/ giờ</div>
                      </td>
                      <td className="mt-deposit">
                        {(toy.depositValue || toy.pricePerHour * 20 || 0).toLocaleString()}đ
                      </td>
                      <td>{getStatusBadge(toy.status)}</td>
                      <td className="px-4">
                        <div className="d-flex justify-content-center gap-1">
                          <button 
                            className={`mt-btn-action mt-btn-edit ${toy.status === 'RENTED' ? 'opacity-25 cursor-not-allowed' : ''}`} 
                            title={toy.status === 'RENTED' ? 'Đồ chơi đang được thuê, không thể sửa' : 'Chỉnh sửa'} 
                            onClick={() => toy.status === 'RENTED' ? toast.warning('Đồ chơi đang được thuê, không thể chỉnh sửa!') : handleOpenModal(toy)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className={`mt-btn-action mt-btn-delete ${toy.status === 'RENTED' ? 'opacity-25 cursor-not-allowed' : ''}`} 
                            title={toy.status === 'RENTED' ? 'Đồ chơi đang được thuê, không thể xóa' : 'Xóa'} 
                            onClick={() => toy.status === 'RENTED' ? toast.warning('Đồ chơi đang được thuê, không thể xóa!') : handleDelete(toy._id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* Pagination Section */}
            {pagination.pages > 1 && (
              <div className="p-4 border-top d-flex justify-content-center">
                <Pagination className="mt-pagination mb-0">
                  <Pagination.Prev 
                    disabled={page === 1} 
                    onClick={() => setPage(page - 1)} 
                  />
                  {[...Array(pagination.pages)].map((_, i) => (
                    <Pagination.Item 
                      key={i + 1} 
                      active={i + 1 === page}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next 
                    disabled={page === pagination.pages} 
                    onClick={() => setPage(page + 1)} 
                  />
                </Pagination>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Modal Thêm/Sửa */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered backdrop="static" contentClassName="mt-modal-content">
          <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
            <Modal.Title className="fw-bold">{editingToy ? '📝 Chỉnh sửa Đồ chơi' : '➕ Thêm Đồ chơi mới'}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form onSubmit={handleSubmit}>
              <Row className="g-4">
                {/* Left Column: Basic Info */}
                <Col lg={7}>
                  <Row className="g-3">
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label className="mt-form-label fw-bold">Tên đồ chơi</Form.Label>
                        <Form.Control 
                          required
                          className="mt-form-input shadow-none"
                          value={formData.title} 
                          onChange={(e) => setFormData({...formData, title: e.target.value})} 
                          placeholder="VD: LEGO City Police Station"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="mt-form-label fw-bold">Danh mục</Form.Label>
                        <Form.Control 
                          required
                          className="mt-form-input shadow-none"
                          value={formData.category} 
                          onChange={(e) => setFormData({...formData, category: e.target.value})} 
                          placeholder="Lego, Car, Board Game..."
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="mt-form-label fw-bold">Trạng thái</Form.Label>
                        <Form.Select 
                          className="mt-form-input shadow-none"
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                        >
                          <option value="AVAILABLE">Available</option>
                          <option value="RENTED">Rented</option>
                          <option value="PENDING">Pending</option>
                          <option value="UNAVAILABLE">Unavailable</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="mt-form-label fw-bold">Giá thuê mỗi giờ (đ)</Form.Label>
                        <Form.Control 
                          type="number"
                          required
                          className="mt-form-input shadow-none"
                          value={formData.pricePerHour} 
                          onChange={(e) => setFormData({...formData, pricePerHour: e.target.value})} 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="mt-form-label fw-bold">Tiền cọc (đ)</Form.Label>
                        <Form.Control 
                          type="number"
                          required
                          className="mt-form-input shadow-none"
                          value={formData.depositValue} 
                          onChange={(e) => setFormData({...formData, depositValue: e.target.value})} 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="mt-form-label fw-bold">Độ tuổi</Form.Label>
                        <Form.Control 
                          className="mt-form-input shadow-none"
                          value={formData.ageRange} 
                          onChange={(e) => setFormData({...formData, ageRange: e.target.value})} 
                          placeholder="VD: 3+, 6-12"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="mt-form-label fw-bold">Xuất xứ</Form.Label>
                        <Form.Control 
                          className="mt-form-input shadow-none"
                          value={formData.origin} 
                          onChange={(e) => setFormData({...formData, origin: e.target.value})} 
                          placeholder="Đan Mạch, Việt Nam..."
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label className="mt-form-label fw-bold">Mô tả sản phẩm</Form.Label>
                        <Form.Control 
                          as="textarea"
                          rows={4}
                          className="mt-form-input shadow-none"
                          value={formData.description} 
                          onChange={(e) => setFormData({...formData, description: e.target.value})} 
                          placeholder="Mô tả chi tiết về đồ chơi, tính năng..."
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Col>

                {/* Right Column: Media Management */}
                <Col lg={5}>
                  <div className="mb-4">
                    <Form.Label className="mt-form-label fw-bold d-flex align-items-center gap-2">
                       <ImageIcon size={18} /> Ảnh đại diện (Thumbnail)
                    </Form.Label>
                    <div 
                      className="mt-thumbnail-upload-box text-center p-3 border rounded-4 bg-light cursor-pointer"
                      onClick={() => thumbInputRef.current.click()}
                      style={{ borderStyle: 'dashed', transition: 'all 0.3s' }}
                    >
                      {thumbPreview ? (
                        <div className="position-relative">
                           <img src={thumbPreview} alt="Preview" className="img-fluid rounded-3" style={{ maxHeight: 180 }} />
                           <div className="mt-2 text-primary small fw-bold">Thay đổi ảnh</div>
                        </div>
                      ) : (
                        <div className="py-4">
                           <Upload size={32} className="text-muted mb-2" />
                           <div className="text-muted small">Nhấp để chọn ảnh</div>
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={thumbInputRef} 
                      className="d-none" 
                      accept="image/*"
                      onChange={handleThumbChange}
                    />
                  </div>

                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Form.Label className="mt-form-label fw-bold mb-0 d-flex align-items-center gap-2">
                         <ImageIcon size={18} /> Album ảnh chi tiết
                      </Form.Label>
                      <Button variant="outline-success" size="sm" className="rounded-3 px-3 fw-bold" onClick={() => detailInputRef.current.click()}>
                        + Thêm ảnh
                      </Button>
                    </div>
                    
                    <div className="mt-images-grid p-3 border rounded-4 bg-light" style={{ minHeight: 200 }}>
                      <div className="row g-2">
                        {/* Existing Images */}
                        {formData.images.map((url, idx) => (
                          <Col xs={4} key={`exist-${idx}`} className="position-relative">
                             <div className="ratio ratio-1x1 border rounded-3 overflow-hidden bg-white">
                                <img src={url} alt="" style={{ objectFit: 'cover' }} />
                             </div>
                             <button 
                               type="button" 
                               className="btn btn-danger btn-sm rounded-circle position-absolute top-0 end-0 p-0 d-flex align-items-center justify-content-center shadow"
                               style={{ width: 20, height: 20, marginTop: -5, marginRight: -5 }}
                               onClick={() => removeExistingImage(url)}
                             >
                                <X size={12} />
                             </button>
                          </Col>
                        ))}
                        
                        {/* Selected New Images */}
                        {detailFiles.map((file, idx) => (
                           <Col xs={4} key={`new-${idx}`} className="position-relative">
                              <div className="ratio ratio-1x1 border border-success rounded-3 overflow-hidden bg-white shadow-sm">
                                 <img src={URL.createObjectURL(file)} alt="" style={{ objectFit: 'cover' }} />
                                 <div className="position-absolute bottom-0 start-0 w-100 bg-success text-white text-center x-small py-1" style={{ fontSize: '0.6rem', opacity: 0.8 }}>MỚI</div>
                              </div>
                              <button 
                                type="button" 
                                className="btn btn-danger btn-sm rounded-circle position-absolute top-0 end-0 p-0 d-flex align-items-center justify-content-center shadow"
                                style={{ width: 20, height: 20, marginTop: -5, marginRight: -5 }}
                                onClick={() => removeDetailFile(idx)}
                              >
                                 <X size={12} />
                              </button>
                           </Col>
                        ))}

                        {formData.images.length === 0 && detailFiles.length === 0 && (
                          <div className="col-12 text-center py-5 text-muted small">
                             <ImageIcon size={32} className="opacity-25 mb-2" />
                             <div>Chưa có ảnh chi tiết nào</div>
                          </div>
                        )}
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={detailInputRef} 
                      className="d-none" 
                      multiple 
                      accept="image/*"
                      onChange={handleDetailFilesChange}
                    />
                    <div className="text-muted extra-small mt-2" style={{ fontSize: '0.7rem' }}>
                      * Hãy chọn những ảnh rõ nét để khách hàng dễ dàng quan sát tình trạng đồ chơi.
                    </div>
                  </div>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2 mt-5 pt-3 border-top">
                <Button variant="light" className="px-4 fw-bold text-muted border-0 shadow-none" onClick={() => setShowModal(false)} disabled={submitting}>Hủy bỏ</Button>
                <Button variant="success" className="px-5 fw-bold shadow-none rounded-3" type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Đang lưu data...
                    </>
                  ) : (
                    editingToy ? 'Cập nhật ngay' : 'Thêm vào kho'
                  )}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </AdminLayout>
  );
}
