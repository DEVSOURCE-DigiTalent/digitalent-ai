import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useEffect, useId, useRef, useState, type ComponentPropsWithoutRef, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDownUp, Check, ChevronDown, Filter, Rows3, Search } from 'lucide-react';
import './owner-filter-controls.css';

export interface OwnerFilterOption {
  value: string;
  label: string;
  /** Small pill after the label in the list, e.g. a status. */
  badge?: { text: string; tone: 'warn' | 'ok' };
}

interface OwnerFilterSelectProps {
  label: string;
  value: string;
  options: OwnerFilterOption[];
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  onSearchChange?: (query: string) => void;
  loading?: boolean;
  variant?: 'owner' | 'manager' | 'mentor';
  icon?: 'filter' | 'sort' | 'rows';
  /** Text on the button instead of the selected option's label (e.g. just a name, the list showing more). */
  valueLabel?: string;
  /** The list is at least this wide (px), for a short button whose options say more. */
  menuMinWidth?: number;
}

export function OwnerFilterSelect({ label, value, options, onChange, className = '', disabled = false, onSearchChange, loading = false, variant = 'owner', icon, valueLabel, menuMinWidth = 0 }: OwnerFilterSelectProps) {
  useUiLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 220, maxHeight: 320 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuId = useId();
  const visibleOptions = options.filter((option) => `${option.label} ${translateUi(option.label)}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const selected = options.find((option) => option.value === value);
  const LeadingIcon = icon === 'sort' ? ArrowDownUp : icon === 'rows' ? Rows3 : Filter;
  const searchable = Boolean(onSearchChange) || options.length > 8;

  useEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const availableBelow = window.innerHeight - rect.bottom - 12;
      const availableAbove = rect.top - 12;
      const idealHeight = Math.min(320, options.length * 39 + (searchable ? 52 : 12));
      const above = availableBelow < Math.min(230, idealHeight) && availableAbove > availableBelow;
      const height = Math.max(60, Math.min(idealHeight, above ? availableAbove : availableBelow));
      const width = Math.min(Math.max(rect.width, menuMinWidth), window.innerWidth - 16);
      setPosition({ top: Math.max(8, above ? rect.top - height - 6 : rect.bottom + 6), left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)), width, maxHeight: height });
    };
    const closeOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!buttonRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    const closeOnFocusOut = (event: FocusEvent) => {
      const target = event.target as Node;
      if (!buttonRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    updatePosition();
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('focusin', closeOnFocusOut);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('focusin', closeOnFocusOut);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, options.length, searchable, menuMinWidth]);

  useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
  }, [open, searchable]);

  useEffect(() => {
    if (open) document.getElementById(`${menuId}-option-${activeIndex}`)?.scrollIntoView?.({ block: 'nearest' });
  }, [activeIndex, menuId, open]);

  const choose = (option: OwnerFilterOption) => {
    onChange(option.value);
    setOpen(false);
    setQuery('');
    onSearchChange?.('');
    buttonRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (open) { event.preventDefault(); setOpen(false); buttonRef.current?.focus(); }
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) { setOpen(true); setActiveIndex(Math.max(0, options.findIndex((option) => option.value === value))); }
      else setActiveIndex((index) => Math.max(0, Math.min(visibleOptions.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1))));
    }
    if (open && (event.key === 'Home' || event.key === 'End') && event.target === buttonRef.current) {
      event.preventDefault();
      setActiveIndex(event.key === 'Home' ? 0 : Math.max(0, visibleOptions.length - 1));
    }
    if (open && (event.key === 'Enter' || (event.key === ' ' && event.target === buttonRef.current)) && visibleOptions[activeIndex]) {
      event.preventDefault();
      choose(visibleOptions[activeIndex]);
    }
  };

  return <>
    <button ref={buttonRef} type="button" role="combobox" data-variant={variant} aria-activedescendant={open && visibleOptions[activeIndex] ? `${menuId}-option-${activeIndex}` : undefined} className={`owner-filter-select ${open ? 'is-open' : ''} ${className}`} aria-label={translateUi(label)} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? menuId : undefined} disabled={disabled} onKeyDown={handleKeyDown} onClick={() => { setQuery(''); onSearchChange?.(''); setActiveIndex(Math.max(0, options.findIndex((option) => option.value === value))); setOpen((current) => !current); }}>
      {icon && <LeadingIcon size={15} className="owner-filter-select__icon" aria-hidden="true" />}
      <span>{translateUi(valueLabel ?? selected?.label) ?? translateUi(options[0]?.label) ?? translateUi(label)}</span><ChevronDown size={17} className="owner-filter-select__chevron" aria-hidden="true" />
    </button>
    {open && createPortal(<div ref={menuRef} className="owner-filter-select__menu" data-variant={variant} style={{ top: position.top, left: position.left, width: position.width, maxHeight: position.maxHeight }} onKeyDown={handleKeyDown}>
      {searchable && <label className="owner-filter-select__search"><Search size={15} aria-hidden="true" /><input ref={searchRef} value={query} onChange={(event) => { setQuery(event.target.value); onSearchChange?.(event.target.value); setActiveIndex(0); }} placeholder={translateUi("Tìm trong danh sách")} aria-label={translateUi(`Tìm ${label.toLocaleLowerCase('vi')}`)} /></label>}
      <div id={menuId} role="listbox" aria-label={translateUi(label)} className="owner-filter-select__options">
        {visibleOptions.map((option, index) => <button key={option.value} id={`${menuId}-option-${index}`} type="button" role="option" aria-selected={option.value === value} className={`${option.value === value ? 'is-selected' : ''} ${index === activeIndex ? 'is-active' : ''}`} onMouseEnter={() => setActiveIndex(index)} onFocus={() => setActiveIndex(index)} onClick={() => choose(option)}><span>{translateUi(option.label)}</span>{option.badge && <em className="owner-filter-select__badge" data-tone={option.badge.tone}>{translateUi(option.badge.text)}</em>}{option.value === value && <Check size={16} aria-hidden="true" />}</button>)}
        {visibleOptions.length === 0 && <p className="owner-filter-select__none">{loading ? 'Đang tìm phòng ban…' : translateUi('Không có kết quả phù hợp')}</p>}
      </div>
    </div>, document.body)}
  </>;
}

export function NativeFilterSelect(props: ComponentPropsWithoutRef<'select'>) {
  return (
    <span className="native-filter-select">
      <Filter size={15} aria-hidden="true" />
      <select {...props} />
    </span>
  );
}
