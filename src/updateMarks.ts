import { debounce } from 'lodash-es';
import { markClass, type StoppedOnOTC } from './types';

export const updateMarks = debounce((marks: StoppedOnOTC) => {
  const contentEl = document.querySelector(
    '.trade-list__content > .trade-table__wrapper',
  );

  if (contentEl) {
    const nodeListNames = contentEl.querySelectorAll('.advertiser-name');

    nodeListNames.forEach((nameEl) => {
      const name = nameEl.firstChild?.textContent;

      Object.entries(marks).forEach(([nickName, isBan]) => {
        if (nickName === name) {
          const foundEl = nameEl.querySelector(`.${markClass}`);

          const markEl =
            (foundEl instanceof HTMLSpanElement ? foundEl : undefined) ??
            document.createElement('span');

          markEl.classList.add(markClass);

          if (isBan) {
            markEl.innerText = ' 🛑';
          } else {
            markEl.innerText = ' ✅';
          }

          if (!foundEl) {
            nameEl.append(markEl);
          }
        }
      });
    });
  }
}, 1e3);
