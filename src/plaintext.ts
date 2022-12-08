import fs from 'fs';

export class PlainTextStream {
    private file: fs.WriteStream;

    constructor(
        private readonly howMany: number,
        private readonly fileName: string,
    ) {
        this.file = fs.createWriteStream(fileName);
    }

    write(text: string) {
        this.file.write(text + '\n');
    }

    pack() {
        this.file.end();
    }
}