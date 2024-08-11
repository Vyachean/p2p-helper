import type { TypeOf } from 'zod';
import { uniq } from 'lodash-es';
import {
  otcOnlineResponseZod,
  otcOnlineUrl,
  type StoppedOnOTC,
  type otcRequestOptionsZod,
} from './types';
import stopPhrasesJson from './stopPhrases.json';

export const stopPhrases: string[] = uniq(stopPhrasesJson);

const getContextAroundPhrase = (
  originalText: string,
  originalSearchPhrase: string,
  amount = 0,
) => {
  const text = originalText.toLowerCase();
  const searchPhrase = originalSearchPhrase.toLowerCase();

  const startPhraseIndex = text.indexOf(searchPhrase);

  if (startPhraseIndex < 0) {
    return;
  }

  const endPhraseIndex = text.lastIndexOf(searchPhrase) + searchPhrase.length;

  const lastPhraseIndex = Math.min(
    text.substring(endPhraseIndex).search(/\s+/) + endPhraseIndex,
    text.length - 1,
  );

  const beforeSearchPhrase = amount
    ? originalText
        .substring(0, startPhraseIndex)
        .trim()
        .split(/\s+/)
        .slice(-amount)
        .join(' ')
    : '';

  const afterSearchPhrase = amount
    ? originalText
        .substring(lastPhraseIndex)
        .trim()
        .split(/\s+/)
        .slice(0, amount)
        .join(' ')
    : '';

  const fullSearchPhrase = originalText.substring(
    startPhraseIndex,
    lastPhraseIndex,
  );

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
        foundPhrases = getContextAroundPhrase(remark, line, 3);

        return !!foundPhrases?.length;
      });

      return { ...marks, [nickName]: { hasStopPhrases, userId, foundPhrases } };
    },
    {},
  );
  return marks;
};
