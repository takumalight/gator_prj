import { expect, test } from 'vitest';
import { getConfigFilePath } from './config.ts';

test ("checking config path", () => {
    expect(getConfigFilePath()).toBe("/home/takumalight/.gatorconfig.json")
});
