import { startRequestListener } from '@/src/requestListener';

export default defineBackground(() => {
  startRequestListener();
});
