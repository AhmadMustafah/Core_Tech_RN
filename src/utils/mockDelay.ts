export const MOCK_READ_DELAY = 40;
export const MOCK_WRITE_DELAY = 80;

export const mockDelay = (ms = MOCK_READ_DELAY): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));
