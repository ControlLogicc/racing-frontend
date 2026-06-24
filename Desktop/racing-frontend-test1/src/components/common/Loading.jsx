import { Spinner } from 'react-bootstrap';

export default function Loading({ fullPage = false }) {
  const spinner = <Spinner animation="border" style={{ color: '#d4af37' }} />;
  if (!fullPage) {
    return <div className="d-flex justify-content-center py-5">{spinner}</div>;
  }
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '60vh' }}
    >
      {spinner}
    </div>
  );
}
