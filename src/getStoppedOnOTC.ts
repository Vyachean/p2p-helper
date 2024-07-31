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

const getContextAroundPhrase = (
  text: string,
  searchPhrase: string,
  amount: number = 0,
) => {
  const startPhraseIndex = text.indexOf(searchPhrase);
  const endPhraseIndex = text.lastIndexOf(searchPhrase) + searchPhrase.length;

  const lastPhraseIndex =
    text.substring(endPhraseIndex).search(/\s+/) + endPhraseIndex;

  if (startPhraseIndex < 0) {
    return undefined;
  }

  const beforeSearchPhrase = amount
    ? text
        .substring(0, startPhraseIndex)
        .trim()
        .split(/\s+/)
        .slice(-amount)
        .join(' ')
    : '';

  const afterSearchPhrase = amount
    ? text
        .substring(lastPhraseIndex)
        .trim()
        .split(/\s+/)
        .slice(0, amount)
        .join(' ')
    : '';

  const fullSearchPhrase = text.substring(startPhraseIndex, lastPhraseIndex);

  return `${beforeSearchPhrase} ${fullSearchPhrase} ${afterSearchPhrase}`.trim();
};

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
    (marks, { nickName, remark, userId }) => {
      let foundPhrases: string | undefined;

      const hasStopPhrases = !!stopPhrases.find((line) => {
        foundPhrases = getContextAroundPhrase(remark.toLowerCase(), line, 3);

        return !!foundPhrases?.length;
      });

      return { ...marks, [nickName]: { hasStopPhrases, userId, foundPhrases } };
    },
    {},
  );
  return marks;
};
