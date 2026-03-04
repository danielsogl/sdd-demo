import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useDebounce } from '@/hooks/use-debounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('does not update before the delay', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'hello', delay: 500 },
    });

    rerender({ value: 'world', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('hello');
  });

  it('updates after the delay', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'hello', delay: 500 },
    });

    rerender({ value: 'world', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('world');
  });

  it('resets the timer on new input', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'a', delay: 500 },
    });

    rerender({ value: 'ab', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    rerender({ value: 'abc', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should still be 'a' since timer was reset
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('abc');
  });
});
