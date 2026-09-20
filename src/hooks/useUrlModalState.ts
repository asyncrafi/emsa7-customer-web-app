import { useState, useEffect, useCallback } from 'react';

/**
 * Senior-level URL-based modal management hook.
 * Syncs modal visibility with browser URL search parameters (`window.location.search`).
 * Supports browser back-button navigation to close modals seamlessly and handles body scroll locking.
 */
export function useUrlModalState() {
  const [searchParams, setSearchParams] = useState<URLSearchParams>(
    () => new URLSearchParams(window.location.search)
  );

  // Sync state on popstate (browser back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Determine active modal from URL params
  const activeModal = searchParams.get('modal'); // e.g. 'filter', 'cart', 'food'
  const activeItemId = searchParams.get('item'); // for food detail modal

  // Open a modal by updating URL search params
  const openModal = useCallback((modalName: string, extraParams?: Record<string, string>) => {
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set('modal', modalName);
    if (extraParams) {
      Object.entries(extraParams).forEach(([key, val]) => {
        currentParams.set(key, val);
      });
    }

    const newUrl = `${window.location.pathname}?${currentParams.toString()}${window.location.hash}`;
    window.history.pushState({ modal: modalName }, '', newUrl);
    setSearchParams(currentParams);
  }, []);

  // Close the active modal
  const closeModal = useCallback(() => {
    const currentParams = new URLSearchParams(window.location.search);
    if (!currentParams.has('modal')) return;

    if (window.history.state?.modal) {
      window.history.back();
    } else {
      currentParams.delete('modal');
      currentParams.delete('item');
      const newUrl = currentParams.toString()
        ? `${window.location.pathname}?${currentParams.toString()}${window.location.hash}`
        : `${window.location.pathname}${window.location.hash}`;
      window.history.replaceState(null, '', newUrl);
      setSearchParams(currentParams);
    }
  }, []);

  // Lock body scroll whenever a modal is open
  useEffect(() => {
    if (activeModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [activeModal]);

  return {
    activeModal,
    activeItemId,
    isFilterOpen: activeModal === 'filter',
    isCartOpen: activeModal === 'cart',
    isFoodDetailOpen: activeModal === 'food',
    isWaiterModalOpen: activeModal === 'waiter',
    openFilterModal: () => openModal('filter'),
    openCartModal: () => openModal('cart'),
    openFoodDetailModal: (itemId: string) => openModal('food', { item: itemId }),
    openWaiterModal: () => openModal('waiter'),
    closeModal,
  };
}
