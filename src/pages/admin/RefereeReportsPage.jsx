import { useEffect, useState, useMemo } from 'react';
import { Form, Button, Modal, Badge, Row, Col } from 'react-bootstrap';
import { refereeReportService } from '../../services/refereeReportService';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import {
  VIOLATION_TYPE,
  VIOLATION_LABEL,
  DECISION_LABEL,
  DECISION_BADGE,
} from '../../mocks/mockRefereeReports';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';

const PAGE_SIZE = 10;

const TYPE_FILTER = {
  ALL: 'all',
  VIOLATIONS: 'violations',
  DECISIONS: 'decisions',
};

// Xuất CSV danh sách báo cáo đang hiển thị
function exportCSV(rows) {
  const header = ['Race', 'Referee', 'Loại vi phạm', 'Quyết định', 'Nội dung', 'Ngày tạo'];
  const data = rows.map((r) => [
    r.raceName,
    r.refereeName,
    VIOLATION_LABEL[r.violationType] ?? r.violationType,
    DECISION_LABEL[r.decision] ?? r.decision,
    `"${(r.content ?? '').replace(/"/g, '""')}"`,
    formatDate(r.createdAt),
  ]);
  const csv = [header, ...data].map((row) => row.join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'referee-reports.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export default function AdminRefereeReportsPage() {
  const [reports, setReports] = useState([]);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [detailRow, setDetailRow] = useState(null);

  // Filters (useState — không phải form submission, không cần RHF)
  const [filterRace, setFilterRace] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterType, setFilterType] = useState(TYPE_FILTER.ALL);

  const load = () => {
    Promise.all([refereeReportService.getAll(), raceService.getAll()])
      .then(([reps, r]) => { setReports(reps); setRaces(r); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được báo cáo.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  // Áp dụng filter client-side (mock stage)
  const filtered = useMemo(() => {
    let rows = [...reports];

    if (filterRace) {
      rows = rows.filter((r) => r.raceId === Number(filterRace));
    }
    if (filterDateFrom) {
      const from = new Date(filterDateFrom).getTime();
      rows = rows.filter((r) => new Date(r.createdAt).getTime() >= from);
    }
    if (filterDateTo) {
      const to = new Date(filterDateTo);
      to.setHours(23, 59, 59, 999);
      rows = rows.filter((r) => new Date(r.createdAt).getTime() <= to.getTime());
    }
    if (filterType === TYPE_FILTER.VIOLATIONS) {
      rows = rows.filter((r) => r.violationType !== VIOLATION_TYPE.NONE);
    } else if (filterType === TYPE_FILTER.DECISIONS) {
      rows = rows.filter((r) => r.decision !== 'no_action');
    }

    return rows;
  }, [reports, filterRace, filterDateFrom, filterDateTo, filterType]);

  // Reset về trang 1 khi filter thay đổi
  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Danh sách race duy nhất từ reports (để dropdown filter)
  const raceOptions = useMemo(() => {
    const seen = new Set();
    return reports.filter((r) => {
      if (seen.has(r.raceId)) return false;
      seen.add(r.raceId);
      return true;
    }).map((r) => ({ id: r.raceId, name: r.raceName }));
  }, [reports]);

  const columns = [
    { key: 'raceName', label: 'Race' },
    { key: 'refereeName', label: 'Referee' },
    {
      key: 'violationType',
      label: 'Loại vi phạm',
      render: (r) => (
        <Badge bg={r.violationType === VIOLATION_TYPE.NONE ? 'secondary' : 'warning'} text={r.violationType === VIOLATION_TYPE.NONE ? undefined : 'dark'}>
          {VIOLATION_LABEL[r.violationType] ?? r.violationType}
        </Badge>
      ),
    },
    {
      key: 'decision',
      label: 'Quyết định',
      render: (r) => (
        <Badge bg={DECISION_BADGE[r.decision] ?? 'secondary'}>
          {DECISION_LABEL[r.decision] ?? r.decision}
        </Badge>
      ),
    },
    {
      key: 'content',
      label: 'Nội dung',
      render: (r) => (
        <span style={{ color: '#ccc', fontSize: 13 }}>
          {r.content?.length > 60 ? r.content.slice(0, 60) + '…' : r.content}
        </span>
      ),
    },
    { key: 'createdAt', label: 'Ngày tạo', render: (r) => formatDate(r.createdAt) },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <button className="btn-outline-gold-sm" onClick={() => setDetailRow(r)}>
          Chi tiết
        </button>
      ),
    },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h2>Báo cáo Referee</h2>
        <Button
          className="btn-gold-sm"
          style={{ padding: '7px 18px' }}
          disabled={filtered.length === 0}
          onClick={() => exportCSV(filtered)}
        >
          Xuất CSV ({filtered.length})
        </Button>
      </div>

      {/* Filter bar */}
      <div className="dash-card mb-4">
        <Row className="g-3 align-items-end">
          <Col md={3}>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>Race</Form.Label>
              <Form.Select value={filterRace} onChange={handleFilterChange(setFilterRace)}>
                <option value="">Tất cả race</option>
                {raceOptions.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>Từ ngày</Form.Label>
              <Form.Control
                type="date"
                value={filterDateFrom}
                onChange={handleFilterChange(setFilterDateFrom)}
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>Đến ngày</Form.Label>
              <Form.Control
                type="date"
                value={filterDateTo}
                onChange={handleFilterChange(setFilterDateTo)}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>Loại</Form.Label>
              <div className="d-flex gap-2">
                {[
                  { value: TYPE_FILTER.ALL, label: 'Tất cả' },
                  { value: TYPE_FILTER.VIOLATIONS, label: 'Vi phạm' },
                  { value: TYPE_FILTER.DECISIONS, label: 'Quyết định' },
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    size="sm"
                    variant={filterType === opt.value ? 'warning' : 'outline-secondary'}
                    onClick={() => { setFilterType(opt.value); setPage(1); }}
                    style={{ fontSize: 12 }}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </Form.Group>
          </Col>
          <Col md={2} className="d-flex align-items-end">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => {
                setFilterRace('');
                setFilterDateFrom('');
                setFilterDateTo('');
                setFilterType(TYPE_FILTER.ALL);
                setPage(1);
              }}
            >
              Xoá filter
            </Button>
          </Col>
        </Row>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState message="Không có báo cáo nào phù hợp với filter." />
      ) : (
        <>
          <DataTable columns={columns} rows={paged} />
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Detail Modal */}
      <Modal show={!!detailRow} onHide={() => setDetailRow(null)} centered size="lg">
        <Modal.Header closeButton style={{ background: '#1a1a2e', borderColor: '#D4AF37' }}>
          <Modal.Title style={{ color: '#D4AF37' }}>Chi tiết báo cáo</Modal.Title>
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
                  <div style={{ color: '#888', fontSize: 12 }}>Referee</div>
                  <div>{detailRow.refereeName}</div>
                </Col>
              </Row>
              <Row>
                <Col sm={6}>
                  <div style={{ color: '#888', fontSize: 12 }}>Loại vi phạm</div>
                  <Badge
                    bg={detailRow.violationType === VIOLATION_TYPE.NONE ? 'secondary' : 'warning'}
                    text={detailRow.violationType === VIOLATION_TYPE.NONE ? undefined : 'dark'}
                    style={{ fontSize: 13 }}
                  >
                    {VIOLATION_LABEL[detailRow.violationType] ?? detailRow.violationType}
                  </Badge>
                </Col>
                <Col sm={6}>
                  <div style={{ color: '#888', fontSize: 12 }}>Quyết định</div>
                  <Badge bg={DECISION_BADGE[detailRow.decision] ?? 'secondary'} style={{ fontSize: 13 }}>
                    {DECISION_LABEL[detailRow.decision] ?? detailRow.decision}
                  </Badge>
                </Col>
              </Row>
              <div>
                <div style={{ color: '#888', fontSize: 12, marginBottom: 6 }}>Nội dung báo cáo</div>
                <div
                  style={{
                    background: '#0d0d1a',
                    border: '1px solid #333',
                    borderRadius: 6,
                    padding: '12px 16px',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {detailRow.content}
                </div>
              </div>
              <div style={{ color: '#888', fontSize: 12 }}>
                Ngày tạo: <span style={{ color: '#ccc' }}>{formatDate(detailRow.createdAt)}</span>
              </div>
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
