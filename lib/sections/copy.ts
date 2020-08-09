import { BaseSection } from './base';

export class CopySection extends BaseSection {
  private buf = null;

  constructor(data: Buffer) {
    super();
    this.buf = data;
  }

  export(): Buffer[] {
    return [this.buf];
  }
}
