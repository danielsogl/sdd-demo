import { describe, expect, it } from 'vitest';
import { createSearchQuery } from '@/domain/pokemon/value-objects';

describe('SearchQuery', () => {
  describe('createSearchQuery', () => {
    it('normalises input to lowercase', () => {
      const query = createSearchQuery('Pikachu');
      expect(query.normalised).toBe('pikachu');
    });

    it('trims whitespace from input', () => {
      const query = createSearchQuery('  bulbasaur  ');
      expect(query.normalised).toBe('bulbasaur');
    });

    it('preserves the raw input', () => {
      const query = createSearchQuery('  Pikachu  ');
      expect(query.raw).toBe('  Pikachu  ');
    });

    it('handles empty string', () => {
      const query = createSearchQuery('');
      expect(query.normalised).toBe('');
      expect(query.raw).toBe('');
    });

    it('handles whitespace-only string', () => {
      const query = createSearchQuery('   ');
      expect(query.normalised).toBe('');
    });

    it('applies case folding and trimming together', () => {
      const query = createSearchQuery('  MR-MIME  ');
      expect(query.normalised).toBe('mr-mime');
    });
  });
});
