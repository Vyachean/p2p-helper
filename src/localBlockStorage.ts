import { uniq } from 'lodash-es';
import { storage } from 'wxt/storage';

const storageTag = 'localBlockList';

type Id = string | number;

export const useLocalBlockList = () => {
  const localStorage = storage.defineItem<Id[]>(`local:${storageTag}`);

  const add = async (id: Id) => {
    const value = (await localStorage.getValue()) ?? [];

    value.push(id);

    await localStorage.setValue(uniq(value));
  };

  const has = async (id: Id): Promise<boolean> => {
    const value = await localStorage.getValue();
    return !!value?.includes(id);
  };

  return {
    add,
    has,
  };
};
