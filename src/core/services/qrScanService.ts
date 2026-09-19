export interface TableSession {
  tableId: string;
  tableName: string;
  scannedAt: string;
  status: 'active' | 'closed';
  rawQrData: string;
}

const STORAGE_KEY = 'emsa7_active_table_session';

export const qrScanService = {
  // Get active session from localStorage
  getActiveSession: (): TableSession | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  // Save session when QR code is scanned
  saveTableSession: (rawQrData: string): TableSession => {
    let tableName = 'Table #12 (EMSA7 Lounge)';
    let tableId = 'TABLE-12';

    if (rawQrData.includes('table/')) {
      const parts = rawQrData.split('table/');
      tableId = `TABLE-${parts[1] || '12'}`;
      tableName = `Table #${parts[1] || '12'}`;
    } else if (rawQrData.startsWith('TABLE-') || rawQrData.startsWith('EMSA7-TABLE-')) {
      tableId = rawQrData.replace('EMSA7-', '');
      tableName = `Table #${tableId.replace('TABLE-', '')}`;
    } else if (rawQrData.trim()) {
      tableName = `Scanned Table (${rawQrData.slice(0, 15)})`;
    }

    const session: TableSession = {
      tableId,
      tableName,
      scannedAt: new Date().toISOString(),
      status: 'active',
      rawQrData,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
    return session;
  },

  // Clear active session
  clearSession: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  },
};
