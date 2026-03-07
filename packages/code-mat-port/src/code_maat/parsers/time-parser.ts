export function timeStringConverterFrom(inputFormat: string): (dateStr: string) => string {
  return (dateStr: string) => {
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    throw new Error(`Cannot parse date: ${dateStr} with format ${inputFormat}`);
  };
}

export function timeParserFrom(format: string): (dateStr: string) => string {
  return timeStringConverterFrom(format);
}
