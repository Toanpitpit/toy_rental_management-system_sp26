import { Modal, Button } from 'react-bootstrap';
import { AlertTriangle, Info, HelpCircle, CheckCircle } from 'lucide-react';

const ConfirmModal = ({ 
  show, 
  onHide, 
  onConfirm, 
  title, 
  message, 
  type = 'warning', // warning, danger, success, info
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  loading = false
}) => {
  const getIcon = () => {
    switch(type) {
      case 'danger': return <AlertTriangle size={48} className="text-danger mb-3" />;
      case 'success': return <CheckCircle size={48} className="text-success mb-3" />;
      case 'info': return <Info size={48} className="text-info mb-3" />;
      default: return <HelpCircle size={48} className="text-warning mb-3" />;
    }
  };

  const getBtnVariant = () => {
    if (type === 'danger') return 'danger';
    if (type === 'success') return 'success';
    if (type === 'info') return 'info';
    return 'warning';
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" className="confirm-modal">
      <Modal.Body className="text-center p-4">
        {getIcon()}
        <h4 className="fw-bold mb-2">{title}</h4>
        <p className="text-muted mb-4">{message}</p>
        
        <div className="d-flex gap-3 justify-content-center">
          <Button variant="light" className="px-4 rounded-pill border" onClick={onHide} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={getBtnVariant()} className="px-4 rounded-pill" onClick={onConfirm} disabled={loading}>
            {loading ? 'Đang xử lý...' : confirmText}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ConfirmModal; 
