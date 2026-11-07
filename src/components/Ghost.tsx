export function Ghost({ near, last }: { near: boolean; last: boolean }) {
  const cls = ['ghost', near && 'is-near', last && 'is-last'].filter(Boolean).join(' ');
  return (
    <svg className={cls} viewBox="0 0 24 34" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12v22l3.2-3 2.9 3 2.9-3 3 3 3-3 2.9 3 2.9-3 3.2 3V12C24 5.4 18.6 0 12 0Z" />
      <ellipse cx="8.4" cy="13" rx="1.7" ry="2.3" fill="#0b0a10" />
      <ellipse cx="15.6" cy="13" rx="1.7" ry="2.3" fill="#0b0a10" />
    </svg>
  );
}
