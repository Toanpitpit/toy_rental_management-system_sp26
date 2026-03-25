import { Modal, Form, Button, Row, Col, Spinner } from "react-bootstrap";
import { MapPin, Trash2, X } from "lucide-react";
import "../../styles/pages/AddressPage.css";

export function AddressModals({
    showModal,
    setShowModal,
    showDeleteModal,
    setShowDeleteModal,
    editMode,
    selectedAddress,
    formData,
    setFormData,
    provinces,
    districts,
    wards,
    isSubmitting,
    handleSubmit,
    handleDelete
}) {
    return (
        <>
            <AddressModal
                show={showModal}
                onHide={() => setShowModal(false)}
                editMode={editMode}
                formData={formData}
                setFormData={setFormData}
                provinces={provinces}
                districts={districts}
                wards={wards}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
            />

            <DeleteConfirmModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                selectedAddress={selectedAddress}
                isDeleting={isSubmitting}
                onConfirm={handleDelete}
            />
        </>
    );
}

function AddressModal({ show, onHide, editMode, formData, setFormData, provinces, districts, wards, isSubmitting, onSubmit }) {
    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="lg"
            className="addr-modal"
        >
            <div className="addr-modal-content">
                <Modal.Header className="border-0 pb-0">
                    <Modal.Title className="addr-modal-title fs-4">
                        {editMode ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
                    </Modal.Title>
                    <Button variant="link" className="p-0 text-muted" onClick={onHide}>
                        <X size={28} />
                    </Button>
                </Modal.Header>

                <Modal.Body className="p-4 pt-4">
                    <Form onSubmit={onSubmit}>
                        <Row className="g-4">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="addr-form-label">Tên người nhận</Form.Label>
                                    <Form.Control
                                        type="text"
                                        className="addr-input"
                                        placeholder="Ví dụ: Hoàng Anh Tú"
                                        required
                                        value={formData.receiverName}
                                        onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="addr-form-label">Số điện thoại</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        className="addr-input"
                                        placeholder="Ví dụ: 0912345678"
                                        required
                                        value={formData.receiverPhone}
                                        onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="addr-form-label">Tỉnh / Thành phố</Form.Label>
                                    <Form.Select
                                        className="addr-input"
                                        required
                                        value={formData.province}
                                        onChange={(e) => setFormData({ ...formData, province: e.target.value, district: '', ward: '' })}
                                    >
                                        <option value="">Chọn Tỉnh / Thành phố</option>
                                        {provinces.map(p => <option key={p.code} value={p.name}>{p.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="addr-form-label">Quận / Huyện</Form.Label>
                                    <Form.Select
                                        className="addr-input"
                                        required
                                        value={formData.district}
                                        onChange={(e) => setFormData({ ...formData, district: e.target.value, ward: '' })}
                                        disabled={!formData.province}
                                    >
                                        <option value="">Chọn Quận / Huyện</option>
                                        {districts.map(d => <option key={d.code} value={d.name}>{d.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="addr-form-label">Phường / Xã</Form.Label>
                                    <Form.Select
                                        className="addr-input"
                                        required
                                        value={formData.ward}
                                        onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                                        disabled={!formData.district}
                                    >
                                        <option value="">Chọn Phường / Xã</option>
                                        {wards.map(w => <option key={w.code} value={w.name}>{w.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="addr-form-label">Địa chỉ chi tiết (Số nhà, tên đường...)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        className="addr-input"
                                        placeholder="Nhập địa chỉ cụ thể của bạn"
                                        required
                                        value={formData.detail}
                                        onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Check
                                    type="checkbox"
                                    id="setDefault"
                                    label={<span className="addr-form-label m-0">Đặt làm địa chỉ nhận hàng mặc định</span>}
                                    checked={formData.isDefault}
                                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                    className="mb-0 custom-checkbox"
                                    disabled={formData.isDefault && editMode}
                                />
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-center gap-3 mt-5">
                            <Button
                                variant="light"
                                className="px-5 rounded-pill fw-bold"
                                onClick={onHide}
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                className="addr-btn-add px-5"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <div className="d-flex align-items-center gap-2">
                                        <Spinner size="sm" animation="border" /> <span>Đang lưu...</span>
                                    </div>
                                ) : (editMode ? 'Cập nhật địa chỉ' : 'Lưu địa chỉ')}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </div>
        </Modal>
    );
}

function DeleteConfirmModal({ show, onHide, selectedAddress, isDeleting, onConfirm }) {
    return (
        <Modal show={show} onHide={onHide} centered className="addr-delete-modal">
            <div className="addr-modal-content p-4 text-center">
                <div
                    className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                    style={{ width: 80, height: 80, background: "#fef2f2", color: "#ef4444" }}
                >
                    <Trash2 size={40} />
                </div>
                <h4 className="fw-bold text-dark mb-2">Xóa địa chỉ này?</h4>
                <p className="text-muted mb-4 px-3">
                    Bạn có chắc chắn muốn xóa địa chỉ này khỏi danh sách? Hành động này không thể hoàn tác.
                    <br />
                    <strong className="text-dark d-block mt-2">
                        {selectedAddress?.detail}, {selectedAddress?.ward}
                    </strong>
                </p>
                <div className="d-flex gap-3">
                    <Button
                        variant="light"
                        className="w-100 rounded-pill fw-bold"
                        onClick={onHide}
                        disabled={isDeleting}
                    >
                        Quay lại
                    </Button>
                    <Button
                        variant="danger"
                        className="w-100 rounded-pill fw-bold border-0"
                        style={{ background: "#ef4444" }}
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? <Spinner size="sm" animation="border" /> : 'Xác nhận xóa'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
