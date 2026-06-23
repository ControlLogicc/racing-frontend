import { useEffect, useState } from 'react';
import { Badge, Button, Modal, Form, Table } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { resultService } from '../../services/resultService';
import { raceService } from '../../services/raceService';
import { entryService } from '../../services/entryService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { RACE_STATUS, STATUS_LABEL, STATUS_BADGE_VARIANT } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';

const GOLD = '#D4AF37';
const CARD_STYLE = { backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#f5f5f5' };
const HEADER_STYLE = { backgroundColor: 'transparent', borderBottom: `1px solid ${GOLD}` };

export default function StaffResultsPage() {
  const [racesWithResults, setRacesWithResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // Modal Input Results State
  const [showInputModal, setShowInputModal] = useState(false);
  const [selectedRace, setSelectedRace] = useState(null);
  const [entries, setEntries] = useState([]);
  const [inputLoading, setInputLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch assigned races for staff
      const races = await raceService.getAssignedToStaff();
      const relevantRaces = races.filter(r => 
        ['RESULT_PENDING', 'OFFICIAL', 'COMPLETED', 'RUNNING'].includes(r.status)
      );

      // 2. Fetch results for these races
      const groups = await Promise.all(
        relevantRaces.map(async (race) => {
          let rows = [];
          try {
            rows = await resultService.getByRace(race.id);
          } catch {
            // Ignore if no results yet
          }
          return { race, rows };
        })
      );
      setRacesWithResults(groups);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không tải được dữ liệu giải đua.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handlePublish = async (raceId) => {
    try {
      await raceService.setStatus(raceId, RACE_STATUS.OFFICIAL);
      setToast({ message: 'Kết quả đã được công bố chính thức!', variant: 'success' });
      load();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Công bố thất bại.'), variant: 'danger' });
    }
  };

  const handleRecalculate = async (raceId) => {
    try {
      await resultService.recalculate(raceId);
      setToast({ message: 'Đã tính lại điểm/giải thưởng.', variant: 'success' });
      load();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Tính lại thất bại.'), variant: 'danger' });
    }
  };

  const openInputModal = async (race) => {
    setSelectedRace(race);
    setShowInputModal(true);
    setInputLoading(true);
    try {
      const allEntries = await entryService.getByRace(race.id);
      // Only keep ready or declared entries (scratched entries shouldn't have results)
      const validEntries = allEntries.filter(e => e.entryStatus !== 'scratched');
      setEntries(validEntries);
      reset(); // Reset form
    } catch (err) {
      setToast({ message: 'Lỗi tải danh sách ngựa.', variant: 'danger' });
      setShowInputModal(false);
    } finally {
      setInputLoading(false);
    }
  };

  const closeInputModal = () => {
    setShowInputModal(false);
    setSelectedRace(null);
    setEntries([]);
  };

  const onInputSubmit = async (formData) => {
    // formData.results is an object: { [entryId]: { position, finishTime } }
    try {
      const payload = entries.map(e => {
        let time = formData.results[e.entryId].finishTime;
        if (time) {
          // Normalize separators (e.g. 00.15.30 -> 00:15:30)
          time = time.replace(/[.,]/g, ':');
          const parts = time.split(':');
          // Pad to HH:mm:ss
          if (parts.length === 2) {
            time = `00:${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
          } else if (parts.length === 3) {
            time = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${parts[2].padStart(2, '0')}`;
          }
        }

        return {
          entryId: e.entryId,
          position: Number(formData.results[e.entryId].position),
          finishTime: time || undefined
        };
      });
      
      await resultService.submitRaceResults(payload);
      setToast({ message: 'Đã lưu kết quả thành công!', variant: 'success' });
      closeInputModal();
      load();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Lưu kết quả thất bại.'), variant: 'danger' });
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <div className="page-header">
        <h2 style={{ color: GOLD }}>Kết quả & Công bố</h2>
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
          Nhập kết quả đua, tính lại giải thưởng, rồi công bố chính thức.
        </p>
      </div>

      {racesWithResults.length === 0 ? (
        <EmptyState message="Không có giải đua nào cần xử lý kết quả." />
      ) : (
        racesWithResults.map(({ race, rows }) => {
          const hasResults = rows.length > 0;
          const resultStatus = hasResults ? rows[0].resultStatus : null;
          const isPublished = race.status === 'OFFICIAL';

          return (
            <div key={race.id} className="card shadow-sm mb-4" style={CARD_STYLE}>
              <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2" style={HEADER_STYLE}>
                <div className="d-flex align-items-center gap-3">
                  <h5 className="mb-0" style={{ color: GOLD }}>{race.raceName || race.name}</h5>
                  <Badge bg={STATUS_BADGE_VARIANT[race.status] || 'secondary'}>
                    {STATUS_LABEL[race.status] || race.status}
                  </Badge>
                </div>
                <div className="d-flex gap-2">
                  {!hasResults ? (
                    <Button size="sm" variant="primary" onClick={() => openInputModal(race)}>
                      + Nhập kết quả
                    </Button>
                  ) : (
                    <>
                      <Button size="sm" variant="outline-warning" onClick={() => handleRecalculate(race.id)}>
                        Tính lại giải thưởng
                      </Button>
                      {!isPublished && (
                        <Button size="sm" variant="success" onClick={() => handlePublish(race.id)}>
                          Công bố chính thức
                        </Button>
                      )}
                      {isPublished && (
                        <span style={{ color: '#198754', fontSize: '0.875rem', fontWeight: 600 }}>
                          ✓ Đã công bố
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {!hasResults ? (
                <div className="card-body text-center text-muted">
                  Chưa có kết quả. Hãy bấm "Nhập kết quả" để ghi nhận.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th style={{ color: GOLD, borderColor: '#333' }}>Hạng</th>
                        <th style={{ color: GOLD, borderColor: '#333' }}>Ngựa</th>
                        <th style={{ color: GOLD, borderColor: '#333' }}>Jockey</th>
                        <th style={{ color: GOLD, borderColor: '#333' }}>Thời gian</th>
                        <th style={{ color: GOLD, borderColor: '#333' }}>Giải thưởng</th>
                        <th style={{ color: GOLD, borderColor: '#333' }}>Trạng thái kết quả</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows
                        .slice()
                        .sort((a, b) => a.position - b.position)
                        .map((row) => (
                          <tr key={row.id}>
                            <td style={{ borderColor: '#2a2a2a' }}>
                              <span className="fw-bold" style={{ color: GOLD }}>#{row.position}</span>
                            </td>
                            <td style={{ borderColor: '#2a2a2a' }}>{row.horseName}</td>
                            <td style={{ borderColor: '#2a2a2a', color: '#a0a0a0' }}>{row.jockeyName}</td>
                            <td style={{ borderColor: '#2a2a2a' }}>{row.finishTime}</td>
                            <td style={{ borderColor: '#2a2a2a', color: '#4caf50' }}>
                              {row.prizeAmount != null ? row.prizeAmount.toLocaleString('vi-VN') + 'đ' : '—'}
                            </td>
                            <td style={{ borderColor: '#2a2a2a' }}>
                               {row.resultStatus}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Input Modal */}
      <Modal show={showInputModal} onHide={closeInputModal} size="lg" centered>
        <Modal.Header closeButton style={{ background: '#1a1a2e', borderColor: '#333' }}>
          <Modal.Title style={{ color: '#D4AF37' }}>
            Nhập Kết Quả - {selectedRace?.raceName || selectedRace?.name}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(onInputSubmit)}>
          <Modal.Body style={{ background: '#1a1a2e', color: '#e0d6b0' }}>
            {inputLoading ? (
              <Loading />
            ) : entries.length === 0 ? (
              <EmptyState message="Không có ngựa nào tham gia giải này." />
            ) : (
              <Table variant="dark" bordered hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th style={{ color: GOLD }}>Cổng</th>
                    <th style={{ color: GOLD }}>Ngựa</th>
                    <th style={{ color: GOLD }}>Jockey</th>
                    <th style={{ color: GOLD }}>Hạng (1, 2, 3...) *</th>
                    <th style={{ color: GOLD }}>Thời gian (HH:mm:ss)</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.entryId}>
                      <td className="align-middle text-center">{entry.gateNumber || '—'}</td>
                      <td className="align-middle fw-bold">{entry.horseName}</td>
                      <td className="align-middle">{entry.jockeyName}</td>
                      <td className="align-middle" style={{ width: '150px' }}>
                        <Form.Control
                          type="number"
                          min="1"
                          size="sm"
                          {...register(`results.${entry.entryId}.position`, { required: 'Nhập hạng' })}
                          isInvalid={!!errors.results?.[entry.entryId]?.position}
                        />
                      </td>
                      <td className="align-middle" style={{ width: '200px' }}>
                        <Form.Control
                          type="text"
                          size="sm"
                          placeholder="e.g. 00:01:35"
                          {...register(`results.${entry.entryId}.finishTime`)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Modal.Body>
          <Modal.Footer style={{ background: '#1a1a2e', borderColor: '#333' }}>
            <Button variant="secondary" onClick={closeInputModal}>Huỷ</Button>
            <Button type="submit" variant="primary" disabled={inputLoading || entries.length === 0}>
              Lưu kết quả
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
