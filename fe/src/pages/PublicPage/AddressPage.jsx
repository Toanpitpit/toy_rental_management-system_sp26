import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { Plus, MapPin, Trash2, Edit, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAddress from "../../hooks/useAddress";
import { AddressModals } from "../../components/Address/AddressModals";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import "../../styles/pages/AddressPage.css";

export default function AddressPage() {
  const navigate = useNavigate();
  const {
    addresses,
    loading,
    fetchAddresses,
    handleSetDefault,
    handleDelete,
    setShowModal,
    setEditMode,
    setSelectedAddress,
    showModal,
    showDeleteModal,
    setShowDeleteModal,
    editMode,
    selectedAddress,
    initialFormData,
    formData,
    setFormData,
    provinces,
    districts,
    wards,
    isSubmitting,
    handleSubmit
  } = useAddress();

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header navigate={navigate} />

      <main className="addr-section flex-grow-1">
        {/* Background Orbs */}
        <div className="addr-blur-orb orb-1"></div>
        <div className="addr-blur-orb orb-2"></div>
        <div className="addr-blur-orb orb-3"></div>
        
        <Container className="addr-container">
          <div className="addr-main-wrapper">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-2 gap-3">
              <div>
                <h1 className="addr-page-title">Quản lý địa chỉ</h1>
                <p className="addr-page-subtitle">Thêm và quản lý các địa chỉ nhận hàng của bạn.</p>
              </div>
              <Button
                className="addr-btn-add d-flex align-items-center gap-2"
                onClick={() => {
                  setEditMode(false);
                  setSelectedAddress(null);
                  setFormData(initialFormData);
                  setShowModal(true);
                }}
              >
                <Plus size={20} /> Thêm địa chỉ mới
              </Button>
            </div>

            <div className="addr-list-container">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="success" />
                  <p className="text-muted mt-3">Đang tải danh sách địa chỉ...</p>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-5">
                  <MapPin size={60} color="#3cb14a" strokeWidth={1} className="mb-4 opacity-50" />
                  <h4 className="fw-bold">Chưa có địa chỉ nào</h4>
                  <p className="text-muted mb-4">Hãy thêm địa chỉ đầu tiên để bắt đầu đặt hàng nhé!</p>
                  <Button
                    className="addr-btn-add"
                    onClick={() => {
                      setEditMode(false);
                      setFormData(initialFormData);
                      setShowModal(true);
                    }}
                  >
                    Thêm ngay
                  </Button>
                </div>
              ) : (
                addresses.map((addr) => (
                  <Card 
                    key={addr._id} 
                    className={`addr-card ${addr.isDefault ? 'addr-default' : ''}`}
                  >
                    <Card.Body className="p-4 p-md-4">
                      <Row className="align-items-start g-4">
                        <Col xs={12} md={true}>
                          <div className="addr-receiver-info">
                            <span className="addr-receiver-name">{addr.receiverName}</span>
                            <span className="addr-receiver-phone">{addr.receiverPhone}</span>
                            {addr.isDefault && (
                              <span className="addr-badge-default ms-2">Mặc định</span>
                            )}
                          </div>
                          <div className="addr-location-text">
                            <div className="fw-bold mb-1" style={{ color: "#374151" }}>
                              {addr.province}, {addr.district}, {addr.ward}
                            </div>
                            <div>{addr.detail}</div>
                          </div>
                        </Col>
                        <Col xs={12} md="auto">
                          <div className="addr-actions">
                            {!addr.isDefault && (
                              <Button 
                                variant="link" 
                                className="addr-btn-icon addr-btn-default" 
                                onClick={() => handleSetDefault(addr._id)}
                                title="Đặt làm mặc định"
                              >
                                <CheckCircle size={20} />
                              </Button>
                            )}
                            <Button 
                              variant="link" 
                              className="addr-btn-icon" 
                              onClick={() => {
                                setSelectedAddress(addr);
                                setFormData({
                                  receiverName: addr.receiverName,
                                  receiverPhone: addr.receiverPhone,
                                  province: addr.province,
                                  district: addr.district,
                                  ward: addr.ward,
                                  detail: addr.detail,
                                  isDefault: addr.isDefault
                                });
                                setEditMode(true);
                                setShowModal(true);
                              }}
                              title="Chỉnh sửa"
                            >
                              <Edit size={20} />
                            </Button>
                            <Button 
                              variant="link" 
                              className="addr-btn-icon addr-btn-delete" 
                              onClick={() => {
                                setSelectedAddress(addr);
                                setShowDeleteModal(true);
                              }}
                              title="Xóa"
                            >
                              <Trash2 size={20} />
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))
              )}
            </div>
          </div>
        </Container>

        <AddressModals
          showModal={showModal}
          setShowModal={setShowModal}
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          editMode={editMode}
          selectedAddress={selectedAddress}
          formData={formData}
          setFormData={setFormData}
          provinces={provinces}
          districts={districts}
          wards={wards}
          isSubmitting={isSubmitting}
          handleSubmit={handleSubmit}
          handleDelete={handleDelete}
        />
      </main>

      <Footer />
    </div>
  );
}
