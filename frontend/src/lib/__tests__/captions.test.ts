import { describe, expect, it } from 'vitest';
import { activeCueIndex, captionProblem, cleanCueText, formatCueTime, parseCueTime, type CaptionCue } from '../captions';

const cue = (startMs: number, endMs: number, text: string): CaptionCue => ({ startMs, endMs, text });

describe('Lời thoại của video (đầu vào của video ký hiệu)', () => {
  it('formats and reads the times typed in the editor', () => {
    expect(formatCueTime(65_250)).toBe('1:05.2');
    expect(formatCueTime(3_723_500)).toBe('1:02:03.5');
    expect(formatCueTime(9_000, false)).toBe('0:09');
    expect(parseCueTime('1:05.2')).toBe(65_200);
    expect(parseCueTime('01:05,25')).toBe(65_250);
    expect(parseCueTime('1:02:03')).toBe(3_723_000);
    expect(parseCueTime('65.5')).toBe(65_500);
    expect(parseCueTime('1:x')).toBeNull();
    expect(parseCueTime('')).toBeNull();
    expect(parseCueTime('-3')).toBeNull();
  });

  it('reports the first problem like the API does', () => {
    expect(captionProblem([cue(0, 1000, 'Một'), cue(1000, 2000, 'Hai')])).toBeNull();
    expect(captionProblem([cue(0, 2000, 'Một'), cue(1500, 3000, 'Hai')])).toEqual({ index: 1, message: 'Câu 2: bắt đầu trước khi câu 1 kết thúc.' });
    expect(captionProblem([cue(0, 1000, '  ')])?.message).toBe('Câu 1: chưa có chữ.');
    expect(captionProblem([cue(2000, 1000, 'Ngược')])?.message).toContain('kết thúc phải sau');
    expect(captionProblem([cue(0, 61_000, 'Dài')])?.message).toContain('60 giây');
  });

  it('finds the line being said, and none between lines', () => {
    const cues = [cue(0, 1000, 'a'), cue(1000, 2000, 'b'), cue(3000, 4000, 'c')];
    expect(activeCueIndex(cues, 0)).toBe(0);
    expect(activeCueIndex(cues, 1000)).toBe(1);
    expect(activeCueIndex(cues, 2500)).toBe(-1);
    expect(activeCueIndex(cues, 3999)).toBe(2);
    expect(activeCueIndex([], 10)).toBe(-1);
  });

  it('cleans the text of a line before it is saved', () => {
    expect(cleanCueText(' Xin   chào \r\n\r\n các bạn ')).toBe('Xin chào\ncác bạn');
  });
});
