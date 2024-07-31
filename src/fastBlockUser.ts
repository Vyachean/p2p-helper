import { storage } from 'wxt/storage';
import { blockUserResponseZod, isRequestHeaders, storageTag } from './types';

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
          accept: 'application/json',
          'accept-language': 'ru-RU',
          'content-type': 'application/json;charset=UTF-8',
          lang: 'ru-RU',
          platform: 'PC',
          priority: 'u=1, i',
          'sec-ch-ua':
            '"Not)A;Brand";v="99", "Brave";v="127", "Chromium";v="127"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Linux"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
          'sec-gpc': '1',
          ...headers,
        },
        body: JSON.stringify(bodyObject),
        method: 'POST',
        credentials: 'include',
      },
    );

    const { result } = blockUserResponseZod.parse(await response.json());
    if (!result) {
      throw new Error('не удалось заблокировать');
    }
  }
};
