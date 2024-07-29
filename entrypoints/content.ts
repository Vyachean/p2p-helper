export default defineContentScript({
  matches: ['*://*.bybit.com/*'],
  main() {
    console.log('Hello content.');
  },
});
