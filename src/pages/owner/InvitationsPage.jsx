import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, Button, Badge, Spinner, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { registrationService } from '../../services/registrationService';
import { invitationService } from '../../services/invitationService';
import { userService } from '../../services/userService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { RACE_REGISTRATION_STATUS, RACE_INVITATION_STATUS, canOwnerInviteJockey } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Toaster from '../../components/common/Toaster';
import './owner-theme.css';

const BLOCKED_INV_STATUSES = [RACE_INVITATION_STATUS.SENT, RACE_INVITATION_STATUS.ACCEPTED];

const JOCKEY_BADGE_CFG = {
  [RACE_INVITATION_STATUS.SENT]: { label: 'Đang chờ', bg: 'warning' },
  [RACE_INVITATION_STATUS.ACCEPTED]: { label: 'Đã nhận', bg: 'success' },
  [RACE_INVITATION_STATUS.DECLINED]: { label: 'Từ chối', bg: 'danger' },
  [RACE_INVITATION_STATUS.EXPIRED]: { label: 'Hết hạn', bg: 'secondary' },
};

function JockeyStatusBadge({ status }) {
  const cfg = JOCKEY_BADGE_CFG[status];
  if (!cfg) return <Badge bg="info">Khả dụng</Badge>;
  return <Badge bg={cfg.bg}>{cfg.label}</Badge>;
}

