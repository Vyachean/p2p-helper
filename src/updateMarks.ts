import { debounce } from 'lodash-es';
import { markClass, type StoppedOnOTC } from './types';
import { blockUser } from './fastBlockUser';
import { useLocalBlockList } from './localBlockStorage';

const localBlockList = useLocalBlockList();

const createBtn = (label: string) => {
  const btnEl = document.createElement('button');
  btnEl.type = 'button';
  btnEl.innerText = label;
  const { style } = btnEl;
  style.display = 'inline-block';
  style.padding = '6px';
  style.borderRadius = '4px';
  return btnEl;
};

const hideParentTr = (el: Element, transparent?: boolean) => {
  const tableRow = el.closest('tr');

  if (tableRow) {
    if (transparent) {
      tableRow.style.opacity = '0.1';
      tableRow.style.pointerEvents = 'none';
    } else {
      tableRow.style.display = 'none';
    }
  }
};

const createContainer = (
  hasStopPhrases: boolean,
  userId: string,
  nameEl: Element,
  foundPhrases?: string,
) => {
  const container = document.createElement('div');
  container.classList.add(markClass);
  const containerStyle = container.style;
  containerStyle.display = 'flex';
  containerStyle.flexWrap = 'wrap';
  containerStyle.gap = '4px';
  containerStyle.alignItems = 'center';

  const markEl = document.createElement('div');

  if (hasStopPhrases) {
    markEl.innerText = ' 🛑';
  } else {
    markEl.innerText = ' ✅';
  }
  container.append(markEl);

  const bybitBlockBtn = createBtn('add to blacklist');
  bybitBlockBtn.addEventListener('click', (e) => {
    e.preventDefault();
    void onClickBybitBlockBtn();
  });

  const onClickBybitBlockBtn = async () => {
    bybitBlockBtn.disabled = true;
    try {
      await blockUser(userId);
      await localBlockList.add(userId);
      hideParentTr(nameEl, true);
      bybitBlockBtn.hidden = true;
    } finally {
      bybitBlockBtn.disabled = false;
    }
  };

  container.append(bybitBlockBtn);

  const foundPhrasesEl = document.createElement('p');
  if (foundPhrases) {
    foundPhrasesEl.innerText = `...${foundPhrases}...`;
  }
  container.append(foundPhrasesEl);

  return container;
};

export const updateMarks = debounce((marks: StoppedOnOTC) => {
  const contentEl = document.querySelector(
    '.trade-list__content > .trade-table__wrapper',
  );

  if (contentEl) {
    const nodeListNames = contentEl.querySelectorAll('.advertiser-name');

    nodeListNames.forEach((nameEl) => {
      const name = nameEl.firstChild?.textContent;

      const container = nameEl.parentElement;

      const foundContainer = container?.querySelector(`.${markClass}`);

      if (container && !foundContainer) {
        Object.entries(marks).forEach(
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          async ([nickName, { hasStopPhrases, userId, foundPhrases }]) => {
            if (nickName === name) {
              if (await localBlockList.has(userId)) {
                hideParentTr(nameEl);
                return;
              }

              const customContainer = createContainer(
                hasStopPhrases,
                userId,
                nameEl,
                foundPhrases,
              );

              container.append(customContainer);
            }
          },
        );
      }
    });
  }
}, 1e3);
