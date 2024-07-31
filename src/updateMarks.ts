import { debounce } from 'lodash-es';
import { markClass, type StoppedOnOTC } from './types';
import { blockUser } from './fastBlockUser';

export const updateMarks = debounce((marks: StoppedOnOTC) => {
  const contentEl = document.querySelector(
    '.trade-list__content > .trade-table__wrapper',
  );

  if (contentEl) {
    const nodeListNames = contentEl.querySelectorAll('.advertiser-name');

    nodeListNames.forEach((nameEl) => {
      const name = nameEl.firstChild?.textContent;

      const container = nameEl.parentElement;

      if (container) {
        Object.entries(marks).forEach(
          ([nickName, { hasStopPhrases, userId }]) => {
            if (nickName === name) {
              const foundEl = container.querySelector(`.${markClass}`);

              const markEl =
                (foundEl instanceof HTMLSpanElement ? foundEl : undefined) ??
                document.createElement('span');

              markEl.classList.add(markClass);

              if (hasStopPhrases) {
                markEl.innerText = ' 🛑';
              } else {
                markEl.innerText = ' ✅';
              }

              const blockBtn = document.createElement('button');
              blockBtn.type = 'button';
              blockBtn.innerHTML = 'BLOCK';
              blockBtn.addEventListener('click', (e) => {
                e.preventDefault();
                blockBtn.disabled = true;
                void blockUser(userId)
                  .then(() => (blockBtn.hidden = true))
                  .finally(() => (blockBtn.disabled = false));
              });

              if (!foundEl) {
                container.append(markEl);
                container.append(blockBtn);
              }
            }
          },
        );
      }
    });
  }
}, 1e3);
