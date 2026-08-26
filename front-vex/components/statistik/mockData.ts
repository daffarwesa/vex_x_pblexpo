export interface StatData {
  label: string;
  pengunjung: number;
}

export function generateDummyByRange(startDate: string, endDate: string): StatData[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.max(0, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  // 1 hari / sama -> per jam
  if (diffDays <= 1) {
    const hours = [
      '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
      '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
      '20:00', '21:00', '22:00'
    ];
    return hours.map((h) => ({
      label: h,
      pengunjung: Math.floor(Math.random() * 45) + 5,
    }));
  }

  // 2 - 31 hari -> per hari
  if (diffDays <= 31) {
    const result: StatData[] = [];
    const current = new Date(start);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    while (current <= end) {
      const day = String(current.getDate()).padStart(2, '0');
      const month = months[current.getMonth()];
      result.push({
        label: `${day} ${month}`,
        pengunjung: Math.floor(Math.random() * 120) + 15,
      });
      current.setDate(current.getDate() + 1);
    }
    return result;
  }

  // 32 - 90 hari -> per minggu
  if (diffDays <= 90) {
    const result: StatData[] = [];
    const current = new Date(start);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    let weekNum = 1;
    while (current <= end) {
      const wStart = new Date(current);
      const wEnd = new Date(current);
      wEnd.setDate(wEnd.getDate() + 6);
      const finalEnd = wEnd > end ? end : wEnd;

      const sLabel = `${wStart.getDate()} ${months[wStart.getMonth()]}`;
      const eLabel = `${finalEnd.getDate()} ${months[finalEnd.getMonth()]}`;

      result.push({
        label: `${sLabel} - ${eLabel}`,
        pengunjung: Math.floor(Math.random() * 600) + 100,
      });

      current.setDate(current.getDate() + 7);
      weekNum++;
    }
    return result;
  }

  // > 90 hari -> per bulan
  const result: StatData[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  while (current <= endMonth) {
    const mLabel = `${months[current.getMonth()]} ${current.getFullYear()}`;
    result.push({
      label: mLabel,
      pengunjung: Math.floor(Math.random() * 2500) + 400,
    });
    current.setMonth(current.getMonth() + 1);
  }

  return result;
}

