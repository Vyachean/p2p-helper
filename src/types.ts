import type { TypeOf } from 'zod';
import { array, boolean, literal, number, object, string } from 'zod';

export const requestHeadersZod = object({}).catchall(string());
export const isRequestHeaders = (
  v: unknown,
): v is TypeOf<typeof requestHeadersZod> =>
  requestHeadersZod.safeParse(v).success;

export const otcRequestBodyZod = object({
  userId: number(),
  tokenId: string(),
  currencyId: string(),
  payment: array(string()),
  side: string(),
  size: string(),
  page: string(),
  amount: string(),
  authMaker: boolean(),
  canTrade: boolean(),
  itemRegion: number(),
});

export const otcRequestOptionsZod = object({
  body: otcRequestBodyZod,
  headers: requestHeadersZod,
});

export const isOtcRequestOptions = (v: unknown): v is OtcRequestOptions =>
  otcRequestOptionsZod.safeParse(v).success;

export type OtcRequestOptions = TypeOf<typeof otcRequestOptionsZod>;

export const messageRequestType = 'requestBadOtc';

export const stoppedOnOTCZod = object({}).catchall(
  object({
    hasStopPhrases: boolean(),
    userId: string(),
  }),
);

export type StoppedOnOTC = TypeOf<typeof stoppedOnOTCZod>;

export const markClass = 'p2p-helper-mark';

export const requestToIdentifyBadSellersZod = object({
  type: literal(messageRequestType),
  stoppedOnOTC: stoppedOnOTCZod,
});

export const isRequestToIdentifyBadSellers = (
  v: unknown,
): v is TypeOf<typeof requestToIdentifyBadSellersZod> =>
  requestToIdentifyBadSellersZod.safeParse(v).success;

export const otcOnlineResponseZod = object({
  result: object({
    items: array(
      object({
        remark: string(),
        nickName: string(),
        userId: string(),
      }),
    ),
  }),
});

export const otcOnlineUrl = 'https://api2.bybit.com/fiat/otc/item/online';

export const blockUserResponseZod = object({
  result: boolean(),
});

export const storageTag = 'local:bybit-headers';