export default function OwnerInvitationsPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [jockeys, setJockeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({ defaultValues: { registrationId: '', jockeyId: '', message: '' } });

  const watchedRegId = Number(watch('registrationId'));

  const load = () => {
    Promise.all([
      registrationService.getByOwner(),
      invitationService.getAll(),
      userService.getJockeys(),   // /jockeys endpoint — accessible by OWNER
    ])
      .then(([regs, invs, jockeyList]) => {
        // getByOwner() đã chỉ trả về registrations có invitation (đều được duyệt)
        setRegistrations(regs);
        setInvitations(invs.filter((i) => regs.some((r) => r.id === i.registrationId)));
        setJockeys(jockeyList);
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được dữ liệu lời mời.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  // Tìm lời mời của jockeyId trong registration đang chọn
  const getJockeyInvStatus = (jockeyId) => {
    if (!watchedRegId) return null;
    return invitations.find(
      (i) => i.registrationId === watchedRegId && i.jockeyId === jockeyId
    )?.status ?? null;
  };

  // Jockey được phép chọn trong select: chưa có invitation SENT/ACCEPTED cho reg đang chọn
  const selectableJockeys = jockeys.filter((j) => {
    if (!watchedRegId) return true;
    return !BLOCKED_INV_STATUSES.includes(getJockeyInvStatus(j.id));
  });

  const allInvitedForReg = watchedRegId > 0 && selectableJockeys.length === 0;

  const onSubmit = async (data) => {
<<<<<<< HEAD
    const registration = registrations.find((r) => r.id === Number(data.registrationId));
    const jockey = jockeys.find((j) => j.id === Number(data.jockeyId));
    if (!registration || !jockey) return;
    setIsSending(true);
    try {
      await invitationService.send({
        raceRegistrationId: registration.id,   // backend field name
=======
    const regIdNum = Number(data.registrationId);
    const jockey = jockeys.find((j) => j.id === Number(data.jockeyId));
    
    // Nếu mảng registrations trống (do lỗi API getByOwner), vẫn cho phép gửi bằng ID nhập tay
    if (!regIdNum || !jockey) return;
    setIsSending(true);
    try {
      await invitationService.send({
        raceRegistrationId: regIdNum,
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
        jockeyId: jockey.id,
      });
      setToast({ message: `Đã gửi lời mời đến ${jockey.fullName} thành công.`, variant: 'success' });
      reset();
      // Reload lại danh sách invitations để cập nhật trạng thái mới nhất từ server.
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
    { key: 'deadline', label: 'Deadline', render: (r) => (r.deadline ? formatDate(r.deadline) : '—') },
    { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'respondedAt',
      label: 'Ngày trả lời',
      render: (r) => r.respondedAt ? formatDate(r.respondedAt) : '—',
    },
  ];

  const jockeyColumns = [
    { key: 'fullName', label: 'Tên Jockey' },
    { key: 'email', label: 'Email' },
    {
      key: 'invStatus',
      label: 'Trạng thái (đăng ký đang chọn)',
      render: (j) => <JockeyStatusBadge status={getJockeyInvStatus(j.id)} />,
    },
    {
      key: 'pick',
      label: '',
      render: (j) => {
        const invStatus = getJockeyInvStatus(j.id);
        const blocked = BLOCKED_INV_STATUSES.includes(invStatus);
        return (
          <button
            className="btn-outline-gold-sm"
            disabled={!watchedRegId || blocked}
            onClick={() => setValue('jockeyId', String(j.id))}
          >
            Chọn
          </button>
        );
      },
    },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <div className="page-header mb-4">
        <div>
          <h2>Lời mời Jockey</h2>
          <p style={{ margin: 0, marginTop: 4 }}>Gửi lời mời tham dự đua đến các jockey trong hệ thống</p>
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
                  Đăng ký <span style={{ color: '#e55' }}>*</span>
                </Form.Label>
<<<<<<< HEAD
                <Form.Select
                  {...register('registrationId', { required: 'Vui lòng chọn đăng ký' })}
                  isInvalid={!!errors.registrationId}
                >
                  <option value="">-- Chọn đăng ký --</option>
                  {registrations.filter((r) => canOwnerInviteJockey(r.status)).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.raceName} — {r.horseName}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.registrationId?.message}
                </Form.Control.Feedback>
                {registrations.filter((r) => canOwnerInviteJockey(r.status)).length === 0 && (
                  <Form.Text style={{ color: '#888' }}>
                    Bạn chưa có đăng ký nào được duyệt (APPROVED) để mời Jockey.
                  </Form.Text>
                )}
              </Form.Group>
=======
                {registrations.length > 0 ? (
                  <Form.Select
                    {...register('registrationId', { required: 'Vui lòng chọn đăng ký' })}
                    isInvalid={!!errors.registrationId}
                  >
                    <option value="">-- Chọn đăng ký --</option>
                    {registrations.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.raceName} — {r.horseName}
                      </option>
                    ))}
                  </Form.Select>
                ) : (
                  <>
                    <Form.Control
                      type="number"
                      {...register('registrationId', { required: 'Vui lòng nhập ID Đăng ký' })}
                      placeholder="Nhập Registration ID (VD: 1, 2)"
                      isInvalid={!!errors.registrationId}
                    />
                    <Form.Text style={{ color: '#888', fontSize: '0.8rem' }}>
                      Do Server chưa có API trả về danh sách, vui lòng tự nhập Registration ID (số ID của Đăng ký đã được duyệt).
                    </Form.Text>
                  </>
                )}
                <Form.Control.Feedback type="invalid">
                  {errors.registrationId?.message}
                </Form.Control.Feedback>
              </Form.Group>

>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
              <Form.Group className="mb-3">
                <Form.Label style={{ color: '#D4AF37' }}>
                  Jockey <span style={{ color: '#e55' }}>*</span>
                </Form.Label>
                <Form.Select
                  {...register('jockeyId', { required: 'Vui lòng chọn jockey' })}
                  isInvalid={!!errors.jockeyId}
                  disabled={allInvitedForReg}
                >
                  <option value="">-- Chọn jockey --</option>
                  {selectableJockeys.map((j) => (
                    <option key={j.id} value={j.id}>{j.fullName}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.jockeyId?.message}
                </Form.Control.Feedback>
                {allInvitedForReg && (
                  <Form.Text style={{ color: '#f6a' }}>
                    Tất cả jockey đã được mời cho đăng ký này.
                  </Form.Text>
                )}
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
<<<<<<< HEAD
                disabled={isSending || registrations.length === 0 || allInvitedForReg}
=======
                disabled={isSending || allInvitedForReg}
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
              >
                {isSending ? (
                  <><Spinner size="sm" animation="border" className="me-2" />Đang gửi...</>
                ) : '✉️ Gửi lời mời'}
              </Button>
            </Form>
          </div>
        </Col>

        {/* Danh sách jockey khả dụng */}
        <Col lg={7}>
          <div className="lux-panel h-100">
            <div className="owner-section-label mb-2"><h5>Jockey khả dụng</h5></div>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>
              {watchedRegId
                ? 'Nhấn "Chọn" để điền nhanh vào form. Jockey đang chờ/đã nhận không thể mời lại.'
                : 'Chọn đăng ký ở form bên trái để xem trạng thái lời mời với từng jockey.'}
            </p>
            {jockeys.length === 0 ? (
              <EmptyState message="Không có jockey nào khả dụng trong hệ thống." />
            ) : (
              <DataTable columns={jockeyColumns} rows={jockeys} />
            )}
          </div>
        </Col>
      </Row>

      {/* Lịch sử lời mời đã gửi */}
      <div className="lux-panel">
        <div className="owner-section-label mb-4"><h5>Lời mời đã gửi {invitations.length > 0 && `(${invitations.length})`}</h5></div>
        {invitations.length === 0 ? (
          <EmptyState message="Chưa có lời mời nào được gửi." />
        ) : (
          <DataTable columns={invColumns} rows={invitations} />
        )}
      </div>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
