import type { TypeOf } from 'zod';
import { lowerCase, uniq } from 'lodash-es';
import {
  otcOnlineResponseZod,
  otcOnlineUrl,
  type StoppedOnOTC,
  type otcRequestOptionsZod,
} from './types';
import stopPhrasesJson from './stopPhrases.json';

export const stopPhrases: string[] = uniq(stopPhrasesJson.map(lowerCase));

export const getStoppedOnOTC = async ({
  body,
  headers,
}: TypeOf<typeof otcRequestOptionsZod>) => {
  const response = await fetch(otcOnlineUrl, {
    method: 'POST',
    headers: {
      ...headers,

      'sec-ch-ua': `${headers['sec-ch-ua']};`,
    },
    body: JSON.stringify(body),
  });

  const responsePayload = otcOnlineResponseZod.parse(await response.json());

  const marks = responsePayload.result.items.reduce<StoppedOnOTC>(
    (marks, { nickName, remark }) => {
      const hasStopPhrases = !!stopPhrases.find((line) =>
        remark.toLowerCase().includes(line),
      );

      return { ...marks, [nickName]: hasStopPhrases };
    },
    {},
  );
  return marks;
};
