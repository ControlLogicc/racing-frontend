import { useEffect, useState } from 'react';
import { horseService } from '../../services/horseService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import HorseProfileCard from '../../components/shared/HorseProfileCard';

export default function SpectatorHorsesPage() {
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    horseService
      .getPublicAll()
      .then(setHorses)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được hồ sơ ngựa.')))
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

  return (
    <div className="pub-page">
      <section className="container pt-5">
        <div className="pub-section-title-wrap"><h2 className="pub-section-title">Hồ sơ ngựa</h2></div>
        {loading && <Loading />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && horses.length === 0 && <EmptyState message="Chưa có ngựa nào." />}
        {!loading && !error && horses.length > 0 && (
          <div className="row g-4">
            {horses.map((h) => (
              <div className="col-12 col-sm-6 col-lg-4" key={h.id}>
                <HorseProfileCard horse={h} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
