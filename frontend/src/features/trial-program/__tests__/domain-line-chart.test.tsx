import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { DomainLineChart } from '../components/DomainLineChart';

afterEach(cleanup);

const points = [
  { number: 1, name: 'Khai thác dữ liệu và thông tin', short: '1. Dữ liệu', current: 1.4, target: 2 },
  { number: 2, name: 'Giao tiếp và hợp tác', short: '2. Giao tiếp', current: 2.5, target: 2 },
  { number: 3, name: 'Sáng tạo nội dung số', short: '3. Sáng tạo', current: 1, target: null },
];

it('draws current and required levels as lines, shades the shortfall and explains a domain on focus', () => {
  const { container } = render(<DomainLineChart points={points} />);
  const figure = screen.getByRole('figure', { name: 'Biểu đồ mức hiện tại so với mức cần đạt theo lĩnh vực' });
  expect(figure).toHaveTextContent('Mức hiện tại (trung bình)');
  expect(figure).toHaveTextContent('Mức cần đạt');
  expect(figure).toHaveTextContent('Còn thiếu');
  expect(container.querySelectorAll('.trial-line__dot')).toHaveLength(3);
  expect(container.querySelectorAll('.trial-line__diamond')).toHaveLength(2);
  // Domain 1 is below its standard and domain 2 above: the shaded band stops where the lines cross.
  expect(container.querySelectorAll('.trial-line__gap')).toHaveLength(1);

  fireEvent.focus(screen.getByRole('img', { name: /Lĩnh vực 1 Khai thác dữ liệu và thông tin: hiện tại 1,4, cần đạt 2,0/ }));
  const tooltip = screen.getByRole('status');
  expect(tooltip).toHaveTextContent('Khai thác dữ liệu và thông tin');
  expect(tooltip).toHaveTextContent('Còn thiếu 0,6 mức');

  fireEvent.focus(screen.getByRole('img', { name: /Lĩnh vực 2/ }));
  expect(screen.getByRole('status')).toHaveTextContent('Đạt chuẩn trung bình');
});

it('names the dashed line after the expected level when the owner set one, and paints both lines with gradients', () => {
  const { container } = render(<DomainLineChart points={points} targetLabel="Mức mong muốn" />);
  expect(screen.getByRole('figure')).toHaveTextContent('Mức mong muốn');
  expect(container.querySelector('.trial-line__current')?.getAttribute('stroke')).toMatch(/^url\(#trial-line-current-/);
  expect(container.querySelector('.trial-line__target')?.getAttribute('stroke')).toMatch(/^url\(#trial-line-target-/);
  expect(container.querySelector('.trial-line__area')).not.toBeNull();

  fireEvent.focus(screen.getByRole('img', { name: /Lĩnh vực 2 Giao tiếp và hợp tác: hiện tại 2,5, mong muốn 2,0/ }));
  expect(screen.getByRole('status')).toHaveTextContent('Đạt mức mong muốn');
});
