import { Toast, ToastContainer } from 'react-bootstrap';

// Toast thông báo thành công/lỗi cho hành động create/update/delete.
// Dùng: const [toast, setToast] = useState(null); setToast({ message, variant });
export default function Toaster({ toast, onClose }) {
  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1100 }}>
      <Toast show={!!toast} onClose={onClose} delay={3000} autohide bg={toast?.variant || 'success'}>
        <Toast.Body className={toast?.variant === 'danger' || !toast?.variant ? '' : 'text-dark'}>
          {toast?.message}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
}
