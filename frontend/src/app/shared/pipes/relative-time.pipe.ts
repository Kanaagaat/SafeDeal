import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeTime',
  standalone: true
})
export class RelativeTimePipe implements PipeTransform {
  transform(iso: string | undefined | null): string {
    if (!iso) return '—';
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) return '—';
    let sec = Math.floor((Date.now() - t) / 1000);
    if (sec < 0) sec = 0;
    if (sec < 60) return 'just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return min === 1 ? '1 minute ago' : `${min} minutes ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return hr === 1 ? '1 hour ago' : `${hr} hours ago`;
    const day = Math.floor(hr / 24);
    if (day < 30) return day === 1 ? '1 day ago' : `${day} days ago`;
    const mo = Math.floor(day / 30);
    if (mo < 12) return mo === 1 ? '1 month ago' : `${mo} months ago`;
    const yr = Math.floor(day / 365);
    return yr === 1 ? '1 year ago' : `${yr} years ago`;
  }
}
