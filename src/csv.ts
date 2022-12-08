import fs from 'fs';
import * as csv from 'fast-csv';
import { ColumnFormat } from './defs';

export class CSVStream {
    private csv: csv.CsvFormatterStream<csv.FormatterRow, csv.FormatterRow>;
    private indexOfKeyColumn: {[key: number]: string} = {};

    constructor(
        private readonly fileName: string,
        private readonly columns: ColumnFormat[],
        private readonly delimiter: string = ',',
        private readonly rowDelimiter: string = '\n',
        private readonly quote: string = `'`,
        private readonly escape: string = `"`,
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

        let ws = fs.createWriteStream(fileName);
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

    pack() {
        this.csv.end();
    }
}