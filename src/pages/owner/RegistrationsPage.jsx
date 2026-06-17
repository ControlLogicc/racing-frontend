import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { registrationService } from '../../services/registrationService';
import { horseService } from '../../services/horseService';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';
import RegistrationForm from '../../components/shared/RegistrationForm';
import RegistrationTable from '../../components/shared/RegistrationTable';

export default function OwnerRegistrationsPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [horses, setHorses] = useState([]);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    Promise.all([
      registrationService.getByOwner(user.userId),
      horseService.getByOwner(user.userId),
      raceService.getAll(),
    ])
      .then(([r, h, races]) => { setRegistrations(r); setHorses(h); setRaces(races); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được dữ liệu đăng ký.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const refetch = () => {
    setLoading(true);
    setError('');
    load();
  };

  const handleSubmit = async ({ horseId, raceId }) => {
    setSubmitting(true);
    try {
      const horse = horses.find((h) => h.id === horseId);
      const race = races.find((r) => r.id === raceId);
      await registrationService.create({
        raceId,
        raceName: race?.name,
        horseId,
        horseName: horse?.name,
        ownerId: user.userId,
        ownerName: user.fullName,
      });
      setToast({ message: 'Nộp đăng ký thành công.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Nộp đăng ký thất bại.'), variant: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <div className="page-header"><h2>Đăng ký đua</h2></div>

      <div className="mb-4">
        <RegistrationForm horses={horses} races={races} onSubmit={handleSubmit} submitting={submitting} />
      </div>

      {registrations.length === 0 ? (
        <EmptyState message="Bạn chưa nộp đăng ký nào." />
      ) : (
        <RegistrationTable rows={registrations} />
      )}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
