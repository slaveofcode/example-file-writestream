import { Column, stream, Worksheet } from 'exceljs';

export class XLSXStream {
  private workbook: stream.xlsx.WorkbookWriter;
  private worksheet: Worksheet | undefined; // default worisheet

  constructor(
    filePath: string,
    columns?: Partial<Column>[],
    workSheetName?: string,
  ) {
    this.workbook = new stream.xlsx.WorkbookWriter({
      filename: filePath,
    });

    if (workSheetName && columns) {
      this.worksheet = this.addWorksheet(workSheetName, columns);
    }
  }

  addWorksheet(workSheetName: string, columns: Partial<Column>[]): Worksheet {
    this.workbook.addWorksheet(workSheetName);
    const ws = this.workbook.getWorksheet(workSheetName)
    
    ws.columns = columns;
    
    return ws
  }

  write(row: Record<string, any>, workSheetName?: string) {
    if (workSheetName) {
      return this.workbook
        .getWorksheet(workSheetName)
        .addRow(row)
        .commit();
    }

    if (this.worksheet) {
      return this.worksheet
        .addRow(row)
        .commit();
    }
  }

  async pack() {
    if (this.worksheet) {
      this.worksheet.commit();
    }

    await this.workbook.commit();
  }
}