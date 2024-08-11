import { storage } from 'wxt/storage';
import {
  blockUserListResponseZod,
  blockUserResponseZod,
  deleteBLockUserResponseZod,
  isRequestHeaders,
  storageTag,
} from './types';

const imitationHeaders = {
  accept: 'application/json',
  'accept-language': 'ru-RU',
  'content-type': 'application/json;charset=UTF-8',
  lang: 'ru-RU',
  platform: 'PC',
  priority: 'u=1, i',
  'sec-ch-ua': '"Not)A;Brand";v="99", "Brave";v="127", "Chromium";v="127"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Linux"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-site',
  'sec-gpc': '1',
};

const fetchBlockList = async () => {
  const headers = await storage.getItem<object>(storageTag);

  const response = await fetch(
    'https://api2.bybit.com/fiat/p2p/user/block_user_query',
    {
      headers: {
        ...imitationHeaders,
        ...headers,
      },
      body: JSON.stringify({
        pageNum: 100,
        pageSize: 5,
      }),
      method: 'POST',
      credentials: 'include',
    },
  );

  const { result } = blockUserListResponseZod.parse(await response.json());

  return result;
};

const deleteBlockUser = async (blockedUserId: string) => {
  const headers = await storage.getItem<object>(storageTag);

  const response = await fetch(
    'https://api2.bybit.com/fiat/p2p/user/delete_block_user',
    {
      headers: {
        ...imitationHeaders,
        ...headers,
      },
      body: JSON.stringify({ blockedUserId }),
      method: 'POST',
      credentials: 'include',
    },
  );

  const { result } = deleteBLockUserResponseZod.parse(await response.json());

  if (!result) {
    throw new Error('Не удалось разблокировать');
  }
};

export const blockUser = async (blockedUserId: string) => {
  const bodyObject = {
    blockedUserId,
    blockedReasonCode: 'shieldReason_deception',
    blockedRemark: '',
  };

  const headers = await storage.getItem(storageTag);

  if (isRequestHeaders(headers)) {
    const response = await fetch(
      'https://api2.bybit.com/fiat/p2p/user/add_block_user',
      {
        headers: {
          ...imitationHeaders,
          ...headers,
        },
        body: JSON.stringify(bodyObject),
        method: 'POST',
        credentials: 'include',
      },
    );

    const { result, ret_msg } = blockUserResponseZod.parse(
      await response.json(),
    );
    if (!result) {
      if (ret_msg === 'You can only add a maximum of 500 blocked users.') {
        const { list } = await fetchBlockList();
        const lastBlockedUserId = list.at(-1)?.blockedUserId;
        if (lastBlockedUserId) {
          await deleteBlockUser(lastBlockedUserId);
          await new Promise((resolve) => setTimeout(resolve, 1e3));
          await blockUser(blockedUserId);
        }
      }
    }
  }
};
