import { Column, stream, Worksheet } from 'exceljs';

export class XLSXStream {
    private workbook: stream.xlsx.WorkbookWriter;
    private worksheet: Worksheet;

    constructor(
        private readonly fileName: string,
        private readonly columns: Partial<Column>[],
    ) {
        this.workbook = new stream.xlsx.WorkbookWriter({
            filename: fileName,
        });
        this.worksheet = this.workbook.addWorksheet('Example Datasets');
        this.worksheet.columns = columns;
    }

    write(row: Record<string, any>) {
        this.worksheet.addRow(row).commit();
    }

    pack() {
        this.worksheet.commit();
        this.workbook.commit();
    }
}