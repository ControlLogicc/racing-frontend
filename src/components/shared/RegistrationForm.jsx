import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

// Owner nộp đăng ký đua mới: chọn ngựa của mình + race muốn tham gia.
export default function RegistrationForm({ horses, races, onSubmit, submitting }) {
  const [horseId, setHorseId] = useState('');
  const [raceId, setRaceId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!horseId || !raceId) return;
    onSubmit({ horseId: Number(horseId), raceId: Number(raceId) });
    setHorseId('');
    setRaceId('');
  };

  return (
    <Form onSubmit={handleSubmit} className="dash-card d-flex flex-wrap gap-3 align-items-end">
      <Form.Group>
        <Form.Label style={{ color: '#D4AF37' }}>Ngựa</Form.Label>
        <Form.Select value={horseId} onChange={(e) => setHorseId(e.target.value)} required>
          <option value="">-- Chọn ngựa --</option>
          {horses.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group>
        <Form.Label style={{ color: '#D4AF37' }}>Race</Form.Label>
        <Form.Select value={raceId} onChange={(e) => setRaceId(e.target.value)} required>
          <option value="">-- Chọn race --</option>
          {races.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </Form.Select>
      </Form.Group>

      <Button type="submit" className="btn-gold-sm" disabled={submitting} style={{ padding: '8px 20px' }}>
        Nộp đăng ký
      </Button>
    </Form>
  );
}
