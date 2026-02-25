import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { log, keyValue, banner, splashBanner, table } from '../../lib/output';

describe('output', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('log helpers', () => {
    it('log.info writes to console.log', () => {
      log.info('test message');
      expect(consoleSpy).toHaveBeenCalledOnce();
      // The output contains the message (with chalk styling)
      const output = consoleSpy.mock.calls[0].join(' ');
      expect(output).toContain('test message');
    });

    it('log.success writes to console.log', () => {
      log.success('done');
      expect(consoleSpy).toHaveBeenCalledOnce();
    });

    it('log.warn writes to console.log', () => {
      log.warn('warning');
      expect(consoleSpy).toHaveBeenCalledOnce();
    });

    it('log.error writes to console.error', () => {
      log.error('fail');
      expect(consoleErrorSpy).toHaveBeenCalledOnce();
    });

    it('log.dim writes to console.log', () => {
      log.dim('quiet');
      expect(consoleSpy).toHaveBeenCalledOnce();
    });
  });

  describe('keyValue', () => {
    it('prints key-value pairs', () => {
      keyValue({ Name: 'Alice', Age: 30 });
      expect(consoleSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('banner', () => {
    it('prints oanim banner text', () => {
      banner();
      expect(consoleSpy).toHaveBeenCalled();
      const allOutput = consoleSpy.mock.calls.map(c => c.join(' ')).join('\n');
      expect(allOutput).toContain('oanim');
    });
  });

  describe('splashBanner', () => {
    it('prints ASCII art splash', () => {
      splashBanner();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('table', () => {
    it('prints header, separator, and rows', () => {
      table(['Name', 'Value'], [['a', '1'], ['b', '2']]);
      // header + separator + 2 rows = 4 calls
      expect(consoleSpy).toHaveBeenCalledTimes(4);
    });

    it('handles empty rows', () => {
      table(['Col'], []);
      // header + separator = 2 calls
      expect(consoleSpy).toHaveBeenCalledTimes(2);
    });
  });
});
