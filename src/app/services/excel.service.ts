import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { Observable } from 'rxjs';
import { ServicesConfig } from '../config/services.config';
import { HttpClient } from '@angular/common/http';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor( private http: HttpClient, private servicesConfig: ServicesConfig ) { }
  
  public exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }
  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
    FileSaver.saveAs(data, fileName + '.xlsx');
  }
  public getProjectsExcel():Observable<any> {
    return this.http.get<any>(this.servicesConfig.APP_ENDPOINT_LOCAL2 + '/excel/all');
  }
}
