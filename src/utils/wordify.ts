type DateFormat = 'HH:mm' | 'YYYY-MM-DD' | 'YYYY-MM-DD HH:mm';
type ShamsiDateFormat = 'HH:mm' | 'jYYYY-jMM-jDD' | 'jYYYY-jMM-jDD HH:mm';

export function toEnglishDigits(num: string | number): string {
  if (num === null || num === undefined) {
    return '';
  }

  if (typeof num !== 'string' || num.length === 0) return num.toString();

  const faDigits = '۰۱۲۳۴۵۶۷۸۹';
  const arDigits = '٠١٢٣٤٥٦٧٨٩';
  let output = '';
  for (let ipos = 0; ipos < num.length; ipos++) {
    let faIndex = faDigits.indexOf(num[ipos]);
    if (faIndex >= 0) {
      output += faIndex.toString();
      continue;
    }
    let arIndex = arDigits.indexOf(num[ipos]);
    if (arIndex >= 0) {
      output += arIndex.toString();
      continue;
    }
    output += num[ipos];
  }
  return output.replace(/,/g, '');
}

export function WordifyFa(
  input: string | number | undefined,
  level: number = 0
): string {
  if (input === null || input === undefined) {
    return '';
  }

  let num: number = parseInt(toEnglishDigits(input));

  // convert negative number to positive and get wordify value
  if (num < 0) {
    num = num * -1;
    return 'منفی ' + WordifyFa(num, level);
  }
  if (num === 0) {
    if (level === 0) {
      return 'صفر';
    } else {
      return '';
    }
  }
  let result = '';
  const yekan = ['یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'],
    dahgan = ['بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'],
    sadgan = [
      'یکصد',
      'دویست',
      'سیصد',
      'چهارصد',
      'پانصد',
      'ششصد',
      'هفتصد',
      'هشتصد',
      'نهصد',
    ],
    dah = [
      'ده',
      'یازده',
      'دوازده',
      'سیزده',
      'چهارده',
      'پانزده',
      'شانزده',
      'هفده',
      'هیجده',
      'نوزده',
    ];

  if (level > 0) {
    result += ' و ';
    level -= 1;
  }

  if (num < 10) {
    result += yekan[num - 1];
  } else if (num < 20) {
    result += dah[num - 10];
  } else if (num < 100) {
    result += dahgan[Math.floor(num / 10) - 2] + WordifyFa(num % 10, level + 1);
  } else if (num < 1000) {
    result +=
      sadgan[Math.floor(num / 100) - 1] + WordifyFa(num % 100, level + 1);
  } else if (num < 1000000) {
    result +=
      WordifyFa(Math.floor(num / 1000), level) +
      ' هزار' +
      WordifyFa(num % 1000, level + 1);
  } else if (num < 1000000000) {
    result +=
      WordifyFa(Math.floor(num / 1000000), level) +
      ' میلیون' +
      WordifyFa(num % 1000000, level + 1);
  } else if (num < 1000000000000) {
    result +=
      WordifyFa(Math.floor(num / 1000000000), level) +
      ' میلیارد' +
      WordifyFa(num % 1000000000, level + 1);
  } else if (num < 1000000000000000) {
    result +=
      WordifyFa(Math.floor(num / 1000000000000), level) +
      ' تریلیارد' +
      WordifyFa(num % 1000000000000, level + 1);
  }

  return result;
}
