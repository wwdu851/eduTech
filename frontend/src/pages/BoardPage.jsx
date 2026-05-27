import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBoard } from '../store/boardSlice';
import AppShell from '../components/layout/AppShell';
import EditableTripTitle from '../components/layout/EditableTripTitle';
import KanbanBoard from '../components/board/KanbanBoard';
import AddCardBar from '../components/board/AddCardBar';
import ErrorBanner from '../components/shared/ErrorBanner';
import LoadingSpinner from '../components/shared/LoadingSpinner';

export default function BoardPage() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const { loading, error, cards } = useSelector(state => state.board);
  const [dismissedError, setDismissedError] = useState(null);
  useEffect(() => {
    dispatch(fetchBoard());
  }, [dispatch]);

  const showError = error && dismissedError !== error;
  const showInitialLoad = loading && Object.keys(cards).length === 0;

  return (
    <AppShell title={<EditableTripTitle key={user?.id || 'guest'} user={user} />}>
      <div className="relative flex min-h-[calc(100vh-64px)] flex-col">
        {loading && !showInitialLoad && (
          <div className="fixed bottom-20 left-1/2 z-20 -translate-x-1/2 rounded-full bg-slate-800 px-4 py-1.5 text-xs text-white shadow-lg">
            Refreshing...
          </div>
        )}

        <div className="flex-1 px-4 py-4 md:px-6">
          {showError && (
            <div className="mb-4">
              <ErrorBanner message={error} onDismiss={() => setDismissedError(error)} />
            </div>
          )}

          {showInitialLoad ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <KanbanBoard />
          )}
        </div>

        <AddCardBar />
      </div>
    </AppShell>
  );
}
