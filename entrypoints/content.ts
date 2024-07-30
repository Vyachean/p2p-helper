import { isRequestToIdentifyBadSellers } from '@/src/types';
import { updateMarks } from '@/src/updateMarks';

export default defineContentScript({
  matches: ['*://*.bybit.com/*'],
  main() {
    browser.runtime.onMessage.addListener((message) => {
      if (isRequestToIdentifyBadSellers(message)) {
        const { stoppedOnOTC } = message;

        updateMarks(stoppedOnOTC);
      }
    });
  },
});
