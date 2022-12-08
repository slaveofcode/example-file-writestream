import { Column } from 'exceljs';
import inquirer from 'inquirer';
import ora, { Color, Ora } from 'ora';
import { CSVStream } from './csv';
import { ColumnFormat } from './defs';
import { PlainTextStream } from './plaintext';
import { XLSXStream } from './xlsx';

const CASE_XSLX = 'XLSX Streaming Process';
const CASE_CSV = 'CSV Streaming Process';
const CASE_TXT = 'Text Streaming Process';

const makeSpinner = (text: string, color: Color): Ora => {
    return ora({
        color,
        text,
    }).start();
}

const makeLongHeader = (prefix: string, numOfColumn: number): ColumnFormat[] => {
    const cols: ColumnFormat[] = [];
    for (let i = 1; i <= numOfColumn; i++) {
        cols.push({
            header: `${prefix} ${i}`,
            key: `${prefix}_${i}`.toLowerCase(),
        });
    }
    return cols;
}

interface FileGenerator {
    write(rows: Record<string, any> | string): void;
    pack(): void;
}

const main = async () => {
    const cases = [
        CASE_XSLX,
        CASE_CSV,
        CASE_TXT,
    ];

    const promptResult = await inquirer.prompt([
        {
            type: 'list',
            name: 'caseType',
            message: 'Please select example case:',
            choices: cases,
        },
        {
            type: 'number',
            name: 'totalGenCols',
            message: 'How many columns?:',
            source: (_: any, input: any) => {
                return input;
            },
        },
        {
            type: 'number',
            name: 'totalGenRows',
            message: 'How many data?:',
            source: (_: any, input: any) => {
                return input;
            },
        }
    ]);

    const { caseType, totalGenCols, totalGenRows } = promptResult;

    const spinner = makeSpinner('Writing rows', 'green');
    const headers = makeLongHeader('Column', totalGenCols);

    let fileGenerator: FileGenerator | undefined;

    if (caseType === CASE_XSLX) {
        fileGenerator = new XLSXStream(
            './files/file-example.xlsx',
            headers.map(item => (item as Column)),
        );
    } 
    
    if (caseType === CASE_CSV) {
        fileGenerator = new CSVStream(
            './files/file-example.csv',
            headers,
        );
    }

    if (caseType === CASE_TXT) {
        fileGenerator = new PlainTextStream(
            './files/file-example.txt',
        );
    }

    if (fileGenerator === undefined) {
        throw new TypeError('Undefined example case');
    }

    for (let i = 1; i <= totalGenRows; i++) {
        spinner.text = 'Writing rows ' + i;
        const row: Record<string, any> = {};

        for (let j = 1; j <= headers.length; j++) {
            row[headers[j-1].key] = 'Example Data Col' + j;
        }

        fileGenerator.write(caseType === CASE_TXT ? JSON.stringify(row) : row);
        await new Promise((res) => setTimeout(() => res(true), 1));
    }

    fileGenerator.pack();

    spinner.text = 'Done.'
    spinner.clear();

    await new Promise((res) => setTimeout(() => res(true), 1000));
    process.exit(0);
};

main();
