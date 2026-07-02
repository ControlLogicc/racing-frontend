import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, Button, Spinner, Row, Col, Modal, Badge } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { registrationService } from '../../services/registrationService';
import { invitationService } from '../../services/invitationService';
import { userService } from '../../services/userService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Toaster from '../../components/common/Toaster';
import './owner-theme.css';

export default function OwnerInvitationsPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState(null);

  const [eligibleJockeys, setEligibleJockeys] = useState([]);
  const [loadingJockeys, setLoadingJockeys] = useState(false);
  const [detailJockey, setDetailJockey] = useState(null);
  const [jockeyProfiles, setJockeyProfiles] = useState({}); // jockeyId → full JockeyResponse (height, nationality, licenseNumber, achievements, imageUrl, dateOfBirth)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({ defaultValues: { registrationId: '', jockeyId: '', message: '' } });

  const watchedRegId = watch('registrationId');

  const load = () => {
    setLoading(true);
    Promise.allSettled([
      registrationService.getByOwner(),
      invitationService.getAll(),
      userService.getJockeys(),
    ])
      .then(([regsRes, invsRes, jockeysRes]) => {
        const regs = regsRes.status === 'fulfilled' ? regsRes.value : [];
        const invs = invsRes.status === 'fulfilled' ? invsRes.value : [];
        const jockeys = jockeysRes.status === 'fulfilled' ? jockeysRes.value : [];
        setRegistrations(regs);
        setInvitations(invs.filter((i) => regs.some((r) => r.id === i.registrationId)));
        setJockeyProfiles(Object.fromEntries(jockeys.map((j) => [j.jockeyId, j])));
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được dữ liệu lời mời.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!watchedRegId) { 
      setEligibleJockeys([]); 
      return; 
    }
    setLoadingJockeys(true);
    // Clear jockey selection when registration changes
    setValue('jockeyId', '');
    
    invitationService
      .getEligibleJockeys(Number(watchedRegId))
      .then(setEligibleJockeys)
      .catch(() => setEligibleJockeys([]))
      .finally(() => setLoadingJockeys(false));
  }, [watchedRegId, setValue]);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const onSubmit = async (data) => {
    setIsSending(true);
    try {
      await invitationService.send({
        raceRegistrationId: Number(data.registrationId),
        jockeyId: Number(data.jockeyId),
        message: data.message?.trim() || undefined,
      });
      setToast({ message: `Đã gửi lời mời thành công.`, variant: 'success' });
      reset();
      
      // Reload invitations
      invitationService.getAll().then((invs) =>
        setInvitations(invs.filter((i) => registrations.some((r) => r.id === i.registrationId)))
      );
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Gửi lời mời thất bại.'), variant: 'danger' });
    } finally {
      setIsSending(false);
    }
  };

  const invColumns = [
    { key: 'raceName', label: 'Race' },
    { key: 'horseName', label: 'Ngựa' },
    { key: 'jockeyName', label: 'Jockey' },
    { key: 'sentAt', label: 'Ngày gửi', render: (r) => formatDate(r.sentAt) },
    { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'respondedAt',
      label: 'Ngày trả lời',
      render: (r) => r.respondedAt ? formatDate(r.respondedAt) : '—',
    },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="owner-context">
      <div className="page-header mb-4">
        <div>
          <h2>Lời mời Jockey</h2>
          <p style={{ margin: 0, marginTop: 4 }}>Gửi lời mời tham dự đua đến các jockey đã ứng tuyển</p>
        </div>
      </div>

      <Row className="g-4 mb-4">
        {/* Form gửi lời mời */}
        <Col lg={5}>
          <div className="lux-panel h-100">
            <div className="owner-section-label mb-4"><h5>Gửi lời mời mới</h5></div>
            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: '#D4AF37' }}>
                  Đăng ký (APPROVED) <span style={{ color: '#e55' }}>*</span>
                </Form.Label>
                <Form.Select
                  {...register('registrationId', { required: 'Vui lòng chọn đăng ký' })}
                  isInvalid={!!errors.registrationId}
                >
                  <option value="">-- Chọn đăng ký --</option>
                  {registrations.filter((r) => r.canInviteJockey).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.raceName} — {r.horseName}
                      {r.invitationStatus === 'ACCEPTED' ? ' ✓ Đã có Jockey' : ''}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.registrationId?.message}
                </Form.Control.Feedback>
                {registrations.filter((r) => r.canInviteJockey).length === 0 && (
                  <Form.Text style={{ color: '#888' }}>
                    Bạn chưa có đăng ký nào được duyệt để mời Jockey.
                  </Form.Text>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label style={{ color: '#D4AF37' }}>
                  Jockey <span style={{ color: '#e55' }}>*</span>
                </Form.Label>
              <Form.Select
                {...register('jockeyId', { required: 'Vui lòng chọn jockey từ danh sách' })}
                isInvalid={!!errors.jockeyId}
                disabled={!watchedRegId || loadingJockeys || eligibleJockeys.length === 0}
              >
                <option value="">
                  {!watchedRegId
                    ? '-- Chọn đăng ký trước --'
                    : loadingJockeys
                    ? 'Đang tải...'
                    : eligibleJockeys.length === 0
                    ? '-- Chưa có jockey ứng tuyển --'
                    : '-- Chọn jockey --'}
                </option>
                {eligibleJockeys.map((j) => (
                  <option key={j.jockeyId} value={j.jockeyId}>{j.jockeyName}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.jockeyId?.message}
              </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label style={{ color: '#D4AF37' }}>Lời nhắn</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Nhập lời nhắn cho jockey (tuỳ chọn, tối đa 500 ký tự)..."
                  {...register('message', {
                    maxLength: { value: 500, message: 'Lời nhắn tối đa 500 ký tự' },
                  })}
                  isInvalid={!!errors.message}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.message?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <Button
                type="submit"
                className="btn-gold btn-gold-sm w-100"
                style={{ padding: '10px' }}
                disabled={isSending || !watch('jockeyId')}
              >
                {isSending ? (
                  <><Spinner size="sm" animation="border" className="me-2" />Đang gửi...</>
                ) : 'Gửi lời mời'}
              </Button>
            </Form>
          </div>
        </Col>

        {/* Danh sách jockey đã ứng tuyển */}
        <Col lg={7}>
          <div className="lux-panel h-100">
            <div className="owner-section-label mb-2"><h5>Jockey đã ứng tuyển</h5></div>
            
            {!watchedRegId ? (
              <EmptyState message="Chọn đăng ký để xem jockey đã ứng tuyển race này" />
            ) : loadingJockeys ? (
              <div className="py-5 text-center"><Spinner animation="border" variant="warning" /></div>
            ) : eligibleJockeys.length === 0 ? (
              <EmptyState message="Chưa có jockey nào ứng tuyển race này. Jockey cần apply race trước khi được mời." />
            ) : (
              <div className="eligible-jockeys-list" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                {eligibleJockeys.map(jockey => (
                  <div key={jockey.jockeyId} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(212,175,55,0.15)',
                    borderRadius: 10, padding: '12px 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 8,
                    opacity: jockey.canInvite ? 1 : 0.5,
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#f0e8d0' }}>{jockey.jockeyName}</div>
                      <div style={{ fontSize: 12, color: '#8a7a60', marginTop: 2 }}>
                        ⚖️ {jockey.weight} kg  ·  {jockey.experienceYears} năm kinh nghiệm
                      </div>
                      {!jockey.canInvite && (
                        <div style={{ fontSize: 11, color: '#e57373', marginTop: 3 }}>
                          ⚠️ {jockey.reason || 'Không đủ điều kiện'}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setDetailJockey({ ...jockey, ...jockeyProfiles[jockey.jockeyId] })}
                        style={{
                          padding: '5px 14px', fontSize: 12, borderRadius: 6,
                          background: 'transparent', border: '1px solid rgba(212,175,55,0.4)',
                          color: '#D4AF37', cursor: 'pointer', fontWeight: 600,
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.target.style.background = 'rgba(212,175,55,0.1)'; }}
                        onMouseLeave={e => { e.target.style.background = 'transparent'; }}
                      >
                        Chi tiết
                      </button>
                      <button
                        type="button"
                        className="btn-gold btn-gold-sm"
                        disabled={!jockey.canInvite}
                        onClick={() => setValue('jockeyId', String(jockey.jockeyId))}
                        style={{ padding: '5px 14px', fontSize: 12 }}
                      >
                        {watch('jockeyId') === String(jockey.jockeyId) ? 'Đã chọn' : 'Chọn'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* Lịch sử lời mời đã gửi */}
      <div className="lux-panel">
        <div className="owner-section-label mb-4"><h5>Lời mời đã gửi</h5></div>
        {invitations.length === 0 ? (
          <EmptyState message="Chưa có lời mời nào được gửi." />
        ) : (
          <DataTable columns={invColumns} rows={invitations} />
        )}
      </div>

      {/* Modal chi tiết Jockey */}
      <Modal show={!!detailJockey} onHide={() => setDetailJockey(null)} centered>
        <Modal.Header closeButton style={{ background: '#141418', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
          <Modal.Title style={{ color: '#D4AF37', fontSize: '1.1rem', fontWeight: 700 }}>
            🏇 Chi tiết Jockey
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#141418', color: '#e0e0e0' }}>
          {detailJockey && (
            <div>
              {/* Tên jockey */}
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))',
                  border: '2px solid rgba(212,175,55,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px', fontSize: 28, overflow: 'hidden',
                }}>
                  {detailJockey.imageUrl ? (
                    <img
                      src={detailJockey.imageUrl}
                      alt={detailJockey.jockeyName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = ''; }}
                    />
                  ) : null}
                  <span style={{ display: detailJockey.imageUrl ? 'none' : '' }}>🏇</span>
                </div>
                <h4 style={{ color: '#f0e8d0', fontWeight: 700, margin: 0 }}>{detailJockey.jockeyName}</h4>
                <div style={{ marginTop: 6 }}>
                  {detailJockey.canInvite ? (
                    <Badge bg="success" style={{ fontSize: 11 }}>✓ Đủ điều kiện mời</Badge>
                  ) : (
                    <Badge bg="danger" style={{ fontSize: 11 }}>✗ Không đủ điều kiện</Badge>
                  )}
                </div>
              </div>

              {/* Thông tin chi tiết */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(212,175,55,0.15)',
                borderRadius: 12, padding: '16px 20px'
              }}>
                {[
                  { label: 'Cân nặng', value: detailJockey.weight ? `${detailJockey.weight} kg` : '—', icon: '⚖️' },
                  { label: 'Kinh nghiệm', value: detailJockey.experienceYears ? `${detailJockey.experienceYears} năm` : '—', icon: '📅' },
                  { label: 'Chiều cao', value: detailJockey.height ? `${detailJockey.height} cm` : '—', icon: '📏' },
                  { label: 'Quốc tịch', value: detailJockey.nationality || '—', icon: '🌍' },
                  { label: 'Số giấy phép', value: detailJockey.licenseNumber || '—', icon: '🪪' },
                  { label: 'Ngày sinh', value: detailJockey.dateOfBirth || '—', icon: '🎂' },
                  ...(detailJockey.achievements ? [{ label: 'Thành tích', value: detailJockey.achievements, icon: '🏆' }] : []),
                  { label: 'Mã Jockey', value: detailJockey.jockeyId ? `#${detailJockey.jockeyId}` : '—', icon: '🔢' },
                ].map(({ label, value, icon }) => (
                  <div key={label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <span style={{ color: '#94a3b8', fontSize: 14 }}>{icon} {label}</span>
                    <span style={{ color: '#f0e8d0', fontWeight: 600, fontSize: 14 }}>{value}</span>
                  </div>
                ))}
                {/* Lý do không đủ điều kiện */}
                {!detailJockey.canInvite && detailJockey.reason && (
                  <div style={{
                    marginTop: 12, padding: '10px 14px',
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: 8, color: '#ef4444', fontSize: 13
                  }}>
                    ⚠️ {detailJockey.reason}
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ background: '#141418', borderTop: '1px solid rgba(212,175,55,0.2)' }}>
          <Button
            variant="link"
            style={{ color: '#94a3b8', textDecoration: 'none' }}
            onClick={() => setDetailJockey(null)}
          >
            Đóng
          </Button>
          {detailJockey?.canInvite && (
            <button
              type="button"
              className="btn-gold btn-gold-sm"
              onClick={() => {
                setValue('jockeyId', String(detailJockey.jockeyId));
                setDetailJockey(null);
              }}
              style={{ padding: '8px 20px', fontSize: 13 }}
            >
              Chọn Jockey này
            </button>
          )}
        </Modal.Footer>
      </Modal>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
