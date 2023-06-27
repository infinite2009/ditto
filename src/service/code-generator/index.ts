import IPageSchema from '@/types/page.schema';

export default class GenerateCode {
  constructor(dsl: IPageSchema) {
    this.dsl = dsl;
  }

  dsl: IPageSchema;

  generateImportSentence() {
    
  }
}