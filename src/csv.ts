import fs from 'fs';
import * as csv from 'fast-csv';
import { ColumnFormat } from './defs';

export class CSVStream {
  private csv: csv.CsvFormatterStream<csv.FormatterRow, csv.FormatterRow>;
  private indexOfKeyColumn: { [key: number]: string } = {};

  constructor(
    filePath: string,
    columns: ColumnFormat[],
    delimiter: string = ',',
    rowDelimiter: string = '\n',
    quote: string = `'`,
    escape: string = `"`,
  ) {
    for (let i = 0; i < columns.length; i++) {
      this.indexOfKeyColumn[i] = columns[i].key;
    }

    this.csv = csv.format({
      headers: columns.map(item => item.header),
      delimiter,
      rowDelimiter,
      quote,
      escape,
    })

    let ws = fs.createWriteStream(filePath);
    this.csv.pipe(ws);
  }

  write(row: Record<string, any>) {
    const rowValue: any[] = [];
    for (let i = 0; i < Object.entries(row).length; i++) {
      const key = this.indexOfKeyColumn[i]
      rowValue.push(row[key]);
    }

    this.csv.write(rowValue);
  }

  async pack() {
    await new Promise((res) => {
      this.csv.end(() => {
        res(true);
      });
    })
  }
}