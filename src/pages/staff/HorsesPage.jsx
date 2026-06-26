import { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { horseService } from '../../services/horseService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Toaster from '../../components/common/Toaster';
import './staff-theme.css';

export default function StaffHorsesPage() {
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [selectedHorse, setSelectedHorse] = useState(null);

  // Vì frontend dùng getPublicAll tạm để load danh sách ngựa nếu ko có backend
  const load = () => {
    setLoading(true);
    // Thực tế sẽ gọi api.get('/staff/horses/pending')
    const fetchPromise = horseService.adminGetAll ? horseService.adminGetAll() : horseService.getAll();
    fetchPromise
      .then((data) => {
        // Chỉ hiện những con cần duyệt (giả sử có trường status pending hoặc ratingVerified = false)
        const pending = data.filter(h => h.status === 'pending' || h.status === 'PENDING' || !h.ratingVerified);
        setHorses(pending.length ? pending : data); // Nếu k có pending thì show hết để test UI
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách ngựa.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line
    load();
  }, []);

  const handleApprove = (horseId) => {
    if (window.confirm('Xác nhận duyệt ngựa này hợp lệ?')) {
      if (horseService.verifyRating) {
        horseService.verifyRating(horseId, 'APPROVE')
          .then(() => {
            setToast({ message: 'Đã duyệt ngựa thành công', variant: 'success' });
            load();
          })
          .catch(err => setToast({ message: 'Lỗi: ' + getApiErrorMessage(err), variant: 'danger' }));
      } else {
        setToast({ message: 'Chức năng chưa mock', variant: 'warning' });
      }
    }
  };

  const columns = [
    { key: 'name', label: 'Tên ngựa' },
    { key: 'ownerName', label: 'Chủ ngựa' },
    { key: 'age', label: 'Tuổi' },
    { key: 'registrationType', label: 'Loại đăng ký', render: (h) => h.registrationType === 'NEW' ? 'Ngựa mới' : 'Tái đăng ký' },
    { key: 'rating', label: 'Rating (Claimed)' },
    { key: 'status', label: 'Trạng thái', render: (h) => <StatusBadge status={h.status} /> },
    {
      key: 'actions', label: 'Hành động', render: (h) => (
        <div className="d-flex gap-2">
          <Button variant="outline-light" size="sm" onClick={() => setSelectedHorse(h)}>
            Chi tiết
          </Button>
          <Button className="staff-btn-gold" size="sm" onClick={() => handleApprove(h.id)}>
            Duyệt
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="staff-theme-wrapper p-3">
      <div className="page-header mb-4">
        <div>
          <h2 className="staff-header-title">Duyệt thông tin ngựa</h2>
          <p className="staff-subtitle mb-0">Xác thực hồ sơ và cập nhật trạng thái hoạt động cho ngựa.</p>
        </div>
      </div>

      {loading && <Loading />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && horses.length === 0 && <EmptyState message="Không có ngựa nào cần duyệt." />}
      
      {!loading && !error && horses.length > 0 && (
        <div className="staff-card p-3">
          <DataTable columns={columns} rows={horses} rowClassName={() => 'align-middle'} />
        </div>
      )}

      <Modal show={!!selectedHorse} onHide={() => setSelectedHorse(null)} size="lg" centered>
        <Modal.Header closeButton className="bg-dark text-white border-bottom-0">
          <Modal.Title style={{ color: '#D4AF37' }}>Chi tiết ngựa: {selectedHorse?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white pt-0">
          {selectedHorse && (
            <div className="row g-3">
              <div className="col-md-6">
                <p><strong>Chủ ngựa:</strong> {selectedHorse.ownerName || `ID: ${selectedHorse.ownerId}`}</p>
                <p><strong>Tuổi:</strong> {selectedHorse.age}</p>
                <p><strong>Giới tính:</strong> {selectedHorse.gender === 'M' ? 'Đực (Male)' : 'Cái (Female)'}</p>
                <p><strong>Giống / Màu:</strong> {selectedHorse.breed}</p>
              </div>
              <div className="col-md-6">
                <p><strong>Loại đăng ký:</strong> {selectedHorse.registrationType === 'NEW' ? 'Ngựa mới' : 'Tái đăng ký'}</p>
                <p><strong>Rating khai báo:</strong> <span className="badge bg-warning text-dark">{selectedHorse.rating}</span></p>
                <p><strong>Trạng thái hiện tại:</strong> <StatusBadge status={selectedHorse.status} /></p>
              </div>
              <div className="col-12 mt-3">
                <h6 style={{ color: '#D4AF37' }}>Ghi chú sức khoẻ & Bằng chứng:</h6>
                <div className="p-3 rounded" style={{ backgroundColor: '#2a2a35', whiteSpace: 'pre-wrap', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {selectedHorse.healthNote || 'Không có ghi chú.'}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-dark border-top-0">
          <Button variant="secondary" onClick={() => setSelectedHorse(null)}>Đóng</Button>
          <Button className="staff-btn-gold" onClick={() => { handleApprove(selectedHorse.id); setSelectedHorse(null); }}>
            Duyệt hợp lệ
          </Button>
        </Modal.Footer>
      </Modal>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
