import { type TypeOf } from 'zod';
import { isUndefined, merge } from 'lodash-es';
import { getStoppedOnOTC } from './getStoppedOnOTC';
import type {
  requestHeadersZod,
  OtcRequestOptions,
  requestToIdentifyBadSellersZod,
} from './types';
import {
  isOtcRequestOptions,
  messageRequestType,
  otcOnlineUrl,
  otcRequestBodyZod,
  storageTag,
} from './types';
import { browser } from 'wxt/browser';
import { storage } from 'wxt/storage';

export const startRequestListener = () => {
  const sendMarks = async (tabId: number, options: OtcRequestOptions) => {
    const stoppedOnOTC = await getStoppedOnOTC(options);

    const message: TypeOf<typeof requestToIdentifyBadSellersZod> = {
      type: messageRequestType,
      stoppedOnOTC,
    };

    await browser.tabs.sendMessage(tabId, message);
  };

  const requestQueue = new Map<number, Partial<OtcRequestOptions>>();
  const setQueue = async (
    tabId: number,
    headers?: TypeOf<typeof requestHeadersZod>,
    body?: TypeOf<typeof otcRequestBodyZod>,
  ) => {
    const oldRequest = requestQueue.get(tabId) ?? {};

    const newRequest = merge(oldRequest, { headers, body });

    if (isOtcRequestOptions(newRequest)) {
      requestQueue.delete(tabId);
      await sendMarks(tabId, newRequest);
    } else {
      requestQueue.set(tabId, newRequest);
    }
  };

  const listenerUrls: string[] = [otcOnlineUrl];

  browser.webRequest.onBeforeRequest.addListener(
    (details) => {
      const { requestBody, tabId } = details;
      if (requestBody) {
        const bytes = requestBody.raw?.[0]?.bytes as
          | Iterable<number>
          | undefined;
        if (bytes) {
          const allowSharedBufferSource = new Uint8Array(bytes);
          const requestBody: string = new TextDecoder().decode(
            allowSharedBufferSource,
          );
          const jsonBody = otcRequestBodyZod.parse(JSON.parse(requestBody));
          void setQueue(tabId, undefined, jsonBody);
        }
      }
    },
    { urls: listenerUrls },
    ['requestBody', 'extraHeaders'],
  );

  browser.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
      const { requestHeaders, tabId } = details;

      const headers = requestHeaders?.reduce<Record<string, string>>(
        (acc, { name, value }) => {
          if (!isUndefined(value)) {
            return { ...acc, [name]: value };
          }
          return acc;
        },
        {},
      );

      if (
        headers &&
        headers['sec-ch-ua'] &&
        headers['sec-ch-ua'][headers['sec-ch-ua'].length - 1] !== ';'
      ) {
        void storage.setItem(storageTag, {
          guid: headers.guid,
          traceparent: headers.traceparent,
        });

        void setQueue(tabId, headers);
      }

      return { requestHeaders };
    },
    { urls: listenerUrls },
    ['requestHeaders'],
  );
};
