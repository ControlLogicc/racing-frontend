import { useEffect, useState, useMemo } from 'react';
import { Form, Button, Badge, Modal, Row, Col } from 'react-bootstrap';
import { resultService } from '../../services/resultService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { RACE_RESULT_STATUS, STATUS_LABEL, STATUS_BADGE_VARIANT } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';

const PAGE_SIZE = 10;

function exportCSV(rows) {
  const header = ['Race', 'Ngựa', 'Jockey', 'Vị trí', 'Thời gian', 'Giải thưởng (VNĐ)', 'Trạng thái', 'Ngày tạo'];
  const data = rows.map((r) => [
    r.raceName,
    r.horseName,
    r.jockeyName,
    r.position,
    r.finishTime,
    r.prizeAmount ?? 0,
    STATUS_LABEL[r.resultStatus] ?? r.resultStatus,
    formatDate(r.createdAt),
  ]);
  const csv = [header, ...data].map((row) => row.join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'race-results.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function AdminResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [filterRace, setFilterRace] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [detailRow, setDetailRow] = useState(null);

  const load = () => {
    resultService.getAll()
      .then(setResults)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được kết quả.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const raceOptions = useMemo(() => {
    const seen = new Set();
    return results.filter((r) => {
      if (seen.has(r.raceId)) return false;
      seen.add(r.raceId);
      return true;
    }).map((r) => ({ id: r.raceId, name: r.raceName }));
  }, [results]);

  const filtered = useMemo(() => {
    let rows = [...results];
    if (filterRace) rows = rows.filter((r) => r.raceId === Number(filterRace));
    if (filterStatus) rows = rows.filter((r) => r.resultStatus === filterStatus);
    return rows;
  }, [results, filterRace, filterStatus]);

  const handleFilter = (setter) => (e) => { setter(e.target.value); setPage(1); };

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns = [
    { key: 'raceName', label: 'Race' },
    {
      key: 'position',
      label: 'Vị trí',
      render: (r) => <span>{MEDAL[r.position] ?? `#${r.position}`}</span>,
    },
    { key: 'horseName', label: 'Ngựa' },
    { key: 'jockeyName', label: 'Jockey' },
    { key: 'finishTime', label: 'Thời gian' },
    {
      key: 'prize',
      label: 'Giải thưởng',
      render: (r) => r.prizeAmount != null
        ? <span style={{ color: '#4caf50' }}>{r.prizeAmount.toLocaleString('vi-VN')}đ</span>
        : '—',
    },
    {
      key: 'resultStatus',
      label: 'Trạng thái',
      render: (r) => (
        <Badge bg={STATUS_BADGE_VARIANT[r.resultStatus] ?? 'secondary'}>
          {STATUS_LABEL[r.resultStatus] ?? r.resultStatus}
        </Badge>
      ),
    },
    { key: 'createdAt', label: 'Ngày tạo', render: (r) => formatDate(r.createdAt) },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <button className="btn-outline-gold-sm" onClick={() => setDetailRow(r)}>Chi tiết</button>
      ),
    },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h2>Kết quả đua</h2>
        <Button
          className="btn-gold-sm"
          style={{ padding: '7px 18px' }}
          disabled={filtered.length === 0}
          onClick={() => exportCSV(filtered)}
        >
          Xuất CSV ({filtered.length})
        </Button>
      </div>

      <div className="dash-card mb-4">
        <Row className="g-3 align-items-end">
          <Col md={4}>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>Race</Form.Label>
              <Form.Select value={filterRace} onChange={handleFilter(setFilterRace)}>
                <option value="">Tất cả race</option>
                {raceOptions.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>Trạng thái</Form.Label>
              <Form.Select value={filterStatus} onChange={handleFilter(setFilterStatus)}>
                <option value="">Tất cả trạng thái</option>
                {Object.values(RACE_RESULT_STATUS).map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s] ?? s}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4} className="d-flex align-items-end">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => { setFilterRace(''); setFilterStatus(''); setPage(1); }}
            >
              Xoá filter
            </Button>
          </Col>
        </Row>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="Không có kết quả nào phù hợp." />
      ) : (
        <>
          <DataTable columns={columns} rows={paged} />
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
        </>
      )}

      <Modal show={!!detailRow} onHide={() => setDetailRow(null)} centered>
        <Modal.Header closeButton style={{ background: '#1a1a2e', borderColor: '#D4AF37' }}>
          <Modal.Title style={{ color: '#D4AF37' }}>Chi tiết kết quả</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#1a1a2e', color: '#e0d6b0' }}>
          {detailRow && (
            <div className="d-flex flex-column gap-3">
              <Row>
                <Col sm={6}>
                  <div style={{ color: '#888', fontSize: 12 }}>Race</div>
                  <div style={{ color: '#D4AF37', fontWeight: 600 }}>{detailRow.raceName}</div>
                </Col>
                <Col sm={6}>
                  <div style={{ color: '#888', fontSize: 12 }}>Vị trí</div>
                  <div style={{ fontSize: 22 }}>{MEDAL[detailRow.position] ?? `#${detailRow.position}`}</div>
                </Col>
              </Row>
              <Row>
                <Col sm={6}>
                  <div style={{ color: '#888', fontSize: 12 }}>Ngựa</div>
                  <div>{detailRow.horseName}</div>
                </Col>
                <Col sm={6}>
                  <div style={{ color: '#888', fontSize: 12 }}>Jockey</div>
                  <div>{detailRow.jockeyName}</div>
                </Col>
              </Row>
              <Row>
                <Col sm={6}>
                  <div style={{ color: '#888', fontSize: 12 }}>Thời gian về đích</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 16 }}>{detailRow.finishTime}</div>
                </Col>
                <Col sm={6}>
                  <div style={{ color: '#888', fontSize: 12 }}>Giải thưởng</div>
                  <div style={{ color: '#4caf50', fontWeight: 600 }}>
                    {detailRow.prizeAmount != null ? detailRow.prizeAmount.toLocaleString('vi-VN') + 'đ' : '—'}
                  </div>
                </Col>
              </Row>
              <Row>
                <Col sm={6}>
                  <div style={{ color: '#888', fontSize: 12 }}>Trạng thái</div>
                  <Badge bg={STATUS_BADGE_VARIANT[detailRow.resultStatus] ?? 'secondary'} style={{ fontSize: 13 }}>
                    {STATUS_LABEL[detailRow.resultStatus] ?? detailRow.resultStatus}
                  </Badge>
                </Col>
                <Col sm={6}>
                  <div style={{ color: '#888', fontSize: 12 }}>Ngày tạo</div>
                  <div style={{ color: '#ccc' }}>{formatDate(detailRow.createdAt)}</div>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ background: '#1a1a2e', borderColor: '#333' }}>
          <Button variant="outline-secondary" onClick={() => setDetailRow(null)}>Đóng</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
