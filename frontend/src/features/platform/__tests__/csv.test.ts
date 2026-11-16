import { describe, expect, it } from 'vitest';
import { toCsv } from '../components/csv';

describe('toCsv', () => {
  it('writes a BOM, a header row and CRLF line breaks', () => {
    const csv = toCsv(['Tên', 'Số'], [['Công ty A', 3]]);
    expect(csv).toBe('﻿Tên,Số\r\nCông ty A,3');
  });

  it('quotes cells with commas, quotes and line breaks', () => {
    const csv = toCsv(['a'], [['x, "y"\nz']]);
    expect(csv.split('\r\n')[1]).toBe('"x, ""y""\nz"');
  });

  it('neutralises cells that Excel would run as a formula', () => {
    const csv = toCsv(['a', 'b', 'c'], [['=HYPERLINK("x")', '+1', '-2']]);
    expect(csv.split('\r\n')[1]).toBe(`"'=HYPERLINK(""x"")",'+1,'-2`);
  });

  it('keeps negative numbers as numbers and empties null cells', () => {
    const csv = toCsv(['a', 'b'], [[-5, null]]);
    expect(csv.split('\r\n')[1]).toBe('-5,');
  });
});
