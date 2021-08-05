export default class Recorder {
  private static instance: Recorder;
  private endTreatment: EndInfo[];
  private constructor() {
    this.endTreatment = [];
  }
  public static getInstance() {
    if (!this.instance) {
      this.instance = new Recorder();
    }
    return this.instance;
  }

  public addEndTreatment(treatmentID: number, itemsTreatmentCode: string[]) {
    //treatmentID is Treatment.id
    const endIndex = this.endTreatment.findIndex(
      (info) => info.code === treatmentID
    );
    if (endIndex === -1) {
      this.endTreatment.push({
        code: treatmentID,
        sites: itemsTreatmentCode,
      });
    } else {
      this.endTreatment[endIndex].sites.push(...itemsTreatmentCode);
    }
  }

  public getEndTreatment() {
    const result = this.endTreatment;
    console.log(result);
    this.endTreatment = [];
    return result;
  }
}

interface EndInfo {
  code: number;
  sites: string[]; //treatmentCodes
}
